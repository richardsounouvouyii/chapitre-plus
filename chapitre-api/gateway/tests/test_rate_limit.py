from fastapi.testclient import TestClient

from app.main import app
from app.rate_limit import configure_login_limiter, get_login_limiter


def test_login_rate_limit_returns_429(monkeypatch) -> None:
    async def _fake_request(method, url, content=None, headers=None):  # noqa: ANN001
        class _Resp:
            status_code = 401
            content = b'{"detail":"Identifiants invalides"}'
            headers = {"content-type": "application/json"}

        return _Resp()

    class _FakeAsyncClient:
        def __init__(self, *args, **kwargs) -> None:  # noqa: ANN002, ANN003
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):  # noqa: ANN002
            return None

        async def request(self, method, url, content=None, headers=None):  # noqa: ANN001
            return await _fake_request(method, url, content, headers)

    monkeypatch.setattr("app.main.httpx.AsyncClient", _FakeAsyncClient)

    with TestClient(app) as client:
        # Après startup : reconfigurer le limiteur actif.
        configure_login_limiter(limit=3, window_seconds=60)
        get_login_limiter().reset()

        for _ in range(3):
            response = client.post(
                "/api/v1/auth/login",
                json={"email": "a@b.bj", "password": "x" * 8},
            )
            assert response.status_code == 401

        blocked = client.post(
            "/api/v1/auth/login",
            json={"email": "a@b.bj", "password": "x" * 8},
        )
        assert blocked.status_code == 429
        assert "Retry-After" in blocked.headers

        metrics = client.get("/metrics")
        assert metrics.status_code == 200
        assert b"gateway_login_rate_limited_total" in metrics.content
