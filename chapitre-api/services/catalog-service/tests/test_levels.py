from app.domain.levels import SUPPORTED_LEVELS, is_supported_level


def test_supported_levels_mvp() -> None:
    assert SUPPORTED_LEVELS == ("3e", "Terminale C", "Terminale D")
    assert is_supported_level("3e")
    assert not is_supported_level("Terminale A")
