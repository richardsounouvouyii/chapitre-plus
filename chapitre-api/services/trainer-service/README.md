# trainer-service

Profils formateurs, compétences, disponibilités, validation admin.

## États
`PENDING_VERIFICATION` → `APPROVED` | `REJECTED` ; depuis `APPROVED` → `SUSPENDED`

## Événements
- Outbox : `trainer.approved.v1`
- Inbox : `difficulty.submitted.v1` → `difficulty_projections` (sans données nominatives)

## Lancer
```powershell
cd chapitre-api\services\trainer-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:DATABASE_URL_TRAINER = "postgresql+psycopg://chapitre:chapitre_dev_change_me@localhost:5432/chapitre_trainer"
$env:IDENTITY_JWT_SECRET = "dev-only-change-me-chapitre-identity-jwt-hs256"
python -m alembic upgrade head
uvicorn app.main:app --reload --port 8004
python -m app.workers.outbox_publisher
# inbox difficulty.submitted.v1
python -m app.workers.difficulty_inbox_consumer
```

File : `chapitre.trainer.difficulty.submitted` — DLQ : `.dlq` — ACK après commit inbox.

## Tests
```powershell
pytest -q
```
Voir `docs/jwt-testing.md`.
