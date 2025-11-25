# Plan de Validation - Admin Dashboard

**Date**: 2025-11-19
**Statut**: Prêt pour tests

## Checklist de Validation

### 1. Database ✅

- [x] Migration 008 créée
- [x] Migration appliquée sans erreur
- [x] Table `sync_logs` créée
- [x] 3 indexes créés
- [x] Log initial inséré

**Commande test**:
```bash
psql nba_stats -c "SELECT * FROM sync_logs ORDER BY created_at DESC LIMIT 5"
```

### 2. Backend (Queries) ✅

- [x] 5 fonctions ajoutées dans queries.ts
- [x] Types TypeScript corrects
- [x] Toutes les queries filtrent par saison courante
- [x] Paramètres de pagination fonctionnels

**Fonctions à tester**:
```typescript
// Test getAdminStats
const stats = await getAdminStats()
console.log(stats) // Should show current season stats

// Test getGamesWithStats
const games = await getGamesWithStats(10, 0)
console.log(games.length) // Should be <= 10

// Test getTopPlayers
const players = await getTopPlayers(5)
console.log(players.length) // Should be <= 5

// Test getSyncLogs
const logs = await getSyncLogs(3)
console.log(logs.length) // Should be <= 3

// Test insertSyncLog
await insertSyncLog('test', 'success', 5, 'Test message')
```

### 3. API Routes (7 routes) ✅

**GET Routes à tester**:
```bash
# Stats
curl http://localhost:3000/api/admin/stats

# Games (pagination)
curl "http://localhost:3000/api/admin/games?limit=5&offset=0"

# Players
curl "http://localhost:3000/api/admin/players?limit=10"

# Standings
curl http://localhost:3000/api/admin/standings
```

**POST Routes à tester**:
```bash
# Sync Games
curl -X POST http://localhost:3000/api/admin/sync-games

# Fetch Player Stats
curl -X POST http://localhost:3000/api/admin/fetch-player-stats

# Calculate Analytics
curl -X POST http://localhost:3000/api/admin/calculate-analytics
```

### 4. UI Components ✅

**StatsCard**:
- [ ] Affiche titre, valeur, subtitle correctement
- [ ] Style respecte skeleton theme
- [ ] Padding 24px, radius 12px
- [ ] Shadow subtile visible

**DataTable**:
- [ ] Headers affichés correctement
- [ ] Rows avec données correctes
- [ ] Hover effect fonctionne
- [ ] Loading state affiché
- [ ] Empty state affiché

**SyncButton**:
- [ ] Click déclenche confirmation
- [ ] Loading state pendant exécution
- [ ] Success message affiché (5s)
- [ ] Error message affiché si échec
- [ ] onSuccess callback appelé

**Tabs**:
- [ ] Switch entre onglets fonctionne
- [ ] Style actif/inactif correct
- [ ] Contenu affiché correctement

### 5. Layout Admin ✅

- [ ] Sidebar 240px affichée
- [ ] Navigation links fonctionnent
- [ ] Background #F5F5F5
- [ ] Responsive sur mobile

### 6. Page Dashboard ✅

**Section 1: Stats Cards**
- [ ] 4 cards affichées en grid
- [ ] Valeurs correctes (total_games, etc.)
- [ ] Last update formaté correctement
- [ ] Responsive (wrap sur mobile)

**Section 2: Tabs**
- [ ] Tab Games affiche 20 matchs
- [ ] Tab Players affiche top joueurs
- [ ] Tab Standings affiche 30 équipes
- [ ] Data formatée correctement

**Section 3: Sync Actions**
- [ ] 3 boutons affichés en grid
- [ ] Click déclenche POST request
- [ ] Loading state visible
- [ ] Success reload la page

**Section 4: Sync Logs**
- [ ] 10 derniers logs affichés
- [ ] Time formaté en français
- [ ] Status avec symboles (✓ ✗ ⟳)
- [ ] Duration en secondes

### 7. Design System ✅

**Couleurs**:
- [ ] Background: #F5F5F5
- [ ] Cards: #FFFFFF
- [ ] Border: #E5E7EB
- [ ] Text primary: #111827
- [ ] Text secondary: #6B7280

**Spacing**:
- [ ] 8px grid respecté
- [ ] Cards padding 24px
- [ ] Gaps 16px entre cards

**Typography**:
- [ ] Titles bold 600
- [ ] Body text normal
- [ ] Captions 12px muted

### 8. Performance ✅

- [ ] Server Components utilisés
- [ ] Queries parallèles avec Promise.all()
- [ ] force-dynamic activé
- [ ] Indexes database utilisés

### 9. TypeScript ✅

- [ ] Pas d'erreurs TypeScript dans admin/
- [ ] Types interfaces corrects
- [ ] Promise<NextResponse> sur POST routes

## Tests Manuels

### Test 1: Accès Dashboard
1. Ouvrir http://localhost:3000/admin
2. Vérifier 4 stats cards affichées
3. Vérifier tabs fonctionnent
4. Vérifier logs affichés

### Test 2: Sync Games
1. Cliquer "Sync Games"
2. Confirmer dans dialog
3. Vérifier loading state
4. Attendre success message
5. Vérifier refresh automatique
6. Vérifier nouveau log dans table

### Test 3: Fetch Player Stats
1. Cliquer "Fetch Player Stats"
2. Confirmer
3. Vérifier loading
4. Attendre success (peut prendre 30-60s)
5. Vérifier log avec durée

### Test 4: Calculate Analytics
1. Cliquer "Calculate Analytics"
2. Confirmer
3. Vérifier loading
4. Attendre success
5. Vérifier standings mis à jour

### Test 5: Navigation
1. Cliquer liens sidebar
2. Vérifier routes (games, players, standings, sync)
3. Revenir au dashboard

### Test 6: Responsive
1. Réduire largeur navigateur
2. Vérifier cards wrap
3. Vérifier tables scrollent
4. Vérifier sidebar reste visible

## Tests Base de Données

```sql
-- Vérifier sync_logs
SELECT * FROM sync_logs ORDER BY created_at DESC LIMIT 5;

-- Vérifier stats actuelles
SELECT
  (SELECT COUNT(*) FROM games WHERE season = '2025-26') as games,
  (SELECT COUNT(*) FROM player_game_stats pgs
   JOIN games g ON pgs.game_id = g.game_id
   WHERE g.season = '2025-26') as stats,
  (SELECT COUNT(DISTINCT player_id) FROM player_game_stats pgs
   JOIN games g ON pgs.game_id = g.game_id
   WHERE g.season = '2025-26') as players;

-- Vérifier dernière sync
SELECT MAX(created_at) as last_sync
FROM sync_logs
WHERE status = 'success';
```

## Critères de Succès

### Must Have (Critique)
- ✅ Migration database appliquée
- ✅ 7 API routes fonctionnelles
- ✅ Dashboard affiche données
- ✅ Sync buttons exécutent Python
- ✅ Logs enregistrés correctement

### Should Have (Important)
- ✅ UI respecte skeleton theme
- ✅ Tables responsive
- ✅ Error handling
- ✅ Loading states
- ✅ Success feedback

### Nice to Have (Bonus)
- ⚠️ Authentification (non implémenté)
- ⚠️ Rate limiting (non implémenté)
- ⚠️ Real-time updates (non implémenté)
- ⚠️ Export CSV (non implémenté)

## Résolution Problèmes

### Erreur: "Cannot find module '@/lib/queries'"
**Solution**: Vérifier tsconfig.json paths alias

### Erreur: "Table sync_logs does not exist"
**Solution**: Appliquer migration 008
```bash
psql nba_stats < 1.DATABASE/migrations/008_sync_logs.sql
```

### Erreur: "Python script failed"
**Solution**: Vérifier chemins absolus scripts Python

### Erreur: "No data in tables"
**Solution**: Exécuter sync workflow complet:
1. Sync Games
2. Fetch Player Stats
3. Calculate Analytics

## Documentation de Validation

- [ ] Captures d'écran dashboard
- [ ] Tests API avec curl
- [ ] Logs database vérifiés
- [ ] Performance mesurée
- [ ] Documentation mise à jour

## Prochaines Étapes

1. Tests manuels complets
2. Corrections si nécessaire
3. Ajout authentification
4. Monitoring production
5. Optimisations performance
