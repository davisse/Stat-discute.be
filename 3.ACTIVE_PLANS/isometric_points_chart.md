# Isometric Points Chart - Implementation Plan

## Overview
3D isometric chart component for the player individual page, visualizing player points through season games in a **GitHub Skyline aesthetic**.

**Target Location**: `/frontend/src/app/(dashboard)/players/[playerId]/page.tsx` - Section 03.5 (after Current Form)

---

## Reference Aesthetic: GitHub Skyline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│    ┌────────────────────────────────────────┐   ┌───────────────────┐  │
│    │                                        │   │  SEASON STATS     │  │
│    │         ▓▓                             │   │                   │  │
│    │        ▓▓▓▓    ▓▓                      │   │  Total Points     │  │
│    │   ▒▒  ▓▓▓▓▓▓  ▓▓▓▓   ▒▒               │   │  1,847            │  │
│    │  ▒▒▒▒ ▓▓▓▓▓▓ ▓▓▓▓▓▓ ▒▒▒▒  ░░          │   │                   │  │
│    │ ▒▒▒▒▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒░░░░  ░░    │   │  Best Game        │  │
│    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │   │  45 pts vs LAL    │  │
│    │────────────────────────────────────   │   │                   │  │
│    │ Oct    Nov    Dec    Jan    Feb       │   │  Games Played     │  │
│    │                                        │   │  67 / 82          │  │
│    └────────────────────────────────────────┘   │                   │  │
│                                                  │  Avg Points       │  │
│              [2D View] [3D View]                │  27.6 PPG         │  │
│                                                  └───────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key Visual Elements**:
- Green gradient bars (light → dark based on points intensity)
- Isometric grid floor with month labels
- Stats panel on the right side
- 2D/3D toggle option
- Drag to rotate, scroll to zoom (OrbitControls)

---

## Technical Approach

### Recommended: React Three Fiber

**Why R3F**:
- Real 3D with rotation/zoom capability
- Well-documented for GitHub Skyline-style visualizations
- Active ecosystem (pmndrs)
- Works with existing React patterns

**Dependencies**:
```bash
npm install three @react-three/fiber @react-three/drei
```

**TypeScript Types**:
```bash
npm install -D @types/three
```

---

## Component Architecture

```
frontend/src/components/charts/IsometricPointsChart/
├── index.tsx                 # Main export
├── IsometricPointsChart.tsx  # Container with Canvas
├── Scene.tsx                 # 3D scene setup (camera, lights)
├── PointsBars.tsx            # Instanced bars with colors
├── GridFloor.tsx             # Base grid with month labels
├── StatsPanel.tsx            # Side panel with season stats
├── GameTooltip.tsx           # Hover tooltip for bar details
└── types.ts                  # TypeScript interfaces
```

---

## Data Structure

### Input Interface
```typescript
// types.ts
export interface IsometricChartGame {
  game_id: string
  game_date: string        // "2024-10-22"
  points: number           // 0-60+ range
  played: boolean
  opponent: string         // "LAL"
  result: 'W' | 'L'
  home_away: 'home' | 'away'
}

export interface IsometricChartProps {
  games: IsometricChartGame[]
  playerName: string
  height?: number          // Chart height in px (default: 400)
  showStats?: boolean      // Show stats panel (default: true)
  defaultView?: '2d' | '3d' // Initial view mode (default: '3d')
}

export interface SeasonStats {
  totalPoints: number
  gamesPlayed: number
  totalGames: number
  avgPoints: number
  bestGame: {
    points: number
    opponent: string
    date: string
  }
  currentStreak: number    // Consecutive games with 20+ pts
}
```

---

## Color Scale (GitHub Skyline Style)

```typescript
// Green gradient based on points intensity
const getBarColor = (points: number, maxPoints: number): string => {
  const intensity = points / maxPoints

  if (intensity === 0) return '#161b22'      // No game / DNP
  if (intensity < 0.25) return '#0e4429'     // Low (< 25% of max)
  if (intensity < 0.50) return '#006d32'     // Medium-low
  if (intensity < 0.75) return '#26a641'     // Medium-high
  return '#39d353'                            // High (career game)
}

// Alternative: Use HSL for smooth gradient
const getBarColorHSL = (points: number, maxPoints: number): string => {
  const intensity = Math.min(points / maxPoints, 1)
  const lightness = 20 + (intensity * 35) // 20% to 55%
  const saturation = 60 + (intensity * 20) // 60% to 80%
  return `hsl(130, ${saturation}%, ${lightness}%)`
}
```

---

## Implementation Phases

### Phase 1: Setup & Dependencies
- [ ] Install three, @react-three/fiber, @react-three/drei
- [ ] Create component folder structure
- [ ] Add TypeScript types

### Phase 2: Basic Scene
- [ ] Create Canvas container with proper sizing
- [ ] Setup isometric camera (OrthographicCamera, fixed angle)
- [ ] Add ambient + directional lighting
- [ ] Implement OrbitControls (limited rotation range)

### Phase 3: Grid Floor
- [ ] Create base grid plane with subtle lines
- [ ] Add month labels along X-axis
- [ ] Position grid with proper isometric offset

### Phase 4: Bar Visualization
- [ ] Map games to 3D bar positions (X = date, Z = row)
- [ ] Calculate bar heights from points (normalized 0-1)
- [ ] Apply green gradient colors based on intensity
- [ ] Use InstancedMesh for performance (82 games max)

### Phase 5: Interactivity
- [ ] Implement hover detection with raycaster
- [ ] Create tooltip component (Html from drei)
- [ ] Show game details on hover (date, opponent, points, result)
- [ ] Add hover glow effect on bars

### Phase 6: Stats Panel
- [ ] Calculate season statistics from games data
- [ ] Create side panel component (React, not Three.js)
- [ ] Display: total points, best game, games played, avg points
- [ ] Style to match existing design system (dark theme)

### Phase 7: View Toggle
- [ ] Add 2D/3D toggle button
- [ ] Implement 2D view as flat bar chart (same component)
- [ ] Smooth transition between views (camera animation)

### Phase 8: Integration
- [ ] Add to player page as Section 03.5
- [ ] Transform seasonGames data to IsometricChartGame[]
- [ ] Handle loading state
- [ ] Test with various player data

---

## Scene Configuration

```typescript
// Scene.tsx
const CAMERA_CONFIG = {
  position: [10, 10, 10],      // Isometric angle
  zoom: 50,                     // Orthographic zoom
  near: 0.1,
  far: 1000
}

const CONTROLS_CONFIG = {
  enableRotate: true,
  enableZoom: true,
  enablePan: false,
  minPolarAngle: Math.PI / 6,  // Limit vertical rotation
  maxPolarAngle: Math.PI / 3,
  minAzimuthAngle: -Math.PI / 4,
  maxAzimuthAngle: Math.PI / 4
}

const LIGHTING = {
  ambient: { intensity: 0.4 },
  directional: {
    position: [5, 10, 5],
    intensity: 0.8
  }
}
```

---

## Grid Layout (82 Games Season)

```
Games organized in rows by month:
- X axis: Day of month (1-31)
- Z axis: Month row (Oct=0, Nov=1, Dec=2, ...)
- Y axis: Points (normalized height)

     Oct ░░▒▒░░▒▒░░░░▒▒▓▓░░▒▒░░▓▓░░  (games 1-15)
     Nov ▒▒░░▓▓▒▒░░▒▒░░▓▓░░▒▒▓▓░░▒▒  (games 16-30)
     Dec ░░▓▓░░▒▒▓▓░░▒▒░░▒▒░░▓▓░░▒▒  (games 31-45)
     Jan ▓▓░░▒▒░░▓▓▒▒░░▓▓░░▒▒░░▓▓░░  (games 46-60)
     Feb ░░▒▒▓▓░░▒▒░░▓▓░░▒▒░░▒▒▓▓░░  (games 61-75)
     Mar ▒▒░░▒▒▓▓░░▒▒░░                (games 76-82)
         1  5  10  15  20  25  30
```

---

## Integration in Player Page

```tsx
// In page.tsx, after Section 03 (Current Form)

{/* ============================================
    SECTION 03.5: SEASON POINTS SKYLINE
============================================ */}
<section className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
    <span className="text-zinc-400">03.5</span>
    Season Points Skyline
  </h2>

  <IsometricPointsChart
    games={seasonGames.map(g => ({
      game_id: g.game_id,
      game_date: g.game_date,
      points: g.points || 0,
      played: g.played,
      opponent: g.opponent,
      result: g.result as 'W' | 'L',
      home_away: g.home_away
    }))}
    playerName={player.full_name}
    height={400}
    showStats={true}
    defaultView="3d"
  />
</section>
```

---

## Responsive Considerations

```typescript
// Container sizing
const CHART_SIZES = {
  mobile: { height: 300, zoom: 35 },
  tablet: { height: 350, zoom: 45 },
  desktop: { height: 400, zoom: 50 }
}

// Stats panel behavior
- Desktop: Side panel (right)
- Tablet: Side panel (right, narrower)
- Mobile: Collapsible panel below chart
```

---

## Performance Optimizations

1. **InstancedMesh**: Render all 82 bars as single draw call
2. **Lazy loading**: Load Three.js only when component mounts
3. **Reduced geometry**: Simple BoxGeometry for bars
4. **Memoization**: useMemo for color calculations
5. **Throttled raycaster**: Limit hover detection frequency

---

## Design System Alignment

```typescript
// Match existing dark theme
const THEME = {
  background: 'transparent',           // Let parent bg show through
  gridColor: '#27272a',                 // zinc-800
  labelColor: '#a1a1aa',                // zinc-400
  statsPanel: {
    background: 'rgba(39, 39, 42, 0.5)', // zinc-800/50
    border: '#3f3f46',                   // zinc-700
    text: '#ffffff',
    subtext: '#a1a1aa'
  },
  tooltip: {
    background: '#18181b',              // zinc-900
    border: '#3f3f46',
    text: '#ffffff'
  }
}
```

---

## Success Criteria

- [ ] 3D isometric view renders correctly with all season games
- [ ] Green gradient colors accurately represent points intensity
- [ ] Smooth rotation/zoom with OrbitControls
- [ ] Hover tooltips show game details
- [ ] Stats panel displays accurate season statistics
- [ ] 2D/3D toggle works smoothly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Performance: 60fps with 82 bars
- [ ] Matches GitHub Skyline aesthetic
- [ ] Integrates seamlessly with player page design

---

## Files to Create

1. `frontend/src/components/charts/IsometricPointsChart/index.tsx`
2. `frontend/src/components/charts/IsometricPointsChart/IsometricPointsChart.tsx`
3. `frontend/src/components/charts/IsometricPointsChart/Scene.tsx`
4. `frontend/src/components/charts/IsometricPointsChart/PointsBars.tsx`
5. `frontend/src/components/charts/IsometricPointsChart/GridFloor.tsx`
6. `frontend/src/components/charts/IsometricPointsChart/StatsPanel.tsx`
7. `frontend/src/components/charts/IsometricPointsChart/GameTooltip.tsx`
8. `frontend/src/components/charts/IsometricPointsChart/types.ts`

---

## Status

**Phase**: Planning Complete
**Next Step**: User validation, then Phase 1 implementation
