# scheduling-service

Lieux, séances, tarifs (XOF), publication après approbation admin.

## États séance
`DRAFT` → `PENDING_APPROVAL` → `PUBLISHED` → `FULL` | `COMPLETED` | `CANCELLED`

Tarif : `PROPOSED` → `APPROVED` (admin) avant publication payante.

## Endpoints
| Méthode | Chemin | Rôle |
| --- | --- | --- |
| POST/GET | `/venues` | ADMIN / authentifié |
| POST | `/sessions` | TRAINER (APPROVED) |
| POST | `/sessions/{id}/submit` | TRAINER |
| POST | `/sessions/{id}/approve-price` | ADMIN |
| POST | `/sessions/{id}/cancel` | TRAINER / ADMIN |

Événements : `session.published.v1`, `session.cancelled.v1`.

## Lancer
```powershell
cd chapitre-api\services\scheduling-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:DATABASE_URL_SCHEDULING = "postgresql+psycopg://chapitre:chapitre_dev_change_me@localhost:5432/chapitre_scheduling"
$env:IDENTITY_JWT_SECRET = "dev-only-change-me-chapitre-identity-jwt-hs256"
$env:TRAINER_SERVICE_URL = "http://127.0.0.1:8004"
python -m alembic upgrade head
uvicorn app.main:app --reload --port 8005
```

## Tests
```powershell
pytest -q
```
