# 📐 STATDISCUTE - Quick Reference Sheet

## Mesures Exactes pour Figma

---

## 🎨 COULEURS (HEX)

### Rouge Principal (Brand)
```
#FF1725 - Primary 500
#E30613 - Primary 600 ⭐ PRINCIPAL
#C00511 - Primary 700 (Hover)
#A00410 - Primary 800 (Active)
#FEE2E2 - Primary 100 (Backgrounds)
```

### Gris (Neutrals)
```
#FAFAFA - Gray 50
#F5F5F5 - Gray 100
#E8E8E8 - Gray 200
#D1D1D1 - Gray 300
#ADADAD - Gray 400
#8C8C8C - Gray 500
#6B6B6B - Gray 600
#4A4A4A - Gray 700
#2D2D2D - Gray 800
#1A1A1A - Gray 900
```

### Sémantiques
```
Success: #10B981
Error: #DC2626
Warning: #F59E0B
Info: #2563EB
```

---

## ✍️ TYPOGRAPHIE

### Police: Inter (Google Fonts)
```
Weights: 400, 500, 600, 700
```

### Tailles
```
H1: 60px (Desktop) / 36px (Mobile)
H2: 48px (Desktop) / 32px (Mobile)
H3: 36px (Desktop) / 24px (Mobile)
H4: 24px
H5: 20px
H6: 16px

Body Large: 18px
Body Base: 16px
Body Small: 14px
Caption: 12px

Stats Large: 48px
Stats Medium: 32px
Stats Small: 20px
```

### Line Heights
```
H1-H2: 1.1
H3-H4: 1.3
Body: 1.6
Caption: 1.4
Stats: 1.0
```

---

## 📏 ESPACEMENTS (px)

```
0px, 4px, 8px, 12px, 16px, 20px, 24px
32px, 40px, 48px, 64px, 80px, 96px, 128px
```

**Sections:**
- Desktop: 80px top/bottom
- Mobile: 48px top/bottom
- Hero Desktop: 128px top/bottom
- Hero Mobile: 64px top/bottom

**Cards:**
- Padding: 24px
- Gap entre cards: 16px-24px

**Buttons:**
- Padding Small: 8px × 16px
- Padding Medium: 12px × 24px
- Padding Large: 16px × 32px

---

## 🔲 BORDER RADIUS (px)

```
4px - Small (badges, inputs focus)
8px - Base (buttons, inputs)
12px - Medium (cards, badges)
16px - Large (feature cards)
24px - XL (special cards)
9999px - Full (badges, avatars)
```

---

## 🖼️ COMPOSANTS - MESURES EXACTES

### BUTTONS

#### Small
```
Height: 32px
Padding: 8px × 16px
Font: Inter SemiBold 600, 14px
Border Radius: 8px
```

#### Medium
```
Height: 44px
Padding: 12px × 24px
Font: Inter SemiBold 600, 16px
Border Radius: 8px
```

#### Large
```
Height: 56px
Padding: 16px × 32px
Font: Inter SemiBold 600, 18px
Border Radius: 8px
```

**Primary Button:**
- Background: #E30613
- Text: White
- Shadow: 0 1px 2px rgba(0,0,0,0.05)

**Hover:**
- Background: #C00511
- Shadow: 0 4px 8px rgba(227,6,19,0.2)
- Transform: -1px Y

---

### CARDS

#### Base Card
```
Width: Auto (flexible)
Min Height: 200px
Padding: 24px
Border: 1px solid #E8E8E8
Border Radius: 12px
Background: White
Shadow: 0 1px 3px rgba(0,0,0,0.1)

Hover:
- Border: 1px solid #E30613
- Shadow: 0 4px 12px rgba(0,0,0,0.15)
- Transform: -2px Y
```

#### Stat Card
```
Width: 320px (ou 100% dans grid)
Height: 180px
Padding: 24px
Border: 2px solid #E8E8E8
Border Radius: 16px

Elements:
- Icon: 20×20px (#6B6B6B)
- Title: Inter Medium 500, 14px, #6B6B6B
- Value: Inter Bold 700, 32px, #1A1A1A
- Change: Inter Regular 400, 12px, #10B981/#DC2626
```

#### Player Card
```
Width: 340px
Height: 240px
Padding: 20px
Gap: 16px

Avatar: 56×56px, Border 3px #E30613
Name: Inter SemiBold 600, 18px
Team: Inter Regular 400, 14px, #6B6B6B
Stats: Inter Bold 700, 24px (value)
```

#### Game Card
```
Width: 360px
Height: 280px
Padding: 20px

Badge Height: 24px
Team Name: Inter SemiBold 600, 16px
Score: Inter Bold 700, 28px
Odds: Inter Medium 500, 12px
```

---

### BADGES

```
Height: 24px
Padding: 4px × 12px
Border Radius: 12px
Font: Inter Medium 500, 12px
Letter Spacing: 0.01em
Text Transform: UPPERCASE

Colors:
- Default: Background #F5F5F5, Text #4A4A4A
- Primary: Background #E30613, Text White
- Success: Background #D1FAE5, Text #047857
- Error: Background #FEE2E2, Text #991B1B
```

---

### INPUTS

```
Height: 48px
Width: 100% (dans container)
Padding: 12px × 16px
Border: 2px solid #D1D1D1
Border Radius: 8px
Font: Inter Regular 400, 16px
Placeholder Color: #ADADAD

Focus:
- Border: 2px solid #E30613
- Shadow: 0 0 0 3px rgba(227,6,19,0.1)

Error:
- Border: 2px solid #DC2626
```

---

## 📱 LAYOUT SIZES

### Header
```
Height: 64px
Padding: 0 48px (Desktop) / 0 16px (Mobile)
Logo: 180×50px (Desktop) / 140×40px (Mobile)
```

### Container
```
Max Width: 1280px
Padding: 0 48px (Desktop) / 0 16px (Mobile)
Margin: 0 auto
```

### Sidebar (Dashboard)
```
Width: 280px
Height: 100vh
Padding: 24px 16px
Position: Fixed
Top: 64px
Left: 0
```

### Main Content (with Sidebar)
```
Margin Left: 280px (Desktop)
Margin Left: 0 (Mobile)
Padding: 24px
Min Height: calc(100vh - 64px)
```

---

## 🌅 HERO SECTION

### Desktop
```
Height: 800px
Padding: 128px 48px
Background: linear-gradient(135deg, #E30613, #C00511, #A00410)

Badge: 
- Padding: 6px 16px
- Border Radius: 16px
- Font: 14px

H1: 
- Size: 60px
- Line Height: 1.1
- Letter Spacing: -0.02em

Description:
- Size: 20px
- Max Width: 700px
- Line Height: 1.6

Buttons Gap: 16px

Stats Grid:
- Columns: 3
- Gap: 64px
- Value: 48px Bold
- Label: 14px Regular
```

### Mobile
```
Height: 600px
Padding: 64px 16px

H1: 36px
Description: 16px
Max Width: 100%
Buttons: Full width, stack vertical
Stats: Smaller values (32px)
```

---

## 🎯 FEATURES SECTION

### Desktop
```
Padding: 80px 48px
Background: #F5F5F5

Grid: 3 columns × 2 rows
Gap: 24px
Max Width: 1280px

Feature Card:
- Height: 240px
- Border: 2px solid #E8E8E8
- Border Radius: 12px
- Padding: 24px

Icon Container: 48×48px, Border Radius 12px
Title: Inter SemiBold 600, 20px
Description: Inter Regular 400, 16px, #6B6B6B
```

### Mobile
```
Padding: 48px 16px
Grid: 1 column
Gap: 16px
Cards: Full width
```

---

## 💰 PRICING SECTION

### Desktop
```
Padding: 80px 48px
Background: White

Grid: 3 columns
Gap: 32px
Max Width: 1120px

Pricing Card:
- Width: 380px
- Height: 600px
- Padding: 32px
- Border Radius: 16px

Featured Card:
- Scale: 1.05
- Border: 2px solid #E30613
- Shadow: 0 8px 24px rgba(227,6,19,0.15)
- Badge Top: -12px (absolute)

Price: 48px Bold
Feature Item: Gap 12px, Icon 20px
Button: Full width, Margin top auto
```

### Mobile
```
Grid: 1 column
Gap: 24px
Cards: Full width
No scale on featured
```

---

## 🎮 BETTING DASHBOARD

### Today's Games Grid
```
Grid: repeat(auto-fill, minmax(360px, 1fr))
Gap: 16px
```

### Analytics Panel
```
Grid: 2 columns (Desktop) / 1 column (Mobile)
Gap: 24px

Table:
- Border: 1px solid #E8E8E8
- Border Radius: 12px
- Cell Padding: 16px
- Header Background: #F5F5F5
- Row Hover: #FAFAFA
```

### Odds Chart
```
Height: 400px
Padding: 24px
Border Radius: 16px
```

---

## 📊 TABLES

```
Width: 100%
Border: 1px solid #E8E8E8
Border Radius: 12px
Background: White

Header:
- Background: #F5F5F5
- Border Bottom: 2px solid #E8E8E8
- Padding: 16px
- Font: Inter SemiBold 600, 14px, #4A4A4A
- Text Transform: UPPERCASE

Cell:
- Padding: 16px
- Font: Inter Regular 400, 14px, #1A1A1A
- Border Bottom: 1px solid #E8E8E8

Row Hover:
- Background: #FAFAFA
```

---

## 🎭 SHADOWS

```
xs:    0 1px 2px rgba(0,0,0,0.05)
sm:    0 1px 3px rgba(0,0,0,0.1)
base:  0 4px 6px rgba(0,0,0,0.1)
md:    0 8px 12px rgba(0,0,0,0.15)
lg:    0 12px 24px rgba(0,0,0,0.2)
xl:    0 20px 40px rgba(0,0,0,0.25)

Primary: 0 4px 8px rgba(227,6,19,0.2)
Primary LG: 0 8px 24px rgba(227,6,19,0.3)
```

---

## ⚡ ÉTATS & TRANSITIONS

### Hover
```
Transform: translateY(-2px) [buttons]
Transform: translateY(-4px) [cards]
Transition: all 0.2s ease-in-out
Shadow: Enhanced
```

### Active
```
Transform: translateY(0) ou scale(0.98)
Background: Darkest shade
Transition: all 0.15s ease
```

### Focus
```
Outline: 2px solid #E30613
Outline Offset: 2px
Box Shadow: 0 0 0 3px rgba(227,6,19,0.1)
```

### Disabled
```
Opacity: 0.5
Cursor: not-allowed
Background: #D1D1D1
Color: #8C8C8C
```

---

## 📐 GRILLES

### Desktop (≥1024px)
```
Columns: 12
Max Width: 1280px
Gutter: 24px
Margin: 48px
```

### Tablet (768-1023px)
```
Columns: 8
Max Width: 100%
Gutter: 20px
Margin: 32px
```

### Mobile (≤767px)
```
Columns: 4
Max Width: 100%
Gutter: 16px
Margin: 16px
```

---

## 📱 BREAKPOINTS

```
Mobile: 0-767px (default)
Tablet: 768-1023px
Desktop: 1024px+
Large Desktop: 1280px+
XL Desktop: 1536px+
```

---

## 🎯 TOUCH TARGETS (Mobile)

```
Minimum: 44×44px
Recommended: 48×48px
Spacing: Minimum 8px entre targets
```

---

## 🔢 Z-INDEX

```
Dropdown: 1000
Sticky (Header): 1020
Fixed: 1030
Modal Backdrop: 1040
Modal: 1050
Popover: 1060
Tooltip: 1070
```

---

## 📦 ICON SIZES

```
Extra Small: 16px
Small: 20px
Medium: 24px
Large: 32px
Extra Large: 48px

Stroke Width: 2px
Corner Radius: 2px
```

---

## 🎨 GRADIENTS

### Hero Gradient
```
Type: Linear
Angle: 135deg
Colors: 
  - #E30613 (0%)
  - #C00511 (50%)
  - #A00410 (100%)
```

### CTA Gradient
```
Type: Linear
Angle: 90deg
Colors:
  - #E30613 (0%)
  - #FF1725 (100%)
```

### Image Overlay
```
Type: Linear
Angle: 180deg
Colors:
  - rgba(0,0,0,0) (0%)
  - rgba(0,0,0,0.7) (100%)
```

---

## ✅ CHECKLIST RAPIDE

### Setup Figma
- [ ] Install Inter font
- [ ] Set grid: 1280px, 12 columns, 24px gutter
- [ ] Create color styles (15 colors)
- [ ] Create text styles (12 styles)
- [ ] Create effect styles (7 shadows)

### Components Prioritaires
- [ ] Button Primary (3 sizes × 4 states)
- [ ] Button Secondary (3 sizes × 4 states)
- [ ] Card Base
- [ ] Stat Card
- [ ] Player Card
- [ ] Game Card
- [ ] Badge (6 variants)
- [ ] Input (4 states)

### Pages Prioritaires
- [ ] Homepage Desktop
- [ ] Homepage Mobile
- [ ] Dashboard Desktop
- [ ] Betting Page

---

## 🚀 ORDRE DE CRÉATION RECOMMANDÉ

1. **Setup (30 min)**
   - Installer fonts
   - Créer color/text/effect styles
   - Setup grids

2. **Design System (1h)**
   - Page couleurs
   - Page typographie
   - Page espacements

3. **Components Atomiques (2h)**
   - Buttons
   - Badges
   - Inputs

4. **Components Moléculaires (2h)**
   - Cards (tous types)
   - Navigation items

5. **Components Organismes (2h)**
   - Header
   - Sidebar
   - Footer

6. **Pages (4h)**
   - Homepage
   - Dashboard
   - Betting

7. **Mobile (3h)**
   - Adapt all pages
   - Mobile menu

8. **Prototype (1h)**
   - Link pages
   - Add interactions

---

**Total temps estimé: 15-16 heures**

---

*Quick Reference Sheet - STATDISCUTE Design System*  
*Version 1.0 - 23 octobre 2025*
