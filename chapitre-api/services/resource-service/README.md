# resource-service

Service FastAPI indépendant — phase 0 (health/readiness uniquement).

## Base dédiée
`chapitre_resource`

## Lancer en local
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8007
```

## Tests
```powershell
pytest -q
```
