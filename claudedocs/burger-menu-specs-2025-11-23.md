# Burger Menu Specifications
**Date**: 2025-11-23
**Component**: `/frontend/src/components/mobile/BurgerMenu.tsx`

## Overview
Slide-in navigation drawer with animated hamburger menu for mobile-first navigation.

## Visual States

### 1. Closed State (Default)
```
┌─────────────────────────────┐
│                     [☰]     │ ← Burger button (top-right)
│                             │
│    [Logo]                   │
│                             │
│    Main Content             │
│                             │
│                             │
└─────────────────────────────┘
```

### 2. Opening Animation (300ms)
```
┌─────────────────────────┬───┐
│                         │ ← │ ← Drawer sliding in
│    [Logo]              │   │
│                    [×] │   │ ← Burger → X transform
│    Main Content        │   │
│ [Backdrop blur]        │   │
│                         │   │
└─────────────────────────┴───┘
```

### 3. Open State
```
┌──────────────┬──────────────┐
│              │      [×]     │ ← Close button (X)
│              │              │
│              │ Navigation   │
│  Backdrop    │  Items       │
│  (blur +     │              │
│   opacity)   │  - Accueil   │
│              │  - Équipes   │
│  Click       │  - Joueurs   │
│  to close    │  - Matchs    │
│              │  ...         │
│              │              │
│              │ [Commencer]  │
│              │ [Connecter]  │
└──────────────┴──────────────┘
   60%              40%
```

## Component Structure

### Z-Index Layers
```
z-60: Burger button (fixed top-right)
z-56: Drawer menu (slide-in)
z-55: Backdrop overlay (blur + opacity)
```

### Dimensions
- **Burger Button**: 48px × 48px (touch target)
- **Icon Size**: 24px × 20px (3 lines)
- **Drawer Width**: 85vw (max-width: 384px)
- **Drawer Height**: 100vh (full screen)
- **Position**: Fixed top-6 right-6 (24px from edges)

### Colors
```css
Burger Button:
  Background: rgba(255,255,255,0.1) → hover: rgba(255,255,255,0.2)
  Icon: #FFFFFF

Backdrop:
  Background: rgba(0,0,0,0.6)
  Backdrop-filter: blur(8px)

Drawer:
  Background: #000000
  Border: 1px solid rgba(255,255,255,0.1) (left side)

Menu Items:
  Default: #FFFFFF
  Hover: rgba(255,255,255,0.1) background
  Arrow: #6B7280 → hover: #FFFFFF
```

## Animation Timing

### Opening Sequence
```
0ms:   Click burger button
       ├─ Hamburger → X rotation starts
       ├─ Backdrop fades in
       └─ Drawer slides in from right

300ms: Animation complete
       ├─ Hamburger now X shape
       ├─ Backdrop at 60% opacity
       └─ Drawer fully visible
```

### Closing Sequence
```
0ms:   Click close/backdrop/ESC
       ├─ X → Hamburger rotation starts
       ├─ Backdrop fades out
       └─ Drawer slides out to right

300ms: Animation complete
       ├─ Hamburger restored
       ├─ Backdrop invisible
       └─ Drawer off-screen
```

### CSS Transitions
```css
Hamburger Icon Lines:
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1)
  - Line 1: rotate(45deg) translateY(8px)
  - Line 2: opacity(0)
  - Line 3: rotate(-45deg) translateY(-8px)

Drawer:
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1)
  - Closed: translateX(100%)
  - Open: translateX(0)

Backdrop:
  transition: opacity 300ms ease-out
  - Closed: opacity(0) + invisible
  - Open: opacity(1)

Menu Items:
  transition: colors 200ms ease-out
```

## Menu Sections

### Section 1: Navigation (Main Pages)
```
🏠 Accueil         →
🏀 Équipes         →
👤 Joueurs         →
📅 Matchs          →
🎯 Paris           →
📊 Statistiques    →
```

### Section 2: Analyses avancées
```
👥 Lineups         →
🛡️ Défense        →
🎲 Props           →
🤖 Agent           →
⚔️ Matchups        →
```

### Section 3: Compte
```
⚙️ Mon compte      →
⭐ Favoris         →
📜 Historique      →
```

### Section 4: CTAs
```
┌─────────────────────┐
│ Commencer           │ White background
│ gratuitement        │
└─────────────────────┘

┌─────────────────────┐
│ Se connecter        │ Outline only
└─────────────────────┘
```

### Section 5: Footer
```
À propos
Conditions d'utilisation
Politique de confidentialité
Contact

Stat Discute v1.0
Saison NBA 2025-26
```

## Typography

### Section Headers
```
Font: Inter
Size: 12px (text-xs)
Weight: 700 (font-bold)
Color: #6B7280 (gray-500)
Transform: UPPERCASE
Tracking: 0.05em (tracking-wider)
Spacing: mb-4 (16px below)
```

### Menu Items
```
Font: Inter
Size: 16px (base)
Weight: 500 (font-medium)
Color: #FFFFFF
Line-height: 1.5
Spacing: py-3 px-4 (12px vertical, 16px horizontal)
```

### Footer Links
```
Font: Inter
Size: 14px (text-sm)
Weight: 400 (regular)
Color: #9CA3AF (gray-400) → hover: #FFFFFF
Spacing: 8px between items
```

### Version Info
```
Font: Inter
Size: 12px (text-xs)
Weight: 400 (regular)
Color: #6B7280 (gray-500)
Align: center
```

## Interaction States

### Burger Button
```
Default:  bg-white/10
Hover:    bg-white/20
Active:   bg-white/30 (momentary press)
Focus:    outline-2 outline-white/50
```

### Menu Items
```
Default:  text-white, transparent background
Hover:    text-white, bg-white/10
Active:   bg-white/15 (momentary press)
Focus:    outline-2 outline-white/50

Arrow (→):
Default:  text-gray-500
Hover:    text-white
```

### CTAs
```
Primary (Commencer):
Default:  bg-white text-black
Hover:    bg-gray-100
Active:   bg-gray-200

Secondary (Se connecter):
Default:  border-2 border-white text-white
Hover:    bg-white/10
Active:   bg-white/15
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate through menu items
- **Enter/Space**: Activate focused item
- **Escape**: Close menu
- **Shift+Tab**: Navigate backwards

### ARIA Labels
```tsx
<button aria-label="Menu" aria-expanded={isOpen}>
  {/* Burger icon */}
</button>

<nav aria-label="Main navigation">
  {/* Menu items */}
</nav>
```

### Focus Management
- Focus trap: When menu opens, focus moves to first item
- Focus restore: When menu closes, focus returns to burger button
- Visible focus indicators: outline-2 outline-white/50

### Screen Reader Support
- Semantic HTML: `<nav>`, `<button>`, `<a>`
- Clear link text: No "click here" or ambiguous labels
- Section headings: Clear hierarchy for navigation

## Touch Interactions

### Touch Targets (Minimum 44px)
```
Burger Button:     48px × 48px ✓
Menu Items:        48px height ✓
CTA Buttons:       48px height ✓
Footer Links:      44px height ✓
```

### Gesture Support
- **Swipe Right**: Close menu (drawer slides out)
- **Tap Outside**: Close menu (backdrop click)
- **Tap Item**: Navigate + close menu
- **Pull Down**: Scroll menu content (if overflow)

### Scroll Behavior
```
Menu Content:
  - overflow-y: auto
  - -webkit-overflow-scrolling: touch (smooth iOS scroll)
  - Padding: py-20 (space for burger button at top)
  - Scrollbar: hidden (native mobile behavior)
```

## Performance Optimizations

### Rendering
- Client Component only (interactive state)
- No server-side rendering needed
- Minimal JavaScript bundle (~2KB gzipped)

### Animations
- GPU-accelerated: `transform` and `opacity`
- No layout thrashing: Fixed positioning
- Will-change hints: `will-change: transform` on drawer

### State Management
```tsx
useState: Local component state (no global state needed)
useEffect: ESC key listener + body scroll lock
```

### Memory Management
- Event listeners cleaned up on unmount
- No memory leaks from scroll locks
- Minimal re-renders (state only changes on open/close)

## Browser Support

### Modern Browsers
- ✅ Chrome 90+ (Android, Desktop)
- ✅ Safari 14+ (iOS, macOS)
- ✅ Firefox 88+ (Android, Desktop)
- ✅ Edge 90+ (Desktop)

### Features Used
- CSS Backdrop Filter (blur effect)
- CSS Transforms (animations)
- CSS Transitions (smooth states)
- Flexbox (layout)
- Fixed Positioning (burger + drawer)

### Fallbacks
- No backdrop-filter support → solid background
- No transforms → instant show/hide (no animation)

## Testing Checklist

### Functional Tests
- [ ] Burger button toggles menu open/close
- [ ] Clicking backdrop closes menu
- [ ] Pressing ESC closes menu
- [ ] Clicking menu item navigates and closes menu
- [ ] Body scroll locked when menu open
- [ ] Body scroll restored when menu closes

### Visual Tests
- [ ] Hamburger → X animation smooth (300ms)
- [ ] Drawer slides in from right (300ms)
- [ ] Backdrop fades in (300ms)
- [ ] Menu items hover states work
- [ ] CTAs hover states work
- [ ] All icons visible and aligned

### Accessibility Tests
- [ ] Tab navigation works
- [ ] Focus visible on all interactive elements
- [ ] ESC key closes menu
- [ ] Screen reader announces menu state
- [ ] ARIA labels present and correct

### Mobile Tests (Real Devices)
- [ ] Touch targets ≥ 44px (easy to tap)
- [ ] Swipe gestures work
- [ ] Smooth 60fps animations
- [ ] No scroll issues on iOS
- [ ] No scroll issues on Android

### Performance Tests
- [ ] No layout shifts (CLS = 0)
- [ ] Animations at 60fps
- [ ] JavaScript bundle < 3KB gzipped
- [ ] No memory leaks after 100 open/close cycles

## Known Limitations

### iOS Safari
- Backdrop blur may have lower opacity on older devices
- Pull-to-refresh might interfere with drawer swipe (disabled when menu open)

### Android Chrome
- Backdrop blur not supported on Android < 10 (solid background fallback)

### Desktop Browsers
- Menu designed for mobile but works on desktop (consider adding desktop nav instead)

## Future Enhancements

### v1.1 (Nice to Have)
- [ ] Swipe-to-close gesture (touch only)
- [ ] Menu item sub-menus (if needed)
- [ ] User avatar/profile section at top
- [ ] Recent searches/pages

### v2.0 (Advanced)
- [ ] Haptic feedback on iOS (Taptic Engine)
- [ ] Dark/Light mode toggle in menu
- [ ] Notification badges on menu items
- [ ] Search bar in menu
- [ ] Customizable menu order (user preference)
