# chapitre-gateway

Point d'entrée public `/api/v1`. Aucune logique métier.

## Local
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
