from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env", "../../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    service_name: str = "catalog-service"
    database_url: str = Field(
        default=(
            "postgresql+psycopg://chapitre:chapitre_dev_change_me"
            "@localhost:5432/chapitre_catalog"
        ),
        validation_alias="DATABASE_URL_CATALOG",
    )
    # Même secret/issuer qu'identity-service (vérification JWT aux frontières).
    jwt_secret: str = Field(
        default="dev-only-change-me-chapitre-identity-jwt-hs256",
        validation_alias="IDENTITY_JWT_SECRET",
    )
    jwt_issuer: str = Field(
        default="chapitre-identity",
        validation_alias="IDENTITY_JWT_ISSUER",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
