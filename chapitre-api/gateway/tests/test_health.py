from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    assert client.get("/health").json()["status"] == "ok"


def test_api_v1_health() -> None:
    body = client.get("/api/v1/health").json()
    assert body["status"] == "ok"
    assert body["api"] == "v1"
