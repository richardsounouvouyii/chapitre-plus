from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    assert client.get("/health").json()["status"] == "ok"


def test_ready_shape() -> None:
    body = client.get("/ready").json()
    assert body["service"] == "catalog-service"
    assert body["status"] in {"ready", "not_ready"}
