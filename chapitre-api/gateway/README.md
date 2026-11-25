# chapitre-gateway

Point d'entrée public `/api/v1`.

## Proxies
- `/api/v1/auth/*` → identity-service
- `/api/v1/catalog/*` → catalog-service
- `/api/v1/difficulties` → difficulty-service
- `/api/v1/trainers` → trainer-service
- `/api/v1/scheduling/*` → scheduling-service
- `POST /api/v1/auth/login` : rate-limit + métrique `gateway_login_rate_limited_total`
- `/metrics` + alerte `infra/observability/alerts/gateway.yml`

## Lancer
```powershell
cd chapitre-api\gateway
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
