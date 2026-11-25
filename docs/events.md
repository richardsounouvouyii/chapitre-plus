# Événements RabbitMQ

Exchange : `chapitre.events.v1` (topic, durable).

Enveloppe minimale : voir `packages/contracts/events/envelope.schema.json`.

Phase 0 smoke : routing key `phase0.smoke.v1` (test infra uniquement).

### identity.user.invited.v1
- Producteur : identity-service (outbox transactionnelle)
- Consommateur : notification-service (`chapitre.notification.identity.invited` + DLQ)
- Payload : `invitation_id`, `user_id`, `email`, `role`, `expires_at`
- **Pas de jeton** dans RabbitMQ — claim `POST /internal/invitations/{id}/claim-token` (clé service)

### difficulty.submitted.v1
- Producteur : difficulty-service (outbox)
- Consommateur : trainer-service  
  - queue `chapitre.trainer.difficulty.submitted`  
  - DLQ `chapitre.trainer.difficulty.submitted.dlq`  
  - worker `python -m app.workers.difficulty_inbox_consumer` (ACK après commit inbox)
- Payload : `difficulty_id`, `student_id`, `level_code`, `subject_id`, `chapter_id?`, `status`
- **Pas** de description / préférences / noms (RG mineurs)

### trainer.approved.v1
- Producteur : trainer-service (outbox)
- Payload : `trainer_id`, `user_id`, `status`

### session.published.v1 / session.cancelled.v1
- Producteur : scheduling-service (outbox)
- Payload publié : `session_id`, `trainer_id`, `level_code`, `subject_id`, créneau, `capacity`, `price_xof`, `status`
- Annulation : `session_id`, `trainer_id`, `status`

