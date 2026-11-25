from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Clé Fernet de développement UNIQUEMENT (32 bytes url-safe). Remplacer en prod / KMS.
_DEV_FERNET_KEY = "Sm4U6LDdxF4Nl_ssn7aBlD5drfg4ul5ozH67ifpuSZw="


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env", "../../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    service_name: str = "identity-service"
    database_url: str = Field(
        default=(
            "postgresql+psycopg://chapitre:chapitre_dev_change_me"
            "@localhost:5432/chapitre_identity"
        ),
        validation_alias="DATABASE_URL_IDENTITY",
    )
    jwt_secret: str = Field(
        default="dev-only-change-me-chapitre-identity-jwt-hs256",
        validation_alias="IDENTITY_JWT_SECRET",
    )
    jwt_access_ttl_minutes: int = Field(
        default=15,
        validation_alias="IDENTITY_JWT_ACCESS_TTL_MINUTES",
    )
    jwt_issuer: str = Field(
        default="chapitre-identity",
        validation_alias="IDENTITY_JWT_ISSUER",
    )
    invitation_ttl_hours: int = Field(
        default=72,
        validation_alias="IDENTITY_INVITATION_TTL_HOURS",
    )
    notification_service_url: str = Field(
        default="http://127.0.0.1:8009",
        validation_alias="NOTIFICATION_SERVICE_URL",
    )
    rabbitmq_url: str = Field(
        default="amqp://chapitre:chapitre_dev_change_me@localhost:5673/",
        validation_alias="RABBITMQ_URL",
    )
    rabbitmq_exchange: str = Field(
        default="chapitre.events.v1",
        validation_alias="RABBITMQ_EXCHANGE",
    )
    internal_service_key: str = Field(
        default="dev-only-identity-internal-key",
        validation_alias="IDENTITY_INTERNAL_SERVICE_KEY",
    )
    token_fernet_key: str = Field(
        default=_DEV_FERNET_KEY,
        validation_alias="IDENTITY_TOKEN_FERNET_KEY",
    )

    @field_validator("token_fernet_key")
    @classmethod
    def ensure_fernet_key(cls, value: str) -> str:
        key = (value or "").strip()
        if not key or key in {"dev-only-fernet-key-32b-change!!=", "change-me"}:
            return _DEV_FERNET_KEY
        return key


@lru_cache
def get_settings() -> Settings:
    return Settings()
