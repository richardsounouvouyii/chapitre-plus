from fastapi.testclient import TestClient

from app.domain.levels import SUPPORTED_LEVELS, is_supported_level
from app.main import app

client = TestClient(app)


def test_supported_levels_mvp_only_3e_c_d() -> None:
    assert SUPPORTED_LEVELS == ("3e", "Terminale C", "Terminale D")
    assert is_supported_level("Terminale C")
    assert not is_supported_level("Terminale E")
    assert not is_supported_level("Terminale A")
    assert not is_supported_level("Terminale")


def test_list_levels_endpoint() -> None:
    response = client.get("/levels")
    assert response.status_code == 200
    body = response.json()
    assert body["levels"] == ["3e", "Terminale C", "Terminale D"]
    assert "3e" in body["label"]
    assert "Terminale C" in body["label"]
