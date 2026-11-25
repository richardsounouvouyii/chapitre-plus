"""Enums métier Identity — source de vérité côté service (pas le front)."""

from enum import StrEnum


class Role(StrEnum):
    """Rôles RBAC MVP (CENTER_MANAGER hors exposition MVP)."""

    STUDENT = "STUDENT"
    TRAINER = "TRAINER"
    PARENT = "PARENT"
    ADMIN = "ADMIN"


class UserStatus(StrEnum):
    """État du compte."""

    ACTIVE = "ACTIVE"
    # Compte créé par admin : mot de passe à définir à la 1re connexion.
    PENDING_PASSWORD = "PENDING_PASSWORD"
    SUSPENDED = "SUSPENDED"
    DISABLED = "DISABLED"


class ParentLinkStatus(StrEnum):
    """Lien parent ↔ enfant (mineur)."""

    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class ConsentType(StrEnum):
    """Consentements d'identité (pas les consentements booking)."""

    GUARDIAN_LINK = "GUARDIAN_LINK"
    DATA_PROCESSING_MINOR = "DATA_PROCESSING_MINOR"
