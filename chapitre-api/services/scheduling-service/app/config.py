from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env", "../../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    service_name: str = "scheduling-service"
    database_url: str = Field(
        default=(
            "postgresql+psycopg://chapitre:chapitre_dev_change_me"
            "@localhost:5432/chapitre_scheduling"
        ),
        validation_alias="DATABASE_URL_SCHEDULING",
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
    trainer_service_url: str = Field(
        default="http://127.0.0.1:8004",
        validation_alias="TRAINER_SERVICE_URL",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
