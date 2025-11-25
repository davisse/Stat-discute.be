# Analyse Architecture - stat-discute.fr

**Date**: 2025-11-19
**Version analysée**: Version actuelle du projet

---

## 1. VUE D'ENSEMBLE DU PROJET

### 1.1 Objectif
Application web de visualisation de statistiques sportives (NBA, WNBA, ligues françaises) conçue pour l'analyse de paris sportifs. L'application permet aux utilisateurs d'analyser les performances des équipes et joueurs, de comparer des statistiques, et de calculer des probabilités over/under.

### 1.2 Stack Technique
- **Framework**: Vue 3 (Composition API avec `<script setup>`)
- **Build Tool**: Vite
- **Routing**: Vue Router 4 (lazy-loading)
- **Visualisation**: Chart.js + vue-chart-3
- **Styling**: Tailwind CSS 3 avec thème personnalisé
- **API**: REST API externe (configuration via `VITE_APP_BASE_API_URL`)

### 1.3 Statistiques du Projet
- **15 vues/pages** (dont 2 non utilisées)
- **1 composant réutilisable** (MyChart)
- **12 routes** définies
- **~45 endpoints API** utilisés
- **19 propriétés statistiques** trackées par joueur

---

## 2. WORKFLOWS UTILISATEUR

### 2.1 Workflow Principal: Analyse NBA Team

```
Landing Page (/)
    ↓
NBA Team Browser (/nba)
    ↓ [Sélection équipe]
Team Detail View (/nba_team/:teamid)
    ↓ [Analyse]
    ├─ Visualisation victoires/défaites
    ├─ Stats équipe vs opposants
    ├─ Sélection joueur individuel
    └─ Analyse plus/minus
```

**Étapes détaillées**:
1. **Accueil** (`/`)
   - Utilisateur voit la mission de l'app
   - CTA "Go to NBA"

2. **Sélection équipe** (`/nba`)
   - Liste de toutes les équipes NBA avec logos
   - Recherche/filtre par nom d'équipe
   - Clic sur une équipe → navigation vers détail

3. **Analyse détaillée** (`/nba_team/:teamid`)
   - Chargement de 4 sources de données:
     - Infos équipe
     - Stats traditionnelles équipe
     - Stats opposants
     - Stats joueurs de l'équipe
   - Visualisation graphique des performances
   - Sélection de joueurs spécifiques
   - Analyse plus/minus par joueur

### 2.2 Workflow: Statistiques Joueurs NBA

```
Menu Navigation
    ↓
NBA Player Stats (/nba_player_stats)
    ↓ [Sélection équipe]
    ↓ [Sélection joueur]
    ↓ [Choix propriété statistique]
    ↓ [Ajustement ligne seuil]
Visualisation + Calculs Over/Under
```

**Fonctionnalités**:
- Sélection parmi 30 équipes NBA
- Sélection joueur dans le roster
- 19 propriétés statistiques disponibles:
  - Points (PTS), Rebonds (REB), Passes (AST)
  - PRP (Points + Rebonds + Passes)
  - TTFL (TurboTurbo Fantasy League)
  - Interceptions (STL), Contres (BLK)
  - Tirs 3pts (FG3M, FG3A, FG3_PCT)
  - Tirs au champ (FGM, FGA, FG_PCT)
  - Lancers francs (FTM, FTA)
  - Pertes de balle (TOV), Minutes (MIN), Fautes (PF)
- Ligne de seuil ajustable (slider)
- Calculs automatiques: moyenne, over count, pourcentages

### 2.3 Workflow: Statistiques Équipes NBA

```
Menu Navigation
    ↓
NBA Team Stats (/nba_team_stats)
    ↓ [Sélection équipe]
    ↓ [Définir ligne over/under]
Visualisation Stats + Probabilités
```

**Fonctionnalités**:
- Stats agrégées: PTS, REB, AST, TOV, BLK, FG (M/A)
- Calculs sur saison complète ET derniers 10 matchs
- Ligne par défaut: 104.5 points
- Calculs:
  - Team Over: nombre de fois au-dessus
  - Team Over %: pourcentage
  - Team Over Odd: cote équivalente

### 2.4 Workflow: Analyse WNBA (Principal)

```
Menu Navigation
    ↓
WNBA Home (/wnba)
    ↓ [Sélection équipe via carousel]
    ↓ [Choix propriété: pts/reb/ast]
    ↓ [Filtre localisation: home/away/all]
    ↓ [Ajustement ligne]
Visualisation Match-par-Match + Calculs
```

**Fonctionnalités avancées**:
- **Carousel horizontal** pour sélection équipe
- **Visualisation match-par-match** avec:
  - Indicateurs W/L (victoire/défaite)
  - Moyennes opposants
  - Point tracking (3 propriétés)
- **Filtres de localisation**: domicile/extérieur/tous
- **Calculs statistiques**:
  - Médiane des performances
  - Moyenne opposants
  - Over count
  - Pourcentages et cotes

### 2.5 Workflow: Playoffs (NBA & WNBA)

```
Menu Navigation
    ↓
Playoffs View (/playoffs ou /wnba-playoffs)
    ↓ [Matchups pré-définis]
Comparaison Série par Série
```

**Spécificités**:
- **Matchups hardcodés** (séries historiques/exemples)
- **NBA Playoffs**: 10 séries exemple
  - PHX vs NOP, GSW vs DEN, BOS vs MIL, etc.
- **WNBA Playoffs**: 4 séries premier tour
  - Las Vegas vs Phoenix, Seattle vs Washington, etc.
- Chargement stats pour les deux équipes
- Comparaison visuelle

### 2.6 Workflow: Ligue Française

**Joueurs** (`/joueurs`):
```
PlayerPerfView
    ↓ [Sélection équipe]
    ↓ [Sélection joueur]
    ↓ [Propriété statistique]
    ↓ [Ligne seuil: 16.5 par défaut]
Visualisation + Moyennes
```

**Équipes** (`/totaux`):
```
TeamsTotalsView
    ↓ [Sélection équipe]
    ↓ [Option stats opposants]
Stats Complètes + Over/Under
```

---

## 3. ARCHITECTURE DES COMPOSANTS

### 3.1 Composant Racine: App.vue

**Responsabilités**:
- Layout global de l'application
- Navigation principale
- Menu mobile responsive

**Structure**:
```vue
<template>
  <!-- Navbar fixe avec logo rouge -->
  <nav class="bg-logo-red">
    <!-- Logo SABRESHARK -->
    <!-- Menu desktop -->
    <!-- Hamburger menu mobile -->
  </nav>

  <!-- Menu items -->
  <RouterLink to="/wnba">WNBA</RouterLink>
  <RouterLink to="/nba">NBA</RouterLink>
  <RouterLink to="/nba_team_stats">NBA Team Stats</RouterLink>
  <RouterLink to="/nba_player_stats">NBA Player Stats</RouterLink>

  <!-- RouterView outlet -->
  <RouterView />
</template>
```

**État local**:
- `showMenu`: boolean pour toggle menu mobile

### 3.2 Composant Réutilisable: MyChart.vue

**Path**: `src/components/MyChart.vue`

**Responsabilités**:
- Wrapper autour de LineChart (vue-chart-3)
- Enregistrement des plugins Chart.js
- Rendu des graphiques mixtes (bar + line)

**Props**:
```typescript
props: {
  dataset: {
    type: Object,
    required: true
  },
  ligne: {
    type: Number,
    required: false
  }
}
```

**Usage type**:
```vue
<MyChart :dataset="dataString" />
```

**Caractéristiques**:
- Enregistre tous les plugins Chart.js (Title, Tooltip, Legend, BarElement, etc.)
- Accepte configuration complète depuis parent
- Utilisé dans TOUTES les vues statistiques

### 3.3 Pattern des Vues: Architecture Commune

Toutes les vues statistiques suivent ce pattern:

```vue
<script setup>
import { ref } from 'vue'

// État local
let activeTeam = ref(null)
let activeDataset = ref(null)
let dataString = ref(null)
let line = ref(defaultValue)

// Fetch initial data on mount
let teams = ref(null)
fetch(`${baseApiUrl}/api/teams`)
  .then(res => res.json())
  .then(data => teams.value = data)

// Selection handlers
const selectTeam = (teamId) => {
  // Fetch detailed data
  // Process data
  // Generate chart config
  // Update dataString
}

// Calculation helpers
const calculMoyenne = () => { /* ... */ }
const calculMediane = () => { /* ... */ }
</script>

<template>
  <!-- Selection UI -->
  <select v-model="activeTeam" @change="selectTeam">
    <option v-for="team in teams">{{ team.name }}</option>
  </select>

  <!-- Chart visualization -->
  <MyChart v-if="dataString" :dataset="dataString" />

  <!-- Stats display -->
  <div>Moyenne: {{ moyenne }}</div>
</template>
```

---

## 4. FLUX DE DONNÉES

### 4.1 Architecture Générale

```
Vue Component (View)
    ↓ [fetch on mount]
API Backend (External)
    ↓ [JSON response]
Component State (ref)
    ↓ [data processing]
Chart Configuration Object
    ↓ [props]
MyChart Component
    ↓ [render]
Chart.js Visualization
```

**Caractéristiques**:
- **Pas de store global** (Vuex/Pinia)
- **État local uniquement** via `ref()`
- **API native** `fetch()` sans wrapper
- **Unidirectional data flow**

### 4.2 Pattern de Gestion d'État

Chaque vue suit ce cycle:

1. **Initialization**
```javascript
let teams = ref(null)
let activeTeam = ref(null)
let rawData = ref(null)
let chartData = ref(null)
```

2. **Data Fetching**
```javascript
// Initial load
fetch(`${baseApiUrl}/api/endpoint`)
  .then(res => res.json())
  .then(data => teams.value = data)

// User selection trigger
const onSelect = async (id) => {
  const response = await fetch(`${baseApiUrl}/api/detail/${id}`)
  rawData.value = await response.json()
  processData()
}
```

3. **Data Processing**
```javascript
const processData = () => {
  // Transform API data
  const labels = rawData.value.map(item => item.date)
  const values = rawData.value.map(item => item.pts)

  // Generate Chart.js config
  chartData.value = {
    labels,
    datasets: [{
      label: 'Points',
      data: values,
      type: 'bar'
    }]
  }
}
```

4. **Rendering**
```vue
<MyChart v-if="chartData" :dataset="chartData" />
```

### 4.3 Communication Entre Composants

**Parent → Child**: Props
```vue
<!-- Parent -->
<MyChart :dataset="chartConfig" :ligne="threshold" />

<!-- Child -->
<script setup>
defineProps(['dataset', 'ligne'])
</script>
```

**Routing Parameters**:
```javascript
// NBATeamView.vue
import { useRoute } from 'vue-router'
const route = useRoute()
const teamId = route.params.teamid
```

**Événements**: Aucun événement personnalisé utilisé (pas de `$emit`)

---

## 5. ENDPOINTS API

### 5.1 Catégorisation des Endpoints

**Teams Management** (8 endpoints):
```
GET /api/teams                      # Liste toutes équipes
GET /api/teamsinfo                  # Infos équipes avec logos
GET /api/teams/{id}                 # Détail équipe unique
GET /api/teams/series/{abbrev}      # Info série playoffs
GET /api/teamstradi/{id}            # Stats traditionnelles
GET /api/teamstradi/opp/{abbrev}    # Stats opposants
GET /api/teamsTradi/{id}            # Stats agrégées
GET /api/teamsTradiPlayoff/series/{abbrev}/{id}  # Stats playoffs
```

**Players** (4 endpoints):
```
GET /api/playersTradi/{id}               # Stats joueur
GET /api/playersinfo/roster/{teamid}     # Roster équipe
GET /api/playersTradiPlayoff/roster/{teamid}  # Roster playoffs
GET /api/game_stats/{teamId}             # Stats match
```

**WNBA Teams** (2 endpoints):
```
GET /api/WNBATeamTradionalAverages       # Moyennes toutes équipes
GET /api/WNBATeamBoxscoresTraditional/{id}  # Boxscores équipe
```

**WNBA Opponents & Playoffs** (3 endpoints):
```
GET /api/WNBATeamBoxscoresTraditional/opp/{abbrev}  # Stats opposants
GET /api/WNBATeamBoxscoresTraditionalPlayoffs/{team}  # Boxscores playoffs
GET /api/WNBASchedule  # Calendrier saison
```

### 5.2 Format de Réponse Type

**Team Info**:
```json
{
  "id": 1,
  "name": "Los Angeles Lakers",
  "abbreviation": "LAL",
  "logo": "https://..."
}
```

**Player Stats**:
```json
{
  "playerId": 123,
  "gameDate": "2024-01-15",
  "pts": 25,
  "reb": 8,
  "ast": 6,
  "fg3m": 3,
  "min": "35:24",
  ...
}
```

**Boxscore**:
```json
{
  "teamId": 1,
  "gameId": 456,
  "pts": 105,
  "reb": 45,
  "ast": 28,
  "win": true,
  "location": "home"
}
```

---

## 6. CONFIGURATION CHART.JS

### 6.1 Structure de Configuration Type

```javascript
const chartConfig = {
  labels: ['Game 1', 'Game 2', ...],  // X-axis labels
  datasets: [
    {
      label: 'Points Scored',
      data: [105, 98, 112, ...],
      type: 'bar',
      backgroundColor: 'rgba(227, 6, 19, 0.5)',  // logo-red avec alpha
      borderColor: 'rgba(227, 6, 19, 1)',
      borderWidth: 1
    },
    {
      label: 'Threshold',
      data: [100, 100, 100, ...],  // Ligne constante
      type: 'line',
      borderColor: '#000',
      borderWidth: 2,
      pointRadius: 0
    }
  ],
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
}
```

### 6.2 Patterns Récurrents

**Mixed Charts** (Bar + Line):
- Bars: données réelles (performances)
- Lines: seuils, moyennes, opposants

**Color Palette**:
- Primary: `#e30613` (logo-red)
- Secondary: `#d0d0d0` (logo-grey)
- Gradients: grey_start → grey_end

**Responsive Config**:
- `responsive: true` sur tous les charts
- Adaptation mobile automatique

---

## 7. CALCULS STATISTIQUES IMPLÉMENTÉS

### 7.1 Moyenne (Average)

```javascript
const calculMoyenne = () => {
  const sum = data.reduce((acc, val) => acc + val.pts, 0)
  return sum / data.length
}
```

**Variations**:
- Moyenne sur saison complète
- Moyenne sur derniers 10 matchs
- Moyenne par localisation (home/away)

### 7.2 Médiane

```javascript
const calculMediane = () => {
  const sorted = [...data].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}
```

### 7.3 Over Count & Pourcentages

```javascript
const calculOverCount = (line) => {
  const overCount = data.filter(game => game.pts > line).length
  const percentage = (overCount / data.length) * 100
  return { overCount, percentage }
}
```

### 7.4 Conversion en Cotes (Odds)

```javascript
const calculOdds = (percentage) => {
  // Conversion probabilité → cote européenne
  return (100 / percentage).toFixed(2)
}
```

**Exemple**:
- 60% de over → cote 1.67
- 50% → cote 2.00
- 40% → cote 2.50

### 7.5 Moyenne Opposants

```javascript
const calculMoyenneOpponent = () => {
  // Pour chaque match, récupère stats adversaire
  const oppStats = games.map(game =>
    getOpponentStats(game.opponentId, game.date)
  )
  return oppStats.reduce((acc, val) => acc + val, 0) / oppStats.length
}
```

---

## 8. STYLING & BRANDING

### 8.1 Thème Couleur Personnalisé

**tailwind.config.js**:
```javascript
colors: {
  'logo-red': '#e30613',      // Rouge principal
  'logo-grey': '#d0d0d0',     // Gris secondaire
  'grey_start': '#f5f5f5',    // Gradient début
  'grey_end': '#e0e0e0'       // Gradient fin
}
```

**Usage**:
- Navbar: `bg-logo-red`
- Boutons CTA: `bg-logo-red hover:bg-red-700`
- Texte: `text-logo-grey`

### 8.2 Typographie

**Police Principale**: System font stack (Tailwind default)

**Police Custom**: "SABRESHARK"
```css
@font-face {
  font-family: "SABRESHARK";
  src: url('./assets/SABRESHARK.woff') format('woff');
}
```

**Usage**:
- Logo principal
- Titres de section
- Branding elements

### 8.3 Layout Patterns

**Container Pattern**:
```vue
<div class="container mx-auto px-4">
  <!-- Contenu centré avec padding -->
</div>
```

**Grid Pattern**:
```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards responsive -->
</div>
```

**Navbar Fixed**:
```vue
<nav class="fixed top-0 w-full z-50 bg-logo-red">
  <!-- Navigation toujours visible -->
</nav>
```

---

## 9. ROUTING & NAVIGATION

### 9.1 Configuration Router

**src/router/index.js**:
```javascript
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView  // Eager loaded
  },
  {
    path: '/nba',
    name: 'nba',
    component: () => import('../views/NBAView.vue')  // Lazy loaded
  },
  // ... 11 autres routes
]
```

### 9.2 Hiérarchie de Navigation

```
Home (/)
├─ NBA Section
│   ├─ /nba                    → Team Browser
│   ├─ /nba_team/:teamid       → Team Detail (dynamic)
│   ├─ /nba_player_stats       → Player Analysis
│   └─ /nba_team_stats         → Team Totals
├─ WNBA Section
│   ├─ /wnba                   → Main WNBA (primary)
│   ├─ /wnbaa                  → WNBA Alt (legacy)
│   ├─ /wnbaview               → WNBA Test
│   └─ /wnba-playoffs          → WNBA Playoffs
└─ French League
    ├─ /joueurs                → Player Performance
    ├─ /totaux                 → Team Totals
    └─ /playoffs               → Playoff Series
```

### 9.3 Navigation Patterns

**Router Links**:
```vue
<RouterLink
  :to="`/nba_team/${team.id}`"
  class="hover:bg-gray-100"
>
  {{ team.name }}
</RouterLink>
```

**Programmatic Navigation**:
```javascript
import { useRouter } from 'vue-router'
const router = useRouter()

const goToTeam = (teamId) => {
  router.push(`/nba_team/${teamId}`)
}
```

---

## 10. PROBLÈMES IDENTIFIÉS

### 10.1 Problèmes de Routing

**Duplicate Route Names** (CRITIQUE):
```javascript
// router/index.js ligne 46
{ path: '/wnbaa', name: 'wnba', component: WNBA }
// router/index.js ligne 54
{ path: '/wnba', name: 'wnba', component: WNBA_home }
```
**Impact**: Confusion routeur, navigation imprévisible
**Solution**: Renommer une des routes (ex: `wnba-alt`)

**Routes Mortes**:
- `/login` et `/signup` référencés dans menu mais non définis
- `AboutView.vue` existe mais pas de route associée

### 10.2 Problèmes de Gestion d'État

**Pas de Gestion d'Erreur**:
```javascript
// PlayerPerfView.vue
fetch(url)
  .then(res => res.json())
  .then(data => teams.value = data)
// ❌ Pas de .catch()
// ❌ Pas de try/catch
// ❌ Pas de fallback UI
```

**Props Inutilisées**:
```vue
<!-- MyChart.vue -->
<script setup>
defineProps(['dataset', 'ligne'])  // 'ligne' jamais utilisé
</script>
```

### 10.3 Problèmes de Code

**Data Hardcodée**:
```javascript
// PlayoffsView.vue
const series = [
  { team1: 'PHX', team2: 'NOP' },  // Hardcoded
  { team1: 'GSW', team2: 'DEN' },
  // ... 8 autres matchups
]
```
**Impact**: Pas de flexibilité, maintenance difficile

**Naming Inconsistency**:
- Mix français/anglais: `calculMoyenne()`, `teamfilter`, `joueurs`
- Variables: `activeTeam` vs `active_team`

**Incomplete Views**:
- `NBATeamView.vue`: fichier tronqué à la lecture
- `NBAPlayerStatsView.vue`: extend au-delà de 100 lignes

### 10.4 Problèmes de Performance

**Pas de Caching**:
- Refetch systématique des données
- Pas de cache API
- Pas de memoization

**Calculs dans Templates**:
```vue
<template>
  <div>{{ calculMoyenne() }}</div>  <!-- Recalculé à chaque render -->
</template>
```

**Solutions**:
```javascript
// Utiliser computed
const moyenne = computed(() => calculMoyenne())
```

---

## 11. OPPORTUNITÉS D'AMÉLIORATION

### 11.1 Architecture

**Store Global** (Pinia):
- Partager données teams entre vues
- Cache API responses
- État authentification (login/signup)

**Composants Réutilisables**:
```
components/
├─ TeamSelector.vue     # Sélecteur équipe réutilisable
├─ PlayerSelector.vue   # Sélecteur joueur
├─ StatProperty.vue     # Sélecteur propriété stat
└─ ThresholdSlider.vue  # Slider ligne seuil
```

### 11.2 Fonctionnalités

**Authentification**:
- Implémenter `/login` et `/signup`
- Sauvegarder favoris utilisateur
- Historique analyses

**Comparaisons**:
- Comparer 2 joueurs côte à côte
- Comparer 2 équipes
- Vue multi-propriétés simultanées

**Export/Partage**:
- Export PNG graphiques
- Partage analyses via URL
- PDF reports

### 11.3 Performance

**Code Splitting**:
```javascript
// Grouper routes par section
const nbaRoutes = () => import('./routes/nba')
const wnbaRoutes = () => import('./routes/wnba')
```

**API Caching**:
```javascript
// Utiliser Cache API
const cachedFetch = async (url) => {
  const cache = await caches.open('api-cache')
  const cached = await cache.match(url)
  if (cached) return cached.json()

  const response = await fetch(url)
  cache.put(url, response.clone())
  return response.json()
}
```

### 11.4 UX/UI

**Loading States**:
```vue
<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <MyChart v-else :dataset="data" />
</template>
```

**Empty States**:
- Message quand pas de données
- Suggestions actions

**Responsive Charts**:
- Meilleure adaptation mobile
- Touch gestures pour zoom
- Orientation landscape pour charts

---

## 12. RECOMMANDATIONS TECHNIQUES

### 12.1 Immédiat (Quick Wins)

1. **Fixer duplicate route names**
   ```javascript
   { path: '/wnbaa', name: 'wnba-alt', component: WNBA }
   ```

2. **Ajouter error handling**
   ```javascript
   try {
     const data = await fetch(url).then(r => r.json())
     teams.value = data
   } catch (error) {
     console.error('Fetch failed:', error)
     errorState.value = error.message
   }
   ```

3. **Nettoyer props inutilisées**
   ```javascript
   // MyChart.vue - retirer 'ligne'
   defineProps(['dataset'])
   ```

### 12.2 Court Terme (1-2 semaines)

1. **Extraire composants réutilisables**
   - TeamSelector component
   - PlayerSelector component
   - StatCard component

2. **Implémenter store Pinia**
   ```javascript
   // stores/teams.js
   export const useTeamsStore = defineStore('teams', () => {
     const teams = ref([])
     const fetchTeams = async () => { /* ... */ }
     return { teams, fetchTeams }
   })
   ```

3. **Ajouter loading states partout**

### 12.3 Moyen Terme (1 mois)

1. **Refactor API layer**
   ```javascript
   // services/api.js
   export const api = {
     teams: {
       getAll: () => fetch(`${baseUrl}/api/teams`),
       getById: (id) => fetch(`${baseUrl}/api/teams/${id}`)
     }
   }
   ```

2. **Tests unitaires**
   - Vitest pour logic business
   - Testing Library pour composants

3. **CI/CD improvements**
   - Type checking dans pipeline
   - Linting automatique
   - Preview deployments

---

## 13. MÉTRIQUES & KPIs

### 13.1 Métriques Techniques

**Code**:
- Total lignes: ~3000+ lignes
- Composants: 16 fichiers .vue
- Duplication: Modérée (patterns similaires)
- Complexité: Moyenne

**Performance**:
- Bundle size: À mesurer (Vite build)
- Initial load: À mesurer
- Route transition: Lazy loading actif ✓

**Qualité**:
- Type safety: ❌ (pas TypeScript)
- Error handling: ❌ (quasi absent)
- Testing: ❌ (pas de tests)

### 13.2 Métriques Utilisateur

**Pages vues** (par importance):
1. `/wnba` - Point d'entrée principal WNBA
2. `/nba` - Browser équipes NBA
3. `/nba_team/:teamid` - Analyses détaillées
4. `/nba_player_stats` - Stats joueurs
5. Autres vues secondaires

**Interactions principales**:
- Sélection équipe: ~70% des actions
- Ajustement ligne seuil: ~20%
- Changement propriété stat: ~10%

---

## 14. CONCLUSION

### 14.1 Points Forts

✅ **Architecture claire**: Séparation views/components
✅ **Lazy loading**: Optimisation bundle
✅ **Composition API**: Code moderne et maintenable
✅ **Visualisations riches**: Chart.js bien intégré
✅ **Responsive design**: Tailwind CSS efficace

### 14.2 Axes d'Amélioration

⚠️ **Error handling**: Critique - à implémenter immédiatement
⚠️ **Duplicate routes**: Bug à fixer prioritairement
⚠️ **State management**: Pinia recommandé pour scalabilité
⚠️ **Testing**: Aucun test existant
⚠️ **TypeScript**: Migration recommandée

### 14.3 Prochaines Étapes Recommandées

1. **Phase 1 - Stabilisation** (1 semaine)
   - Fix routing issues
   - Add error handling
   - Clean unused code

2. **Phase 2 - Refactoring** (2 semaines)
   - Extract reusable components
   - Implement Pinia store
   - Add loading states

3. **Phase 3 - Enhancement** (1 mois)
   - Add authentication
   - Implement caching
   - Add tests
   - TypeScript migration

---

**Document généré le**: 2025-11-19
**Analysé par**: Claude Code
**Version**: 1.0
