from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt


def _token(
    *,
    roles: list[str],
    secret: str = "test-jwt-secret-catalog-chapitre-hs256-32b",
) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(uuid4()),
        "roles": roles,
        "iss": "chapitre-identity",
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=15)).timestamp()),
        "typ": "access",
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def test_admin_create_requires_auth(client) -> None:
    response = client.post("/admin/subjects", json={"name": "Philosophie"})
    assert response.status_code == 401


def test_admin_create_requires_admin_role(client) -> None:
    token = _token(roles=["STUDENT"])
    response = client.post(
        "/admin/subjects",
        json={"name": "Philosophie"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


def test_admin_crud_subject_chapter_notion_and_audit(client) -> None:
    token = _token(roles=["ADMIN"])
    headers = {
        "Authorization": f"Bearer {token}",
        "X-Correlation-ID": "corr-catalog-admin-1",
    }

    created = client.post(
        "/admin/subjects",
        json={"name": "Philosophie", "level_codes": ["3e"]},
        headers=headers,
    )
    assert created.status_code == 201, created.text
    subject = created.json()
    assert subject["name"] == "Philosophie"
    assert subject["slug"] == "philosophie"

    subjects_3e = client.get("/subjects", params={"level": "3e"})
    names = {item["name"] for item in subjects_3e.json()["items"]}
    assert "Philosophie" in names

    chapter = client.post(
        "/admin/chapters",
        json={
            "subject_id": subject["id"],
            "level_code": "3e",
            "title": "Dissertation",
            "sort_order": 1,
        },
        headers=headers,
    )
    assert chapter.status_code == 201, chapter.text
    chapter_id = chapter.json()["id"]

    notion = client.post(
        "/admin/notions",
        json={"chapter_id": chapter_id, "title": "Problématique", "sort_order": 1},
        headers=headers,
    )
    assert notion.status_code == 201, notion.text

    patched = client.patch(
        f"/admin/subjects/{subject['id']}",
        json={"is_active": False},
        headers=headers,
    )
    assert patched.status_code == 200
    assert patched.json()["is_active"] is False

    audit = client.get("/admin/audit", headers=headers)
    assert audit.status_code == 200
    actions = {item["action"] for item in audit.json()["items"]}
    assert "subject.created" in actions
    assert "chapter.created" in actions
    assert "notion.created" in actions
    assert "subject.updated" in actions
    assert any(item.get("correlation_id") == "corr-catalog-admin-1" for item in audit.json()["items"])


def test_admin_invalid_token(client) -> None:
    response = client.get(
        "/admin/audit",
        headers={"Authorization": "Bearer not-a-jwt"},
    )
    assert response.status_code == 401
