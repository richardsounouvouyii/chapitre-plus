from fastapi.testclient import TestClient

from app.infrastructure.email_adapter import reset_delivered_for_tests
from app.main import app

client = TestClient(app)


def setup_function() -> None:
    reset_delivered_for_tests()


def test_notify_invitation_and_retrieve_for_tests() -> None:
    response = client.post(
        "/internal/invitations",
        json={
            "invitation_id": "11111111-1111-1111-1111-111111111111",
            "email": "formateur@exemple.bj",
            "role": "TRAINER",
            "invitation_token": "a" * 32,
            "expires_at": "2026-12-01T00:00:00Z",
        },
    )
    assert response.status_code == 202
    assert response.json()["status"] == "sent"

    last = client.get(
        "/internal/invitations/_test/last",
        params={"email": "formateur@exemple.bj"},
    )
    assert last.status_code == 200
    body = last.json()
    assert body["found"] is True
    assert body["invitation_token"] == "a" * 32
