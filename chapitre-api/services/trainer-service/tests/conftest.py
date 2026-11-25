import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["DATABASE_URL_TRAINER"] = "sqlite+pysqlite:///:memory:"
os.environ["IDENTITY_JWT_SECRET"] = "test-jwt-secret-trainer-chapitre-hs256-32b"
os.environ["IDENTITY_JWT_ISSUER"] = "chapitre-identity"
os.environ["TRAINER_SKIP_OUTBOX_PUBLISH"] = "1"

from app.config import get_settings
from app.infrastructure.database import Base, get_db
from app.infrastructure import models  # noqa: F401
from app.main import app

get_settings.cache_clear()


@pytest.fixture()
def db_session() -> Session:
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
def client(db_session: Session):
    def _override():
        yield db_session

    app.dependency_overrides[get_db] = _override
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
