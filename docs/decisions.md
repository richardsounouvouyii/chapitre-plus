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

## 2026-11-20 — Classes MVP : 3e + Terminale C·D uniquement

Périmètre validé produit : `3e`, `Terminale C`, `Terminale D`. Hors périmètre : Terminale A/B/E et « Terminale » sans série. Source de vérité : `catalog-service` (`SUPPORTED_LEVELS` + `GET /levels`) ; le front miroite dans `curriculumLevels.ts` jusqu’au branchement API phase Identity+Catalog.

## 2026-11-20 — Philosophie hors MVP

Matière littéraire liée aux séries A/L : **retirée** des mocks formateurs tant que seules C·D sont ouvertes. Réintroduire avec le référentiel catalog (séries littéraires) si le produit l’étend.

## 2026-11-21 — Scheduling MVP (phase 3 API)

- Publication payante uniquement si formateur APPROVED + tarif `APPROVED` (admin).
- Chevauchement formateur rejeté (409) sur séances actives.
- Alerte DLQ trainer : `ChapitreTrainerDifficultySubmittedDlqNotEmpty` (RabbitMQ Prometheus :15692).

## 2026-11-21 — Difficulty + Trainer (phase 2 API)

- Difficulty : états cahier uniquement ; outbox sans description nominative.
- Trainer : validation admin obligatoire avant offre ; inbox projections difficultés compatibles.
- JWT tests : forçage `os.environ[...]` (pas `setdefault`) — `docs/jwt-testing.md`.

## 2026-11-21 — Catalog référentiels MVP

- Tables : `levels`, `subjects`, `level_subjects`, `chapters`, `notions` (base `chapitre_catalog`).
- Classes = codes `3e` / `Terminale C` / `Terminale D` (pas de table séries séparée pour le MVP).
- API lecture publique + seed ; CRUD admin sous JWT Identity (`roles` ⊇ `ADMIN`) + `audit_log` local (RG-12).
- Gateway : `/api/v1/catalog/*` → catalog-service (Authorization transmis).
- Smoke : `python -m scripts.smoke_gateway_catalog` après alembic + seed.

## À faire — phases suivantes (validé, pas encore codé)

1. **Front** : consommer `GET /api/v1/catalog/levels` et matières ; retirer miroirs `curriculumLevels.ts` / `subjects.ts` quand branché.
2. **Phase Scheduling (3)** : rejeter toute création de séance dont `level` ∉ niveaux catalog ; journaliser dans `audit_log` local.

## 2026-11-20 — Comptes : élève self-service, autres via admin

- **Élève** : inscription + connexion directe (formulaire public).
- **Formateur / Parent / Admin** : compte créé par l’admin ; invitation par e-mail ; l’utilisateur définit son mot de passe à la première connexion (Identity).
- **Démo front** : boutons « Accès démo » sur `/connexion` **uniquement si `import.meta.env.DEV`** (préremplissage e-mail/mot de passe + navigation mock).
- **Production** : login réel via Identity uniquement — aucun compte fictif ni bloc Accès démo.

## 2026-11-20 — Boutons UI : radius 0

Tous les `.btn` (daisyUI) : `border-radius: 0` et sans bordure fantôme — pastilles / badges peuvent rester arrondis.

## 2026-11-20 — Inscription : case parent / tuteur

Sur `/inscription`, la case « J’ai un parent / tuteur » est collectée côté front (mock) et transmise à `/connexion` via `location.state`, et persistée en `sessionStorage` (`chapitre.studentMock.v1`). Le dashboard élève affiche un bandeau « En attente de lien parent » si le flag est vrai. Le lien parent réel + consentements mineurs seront traités par Identity (phase 1).

## 2026-11-20 — Shell élève (front-only)

Nav élève : Accueil · Demandes · Séances · Ressources · Profil. Empty states FR ; mocks isolés dans `features/difficulties` et `features/bookings` (listes vides). Formulaire « nouvelle demande » reporté (page stub). Paiements élève hors nav primaire pour cette itération.

## 2026-11-20 — Architecture layout app (`app-shell/`)

Les espaces connectés ne vivent plus dans un seul `AppShell.tsx` monolithique :

```text
components/layout/
  AppShell.tsx              # orchestration drawer + Outlet
  AppPageHeader.tsx         # en-tête pages (tous rôles)
  AppEmptyPanel.tsx         # empty state sobre
  app-shell/
    appNav.ts               # nav + home par rôle
    AppSidebar.tsx
    AppSidebarBrand.tsx     # logo → accueil rôle / refresh (pas /accueil public)
    AppSidebarNav.tsx
    AppSidebarFooter.tsx    # Retour au site + Déconnexion
    AppMobileHeader.tsx
    AppBottomNav.tsx
```

Logo sidebar = `/dashboard/<rôle>` (actualise si déjà dessus, `cursor-pointer`). « Retour au site » = bouton en bas de sidebar (`AppSidebarFooter`) → `/accueil` public. Anciennes URLs `/app/*` redirigées vers `/dashboard/*`.

Dans l’espace élève, le CTA secondaire pointe vers **Mes séances** (`STUDENT_PATHS.seances`), pas vers le catalogue public `/catalogue` (réservé au site public, libellé « Séances »).

Chemins centralisés dans `app-shell/appNav.ts` (`STUDENT_PATHS`, `TRAINER_PATHS`, …). Bottom nav mobile = barre **fixe** custom (onglets bordés, actif primary contrasté), pas daisyUI `btm-nav`.

Formulaire élève « Nouvelle demande » : texte seul (classe, matière, chapitre, notion, préférences) ; stockage mock `sessionStorage` via `features/difficulties/mocks.ts`.

Page **Séances** : mocks démo (`features/bookings/mocks.ts`) pour visualiser les états après validation formateur/admin — en attente parent, en attente paiement, confirmée.

Page **Ressources** : mocks (`features/resources/`) — catégories PREPARATION/EXERCISE/SUMMARY/METHOD/CORRECTION ; téléchargement seulement si réservation confirmée **et** `visible_at` passé ; sinon verrouillé.

## 2026-11-20 — Profil élève = miroir inscription (lecture seule)

Le profil élève affiche les champs d’inscription (prénom, nom, e-mail, ville, établissement, classe, parent/tuteur, mot de passe masqué). **Pas de modification côté élève** — seul l’admin peut modifier un compte. Lien parent réel = Identity. Remplacement `sessionStorage` → profil JWT dès phase Identity+Catalog.

## 2026-11-20 — Features séparées par rôle (pas un RoleDashboard unique)

Chaque rôle a son dossier et son tableau de bord :

- `features/student/` — parcours élève
- `features/trainer/` — formateur (validation, séances, supports)
- `features/parent/` — parent / tuteur (enfants, consentements, paiements)
- `features/admin/` — admin (files de validation, tarifs, audit)

Le layout partagé (`AppShell` / sidebar) reste commun ; le **contenu métier** ne se mutualise pas via un dashboard générique.

## 2026-11-20 — Inscription : ville + établissement

- **Ville** (obligatoire) : résidence de l’élève (référentiel démo `beninLocations.ts`).
- **Établissement** (facultatif) : select filtré par ville + « Autre… » (texte libre).
- L’établissement **ne limite pas** le lieu des séances : le catalogue affiche toujours le quartier (ex. Abomey-Calavi) et le filtre ville reste la source de vérité pour Cotonou vs Calavi.
- Plus tard : préfiltre catalogue / zones préférées via Identity + Scheduling.

## 2026-11-20 — Identity étape schéma (users + rôles)

- Un rôle principal par ligne `user_roles` (`STUDENT` | `TRAINER` | `PARENT` | `ADMIN`) ; multi-rôles possibles via plusieurs lignes, `CENTER_MANAGER` hors MVP.
- Profil élève dans `student_profiles` (classe = code catalog texte, **pas** de FK inter-base).
- Lien parent/enfant + consentements Identity + `audit_log` local RG-12.

## 2026-11-20 — Identity auth (Argon2 + JWT courts + invitations)

- Mots de passe : **Argon2** (`argon2-cffi`).
- Access JWT HS256, TTL défaut **15 min** (`IDENTITY_JWT_ACCESS_TTL_MINUTES`).
- Élève : `POST /auth/register` self-service.
- Formateur / Parent / Admin : `POST /auth/invitations` (ADMIN) → user `PENDING_PASSWORD` ; outbox `identity.user.invited.v1` ; e-mail via notification consumer.
- Jeton invitation : `token_ciphertext` Fernet au repos + claim interne — **jamais** en clair dans RabbitMQ / API. Prod : clé via KMS.
- Inbox notification : table Postgres `inbox_events` (plus de set mémoire).
- Premier admin : script `python -m scripts.seed_admin` (pas d’invitation circulaire).
- Gateway : rate-limit login + métrique `gateway_login_rate_limited_total` ; Prometheus/Alertmanager via `infra/docker-compose.observability.yml` (profil `observability`).

## 2026-11-25 — Secrets hors dépôt (déploiement)

- `.env` réel gitignoré (`.env`, `.env.*`, sauf `.env.example`).
- `.env.example` = placeholders DEV uniquement ; prod = secrets injectés (hébergeur / KMS), jamais commités.
- Logs locaux `.run-*.err` / `.run-*.log` exclus du dépôt.

## 2026-11-25 — Formateur propose / admin valide (disponibilités & lieux)

Décision produit (front mock formateur, alignée cahier) :

| Domaine | Formateur | Admin |
| --- | --- | --- |
| Classes & matières (MVP : 3e / Terminale C·D ; Maths / Physique / Chimie) | Déclare dans le dossier | Approuve le dossier / statut |
| Jours & créneaux (disponibilités) | Définit son calendrier | Ne choisit pas les heures à sa place |
| Lieu d’une séance | Choisit parmi les **lieux référencés** (centres) | Valide séance + tarif ; gère les centres |
| Domicile | Hors MVP actif | Protocole mineurs |
| Tarif | Propose | Approuve avant publication payante |

Conséquences d’implémentation : disponibilités → `trainer-service` (mock front d’abord) ; lieux + séances → `scheduling-service` ; ne pas confondre dossier compétences et calendrier.
