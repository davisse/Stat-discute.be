# STAT-DISCUTE Brand Guidelines

## Brand Identity

**Tagline**: L'analyse NBA data-driven

**Personality**: Technical, precise, modern, professional

---

## Colors

### Primary Palette
| Name | Value | Usage |
|------|-------|-------|
| **Black** | `#000000` | Primary background |
| **White** | `#FFFFFF` | Primary text, headings |
| **Zinc 400** | `#a1a1aa` | Secondary text, descriptions |
| **Zinc 500** | `#71717a` | Tertiary text, section numbers |
| **Zinc 700** | `#3f3f46` | Borders, dividers |
| **Zinc 800** | `#27272a` | Card backgrounds, subtle borders |

### Accent Colors (Badges)
| Name | Value | Usage |
|------|-------|-------|
| **Red** | `#dc2626` | LIVE badges |
| **Emerald** | `#059669` | MC (Monte Carlo) badges |
| **Purple** | `#9333ea` | Beta badges |
| **Blue** | `#2563eb` | IA badges |

---

## Typography

### Font Stack
```css
--font-sans: Inter, system-ui, sans-serif;
--font-mono: JetBrains Mono, monospace; /* For data/stats */
```

### Headings
- **Hero Title**: 80-120px, Bold/Black weight, uppercase, tight tracking (-0.05em)
- **Section Title**: 48-64px, Bold/Black weight, uppercase, tight tracking
- **Card Title**: 24-32px, Bold weight
- **Body**: 16-18px, Regular weight, zinc-400 color

### Text Styles
```css
/* Section Number */
font-size: 14px;
font-weight: 500;
color: zinc-500;
letter-spacing: 0.1em;

/* Section Title */
font-size: 48-64px;
font-weight: 900;
text-transform: uppercase;
letter-spacing: -0.05em;
color: white;

/* Description */
font-size: 18px;
line-height: 1.6;
color: zinc-400;
max-width: 640px;
```

---

## Spacing

### Grid System
- Base unit: **8px**
- Content max-width: **1280px** (max-w-6xl)
- Section padding: **80-120px** vertical, **32px** horizontal
- Component gap: **12-24px**

### Section Layout
```
┌─────────────────────────────────────┐
│  Section Number (01)                │  ← zinc-500, 14px
│  ────────                           │  ← 32px underline, zinc-700
│                                     │
│  SECTION TITLE                      │  ← white, 48-64px, bold
│                                     │
│  Description text goes here...      │  ← zinc-400, 18px
│                                     │
│  [LINK →] [LINK →] [LINK →]        │  ← bordered buttons
└─────────────────────────────────────┘
```

---

## Components

### Link Buttons
```css
/* Default State */
padding: 16px 24px;
border: 1px solid zinc-700;
border-radius: 8px;
font-size: 14px;
font-weight: 500;
text-transform: uppercase;
letter-spacing: 0.05em;
color: white;
transition: all 0.3s ease;

/* Hover State */
border-color: white;
box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
```

### Badges
```css
/* Base */
padding: 2px 8px;
font-size: 10px;
font-weight: 700;
border-radius: 4px;
color: white;
text-transform: uppercase;

/* Positioning */
position: absolute;
top: -8px;
right: -8px;
```

### Cards
```css
background: zinc-950 / rgba(255, 255, 255, 0.02);
border: 1px solid zinc-800;
border-radius: 8px;
padding: 24px;
```

### Navigation Buttons
```css
/* Default */
padding: 8px 24px;
border-radius: 6px;
font-size: 14px;
font-weight: 500;
text-transform: uppercase;
letter-spacing: 0.05em;
color: zinc-400;

/* Active/Hover */
background: white;
color: black;
```

---

## Background

### Dotted Pattern
```css
/* Applied to body/main container */
background-color: #000000;
background-image: radial-gradient(circle, #ffffff 1px, transparent 1px);
background-size: 30px 30px;
opacity: 0.15;
```

---

## Logo Usage

### Primary Logo
- File: `/public/logo-v5.png`
- Dimensions: 256px width (desktop), scales responsively
- Clearspace: Minimum 32px on all sides
- Always on black background

### Logo Placement
- **Homepage Hero**: Centered, large (full-width hero)
- **App Header**: Top-center, 256px width
- **Mobile**: Centered, responsive scaling

---

## Iconography

### Arrow Indicator
- Standard: `→` (right arrow)
- Used in: Link buttons, navigation items, list items
- Color: Inherits from parent, transitions to white on hover

### Section Numbers
- Format: Two-digit with leading zero (`01`, `02`, `03`, `04`)
- Accompanied by: 32px horizontal underline
- Color: zinc-500

---

## Animation & Transitions

### Standard Transition
```css
transition: all 0.3s ease;
/* or */
transition: all 200ms ease;
```

### Hover Effects
- Buttons: Border color change + subtle glow
- Links: Text color change (zinc-400 → white)
- Cards: Subtle border highlight

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| Mobile | < 768px | Single column, burger menu |
| Tablet | 768-1024px | Adaptive layout |
| Desktop | > 1024px | Full navigation, multi-column |

### Mobile Considerations
- Burger menu replaces horizontal nav
- Sections stack vertically
- Touch targets: minimum 44px
- Font sizes: Reduce hero titles by 40-50%

---

## Voice & Tone

### Writing Style
- **Technical but accessible**: Use data terminology naturally
- **French-first**: Primary language is French
- **Concise**: Short descriptions, clear labels
- **Action-oriented**: Use imperatives ("Explorez", "Analysez")

### Label Conventions
- Navigation: Uppercase, short (1-2 words max)
- Descriptions: Sentence case, 2-3 lines max
- Badges: All caps, abbreviated (LIVE, MC, IA)
