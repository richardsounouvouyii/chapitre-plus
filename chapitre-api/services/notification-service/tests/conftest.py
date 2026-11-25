import os

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault(
    "DATABASE_URL_NOTIFICATION",
    "postgresql+psycopg://chapitre:chapitre_dev_change_me@localhost:5432/chapitre_notification",
)

from app.config import get_settings
from app.infrastructure.database import Base
from app.infrastructure import models  # noqa: F401
from app.infrastructure import inbox as inbox_mod
from app.infrastructure import database as database_mod

get_settings.cache_clear()


@pytest.fixture(autouse=True)
def sqlite_inbox_db():
    """Inbox durable en SQLite mémoire pour les tests unitaires."""
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    inbox_mod.SessionLocal = SessionLocal
    database_mod.SessionLocal = SessionLocal
    database_mod.engine = engine
    yield
    Base.metadata.drop_all(engine)
