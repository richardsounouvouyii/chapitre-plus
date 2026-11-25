from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"] == "identity-service"


def test_ready_shape() -> None:
    """/ready renvoie ready ou not_ready selon la DB — pas de crash."""
    response = client.get("/ready")
    assert response.status_code == 200
    body = response.json()
    assert body["service"] == "identity-service"
    assert body["status"] in {"ready", "not_ready"}
