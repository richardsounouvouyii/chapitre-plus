# CHAPITRE+ — Cahier des charges fonctionnel et technique

Application web responsive de renforcement scolaire en présentiel — Version 1.0 \| 20 novembre 2026

Document de référence pour conception, développement, validation et recette. Le nom CHAPITRE+ est provisoire.

# 1. Vision, contexte et périmètre

CHAPITRE+ est une plateforme indépendante de l'application de gestion des TD. Elle aide les élèves de troisième et terminale à demander de l'aide sur une matière, un chapitre ou une notion, à trouver une séance de renforcement en présentiel, à réserver et payer si nécessaire, puis à télécharger les supports pédagogiques fournis par leur formateur.

Les séances ont lieu dans un centre/établissement partenaire ou, à terme, à domicile sous conditions de protection des mineurs. Aucun cours vidéo, visioconférence, chat pédagogique, remise de devoir, photo ou réponse envoyée par l'élève n'est prévu.

# 2. Acteurs et droits

| Acteur                          | Actions essentielles                                                                                                                               |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| Élève                           | Compte, description écrite des difficultés, recherche, demande/réservation, suivi, téléchargement de documents, avis privé après séance.           |
| Formateur                       | Profil vérifié, compétences, disponibilités, propositions de séances et tarifs, suivi des réservations, PDF/images avant et après séance, clôture. |
| Parent/tuteur                   | Association avec mineur, autorisation de réservation, paiements, consultation des rendez-vous et réclamations.                                     |
| Administrateur                  | Vérification des formateurs, référentiel, demandes, séances, prix, centres, signalements, paiements et rapports.                                   |
| Responsable de centre (phase 2) | Salles, disponibilités de lieux, validation opérationnelle locale; aucun accès global aux élèves.                                                  |

# 3. Parcours utilisateur de référence

1. L’élève choisit son niveau (3e ou terminale et série), la matière, le chapitre et la notion. Il décrit librement ce qu’il ne comprend pas et indique ses créneaux ainsi que le mode individuel/collectif et le lieu préféré.

2. La plateforme affiche des séances compatibles ou conserve la demande « en attente ». Un administrateur peut regrouper les demandes similaires, sans révéler les identités aux autres élèves.

3. Un formateur vérifié propose une séance : objectif, durée, date, lieu, capacité, tarif par personne. Un administrateur valide la séance et son prix.

4. Le parent autorise la réservation du mineur quand requis. L’élève/parent confirme et paie via un prestataire intégré ; confirmation uniquement après notification serveur vérifiée.

5. Le formateur publie, facultativement, une fiche de préparation et les énoncés avant la séance. La séance se déroule physiquement.

6. Après la séance, le formateur la clôture et peut publier un résumé PDF, des photos de notes/tableau, une fiche de méthode et les corrections. Les inscrits autorisés téléchargent ces ressources.

# 4. Fonctions détaillées — Élève

- Inscription/connexion, profil, classe, série, établissement facultatif et lien avec parent/tuteur.

- Demande de renforcement : matière → chapitre → notion → description texte → disponibilités → séance collective/individuelle → lieu privilégié.

- Historique des demandes avec statuts : soumise, étudiée, proposition reçue, planifiée, clôturée ou annulée.

- Catalogue filtrable de séances : niveau, série, matière, chapitre, zone, date, tarif, places disponibles et formateur.

- Détail, prix final avant réservation, confirmation de réservation et historique des paiements/justificatifs.

- Agenda des séances confirmées, notifications de déplacement, d’annulation et de nouveaux supports.

- Lecture et téléchargement uniquement des PDF et images publiés pour ses séances autorisées.

- Après séance : retour simple « mieux compris / encore difficile », évaluation modérée et signalement.

# 5. Fonctions détaillées — Formateur

- Création d’un profil professionnel, matières/niveaux/notions, justificatifs examinés par l’administration.

- Calendrier des disponibilités, exceptions et zones d’intervention.

- Consultation des demandes pertinentes sans exposition des données sensibles avant réservation.

- Proposition de séances individuelles ou collectives avec objectif, date, durée, lieu, places, tarif et règles de publication.

- Consultation des inscrits et statut des réservations sans accès inutile aux informations de paiement privées.

- Bibliothèque de ressources : PDF, JPG, PNG et WEBP, plusieurs ressources par séance ; titre, catégorie, ordre, description, date de visibilité.

- Catégories : préparation AVANT ; exercices / énoncés AVANT ou PENDANT ; résumé / méthodes / corrigés APRÈS.

- Remplacement/version d’un document, clôture du cours, statut réalisé/non réalisé, consultation du solde et paiements dus.

# 6. Fonctions détaillées — Parent/tuteur

- Compte et lien à un enfant vérifié avec accord, consultation des séances du mineur.

- Autorisation explicite pour les réservations et les lieux à domicile lorsque requis.

- Paiement, historique des transactions, avis d’annulation et remboursements.

- Réclamations et contact avec le support administratif, sans messagerie libre enfant-formateur.

# 7. Fonctions détaillées — Administrateur

- Tableau de bord, comptes, modération et validation des formateurs.

- Référentiels configurables : niveau, série, matière, chapitre, notion, ville et zone.

- Contrôle des demandes, regroupement par notion, proposition/validation des séances et contrôle de capacité.

- Validation des prix proposés, définition de règles et plafonds ; historique des décisions.

- Gestion des centres partenaires, salles, horaires et règles d’accès ; activation progressive du domicile.

- Gestion des paiements, annulations, remboursements et rapprochement avec le prestataire.

- Contrôle des ressources signalées, conservation des journaux d’audit, exports et indicateurs agrégés.

# 8. Règles métier non négociables

| Code  | Règle                                                                                                                              |
|-------|------------------------------------------------------------------------------------------------------------------------------------|
| RG-01 | Une demande porte sur un niveau, une matière, un chapitre et une difficulté décrite; notion facultative si absente du référentiel. |
| RG-02 | L’élève ne téléverse aucun fichier et ne remet aucun devoir en ligne.                                                              |
| RG-03 | Un formateur ne propose une prestation payante qu’après validation de son profil.                                                  |
| RG-04 | Le tarif doit être approuvé et figé pour les réservations existantes; l’historique est conservé.                                   |
| RG-05 | Pas de chevauchement des séances d’un formateur, d’une salle ou d’un élève inscrit.                                                |
| RG-06 | La capacité et les places restantes sont contrôlées atomiquement à la réservation.                                                 |
| RG-07 | Une réservation payante est confirmée seulement après vérification côté serveur du prestataire.                                    |
| RG-08 | Une ressource est visible uniquement pendant sa fenêtre de publication et pour ses participants autorisés.                         |
| RG-09 | Un mineur ne réserve une intervention à domicile qu’avec autorisation parentale et règles de sécurité établies.                    |
| RG-10 | Toute annulation entraîne le traitement prévu par la politique de report/remboursement.                                            |
| RG-11 | La plateforme n’expose jamais la liste des difficultés nominatives à d’autres élèves.                                              |
| RG-12 | Toutes les modifications de tarif, validation, paiement et annulation sont tracées.                                                |

# 9. Tarification et paiements

Le formateur soumet son tarif par séance, l’administrateur approuve avant publication. Une séance collective affiche le prix par place ; une séance individuelle affiche le prix total. Le montant, la devise XOF, les frais et la politique de remboursement sont présentés avant confirmation. Les commissions et la répartition sont paramétrables, non imposées dans le code.

Phase 1 : intégrer un seul fournisseur agréé/compatible à sélectionner après vérification commerciale et juridique. Utiliser une référence de paiement unique, webhook signé/idempotent et transaction de base de données. Ne pas stocker les secrets de paiement ni de cartes côté React. Prévoir le suivi des remboursements et leur réconciliation.

# 10. Supports pédagogiques

Le formateur peut publier avant, pendant ou après la séance : fiches de préparation, énoncés, photographies de notes manuscrites/tableau, résumés, fiches de méthode et corrections. Chaque fichier est lié à une séance et possède type, titre, taille, MIME, date de publication, visibilité et version. Visualisation et téléchargement côté élève ; interdiction de publication par élève.

Sécurité : limites de taille configurables, liste blanche de formats, vérification du type réel, analyse antivirus si disponible, stockage privé, URLs temporaires signées, suppression contrôlée et journalisation des accès. Les formateurs ne doivent pas publier des données personnelles d’élèves ni des œuvres non autorisées.

# 11. Écrans à concevoir

| Profil    | Écrans                                                                                                                               |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------|
| Public    | Accueil, comment ça marche, catalogue, détail séance, connexion/inscription, mentions légales.                                       |
| Élève     | Tableau de bord, déclarer difficulté, mes demandes, séances, détail/réservation, agenda, ressources, paiements, profil.              |
| Formateur | Dashboard, dossier de validation, compétences, disponibilités, demandes, séances, création, documents, gains, profil.                |
| Parent    | Enfants liés, autorisations, réservations, paiements, notifications, réclamations.                                                   |
| Admin     | Vue d’ensemble, formateurs, élèves/parents, référentiels, demandes, séances, centres, documents signalés, prix, transactions, audit. |

# 12. Architecture technique

Frontend React + TypeScript + Vite + Tailwind. Backend OBLIGATOIRE en microservices indépendants FastAPI, **une base PostgreSQL par service** (y compris en développement), migrations Alembic et API versionnée. API Gateway unique pour le frontend ; RabbitMQ pour les événements asynchrones et Docker Compose pour le développement. Les services sont isolés par responsabilité et ne lisent jamais directement la base d’un autre service. Stockage privé compatible S3 pour les PDF et photos. Les détails d’exécution (phases, arborescence `*-service`, outbox) sont dans `AGENTS.md` à la racine.

Services indépendants (dossiers `chapitre-api/services/<nom>-service/`) : identity, catalog, difficulty, trainer, scheduling, booking, resource, payment, notification. Un service ne possède que ses propres tables ; les identifiants externes sont des UUID sans clés étrangères inter-bases. La gateway (`chapitre-api/gateway/`) ne contient pas de logique métier. Services internes non accessibles directement depuis Internet. Front : `chapitre-web/`.

# 13. Modèle de données initial

## 13.1. Responsabilités et propriétés des données

Identity : comptes, rôles, lien parent/enfant et autorisations. Catalog : niveaux, séries, matières, chapitres et notions. Difficulty : demandes textuelles et regroupements. Trainer : profil, vérification, compétences et disponibilités. Scheduling : lieux, séances, horaires et prix proposés/approuvés. Booking : capacités, inscriptions et consentements de réservation. Resource : fichiers PDF/images, contrôle des accès et publication. Payment : transactions, remboursements et webhooks. Notification : alertes, modèles et livraison.

## 13.2. RabbitMQ — échanges asynchrones

Échanges topic durables `chapitre.events.v1` ; routing keys minimales : `difficulty.submitted.v1`, `trainer.approved.v1`, `session.published.v1`, `session.cancelled.v1`, `booking.created.v1`, `booking.confirmed.v1`, `booking.cancelled.v1`, `payment.succeeded.v1`, `payment.failed.v1`, `resource.published.v1`, `session.completed.v1`. Un événement est un fait métier après commit et ne remplace pas un appel synchrone lorsque la réponse est nécessaire immédiatement.

## 13.3. Fiabilité et cohérence

Chaque service utilise une table outbox locale pour publier après transaction, un identifiant `event_id`, `correlation_id` (et `trace_id` si tracing activé), `occurred_at` et `schema_version` ; publication avec confirmations RabbitMQ. Les consommateurs sont idempotents via inbox et dédupliquent `event_id`. ACK après traitement, retry borné et file de quarantaine (DLQ). Les processus couvrant plusieurs services sont des sagas avec compensations explicites ; aucune transaction SQL distribuée.

## 13.4. Sécurité interservices

La gateway authentifie et relaie l’identité vérifiée ; les services contrôlent eux-mêmes leurs autorisations et la propriété des données. Communication interne protégée, credentials de broker par service, queues isolées, secrets hors du code, journaux sans données de mineurs. Événements minimisés : ne jamais publier les descriptions des difficultés ni coordonnées personnelles sans nécessité.

## 13.5. Communication et orchestration

Les opérations requérant une réponse immédiate utilisent REST interne sécurisé avec délais stricts, circuit-breakers simples et erreurs explicites. Les événements déclenchent notifications et projections locales. Exemple : la réservation passe en attente ; Payment constate paiement confirmé par webhook ; événement `payment.succeeded` ; Booking confirme de manière idempotente ; Notification informe le parent/l’élève. Une annulation déclenche un remboursement selon la politique validée.

## 13.6. Infrastructure de développement

Workspace : `chapitre-web/` ; `chapitre-api/gateway/` ; `chapitre-api/services/*-service` (identity, catalog, difficulty, trainer, scheduling, booking, resource, payment, notification) ; `packages/contracts` ; `infra/docker-compose.yml` ; `docs/`. Images Docker distinctes, **une base PostgreSQL et migrations par service**, broker RabbitMQ avec interface de gestion en développement, health/readiness checks, tests de contrat et scripts Windows. Voir aussi `AGENTS.md`.

## 13.7. Découpage raisonnable

Les neuf services sont des frontières cibles explicites. Chaque service peut être déployé seul ; éviter de créer un service par table, écran ou action. Ne pas partager les modèles ORM ni effectuer des jointures entre bases ; les contrats d’API et d’événements sont versionnés. Les services payment et notification sont initialisés tôt (squelettes) mais leurs intégrations externes peuvent rester désactivées jusqu’à la phase prévue.

| Entité                        | Champs / relations essentiels                                                |
|-------------------------------|------------------------------------------------------------------------------|
| User / Role                   | id, email/téléphone vérifié, hash mot de passe, état, rôles.                 |
| StudentProfile / ParentLink   | user_id, niveau/série, parent_id, état du consentement.                      |
| TrainerProfile / Competency   | user_id, état vérification, matière, niveau, zone.                           |
| Subject / Chapter / Topic     | référentiel et ordre pédagogique, niveau/série.                              |
| DifficultyRequest             | student_id, chapter_id, topic_id, description, préférences, statut.          |
| Availability                  | trainer_id, jour, plage, exception, fuseau.                                  |
| Location / Room               | type, zone, capacité, gestionnaire.                                          |
| Session                       | trainer_id, matière/chapitre, date, début/fin, lieu, capacité, statut, type. |
| PriceProposal / PriceApproval | session_id, montant_xof, proposition, validation, version.                   |
| Booking / Consent             | session_id, student_id, statut, montant figé, autorisation tuteur.           |
| Payment / Refund / Payout     | référence prestataire, montant_xof, statut, journal des événements.          |
| LearningResource              | session_id, owner_id, catégorie, nom objet, MIME, visible_at, version.       |
| Notification / AuditLog       | destinataire/acteur, type, horodatage, changement.                           |

# 14. API REST indicative

- POST /api/v1/auth/login ; GET /api/v1/me ; POST /api/v1/difficulties ; GET /api/v1/difficulties/mine

- GET /api/v1/sessions ; POST /api/v1/sessions ; POST /api/v1/sessions/{id}/approve

- POST /api/v1/bookings ; GET /api/v1/bookings/mine ; POST /api/v1/bookings/{id}/cancel

- POST /api/v1/resources/presign-upload (formateur) ; POST /api/v1/resources ; GET /api/v1/sessions/{id}/resources

- GET /api/v1/resources/{id}/download-url (contrôle d’accès serveur)

- POST /api/v1/payments/initiate ; POST /api/v1/payments/webhooks/{provider} ; GET /api/v1/payments/mine

- GET /api/v1/admin/reports ; POST /api/v1/admin/trainers/{id}/approve

# 15. Sécurité, accessibilité et qualité

- RBAC sur tous les endpoints ; contrôles objet par objet (élève, parent, formateur, admin).

- Hashage des mots de passe, sessions/JWT durcis, HTTPS, validation des entrées, anti-bruteforce et gestion des secrets.

- Protection des mineurs, limitation des données, politique de conservation, consentements et conformité réglementaire à vérifier localement.

- Pas de messagerie privée directe élève-formateur dans le MVP ; mécanismes de signalement et support.

- Tests backend pytest (autorisations, conflits, paiements), tests frontend et tests E2E de parcours critiques.

- Mobile-first, accessibilité clavier, états vides/chargement/erreur, connexion lente, messages en français.

- Sauvegardes chiffrées, restauration testée, journalisation, monitoring ; conformité WCAG visée.

# 16. Découpage de livraison et recette

Livraison incrémentale en microservices dès la phase 0. Socle : gateway, service identité et catalogue, broker RabbitMQ, databases et observabilité. Puis demandes, formateurs, planification, réservation, ressources, notification et paiement. Les paiements réels restent désactivés tant que le fournisseur n’est pas choisi et vérifié. Les flux interservices nécessitent des tests de contrat et d’événements.

Tests d’acceptation : (1) élève crée demande texte ; (2) formateur non validé ne publie pas d’offre ; (3) admin approuve tarif ; (4) deux réservations simultanées ne dépassent pas les places ; (5) élève non inscrit ne télécharge pas un document privé ; (6) une ressource programmée reste invisible avant publication ; (7) webhook répété ne crée pas de double paiement ; (8) parent approuve le service mineur ; (9) un formateur ne se réserve pas deux fois ; (10) navigation mobile sans débordement.

# 17. Hors périmètre et décisions ouvertes

Hors périmètre : cours en ligne, devoirs remis numériquement, photos importées par élèves, quiz automatiques, chat libre et application mobile native. Décisions à finaliser avant production : barème exact, prestataire de paiement, politique de remboursement, vérification des formateurs, conditions d’interventions à domicile, mentions légales et modalités de consentement parental. Ne pas inventer ces choix dans le code.

Fin du cahier des charges — référence fonctionnelle CHAPITRE+ v1.0.
