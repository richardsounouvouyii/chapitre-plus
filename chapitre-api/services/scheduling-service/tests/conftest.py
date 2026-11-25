import os
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["DATABASE_URL_SCHEDULING"] = "sqlite+pysqlite:///:memory:"
os.environ["IDENTITY_JWT_SECRET"] = "test-jwt-secret-scheduling-chapitre-hs256-32b"
os.environ["IDENTITY_JWT_ISSUER"] = "chapitre-identity"
os.environ["SCHEDULING_SKIP_OUTBOX_PUBLISH"] = "1"

from app.config import get_settings
from app.infrastructure.database import Base, get_db
from app.infrastructure import models  # noqa: F401
from app.main import app

get_settings.cache_clear()


@pytest.fixture(autouse=True)
def _mock_trainer_approved(monkeypatch):
    # id formateur stable par user_id (nécessaire pour détecter les chevauchements)
    cache: dict = {}

    def _ok(*, trainer_user_id, authorization=None, client=None):  # noqa: ANN001
        key = str(trainer_user_id)
        if key not in cache:
            cache[key] = str(uuid4())
        return {"id": cache[key], "user_id": key, "status": "APPROVED"}

    monkeypatch.setattr(
        "app.application.commands.assert_trainer_approved",
        _ok,
    )


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
