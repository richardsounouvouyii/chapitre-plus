from sqlalchemy import select

from app.domain.enums import Role, UserStatus
from app.infrastructure.models import InvitationDeliverySecret, OutboxEvent, User, UserRole
from app.infrastructure.security import hash_password
from app.infrastructure.token_crypto import decrypt_invitation_token


def _seed_admin(session) -> None:
    admin = User(
        email="admin@chapitre.bj",
        password_hash=hash_password("AdminPass1"),
        status=UserStatus.ACTIVE.value,
        first_name="Ada",
        last_name="Admin",
    )
    session.add(admin)
    session.flush()
    session.add(UserRole(user_id=admin.id, role=Role.ADMIN.value))
    session.commit()


def test_register_and_login_student(client) -> None:
    register = client.post(
        "/auth/register",
        json={
            "email": "eleve@exemple.bj",
            "password": "ElevePass1",
            "first_name": "Amina",
            "last_name": "Houngbo",
            "level": "3e",
            "city": "Cotonou",
            "declared_guardian": True,
        },
    )
    assert register.status_code == 201
    body = register.json()
    assert body["token_type"] == "bearer"
    assert body["expires_in"] == 15 * 60
    assert "STUDENT" in body["roles"]

    me = client.get("/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me.status_code == 200
    assert me.json()["student_profile"]["level"] == "3e"


def test_register_rejects_unsupported_level(client) -> None:
    response = client.post(
        "/auth/register",
        json={
            "email": "x@exemple.bj",
            "password": "ElevePass1",
            "first_name": "X",
            "last_name": "Y",
            "level": "Terminale A",
            "city": "Cotonou",
        },
    )
    assert response.status_code == 422


def test_invite_writes_outbox_without_token_in_api(client, sqlite_session) -> None:
    _seed_admin(sqlite_session)

    login_admin = client.post(
        "/auth/login",
        json={"email": "admin@chapitre.bj", "password": "AdminPass1"},
    )
    admin_token = login_admin.json()["access_token"]

    invite = client.post(
        "/auth/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "email": "formateur@exemple.bj",
            "role": "TRAINER",
            "first_name": "Koffi",
            "last_name": "Adjovi",
        },
    )
    assert invite.status_code == 201
    body = invite.json()
    assert body["email_delivery"] == "queued"
    assert "invitation_token" not in body

    outbox = sqlite_session.scalars(select(OutboxEvent)).all()
    assert len(outbox) == 1
    assert outbox[0].event_type == "identity.user.invited.v1"
    assert "invitation_token" not in (outbox[0].payload or {})
    assert outbox[0].payload["email"] == "formateur@exemple.bj"

    from uuid import UUID

    secret = sqlite_session.get(InvitationDeliverySecret, UUID(body["invitation_id"]))
    assert secret is not None
    assert secret.token_ciphertext != decrypt_invitation_token(secret.token_ciphertext)
    token = decrypt_invitation_token(secret.token_ciphertext)
    assert "invitation_token" not in outbox[0].payload


    blocked = client.post(
        "/auth/login",
        json={"email": "formateur@exemple.bj", "password": "TrainerPass1"},
    )
    assert blocked.status_code == 403

    set_pwd = client.post(
        "/auth/set-password",
        json={"token": token, "password": "TrainerPass1"},
    )
    assert set_pwd.status_code == 200
    assert "TRAINER" in set_pwd.json()["roles"]


def test_claim_token_internal(client, sqlite_session) -> None:
    _seed_admin(sqlite_session)
    login_admin = client.post(
        "/auth/login",
        json={"email": "admin@chapitre.bj", "password": "AdminPass1"},
    )
    admin_token = login_admin.json()["access_token"]
    invite = client.post(
        "/auth/invitations",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"email": "parent@exemple.bj", "role": "PARENT"},
    )
    invitation_id = invite.json()["invitation_id"]

    claim = client.post(
        f"/internal/invitations/{invitation_id}/claim-token",
        headers={"X-Service-Key": "dev-only-identity-internal-key"},
    )
    assert claim.status_code == 200
    assert claim.json()["role"] == "PARENT"
    assert len(claim.json()["invitation_token"]) >= 20

    again = client.post(
        f"/internal/invitations/{invitation_id}/claim-token",
        headers={"X-Service-Key": "dev-only-identity-internal-key"},
    )
    assert again.status_code == 409


def test_invite_requires_admin(client) -> None:
    student = client.post(
        "/auth/register",
        json={
            "email": "eleve2@exemple.bj",
            "password": "ElevePass1",
            "first_name": "B",
            "last_name": "C",
            "level": "Terminale C",
            "city": "Calavi",
        },
    )
    token = student.json()["access_token"]
    response = client.post(
        "/auth/invitations",
        headers={"Authorization": f"Bearer {token}"},
        json={"email": "x@exemple.bj", "role": "PARENT"},
    )
    assert response.status_code == 403
