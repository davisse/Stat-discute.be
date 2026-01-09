# Plan d'implémentation: ShotDistributionProfile Component

**Date**: 2026-01-08
**Status**: En attente de validation
**Priorité**: Haute
**Estimation**: 4-5 fichiers, ~600 lignes de code

---

## 1. Vision Produit

### Objectif
Créer un composant qui visualise comment une équipe **force les adversaires à redistribuer leurs tirs** par position. Complément du DVP existant (efficacité) avec focus sur la **signature défensive** (distribution).

### Valeur pour l'utilisateur (parieur)
- Identifier les matchups favorables par position
- Comprendre les tendances de jeu forcées par chaque défense
- Obtenir des tips actionables pour les paris player props

### Positionnement
**Avant** le DvPTeamProfile existant dans `/teams/[teamId]`

---

## 2. Design System & Principes UX/UI

### 2.1 Titre Immersif Cinématique

Cohérent avec les autres composants de la page (StadiumSpotlightHero, DvPTeamProfile):

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│              SHOT DISTRIBUTION                                 │  ← 3xl/4xl font-black
│                 PROFILE                                        │     tracking-tight
│                                                                │
│     How this defense reshapes opponent shot selection          │  ← text-sm tracking-[0.2em]
│                                                                │     uppercase text-zinc-400
└────────────────────────────────────────────────────────────────┘
```

**Règles typographiques:**
- Titre principal: `text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white`
- Sous-titre: `text-xs sm:text-sm tracking-[0.2em] uppercase text-zinc-400 mt-2`
- Centré sur toutes les breakpoints

### 2.2 Mobile-First Approach

**Breakpoints (Tailwind):**
- `base` (0-639px): Mobile portrait
- `sm` (640px+): Mobile landscape / Small tablet
- `md` (768px+): Tablet
- `lg` (1024px+): Desktop
- `xl` (1280px+): Large desktop

**Stratégie Mobile-First:**
```css
/* Mobile par défaut */
.container { padding: 1rem; }

/* Progressivement enrichi */
@screen sm { .container { padding: 1.5rem; } }
@screen lg { .container { padding: 2rem; } }
```

### 2.3 Palette Couleurs

| État | Couleur | Tailwind | Usage |
|------|---------|----------|-------|
| Bloque (≤-2%) | `#22c55e` | `text-green-500` | Position limitée |
| Expose (≥+2%) | `#ef4444` | `text-red-500` | Position exposée |
| Neutre | `#71717a` | `text-zinc-500` | Écart faible |
| Background | `rgba(24,24,27,0.5)` | `bg-zinc-900/50` | Card background |
| Border | `#3f3f46` | `border-zinc-700` | Séparateurs |
| Accent bar | Team color | Dynamic | Barre de l'équipe |

### 2.4 Espacements (8px Grid)

```
Container padding:   p-4 sm:p-6 lg:p-8     (16/24/32px)
Section gaps:        gap-4 sm:gap-6        (16/24px)
Element margins:     mt-3 sm:mt-4          (12/16px)
Inner padding:       p-3 sm:p-4            (12/16px)
```

### 2.5 Ombres & Bordures

```
Card:           border border-zinc-800 rounded-xl
Inner card:     border border-zinc-700/50 rounded-lg
Hover states:   hover:border-zinc-600 transition-colors
```

---

## 3. Architecture des Composants

### 3.1 Hiérarchie

```
ShotDistributionProfile (container)
├── Header (titre cinématique + badge profil)
├── ShotDistributionChart (visualisation principale)
│   ├── PositionBar × 5 (PG, SG, SF, PF, C)
│   └── LeagueAverageLine
├── DefensiveInsights (panel insights)
│   ├── ForcesToSection
│   ├── BlocksFromSection
│   └── BettingTip
└── StatsTable (expandable sur mobile)
```

### 3.2 Fichiers à créer

```
frontend/src/
├── app/api/teams/[teamId]/shot-distribution/
│   └── route.ts                              # API endpoint
├── components/teams/
│   ├── ShotDistributionProfile.tsx           # Container principal
│   ├── ShotDistributionChart.tsx             # Visualisation barres
│   └── index.ts                              # Update exports
└── lib/
    └── queries.ts                            # Add getTeamShotDistribution()
```

---

## 4. Spécifications Détaillées par Composant

### 4.1 ShotDistributionProfile.tsx (Container)

**Responsabilités:**
- Fetch data depuis API
- Gestion états (loading, error, data)
- Layout responsive
- Coordination des sous-composants

**Structure JSX Mobile-First:**

```tsx
<div className="bg-zinc-900/50 border border-zinc-800 rounded-xl">
  {/* Header Cinématique */}
  <div className="text-center pt-6 pb-4 sm:pt-8 sm:pb-6 px-4">
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
      SHOT DISTRIBUTION
    </h2>
    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white -mt-1">
      PROFILE
    </h3>
    <p className="text-xs sm:text-sm tracking-[0.2em] uppercase text-zinc-400 mt-3">
      How this defense reshapes opponent shot selection
    </p>

    {/* Badge Profil Défensif */}
    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2
                    bg-zinc-800/80 border border-zinc-700 rounded-full">
      <span className="text-lg">🛡️</span>
      <span className="text-sm font-bold tracking-wider text-white uppercase">
        {profileType}
      </span>
    </div>
  </div>

  {/* Content - Stack mobile, Side-by-side desktop */}
  <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">

      {/* Chart - 3 colonnes sur desktop */}
      <div className="lg:col-span-3">
        <ShotDistributionChart data={positionData} teamColor={teamColor} />
      </div>

      {/* Insights - 2 colonnes sur desktop */}
      <div className="lg:col-span-2">
        <DefensiveInsights insights={insights} />
      </div>

    </div>

    {/* Stats Table - Expandable sur mobile */}
    <StatsTable data={positionData} defaultExpanded={false} />
  </div>

  {/* Footer */}
  <div className="px-4 sm:px-6 lg:px-8 py-4 border-t border-zinc-800 text-center">
    <p className="text-xs text-zinc-500">
      Distribution des FGA adverses vs moyenne ligue • {gamesPlayed} matchs analysés
    </p>
  </div>
</div>
```

### 4.2 ShotDistributionChart.tsx (Visualisation)

**Mobile (base):** Barres horizontales empilées
**Desktop (lg+):** Barres verticales côte à côte

```tsx
{/* Mobile: Horizontal stacked bars */}
<div className="lg:hidden space-y-3">
  {positions.map(pos => (
    <div key={pos.position} className="flex items-center gap-3">
      {/* Position label */}
      <div className="w-8 text-center">
        <span className="text-sm font-bold text-white">{pos.position}</span>
      </div>

      {/* Bar container */}
      <div className="flex-1 h-8 bg-zinc-800 rounded-lg relative overflow-hidden">
        {/* Actual bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500"
          style={{
            width: `${pos.fgaPct * 3}%`,  // Scale for visibility
            backgroundColor: getBarColor(pos.deviation)
          }}
        />
        {/* League avg line */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white/50"
          style={{ left: `${leagueAvg[pos.position] * 3}%` }}
        />
      </div>

      {/* Stats */}
      <div className="w-20 text-right">
        <span className="text-sm font-mono text-white">{pos.fgaPct.toFixed(1)}%</span>
        <span className={cn(
          "ml-2 text-xs font-mono",
          pos.deviation > 0 ? "text-red-400" : "text-green-400"
        )}>
          {pos.deviation > 0 ? '+' : ''}{pos.deviation.toFixed(1)}
        </span>
      </div>
    </div>
  ))}
</div>

{/* Desktop: Vertical bars */}
<div className="hidden lg:flex items-end justify-center gap-6 h-64">
  {positions.map(pos => (
    <div key={pos.position} className="flex flex-col items-center gap-2">
      {/* Deviation badge */}
      <div className={cn(
        "px-2 py-0.5 rounded text-xs font-mono font-bold",
        getDeviationBadgeClass(pos.deviation)
      )}>
        {pos.deviation > 0 ? '+' : ''}{pos.deviation.toFixed(1)}%
      </div>

      {/* Bar */}
      <div className="relative w-14 bg-zinc-800 rounded-t-lg" style={{ height: '200px' }}>
        <div
          className="absolute bottom-0 inset-x-0 rounded-t-lg transition-all duration-700"
          style={{
            height: `${(pos.fgaPct / maxFgaPct) * 100}%`,
            backgroundColor: teamColor
          }}
        />
        {/* League avg line */}
        <div
          className="absolute inset-x-0 h-0.5 bg-zinc-400"
          style={{ bottom: `${(leagueAvg[pos.position] / maxFgaPct) * 100}%` }}
        >
          <span className="absolute -right-12 -top-2 text-[10px] text-zinc-500">
            LIG
          </span>
        </div>
      </div>

      {/* Percentage */}
      <span className="text-lg font-bold font-mono text-white">
        {pos.fgaPct.toFixed(1)}%
      </span>

      {/* Position label */}
      <span className="text-sm font-bold text-zinc-400">{pos.position}</span>
    </div>
  ))}
</div>
```

### 4.3 DefensiveInsights (Panel Insights)

```tsx
<div className="space-y-4">
  {/* Forces To Section */}
  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
    <h4 className="text-xs uppercase tracking-wider text-red-400 mb-2">
      Force les tirs vers
    </h4>
    <div className="flex flex-wrap gap-2">
      {insights.forcesTo.map(item => (
        <span key={item.position}
              className="px-3 py-1 bg-red-500/20 rounded-full text-sm font-mono text-white">
          {item.position} <span className="text-red-400">+{item.deviation.toFixed(1)}%</span>
        </span>
      ))}
    </div>
  </div>

  {/* Blocks From Section */}
  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
    <h4 className="text-xs uppercase tracking-wider text-green-400 mb-2">
      Bloque les tirs de
    </h4>
    <div className="flex flex-wrap gap-2">
      {insights.blocksFrom.map(item => (
        <span key={item.position}
              className="px-3 py-1 bg-green-500/20 rounded-full text-sm font-mono text-white">
          {item.position} <span className="text-green-400">{item.deviation.toFixed(1)}%</span>
        </span>
      ))}
    </div>
  </div>

  {/* Betting Tip */}
  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
    <div className="flex items-start gap-3">
      <span className="text-2xl">💡</span>
      <div>
        <h4 className="text-xs uppercase tracking-wider text-amber-400 mb-1">
          Tip Paris
        </h4>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {insights.bettingTip}
        </p>
      </div>
    </div>
  </div>
</div>
```

### 4.4 StatsTable (Expandable Mobile)

```tsx
<div className="mt-6">
  {/* Toggle button - Mobile only */}
  <button
    className="lg:hidden w-full flex items-center justify-between p-3
               bg-zinc-800/50 rounded-lg text-zinc-400 hover:text-white transition-colors"
    onClick={() => setExpanded(!expanded)}
  >
    <span className="text-sm uppercase tracking-wider">Stats détaillées</span>
    <ChevronDown className={cn("w-5 h-5 transition-transform", expanded && "rotate-180")} />
  </button>

  {/* Table - Always visible on desktop, expandable on mobile */}
  <div className={cn(
    "overflow-hidden transition-all duration-300",
    "lg:max-h-none lg:opacity-100 lg:mt-4",
    expanded ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0 lg:max-h-none lg:opacity-100"
  )}>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="py-2 px-3 text-left text-xs text-zinc-500 uppercase">Pos</th>
            <th className="py-2 px-3 text-right text-xs text-zinc-500 uppercase">FGA</th>
            <th className="py-2 px-3 text-right text-xs text-zinc-500 uppercase">FGM</th>
            <th className="py-2 px-3 text-right text-xs text-zinc-500 uppercase">FG%</th>
            <th className="py-2 px-3 text-right text-xs text-zinc-500 uppercase">FGA%</th>
            <th className="py-2 px-3 text-right text-xs text-zinc-500 uppercase">vs LIG</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(pos => (
            <tr key={pos.position} className="border-b border-zinc-800 hover:bg-zinc-800/50">
              <td className="py-2 px-3 font-bold text-white">{pos.position}</td>
              <td className="py-2 px-3 text-right font-mono text-zinc-300">{pos.fga}</td>
              <td className="py-2 px-3 text-right font-mono text-zinc-300">{pos.fgm}</td>
              <td className="py-2 px-3 text-right font-mono text-zinc-300">{pos.fgPct.toFixed(1)}%</td>
              <td className="py-2 px-3 text-right font-mono text-white font-bold">{pos.fgaPct.toFixed(1)}%</td>
              <td className={cn(
                "py-2 px-3 text-right font-mono font-bold",
                pos.deviation >= 2 ? "text-red-400" :
                pos.deviation <= -2 ? "text-green-400" : "text-zinc-400"
              )}>
                {pos.deviation > 0 ? '+' : ''}{pos.deviation.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
```

---

## 5. API Endpoint

### 5.1 Route: `/api/teams/[teamId]/shot-distribution`

```typescript
// frontend/src/app/api/teams/[teamId]/shot-distribution/route.ts

import { NextResponse } from 'next/server'
import { getTeamShotDistribution } from '@/lib/queries'

export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const teamId = parseInt(params.teamId)
    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 })
    }

    const data = await getTeamShotDistribution(teamId)

    if (!data) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching shot distribution:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 5.2 Query: `getTeamShotDistribution()`

```typescript
// Add to frontend/src/lib/queries.ts

interface ShotDistributionPosition {
  position: string
  fga: number
  fgm: number
  fgPct: number
  fgaPct: number
  leagueAvgPct: number
  deviation: number
}

interface ShotDistributionData {
  teamId: number
  teamAbbreviation: string
  gamesPlayed: number
  profile: 'GUARDS-KILLER' | 'FORWARDS-FOCUSED' | 'CENTER-FOCUSED' | 'BALANCED'
  positions: ShotDistributionPosition[]
  insights: {
    forcesTo: { position: string; deviation: number }[]
    blocksFrom: { position: string; deviation: number }[]
    bettingTip: string
  }
}

export async function getTeamShotDistribution(teamId: number): Promise<ShotDistributionData | null> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH team_position_shots AS (
      SELECT
        t.team_id,
        t.abbreviation,
        p.position,
        SUM(pgs.fg_attempted) as fga,
        SUM(pgs.fg_made) as fgm,
        COUNT(DISTINCT g.game_id) as games
      FROM teams t
      JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
      JOIN player_game_stats pgs ON g.game_id = pgs.game_id AND pgs.team_id != t.team_id
      JOIN players p ON pgs.player_id = p.player_id
      WHERE g.season = $1 AND g.game_status = 'Final'
        AND p.position IN ('PG', 'SG', 'SF', 'PF', 'C')
        AND t.team_id = $2
      GROUP BY t.team_id, t.abbreviation, p.position
    ),
    team_totals AS (
      SELECT team_id, SUM(fga) as total_fga, MAX(games) as games_played
      FROM team_position_shots
      GROUP BY team_id
    ),
    league_avg AS (
      SELECT
        p.position,
        ROUND(AVG(pgs.fg_attempted)::numeric /
          (SELECT AVG(total) FROM (
            SELECT SUM(pgs2.fg_attempted) as total
            FROM player_game_stats pgs2
            JOIN games g2 ON pgs2.game_id = g2.game_id
            JOIN players p2 ON pgs2.player_id = p2.player_id
            WHERE g2.season = $1 AND g2.game_status = 'Final'
              AND p2.position IN ('PG', 'SG', 'SF', 'PF', 'C')
            GROUP BY g2.game_id, CASE WHEN g2.home_team_id = pgs2.team_id THEN g2.away_team_id ELSE g2.home_team_id END
          ) t) * 100, 1) as avg_pct
      FROM player_game_stats pgs
      JOIN games g ON pgs.game_id = g.game_id
      JOIN players p ON pgs.player_id = p.player_id
      WHERE g.season = $1 AND g.game_status = 'Final'
        AND p.position IN ('PG', 'SG', 'SF', 'PF', 'C')
      GROUP BY p.position
    )
    SELECT
      tps.team_id,
      tps.abbreviation,
      tt.games_played,
      tps.position,
      tps.fga,
      tps.fgm,
      ROUND(tps.fgm::numeric / NULLIF(tps.fga, 0) * 100, 1) as fg_pct,
      ROUND(tps.fga::numeric / tt.total_fga * 100, 1) as fga_pct,
      COALESCE(la.avg_pct, 20.0) as league_avg_pct,
      ROUND(tps.fga::numeric / tt.total_fga * 100 - COALESCE(la.avg_pct, 20.0), 1) as deviation
    FROM team_position_shots tps
    JOIN team_totals tt ON tps.team_id = tt.team_id
    LEFT JOIN league_avg la ON tps.position = la.position
    ORDER BY
      CASE tps.position
        WHEN 'PG' THEN 1
        WHEN 'SG' THEN 2
        WHEN 'SF' THEN 3
        WHEN 'PF' THEN 4
        WHEN 'C' THEN 5
      END
  `, [currentSeason, teamId])

  if (result.rows.length === 0) return null

  const positions = result.rows.map(row => ({
    position: row.position,
    fga: parseInt(row.fga),
    fgm: parseInt(row.fgm),
    fgPct: parseFloat(row.fg_pct),
    fgaPct: parseFloat(row.fga_pct),
    leagueAvgPct: parseFloat(row.league_avg_pct),
    deviation: parseFloat(row.deviation)
  }))

  // Determine profile
  const profile = determineDefensiveProfile(positions)

  // Generate insights
  const insights = generateInsights(positions, result.rows[0].abbreviation)

  return {
    teamId: parseInt(result.rows[0].team_id),
    teamAbbreviation: result.rows[0].abbreviation,
    gamesPlayed: parseInt(result.rows[0].games_played),
    profile,
    positions,
    insights
  }
}

function determineDefensiveProfile(positions: ShotDistributionPosition[]): string {
  const guards = positions.filter(p => ['PG', 'SG'].includes(p.position))
  const forwards = positions.filter(p => ['SF', 'PF'].includes(p.position))
  const center = positions.find(p => p.position === 'C')

  const maxGuardDev = Math.max(...guards.map(p => Math.abs(p.deviation)))
  const maxForwardDev = Math.max(...forwards.map(p => Math.abs(p.deviation)))
  const centerDev = Math.abs(center?.deviation || 0)

  if (maxGuardDev >= 2.5 && maxGuardDev > maxForwardDev && maxGuardDev > centerDev) {
    return 'GUARDS-KILLER'
  }
  if (maxForwardDev >= 2.5 && maxForwardDev > maxGuardDev && maxForwardDev > centerDev) {
    return 'FORWARDS-FOCUSED'
  }
  if (centerDev >= 2.5 && centerDev > maxGuardDev && centerDev > maxForwardDev) {
    return 'CENTER-FOCUSED'
  }
  return 'BALANCED'
}

function generateInsights(positions: ShotDistributionPosition[], abbr: string) {
  const forcesTo = positions
    .filter(p => p.deviation >= 2)
    .sort((a, b) => b.deviation - a.deviation)
    .map(p => ({ position: p.position, deviation: p.deviation }))

  const blocksFrom = positions
    .filter(p => p.deviation <= -2)
    .sort((a, b) => a.deviation - b.deviation)
    .map(p => ({ position: p.position, deviation: p.deviation }))

  // Generate betting tip
  let bettingTip = ''
  if (forcesTo.length > 0) {
    const forcedPositions = forcesTo.map(p => p.position).join(' et ')
    bettingTip = `Miser sur les ${forcedPositions} contre ${abbr}. `
  }
  if (blocksFrom.length > 0) {
    const blockedPositions = blocksFrom.map(p => p.position).join('/')
    bettingTip += `Éviter les ${blockedPositions} (volume limité).`
  }
  if (!bettingTip) {
    bettingTip = `Défense équilibrée, pas de matchup évident à exploiter.`
  }

  return { forcesTo, blocksFrom, bettingTip }
}
```

---

## 6. Intégration dans la Page

### Modification de `/teams/[teamId]/page.tsx`

```tsx
// Ajouter l'import
import { ShotDistributionProfile } from '@/components/teams'

// Dans le JSX, AVANT DvPTeamProfile:

{/* Shot Distribution Profile - NEW */}
<div className="mt-6 sm:mt-8 -mx-2 sm:mx-0">
  <ShotDistributionProfile
    teamId={teamStats.team_id}
    teamAbbreviation={teamStats.abbreviation}
  />
</div>

{/* Defense vs Position Profile (Radar + Bars) - EXISTING */}
<div className="mt-6 sm:mt-8 -mx-2 sm:mx-0">
  <DvPTeamProfile
    teamId={teamStats.team_id}
    teamAbbreviation={teamStats.abbreviation}
  />
</div>
```

---

## 7. Animations & Micro-interactions

### 7.1 Entrée du composant
```tsx
// Framer Motion pour entrance animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
```

### 7.2 Barres animées
```tsx
// CSS transition pour les barres
transition-all duration-700 ease-out

// Ou Framer Motion pour plus de contrôle
<motion.div
  initial={{ height: 0 }}
  animate={{ height: `${percentage}%` }}
  transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
/>
```

### 7.3 Hover states
```tsx
// Cards hover
hover:border-zinc-600 hover:bg-zinc-800/70 transition-all duration-200

// Table rows
hover:bg-zinc-800/50 transition-colors
```

---

## 8. Accessibilité

### 8.1 ARIA Labels
```tsx
<div role="img" aria-label={`Shot distribution: ${positions.map(p =>
  `${p.position} ${p.fgaPct}%`).join(', ')}`}>
```

### 8.2 Color Contrast
- Tous les textes respectent WCAG AA (4.5:1 minimum)
- Ne pas utiliser la couleur seule pour transmettre l'information (+ icônes/texte)

### 8.3 Keyboard Navigation
- Table navigable au clavier
- Bouton expand/collapse focusable

---

## 9. Tests

### 9.1 Unit Tests (Vitest)
- `getTeamShotDistribution()` - Query returns correct structure
- `determineDefensiveProfile()` - Profile classification logic
- `generateInsights()` - Insight generation logic

### 9.2 Component Tests
- Renders correctly with mock data
- Loading state displays
- Error state displays
- Mobile/desktop layouts

### 9.3 E2E (Playwright)
- Navigate to team page
- Verify component loads
- Verify data matches API response
- Test expand/collapse on mobile

---

## 10. Checklist Pré-Implémentation

- [ ] Wireframe validé par l'utilisateur
- [ ] Plan validé par l'utilisateur
- [ ] Design tokens disponibles (`team-colors.ts`)
- [ ] API endpoint route planifiée
- [ ] Query SQL testée sur données réelles
- [ ] Breakpoints mobile-first définis
- [ ] Animations définies

---

## 11. Ordre d'Implémentation

1. **Phase 1: Backend** (~30min)
   - [ ] Créer query `getTeamShotDistribution()` dans `queries.ts`
   - [ ] Créer API route `/api/teams/[teamId]/shot-distribution`
   - [ ] Tester avec curl/Postman

2. **Phase 2: Composants de base** (~45min)
   - [ ] Créer `ShotDistributionProfile.tsx` (container)
   - [ ] Créer `ShotDistributionChart.tsx` (visualisation)
   - [ ] Ajouter exports dans `index.ts`

3. **Phase 3: UI Polish** (~30min)
   - [ ] Titre cinématique
   - [ ] Badges profil défensif
   - [ ] Panel insights
   - [ ] Stats table expandable

4. **Phase 4: Animations** (~15min)
   - [ ] Entrance animation
   - [ ] Bar growth animation
   - [ ] Hover states

5. **Phase 5: Intégration** (~15min)
   - [ ] Ajouter à page équipe
   - [ ] Test mobile responsive
   - [ ] Test avec différentes équipes

6. **Phase 6: Deploy & Test** (~15min)
   - [ ] Build local
   - [ ] Deploy production
   - [ ] Vérifier sur mobile réel

---

**Total estimé**: ~2h30 d'implémentation

**Prêt pour validation avant implémentation.**
