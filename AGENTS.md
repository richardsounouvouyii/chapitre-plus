# CHAPITRE+ — AGENTS.md — ARCHITECTURE MICROSERVICES OBLIGATOIRE

## Mission
Créer une véritable application React responsive de renforcement scolaire en présentiel, destinée aux élèves de troisième et de terminale au Bénin. Respecter `CHAPITRE_PLUS_Cahier_des_charges_Microservices.md` (métier) et ce fichier (exécution microservices). Interface en français ; code de production, pas seulement des maquettes.

## Réponses agent — recommandations obligatoires (chaque échange)
À **chaque** question ou demande de l'utilisateur, après avoir répondu / livré le travail, l'agent **doit toujours** terminer par une section **Recommandations** (même hors fin de phase).

Règles :
- Minimum **3** pistes concrètes et actionnables, adaptées au sujet du message (pas de generic filler).
- Couvrir au moins 2 dimensions parmi : technique, architecture, sécurité / mineurs / audit, observabilité, produit / UX, dette / risques, perf, tests.
- Ce sont des **suggestions à valider** avec l'utilisateur — **ne pas les implémenter** tant qu'il n'a pas demandé de les faire.
- Format court et lisible (liste à puces). Titre de section : `### Recommandations`.
- Exception : refus de sécurité / contenu interdit — pas de recommandations d'attaque ou de contournement.

## Règle impérative d'architecture
L'architecture est **microservices dès le démarrage**, avec **FastAPI + RabbitMQ + PostgreSQL**, et NON monolithe modulaire. Chaque domaine doit être séparé par un service FastAPI, une image Docker, son modèle de données, ses migrations et sa documentation. Un service est propriétaire exclusif de ses données : **interdiction d'accéder directement aux tables d'un autre service**, d'importer son ORM ou de créer des FK entre bases. Utiliser des API REST synchrones pour les requêtes qui nécessitent immédiatement une réponse, et RabbitMQ pour les événements métier asynchrones. Ne pas découper par écran/table ; respecter les frontières ci-dessous.

## Contraintes métier non négociables
- Application distincte du logiciel de gestion des TD.
- Toutes les séances ont lieu physiquement ; ni visio, ni cours en ligne, ni quiz ou dépôt de devoirs.
- L'élève décrit sa difficulté uniquement en texte : niveau, matière, chapitre, notion et préférences ; **aucun import de fichier côté élève**.
- Le formateur approuvé peut importer PDF/JPG/PNG/WEBP, avant/pendant/après séance ; élèves autorisés en lecture/téléchargement uniquement.
- Élèves mineurs : lien parent vérifié et approbation nécessaire suivant les règles ; domicile désactivé jusqu'à protocole de sécurité validé.
- Formateur propose le prix ; admin approuve ; prix en XOF entier figé au moment de la réservation confirmée.
- Pas de transaction payée sur seule réponse du frontend. Paiement réel uniquement après vérification serveur du fournisseur ; adaptateur fictif limité au développement.
- Jamais de données personnelles de mineurs dans les événements RabbitMQ sans nécessité métier.
- Respecter les règles RG-01 à RG-12 du cahier (demande complète, pas d'upload élève, formateur validé avant offre payante, tarif figé, non-chevauchement, capacité atomique, paiement serveur, visibilité ressources, domicile/parent, annulation/remboursement, pas de difficultés nominatives publiques, audit).
- Ne pas inventer : barème exact, prestataire de paiement, politique de remboursement, règles juridiques domicile, mentions légales. Utiliser config signalée / adaptateurs désactivés jusqu'à validation.

## Stack
- `chapitre-web/` : React, TypeScript strict, Vite, Tailwind, daisyUI, lucide-react, React Router, TanStack Query, RHF, Zod.
- `chapitre-api/gateway/` : FastAPI ; point d'entrée public `/api/v1` ; routage, authentification aux frontières, rate limit ; aucune logique métier.
- `chapitre-api/services/*` : Python 3.12+, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, tests pytest.
- **Une base PostgreSQL par service**, y compris en développement (pas une base partagée « pour simplifier », pas de schémas partagés entre services). Migrations Alembic indépendantes.
- RabbitMQ durable (topic exchange, queues propres aux consommateurs, DLQ, publisher confirms), stockage privé S3-compatible.
- Docker Compose pour tous les services + broker + bases ; Dockerfile par service ; `.env.example` sans secret.
- OpenAPI et contrats d'événements versionnés ; logs structurés + correlation_id + traces si configurées.

## Services et périmètres
| Service | Responsabilité unique |
| --- | --- |
| `identity-service` | utilisateurs, rôles, login, parents/enfants, consentements d'identité |
| `catalog-service` | niveaux, séries, matières, chapitres et notions |
| `difficulty-service` | demandes textuelles des élèves, état et regroupement |
| `trainer-service` | profils et vérification des formateurs, compétences, disponibilités |
| `scheduling-service` | lieux, séances, créneaux, propositions tarifaires et validation admin |
| `booking-service` | inscriptions, capacité atomique, consentements de réservation et annulations |
| `resource-service` | documents des formateurs, métadonnées, visibilité, accès et téléchargements |
| `payment-service` | demandes de paiement, webhooks, rapprochement, remboursements, commissions configurables |
| `notification-service` | notifications internes, modèles et intégrations externes optionnelles |

Pas de service séparé pour une simple table, ni de base partagée (`shared database` interdite).

## Bases PostgreSQL (une base = un service)
Objectif : garantir l'isolation microservices aussi en local, pas seulement « en théorie ».

| Règle | Détail |
| --- | --- |
| 1 base / service | Ex. `chapitre_identity`, `chapitre_catalog`, `chapitre_booking`… (noms dans `.env.example`) |
| Docker Compose | Soit un conteneur Postgres **par** service, soit un conteneur Postgres avec **plusieurs databases** créées au démarrage — jamais une seule database commune à tous |
| Migrations | Chaque service a son `alembic/` ; une migration ne touche que sa base |
| Références croisées | Uniquement des UUID d'autres domaines (ex. `student_id`), **sans** FK SQL inter-bases |
| Accès | Un service ne reçoit que l'URL de **sa** base ; credentials séparés |
| Interdit | Jointures entre bases, vue partagée, schéma `public` unique pour tout le monorepo |

En phase 0 : créer les databases isolées + healthcheck ; les tables métier viennent dans les phases suivantes.

## Audit (RG-12 du cahier)
Toute modification sensible doit être **traçable** : validation formateur, changement/approbation de tarif, annulation, paiement, remboursement, accès téléchargement sensible.

### MVP (dès les phases métier concernées)
- Chaque service concerné possède une table locale `audit_log` (ou équivalent) dans **sa** base : `id`, `actor_id`, `action`, `resource_type`, `resource_id`, `at` (UTC), `correlation_id`, `metadata` minimal **sans** données nominatives de mineur inutiles.
- Les logs applicatifs structurés (`correlation_id`) complètent, mais **ne remplacent pas** l'audit métier pour RG-12.
- L'admin consulte l'audit via endpoints du service propriétaire (ou agrégation lecture via gateway plus tard) — pas en lisant la base d'un autre service.

### Plus tard (recommandation, pas phase 0)
- Un `audit-service` central optionnel qui **consomme** des événements minimaux (`*.audited.v1`) si un journal unique transverse devient nécessaire.
- Ne pas créer ce service tant que les tables locales ne couvrent pas les parcours critiques.

## Rôles (RBAC)
Enums techniques (code) ; libellés FR à l'écran. Chaque endpoint vérifie le **rôle** et la **propriété** de la ressource (IDOR interdit).

| Rôle | Service propriétaire | Droits essentiels |
| --- | --- | --- |
| `STUDENT` | `identity-service` | demande texte, catalogue, réservation, documents autorisés, retour privé |
| `TRAINER` | `identity-service` + `trainer-service` | profil, disponibilités, séances, uploads PDF/images, clôture |
| `PARENT` | `identity-service` | lien enfant vérifié, consentements, paiements, séances du mineur |
| `ADMIN` | `identity-service` | formateurs, référentiels, tarifs, séances, supervision, audit |
| `CENTER_MANAGER` | phase 2 seulement | salles/lieux locaux ; **ne pas exposer** de fonctions globales dans le MVP |

## États à implémenter explicitement
Ne pas inventer d'autres valeurs. Les transitions interdites doivent être rejetées par le service propriétaire, avec tests.

### Demande (`difficulty-service`)
Cahier : soumise → étudiée → proposition reçue → planifiée → clôturée / annulée.

`SUBMITTED` → `IN_REVIEW` → `PROPOSED` → `SCHEDULED` → `CLOSED` | `CANCELLED`

### Formateur (`trainer-service`)
`PENDING_VERIFICATION` → `APPROVED` | `REJECTED` ; depuis `APPROVED` possible `SUSPENDED`

### Séance (`scheduling-service`)
`DRAFT` → `PENDING_APPROVAL` → `PUBLISHED` → `FULL` | `COMPLETED` | `CANCELLED`

Un tarif de séance : `PROPOSED` (formateur) → `APPROVED` (admin) avant publication payante.

### Réservation (`booking-service`)
`PENDING_GUARDIAN_APPROVAL` | `PENDING_PAYMENT` → `CONFIRMED` | `CANCELLED` | `REFUNDED`

### Paiement (`payment-service`)
`INITIATED` → `PENDING` → `SUCCEEDED` | `FAILED` ; remboursement : `REFUNDED`

Rappel : en production, `SUCCEEDED` uniquement après webhook prestataire vérifié (jamais depuis le frontend seul).

### Ressources (`resource-service`) — catégories
`PREPARATION` | `EXERCISE` | `SUMMARY` | `METHOD` | `CORRECTION`  
Fenêtre : avant / pendant / après via `visible_at` (et métadonnées de catégorie). Formats autorisés : PDF, JPG, PNG, WEBP uniquement.

## Arborescence imposée
Noms imposés par le projet : **`chapitre-web/`** (front) et **`chapitre-api/`** (tout le backend).  
`chapitre-api/` n'est **pas** un monolithe : il contient la gateway + un dossier par microservice. Chaque nom sous `chapitre-api/services/` est un **dossier projet complet** FastAPI, pas un fichier unique.

```text
chapitre-plus/                          # racine du workspace
  AGENTS.md
  CHAPITRE_PLUS_Cahier_des_charges_Microservices.md
  README.md
  .env.example
  chapitre-web/                         # front React (Vite, src/, package.json…)
  chapitre-api/                         # backend (gateway + microservices)
    gateway/                            # entrée publique FastAPI /api/v1
    services/
      identity-service/                 # 1 dossier = 1 service déployable
      catalog-service/
      difficulty-service/
      trainer-service/
      scheduling-service/
      booking-service/
      resource-service/
      payment-service/
      notification-service/
  packages/
    contracts/                          # contrats OpenAPI/events versionnés ; aucun ORM partagé
  infra/
    docker-compose.yml
    rabbitmq/
    postgres/
  docs/
    architecture.md
    services.md
    events.md
    decisions.md
    test-plan.md
```

### Contenu obligatoire de CHAQUE dossier `chapitre-api/services/<nom>-service/`
Exemple pour `identity-service/` (les 8 autres suivent **la même forme**) :

```text
chapitre-api/services/identity-service/
  README.md
  Dockerfile
  requirements.txt                      # ou pyproject.toml
  alembic.ini
  alembic/
    versions/                           # migrations de SA base uniquement
  tests/
  app/
    main.py                             # crée l'app FastAPI + /health
    api/                                # routes HTTP (routers)
    domain/                             # entités, enums, règles pures
    application/                        # cas d'usage / services métier
    infrastructure/                     # SQLAlchemy, RabbitMQ, stockage
```

Règles :
- Un service = son dossier + son `Dockerfile` + sa base PostgreSQL + ses tests.
- Interdiction de mettre le code de deux services dans le même dossier.
- Interdiction d'importer l'ORM ou les modèles d'un autre dossier `chapitre-api/services/*`.
- `chapitre-api/` regroupe le backend ; ce n'est **pas** une seule API monolithique.
- `packages/contracts` ne contient que des schémas/DTO versionnés partagés, jamais la logique métier.

## RabbitMQ : conception obligatoire
- Exchange topic durable `chapitre.events.v1`, routage `domain.action.v1`. Ne jamais utiliser RabbitMQ pour transférer PDF, images, mots de passe, descriptions nominatives ou autres contenus sensibles.
- Contrat commun minimal : `event_id` UUID, `event_type`, `schema_version`, `occurred_at` UTC, `producer`, `correlation_id`, `payload` minimal. Versionner chaque contrat.
- Événements initiaux : `difficulty.submitted.v1`, `trainer.approved.v1`, `session.published.v1`, `session.cancelled.v1`, `booking.created.v1`, `booking.confirmed.v1`, `booking.cancelled.v1`, `payment.succeeded.v1`, `payment.failed.v1`, `resource.published.v1`, `session.completed.v1`.
- Transactional **outbox** dans la base de chaque producteur : écrire données métier et événement dans la même transaction, publier après commit avec publisher confirms ; marquer envoyé seulement après confirmation.
- Chaque consommateur gère une **inbox/déduplication par event_id**, avec ACK après commit, retry plafonné, exponential backoff et DLQ ; aucun `auto_ack` sur événements métier.
- Consommateurs idempotents ; événements livrés **au moins une fois**, ordre global non garanti ; gérer versions et événements hors ordre.
- Définir `retry` et DLQ distinctes par service ; messages poison observables et rejouables avec contrôle.
- Les flows longs sont des sagas avec compensations ; **aucune transaction distribuée entre bases**.

## Exemple de flux paiement (sans succès fictif en production)
1. Booking crée réservation `PENDING_PAYMENT` et verrouille atomiquement une place avec expiration.
2. Payment initie paiement via prestataire configuré ; en prod aucun fournisseur inventé.
3. Prestataire déclenche webhook signé ; Payment vérifie signature, montant, devise, référence et idempotence.
4. Payment enregistre `SUCCEEDED` et publie `payment.succeeded.v1` via outbox.
5. Booking consomme l'événement, vérifie l'état, confirme la réservation de façon idempotente ; en cas d'expiration, lancer une compensation métier / remboursement selon politique.
6. Booking publie `booking.confirmed.v1` ; Notification crée l'alerte interne.
7. En cas d'annulation, orchestrer et journaliser la demande de remboursement ; ne jamais considérer un remboursement réussi sans preuve du prestataire.

## API et sécurité
- Accès navigateur uniquement à la gateway. Services internes sur réseau Docker non exposé par défaut.
- JWT vérifié par gateway **et** services selon design ; vérifier rôle, propriétaire de ressource, droits sur mineur ; aucune confiance aveugle dans les en-têtes envoyés par client.
- Communication interservices authentifiée ; secrets isolés et rotation, CORS restreint, rate limit, validation, logging sans PII.
- Stockage privé S3 ou implémentation locale dev, fichiers contrôlés taille/type/contenu, téléchargements signés courte durée après vérification de réservation autorisée par Resource.
- UUID, UTC en stockage, Africa/Porto-Novo pour affichage, XOF entiers.
- Réservations : contraintes/verrous transactionnels dans Booking ; conflits de séances dans Scheduling. Les lectures interservices peuvent être éventuellement cohérentes ; documenter les projections.

## UX / UI (`chapitre-web/` uniquement)
Les écrans vivent dans le front React. **Un écran ≠ un microservice** : le web appelle la gateway, qui route vers les services. Interface en français, mobile-first, états loading / vide / erreur / succès. Pas de faux boutons non branchés. Accessibilité : labels, clavier, focus visible, contrastes.

Organisation front suggérée : `chapitre-web/src/features/` (auth, difficulties, sessions, bookings, resources, payments, profiles, admin) + `components/ui/` + `lib/` (client API typé).

### Écrans MVP (alignés cahier §11)

| Profil | Écrans |
| --- | --- |
| Public | Accueil, comment ça marche, catalogue, détail séance, connexion/inscription, mentions légales |
| `STUDENT` | Tableau de bord, déclarer une difficulté, mes demandes, séances, détail/réservation, agenda, ressources, paiements, profil |
| `TRAINER` | Dashboard, dossier de validation, compétences, disponibilités, demandes compatibles, séances, création, documents, gains, profil |
| `PARENT` | Enfants liés, autorisations, réservations, paiements, notifications, réclamations |
| `ADMIN` | Vue d'ensemble, formateurs, élèves/parents, référentiels, demandes, séances, centres, documents signalés, prix, transactions, audit |

Navigation : barre inférieure sur mobile, sidebar sur desktop. Design professionnel lisible (renforcement scolaire) ; pas de messagerie libre élève–formateur dans le MVP.

Règles UX liées au métier :
- L'élève ne voit **aucun** contrôle d'upload de fichier.
- Données nominatives de mineurs / difficultés : jamais exposées publiquement ni aux autres élèves.
- Prix affichés en **XOF entiers** ; statut de paiement honnête (jamais « payé » côté UI sans confirmation API).
- Ressources : consultation/téléchargement seulement si réservation autorisée et fenêtre de visibilité ouverte.

Les écrans se branchent progressivement aux phases backend (ex. formulaire difficulté dès la phase Difficulty ; paiement réel seulement phase Payment).

## Tests à chaque service
- Unitaires sur le métier, intégration PostgreSQL, tests d'API, contrat OpenAPI, contrat d'événements.
- Tests RabbitMQ : livraison redondante, redémarrage consommateur, idempotence, retry, DLQ, panne temporaire du broker, relecture outbox.
- E2E : demande élève -> proposition séance -> approbation tarif -> réservation/parent -> paiement vérifié -> confirmation -> publication ressources -> téléchargement privé.
- Cas négatifs : surbooking concurrent, formateur non approuvé, double webhook, mauvais mineur, document anticipé, événement rejoué et accès à la base d'un autre service.
- En dev seules fixtures isolées ; pas de faux succès de paiement en production.
- Critères d'acceptation cahier §16 : (1) demande texte élève ; (2) formateur non validé ne publie pas d'offre ; (3) admin approuve tarif ; (4) pas de surbooking concurrent ; (5) non-inscrit ne télécharge pas ; (6) ressource invisible avant `visible_at` ; (7) webhook rejoué sans double paiement ; (8) parent approuve mineur ; (9) formateur sans double chevauchement ; (10) navigation mobile sans débordement.

## Hors périmètre (MVP)
Cours en ligne, devoirs remis numériquement, photos/upload élève, quiz automatiques, chat libre élève–formateur, app mobile native, `CENTER_MANAGER` exposé, domicile actif sans protocole validé.

## Plan Cursor — une phase à la fois
0. **Fondations** : workspace (`chapitre-web` + `chapitre-api`), React, gateway, RabbitMQ, bases isolées, Docker Compose, health/readiness, pipelines lint/test, `.env.example`. Créer les neuf squelettes FastAPI avec healthchecks seulement ; vérifier build et indépendance ; ne pas coder tout le métier.
0b. **Front d'abord (parallèle)** : architecture `chapitre-web` (app/features/components/lib/mocks), daisyUI + lucide-react + RHF/Zod, écrans publics et shells rôles avec **mocks isolés**. Pas de règles métier dans React. Brancher l'API au fur et à mesure des phases backend.
1. **Identity + Catalog** : comptes, RBAC, vérification de rôle, parents/enfants ; référentiels matières/chapitres, migrations et tests.
2. **Difficulty + Trainer** : demandes texte, formateurs vérifiés, disponibilités, événements + outbox/inbox.
3. **Scheduling** : lieu, séance, validations, conflits d'horaire, tarif approuvé, publications d'événements.
4. **Booking** : capacité sous transaction, autorisations parentales, statuts et projections de séances.
5. **Resource** : import sécurisé PDF/images formateur, publication programmée, accès élève et téléchargement.
6. **Payment + Notification** : notifications internes d'abord ; vrai paiement uniquement fournisseur choisi, webhook signé et saga.
7. **Qualité et déploiement** : tests E2E, monitoring, backups isolés, sécurité et doc de chaque service.
Chaque phase : modifier uniquement les services concernés, lancer tests et smoke tests, indiquer fichiers/commandes/résultats/limites. Ne jamais remplacer microservices par un monolithe pour aller plus vite. Fournir commandes compatibles Windows PowerShell, notamment `npm.cmd` si requis.

## Fin de phase — livrable + recommandations (obligatoire)
À la fin de **chaque** phase, l'agent doit produire dans le chat (et mettre à jour `docs/decisions.md` si une décision est tranchée) :

1. **Réalisé** : ce qui a été fait.
2. **Fichiers / dossiers** créés ou modifiés (chemins réels).
3. **Commandes** de lancement et de test (Windows PowerShell).
4. **Résultats** des vérifications.
5. **Limites** connues de la phase.
6. **Prochaine phase** proposée.
7. **Recommandations** (toujours, même si non implémentées tout de suite) — au minimum 3 pistes parmi :
   - technique (perf, schéma API, versioning, cache, indexes, circuit-breaker) ;
   - architecture (nouveau consumer, projection, découpage futur, contrat d'événement) ;
   - sécurité / mineurs / audit ;
   - observabilité (logs, métriques, traces, alertes DLQ) ;
   - produit / UX (écran manquant, empty state, accessibilité) ;
   - dette et risques si on reporte.

Les recommandations de fin de phase complètent (sans remplacer) la règle « Recommandations obligatoires » de chaque échange. Toujours des **suggestions à valider**, jamais des implémentations automatiques.

## Sources de vérité (emplacement)
- Ce fichier `AGENTS.md` et `CHAPITRE_PLUS_Cahier_des_charges_Microservices.md` vivent **à la racine** du monorepo `chapitre-plus/`.
- Ne pas les déplacer dans `chapitre-api/` ni dans un sous-service : Cursor et l'équipe lisent la racine en premier.
- En cas de conflit : le cahier prime sur le **métier** (parcours, RG, écrans) ; `AGENTS.md` prime sur l'**exécution** (dossiers `*-service`, 1 base/service, phases Cursor, outbox, recommandations à chaque échange et en fin de phase).
- `chapitre-web/` = front. `chapitre-api/` = backend (gateway + `services/*`). Ne pas reconstruire un monolithe unique dans `chapitre-api/`.

## Première commande Cursor
« Lis AGENTS.md et CHAPITRE_PLUS_Cahier_des_charges_Microservices.md à la racine. Démarre uniquement la phase 0 : structure `chapitre-web/`, `chapitre-api/gateway/` et les neuf squelettes sous `chapitre-api/services/`, Docker Compose avec RabbitMQ et PostgreSQL isolé par service, exchange topic, healthchecks, README et exemples de variables. Vérifie la compilation, l'état des conteneurs et un test de publication/consommation RabbitMQ. N'implémente pas encore les fonctionnalités métier et attends validation. »
