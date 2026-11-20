# Architecture CHAPITRE+ (phase 0)

Workspace contenant `chapitre-web/`, `chapitre-api/gateway/` et neuf microservices FastAPI sous `chapitre-api/services/*`.

- Communication synchrone : HTTP via la gateway (routage métier aux phases suivantes).
- Communication asynchrone : RabbitMQ exchange topic `chapitre.events.v1`.
- Données : une database PostgreSQL par service (même instance Docker en dev).

`chapitre-api/` regroupe le backend ; ce n'est pas une API monolithique.

Voir `AGENTS.md` et `CHAPITRE_PLUS_Cahier_des_charges_Microservices.md`.
