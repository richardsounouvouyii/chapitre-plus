# CHAPITRE+

Application de renforcement scolaire **en présentiel** (3e / terminale, Bénin).

Architecture : **microservices** FastAPI + React + PostgreSQL (1 database / service) + RabbitMQ.

Documents de référence à la racine :
- `AGENTS.md` — exécution (phases, structure)
- `CHAPITRE_PLUS_Cahier_des_charges_Microservices.md` — métier

## Prérequis
- Docker Desktop
- Python 3.12+
- Node.js 20+ (utiliser `npm.cmd` sous PowerShell si besoin)

## Phase 0 — démarrage rapide (Windows PowerShell)

```powershell
# 1) Infra
Copy-Item .env.example .env
cd infra
docker compose up -d
cd ..

# 2) Vérifier les 9 databases
docker exec chapitre-postgres psql -U chapitre -d postgres -c "\l"

# 3) Gateway
cd chapitre-api\gateway
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# (autre terminal) pytest -q

# 4) Front
cd chapitre-web
npm.cmd install
npm.cmd run dev

# 5) Smoke RabbitMQ (après pip install pika)
pip install pika
python infra\scripts\rabbitmq_smoke.py
```

UI RabbitMQ : http://localhost:15673 (user/pass dans `.env.example`). Ports hôtes `5673`/`15673` pour éviter les conflits avec d'autres stacks Docker locales.

## Structure

```text
chapitre-web/                    Front React
chapitre-api/
  gateway/                       Entrée /api/v1
  services/*-service/            9 microservices FastAPI
packages/contracts               Contrats événements/API
infra/                           Docker Compose, Postgres, RabbitMQ
docs/                            Architecture et décisions
```

## Phases
Ne pas implémenter tout le métier d'un coup. Valider la phase 0 avant Identity + Catalog.
