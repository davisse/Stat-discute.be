# Landing Page Redesign Mockup Proposal
**Date**: 2025-11-24
**Status**: Awaiting Validation
**Platform**: Stat Discute NBA Analytics

## Executive Summary

Transform the current basic landing page into a conversion-optimized showcase that communicates the platform's professional-grade NBA analytics capabilities through strategic visualizations, animations, and mobile-first UX.

---

## 📱 Complete Mobile Mockup (375px width)

### SECTION 1: HERO (100vh - Above Fold)
```
┌─────────────────────────────────────┐
│ [FIXED HEADER - z-58]               │
│   STAT-DISCUTE Logo (centered)      │ ← Already implemented
│   [☰] Burger Menu (top-right)       │
└─────────────────────────────────────┘
│                                     │
│                                     │
│    Les Données NBA Qui Font         │ ← H1 (text-4xl)
│    Gagner Vos Paris                 │    Bold, centered
│                                     │
│    Stats pro • Analytics • Paris    │ ← Subheadline (text-lg)
│                                     │    Grey color
│                                     │
│    ┌─────┬─────┬─────┐            │
│    │ 212 │ 479 │4750 │            │ ← Animated counters
│    │Match│Joue.│Score│            │    Count from 0
│    │  s  │     │  s  │            │    JetBrains Mono
│    └─────┴───────────┘            │
│                                     │
│    ┌───────────────────┐          │
│    │  Se connecter     │          │ ← White button
│    └───────────────────┘          │    Elevation on hover
│                                     │
│           ↓                        │ ← Animated bounce
│        Découvrir                   │    Scroll indicator
│                                     │
└─────────────────────────────────────┘
```

**Animations:**
- Counters: 0 → final value (2s, ease-out)
- Scroll indicator: Bounce animation (infinite)
- Stats fade in: Stagger by 100ms

---

### SECTION 2: PROBLEM/SOLUTION (50vh)
```
┌─────────────────────────────────────┐
│  Pourquoi Stat Discute?             │ ← H2 (text-3xl)
│                                     │
│  ┌────────────┬────────────┐       │
│  │     ❌     │     ✅     │       │
│  │            │            │       │
│  │  Paris     │ Analytics  │       │ ← H3 (text-xl)
│  │  sans      │    qui     │       │
│  │  données?  │  gagnent   │       │
│  │            │            │       │
│  │   ▓▓░░░░   │   ▓▓▓▓▓▓   │       │ ← Simple bar charts
│  │    10%     │    78%     │       │    Success rates
│  │            │            │       │
│  └────────────┴────────────┘       │
│                                     │
└─────────────────────────────────────┘
```

**Animations:**
- Cards: Slide up on scroll-in (400ms)
- Bars: Animate width 0 → value (600ms)

---

### SECTION 3: CORE FEATURES (Vertical Stack)
```
┌─────────────────────────────────────┐
│  Nos Outils Professionnels          │ ← H2
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📊                         │   │ ← 64px icon
│  │  Stats Temps Réel           │   │    H3
│  │                             │   │
│  │  ╱╲╱╲╱╲╱╲                   │   │ ← Sparkline (60x30)
│  │                             │   │    Last 10 games trend
│  │  Données NBA instantanées   │   │
│  │  → Explorer                 │   │ ← Link with arrow
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🎯                         │   │
│  │  Props Joueurs Précis       │   │
│  │                             │   │
│  │  ████░░░░ LeBron 28.5pts    │   │ ← Horizontal bars
│  │  ██████░░ Curry 6.2 3pts    │   │    Player props
│  │                             │   │
│  │  4750+ box scores analysés  │   │
│  │  → Explorer                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🛡️                         │   │
│  │  Analyse Défensive          │   │
│  │                             │   │
│  │      ●                      │   │ ← Radar chart (120px)
│  │    ╱   ╲                    │   │    Pentagon defense
│  │   ●─────●                   │   │    metrics
│  │    ╲   ╱                    │   │
│  │      ●                      │   │
│  │                             │   │
│  │  Ratings équipes détaillés  │   │
│  │  → Explorer                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  💰                         │   │
│  │  Tracker de Cotes           │   │
│  │                             │   │
│  │     ╱────╲                  │   │ ← Line chart
│  │    ╱      ╲╱╲               │   │    Odds movement
│  │  ──          ─●             │   │    Best entry point
│  │                             │   │
│  │  Pinnacle tracking temps réel│   │
│  │  → Explorer                 │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Animations:**
- Cards: Fade + slide up (stagger 150ms)
- Charts: Draw on scroll-in (600-800ms)
- Hover: Elevation effect (already implemented)

---

### SECTION 4: TOOLS CAROUSEL (Horizontal Scroll)
```
┌─────────────────────────────────────┐
│  Explorez Nos Outils                │ ← H2
│                                     │
│  ← ─────────────────────────────→  │ ← Scroll hint
│                                     │
│  ┌────────┐  ┌────────┐  ┌────────┐│
│  │ Daily  │  │Matchup │  │ Value  ││ ← 280px cards
│  │Lineups │  │Analysis│  │ Finder ││    Snap-to-grid
│  │        │  │        │  │        ││
│  │[Chart] │  │[Chart] │  │[Chart] ││ ← Mini viz
│  │        │  │        │  │        ││
│  │→ Voir  │  │→ Voir  │  │→ Voir  ││
│  └────────┘  └────────┘  └────────┘│
│                                     │
│       ● ○ ○                         │ ← Pagination dots
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- CSS scroll-snap for smooth snapping
- Pagination dots indicate position
- Swipe gesture on mobile

---

### SECTION 5: SOCIAL PROOF
```
┌─────────────────────────────────────┐
│  Plateforme de Confiance            │ ← H2
│                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐     │
│  │  28  │  │ 155+ │  │ 2025 │     │ ← Large numbers
│  │      │  │      │  │ -26  │     │    JetBrains Mono
│  │Tables│  │Index │  │Season│     │    Small labels
│  │  DB  │  │Optim.│  │      │     │
│  └──────┘  └──────┘  └──────┘     │
│                                     │
│  Infrastructure de données pro      │ ← Caption
│                                     │
│  ╔═══════════════════════════════╗ │
│  ║ Lakers -5.5✓ • Curry 28pts✓  ║ │ ← Auto-scroll ticker
│  ╚═══════════════════════════════╝ │    Infinite loop
│                                     │
└─────────────────────────────────────┘
```

**Animations:**
- Numbers: Counter animation (1.5s)
- Ticker: Infinite CSS translateX
- Pause on touch/hover

---

### SECTION 6: HOW IT WORKS
```
┌─────────────────────────────────────┐
│  Comment Ça Marche?                 │ ← H2
│                                     │
│         1️⃣                          │
│       Browse                        │ ← Step 1
│       📊                            │    Icon 48px
│   Parcourez les stats               │
│                                     │
│         ↓                           │ ← Connecting arrow
│                                     │
│         2️⃣                          │
│      Analyze                        │ ← Step 2
│       🧠                            │
│   Analysez les données              │
│                                     │
│         ↓                           │
│                                     │
│         3️⃣                          │
│        Win                          │ ← Step 3
│       💰                            │
│    Gagnez vos paris                 │
│                                     │
└─────────────────────────────────────┘
```

**Interaction:**
- Each step expands on tap (accordion)
- Shows more details when expanded
- Progressive disclosure pattern

---

### SECTION 7: FINAL CTA
```
┌─────────────────────────────────────┐
│  Prêt à Transformer                 │ ← H2
│  Vos Paris NBA?                     │
│                                     │
│  ┌───────────────────────┐         │
│  │   Se connecter        │         │ ← White CTA button
│  └───────────────────────┘         │    (already implemented)
│                                     │
│  Accès gratuit • Saison 2025-26    │ ← Benefits text
│                                     │
└─────────────────────────────────────┘

[FIXED BOTTOM NAV - z-50]            ← Already implemented
┌─────────────────────────────────────┐
│  🏠     📊     🎯     👤           │
│ Accueil Stats Paris Profil         │
└─────────────────────────────────────┘
```

---

## 🎨 Design System

### Colors
```
Primary:
- Background: #000000 (black)
- Text: #FFFFFF (white)
- Accent: #e30613 (brand red)
- Secondary: #d0d0d0 (grey)

Functional:
- Success: #10b981 (green)
- Warning: #f59e0b (amber)
- Error: #ef4444 (red)
- Info: #3b82f6 (blue)

Opacity Levels:
- white/5, white/10, white/20, white/40
```

### Typography
```
Headings:
- H1: text-4xl (36px) - Hero
- H2: text-3xl (30px) - Sections
- H3: text-xl (20px) - Cards
- H4: text-lg (18px) - Subsections

Body:
- Large: text-lg (18px)
- Base: text-base (16px)
- Small: text-sm (14px)
- Tiny: text-xs (12px)

Fonts:
- Inter: UI, headings, body
- JetBrains Mono: Stats, numbers, data
```

### Spacing (8px grid)
```
Sections: py-16 (128px)
Cards: mb-8 (64px)
Elements: gap-4 (32px)
Tight: gap-2 (16px)
```

### Micro-interactions (Consistent Pattern)
```
All Interactive Elements:
- Hover: -translate-y-1, shadow-lg, shadow-white/20
- Active: translate-y-0, shadow-sm
- Transition: transition-all duration-200
```

---

## 🎬 Animation Strategy

### Scroll-Triggered Animations
```typescript
// Using IntersectionObserver
- Fade in + slide up: sections enter viewport
- Stagger: 100-150ms between items
- Threshold: 0.2 (trigger when 20% visible)
```

### Data Animations
```typescript
// Counter Animation
- Start: 0
- End: actual value (212, 479, 4750)
- Duration: 2000ms
- Easing: easeOutQuart
- Trigger: IntersectionObserver
```

### Chart Animations
```typescript
// Various chart types
- Bar charts: height 0 → 100% (800ms)
- Line charts: stroke-dashoffset drawing (600ms)
- Radar charts: scale 0 → 1, stagger points (50ms)
- Donut charts: CSS conic-gradient rotation (1000ms)
```

### Performance Optimizations
```typescript
- CSS transforms only (GPU-accelerated)
- IntersectionObserver (not scroll events)
- Passive event listeners
- will-change on animating elements only
- requestAnimationFrame for counters
```

---

## 🛠️ Technical Implementation

### New Components Needed

```
/components/landing/
├── AnimatedCounter.tsx
│   Props: { end: number, duration: number, label: string }
│   Features: requestAnimationFrame, easing, IntersectionObserver
│
├── MiniSparkline.tsx
│   Props: { data: number[], width: 60, height: 30, color: string }
│   Features: SVG path, gradient fill, animate stroke-dasharray
│
├── RadarChart.tsx
│   Props: { metrics: {label, value}[], size: 200 }
│   Features: Pentagon/hexagon, animated drawing, touch interaction
│
├── DonutChart.tsx
│   Props: { percentage: number, size: 120, thickness: 16 }
│   Features: CSS conic-gradient, central text, rotation animation
│
├── HorizontalScrollCards.tsx
│   Props: { cards: Card[], snapToGrid: boolean }
│   Features: CSS scroll-snap, pagination dots, swipe gestures
│
├── LiveTicker.tsx
│   Props: { items: string[], speed: 'slow'|'medium'|'fast' }
│   Features: Infinite loop, pause on hover, GPU-accelerated
│
└── ProcessFlow.tsx
    Props: { steps: Step[] }
    Features: Accordion expansion, connecting arrows, icons
```

### Custom Hooks

```typescript
// useScrollAnimation.ts
function useScrollAnimation(threshold = 0.2) {
  // IntersectionObserver wrapper
  // Returns { ref, isVisible }
}

// useCountUp.ts
function useCountUp(end: number, duration: number) {
  // Counter animation with easing
  // Returns current count value
}

// useHorizontalScroll.ts
function useHorizontalScroll() {
  // Snap-to-grid carousel
  // Returns { scrollRef, activeIndex, next, prev }
}
```

### Data Strategy

```typescript
// /lib/sampleData.ts
export const sampleSparklineData = [22, 18, 25, 30, 28, 32, 29, 31, 27, 35]
export const samplePlayerProps = [
  { name: 'LeBron James', points: 28.5, probability: 0.72 },
  { name: 'Stephen Curry', threes: 6.2, probability: 0.68 }
]
export const sampleDefenseMetrics = [
  { label: 'Perimeter', value: 85 },
  { label: 'Paint', value: 92 },
  { label: 'Rebounding', value: 78 }
]
```

---

## 📊 Success Metrics

### Performance Targets
```
Initial Load: < 200KB
Lighthouse Performance: 90+
Lighthouse Accessibility: 100
Lighthouse Best Practices: 90+
Lighthouse SEO: 90+
```

### Engagement Targets
```
Time on Page: > 90 seconds
Scroll Depth: 80%+ reach bottom
CTA Click Rate: 15%+
Bounce Rate: < 40%
Mobile Traffic: 70%+ (primary)
```

---

## 📅 Implementation Timeline

### Phase 1: Foundation ✅ COMPLETE
- Fixed header with logo
- Burger menu navigation
- Bottom nav bar
- Micro-interactions
- Basic hero section

### Phase 2: Enhanced Hero & Stats (2 days)
- New headline and subheadline
- Animated counter components
- Scroll indicator
- Vertical spacing optimization

### Phase 3: Core Features (2 days)
- 4-6 feature cards
- MiniSparkline component
- RadarChart component
- DonutChart component
- Horizontal bar charts

### Phase 4: Tool Carousel (1 day)
- Horizontal scroll container
- Snap-to-grid implementation
- Pagination indicators
- Tool preview cards

### Phase 5: Social Proof (1 day)
- Enhanced stat counters
- LiveTicker component
- Trust indicators

### Phase 6: How It Works (0.5 days)
- ProcessFlow component
- Accordion interactions
- Connecting arrows

### Phase 7: Polish & Testing (1 day)
- Performance optimization
- Cross-browser testing
- Accessibility audit
- Animation refinement

**Total Estimate: 6-8 days**

---

## ✅ Validation Checklist

Before implementation, confirm:

- [ ] Overall design direction approved
- [ ] Section order and hierarchy approved
- [ ] Animation intensity level approved
- [ ] Color scheme and typography approved
- [ ] Feature priorities correct
- [ ] Copy/messaging resonates
- [ ] Mobile-first approach confirmed
- [ ] Performance targets acceptable
- [ ] Timeline estimate acceptable

---

## 🎯 Next Steps

Upon approval:
1. Create detailed component specifications
2. Set up development branch
3. Build reusable components first
4. Implement sections incrementally
5. Test on real devices
6. Iterate based on feedback
7. Deploy to production

---

## 📝 Notes

- All visualizations use sample/mock data on landing page
- Real data requires authentication (drives conversion)
- Design system maintains consistency with existing brand
- Mobile-first ensures optimal thumb accessibility
- Progressive enhancement for older browsers
- All animations respect prefers-reduced-motion

**Status**: Awaiting user validation to proceed with implementation.
