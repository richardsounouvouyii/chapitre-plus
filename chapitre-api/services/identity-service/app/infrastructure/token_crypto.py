"""Chiffrement Fernet des jetons d'invitation au repos (KMS plus tard en prod)."""

from __future__ import annotations

from functools import lru_cache

from cryptography.fernet import Fernet, InvalidToken

from app.config import get_settings


@lru_cache
def _fernet() -> Fernet:
    key = get_settings().token_fernet_key.encode("utf-8")
    return Fernet(key)


def encrypt_invitation_token(plain: str) -> str:
    return _fernet().encrypt(plain.encode("utf-8")).decode("utf-8")


def decrypt_invitation_token(ciphertext: str) -> str:
    try:
        return _fernet().decrypt(ciphertext.encode("utf-8")).decode("utf-8")
    except InvalidToken as exc:
        # Compat : anciennes lignes en clair avant migration Fernet.
        if ciphertext.startswith("gAAAA"):  # préfixe Fernet typique
            raise ValueError("Impossible de déchiffrer le jeton d'invitation") from exc
        return ciphertext


def reset_fernet_cache() -> None:
    _fernet.cache_clear()
