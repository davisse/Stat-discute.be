# 🎨 STATDISCUTE - Charte Graphique & Système de Design

## 📋 Table des Matières
1. [Identité Visuelle](#identité-visuelle)
2. [Palette de Couleurs](#palette-de-couleurs)
3. [Typographie](#typographie)
4. [Grille & Espacements](#grille--espacements)
5. [Composants UI](#composants-ui)
6. [Pages & Layouts](#pages--layouts)
7. [Iconographie](#iconographie)
8. [États & Interactions](#états--interactions)

---

## 🎯 Identité Visuelle

### Logo Principal
**Nom**: STATDISCUTE

**Concept**: 
- "STAT" en style italique dynamique représentant la vitesse et l'analyse
- Icône de statistiques (barres montantes) intégrée dans le "T"
- "DISCUTE" en police italique assortie

**Déclinaisons**:
1. **Version Principale**: STAT (blanc) + icône stats + DISCUTE (gris argenté)
2. **Version sur fond blanc**: STAT (rouge #E30613) + DISCUTE (gris foncé #4A4A4A)
3. **Version sur fond rouge**: STAT (blanc) + DISCUTE (blanc/gris clair)
4. **Version monochrome positive**: Tout en noir
5. **Version monochrome négative**: Tout en blanc

**Dimensions**:
- Desktop header: 180px × 50px
- Mobile header: 140px × 40px
- Favicon: 32×32px (icône stats seule)
- App icon: 512×512px

**Zone de protection**: Minimum 20px d'espace libre autour du logo

---

## 🎨 Palette de Couleurs

### Couleurs Primaires

#### Rouge Principal (Brand)
```
Primary 600: #E30613 (Couleur principale)
- Usage: CTA, liens, accents importants
- RGB: (227, 6, 19)
- CMYK: (0, 97, 92, 11)

Primary 700: #C00511 (Hover states)
- RGB: (192, 5, 17)

Primary 500: #FF1725 (Version plus claire)
- RGB: (255, 23, 37)

Primary 800: #A00410 (Texte sur fond clair)
- RGB: (160, 4, 16)
```

#### Gris (Neutrals)
```
Gray 900: #1A1A1A (Texte principal)
Gray 800: #2D2D2D
Gray 700: #4A4A4A (Texte secondaire)
Gray 600: #6B6B6B
Gray 500: #8C8C8C
Gray 400: #ADADAD
Gray 300: #D1D1D1 (Bordures)
Gray 200: #E8E8E8 (Backgrounds)
Gray 100: #F5F5F5 (Backgrounds clairs)
Gray 50: #FAFAFA
```

### Couleurs Secondaires

#### Succès (Gains, Victoires)
```
Success 600: #10B981
Success 500: #34D399
Success 100: #D1FAE5
```

#### Erreur (Pertes, Défaites)
```
Error 600: #DC2626
Error 500: #EF4444
Error 100: #FEE2E2
```

#### Avertissement
```
Warning 600: #F59E0B
Warning 500: #FBBF24
Warning 100: #FEF3C7
```

#### Info
```
Info 600: #2563EB
Info 500: #3B82F6
Info 100: #DBEAFE
```

### Couleurs des Équipes NBA (Exemples)
```
Lakers: #552583 (Purple) + #FDB927 (Gold)
Celtics: #007A33 (Green) + #BA9653 (Gold)
Warriors: #1D428A (Blue) + #FFC72C (Yellow)
Heat: #98002E (Red) + #F9A01B (Orange)
Bulls: #CE1141 (Red) + #000000 (Black)
```

### Dégradés

#### Gradient Hero
```
Background: linear-gradient(135deg, #E30613 0%, #C00511 50%, #A00410 100%)
```

#### Gradient CTA
```
Background: linear-gradient(90deg, #E30613 0%, #FF1725 100%)
```

#### Gradient Overlay (sur images)
```
Background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)
```

---

## ✍️ Typographie

### Familles de Polices

#### Police Principale: **Inter**
```
Import Google Fonts:
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

Avantages:
- Excellente lisibilité
- Variable font pour performances
- Parfaite pour UI/UX
```

#### Police Alternative: **Roboto**
```
Fallback si Inter non disponible
font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Échelle Typographique

#### Titres (Headings)
```
H1 - Hero Title
Font: Inter Bold (700)
Size: 60px / 3.75rem (Desktop)
Size: 36px / 2.25rem (Mobile)
Line Height: 1.1
Letter Spacing: -0.02em
Color: Gray 900 ou White

H2 - Section Title
Font: Inter Bold (700)
Size: 48px / 3rem (Desktop)
Size: 32px / 2rem (Mobile)
Line Height: 1.2
Letter Spacing: -0.01em
Color: Gray 900

H3 - Subsection Title
Font: Inter SemiBold (600)
Size: 36px / 2.25rem (Desktop)
Size: 24px / 1.5rem (Mobile)
Line Height: 1.3
Color: Gray 900

H4 - Card Title
Font: Inter SemiBold (600)
Size: 24px / 1.5rem
Line Height: 1.4
Color: Gray 900

H5 - Small Title
Font: Inter SemiBold (600)
Size: 20px / 1.25rem
Line Height: 1.4
Color: Gray 800

H6 - Tiny Title
Font: Inter Medium (500)
Size: 16px / 1rem
Line Height: 1.5
Color: Gray 800
```

#### Corps de Texte (Body)
```
Body Large
Font: Inter Regular (400)
Size: 18px / 1.125rem
Line Height: 1.6
Color: Gray 700

Body Medium (Default)
Font: Inter Regular (400)
Size: 16px / 1rem
Line Height: 1.6
Color: Gray 700

Body Small
Font: Inter Regular (400)
Size: 14px / 0.875rem
Line Height: 1.5
Color: Gray 600

Caption
Font: Inter Regular (400)
Size: 12px / 0.75rem
Line Height: 1.4
Color: Gray 600
```

#### Texte Spécialisé
```
Statistiques (Grandes)
Font: Inter Bold (700)
Size: 48px / 3rem
Line Height: 1
Color: Gray 900

Statistiques (Moyennes)
Font: Inter SemiBold (600)
Size: 32px / 2rem
Line Height: 1
Color: Gray 900

Statistiques (Petites)
Font: Inter SemiBold (600)
Size: 20px / 1.25rem
Line Height: 1
Color: Gray 900

Labels
Font: Inter Medium (500)
Size: 14px / 0.875rem
Line Height: 1.4
Letter Spacing: 0.01em
Color: Gray 700
Text-Transform: uppercase

Boutons
Font: Inter SemiBold (600)
Size: 16px / 1rem
Line Height: 1
Letter Spacing: 0.01em
```

---

## 📐 Grille & Espacements

### Système d'Espacement (8pt Grid)

```
Base Unit: 8px

Échelle:
0: 0px
1: 4px (0.25rem)
2: 8px (0.5rem)
3: 12px (0.75rem)
4: 16px (1rem)
5: 20px (1.25rem)
6: 24px (1.5rem)
8: 32px (2rem)
10: 40px (2.5rem)
12: 48px (3rem)
16: 64px (4rem)
20: 80px (5rem)
24: 96px (6rem)
32: 128px (8rem)
```

### Grille de Layout

#### Desktop (≥1024px)
```
Container Max Width: 1280px
Columns: 12
Gutter: 24px
Margin: 48px
```

#### Tablet (768px - 1023px)
```
Container Max Width: 100%
Columns: 8
Gutter: 20px
Margin: 32px
```

#### Mobile (≤767px)
```
Container Max Width: 100%
Columns: 4
Gutter: 16px
Margin: 16px
```

### Breakpoints
```
xs: 0px
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Sections Spacing
```
Section Padding (Desktop):
- Top: 80px (5rem)
- Bottom: 80px (5rem)

Section Padding (Mobile):
- Top: 48px (3rem)
- Bottom: 48px (3rem)

Hero Padding (Desktop):
- Top: 128px (8rem)
- Bottom: 128px (8rem)

Hero Padding (Mobile):
- Top: 64px (4rem)
- Bottom: 64px (4rem)
```

---

## 🧩 Composants UI

### 1. Boutons (Buttons)

#### Primary Button
```
Background: #E30613
Color: White
Padding: 12px 24px (Medium)
Padding: 16px 32px (Large)
Padding: 8px 16px (Small)
Border Radius: 8px
Font: Inter SemiBold 600
Font Size: 16px (Medium), 18px (Large), 14px (Small)
Border: None
Shadow: 0 1px 2px rgba(0,0,0,0.05)

Hover:
  Background: #C00511
  Shadow: 0 4px 8px rgba(227,6,19,0.2)
  Transform: translateY(-1px)

Active:
  Background: #A00410
  Transform: translateY(0)

Disabled:
  Background: #D1D1D1
  Color: #8C8C8C
  Cursor: not-allowed
```

#### Secondary Button (Outline)
```
Background: Transparent
Color: #E30613
Padding: 12px 24px
Border: 2px solid #E30613
Border Radius: 8px
Font: Inter SemiBold 600
Font Size: 16px

Hover:
  Background: #FEE2E2
  Border Color: #C00511
  Color: #C00511

Active:
  Background: #FEE2E2
  Border Color: #A00410
```

#### Ghost Button
```
Background: Transparent
Color: #4A4A4A
Padding: 12px 24px
Border: None
Border Radius: 8px

Hover:
  Background: #F5F5F5
  Color: #1A1A1A
```

### 2. Cards

#### Base Card
```
Background: White
Border: 1px solid #E8E8E8
Border Radius: 12px
Padding: 24px
Shadow: 0 1px 3px rgba(0,0,0,0.1)

Hover:
  Border Color: #E30613
  Shadow: 0 4px 12px rgba(0,0,0,0.15)
  Transform: translateY(-2px)
  Transition: all 0.2s ease
```

#### Stat Card
```
Background: White
Border: 2px solid #E8E8E8
Border Radius: 16px
Padding: 24px
Min Height: 140px

Header:
  Display: Flex
  Justify: Space-between
  Margin Bottom: 16px
  
Title:
  Font: Inter Medium 500
  Size: 14px
  Color: #6B6B6B
  
Value:
  Font: Inter Bold 700
  Size: 32px
  Color: #1A1A1A
  Margin Bottom: 8px
  
Change:
  Font: Inter Regular 400
  Size: 12px
  Color: #10B981 (positive) or #DC2626 (negative)
```

#### Player Card
```
Background: White
Border: 2px solid #E8E8E8
Border Radius: 16px
Padding: 20px
Display: Flex
Flex Direction: Column
Gap: 16px

Avatar Section:
  Display: Flex
  Align Items: Center
  Gap: 12px
  
Avatar:
  Width: 56px
  Height: 56px
  Border Radius: 50%
  Border: 3px solid #E30613
  
Player Info:
  Name: Inter SemiBold 600, 18px
  Team: Inter Regular 400, 14px, Gray 600
  
Stats Grid:
  Display: Grid
  Grid Columns: 3
  Gap: 16px
  Text Align: Center
  Border Top: 1px solid #E8E8E8
  Padding Top: 16px
```

#### Game Card
```
Background: White
Border: 2px solid #E8E8E8
Border Radius: 16px
Padding: 20px
Min Width: 320px

Status Badge:
  Background: #DC2626 (Live) or #F5F5F5 (Scheduled)
  Color: White (Live) or #4A4A4A (Scheduled)
  Padding: 4px 12px
  Border Radius: 12px
  Font Size: 12px
  Font Weight: 600
  
Team Row:
  Display: Flex
  Justify: Space-between
  Align Items: Center
  Padding: 12px 0
  Border Bottom: 1px solid #E8E8E8 (last child no border)
  
Team Name:
  Font: Inter SemiBold 600
  Size: 16px
  Color: #1A1A1A
  
Score:
  Font: Inter Bold 700
  Size: 28px
  Color: #1A1A1A
```

### 3. Badges

#### Default Badge
```
Background: #F5F5F5
Color: #4A4A4A
Padding: 4px 12px
Border Radius: 12px
Font: Inter Medium 500
Font Size: 12px
Letter Spacing: 0.01em
Text Transform: uppercase
```

#### Success Badge
```
Background: #D1FAE5
Color: #047857
```

#### Error Badge
```
Background: #FEE2E2
Color: #991B1B
```

#### Warning Badge
```
Background: #FEF3C7
Color: #92400E
```

#### Primary Badge
```
Background: #E30613
Color: White
```

### 4. Inputs

#### Text Input
```
Background: White
Border: 2px solid #D1D1D1
Border Radius: 8px
Padding: 12px 16px
Font: Inter Regular 400
Font Size: 16px
Color: #1A1A1A

Placeholder:
  Color: #ADADAD
  
Focus:
  Border Color: #E30613
  Outline: None
  Box Shadow: 0 0 0 3px rgba(227,6,19,0.1)
  
Error:
  Border Color: #DC2626
  
Disabled:
  Background: #F5F5F5
  Color: #8C8C8C
  Cursor: not-allowed
```

#### Select Dropdown
```
Same as Text Input
Plus:
  Icon: Chevron Down
  Icon Color: #6B6B6B
  Icon Size: 20px
  Icon Position: Right 16px
```

### 5. Navigation

#### Header (Desktop)
```
Position: Sticky
Top: 0
Z-Index: 50
Height: 64px
Background: White / 95% opacity
Backdrop Filter: Blur(8px)
Border Bottom: 1px solid #E8E8E8
Padding: 0 48px

Content:
  Display: Flex
  Justify: Space-between
  Align Items: Center
  Max Width: 1280px
  Margin: 0 auto
```

#### Navigation Links
```
Font: Inter Medium 500
Size: 15px
Color: #4A4A4A
Gap: 32px

Hover:
  Color: #E30613
  
Active:
  Color: #E30613
  Font Weight: 600
  Border Bottom: 2px solid #E30613
  Padding Bottom: 2px
```

#### Mobile Menu
```
Position: Fixed
Top: 0
Right: 0
Width: 320px
Height: 100vh
Background: White
Padding: 24px
Shadow: -4px 0 12px rgba(0,0,0,0.1)
Z-Index: 100

Overlay:
  Position: Fixed
  Top: 0
  Left: 0
  Width: 100vw
  Height: 100vh
  Background: rgba(0,0,0,0.5)
  Z-Index: 99
```

### 6. Tables

#### Base Table
```
Width: 100%
Border: 1px solid #E8E8E8
Border Radius: 12px
Background: White
Overflow: Hidden

Table Head:
  Background: #F5F5F5
  Border Bottom: 2px solid #E8E8E8
  
Table Header Cell:
  Padding: 16px
  Font: Inter SemiBold 600
  Size: 14px
  Color: #4A4A4A
  Text Transform: uppercase
  Letter Spacing: 0.01em
  
Table Row:
  Border Bottom: 1px solid #E8E8E8
  
  Hover:
    Background: #FAFAFA
    
Table Cell:
  Padding: 16px
  Font: Inter Regular 400
  Size: 14px
  Color: #1A1A1A
```

#### Responsive Table (Mobile)
```
Display: Block
Overflow-X: Auto
-webkit-overflow-scrolling: touch

Table:
  Min Width: 600px
```

---

## 📄 Pages & Layouts

### 1. Homepage

#### Hero Section
```
Height: 600px (Mobile), 800px (Desktop)
Background: Gradient (voir section couleurs)
Padding: 80px 16px (Mobile), 128px 48px (Desktop)
Text Align: Center
Color: White

Layout:
  - Badge "L'outil #1..." (top)
  - H1 Title
  - Description (max-width: 700px)
  - CTA Buttons Row
  - Stats Grid (3 columns)
```

#### Features Section
```
Background: #F5F5F5
Padding: 80px 16px

Section Header:
  - H2 Title (center)
  - Description (center, max-width: 700px)
  - Margin Bottom: 64px

Grid:
  - Desktop: 3 columns
  - Tablet: 2 columns
  - Mobile: 1 column
  - Gap: 24px
```

#### Pricing Section
```
Background: White
Padding: 80px 16px

Grid:
  - Desktop: 3 columns
  - Tablet: 1 column
  - Mobile: 1 column
  - Gap: 32px
  - Max Width: 1120px
  - Center aligned

Featured Card:
  - Scale: 1.05
  - Border: 2px solid #E30613
  - Shadow: 0 8px 24px rgba(227,6,19,0.15)
```

### 2. Dashboard Layout

#### Sidebar (Desktop)
```
Width: 280px
Height: 100vh
Position: Fixed
Left: 0
Top: 64px (below header)
Background: White
Border Right: 1px solid #E8E8E8
Padding: 24px 16px

Navigation Item:
  Padding: 12px 16px
  Border Radius: 8px
  Font: Inter Medium 500
  Size: 15px
  Color: #4A4A4A
  Gap: 12px (icon + text)
  
  Hover:
    Background: #F5F5F5
    Color: #1A1A1A
    
  Active:
    Background: #FEE2E2
    Color: #E30613
    Border Left: 3px solid #E30613
```

#### Main Content Area
```
Margin Left: 280px (Desktop)
Margin Left: 0 (Mobile)
Padding: 24px
Min Height: calc(100vh - 64px)
Background: #FAFAFA
```

### 3. Betting Dashboard

#### Layout Grid
```
Display: Grid
Gap: 24px

Desktop:
  Grid Template Columns: 2fr 1fr
  
Mobile:
  Grid Template Columns: 1fr
```

#### Today's Games Section
```
Grid Column: Span 2 (Desktop)

Header:
  Display: Flex
  Justify: Space-between
  Align Items: Center
  Margin Bottom: 24px

Games Grid:
  Display: Grid
  Grid Columns: repeat(auto-fill, minmax(320px, 1fr))
  Gap: 16px
```

---

## 🎨 Iconographie

### Icônes (Lucide React)

#### Navigation & Actions
```
Menu: menu
Close: x
Search: search
Settings: settings
User: user
ChevronDown: chevron-down
ChevronRight: chevron-right
ArrowRight: arrow-right
ExternalLink: external-link
```

#### Stats & Analytics
```
TrendingUp: trending-up
TrendingDown: trending-down
BarChart: bar-chart-3
LineChart: line-chart
PieChart: pie-chart
Activity: activity
Target: target
Zap: zap
```

#### Sports & Betting
```
Trophy: trophy
Award: award
Star: star
Fire: flame
Clock: clock
Calendar: calendar
DollarSign: dollar-sign
Percent: percent
```

#### Status
```
Check: check
X: x
Info: info
Alert: alert-triangle
AlertCircle: alert-circle
```

### Tailles d'Icônes
```
Extra Small: 16px (1rem)
Small: 20px (1.25rem)
Medium: 24px (1.5rem)
Large: 32px (2rem)
Extra Large: 48px (3rem)
```

### Couleurs d'Icônes
```
Default: Gray 600 (#6B6B6B)
Hover: Gray 900 (#1A1A1A)
Active: Primary 600 (#E30613)
Disabled: Gray 400 (#ADADAD)
```

---

## ⚡ États & Interactions

### Transitions
```
Default Transition:
  transition: all 0.2s ease-in-out

Smooth Transition:
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

Fast Transition:
  transition: all 0.15s ease-in-out
```

### Hover States

#### Buttons
```
Transform: translateY(-2px)
Shadow: Enhanced
Background: Darker shade
Transition: 0.2s ease
```

#### Cards
```
Border Color: Primary
Shadow: Enhanced
Transform: translateY(-4px)
Transition: 0.3s ease
```

#### Links
```
Color: Primary 600
Text Decoration: Underline
Transition: 0.15s ease
```

### Active States
```
Transform: translateY(0) or scale(0.98)
Shadow: Reduced
Background: Darkest shade
```

### Focus States
```
Outline: 2px solid Primary 600
Outline Offset: 2px
Box Shadow: 0 0 0 3px rgba(227,6,19,0.1)
```

### Disabled States
```
Opacity: 0.5
Cursor: not-allowed
Pointer Events: none
Background: Gray 200
Color: Gray 500
```

### Loading States

#### Skeleton Loader
```
Background: linear-gradient(
  90deg,
  #F5F5F5 0%,
  #E8E8E8 50%,
  #F5F5F5 100%
)
Animation: shimmer 1.5s infinite
Border Radius: 8px
```

#### Spinner
```
Border: 3px solid #E8E8E8
Border Top Color: #E30613
Border Radius: 50%
Width: 24px
Height: 24px
Animation: spin 0.8s linear infinite
```

### Animations

#### Shimmer (Loading)
```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

#### Spin (Loading)
```css
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

#### Fade In
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Slide In
```css
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
```

---

## 📱 Responsive Design

### Mobile First Approach

#### Breakpoint Strategy
```
1. Design for mobile (375px)
2. Enhance for tablet (768px)
3. Optimize for desktop (1024px+)
```

#### Touch Targets
```
Minimum Size: 44px × 44px
Recommended: 48px × 48px
Spacing: Minimum 8px between targets
```

#### Mobile Specific
```
Font sizes: Minimum 16px (évite auto-zoom iOS)
Form inputs: Large padding (16px)
Buttons: Full width on mobile
Tables: Horizontal scroll avec sticky first column
Modals: Full screen on mobile
```

---

## 🎯 Accessibilité (WCAG 2.1 AA)

### Contrastes
```
Texte normal (16px+): Ratio 4.5:1 minimum
Grand texte (24px+): Ratio 3:1 minimum
Éléments UI: Ratio 3:1 minimum

Validé:
- White on #E30613: ✅ 4.89:1
- Gray 900 on White: ✅ 16.08:1
- Gray 700 on White: ✅ 7.48:1
```

### Focus Visible
```
Tous les éléments interactifs:
- outline: 2px solid #E30613
- outline-offset: 2px
- box-shadow: 0 0 0 3px rgba(227,6,19,0.1)
```

### ARIA Labels
```
Boutons icônes: aria-label obligatoire
Navigation: role="navigation"
Formulaires: label associés
Images: alt text descriptif
États dynamiques: aria-live regions
```

### Keyboard Navigation
```
Tab Order: Logique et séquentiel
Focus Trap: Dans les modals
Escape: Ferme les overlays
Enter/Space: Active les boutons
Arrow Keys: Navigation dans listes
```

---

## 📦 Export Assets

### Images

#### Formats
```
Logo:
- SVG (vectoriel)
- PNG (transparent, 2x et 3x pour retina)
- WebP (optimisé web)

Photos:
- WebP (qualité 85%)
- JPEG fallback (qualité 80%)
- Sizes: 320w, 640w, 1024w, 1920w

Icons:
- SVG uniquement
```

#### Naming Convention
```
logo-primary.svg
logo-white.svg
logo-monochrome.svg
icon-basketball-24.svg
player-lebron-james-400x400.webp
hero-background-1920x1080.webp
```

### Figma Export Settings
```
Logo:
- Format: SVG
- Options: Outline text

Icons:
- Format: SVG
- Size: 24×24px base
- Stroke: 2px
- Corner radius: 2px

Images:
- Format: PNG/WebP
- Scale: 2x, 3x
- Quality: 100% for PNG, 85% for WebP
```

---

## ✅ Checklist Design System

### Colors
- ✅ Primary palette defined
- ✅ Neutrals defined (9 shades)
- ✅ Semantic colors (success, error, warning, info)
- ✅ Gradients defined
- ✅ Opacity scales

### Typography
- ✅ Font families selected
- ✅ Type scale defined
- ✅ Line heights set
- ✅ Letter spacing defined
- ✅ Font weights mapped

### Spacing
- ✅ 8pt grid system
- ✅ Spacing scale (0-32)
- ✅ Container widths
- ✅ Breakpoints defined

### Components
- ✅ Buttons (3 variants)
- ✅ Cards (4 types)
- ✅ Badges
- ✅ Inputs
- ✅ Navigation
- ✅ Tables

### Layout
- ✅ Grid system
- ✅ Page templates
- ✅ Responsive rules

### Interactions
- ✅ Hover states
- ✅ Active states
- ✅ Focus states
- ✅ Disabled states
- ✅ Animations

### Accessibility
- ✅ Color contrast validated
- ✅ Focus indicators
- ✅ ARIA guidelines
- ✅ Keyboard navigation

---

## 🚀 Implémentation dans Figma

### Étape 1: Configuration
1. Créer nouveau fichier "STATDISCUTE - Design System"
2. Configurer les couleurs (Color Styles)
3. Configurer la typographie (Text Styles)
4. Créer la grille (Layout Grids)

### Étape 2: Composants
1. Créer page "Components"
2. Créer tous les composants de base
3. Définir les variants (hover, active, disabled)
4. Ajouter Auto Layout

### Étape 3: Pages
1. Créer page "Homepage"
2. Créer page "Dashboard"
3. Créer page "Betting"
4. Utiliser les composants créés

### Étape 4: Prototype
1. Créer les liens entre pages
2. Définir les interactions
3. Ajouter les animations
4. Tester le flow

---

## 📚 Ressources

### Plugins Figma Recommandés
- **Iconify**: Pour les icônes Lucide
- **Contrast**: Vérifier les contrastes WCAG
- **Stark**: Accessibilité complète
- **Auto Layout**: Espacements automatiques
- **Component**: Gestion des composants

### Outils Complémentaires
- **Figma to Code**: Export HTML/CSS
- **Anima**: Export React/Vue
- **Zeplin**: Specs pour développeurs

---

*Document créé le 23 octobre 2025*  
*Version 1.0*  
*STATDISCUTE - Sports Statistics & Betting Analytics*
