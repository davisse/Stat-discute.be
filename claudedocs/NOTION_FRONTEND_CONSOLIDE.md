# 🖥️ Frontend - Stack & Composants

Page consolidée regroupant toute la documentation frontend du projet Stat Discute.

---

## Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 16 | App Router, Server Components |
| React | 19 | UI Framework |
| Tailwind CSS | 4 | Styling avec CSS custom properties |
| TypeScript | 5.x | Type safety |
| PostgreSQL | 18 | Base de données (via pg pool) |

---

## Design System

### Tokens
- **Spacing**: Grille 8px (`--space-1` = 4px, `--space-2` = 8px, etc.)
- **Border Radius**: 8px, 12px, 16px, 24px
- **Fonts**: Inter (UI), JetBrains Mono (données numériques)
- **Colors**: Monochrome (noir/blanc/gris), couleurs uniquement pour data

### Patterns
- `class-variance-authority` (cva) pour variants de composants
- CSS custom properties: `--color-gray-850`, `--space-4`
- WCAG 2.1 AA accessibility compliance

---

## Composants Core (20)

### UI Base

| Composant | Props | Usage |
|-----------|-------|-------|
| Card | variant, className, children | Container principal |
| Modal | isOpen, onClose, title, size | Dialogs et overlays |
| Button | variant, size, disabled | Actions utilisateur |
| Badge | variant, size | Labels et status |
| Skeleton | className | Loading states |

### Stats & Data

| Composant | Props | Usage |
|-----------|-------|-------|
| StatCard | label, value, trend, icon | Métriques clés |
| TrendIndicator | value, format | Tendances ↑↓ |
| PercentageBar | value, max, color | Progress bars |
| ComparisonStat | home, away, label | Comparaisons H/A |

### Charts

| Composant | Props | Usage |
|-----------|-------|-------|
| BarChart | data, xKey, yKey, height | Histogrammes |
| ROIChart | thresholds, highlight | ROI par seuil |
| ModelComparisonChart | models | Comparaison ML |
| FeatureImportanceChart | features, max | Importance features |

### Betting & Props

| Composant | Props | Usage |
|-----------|-------|-------|
| BettingLine | type, value, odds | Lignes de paris |
| PropsAnalysisTable | props, onSelect | Table props joueurs |
| PredictionsTable | predictions, showDetails | Prédictions ML |
| PropAnalysisModal | prop, onClose | Détails prop |

### Layout

| Composant | Props | Usage |
|-----------|-------|-------|
| AppLayout | children | Layout principal |
| PageHeader | title, subtitle, actions | En-tête pages |
| Navigation | items, current | Nav horizontale |

---

## Autres Composants (61)

### Par Dossier

**`analysis/`** AdvancedFilters, InsightCard, QuarterBreakdown, ScatterPlot, TeamComparisonCard

**`betting/`** OddsMovementChart, OddsTerminalFilters, OddsTerminalTable, ValueIndicator

**`chat/`** ChatInterface, ChatMessage, MessageInput

**`dashboard/`** DashboardCard, QuickStats, RecentGames

**`defense/`** CourtDefenseZones, DefenseHeatmap, PositionDefenseCard

**`filters/`** DateRangeFilter, SeasonSelector, TeamFilter

**`landing/`** FeatureCard, HeroSection, TestimonialCard

**`ml/`** ConfidenceGauge, ModelMetrics, PredictionCard

**`mobile/`** MobileNav, SwipeableCard, TouchSlider

**`player-props/`** GameCardsSelector, PlayerCard, PropPerformanceBarChart, PropValueBadge

**`stats/`** GameScore, LeaderboardTable, PlayerStatsRow, SeasonAverages, TeamStatsGrid

---

## Pages par Section

### Betting (4 pages)
- `/betting/odds-terminal` - Terminal temps réel
- `/betting/odds-movement` - Mouvements de cotes
- `/player-props/tonight` - Props du soir
- `/games` - Liste des matchs

### Analytics (3 pages)
- `/ml-analysis` - Prédictions ML totals
- `/analysis` - Analyse avancée
- `/chat` - Chat IA

### Admin (2 pages)
- `/admin` - Dashboard admin
- `/prototype/storytelling` - Prototype narratif

### Core (3 pages)
- `/` - Homepage
- `/players` - Stats joueurs
- `/teams` - Standings équipes

---

## Conventions Critiques

### Server Components (par défaut)

```tsx
export default async function Page() {
  const data = await fetchData()
  return <AppLayout>{/* content */}</AppLayout>
}
```

### Client Components (quand interactif)

```tsx
'use client'
export default function Page() {
  const [state, setState] = useState()
  return <AppLayout>{/* interactive */}</AppLayout>
}
```

### Season-Aware Queries (OBLIGATOIRE)

```sql
SELECT * FROM player_game_stats pgs
JOIN games g ON pgs.game_id = g.game_id
WHERE g.season = $1  -- TOUJOURS filtrer par saison
```

### Type Casting PostgreSQL

```tsx
// ROUND() retourne numeric → string en node-postgres
const value = parseFloat(row.avg_points).toFixed(1)
```

---

## Structure des Fichiers

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Groupe dashboard
│   ├── admin/              # Admin pages
│   ├── api/                # API routes
│   ├── betting/            # Betting pages
│   ├── ml-analysis/        # ML pages
│   └── player-props/       # Props pages
├── components/
│   ├── analysis/           # Analyse avancée
│   ├── betting/            # Betting components
│   ├── charts/             # Visualisations
│   ├── layout/             # AppLayout, etc.
│   ├── ml/                 # ML components
│   ├── player-props/       # Props components
│   ├── stats/              # Stats components
│   └── ui/                 # UI primitives
└── lib/
    ├── db.ts               # PostgreSQL pool
    ├── queries.ts          # Database queries
    └── design-tokens.ts    # Design tokens
```

---

## Notes de Migration

Cette page consolide:
- 📱 Pages Frontend (ancien)
- 🧩 Composants Frontend (ancien)

Les anciennes pages peuvent être supprimées après vérification.
