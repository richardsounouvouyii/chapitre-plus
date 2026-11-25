import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault(
    "DATABASE_URL_CATALOG",
    "postgresql+psycopg://chapitre:chapitre_dev_change_me@localhost:5432/chapitre_catalog",
)
# Forcer (pas setdefault) pour isoler les tests du .env / shell ambiant.
os.environ["IDENTITY_JWT_SECRET"] = "test-jwt-secret-catalog-chapitre-hs256-32b"
os.environ["IDENTITY_JWT_ISSUER"] = "chapitre-identity"

from app.application.seed_data import LEVELS, SAMPLE_CHAPTERS, SUBJECTS_BY_LEVEL, slugify
from app.config import get_settings
from app.infrastructure.database import Base, get_db
from app.infrastructure import models  # noqa: F401
from app.infrastructure.models import Chapter, Level, LevelSubject, Notion, Subject
from app.main import app

get_settings.cache_clear()


def _seed(session: Session) -> None:
    for item in LEVELS:
        session.add(
            Level(
                code=item["code"],
                label=item["label"],
                sort_order=item["sort_order"],
                is_active=True,
            )
        )
    session.flush()
    by_name: dict[str, Subject] = {}
    names = sorted({n for vals in SUBJECTS_BY_LEVEL.values() for n in vals})
    for name in names:
        subject = Subject(name=name, slug=slugify(name), is_active=True)
        session.add(subject)
        session.flush()
        by_name[name] = subject
    for level_code, subject_names in SUBJECTS_BY_LEVEL.items():
        for name in subject_names:
            session.add(
                LevelSubject(level_code=level_code, subject_id=by_name[name].id)
            )
    for sample in SAMPLE_CHAPTERS:
        chapter = Chapter(
            subject_id=by_name[sample["subject"]].id,
            level_code=sample["level_code"],
            title=sample["title"],
            sort_order=sample["sort_order"],
            is_active=True,
        )
        session.add(chapter)
        session.flush()
        for i, title in enumerate(sample["notions"], start=1):
            session.add(
                Notion(
                    chapter_id=chapter.id,
                    title=title,
                    sort_order=i,
                    is_active=True,
                )
            )
    session.commit()


@pytest.fixture()
def client():
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    session = SessionLocal()
    _seed(session)

    def _override():
        yield session

    app.dependency_overrides[get_db] = _override
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    session.close()
    Base.metadata.drop_all(engine)
