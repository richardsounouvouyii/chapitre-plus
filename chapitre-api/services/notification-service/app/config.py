from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env", "../../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    service_name: str = "notification-service"
    environment: str = "development"
    database_url: str = Field(
        default=(
            "postgresql+psycopg://chapitre:chapitre_dev_change_me"
            "@localhost:5432/chapitre_notification"
        ),
        validation_alias="DATABASE_URL_NOTIFICATION",
    )
    rabbitmq_url: str = Field(
        default="amqp://chapitre:chapitre_dev_change_me@localhost:5673/",
        validation_alias="RABBITMQ_URL",
    )
    rabbitmq_exchange: str = Field(
        default="chapitre.events.v1",
        validation_alias="RABBITMQ_EXCHANGE",
    )
    identity_service_url: str = Field(
        default="http://127.0.0.1:8001",
        validation_alias="IDENTITY_SERVICE_URL",
    )
    identity_internal_service_key: str = Field(
        default="dev-only-identity-internal-key",
        validation_alias="IDENTITY_INTERNAL_SERVICE_KEY",
    )
    invitations_queue: str = "chapitre.notification.identity.invited"
    invitations_dlq: str = "chapitre.notification.identity.invited.dlq"
    invitations_routing_key: str = "identity.user.invited.v1"


@lru_cache
def get_settings() -> Settings:
    return Settings()
