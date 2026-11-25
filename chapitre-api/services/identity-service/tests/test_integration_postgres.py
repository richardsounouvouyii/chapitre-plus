"""Tests d'intégration Postgres — migration + insert (CI / docker local)."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

import pytest
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings
from app.domain.enums import Role, UserStatus
from app.infrastructure.models import AuditLog, User, UserRole
from app.infrastructure.security import hash_password


def _postgres_available(url: str) -> bool:
    try:
        engine = create_engine(url, pool_pre_ping=True, future=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        engine.dispose()
        return True
    except Exception:
        return False


@pytest.fixture(scope="module")
def pg_url() -> str:
    get_settings.cache_clear()
    return get_settings().database_url


@pytest.fixture(scope="module")
def pg_engine(pg_url: str):
    if not _postgres_available(pg_url):
        pytest.skip("Postgres chapitre_identity indisponible")
    engine = create_engine(pg_url, pool_pre_ping=True, future=True)
    yield engine
    engine.dispose()


@pytest.mark.integration
def test_postgres_schema_has_auth_tables(pg_engine) -> None:
    tables = set(inspect(pg_engine).get_table_names())
    expected = {
        "users",
        "user_roles",
        "student_profiles",
        "parent_links",
        "identity_consents",
        "audit_log",
        "account_invitations",
        "alembic_version",
    }
    missing = expected - tables
    assert not missing, f"Tables manquantes (lancer alembic upgrade head) : {missing}"


@pytest.mark.integration
def test_postgres_insert_user_role_and_audit(pg_engine) -> None:
    SessionLocal = sessionmaker(bind=pg_engine, autoflush=False, autocommit=False, future=True)
    session: Session = SessionLocal()
    suffix = uuid.uuid4().hex[:10]
    email = f"ci-{suffix}@exemple.bj"
    user_id = uuid.uuid4()
    try:
        user = User(
            id=user_id,
            email=email,
            password_hash=hash_password("CiPass1234"),
            status=UserStatus.ACTIVE.value,
            first_name="CI",
            last_name="Test",
            email_verified_at=datetime.now(UTC),
        )
        session.add(user)
        session.flush()
        session.add(UserRole(user_id=user.id, role=Role.STUDENT.value))
        session.add(
            AuditLog(
                actor_id=user.id,
                action="user.registered",
                resource_type="user",
                resource_id=str(user.id),
                metadata_json={"source": "integration"},
            )
        )
        session.commit()

        loaded = session.get(User, user_id)
        assert loaded is not None
        assert loaded.email == email
        roles = session.query(UserRole).filter_by(user_id=user_id).all()
        assert [r.role for r in roles] == [Role.STUDENT.value]
        audits = session.query(AuditLog).filter_by(resource_id=str(user_id)).all()
        assert len(audits) >= 1
    finally:
        session.execute(text("DELETE FROM audit_log WHERE resource_id = :rid"), {"rid": str(user_id)})
        session.execute(text("DELETE FROM user_roles WHERE user_id = :uid"), {"uid": user_id})
        session.execute(text("DELETE FROM users WHERE id = :uid"), {"uid": user_id})
        session.commit()
        session.close()
