# Phase 3 - Composants Métier

Date: 2025-11-19
Statut: ✅ Complété

## Objectif

Création de 8 composants métier réutilisables pour l'application STAT-DISCUTE suivant la philosophie **anti-impulsivité** et le design system monochrome.

## Composants Créés

### 1. TrendIndicator ✅

**Fichier**: `src/components/stats/TrendIndicator.tsx`

**Description**: Indicateur visuel compact de tendance (haussière/baissière/neutre).

**Props**:
- `trend`: 'up' | 'down' | 'neutral'
- `value`: string | number (optionnel)
- `size`: 'sm' | 'md' | 'lg'
- `showIcon`: boolean (défaut: true)
- `showValue`: boolean (défaut: true si value fourni)
- `inline`: boolean (mode inline flex-row vs flex-col)

**Design**:
- Icon: Triangle ▲ (up), ▼ (down), ● (neutral)
- Colors: Vert (#10B981) pour up, Rouge (#EF4444) pour down, Gris pour neutral
- Sizes: sm (12px), md (16px), lg (20px)

**Exemple**:
```tsx
<TrendIndicator trend="up" value="+5.2" size="md" />
<TrendIndicator trend="down" value="-3%" inline />
```

---

### 2. StatCard ✅

**Fichier**: `src/components/stats/StatCard.tsx`

**Description**: Carte de statistique clé avec valeur, label, et tendance optionnelle.

**Props**:
- `label`: string
- `value`: string | number
- `subtitle`: string (optionnel)
- `trend`: 'up' | 'down' | 'neutral' (optionnel)
- `trendValue`: string | number (optionnel)
- `variant`: 'default' | 'large'
- `onClick`: fonction (optionnel)
- `loading`: boolean

**Design**:
- Base: Card variant="anthracite"
- Label: text-sm, gray-400, uppercase
- Value: text-3xl (default) ou text-4xl (large), JetBrains Mono
- Trend: TrendIndicator en coin supérieur droit
- Loading: Skeleton states

**Exemple**:
```tsx
<StatCard
  label="Points par match"
  value={28.5}
  subtitle="Sur les 10 derniers matchs"
  trend="up"
  trendValue="+2.3"
  onClick={() => showDetails()}
/>
```

---

### 3. StatsTable ✅

**Fichier**: `src/components/stats/StatsTable.tsx`

**Description**: Tableau de statistiques avec tri, filtres, et mise en évidence des valeurs.

**Props**:
- `columns`: Column[] (key, label, sortable, align, render, width)
- `data`: any[]
- `sortable`: boolean (défaut: true)
- `defaultSort`: { key, direction }
- `highlightThreshold`: { key, value, type: 'above' | 'below' }
- `onRowClick`: fonction
- `loading`: boolean
- `emptyMessage`: string

**Design**:
- Container: Card variant="default" noPadding
- Header: bg-gray-900, sortable avec icônes ↑↓
- Rows: hover bg-gray-950, border-bottom
- Cells: font-mono pour nombres, text-right par défaut
- Highlight: background rgba avec font-semibold

**Exemple**:
```tsx
<StatsTable
  columns={[
    { key: 'name', label: 'Joueur', sortable: true },
    { key: 'ppg', label: 'PPG', sortable: true, align: 'right' }
  ]}
  data={players}
  highlightThreshold={{ key: 'ppg', value: 25, type: 'above' }}
  onRowClick={(player) => showDetails(player)}
/>
```

---

### 4. PlayerCard ✅

**Fichier**: `src/components/stats/PlayerCard.tsx`

**Description**: Carte joueur avec photo, nom, équipe, et statistiques clés.

**Props**:
- `player`: Player (id, name, team, number, position, photoUrl, stats)
- `variant`: 'compact' | 'detailed'
- `onClick`: fonction
- `showStats`: boolean (défaut: true)

**Design**:
- Base: Card variant="anthracite"
- Photo: 80px × 80px (detailed), 64px (compact), fallback initiales
- Name: text-lg, white, font-semibold
- Team + Number: text-sm, gray-400
- Position: Badge gray-800, text-xs
- Stats: Grid 3 colonnes (PPG, RPG, APG)

**Exemple**:
```tsx
<PlayerCard
  player={{
    id: '123',
    name: 'LeBron James',
    team: 'LAL',
    number: 23,
    position: 'SF',
    stats: { ppg: 28.5, rpg: 7.2, apg: 8.1 }
  }}
  variant="detailed"
  onClick={() => navigate('/players/123')}
/>
```

---

### 5. TimeRangeFilter ✅

**Fichier**: `src/components/filters/TimeRangeFilter.tsx`

**Description**: Filtre de période temporelle pour analyse sur différentes fenêtres.

**Props**:
- `ranges`: TimeRange[] (label, value, days)
- `selected`: string
- `onChange`: fonction
- `customRange`: { from: Date, to: Date }
- `onCustomChange`: fonction

**Design**:
- Layout: Segmented control (boutons groupés)
- Buttons: ghost par défaut, bg-gray-850 + border white si selected
- Custom: Modal avec 2 Input type="date"
- Responsive: flex-col sur mobile

**Exemple**:
```tsx
<TimeRangeFilter
  ranges={[
    { label: '7J', value: '7d', days: 7 },
    { label: '30J', value: '30d', days: 30 },
    { label: 'Saison', value: 'season' },
    { label: 'Custom', value: 'custom' }
  ]}
  selected={timeRange}
  onChange={setTimeRange}
  onCustomChange={(from, to) => setCustomDates({ from, to })}
/>
```

---

### 6. ComparisonCard ✅

**Fichier**: `src/components/stats/ComparisonCard.tsx`

**Description**: Comparaison visuelle entre 2 joueurs ou 2 équipes.

**Props**:
- `entityA`: ComparisonItem (id, name, photoUrl, stats)
- `entityB`: ComparisonItem
- `statKeys`: StatKey[] (key, label)
- `variant`: 'horizontal' | 'vertical'

**Design**:
- Horizontal: 3 colonnes (EntityA | StatLabel + Bar | EntityB)
- Vertical: 2 colonnes stacked
- Visual bar: gradient white, proportion relative
- Highlight: valeur supérieure en font-semibold white

**Exemple**:
```tsx
<ComparisonCard
  entityA={{
    id: '1',
    name: 'LeBron James',
    stats: { ppg: 28.5, rpg: 7.2, apg: 8.1 }
  }}
  entityB={{
    id: '2',
    name: 'Kevin Durant',
    stats: { ppg: 29.1, rpg: 6.7, apg: 5.0 }
  }}
  statKeys={[
    { key: 'ppg', label: 'Points' },
    { key: 'rpg', label: 'Rebounds' }
  ]}
/>
```

---

### 7. BettingLine ✅

**Fichier**: `src/components/betting/BettingLine.tsx`

**Description**: Ligne de cote avec évolution (spread, total, moneyline).

**Props**:
- `type`: 'spread' | 'total' | 'moneyline'
- `homeTeam`: string
- `awayTeam`: string
- `line`: { current, opening, movement }
- `odds`: { home, away } (American odds)
- `onClick`: fonction

**Design**:
- Base: Card variant="anthracite"
- Type Badge: gray-700, uppercase
- Line: text-lg, font-mono, with opening strikethrough
- Movement: TrendIndicator si up/down
- Odds: font-mono, format American (+150, -110)

**Exemple**:
```tsx
<BettingLine
  type="spread"
  homeTeam="Lakers"
  awayTeam="Warriors"
  line={{ current: -5.5, opening: -6.0, movement: 'down' }}
  odds={{ home: -110, away: -110 }}
  onClick={() => showLineHistory()}
/>
```

---

### 8. ThresholdLine ✅

**Fichier**: `src/components/charts/ThresholdLine.tsx`

**Description**: Graphique avec ligne de seuil interactive pour analyser fréquence.

**Props**:
- `data`: Array<{ date, value }>
- `initialThreshold`: number (défaut: moyenne)
- `min`: number
- `max`: number
- `onChange`: (threshold, stats) => void
- `label`: string

**Design**:
- SVG Chart: 800×300px
- Threshold line: dashed white, draggable (cursor: ns-resize)
- Points: circles 4px, hover tooltip
- Stats badge: top-left, "Au-dessus: 12/20 (60%)"
- Input: top-right pour valeur exacte

**Exemple**:
```tsx
<ThresholdLine
  data={playerGames.map(g => ({ date: g.date, value: g.points }))}
  initialThreshold={25}
  min={0}
  max={50}
  label="Points"
  onChange={(threshold, stats) => {
    console.log(`${stats.above} fois au-dessus`)
  }}
/>
```

---

## Structure des Fichiers

```
frontend/src/components/
├── stats/
│   ├── StatCard.tsx
│   ├── TrendIndicator.tsx
│   ├── StatsTable.tsx
│   ├── PlayerCard.tsx
│   ├── ComparisonCard.tsx
│   └── index.ts
├── filters/
│   ├── TimeRangeFilter.tsx
│   └── index.ts
├── betting/
│   ├── BettingLine.tsx
│   └── index.ts
└── charts/
    ├── ThresholdLine.tsx
    └── index.ts
```

## Page de Test

**Fichier**: `src/app/stats-components-test/page.tsx`

Page complète affichant tous les composants avec données de test.

**URL**: `/stats-components-test`

**Contenu**:
- Section 1: StatCard (4 variants)
- Section 2: TrendIndicator (5 variants)
- Section 3: StatsTable (avec tri et highlight)
- Section 4: PlayerCard (3 joueurs)
- Section 5: TimeRangeFilter (avec custom dates)
- Section 6: ComparisonCard (horizontal + vertical)
- Section 7: BettingLine (spread + total + moneyline)
- Section 8: ThresholdLine (avec stats en temps réel)

## Build Status

✅ **Build réussi** - 0 TypeScript errors

```bash
npm run build
# ✓ Compiled successfully
# ✓ Generating static pages (19/19)
# Route: /stats-components-test ✓
```

## Conformité Design System

### Règles Respectées

✅ **Monochrome strict**: UI uniquement noir/blanc/gris
✅ **Couleurs pour données**: Vert/rouge uniquement pour valeurs numériques
✅ **Police mono**: JetBrains Mono pour chiffres
✅ **Spacing 8px**: Tous les espacements multiples de 8px
✅ **Transitions calmes**: 150ms-300ms, pas d'animations flashy
✅ **Accessibilité**: ARIA labels, keyboard navigation, focus indicators

### Philosophie Anti-Impulsivité

✅ **Pas de CTA agressifs**: Aucun bouton "PARIER MAINTENANT"
✅ **Pas de compte à rebours**: Aucune urgence artificielle
✅ **Analyse encouragée**: ThresholdLine, TimeRangeFilter, ComparisonCard
✅ **Progressive disclosure**: Informations révélées progressivement
✅ **Pas de couleurs vives**: Transitions et highlights subtils

## Intégration avec Phase 2

Tous les composants métier utilisent les composants de base Phase 2 :

- `Button` (filters/TimeRangeFilter)
- `Card` (base de tous les composants)
- `Input` (filters/TimeRangeFilter)
- `Modal` (filters/TimeRangeFilter)
- `Tooltip` (betting/BettingLine)
- `Skeleton` (stats/StatCard, stats/StatsTable)

## Prochaines Étapes

### Phase 4 : Intégration dans les Pages

1. **Page Players** : Utiliser StatsTable + PlayerCard
2. **Page Teams** : Utiliser StatsTable + ComparisonCard
3. **Page Betting** : Utiliser BettingLine + ThresholdLine
4. **Page Player Props** : Utiliser StatCard + ThresholdLine + TimeRangeFilter

### Améliorations Futures

- [ ] Virtualization pour StatsTable (si >100 rows)
- [ ] Export CSV depuis StatsTable
- [ ] Print mode pour ComparisonCard
- [ ] Annotations sur ThresholdLine
- [ ] Multi-threshold support pour ThresholdLine

## Documentation Technique

### Types Exportés

Tous les types sont exportés depuis les fichiers index.ts :

```tsx
import {
  StatCard,
  TrendIndicator,
  StatsTable,
  PlayerCard,
  ComparisonCard,
  type StatCardProps,
  type Column,
  type Player,
} from '@/components/stats'

import {
  TimeRangeFilter,
  defaultTimeRanges,
  type TimeRange,
} from '@/components/filters'

import { BettingLine } from '@/components/betting'
import { ThresholdLine, type ThresholdStats } from '@/components/charts'
```

### Performances

- **Memoization**: React.memo appliqué sur StatsTable et ThresholdLine
- **useMemo**: Calculs coûteux (tri, stats) memoïsés
- **useCallback**: Handlers memoïsés pour éviter re-renders
- **Lazy loading**: Composants prêts pour code splitting

### Tests

Pour tester les composants :

1. Lancer dev server : `npm run dev`
2. Naviguer vers : `http://localhost:3000/stats-components-test`
3. Tester interactions :
   - Tri sur StatsTable
   - Drag threshold sur ThresholdLine
   - Custom dates sur TimeRangeFilter
   - Click sur PlayerCard/BettingLine

### Accessibilité

Tous les composants respectent WCAG 2.1 AA :

- **Keyboard navigation** : Tab, Enter, Espace, Escape
- **ARIA labels** : role, aria-label, aria-checked, aria-hidden
- **Focus indicators** : ring-2 ring-white visible
- **Screen reader** : Descriptions contextuelles pour tous les états

---

**Signature**: Phase 3 complétée avec succès ✅
**Date**: 2025-11-19
**Composants**: 8/8 créés et documentés
**Build**: ✅ 0 errors
**Test page**: ✅ /stats-components-test accessible
