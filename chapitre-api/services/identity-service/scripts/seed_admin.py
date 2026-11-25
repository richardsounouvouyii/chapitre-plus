"""
Bootstrap du premier admin Identity — pas d'invitation circulaire.

Usage (PowerShell) :
  cd chapitre-api\\services\\identity-service
  .\\.venv\\Scripts\\Activate.ps1
  $env:DATABASE_URL_IDENTITY = "postgresql+psycopg://chapitre:chapitre_dev_change_me@localhost:5432/chapitre_identity"
  $env:SEED_ADMIN_EMAIL = "admin@chapitre.bj"
  $env:SEED_ADMIN_PASSWORD = "ChangeMeAdmin1"
  python -m scripts.seed_admin
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.config import get_settings
from app.domain.enums import Role, UserStatus
from app.infrastructure.database import SessionLocal
from app.infrastructure.models import User, UserRole
from app.infrastructure.security import hash_password


def main() -> int:
    email = (os.environ.get("SEED_ADMIN_EMAIL") or "admin@chapitre.bj").lower().strip()
    password = os.environ.get("SEED_ADMIN_PASSWORD") or ""
    if len(password) < 8:
        print("SEED_ADMIN_PASSWORD requis (min. 8 caractères).", file=sys.stderr)
        return 1

    get_settings.cache_clear()
    db = SessionLocal()
    try:
        existing = db.scalars(
            select(User).where(User.email == email).options(selectinload(User.roles))
        ).first()
        if existing:
            roles = {r.role for r in existing.roles}
            force = os.environ.get("SEED_ADMIN_FORCE", "").lower() in {"1", "true", "yes"}
            if Role.ADMIN.value in roles and existing.status == UserStatus.ACTIVE.value and not force:
                print(f"Admin déjà présent : {email} (aucune modification).")
                return 0
            if Role.ADMIN.value not in roles:
                db.add(UserRole(user_id=existing.id, role=Role.ADMIN.value))
            existing.password_hash = hash_password(password)
            existing.status = UserStatus.ACTIVE.value
            db.commit()
            print(f"Admin prêt (mis à jour) : {email}")
            return 0

        user = User(
            email=email,
            password_hash=hash_password(password),
            status=UserStatus.ACTIVE.value,
            first_name=os.environ.get("SEED_ADMIN_FIRST_NAME", "Admin"),
            last_name=os.environ.get("SEED_ADMIN_LAST_NAME", "CHAPITRE"),
        )
        db.add(user)
        db.flush()
        db.add(UserRole(user_id=user.id, role=Role.ADMIN.value))
        db.commit()
        print(f"Admin créé : {email}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
