"""
Seed référentiel MVP Catalog.

  cd chapitre-api\\services\\catalog-service
  $env:DATABASE_URL_CATALOG = "postgresql+psycopg://chapitre:chapitre_dev_change_me@localhost:5432/chapitre_catalog"
  python -m scripts.seed_catalog
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sqlalchemy import select

from app.application.seed_data import LEVELS, SAMPLE_CHAPTERS, SUBJECTS_BY_LEVEL, slugify
from app.config import get_settings
from app.infrastructure.database import SessionLocal
from app.infrastructure.models import Chapter, Level, LevelSubject, Notion, Subject


def main() -> int:
    get_settings.cache_clear()
    db = SessionLocal()
    try:
        for item in LEVELS:
            existing = db.get(Level, item["code"])
            if existing is None:
                db.add(
                    Level(
                        code=item["code"],
                        label=item["label"],
                        sort_order=item["sort_order"],
                        is_active=True,
                    )
                )
            else:
                existing.label = item["label"]
                existing.sort_order = item["sort_order"]
                existing.is_active = True
        db.flush()

        subject_by_name: dict[str, Subject] = {}
        all_names = sorted({name for names in SUBJECTS_BY_LEVEL.values() for name in names})
        for name in all_names:
            row = db.scalars(select(Subject).where(Subject.name == name)).first()
            if row is None:
                row = Subject(name=name, slug=slugify(name), is_active=True)
                db.add(row)
                db.flush()
            subject_by_name[name] = row

        for level_code, names in SUBJECTS_BY_LEVEL.items():
            for name in names:
                subject = subject_by_name[name]
                link = db.scalars(
                    select(LevelSubject).where(
                        LevelSubject.level_code == level_code,
                        LevelSubject.subject_id == subject.id,
                    )
                ).first()
                if link is None:
                    db.add(LevelSubject(level_code=level_code, subject_id=subject.id))

        for sample in SAMPLE_CHAPTERS:
            subject = subject_by_name[sample["subject"]]
            chapter = db.scalars(
                select(Chapter).where(
                    Chapter.subject_id == subject.id,
                    Chapter.level_code == sample["level_code"],
                    Chapter.title == sample["title"],
                )
            ).first()
            if chapter is None:
                chapter = Chapter(
                    subject_id=subject.id,
                    level_code=sample["level_code"],
                    title=sample["title"],
                    sort_order=sample["sort_order"],
                    is_active=True,
                )
                db.add(chapter)
                db.flush()
            for index, notion_title in enumerate(sample["notions"], start=1):
                notion = db.scalars(
                    select(Notion).where(
                        Notion.chapter_id == chapter.id,
                        Notion.title == notion_title,
                    )
                ).first()
                if notion is None:
                    db.add(
                        Notion(
                            chapter_id=chapter.id,
                            title=notion_title,
                            sort_order=index,
                            is_active=True,
                        )
                    )

        db.commit()
        print("Catalog seed OK (levels, subjects, chapters, notions).")
        return 0
    except Exception as exc:
        db.rollback()
        print(f"Seed failed: {exc}", file=sys.stderr)
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
