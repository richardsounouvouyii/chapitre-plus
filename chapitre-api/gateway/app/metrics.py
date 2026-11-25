"""Métriques Prometheus gateway."""

from prometheus_client import Counter, generate_latest, CONTENT_TYPE_LATEST

LOGIN_RATE_LIMITED_TOTAL = Counter(
    "gateway_login_rate_limited_total",
    "Nombre de tentatives de login rejetées par le rate-limit anti-bruteforce",
)


def metrics_payload() -> tuple[bytes, str]:
    return generate_latest(), CONTENT_TYPE_LATEST
