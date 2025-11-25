# Changelog - Stat Discute

## [Unreleased]

### Added - Admin Dashboard (2025-11-19)

#### Database
- Migration 008: Table `sync_logs` pour tracking ETL
- 3 indexes pour performance optimale (created_at, action, status)

#### Backend
- 5 nouvelles fonctions dans `lib/queries.ts`:
  - `getAdminStats()`: Statistiques globales dashboard
  - `getGamesWithStats()`: Matchs avec compteur stats (pagination)
  - `getTopPlayers()`: Top joueurs par moyenne points
  - `getSyncLogs()`: Logs synchronisation récents
  - `insertSyncLog()`: Enregistrement opérations ETL

#### API Routes (7 endpoints)
- GET `/api/admin/stats`: Statistiques globales
- GET `/api/admin/games`: Liste matchs avec pagination
- GET `/api/admin/players`: Top joueurs
- GET `/api/admin/standings`: Classements équipes
- POST `/api/admin/sync-games`: Synchronisation matchs NBA
- POST `/api/admin/fetch-player-stats`: Récupération box scores
- POST `/api/admin/calculate-analytics`: Calcul analytics

#### UI Components (4 composants réutilisables)
- `StatsCard`: Card statistiques avec titre, valeur, subtitle
- `DataTable`: Table responsive avec headers configurables
- `SyncButton`: Bouton action avec states loading/success/error
- `Tabs`: Système onglets avec contenu dynamique

#### Pages Admin
- Layout admin avec sidebar navigation 240px
- Dashboard principal avec 4 sections:
  - Stats Cards (4 métriques clés)
  - Data Tables (Games, Players, Standings)
  - Sync Actions (3 boutons synchronisation)
  - Sync Logs (10 derniers logs)

#### Design System
- Implémentation complète Skeleton Theme (clair)
- Couleurs: #F5F5F5 background, #FFFFFF cards
- Spacing: 8px grid system
- Components: Cards, Tables, Buttons avec styles cohérents

#### Documentation
- `claudedocs/admin_dashboard_implementation.md`: Documentation complète
- `claudedocs/admin_dashboard_summary.md`: Résumé implémentation
- `frontend/src/app/admin/README.md`: Guide utilisation

#### Features
- Visualisation stats temps réel
- Synchronisation données NBA (matchs, stats, analytics)
- Monitoring logs ETL avec status/durée
- UI responsive avec feedback utilisateur
- Server Components pour performance optimale

## [Previous Versions]

### Database Setup (2025-11-19)
- Migrations 001-007: Schema complet 28 tables
- Season 2025-26 configurée comme saison courante
- ETL pipeline fonctionnel
