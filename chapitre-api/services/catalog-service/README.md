# catalog-service

Référentiels : niveaux (classes), matières, chapitres, notions.

## Base
`chapitre_catalog`

## Endpoints
| Méthode | Chemin | Description |
| --- | --- | --- |
| GET | `/levels` | Classes MVP actives |
| GET | `/subjects?level=3e` | Matières (filtrables par niveau) |
| GET | `/subjects/{id}/chapters?level=3e` | Chapitres |
| GET | `/chapters/{id}/notions` | Notions |
| POST/PATCH | `/admin/subjects`… | CRUD admin (JWT `ADMIN`) + audit |
| POST/PATCH | `/admin/chapters`, `/admin/notions` | Idem |
| GET | `/admin/audit` | Journal local RG-12 |
| GET | `/health` `/ready` | Santé |

Gateway : `/api/v1/catalog/*` (Authorization transmis). JWT : `IDENTITY_JWT_SECRET` / `IDENTITY_JWT_ISSUER`.

## Lancer
```powershell
cd chapitre-api\services\catalog-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:DATABASE_URL_CATALOG = "postgresql+psycopg://chapitre:chapitre_dev_change_me@localhost:5432/chapitre_catalog"
python -m alembic upgrade head
python -m scripts.seed_catalog
uvicorn app.main:app --reload --port 8002
```

## Tests
```powershell
pytest -q
```

## Smoke gateway → catalog (Compose + Postgres)
```powershell
cd d:\workspaces\chapitre+
docker compose -f infra\docker-compose.yml up -d
cd chapitre-api\services\catalog-service
$env:DATABASE_URL_CATALOG = "postgresql+psycopg://chapitre:chapitre_dev_change_me@localhost:5432/chapitre_catalog"
python -m alembic upgrade head
python -m scripts.seed_catalog
# terminal A
uvicorn app.main:app --port 8002
# terminal B (gateway)
cd ..\..\gateway
uvicorn app.main:app --port 8000
# smoke
cd ..\services\catalog-service
python -m scripts.smoke_gateway_catalog
```
