from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env", "../../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    service_name: str = "difficulty-service"
    database_url: str = Field(
        default=(
            "postgresql+psycopg://chapitre:chapitre_dev_change_me"
            "@localhost:5432/chapitre_difficulty"
        ),
        validation_alias="DATABASE_URL_DIFFICULTY",
    )
    jwt_secret: str = Field(
        default="dev-only-change-me-chapitre-identity-jwt-hs256",
        validation_alias="IDENTITY_JWT_SECRET",
    )
    jwt_issuer: str = Field(
        default="chapitre-identity",
        validation_alias="IDENTITY_JWT_ISSUER",
    )
    rabbitmq_url: str = Field(
        default="amqp://chapitre:chapitre_dev_change_me@localhost:5673/",
        validation_alias="RABBITMQ_URL",
    )
    rabbitmq_exchange: str = Field(
        default="chapitre.events.v1",
        validation_alias="RABBITMQ_EXCHANGE",
    )
    catalog_service_url: str = Field(
        default="http://127.0.0.1:8002",
        validation_alias="CATALOG_SERVICE_URL",
    )
    catalog_timeout_seconds: float = Field(
        default=5.0,
        validation_alias="DIFFICULTY_CATALOG_TIMEOUT_SECONDS",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
