from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env", "../../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    identity_service_url: str = Field(
        default="http://127.0.0.1:8001",
        validation_alias="IDENTITY_SERVICE_URL",
    )
    catalog_service_url: str = Field(
        default="http://127.0.0.1:8002",
        validation_alias="CATALOG_SERVICE_URL",
    )
    difficulty_service_url: str = Field(
        default="http://127.0.0.1:8003",
        validation_alias="DIFFICULTY_SERVICE_URL",
    )
    trainer_service_url: str = Field(
        default="http://127.0.0.1:8004",
        validation_alias="TRAINER_SERVICE_URL",
    )
    scheduling_service_url: str = Field(
        default="http://127.0.0.1:8005",
        validation_alias="SCHEDULING_SERVICE_URL",
    )
    login_rate_limit: int = Field(
        default=10,
        validation_alias="GATEWAY_LOGIN_RATE_LIMIT",
    )
    login_rate_window_seconds: int = Field(
        default=60,
        validation_alias="GATEWAY_LOGIN_RATE_WINDOW_SECONDS",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
