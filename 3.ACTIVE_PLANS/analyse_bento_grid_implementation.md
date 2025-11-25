# Page /analyse - Bento Grid Implementation Plan

**Date:** 2025-11-20
**Status:** 🟢 Phase 1 MVP Complete
**Priority:** High
**Estimated Time:** 8-12 heures
**Phase 1 Completed:** 2025-11-20 (~2 heures)

## 🎯 Objectif

Créer une page `/analyse` interactive permettant aux utilisateurs de construire des analyses NBA personnalisées en ajoutant et configurant des widgets dans un layout bento grid.

## 💡 Concept

- **Style Bento Grid**: Layout dashboard avec composants de tailles variables
- **Construction Progressive**: L'utilisateur construit son analyse en ajoutant des composants
- **Pool de Composants**: Bibliothèque de widgets configurables (stats, graphiques, comparaisons)
- **Interaction Fluide**: Sélection, configuration, suppression de composants
- **Design System**: Monochrome strict STAT-DISCUTE (noir/blanc/gris)

---

## 🎨 MOCKUPS - PARCOURS UTILISATEUR

### Moment 1: État Initial (Page Vide)

```
┌─────────────────────────────────────────────────────────┐
│  [LOGO] STAT-DISCUTE                                    │
│                                                          │
│  Construire une analyse          [+ Ajouter composant]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│                                                          │
│                  ┌──────────────────┐                   │
│                  │                  │                   │
│                  │  📊  Commencez   │                   │
│                  │  votre analyse   │                   │
│                  │                  │                   │
│                  │  Ajoutez des     │                   │
│                  │  composants pour │                   │
│                  │  construire une  │                   │
│                  │  analyse NBA     │                   │
│                  │                  │                   │
│                  │  [+ Ajouter]     │                   │
│                  │                  │                   │
│                  └──────────────────┘                   │
│                                                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Caractéristiques:**
- Background noir avec dots pattern (15% white opacity)
- Empty state centré avec invitation claire
- Bouton primaire blanc avec texte noir (!important pour override)
- Design minimaliste et épuré

---

### Moment 2: Modal de Sélection de Composants

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│       ┌───────────────────────────────────────┐        │
│       │  Sélectionner un composant       [X]  │        │
│       ├───────────────────────────────────────┤        │
│       │                                       │        │
│       │   ┌────────┐  ┌────────┐  ┌────────┐│        │
│       │   │📊 Stats│  │⚖️  Compa│  │📈 Graph││        │
│       │   │ Joueur │  │  raison │  │  ique  ││        │
│       │   │        │  │ 2 joueu │  │  perf. ││        │
│       │   │  1x1   │  │   2x1   │  │  2x2   ││        │
│       │   └────────┘  └────────┘  └────────┘│        │
│       │                                       │        │
│       │   ┌────────┐  ┌────────┐  ┌────────┐│        │
│       │   │🏆 Class│  │🔄 Head │  │⚡ Four ││        │
│       │   │ ement  │  │   to   │  │ Factors││        │
│       │   │ équipe │  │  Head  │  │        ││        │
│       │   │  1x2   │  │  2x2   │  │  2x1   ││        │
│       │   └────────┘  └────────┘  └────────┘│        │
│       │                                       │        │
│       │   ┌────────┐  ┌────────┐  ┌────────┐│        │
│       │   │🎯 Prédi│  │📝 Notes│  │💎 Advan││        │
│       │   │  ction │  │  libre │  │  ced   ││        │
│       │   │  match │  │        │  │  Stats ││        │
│       │   │  2x1   │  │  3x1   │  │  2x2   ││        │
│       │   └────────┘  └────────┘  └────────┘│        │
│       │                                       │        │
│       └───────────────────────────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Interactions:**
- Click sur card → Ajoute le widget à la page
- Hover → Border blanche + shadow-md
- Modal centré avec backdrop semi-transparent
- Chaque card affiche: nom, icône, taille grid

---

### Moment 3: Grid avec Premiers Composants

```
┌──────────────────────────────────────────────────────────┐
│  [Logo] Analyse: Lakers vs Celtics    [+ Add] [💾 Save] │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────┬───────────────┐                      │
│  │ 📊 Stats      │ ⚖️  Comparaison│                      │
│  │ LeBron James  │ LBJ vs Tatum  │                      │
│  │               │               │                      │
│  │ 28.5 PPG      │ PPG: 28.5│27.0│                      │
│  │ 7.3 RPG       │ RPG: 7.3│8.6 │                      │
│  │ 8.8 APG       │ APG: 8.8│4.9 │                      │
│  │               │               │                      │
│  │ [⚙️] [🗑️]      │ [⚙️] [🗑️]      │                      │
│  └───────────────┴───────────────┘                      │
│                                                           │
│  ┌─────────────────────────────────────────┐            │
│  │ 📈 Performance Trend (Last 10 games)    │            │
│  │                                         │            │
│  │     ▁▃▅▇█▇▅▃▁▃                         │            │
│  │  35 ┤     ██                            │            │
│  │  30 ┤   ████                            │            │
│  │  25 ┤ ██████                            │            │
│  │  20 └─────────────                      │            │
│  │     G1 G2 G3 G4 G5                      │            │
│  │                                         │            │
│  │ [⚙️] [🗑️]                                │            │
│  └─────────────────────────────────────────┘            │
│                                                           │
│  ┌──────────────────────┐                               │
│  │ [+ Zone vide]        │  ← Drop zone                  │
│  │  Ajouter composant   │                               │
│  └──────────────────────┘                               │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

**Nouveaux éléments:**
- Chaque widget a des contrôles: Config (⚙️) + Delete (🗑️)
- Titre de l'analyse éditable (click to edit)
- Bouton Save pour sauvegarder l'analyse
- Grid responsive avec gap 16px
- Drop zones visibles entre composants

---

### Moment 4: Configuration d'un Widget

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│       ┌───────────────────────────────────────┐        │
│       │  Configuration: Stats Joueur     [X]  │        │
│       ├───────────────────────────────────────┤        │
│       │                                       │        │
│       │  Sélectionner un joueur:              │        │
│       │  ┌──────────────────────────────┐    │        │
│       │  │ 🔍 LeBron James         [v] │    │        │
│       │  └──────────────────────────────┘    │        │
│       │                                       │        │
│       │  Période:                             │        │
│       │  ⚪ Saison complète 2025-26           │        │
│       │  ⚫ Derniers 10 matchs                │        │
│       │  ⚪ Derniers 30 jours                 │        │
│       │                                       │        │
│       │  Statistiques à afficher:             │        │
│       │  ☑️ Points (PPG)                      │        │
│       │  ☑️ Rebonds (RPG)                     │        │
│       │  ☑️ Passes décisives (APG)            │        │
│       │  ☐ Field Goal % / 3PT %              │        │
│       │  ☐ True Shooting % / eFG%            │        │
│       │                                       │        │
│       │  Taille:                              │        │
│       │  ⚪ Small (1x1)  ⚫ Medium (2x1)      │        │
│       │                                       │        │
│       │      [Annuler]      [Appliquer]      │        │
│       │                                       │        │
│       └───────────────────────────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Fonctionnalités:**
- Autocomplete pour sélection joueur (Radix Combobox)
- Radio buttons pour options de période
- Checkboxes pour stats à afficher
- Choix de taille du composant
- Preview en temps réel (optionnel Phase 2)
- Validation avant application

---

### Moment 5: Analyse Complète (6-8 widgets)

```
┌────────────────────────────────────────────────────────────┐
│  Analyse: Lakers @ Celtics - 2025-11-20  [+] [💾] [📤]   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────┬─────────┬─────────┐  ┌──────────────────┐    │
│ │LeBron   │Tatum    │🎯 Predic│  │🏆 Team Standings │    │
│ │Stats    │Stats    │  tion   │  │                  │    │
│ │28.5 PPG │27.0 PPG │         │  │1. Celtics  45-12 │    │
│ │7.3 RPG  │8.6 RPG  │Lakers   │  │2. Lakers   42-15 │    │
│ │8.8 APG  │4.9 APG  │52%      │  │3. Bucks    40-17 │    │
│ │[⚙️][🗑️]  │[⚙️][🗑️]  │Celtics  │  │4. Heat     38-19 │    │
│ │         │         │48%      │  │5. 76ers    37-20 │    │
│ │         │         │[⚙️][🗑️]  │  │[⚙️][🗑️]          │    │
│ └─────────┴─────────┴─────────┘  └──────────────────┘    │
│                                                             │
│ ┌──────────────────────────────┬─────────────────────┐    │
│ │📈 Performance Trend          │⚡ Four Factors      │    │
│ │ (Last 10 games)              │                     │    │
│ │  35┤  ██                     │ Lakers   │ Celtics  │    │
│ │  30┤████                     │ Shooting │ 52% 48%  │    │
│ │  25┤██████                   │ Turnovers│ 12  14   │    │
│ │  20└──────                   │ Reb%     │ 45% 55%  │    │
│ │    G1 G2 G3 G4 G5            │ FT Rate  │ 24% 28%  │    │
│ │ [⚙️][🗑️]                      │ [⚙️][🗑️]             │    │
│ └──────────────────────────────┴─────────────────────┘    │
│                                                             │
│ ┌───────────────────────────────────────────────────┐     │
│ │🔄 Head-to-Head History                            │     │
│ │ Last 5 matchs: Lakers 3-2 Celtics                │     │
│ │ [111-108] [95-102] [118-115] [103-110] [121-118] │     │
│ │ [⚙️][🗑️]                                           │     │
│ └───────────────────────────────────────────────────┘     │
│                                                             │
│ ┌───────────────────────────────────────────────────┐     │
│ │📝 Notes                                            │     │
│ │ - LeBron historiquement excellent vs Celtics      │     │
│ │ - Tatum en forme: 30+ pts dans 3 derniers matchs  │     │
│ │ - Parquet Boston = avantage défensif important    │     │
│ │ - Analyser impact de l'absence de AD              │     │
│ │ [Click pour éditer...]                            │     │
│ └───────────────────────────────────────────────────┘     │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

**Caractéristiques finales:**
- Mix de tailles de composants (1x1, 2x1, 2x2, 3x1, 1x2, 3x2)
- Grid auto-flow intelligent
- Actions: Save (💾 localStorage), Share (📤 export JSON)
- Notes texte éditables en inline
- Cohésion visuelle monochrome totale

---

## 📐 ARCHITECTURE TECHNIQUE

### Stack Technique

- **Framework:** Next.js 16 App Router
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4 (grid natif, pas de library externe)
- **Language:** TypeScript
- **State:** React useState (local component state)
- **Persistence:** localStorage (Phase 1 MVP), PostgreSQL (Phase 4)
- **Components:** Existing shadcn/ui components (Button, Card, Dialog)

### Structure des Fichiers

```
frontend/src/app/analyse/
├── page.tsx                          # Page principale (Client Component)
├── components/
│   ├── AnalysisHeader.tsx           # Header avec titre + actions
│   ├── ComponentPalette.tsx         # Modal de sélection
│   ├── ComponentCard.tsx            # Card dans la palette
│   ├── BentoGrid.tsx                # Layout grid container
│   ├── WidgetWrapper.tsx            # Wrapper commun avec controls
│   ├── ConfigModal.tsx              # Modal de configuration
│   └── widgets/
│       ├── PlayerStatsWidget.tsx    # Stats d'un joueur
│       ├── ComparisonWidget.tsx     # Comparaison 2 joueurs
│       ├── ChartWidget.tsx          # Graphique performance
│       ├── StandingsWidget.tsx      # Classement équipe
│       ├── HeadToHeadWidget.tsx     # Historique matchs
│       ├── FourFactorsWidget.tsx    # Four Factors Dean Oliver
│       ├── PredictionWidget.tsx     # Prédiction ML match
│       ├── NotesWidget.tsx          # Zone texte libre
│       └── AdvancedStatsWidget.tsx  # Métriques avancées
├── types.ts                          # TypeScript interfaces
└── utils.ts                          # Helper functions
```

### TypeScript Interfaces

```typescript
// types.ts

export type WidgetType =
  | 'player-stats'
  | 'comparison'
  | 'chart'
  | 'standings'
  | 'head-to-head'
  | 'four-factors'
  | 'prediction'
  | 'notes'
  | 'advanced-stats'

export type WidgetSize =
  | '1x1'  // Small: 1 col x 1 row
  | '2x1'  // Medium: 2 cols x 1 row
  | '2x2'  // Large: 2 cols x 2 rows
  | '3x1'  // Wide: 3 cols x 1 row
  | '1x2'  // Tall: 1 col x 2 rows
  | '3x2'  // XLarge: 3 cols x 2 rows

export interface Widget {
  id: string                    // Unique identifier
  type: WidgetType             // Type de widget
  size: WidgetSize             // Taille dans le grid
  config: WidgetConfig         // Configuration spécifique
  data?: any                   // Data fetched from DB
}

export interface WidgetConfig {
  // Config varie selon le type de widget
  playerId?: number
  playerIds?: number[]
  teamId?: number
  teamIds?: number[]
  gameId?: string
  period?: 'season' | 'last10' | 'last30'
  stats?: string[]
  metric?: string
  // ... autres options
}

export interface AnalysisState {
  title: string                // Titre de l'analyse
  widgets: Widget[]            // Liste des widgets
  isModalOpen: boolean         // Modal palette ouverte?
  editingWidgetId: string | null  // Widget en cours de config
}

export interface ComponentDefinition {
  type: WidgetType
  name: string
  description: string
  icon: string
  defaultSize: WidgetSize
  availableSizes: WidgetSize[]
}
```

### CSS Grid System

```css
/* Bento Grid Container */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-4); /* 16px */
  padding: var(--space-6);
  width: 100%;
  min-height: 400px;
}

/* Widget Sizes */
.widget-1x1 {
  grid-column: span 4;
  grid-row: span 1;
  min-height: 200px;
}

.widget-2x1 {
  grid-column: span 6;
  grid-row: span 1;
  min-height: 200px;
}

.widget-2x2 {
  grid-column: span 6;
  grid-row: span 2;
  min-height: 400px;
}

.widget-3x1 {
  grid-column: span 9;
  grid-row: span 1;
  min-height: 200px;
}

.widget-1x2 {
  grid-column: span 4;
  grid-row: span 2;
  min-height: 400px;
}

.widget-3x2 {
  grid-column: span 9;
  grid-row: span 2;
  min-height: 400px;
}

/* Responsive Breakpoints */
@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .widget-1x1, .widget-2x1, .widget-3x1 {
    grid-column: span 6;
  }
}

@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .widget-1x1, .widget-2x1, .widget-2x2,
  .widget-3x1, .widget-1x2, .widget-3x2 {
    grid-column: span 4;
  }
}
```

### Component Patterns

**WidgetWrapper (HOC pour tous les widgets):**
```tsx
<div className={cn(
  "rounded-[var(--radius-lg)]",
  "border border-[var(--color-gray-800)]",
  "bg-[var(--color-gray-850)]",
  "p-[var(--space-6)]",
  "transition-all duration-[var(--transition-normal)]",
  "hover:border-white hover:shadow-[var(--shadow-md)]",
  "relative",
  widgetSizeClass
)}>
  {/* Widget Header */}
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-white font-semibold">{title}</h3>
    <div className="flex gap-2">
      <button onClick={onConfig}>⚙️</button>
      <button onClick={onDelete}>🗑️</button>
    </div>
  </div>

  {/* Widget Content */}
  {children}
</div>
```

---

## 🚀 PLAN D'IMPLÉMENTATION

### Phase 1: MVP Core ✅ COMPLETED (2025-11-20)

**Objectif:** Page fonctionnelle avec widgets de base

**Tasks:**
- [x] Créer `/analyse/page.tsx` avec AppLayout
- [x] Implémenter empty state avec bouton "Ajouter"
- [x] Créer ComponentPalette modal
- [x] Définir liste statique des composants disponibles
- [x] Implémenter BentoGrid avec CSS Grid
- [x] Créer WidgetWrapper avec controls (config + delete)
- [x] Implémenter 3 widgets de base:
  - [x] PlayerStatsWidget (données mockées)
  - [x] NotesWidget (textarea éditable)
  - [x] ComparisonWidget (données mockées)
- [x] Ajouter fonctionnalité delete widget
- [x] Implémenter titre éditable (contentEditable ou input)
- [x] Ajouter localStorage persistence:
  - Save on widget add/delete/config
  - Load on page mount
- [x] Responsive design (12-column grid adaptatif)

**Critères de succès:**
- ✅ Page accessible à `/analyse`
- ✅ Peut ajouter/supprimer des widgets
- ✅ Grid responsive fonctionne (12 cols desktop, 6 tablet, 4 mobile)
- ✅ localStorage sauvegarde/restaure l'état (auto-save)
- ✅ Design monochrome respecté
- ✅ Titre éditable (click to edit)
- ✅ 3 widgets fonctionnels avec mock data

**Files Created:**
- `frontend/src/app/analyse/page.tsx` - Main page with state management
- `frontend/src/app/analyse/types.ts` - TypeScript interfaces
- `frontend/src/app/analyse/utils.ts` - Helper functions and component definitions
- `frontend/src/app/analyse/components/BentoGrid.tsx` - Grid container + EmptyState
- `frontend/src/app/analyse/components/ComponentPalette.tsx` - Widget selection modal
- `frontend/src/app/analyse/components/WidgetWrapper.tsx` - HOC for all widgets
- `frontend/src/app/analyse/components/widgets/PlayerStatsWidget.tsx` - Player stats display
- `frontend/src/app/analyse/components/widgets/NotesWidget.tsx` - Editable notes
- `frontend/src/app/analyse/components/widgets/ComparisonWidget.tsx` - Player comparison

---

### Phase 2: Configuration & Data (2-3 heures)

**Objectif:** Widgets configurables avec vraies données NBA

**Tasks:**
- [ ] Créer ConfigModal component générique
- [ ] Implémenter config forms pour chaque widget type:
  - [ ] Player selection (autocomplete avec Radix Combobox)
  - [ ] Period selection (radio buttons)
  - [ ] Stats selection (checkboxes)
  - [ ] Size selection (radio buttons)
- [ ] Ajouter queries dans `lib/queries.ts`:
  - [ ] `getPlayerStatsForPeriod(playerId, period)`
  - [ ] `comparePlayerStats(player1Id, player2Id, period)`
  - [ ] `getTeamStandings(conference)`
  - [ ] `getHeadToHeadHistory(team1Id, team2Id, limit)`
- [ ] Intégrer fetching de données dans widgets
- [ ] Ajouter loading states (skeleton loaders)
- [ ] Implémenter error handling + retry
- [ ] Ajouter validation de config (joueur requis, etc.)

**Critères de succès:**
- ✅ Config modal fonctionne pour tous les widgets
- ✅ Données réelles de la DB affichées
- ✅ Loading states smooth
- ✅ Erreurs gérées proprement

---

### Phase 3: Widgets Avancés (3-4 heures)

**Objectif:** Widgets complexes avec charts et analytics

**Tasks:**
- [ ] Installer `recharts` pour graphiques
- [ ] Créer ChartWidget avec Line/Bar charts:
  - [ ] Performance over time
  - [ ] Multi-player comparison
- [ ] Implémenter FourFactorsWidget:
  - [ ] Shooting, Turnovers, Rebounding, FT Rate
  - [ ] Team vs Team ou Team vs League Average
- [ ] Créer HeadToHeadWidget:
  - [ ] Historique des matchs
  - [ ] Scores + dates
  - [ ] Win/Loss trends
- [ ] Implémenter PredictionWidget:
  - [ ] ML prediction % (si model existe)
  - [ ] Key factors display
- [ ] Créer AdvancedStatsWidget:
  - [ ] eFG%, TS%, Usage%, PER, etc.
  - [ ] Formatted avec JetBrains Mono
- [ ] Optimiser queries pour performances
- [ ] Ajouter caching de données (React Query optionnel)

**Critères de succès:**
- ✅ Tous les widgets fonctionnent avec vraies données
- ✅ Charts responsive et lisibles
- ✅ Performances acceptables (<2s load)
- ✅ Design cohérent entre tous les widgets

---

### Phase 4: Polish & Advanced Features (2-3 heures)

**Objectif:** UX professionnelle et features avancées

**Tasks:**
- [ ] Installer `@dnd-kit/core` pour drag & drop
- [ ] Implémenter drag & drop des widgets:
  - [ ] Drag handle sur WidgetWrapper
  - [ ] Drop zones visuelles
  - [ ] Reorder animation smooth
- [ ] Ajouter Save/Load analyses en database:
  - [ ] Créer table `user_analyses` en DB
  - [ ] Save button → INSERT/UPDATE
  - [ ] Load analyses list page
- [ ] Implémenter Share functionality:
  - [ ] Export JSON
  - [ ] Copy shareable link (si public)
  - [ ] Download as PDF (optionnel)
- [ ] Améliorer animations:
  - [ ] Widget add: fade-in + slide-up
  - [ ] Widget delete: fade-out
  - [ ] Grid reflow smooth
- [ ] Optimisations responsive:
  - [ ] Touch-friendly sur mobile
  - [ ] Swipe to delete (mobile)
  - [ ] Stacked layout pour petits écrans
- [ ] Ajouter keyboard shortcuts:
  - [ ] Cmd+S pour save
  - [ ] Cmd+K pour ajouter widget
  - [ ] Escape pour fermer modals
- [ ] Tests e2e avec Playwright (optionnel)

**Critères de succès:**
- ✅ Drag & drop fluide et intuitif
- ✅ Save/Load fonctionne parfaitement
- ✅ Share options disponibles
- ✅ Animations polies
- ✅ Mobile UX excellente

---

## 🗂️ CATALOGUE DES WIDGETS

### 1. Player Stats Widget (1x1 ou 2x1)

**Description:** Affiche les statistiques clés d'un joueur

**Configuration:**
- Player selection (autocomplete)
- Period (season, last10, last30)
- Stats to display (PPG, RPG, APG, FG%, TS%, etc.)
- Size (1x1 ou 2x1)

**Data source:** `player_game_stats` table

**Query:**
```sql
SELECT
  AVG(points) as ppg,
  AVG(rebounds_total) as rpg,
  AVG(assists) as apg
FROM player_game_stats pgs
JOIN games g ON pgs.game_id = g.game_id
WHERE pgs.player_id = ? AND g.season = '2025-26'
GROUP BY pgs.player_id
```

---

### 2. Comparison Widget (2x1 ou 2x2)

**Description:** Compare deux joueurs side-by-side

**Configuration:**
- 2 player selections
- Stats à comparer
- Period

**Data source:** `player_game_stats` table

**Display:** Bars comparatives pour chaque stat

---

### 3. Chart Widget (2x2 ou 3x2)

**Description:** Graphique de performance over time

**Configuration:**
- Player(s) selection (1-3 players)
- Metric (points, assists, rebounds, etc.)
- Timeframe (last 5, 10, 20 games)
- Chart type (line, bar)

**Library:** recharts

---

### 4. Team Standings Widget (1x2)

**Description:** Classement d'une conférence

**Configuration:**
- Conference (East/West)
- Number of teams (top 5, 10, 15)

**Data source:** `team_standings` table

---

### 5. Head-to-Head Widget (2x2)

**Description:** Historique des matchs entre 2 équipes

**Configuration:**
- Team 1 selection
- Team 2 selection
- Number of games (5, 10, 20)

**Data source:** `games` table

---

### 6. Four Factors Widget (2x1)

**Description:** Four Factors de Dean Oliver

**Configuration:**
- Team 1 vs Team 2
- Season or specific game

**Factors:**
- Shooting (eFG%)
- Turnovers (TOV%)
- Rebounding (OREB%)
- Free Throws (FT Rate)

**Data source:** `team_game_stats` table

---

### 7. Prediction Widget (1x1 ou 2x1)

**Description:** Prédiction ML pour un match

**Configuration:**
- Game selection (upcoming games)

**Display:**
- Win probability %
- Key factors
- Confidence score

**Data source:** `game_predictions` table (si existe)

---

### 8. Notes Widget (3x1 ou 2x2)

**Description:** Zone de texte libre pour notes

**Configuration:**
- Size only

**Features:**
- Markdown support (optionnel)
- Auto-save on blur
- Character count

**Storage:** localStorage ou DB

---

### 9. Advanced Stats Widget (2x2)

**Description:** Métriques avancées NBA

**Configuration:**
- Player selection
- Metrics (eFG%, TS%, Usage%, PER, etc.)
- Period

**Data source:** `player_advanced_stats` table

**Font:** JetBrains Mono pour les nombres

---

## 🎨 DESIGN SYSTEM COMPLIANCE

### Colors (Monochrome Strict)

```css
/* Backgrounds */
--color-background: #000000           /* Page background */
--color-gray-950: #0A0A0A             /* Card level 1 */
--color-gray-900: #171717             /* Card level 2, hover */
--color-gray-850: #1F1F1F             /* Main cards */
--color-gray-800: #262626             /* Borders */

/* Text */
--color-foreground: #FFFFFF           /* Primary text */
--color-gray-400: #A3A3A3             /* Secondary text */
--color-gray-500: #737373             /* Tertiary text */

/* Borders */
--color-gray-800: #262626             /* Default border */
--color-white: #FFFFFF                /* Hover border */
```

### Spacing (8px System)

```css
--space-2: 8px    /* Tight spacing */
--space-4: 16px   /* Default gap */
--space-6: 24px   /* Section spacing */
--space-8: 32px   /* Large spacing */
```

### Typography

```css
/* Fonts */
--font-family-sans: 'Inter'           /* UI text */
--font-family-mono: 'JetBrains Mono'  /* Numbers, data */

/* Sizes */
--text-sm: 0.875rem   /* 14px - Secondary */
--text-base: 1rem     /* 16px - Body */
--text-lg: 1.125rem   /* 18px - Emphasized */
--text-xl: 1.25rem    /* 20px - Titles */
```

### Shadows (Glows)

```css
--shadow-sm: 0 0 8px rgba(255, 255, 255, 0.05)
--shadow-md: 0 0 16px rgba(255, 255, 255, 0.08)
--shadow-lg: 0 0 24px rgba(255, 255, 255, 0.12)
```

### Transitions

```css
--transition-fast: 150ms ease-out
--transition-normal: 300ms ease-out
--transition-slow: 500ms ease-out
```

---

## 💾 PERSISTENCE STRATEGY

### Phase 1: localStorage

```typescript
// Save to localStorage
const saveAnalysis = (analysis: AnalysisState) => {
  localStorage.setItem('current-analysis', JSON.stringify(analysis))
}

// Load from localStorage
const loadAnalysis = (): AnalysisState | null => {
  const saved = localStorage.getItem('current-analysis')
  return saved ? JSON.parse(saved) : null
}
```

### Phase 4: PostgreSQL Database

**New table:**
```sql
CREATE TABLE user_analyses (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),  -- si auth existe
  title VARCHAR(255) NOT NULL,
  widgets JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_analyses_user ON user_analyses(user_id);
```

---

## 📦 DEPENDENCIES

### Existantes (déjà installées)
- ✅ React 19
- ✅ Next.js 16
- ✅ Tailwind CSS v4
- ✅ TypeScript
- ✅ @radix-ui/* (via shadcn/ui)
- ✅ class-variance-authority
- ✅ clsx / tailwind-merge

### Nouvelles à installer

**Phase 3 (Charts):**
```bash
npm install recharts
```

**Phase 4 (Drag & Drop):**
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Optionnel (Markdown notes):**
```bash
npm install react-markdown
```

---

## ✅ CRITÈRES DE SUCCÈS

### Phase 1 MVP
- [ ] Page `/analyse` accessible et fonctionnelle
- [ ] Peut ajouter des widgets via modal
- [ ] Peut supprimer des widgets
- [ ] Grid responsive fonctionne sur mobile/desktop
- [ ] localStorage sauvegarde et restaure l'état
- [ ] 3 widgets de base fonctionnent (Stats, Notes, Comparison)
- [ ] Design monochrome respecté
- [ ] Aucun bug critique

### Phase 2 Complete
- [ ] Tous les widgets configurables
- [ ] Données réelles de la database affichées
- [ ] Loading states professionnels
- [ ] Error handling robuste
- [ ] Performances acceptables (<2s chargement)

### Phase 3 Complete
- [ ] Charts fonctionnels et lisibles
- [ ] Tous les 9 widgets implémentés
- [ ] Données cohérentes entre widgets
- [ ] Design system respecté à 100%

### Phase 4 Complete
- [ ] Drag & drop fluide
- [ ] Save/Load en database
- [ ] Share functionality opérationnelle
- [ ] UX mobile excellente
- [ ] Animations polies
- [ ] Zéro bug connu

---

## 🚦 NEXT STEPS

### Immediate Actions

1. **Créer la structure de base:**
   - [ ] `/analyse/page.tsx`
   - [ ] `/analyse/components/` directory
   - [ ] `/analyse/types.ts`

2. **Implémenter le MVP Phase 1:**
   - [ ] Empty state + modal
   - [ ] 3 widgets de base
   - [ ] BentoGrid CSS

3. **Tester et valider:**
   - [ ] Responsive design
   - [ ] localStorage persistence
   - [ ] User flow complet

### Questions à résoudre

- **Database:** Créer table `user_analyses` maintenant ou Phase 4?
- **Auth:** Nécessaire pour sauvegarder les analyses?
- **Charts library:** recharts confirmé ou explorer alternatives?
- **Drag & drop:** Priorité haute ou Phase 4 optionnelle?

---

## 📊 ESTIMATION

**Total Time:** 8-12 heures

- Phase 1 (MVP): 1-2h
- Phase 2 (Config & Data): 2-3h
- Phase 3 (Advanced Widgets): 3-4h
- Phase 4 (Polish): 2-3h

**Complexity:** ⭐⭐⭐⭐ (4/5)

**Dependencies:** Faibles (mostly existing stack)

**Risk Level:** Faible (architecture claire, pas de tech inconnue)

---

**Status:** 🟢 Phase 1 MVP Complete
**Next:** Phase 2 - Configuration & Real Data Integration

## 📝 PHASE 1 COMPLETION NOTES

**Implementation Date:** 2025-11-20
**Time Taken:** ~2 hours
**Status:** ✅ COMPLETE

### What Works
- ✅ Empty state with "Ajouter" button
- ✅ ComponentPalette modal with 3 widgets (PlayerStats, Notes, Comparison)
- ✅ BentoGrid with 12-column responsive system
- ✅ WidgetWrapper with config ⚙️ and delete 🗑️ buttons
- ✅ PlayerStatsWidget displaying mock data (PPG, RPG, APG, FG%, 3P%, FT%)
- ✅ NotesWidget with editable textarea + character count
- ✅ ComparisonWidget showing side-by-side player comparison
- ✅ Delete widget functionality
- ✅ Editable title (click to edit, Enter/Escape to save/cancel)
- ✅ localStorage auto-save/load on mount
- ✅ Monochrome design system compliance
- ✅ Responsive grid (12 cols desktop → 6 tablet → 4 mobile)

### Known Issues
- ⚠️ TypeScript error in `api/auth/login/route.ts` (unrelated to /analyse)
- Config button (⚙️) logs to console but doesn't open modal (Phase 2 feature)

### Next Steps (Phase 2)
1. Create ConfigModal component
2. Implement widget configuration forms
3. Add database queries for real NBA data
4. Connect widgets to live data
5. Add loading states and error handling
