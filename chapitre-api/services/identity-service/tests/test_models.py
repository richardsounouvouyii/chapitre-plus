import uuid

from app.domain.enums import ParentLinkStatus, Role, UserStatus
from app.infrastructure.models import ParentLink, StudentProfile, User, UserRole


def test_user_with_student_role_and_profile(sqlite_session) -> None:
    user = User(
        email="eleve@exemple.bj",
        status=UserStatus.ACTIVE.value,
        first_name="Amina",
        last_name="Houngbo",
        password_hash="not-a-real-hash",
    )
    sqlite_session.add(user)
    sqlite_session.flush()

    sqlite_session.add(UserRole(user_id=user.id, role=Role.STUDENT.value))
    sqlite_session.add(
        StudentProfile(
            user_id=user.id,
            level="3e",
            city="Cotonou",
            declared_guardian=True,
        )
    )
    sqlite_session.commit()

    loaded = sqlite_session.get(User, user.id)
    assert loaded is not None
    assert loaded.email == "eleve@exemple.bj"
    assert [r.role for r in loaded.roles] == [Role.STUDENT.value]
    assert loaded.student_profile is not None
    assert loaded.student_profile.level == "3e"


def test_parent_link_unique_pair(sqlite_session) -> None:
    parent = User(email="parent@exemple.bj", status=UserStatus.ACTIVE.value)
    child = User(email="enfant@exemple.bj", status=UserStatus.ACTIVE.value)
    sqlite_session.add_all([parent, child])
    sqlite_session.flush()

    sqlite_session.add(
        ParentLink(
            parent_user_id=parent.id,
            child_user_id=child.id,
            status=ParentLinkStatus.PENDING.value,
        )
    )
    sqlite_session.commit()

    link = sqlite_session.query(ParentLink).one()
    assert link.parent_user_id == parent.id
    assert link.child_user_id == child.id
    assert isinstance(link.id, uuid.UUID)


def test_roles_endpoint() -> None:
    from fastapi.testclient import TestClient

    from app.main import app

    client = TestClient(app)
    response = client.get("/roles")
    assert response.status_code == 200
    body = response.json()
    assert "STUDENT" in body["items"]
    assert "ADMIN" in body["items"]
    assert "CENTER_MANAGER" not in body["items"]
