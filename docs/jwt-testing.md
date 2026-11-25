# JWT — tests et services consommateurs

Identity émet les JWT (`IDENTITY_JWT_SECRET`, `IDENTITY_JWT_ISSUER`, HS256, ≥ 32 octets).  
Chaque service qui vérifie le jeton lit les **mêmes** variables (pas d’appel Identity à chaque requête).

## Forçage dans `tests/conftest.py` (obligatoire)

Ne pas utiliser `setdefault` : un `.env` ou un shell ambiant peut injecter un autre secret et faire échouer les tests.

```python
os.environ["IDENTITY_JWT_SECRET"] = "test-jwt-secret-<service>-chapitre-hs256-32b"
os.environ["IDENTITY_JWT_ISSUER"] = "chapitre-identity"
# … autres DATABASE_URL_* …
from app.config import get_settings
get_settings.cache_clear()
```

Longueur secret de test / défaut dev : **≥ 32 octets** (évite `InsecureKeyLengthWarning`).

## Défauts dev

Voir `.env.example` : `IDENTITY_JWT_SECRET=dev-only-change-me-chapitre-identity-jwt-hs256`.
