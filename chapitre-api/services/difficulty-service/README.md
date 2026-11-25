# difficulty-service

Demandes textuelles des élèves (pas d’upload fichier).

## États
`SUBMITTED` → `IN_REVIEW` → `PROPOSED` → `SCHEDULED` → `CLOSED` | `CANCELLED`

## Endpoints
| Méthode | Chemin | Rôle |
| --- | --- | --- |
| POST | `/difficulties` | STUDENT |
| GET | `/difficulties` | STUDENT (ses demandes) / ADMIN |
| GET | `/difficulties/{id}` | owner / ADMIN |
| PATCH | `/difficulties/{id}/status` | owner (annulation) / ADMIN |
| GET | `/health` `/ready` | — |

Événement outbox : `difficulty.submitted.v1` (sans description nominative).  
Création : validation synchrone `level_code` / `subject_id` (/ `chapter_id`) via `CATALOG_SERVICE_URL`.

## Lancer
```powershell
cd chapitre-api\services\difficulty-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:DATABASE_URL_DIFFICULTY = "postgresql+psycopg://chapitre:chapitre_dev_change_me@localhost:5432/chapitre_difficulty"
$env:IDENTITY_JWT_SECRET = "dev-only-change-me-chapitre-identity-jwt-hs256"
python -m alembic upgrade head
uvicorn app.main:app --reload --port 8003
# worker
python -m app.workers.outbox_publisher
```

## Tests
```powershell
pytest -q
```
Voir aussi `docs/jwt-testing.md` (forçage secret dans conftest).
