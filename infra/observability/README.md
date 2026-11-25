# Observabilité CHAPITRE+ (phase déploiement)

## Métriques
- Gateway : `GET http://localhost:8000/metrics`
- Compteur anti-bruteforce : `gateway_login_rate_limited_total`
- Alerte : `alerts/gateway.yml` → `ChapitreGatewayLoginRateLimited`
- RabbitMQ Prometheus : `http://localhost:15692/metrics` (plugin `rabbitmq_prometheus`)
- Alerte DLQ : `alerts/rabbitmq.yml` → `ChapitreTrainerDifficultySubmittedDlqNotEmpty`
  (`rabbitmq_queue_messages{queue="chapitre.trainer.difficulty.submitted.dlq"} > 0`)

## Démarrer Prometheus + Alertmanager (local)
La gateway doit tourner sur le port **8000**.

```powershell
cd d:\workspaces\chapitre+\infra
docker compose -f docker-compose.yml -f docker-compose.observability.yml --profile observability up -d
```

- Prometheus UI : http://localhost:9090  
- Alertmanager UI : http://localhost:9093  

## Déploiement
1. Scraper le service `gateway` (DNS interne) au lieu de `host.docker.internal:8000`.
2. Remplacer le webhook Alertmanager par Slack / e-mail / PagerDuty.
3. Activer le même `rule_files` que `prometheus.yml`.
