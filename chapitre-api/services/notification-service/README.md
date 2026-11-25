# notification-service

Notifications internes / e-mails. Étape actuelle : **envoi d'invitation** (adaptateur log).

## Flux invitation
1. Identity écrit outbox `identity.user.invited.v1` (sans jeton)
2. Consumer lit la queue, **claim** le jeton (Fernet déchiffré côté Identity), e-mail log
3. `inbox_events` Postgres déduplique `event_id` (durable)

```powershell
$env:DATABASE_URL_NOTIFICATION = "postgresql+psycopg://chapitre:chapitre_dev_change_me@localhost:5432/chapitre_notification"
python -m alembic upgrade head
python -m app.workers.invitation_consumer
```

## Endpoints
- `POST /internal/invitations` — compat / tests manuels (adaptateur log)
- `/health`, `/ready`

## Lancer API
```powershell
cd chapitre-api\services\notification-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8009
```

## Tests
```powershell
pytest -q
```
