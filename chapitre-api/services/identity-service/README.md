# identity-service

Comptes, rôles RBAC, profils élèves, liens parent/enfant, invitations admin, JWT, audit local (RG-12).

## Base dédiée
`chapitre_identity` — **aucune** FK vers les autres services.

## Auth (étape actuelle)
| Endpoint | Qui | Effet |
| --- | --- | --- |
| `POST /auth/register` | public | inscription **élève** + JWT |
| `POST /auth/login` | public | JWT (refuse `PENDING_PASSWORD`) |
| `POST /auth/invitations` | **ADMIN** | crée TRAINER/PARENT/ADMIN en `PENDING_PASSWORD` + e-mail via notification |
| `POST /auth/set-password` | jeton invitation | active le compte + JWT |
| `GET /auth/me` | Bearer JWT | profil + rôles |
| `GET /roles` | public | liste des rôles MVP |

- Hash mots de passe : **Argon2**
- Access token : **HS256**, TTL court (défaut **15 min**)
- **Pas de `invitation_token` dans la réponse API** ni dans RabbitMQ
- Jeton au repos : **Fernet** (`IDENTITY_TOKEN_FERNET_KEY`) ; claim interne déchiffre
- Outbox → `identity.user.invited.v1` ; notification claim `/internal/invitations/{id}/claim-token`

```powershell
# Publisher outbox (retry si broker down)
python -m app.workers.outbox_publisher
```

## Seed premier admin
```powershell
$env:SEED_ADMIN_EMAIL = "admin@chapitre.bj"
$env:SEED_ADMIN_PASSWORD = "ChangeMeAdmin1"
python -m scripts.seed_admin
```
Idempotent. Forcer reset : `$env:SEED_ADMIN_FORCE = "1"`.

## Prérequis
```powershell
cd d:\workspaces\chapitre+\infra
docker compose up -d postgres
```

## Lancer
```powershell
cd chapitre-api\services\identity-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:DATABASE_URL_IDENTITY = "postgresql+psycopg://chapitre:chapitre_dev_change_me@localhost:5432/chapitre_identity"
$env:IDENTITY_JWT_SECRET = "dev-only-change-me-chapitre-identity-jwt-hs256"
python -m alembic upgrade head
uvicorn app.main:app --reload --port 8001
```

## Tests
```powershell
# unitaires (+ SQLite mémoire)
pytest -q -m "not integration"

# intégration Postgres (CI / docker)
pytest -q -m integration
```
