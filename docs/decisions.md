# Décisions

## 2026-11-20 — Phase 0 : 1 Postgres + 9 databases

Un seul conteneur PostgreSQL expose neuf databases isolées. Neuf serveurs Postgres reportés à plus tard si besoin prod.

## 2026-11-20 — Workspace unique (pas polyrepo)

Un dépôt / dossier Cursor pour tous les services ; chaque service reste déployable indépendamment (Dockerfile propre).

## 2026-11-20 — Ports RabbitMQ hôtes 5673 / 15673

Les ports 5672/15672 étaient déjà pris par une autre stack Docker locale (`couturia-rabbitmq`). Mapping hôte `5673→5672` et `15673→15672` pour CHAPITRE+.

## 2026-11-20 — Noms `chapitre-web` / `chapitre-api`

Le front vit dans `chapitre-web/`. Le backend vit sous `chapitre-api/` (`gateway/` + `services/*`), sans revenir à un monolithe.

## 2026-11-20 — Front d'abord + daisyUI / lucide-react

Après la phase 0 infra, prioriser les écrans `chapitre-web` (mocks) pour permettre les tests UI en parallèle du backend. UI : Tailwind 4 + daisyUI (thème `chapitre`) + lucide-react.
