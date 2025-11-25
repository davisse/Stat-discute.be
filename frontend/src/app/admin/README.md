# Admin Dashboard

Dashboard d'administration pour la gestion des données NBA et la synchronisation ETL.

## Accès

```
http://localhost:3000/admin
```

## Structure

```
admin/
├── layout.tsx              # Layout avec sidebar navigation
├── page.tsx                # Dashboard principal
└── components/
    ├── StatsCard.tsx       # Card statistiques
    ├── DataTable.tsx       # Table responsive
    ├── SyncButton.tsx      # Bouton synchronisation
    └── Tabs.tsx            # Système d'onglets
```

## Fonctionnalités

### 1. Statistiques Globales (Cards)
- Total matchs de la saison
- Total box scores joueurs
- Nombre de joueurs uniques
- Dernière mise à jour

### 2. Tables de Données (Tabs)
- **Games**: 20 derniers matchs avec compteur de stats
- **Players**: Top 20 scoreurs avec moyennes
- **Standings**: Classement complet des 30 équipes

### 3. Actions de Synchronisation
- **Sync Games**: Récupère les matchs NBA depuis l'API
- **Fetch Player Stats**: Récupère les box scores des joueurs
- **Calculate Analytics**: Calcule les moyennes et classements

### 4. Logs de Synchronisation
- 10 derniers logs avec statut (Success/Error)
- Durée d'exécution en secondes
- Messages d'erreur détaillés

## API Routes

### GET Routes
```typescript
GET /api/admin/stats          // Statistiques globales
GET /api/admin/games?limit=20 // Liste matchs (pagination)
GET /api/admin/players?limit=20 // Top joueurs
GET /api/admin/standings      // Classements équipes
```

### POST Routes (Exécution Python)
```typescript
POST /api/admin/sync-games           // Sync matchs
POST /api/admin/fetch-player-stats   // Fetch box scores
POST /api/admin/calculate-analytics  // Calcul analytics
```

## Database

### Table: sync_logs
```sql
CREATE TABLE sync_logs (
    log_id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    duration INTEGER,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Design System

### Theme: Skeleton (Clair)
```css
Background: #F5F5F5
Cards: #FFFFFF
Border: #E5E7EB
Text Primary: #111827
Text Secondary: #6B7280
```

### Composants
- **Cards**: 24px padding, 12px radius, shadow subtile
- **Tables**: Header gray-50, hover gray-50
- **Buttons**: Gray-950 bg, white text, hover effect

## Workflow Typique

1. **Consulter** les statistiques globales
2. **Vérifier** les données dans les tabs
3. **Lancer** les synchronisations:
   - Sync Games → récupère matchs NBA
   - Fetch Player Stats → récupère box scores
   - Calculate Analytics → calcule moyennes
4. **Monitorer** les logs pour détecter erreurs

## Composants

### StatsCard
```tsx
<StatsCard
  title="Total Games"
  value={1234}
  subtitle="Season 2025-26"
/>
```

### DataTable
```tsx
<DataTable
  columns={[
    { key: 'name', label: 'Name', width: '200px' },
    { key: 'value', label: 'Value' }
  ]}
  data={[{ name: 'Test', value: 123 }]}
/>
```

### SyncButton
```tsx
<SyncButton
  label="Sync Data"
  endpoint="/api/admin/sync-games"
  onSuccess={() => window.location.reload()}
/>
```

### Tabs
```tsx
<Tabs
  tabs={[
    { id: 'tab1', label: 'Tab 1', content: <div>Content</div> },
    { id: 'tab2', label: 'Tab 2', content: <div>Content</div> }
  ]}
  defaultTab="tab1"
/>
```

## Performance

- Server Components par défaut (SSR)
- Requêtes parallèles avec `Promise.all()`
- `force-dynamic` pour données temps réel
- Indexes database pour queries rapides

## Sécurité

⚠️ **Non implémenté**:
- Authentification requise
- Rate limiting
- CSRF protection

## Développement

```bash
# Appliquer migration
psql nba_stats < 1.DATABASE/migrations/008_sync_logs.sql

# Démarrer dev server
npm run dev

# Accéder au dashboard
http://localhost:3000/admin
```

## Documentation

- `claudedocs/admin_dashboard_implementation.md` - Documentation complète
- `claudedocs/admin_dashboard_summary.md` - Résumé
- `1.DATABASE/migrations/008_sync_logs.sql` - Migration database
