# Services

| Service | Port local | Database |
| --- | --- | --- |
| gateway | 8000 | — |
| identity-service | 8001 | chapitre_identity |
| catalog-service | 8002 | chapitre_catalog |
| difficulty-service | 8003 | chapitre_difficulty |
| trainer-service | 8004 | chapitre_trainer |
| scheduling-service | 8005 | chapitre_scheduling |
| booking-service | 8006 | chapitre_booking |
| resource-service | 8007 | chapitre_resource |
| payment-service | 8008 | chapitre_payment |
| notification-service | 8009 | chapitre_notification |

Phase 0 : endpoints `/health` et `/ready` uniquement.

### identity-service (phase 1 — auth)
Outbox `outbox_events` + secrets one-shot ; event `identity.user.invited.v1`.  
Workers : `python -m app.workers.outbox_publisher`.  
Seed admin : `python -m scripts.seed_admin`.

### catalog-service (phase 1)
Référentiels : `/levels`, `/subjects`, `/subjects/{id}/chapters`, `/chapters/{id}/notions`.  
Admin JWT : `/admin/subjects|chapters|notions|audit` + table `audit_log`.  
Seed : `python -m scripts.seed_catalog`. Smoke : `python -m scripts.smoke_gateway_catalog`.  
Gateway : `/api/v1/catalog/*`.

### difficulty-service (phase 2)
Demandes texte : `POST/GET /difficulties`, `PATCH .../status`.  
Création : validation synchrone Catalog (`CATALOG_SERVICE_URL`) pour `level_code` / `subject_id` / `chapter_id`.  
Outbox : `difficulty.submitted.v1`. JWT forcé en tests — voir `docs/jwt-testing.md`.  
Gateway : `/api/v1/difficulties`.

### trainer-service (phase 2)
Profil / compétences / disponibilités ; admin approve/reject/suspend.  
Outbox : `trainer.approved.v1`.  
Inbox worker : `python -m app.workers.difficulty_inbox_consumer`  
(`chapitre.trainer.difficulty.submitted` + DLQ, ACK après commit).  
Gateway : `/api/v1/trainers`.

### scheduling-service (phase 3)
Lieux + séances ; formateur APPROVED obligatoire ; non-chevauchement ; tarif admin.  
Outbox : `session.published.v1`, `session.cancelled.v1`. Port **8005**.  
Gateway : `/api/v1/scheduling/*`.

### notification-service (invitations)
Inbox Postgres `inbox_events` ; consumer RabbitMQ → claim token → e-mail log.  
Worker : `python -m app.workers.invitation_consumer`.

### gateway
Proxy `/api/v1/auth/*` ; rate-limit login ; `/metrics`.  
Observabilité : `infra/docker-compose.observability.yml` + `infra/observability/README.md`.
