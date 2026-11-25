import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault(
    "DATABASE_URL_IDENTITY",
    "postgresql+psycopg://chapitre:chapitre_dev_change_me@localhost:5432/chapitre_identity",
)
# Forcer (pas setdefault) pour isoler les tests du .env / shell ambiant.
os.environ["IDENTITY_JWT_SECRET"] = "test-jwt-secret-chapitre-identity-hs256-32b"
os.environ.setdefault("IDENTITY_JWT_ACCESS_TTL_MINUTES", "15")
os.environ.setdefault(
    "IDENTITY_TOKEN_FERNET_KEY",
    "Sm4U6LDdxF4Nl_ssn7aBlD5drfg4ul5ozH67ifpuSZw=",
)
# Évite d'attendre Postgres/RabbitMQ pendant les tests SQLite.
os.environ.setdefault("IDENTITY_SKIP_OUTBOX_PUBLISH", "1")

from app.config import get_settings
from app.infrastructure.database import Base, get_db
from app.infrastructure import models  # noqa: F401
from app.infrastructure.token_crypto import reset_fernet_cache
from app.main import app

get_settings.cache_clear()
reset_fernet_cache()


@pytest.fixture()
def sqlite_session() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)


@pytest.fixture()
def client(sqlite_session: Session) -> Generator[TestClient, None, None]:
    def _override_db() -> Generator[Session, None, None]:
        yield sqlite_session

    app.dependency_overrides[get_db] = _override_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
