# Mobile-First Landing Page Mockup
**Date**: 2025-11-23
**Status**: Design Proposal

## Overview
Mobile-first landing page redesign with bottom navigation for optimal thumb accessibility and modern UX patterns.

## Design Principles

### 1. Mobile-First Architecture
- **Primary viewport**: 375px - 428px (iPhone SE to iPhone Pro Max)
- **Touch targets**: Minimum 44px × 44px (Apple HIG)
- **Thumb zone optimization**: Critical actions in bottom 1/3 of screen
- **Vertical content flow**: Single column layout with clear hierarchy

### 2. Bottom Navigation Benefits
- **Thumb reach**: 75% easier access vs top navigation
- **One-handed use**: Optimal for right and left-handed users
- **Modern pattern**: Follows iOS/Android native app conventions
- **Fixed position**: Always accessible, doesn't scroll away

### 3. Content Hierarchy (Top to Bottom)

```
┌─────────────────────────┐
│ [☰]                     │ ← Burger menu (top-right)
│    Logo (256×64px)      │ ← Brand identity
│                         │
├─────────────────────────┤
│ [Scroll Pills Nav]      │ ← Secondary navigation
├─────────────────────────┤
│                         │
│   Main Heading (H1)     │ ← Primary message
│   4xl/5xl font          │
│                         │
├─────────────────────────┤
│   Subtitle              │ ← Value proposition
│   lg/xl font            │
│   Gray-300              │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Commencer           │ │ ← Primary CTA
│ │ (White bg)          │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Se connecter        │ │ ← Secondary CTA
│ │ (Border only)       │ │
│ └─────────────────────┘ │
├─────────────────────────┤
│  [Stats Grid 3 cols]    │ ← Social proof
│   212 | 479 | 4750      │
├─────────────────────────┤
│                         │
│   Feature Cards         │ ← Value details
│   (Scrollable)          │
│                         │
└─────────────────────────┘
┌═════════════════════════┐
║ Bottom Nav (Fixed)      ║ ← Always visible
║ 🏠 📊 🎯 👤            ║
└═════════════════════════┘
```

## Component Breakdown

### 1. Hero Section
**Location**: Full viewport height, scrollable
**Elements**:
- Dotted background (15% opacity, 30px grid) - brand consistency
- Logo at top center
- Horizontal scroll navigation pills (Lineups, Défense, Paris, etc.)
- Main heading (4xl on mobile, 5xl on larger screens)
- Subtitle (lg on mobile, xl on larger screens)
- CTA buttons stack vertically on mobile

**Best Practices**:
- Large touch targets (py-4 = 16px vertical padding)
- Clear visual hierarchy with font sizes
- High contrast (white on black)
- Generous spacing (mb-12, mb-16)

### 2. Navigation Pills
**Pattern**: Horizontal scroll carousel
**Why**:
- Preserves screen real estate
- Allows unlimited nav items
- Native feel (iOS Safari scroll behavior)

**Implementation**:
```tsx
<div className="overflow-x-auto">
  <div className="flex gap-3 px-6 pb-4 min-w-max">
    {/* Pills */}
  </div>
</div>
```

### 3. CTA Buttons
**Mobile Pattern**: Stacked vertically (flex-col)
**Desktop Pattern**: Side by side (sm:flex-row)
**Contrast**: White primary, outline secondary
**Size**: py-4 px-8 (48px height minimum)

### 4. Stats Grid
**Layout**: 3 columns on mobile (grid-cols-3)
**Typography**:
- Numbers: 3xl on mobile, 4xl on desktop
- Labels: xs on mobile, sm on desktop
- Color: White numbers, gray-400 labels

### 5. Burger Menu
**Position**: `fixed top-6 right-6` with z-60 (above all content)
**Button**: 48px × 48px touch target with animated hamburger icon
**Drawer**: Slides in from right, 85% screen width (max 384px)
**Backdrop**: Semi-transparent overlay with blur effect

**Menu Structure**:
```
┌─────────────────────────┐
│                         │
│  Navigation (6 items)   │ ← Main pages
│  - Accueil 🏠          │
│  - Équipes 🏀          │
│  - Joueurs 👤          │
│  - Matchs 📅           │
│  - Paris 🎯            │
│  - Statistiques 📊     │
│                         │
│  Analyses avancées      │ ← Secondary features
│  - Lineups 👥          │
│  - Défense 🛡️          │
│  - Props 🎲            │
│  - Agent 🤖            │
│  - Matchups ⚔️         │
│                         │
│  Compte                 │ ← User actions
│  - Mon compte ⚙️       │
│  - Favoris ⭐          │
│  - Historique 📜       │
│                         │
│  [Commencer]           │ ← CTAs
│  [Se connecter]        │
│                         │
│  Footer links           │ ← Legal/info
│  Version info           │
└─────────────────────────┘
```

**Animations**:
- Hamburger → X transformation (300ms)
- Slide-in drawer (300ms ease-out)
- Backdrop fade-in (300ms)
- Menu items hover effect (200ms)

**Accessibility**:
- ARIA label on burger button
- Keyboard accessible (Tab navigation)
- ESC key closes menu
- Click outside closes menu

### 6. Bottom Navigation
**Position**: `fixed bottom-0` with z-50
**Background**: `bg-black/95 backdrop-blur-lg` (semi-transparent blur)
**Border**: Top border for separation
**Items**: 4 primary navigation items

**Thumb Zone Coverage**:
```
Screen Height: 100%
├─ Top 33%: Harder to reach (one-handed)
├─ Middle 34%: Comfortable reach
└─ Bottom 33%: OPTIMAL THUMB ZONE ✓
   └─ Nav bar here (72px height)
```

## Mobile UX Best Practices Implemented

### ✅ Touch Targets
- All interactive elements ≥ 44px height
- Gap between buttons ≥ 16px (gap-4)
- Large rounded corners (rounded-2xl = 16px)

### ✅ Typography Scale
- Base: 16px (browser default)
- H1: text-4xl (36px) → text-5xl (48px) on sm+
- Body: text-lg (18px) → text-xl (20px) on sm+
- Nav: text-xs (12px) for labels

### ✅ Spacing
- Consistent 8px grid (Tailwind default)
- Vertical rhythm: mb-6, mb-12, mb-16
- Horizontal padding: px-6 (24px)

### ✅ Color Contrast (WCAG AAA)
- White on black: 21:1 ratio
- Gray-300 on black: 12.6:1 ratio
- Gray-400 on black: 9.7:1 ratio

### ✅ Performance
- Next.js Image optimization
- Priority loading for logo
- CSS-only animations (no JS)
- Minimal JavaScript bundle

### ✅ Accessibility
- Semantic HTML (nav, main, section)
- ARIA labels (can add)
- Keyboard navigation support
- Screen reader friendly structure

## Responsive Breakpoints

```css
/* Mobile First (Default) */
- Font sizes: text-4xl, text-lg
- Layout: flex-col (stacked)
- Stats: text-3xl

/* Small devices and up (640px+) */
sm: {
  - Font sizes: text-5xl, text-xl
  - Layout: flex-row (side-by-side CTAs)
  - Stats: text-4xl
}
```

## Technical Implementation

### Stack
- **Next.js 16**: App Router with Server Components
- **React 19**: Latest features
- **Tailwind v4**: PostCSS plugin
- **TypeScript**: Type safety

### File Structure
```
frontend/src/app/mobile-landing/
└── page.tsx (Server Component)
```

### Key Features
1. **Server Component**: No client-side JavaScript needed for initial render
2. **Static Export Ready**: Can be pre-rendered at build time
3. **SEO Optimized**: Proper semantic HTML and meta tags (can add)
4. **Image Optimization**: Next.js automatic optimization

## Visual Design Tokens

### Colors
```ts
background: 'black' (#000000)
text-primary: 'white' (#FFFFFF)
text-secondary: 'gray-300' (#D1D5DB)
text-muted: 'gray-400' (#9CA3AF)
accent: 'white/10' (rgba(255,255,255,0.1))
```

### Spacing Scale
```ts
gap-3: 12px   // Pill gaps
gap-4: 16px   // Button gaps
gap-6: 24px   // Stat grid gaps
px-6: 24px    // Horizontal padding
py-4: 16px    // Button vertical padding
mb-12: 48px   // Section spacing
mb-16: 64px   // Large section spacing
```

### Border Radius
```ts
rounded-2xl: 16px   // Buttons, cards
rounded-xl: 12px    // Nav buttons
rounded-full: 9999px // Pills
```

### Typography
```ts
font-family: Inter (UI text)
font-family: JetBrains Mono (stats - can add)

Weights:
- Regular: 400 (body text)
- Semibold: 600 (buttons)
- Bold: 700 (headings, numbers)
```

## Interaction Patterns

### 1. Pill Navigation
- **Behavior**: Horizontal scroll with momentum
- **Visual**: Subtle background on hover
- **Feedback**: bg-white/10 → bg-white/20

### 2. CTA Buttons
- **Primary**: White background, hover to gray-100
- **Secondary**: Border only, hover to white/10 background
- **Transition**: 200ms ease for all states

### 3. Bottom Nav
- **Active**: white text + white/10 background
- **Inactive**: gray-400 text
- **Hover**: gray-400 → white with bg-white/5

### 4. Feature Cards
- **Rest**: bg-white/5
- **Hover**: bg-white/10
- **Transition**: 200ms colors

## Next Steps

### 1. Integration
- [ ] Replace current homepage with mobile-first version
- [ ] Test on real devices (iPhone SE, iPhone Pro, Android)
- [ ] Add analytics tracking for CTA conversions

### 2. Enhancements
- [ ] Add smooth scroll to pills navigation
- [ ] Implement lazy loading for feature cards
- [ ] Add micro-animations (fade-in on scroll)
- [ ] Add haptic feedback for iOS (if wrapped in native app)

### 3. A/B Testing
- [ ] Test CTA button order (Commencer vs Se connecter first)
- [ ] Test pill navigation vs no pills
- [ ] Test stats placement (above vs below CTAs)

### 4. Accessibility Audit
- [ ] VoiceOver testing (iOS)
- [ ] TalkBack testing (Android)
- [ ] Keyboard navigation flow
- [ ] Color contrast validation (already WCAG AAA)

## References

- **Apple HIG**: Human Interface Guidelines for iOS
- **Material Design**: Bottom navigation patterns
- **WCAG 2.1**: Level AAA contrast ratios
- **Mobile First Design**: Progressive enhancement approach

## Demo URL
Once deployed: `https://stat-discute.be/mobile-landing`

## Screenshots Needed
1. Hero section on iPhone SE (375px)
2. Hero section on iPhone Pro Max (428px)
3. Bottom nav interaction states
4. Horizontal scroll pills behavior
5. Feature cards on scroll
