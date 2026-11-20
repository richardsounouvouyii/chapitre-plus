# catalog-service

Service FastAPI indépendant — phase 0 + référentiel niveaux MVP.

## Base dédiée
`chapitre_catalog`

## Classes MVP
`3e`, `Terminale C`, `Terminale D` — voir `app/domain/levels.py` et `GET /levels`.

## Lancer en local
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

## Tests
```powershell
pytest -q
```
