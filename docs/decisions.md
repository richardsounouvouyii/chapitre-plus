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

## À faire — phases suivantes (validé, pas encore codé)

1. **Phase Identity+Catalog** : le front consomme `GET /levels` (catalog-service) et retire le miroir `curriculumLevels.ts` / `SUPPORTED_LEVELS` local.
2. **Phase Scheduling (3)** : rejeter toute création de séance dont `level` ∉ `SUPPORTED_LEVELS` ; journaliser dans `audit_log` local.

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
