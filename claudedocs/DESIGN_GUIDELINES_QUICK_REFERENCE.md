# STAT-DISCUTE Design Guidelines - Quick Reference

**Purpose**: Quick reference for Claude Code to ensure design consistency across all components and pages.

**Last Updated**: 2025-11-23

---

## 📁 Source Files

### Primary Documentation
- **Complete Design System**: `/frontend/docs/design-system.md` (comprehensive 1245-line spec)
- **TypeScript Tokens**: `/frontend/src/lib/design-tokens.ts` (programmatic access)
- **CSS Variables**: `/frontend/src/app/globals.css` (CSS custom properties)

---

## 🎨 Brand Identity (STRICT RULES)

### Colors - Monochrome System

```typescript
// Always import from design tokens:
import { colors } from '@/lib/design-tokens'

// Background & Foreground
background: '#000000'     // Pure black - main background
foreground: '#FFFFFF'     // Pure white - main text

// Gray Scale (depth & hierarchy)
gray.950: '#0A0A0A'      // Cards level 1
gray.900: '#171717'      // Hover states, cards level 2
gray.850: '#1F1F1F'      // Anthracite - Main cards
gray.800: '#262626'      // Borders, separators
gray.700: '#404040'      // Disabled states
gray.600: '#525252'      // Secondary text
gray.500: '#737373'      // Tertiary text
gray.400: '#A3A3A3'      // Placeholders, labels
```

### Functional Colors (DATA ONLY - NEVER FOR UI)

```typescript
// ⚠️ CRITICAL RULE: Green/Red ONLY for data visualization, NEVER for buttons/decorations
positive: '#10B981'      // ✅ Win, Over, Gains, Upward trends
negative: '#EF4444'      // ❌ Loss, Under, Losses, Downward trends
neutral: '#6B7280'       // ⚖️ Push, Neutral, No movement

positiveBg: 'rgba(16, 185, 129, 0.05)'   // Subtle backgrounds
negativeBg: 'rgba(239, 68, 68, 0.05)'
```

**❌ WRONG**: `<button className="bg-green-500">Place Bet</button>`
**✅ RIGHT**: `<div style={{color: colors.positive}}>Won</div>`

### Background Pattern

```typescript
// Dots grid pattern (always 15% opacity)
backgroundPattern.dots.pattern: 'radial-gradient(circle, #ffffff 1px, transparent 1px)'
backgroundPattern.dots.opacity: 0.15
backgroundPattern.dots.size: '30px 30px'
```

---

## 📐 Typography

### Fonts

```typescript
// UI/Interface (titles, navigation, buttons, general text)
fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

// Data/Stats (numbers, odds, percentages, tables)
fontMono: "'JetBrains Mono', 'Roboto Mono', monospace"
```

**Usage Rule**: ALL numeric data (scores, stats, odds, percentages) MUST use `fontMono` for alignment.

### Size Scale (16px base)

```typescript
fontSize.xs: '0.75rem'      // 12px - Labels, footnotes
fontSize.sm: '0.875rem'     // 14px - Secondary text, table data
fontSize.base: '1rem'       // 16px - Body text (default)
fontSize.lg: '1.125rem'     // 18px - Emphasized text
fontSize.xl: '1.25rem'      // 20px - Section titles
fontSize['2xl']: '1.5rem'   // 24px - Page titles
fontSize['3xl']: '1.875rem' // 30px - Hero titles
fontSize['4xl']: '2.25rem'  // 36px - Display (rare)
```

### Weights & Line Heights

```typescript
fontWeight.regular: 400     // Body text
fontWeight.medium: 500      // Emphasis, buttons
fontWeight.semibold: 600    // Subtitles
fontWeight.bold: 700        // Titles

lineHeight.tight: 1.2       // Titles
lineHeight.normal: 1.5      // Body text (default)
lineHeight.relaxed: 1.6     // Long texts
```

---

## 📏 Spacing (8px Grid System)

### Base Units

```typescript
spacing[1]: '0.25rem'    // 4px - Micro-spacing (icon-text gap)
spacing[2]: '0.5rem'     // 8px - Tight (button padding)
spacing[3]: '0.75rem'    // 12px - Comfortable
spacing[4]: '1rem'       // 16px - Default (card padding)
spacing[6]: '1.5rem'     // 24px - Section spacing
spacing[8]: '2rem'       // 32px - Large (between sections)
spacing[12]: '3rem'      // 48px - XL (page margins)
spacing[16]: '4rem'      // 64px - XXL (major sections)
spacing[24]: '6rem'      // 96px - XXXL (hero spacing)
```

### Usage Rules

**Cards**:
- Minimum padding: `24px` (spacing[6])
- Gap between cards: `16px` (spacing[4])

**Sections**:
- Gap between major sections: `64-96px` (spacing[16] or spacing[24])
- H2 margin top: `48px` (spacing[12])

**Page Layout**:
- Desktop margins: `48px` (spacing[12])
- Mobile margins: `24px` (spacing[6])
- Max content width: `1280px`

---

## 🔲 Border Radius

```typescript
radius.sm: '4px'        // Badges, small elements
radius.md: '8px'        // Buttons, inputs (default)
radius.lg: '12px'       // Cards
radius.xl: '16px'       // Large cards, modals
radius['2xl']: '24px'   // Hero elements
radius.full: '9999px'   // Pills, avatars
```

**Default for cards**: `radius.lg` (12px)
**Default for buttons**: `radius.md` (8px)

---

## 🌑 Shadows (White Glows for Black Background)

```typescript
shadows.sm: '0 0 8px rgba(255, 255, 255, 0.05)'    // Subtle card lift
shadows.md: '0 0 16px rgba(255, 255, 255, 0.08)'   // Card hover
shadows.lg: '0 0 24px rgba(255, 255, 255, 0.12)'   // Modal, dropdown
shadows.xl: '0 0 32px rgba(255, 255, 255, 0.15)'   // Major elevation
```

---

## ⚡ Transitions

```typescript
transitions.fast: '150ms ease-out'      // Color, opacity changes
transitions.normal: '300ms ease-out'    // Transforms, borders
transitions.slow: '500ms ease-out'      // Complex animations
```

---

## 🧩 Component Patterns

### Card (Base Component)

```tsx
// Default card
<div style={{
  background: colors.gray[950],
  border: `1px solid ${colors.gray[800]}`,
  borderRadius: radius.lg,
  padding: spacing[6],
  transition: transitions.normal
}}>
  {/* Content */}
</div>

// Variant: Anthracite (main cards)
background: colors.gray[850]
border: `1px solid ${colors.gray[700]}`
```

### StatCard (Data Display)

```tsx
<div style={{
  background: colors.gray[950],
  border: `1px solid ${colors.gray[800]}`,
  borderRadius: radius.lg,
  padding: spacing[6],
  minWidth: '160px',
  minHeight: '120px'
}}>
  {/* Label */}
  <div style={{
    fontSize: typography.fontSize.sm,
    color: colors.gray[400],
    textTransform: 'uppercase'
  }}>
    Points Per Game
  </div>

  {/* Value - MUST USE MONO FONT */}
  <div style={{
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    fontFamily: typography.fontMono,  // ← CRITICAL
    color: colors.foreground
  }}>
    28.5
  </div>

  {/* Trend (optional) */}
  <div style={{ color: colors.positive }}>
    +5.2%
  </div>
</div>
```

### Button Variants

```tsx
// Primary
<button style={{
  background: colors.foreground,
  color: colors.background,
  padding: `${spacing[2]} ${spacing[4]}`,
  borderRadius: radius.md,
  fontWeight: typography.fontWeight.medium,
  transition: transitions.normal
}}>
  Primary Action
</button>

// Secondary (Outline)
<button style={{
  background: 'transparent',
  border: `1px solid ${colors.foreground}`,
  color: colors.foreground,
  padding: `${spacing[2]} ${spacing[4]}`,
  borderRadius: radius.md
}}>
  Secondary Action
</button>

// Ghost
<button style={{
  background: 'transparent',
  color: colors.gray[400],
  padding: `${spacing[2]} ${spacing[4]}`,
  borderRadius: radius.md
}}>
  Ghost Action
</button>
```

### Table (Stats Display)

```tsx
<table style={{ width: '100%', fontFamily: typography.fontSans }}>
  <thead>
    <tr style={{
      background: colors.gray[900],
      borderBottom: `1px solid ${colors.gray[800]}`
    }}>
      <th style={{
        padding: spacing[3],
        textAlign: 'left',
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        color: colors.gray[400],
        textTransform: 'uppercase'
      }}>
        Player
      </th>
      <th style={{ textAlign: 'right' }}>PPG</th>
    </tr>
  </thead>
  <tbody>
    <tr style={{
      borderBottom: `1px solid ${colors.gray[800]}`
    }}>
      <td style={{ padding: spacing[3], color: colors.foreground }}>
        Luka Doncic
      </td>
      <td style={{
        padding: spacing[3],
        textAlign: 'right',
        fontFamily: typography.fontMono  // ← CRITICAL FOR NUMBERS
      }}>
        28.5
      </td>
    </tr>
  </tbody>
</table>
```

---

## 🎯 Philosophy & Principles

### Anti-Impulsive Design
- **No urgent CTAs**: No flashy "Bet Now" buttons
- **Progressive Disclosure**: Reveal information in layers
- **Educational Focus**: Encourage analysis before action
- **Calm Interface**: Generous spacing, one idea at a time

### Accessibility (WCAG 2.1 AA)
- **Contrast**: White on black = 21:1 (AAA), Gray-400 on black = 7.5:1 (AA)
- **Focus States**: Always visible with 2px white outline
- **Keyboard Navigation**: All interactive elements tabbable
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Reduced Motion**: Respect `prefers-reduced-motion`

### Responsive Strategy
- **Mobile (< 640px)**: Stack columns, reduce spacing, hamburger nav
- **Tablet (640-1024px)**: 2 columns for stats, collapsible sidebar
- **Desktop (> 1024px)**: Full layout with fixed sidebar

---

## ✅ Implementation Checklist

When creating new components, verify:

- [ ] Colors use `colors` from design-tokens (no hardcoded hex values)
- [ ] Spacing uses `spacing` scale (8px grid system)
- [ ] Border radius uses `radius` constants
- [ ] Numeric data uses `fontMono` (JetBrains Mono)
- [ ] UI text uses `fontSans` (Inter)
- [ ] Green/red used ONLY for data, never for UI elements
- [ ] Transitions defined (fast/normal/slow)
- [ ] Cards use minimum 24px padding
- [ ] Shadows appropriate for black background (white glows)
- [ ] Focus states visible for keyboard navigation
- [ ] ARIA labels for interactive elements

---

## 🔄 Quick Import Pattern

```typescript
// Always start new components with:
import { colors, spacing, radius, typography, shadows, transitions } from '@/lib/design-tokens'

// Example usage:
const cardStyle = {
  background: colors.gray[950],
  border: `1px solid ${colors.gray[800]}`,
  borderRadius: radius.lg,
  padding: spacing[6],
  transition: transitions.normal
}

const valueStyle = {
  fontFamily: typography.fontMono,
  fontSize: typography.fontSize['2xl'],
  fontWeight: typography.fontWeight.bold,
  color: colors.foreground
}

const trendStyle = {
  color: isPositive ? colors.positive : colors.negative,
  fontSize: typography.fontSize.sm
}
```

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T

```tsx
// Hardcoded values
<div style={{ padding: '24px', borderRadius: '16px', color: '#10b981' }}>

// Green/red for UI elements
<button className="bg-green-500">Place Bet</button>

// Sans font for numbers
<div style={{ fontFamily: 'Inter' }}>28.5</div>

// Breaking 8px grid
<div style={{ margin: '15px' }}>

// Using Tailwind classes instead of design tokens
<div className="p-6 rounded-lg bg-gray-950">
```

### ✅ DO

```tsx
// Design token constants
<div style={{
  padding: spacing[6],
  borderRadius: radius.xl,
  color: colors.positive
}}>

// Neutral UI, functional data colors
<button style={{ background: colors.foreground }}>Action</button>
<div style={{ color: colors.positive }}>Won</div>

// Mono font for numbers
<div style={{ fontFamily: typography.fontMono }}>28.5</div>

// 8px grid
<div style={{ margin: spacing[4] }}>

// Design tokens for consistency
<div style={{
  padding: spacing[6],
  borderRadius: radius.lg,
  background: colors.gray[950]
}}>
```

---

## 📚 Full Documentation Reference

For detailed specifications, interaction patterns, and component variants:
- **Complete Design System**: `/frontend/docs/design-system.md`
- **Implementation Plan**: See Phase 1-6 in design-system.md
- **Accessibility Standards**: WCAG 2.1 AA section in design-system.md

---

**Maintained by**: Claude Code
**Status**: Active reference for all development
**Update Frequency**: When design system evolves
