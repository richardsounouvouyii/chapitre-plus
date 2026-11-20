# chapitre-api

Backend CHAPITRE+ — **pas un monolithe**.

```text
chapitre-api/
  gateway/           # entrée publique /api/v1
  services/          # un dossier = un microservice FastAPI
    identity-service/
    catalog-service/
    …
```

Chaque service a sa base PostgreSQL. Voir `AGENTS.md`.
