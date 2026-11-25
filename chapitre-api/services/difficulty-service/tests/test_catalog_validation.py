from datetime import UTC, datetime, timedelta
from uuid import uuid4

import httpx
import jwt
import pytest

from app.infrastructure.catalog_client import assert_catalog_refs

SECRET = "test-jwt-secret-difficulty-chapitre-hs256-32b"


def _token(*, roles: list[str], user_id=None) -> str:
    now = datetime.now(UTC)
    return jwt.encode(
        {
            "sub": str(user_id or uuid4()),
            "roles": roles,
            "iss": "chapitre-identity",
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=15)).timestamp()),
            "typ": "access",
        },
        SECRET,
        algorithm="HS256",
    )


def _catalog_transport(*, level_ok: bool, subject_id, chapter_id=None):
    def handler(request: httpx.Request) -> httpx.Response:
        path = request.url.path
        if path.endswith("/levels"):
            levels = [{"code": "3e", "label": "Troisième", "sort_order": 1, "is_active": True}]
            if not level_ok:
                levels = []
            return httpx.Response(200, json={"levels": levels, "label": "ok"})
        if path.endswith("/subjects"):
            return httpx.Response(
                200,
                json={
                    "items": [
                        {
                            "id": str(subject_id),
                            "name": "Mathématiques",
                            "slug": "mathematiques",
                            "is_active": True,
                        }
                    ]
                },
            )
        if "/chapters" in path:
            items = []
            if chapter_id is not None:
                items = [
                    {
                        "id": str(chapter_id),
                        "subject_id": str(subject_id),
                        "level_code": "3e",
                        "title": "Équations",
                        "sort_order": 1,
                        "is_active": True,
                    }
                ]
            return httpx.Response(200, json={"items": items})
        return httpx.Response(404, json={"detail": "not found"})

    return httpx.MockTransport(handler)


def test_assert_catalog_refs_rejects_unknown_level():
    subject_id = uuid4()
    client = httpx.Client(
        transport=_catalog_transport(level_ok=False, subject_id=subject_id)
    )
    with pytest.raises(Exception) as exc:
        assert_catalog_refs(
            level_code="Terminale A",
            subject_id=subject_id,
            client=client,
        )
    assert exc.value.status_code == 422


def test_assert_catalog_refs_rejects_unknown_subject():
    known = uuid4()
    client = httpx.Client(transport=_catalog_transport(level_ok=True, subject_id=known))
    with pytest.raises(Exception) as exc:
        assert_catalog_refs(
            level_code="3e",
            subject_id=uuid4(),
            client=client,
        )
    assert exc.value.status_code == 422


def test_create_rejected_when_catalog_invalid(client, monkeypatch):
    from fastapi import HTTPException

    def _fail(**kwargs):  # noqa: ANN001
        raise HTTPException(status_code=422, detail="Niveau inconnu dans le catalogue")

    monkeypatch.setattr("app.application.commands.assert_catalog_refs", _fail)
    response = client.post(
        "/difficulties",
        json={
            "level_code": "Terminale A",
            "subject_id": str(uuid4()),
            "description": "Demande avec niveau hors périmètre MVP.",
        },
        headers={"Authorization": f"Bearer {_token(roles=['STUDENT'])}"},
    )
    assert response.status_code == 422
