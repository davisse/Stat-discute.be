# DvP Visualization Enhancement Plan
## Dual Component: Radar Chart + Horizontal Bars

**Status**: Planning
**Date**: 2026-01-06
**Scope**: Single team page - focused DvP visualization

---

## Research Summary

### Design Inspiration Sources
- [Dribbble Radar Charts](https://dribbble.com/tags/radar-chart) - 90+ design examples
- [shadcn/ui Radar Charts](https://ui.shadcn.com/charts/radar) - React/Recharts patterns
- [Mantine RadarChart](https://mantine.dev/charts/radar-chart/) - Theme-aware styling
- [fffuel nnneon Generator](https://www.fffuel.co/nnneon/) - SVG glow effects inspiration

### Key Design Principles (from research)
1. **Glassmorphism elements**: Subtle blur, transparency, glowing edges
2. **Dark theme optimization**: High contrast, neon accents on dark backgrounds
3. **Microinteractions**: Smooth animations, hover states that feel responsive
4. **Gradient fills**: Semi-transparent with gradient stroke for depth
5. **Minimalism**: Clean lines, purposeful use of color

---

## Component Architecture

### File Structure
```
frontend/src/components/teams/
├── DvPTeamProfile.tsx          # NEW: Container for both visualizations
├── DvPRadarChart.tsx           # NEW: Radar/spider chart
├── DvPPositionBars.tsx         # NEW: Horizontal bar chart with ranks
├── DefenseVsPositionHeatmap.tsx # EXISTING: Keep as league-wide view
└── index.ts                    # Update exports
```

### Data Flow
```
/api/teams/dvp (existing)
    │
    └─→ DvPTeamProfile (container)
            │
            ├─→ DvPRadarChart (left side)
            │       └─ Team shape + league average overlay
            │
            └─→ DvPPositionBars (right side)
                    └─ 5 bars with rank badges + betting insight
```

---

## Component 1: DvPRadarChart (Aesthetic Radar)

### Visual Design Specification

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                          ╭──╮                               │
│                         │ PG │                              │
│                          ╰──╯                               │
│                          11.9                               │
│                           ●                                 │
│                         ╱   ╲                               │
│                       ╱       ╲                             │
│                     ╱           ╲            ╭──╮           │
│           ╭──╮    ╱               ╲         │ SG │          │
│          │ SF │──●─────────────────●────────╰──╯           │
│           ╰──╯   ╲               ╱           8.2           │
│           11.3     ╲           ╱                           │
│                      ╲       ╱                              │
│                        ╲   ╱                                │
│                          ●                                  │
│                        ╱   ╲                                │
│                      ╱       ╲                              │
│                 ╭──╮           ╭──╮                         │
│                │ PF │─────────│ C │                         │
│                 ╰──╯           ╰──╯                         │
│                 10.9           8.3                          │
│                                                             │
│          ─ ─ ─  League Average    ████ Team Defense        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Aesthetic Features

#### 1. Glow Effect (SVG Filter)
```tsx
<defs>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
    <feMerge>
      <feMergeNode in="coloredBlur"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
</defs>
```

#### 2. Gradient Fill
```tsx
<defs>
  <linearGradient id="teamGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4"/>
    <stop offset="100%" stopColor="#f97316" stopOpacity="0.15"/>
  </linearGradient>
</defs>
```

#### 3. Animated Entry
```tsx
<Radar
  animationBegin={0}
  animationDuration={1200}
  animationEasing="ease-out"
  // ...
/>
```

#### 4. Custom Grid Styling
```tsx
<PolarGrid
  stroke="rgba(255,255,255,0.1)"
  strokeDasharray="3 3"
  // Concentric circles: 3-4 levels
/>
```

#### 5. Position Labels (Custom Component)
```tsx
// Custom tick render for position labels with rank badges
<PolarAngleAxis
  dataKey="position"
  tick={({ payload, x, y, cx, cy }) => (
    <g>
      {/* Position badge */}
      <rect rx="4" fill="rgba(0,0,0,0.7)" />
      <text fill="#fff">{payload.value}</text>
      {/* Value below */}
      <text fill="#9ca3af" fontSize="10">{value}</text>
      {/* Rank indicator */}
      <circle fill={getRankColor(rank)} r="8"/>
      <text fill="#fff" fontSize="8">#{rank}</text>
    </g>
  )}
/>
```

### Scale Approach: Inverted (Smaller = Better Defense)
- **Center (0)**: Best possible defense (0 pts allowed)
- **Outer edge**: Worst defense (scale to ~18-20 pts)
- **Smaller polygon area** = better overall defense
- **League average line** as dashed pentagon overlay

### Color Scheme (matching project theme)
```typescript
const RADAR_COLORS = {
  // Team shape
  teamFill: 'url(#teamGradient)',
  teamStroke: '#ef4444',
  teamStrokeWidth: 2,
  teamGlow: 'filter: url(#glow)',

  // League average
  avgStroke: 'rgba(255,255,255,0.3)',
  avgStrokeDash: '4 4',

  // Grid
  gridStroke: 'rgba(255,255,255,0.08)',
  gridStrokeDash: '2 2',

  // Axis labels
  labelFill: '#9ca3af',

  // Rank colors (matching heatmap)
  elite: '#991b1b',    // red-900
  good: '#c2410c',     // orange-700
  average: '#52525b',  // zinc-600
  below: '#047857',    // emerald-700
  weak: '#0e7490',     // cyan-700
}
```

### Props Interface
```typescript
interface DvPRadarChartProps {
  teamData: {
    position: string
    pointsAllowed: number
    rank: number
    leagueAvg: number
  }[]
  teamAbbreviation: string
  teamId: number
  className?: string
}
```

---

## Component 2: DvPPositionBars (Horizontal Bars + Ranks)

### Visual Design Specification

```
┌─────────────────────────────────────────────────────────────┐
│  DEFENSE BY POSITION                                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PG                                                   │   │
│  │ ████████████████████▓▓▓░░░░░░░░  11.9  │ #7  │ Good │   │
│  │                      ┊                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SG                                                   │   │
│  │ ████████████░░░░░░░░░░░░░░░░░░░   8.2  │ #2  │ Elite│ 🔒│
│  │            ┊                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SF                                                   │   │
│  │ ████████████████████████████▓░░  11.3  │ #25 │ Weak │ ⚠️│
│  │                              ┊                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ PF                                                   │   │
│  │ ███████████████████▓▓▓░░░░░░░░░  10.9  │ #12 │ Good │   │
│  │                     ┊                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ C                                                    │   │
│  │ ████████████░░░░░░░░░░░░░░░░░░░   8.3  │ #4  │ Elite│ 🔒│
│  │            ┊                                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┊ = League Average                                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎯 TARGET: SF (rank #25)    🛡️ AVOID: SG, C (#2, #4) │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Bar Design Details

#### Bar Structure (per position)
```
┌──────────────────────────────────────────────────────────────┐
│  PG  │████████████████▓▓▓░░░░░│  11.9  │ #7  │ Good │       │
│      │← Filled portion →│← Empty →│      │Badge│ Tier │ Icon │
│      │   (team value)   │         │      │     │      │      │
└──────────────────────────────────────────────────────────────┘
       ↑                  ↑
       │                  └─ League average marker (dashed line)
       └─ Scale: 5 pts (left) to 15 pts (right)
```

#### Color Logic
- **Bar fill**: Gradient based on tier (elite=red, weak=cyan)
- **Empty portion**: `rgba(255,255,255,0.05)`
- **League avg marker**: Dashed white line at 30% opacity
- **Hover state**: Bar glows slightly, tooltip shows detailed info

#### Tier Badge Design
```tsx
const TierBadge = ({ rank, tier }: { rank: number; tier: string }) => (
  <div className={cn(
    "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
    tier === 'elite' && "bg-red-900/50 text-red-200 border border-red-700/50",
    tier === 'good' && "bg-orange-900/50 text-orange-200 border border-orange-700/50",
    tier === 'average' && "bg-zinc-700/50 text-zinc-300 border border-zinc-600/50",
    tier === 'below' && "bg-emerald-900/50 text-emerald-200 border border-emerald-700/50",
    tier === 'weak' && "bg-cyan-900/50 text-cyan-200 border border-cyan-700/50",
  )}>
    <span className="font-mono">#{rank}</span>
    <span>{tier}</span>
  </div>
)
```

#### Betting Insight Summary
```tsx
const BettingInsight = ({ positions }) => {
  const targets = positions.filter(p => p.rank >= 20).map(p => p.position)
  const avoids = positions.filter(p => p.rank <= 6).map(p => p.position)

  return (
    <div className="flex gap-4 p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
      {targets.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-amber-400">🎯</span>
          <span className="text-sm text-zinc-300">
            Target: <span className="text-white font-medium">{targets.join(', ')}</span>
          </span>
        </div>
      )}
      {avoids.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">🛡️</span>
          <span className="text-sm text-zinc-300">
            Avoid: <span className="text-white font-medium">{avoids.join(', ')}</span>
          </span>
        </div>
      )}
    </div>
  )
}
```

### Props Interface
```typescript
interface DvPPositionBarsProps {
  positions: {
    position: string
    pointsAllowed: number
    rank: number
    leagueAvg: number
    diffFromAvg: number
    tier: 'elite' | 'good' | 'average' | 'below' | 'weak'
  }[]
  teamAbbreviation: string
  className?: string
}
```

---

## Container Component: DvPTeamProfile

### Layout (Side by Side)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DEFENSIVE PROFILE                                │
│                     Points Allowed by Position                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────┐    ┌──────────────────────────────────┐  │
│  │                          │    │                                  │  │
│  │      RADAR CHART         │    │       HORIZONTAL BARS            │  │
│  │                          │    │                                  │  │
│  │         PG               │    │  PG  ████████▓░░░  11.9  #7      │  │
│  │        /  \              │    │  SG  █████░░░░░░   8.2  #2  🔒   │  │
│  │      SF    SG            │    │  SF  █████████░░  11.3  #25 ⚠️   │  │
│  │       \  /               │    │  PF  ███████░░░░  10.9  #12     │  │
│  │      PF──C               │    │  C   █████░░░░░░   8.3  #4  🔒   │  │
│  │                          │    │                                  │  │
│  │  ─ ─ League Avg          │    │  🎯 Target: SF  🛡️ Avoid: SG, C  │  │
│  │  ███ Team                │    │                                  │  │
│  └──────────────────────────┘    └──────────────────────────────────┘  │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (Stacked)

```
┌────────────────────────────────────┐
│       DEFENSIVE PROFILE            │
│    Points Allowed by Position      │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐  │
│  │        RADAR CHART           │  │
│  │           PG                 │  │
│  │          /  \                │  │
│  │        SF    SG              │  │
│  │         \  /                 │  │
│  │        PF──C                 │  │
│  │                              │  │
│  │  ─ ─ League Avg  ███ Team   │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │     HORIZONTAL BARS          │  │
│  │  PG  ████████░░░  11.9  #7   │  │
│  │  SG  █████░░░░░   8.2  #2 🔒 │  │
│  │  SF  ████████░░  11.3 #25 ⚠️ │  │
│  │  PF  ██████░░░░  10.9  #12  │  │
│  │  C   █████░░░░░   8.3  #4 🔒 │  │
│  │                              │  │
│  │  🎯 Target: SF               │  │
│  │  🛡️ Avoid: SG, C             │  │
│  └──────────────────────────────┘  │
│                                    │
└────────────────────────────────────┘
```

### Container Implementation
```tsx
export function DvPTeamProfile({ teamId, className }: DvPTeamProfileProps) {
  // Fetch DvP data for single team
  const [teamDvP, setTeamDvP] = useState<DvPData | null>(null)

  // Filter data for this team only
  useEffect(() => {
    fetch('/api/teams/dvp')
      .then(res => res.json())
      .then(data => {
        const teamCells = data.cells.filter(c => c.team_id === teamId)
        // Transform to component format
        setTeamDvP(transformData(teamCells, data.league_averages))
      })
  }, [teamId])

  return (
    <div className={cn("bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 sm:p-6", className)}>
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          DEFENSIVE PROFILE
        </h2>
        <p className="text-zinc-500 text-xs sm:text-sm tracking-[0.2em] uppercase mt-1">
          Points Allowed by Position
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DvPRadarChart data={teamDvP} />
        <DvPPositionBars data={teamDvP} />
      </div>
    </div>
  )
}
```

---

## Implementation Steps

### Phase 1: Setup & Data Layer
- [ ] Create data transformation utilities
- [ ] Add TypeScript interfaces
- [ ] Test data extraction for single team

### Phase 2: DvPRadarChart Component
- [ ] Set up Recharts RadarChart with custom styling
- [ ] Add SVG filters (glow, gradients)
- [ ] Implement custom position labels with rank badges
- [ ] Add league average overlay
- [ ] Style grid and axes
- [ ] Add smooth entry animation
- [ ] Test hover interactions

### Phase 3: DvPPositionBars Component
- [ ] Create horizontal bar layout
- [ ] Implement tier-based coloring
- [ ] Add league average markers
- [ ] Create rank badges
- [ ] Add betting insight summary
- [ ] Style hover states

### Phase 4: DvPTeamProfile Container
- [ ] Create responsive grid layout
- [ ] Add shared title/header
- [ ] Handle loading/error states
- [ ] Implement mobile stacked layout

### Phase 5: Integration
- [ ] Update index.ts exports
- [ ] Replace heatmap on team detail page with new component
- [ ] Keep heatmap available for league-wide view
- [ ] Test on all screen sizes

### Phase 6: Polish
- [ ] Fine-tune animations and transitions
- [ ] Verify color contrast accessibility
- [ ] Optimize for performance
- [ ] Add ARIA labels for accessibility

---

## Technical Dependencies

### Required Packages (already installed)
- `recharts` - Chart library
- `tailwindcss` - Styling
- `clsx` + `tailwind-merge` via `cn()` - Class merging

### No New Packages Needed
The implementation uses:
- Recharts RadarChart components
- Custom SVG filters (inline)
- Tailwind CSS utilities
- Existing project patterns

---

## Acceptance Criteria

### Radar Chart
- [ ] Displays 5-point spider/radar shape
- [ ] Smaller area = better defense (inverted scale)
- [ ] Glow effect on team polygon
- [ ] Gradient fill with transparency
- [ ] League average as dashed overlay
- [ ] Position labels with values and rank badges
- [ ] Smooth animation on load
- [ ] Hover shows detailed tooltip

### Horizontal Bars
- [ ] 5 bars for each position
- [ ] Color-coded by defensive tier
- [ ] Rank badges visible
- [ ] League average marker on each bar
- [ ] Betting insight summary at bottom
- [ ] Icons for elite (🔒) and weak (⚠️) positions

### Container
- [ ] Side-by-side on desktop (lg+)
- [ ] Stacked on mobile
- [ ] Consistent styling with project theme
- [ ] Loading state while fetching data

### Integration
- [ ] Replaces heatmap on single team page
- [ ] Heatmap still available for league view
- [ ] All existing functionality preserved

---

## Sources

- [Dribbble Radar Charts](https://dribbble.com/tags/radar-chart)
- [shadcn/ui Charts](https://ui.shadcn.com/charts/radar)
- [Recharts API - Radar](https://recharts.github.io/en-US/api/Radar/)
- [Mantine RadarChart](https://mantine.dev/charts/radar-chart/)
- [fffuel nnneon SVG Generator](https://www.fffuel.co/nnneon/)
- [Glassmorphism Best Practices](https://www.nngroup.com/articles/glassmorphism/)
- [Visual Cinnamon - SVG Gradients](https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient/)
