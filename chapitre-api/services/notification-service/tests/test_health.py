from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_ready_shape() -> None:
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json()["service"] == "notification-service"
    assert response.json()["status"] in {"ready", "not_ready"}
