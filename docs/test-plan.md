# Plan de tests

## Phase 0
- `pytest` health gateway + chaque service
- Docker : Postgres healthy, 9 databases présentes
- RabbitMQ : publish/consume smoke (`infra/scripts/rabbitmq_smoke.py`)
- Front : build TypeScript / page d'accueil

## Identity (phase 1)
```powershell
cd chapitre-api\services\identity-service
pytest -q -m "not integration"
pytest -q -m integration   # Postgres up + alembic upgrade head
```

## Notification inbox
```powershell
cd chapitre-api\services\notification-service
alembic upgrade head   # Postgres up
pytest -q
```

## Observabilité (optionnel)
```powershell
cd infra
docker compose -f docker-compose.yml -f docker-compose.observability.yml --profile observability up -d
```

## Phases suivantes
Voir critères d'acceptation dans `AGENTS.md` et le cahier §16.
