from app.infrastructure.token_crypto import (
    decrypt_invitation_token,
    encrypt_invitation_token,
)


def test_fernet_roundtrip() -> None:
    plain = "invitation-token-secret-value"
    cipher = encrypt_invitation_token(plain)
    assert cipher != plain
    assert cipher.startswith("gAAAA")
    assert decrypt_invitation_token(cipher) == plain


def test_legacy_plaintext_fallback() -> None:
    legacy = "legacy-plain-token-not-fernet"
    assert decrypt_invitation_token(legacy) == legacy
