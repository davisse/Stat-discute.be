# 🎨 STATDISCUTE - Guide Visuel & Maquettes Figma

## 📋 Instructions pour Figma

Ce document fournit des descriptions détaillées de chaque composant et page pour une création facile dans Figma.

---

## 🖼️ Structure du Fichier Figma

### Pages à Créer

1. **🎨 Design System** - Tous les tokens, couleurs, typo
2. **🧩 Components** - Bibliothèque de composants
3. **📱 Mobile Screens** - Maquettes mobiles
4. **💻 Desktop Screens** - Maquettes desktop
5. **🔄 User Flows** - Prototypes interactifs

---

## 1️⃣ PAGE: DESIGN SYSTEM

### 1.1 Color Palette

**Frame: 1920×1080px**

#### Section: Primary Colors
```
Layout: Grille 5 colonnes, gap 24px

Carte couleur (pour chaque teinte):
- Rectangle: 200×200px
- Border radius: 16px
- Fond: [couleur]
- Texte centré:
  - Nom: Inter SemiBold 16px (blanc ou noir selon contraste)
  - Hex: Inter Regular 14px
  - RGB: Inter Regular 12px

Couleurs à créer:
1. Primary 500 (#FF1725)
2. Primary 600 (#E30613) ⭐ PRINCIPALE
3. Primary 700 (#C00511)
4. Primary 800 (#A00410)
5. Primary 100 (#FEE2E2)
```

#### Section: Neutrals
```
Grille horizontale, 10 colonnes

Pour chaque gray:
- Rectangle: 160×160px
- Border radius: 12px
- Fond: Gray [50-900]
- Label en dessous
```

#### Section: Semantic Colors
```
4 colonnes (Success, Error, Warning, Info)

Chaque colonne:
- 3 rectangles empilés (100, 500, 600)
- Taille: 180×100px
- Gap: 16px
```

### 1.2 Typography Scale

**Frame: 1920×1200px**

```
Layout: Vertical stack, gap 32px

Pour chaque niveau typo (H1 à Caption):

Container:
- Width: 100%
- Padding: 24px
- Background: White
- Border: 1px solid #E8E8E8
- Border radius: 12px

Contenu:
1. Label (en haut):
   - Text: "H1 - Hero Title" (ou autre)
   - Font: Inter Medium 500
   - Size: 14px
   - Color: #6B6B6B

2. Exemple de texte:
   - Text: "The quick brown fox jumps"
   - Font: [selon spécifications]
   - Size: [selon spécifications]
   - Color: [selon spécifications]

3. Specs (en bas):
   - Font-size / Line-height / Weight
   - Inter Regular 400, 12px
   - Color: #8C8C8C
```

### 1.3 Spacing Scale

**Frame: 1200×1600px**

```
Pour chaque espacement (0, 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32):

Ligne horizontale:
1. Label gauche:
   - "Space-4"
   - "16px / 1rem"
   - Inter Medium 500, 14px

2. Rectangle visuel:
   - Width: [valeur de l'espace]
   - Height: 40px
   - Fill: #E30613
   - Border radius: 4px

3. Mesure au-dessus:
   - Ligne avec flèches
   - Dimension annotée
```

### 1.4 Shadows Examples

**Frame: 1600×800px**

```
Grille 3×2

Pour chaque shadow (xs, sm, base, md, lg, xl):

Carte:
- Rectangle: 240×240px
- Border radius: 16px
- Background: White
- Shadow: [selon specs]

Label en dessous:
- "Shadow SM"
- "0 1px 3px..."
```

---

## 2️⃣ PAGE: COMPONENTS LIBRARY

### 2.1 Buttons Component

**Frame: 1920×1200px**

#### Section: Primary Buttons

```
Grille horizontale: 3 colonnes (Small, Medium, Large)

Pour chaque taille:

Variants à créer (component Figma):

1. Default State:
   - Rectangle avec auto-layout
   - Padding: [selon taille]
   - Background: #E30613
   - Border radius: 8px
   - Text: "Button Text"
   - Font: Inter SemiBold 600
   - Color: White
   - Shadow: 0 1px 2px rgba(0,0,0,0.05)

2. Hover State:
   - Background: #C00511
   - Shadow: 0 4px 8px rgba(227,6,19,0.2)
   - (ajouter flèche ↑ 1px dans Figma)

3. Active State:
   - Background: #A00410
   - Shadow: réduite

4. Disabled State:
   - Background: #D1D1D1
   - Text color: #8C8C8C
   - Opacity: 0.5
```

#### Section: Secondary Buttons (Outline)

```
Même structure que Primary

Différences:
- Background: Transparent
- Border: 2px solid #E30613
- Text color: #E30613

Hover:
- Background: #FEE2E2
- Border color: #C00511
```

#### Section: Ghost Buttons

```
Background: Transparent
Border: None
Text color: #4A4A4A

Hover:
- Background: #F5F5F5
- Text color: #1A1A1A
```

### 2.2 Cards Component

**Frame: 1920×1400px**

#### Base Card

```
Frame: 400×300px
Auto-layout: Vertical, padding 24px, gap 16px
Background: White
Border: 1px solid #E8E8E8
Border radius: 12px
Shadow: 0 1px 3px rgba(0,0,0,0.1)

États:
1. Default
2. Hover (border: #E30613, shadow augmentée)
```

#### Stat Card

```
Frame: 320×180px
Auto-layout: Vertical, padding 24px

Contenu:
1. Header (horizontal):
   - Icon (gauche): 20×20px, #6B6B6B
   - Title (droite): Inter Medium 500, 14px, #6B6B6B

2. Value:
   - Text: "32.5"
   - Font: Inter Bold 700, 32px, #1A1A1A
   - Margin top: 16px

3. Change:
   - Text: "+12.3% vs last month"
   - Font: Inter Regular 400, 12px
   - Color: #10B981 (si positif) ou #DC2626 (si négatif)
   - Icon: TrendingUp ou TrendingDown (12×12px)

4. Description (optionnel):
   - Font: Inter Regular 400, 12px, #8C8C8C
```

#### Player Card

```
Frame: 340×240px
Auto-layout: Vertical, padding 20px, gap 16px

Section 1: Avatar + Info
- Auto-layout: Horizontal, gap 12px

  Avatar:
  - Circle: 56×56px
  - Image ou placeholder
  - Border: 3px solid #E30613

  Player Info (vertical):
  - Name: Inter SemiBold 600, 18px, #1A1A1A
  - Team: Inter Regular 400, 14px, #6B6B6B
  
  Badge (à droite):
  - "PG" ou autre position
  - Background: #F5F5F5
  - Padding: 4px 12px
  - Border radius: 12px

Section 2: Stats Grid
- Border top: 1px solid #E8E8E8
- Padding top: 16px
- Grid: 3 colonnes égales
- Text align: center

  Pour chaque stat:
  - Value: Inter Bold 700, 24px, #1A1A1A
  - Label: Inter Regular 400, 12px, #8C8C8C
  
Section 3: Trend
- Horizontal, center, gap 4px
- Icon: TrendingUp/Down (16×16px)
- Text: "En forme" ou "En baisse"
- Font: Inter Medium 500, 14px
- Color: #10B981 ou #DC2626
```

#### Game Card

```
Frame: 360×280px
Auto-layout: Vertical, padding 20px, gap 16px

Header:
- Horizontal, space-between
- Status badge:
  - "🔴 EN DIRECT" si live
  - Background: #DC2626 (live) ou #F5F5F5 (scheduled)
  - Color: White (live) ou #4A4A4A
  - Padding: 4px 12px
  - Border radius: 12px
  - Font: Inter SemiBold 600, 12px

Teams Section:
- Auto-layout: Vertical, gap 12px

  Team Row (répéter 2×):
  - Horizontal, space-between
  - Team name: Inter SemiBold 600, 16px
  - Score: Inter Bold 700, 28px
  - Border bottom: 1px solid #E8E8E8

Odds Section (si scheduled):
- Border top: 1px solid #E8E8E8
- Padding top: 16px
- Grid: 3 colonnes

  Odd Column:
  - Label: "Spread"
  - Badge: "-5.5"
  - Font: Inter Medium 500, 12px
```

### 2.3 Badges Component

**Frame: 1200×800px**

```
Grille: 4 colonnes × 2 lignes

Pour chaque variant (Default, Primary, Success, Error, Warning, Info):

Badge:
- Auto-layout: Horizontal, padding 4px 12px
- Border radius: 12px
- Font: Inter Medium 500, 12px
- Letter spacing: 0.01em
- Text transform: UPPERCASE
- Background: [selon variant]
- Color: [selon variant]

Examples:
- "LIVE"
- "NEW"
- "WINNER"
- "ERROR"
- "ALERT"
- "INFO"
```

### 2.4 Inputs Component

**Frame: 1200×1000px**

#### Text Input

```
Frame: 400×56px
Auto-layout: Vertical, gap 8px

Label:
- Text: "Email Address"
- Font: Inter Medium 500, 14px, #4A4A4A

Input Field:
- Rectangle: 100%×48px
- Border: 2px solid #D1D1D1
- Border radius: 8px
- Padding: 12px 16px
- Placeholder: "Enter your email"
- Font: Inter Regular 400, 16px
- Placeholder color: #ADADAD

États:
1. Default
2. Focus (border: #E30613, shadow)
3. Error (border: #DC2626)
4. Disabled (background: #F5F5F5)
```

#### Select Dropdown

```
Même structure que Text Input

Plus:
- Icon à droite: ChevronDown
- Icon size: 20×20px
- Icon color: #6B6B6B
```

---

## 3️⃣ PAGE: HOMEPAGE (DESKTOP)

### Frame: 1920×4500px

### 3.1 Header (Sticky)

```
Position: Top 0
Width: 100%
Height: 64px
Background: White/95% + Blur
Border bottom: 1px solid #E8E8E8
Padding: 0 48px

Auto-layout: Horizontal, space-between

Section Gauche:
- Logo STATDISCUTE
- Size: 180×50px

Section Centre:
- Navigation links (horizontal, gap 32px)
  - "Joueurs"
  - "Équipes"
  - "Paris Sportifs"
  - "Analyses"
- Font: Inter Medium 500, 15px, #4A4A4A
- Active link: #E30613, bold, border-bottom 2px

Section Droite:
- Button Primary: "S'abonner"
- Size: Medium
```

### 3.2 Hero Section

```
Height: 800px
Background: Gradient (#E30613 → #C00511 → #A00410)
Padding: 128px 48px
Text align: Center

Contenu (vertical stack, gap 24px):

1. Badge:
   - "🔥 L'outil #1 pour les paris NBA/WNBA"
   - Background: rgba(255,255,255,0.1)
   - Border: 1px solid rgba(255,255,255,0.2)
   - Color: White
   - Padding: 6px 16px
   - Border radius: 16px

2. H1:
   - "Analysez les stats,"
   - "Gagnez vos paris"
   - Font: Inter Bold 700, 60px
   - Line height: 1.1
   - Color: White

3. Description:
   - "Des milliers de statistiques NBA et WNBA..."
   - Font: Inter Regular 400, 20px
   - Color: rgba(255,255,255,0.9)
   - Max width: 700px

4. CTA Buttons (horizontal, gap 16px):
   - Button: "Voir nos offres" (White bg, #E30613 text)
   - Button: "Découvrir" (Outline white)

5. Stats Grid (3 colonnes, gap 64px):
   - Column structure:
     - Value: "10K+" (48px bold)
     - Label: "Stats analysées" (14px)
     - Color: White
```

### 3.3 Features Section

```
Height: Auto
Background: #F5F5F5
Padding: 80px 48px

Section Header:
- H2: "Pourquoi choisir STATDISCUTE ?"
- Description
- Center aligned
- Margin bottom: 64px

Features Grid:
- Grid: 3 colonnes × 2 lignes
- Gap: 24px
- Max width: 1280px

Feature Card (répéter 6×):
- Frame: Auto × 240px
- Card component (from library)
- Border: 2px solid #E8E8E8
- Hover: border #E30613

Contenu:
1. Icon Container:
   - 48×48px
   - Background: #F5F5F5
   - Border radius: 12px
   - Icon: 24×24px, [couleur variant]

2. Title:
   - "Analyse Rapide"
   - Font: Inter SemiBold 600, 20px

3. Description:
   - "Accédez instantanément..."
   - Font: Inter Regular 400, 16px, #6B6B6B
   - Line height: 1.6
```

### 3.4 CTA Section

```
Height: 400px
Background: Gradient (#E30613 → #C00511)
Padding: 80px 48px
Text align: Center
Color: White

Contenu:
1. H2: "Prêt à améliorer vos paris sportifs ?"
2. Description
3. Button: "Commencer gratuitement"
   - White background
   - #E30613 text
   - Icon: ArrowRight
```

### 3.5 Pricing Section

```
Height: Auto
Background: White
Padding: 80px 48px

Header:
- H2 + Description
- Center aligned

Pricing Grid:
- Grid: 3 colonnes
- Gap: 32px
- Max width: 1120px
- Center aligned

Pricing Card (répéter 3×):
- Frame: 380×600px
- Card component

  Card Featured (centre):
  - Scale: 1.05
  - Border: 2px solid #E30613
  - Shadow: Enhanced
  - Badge "Populaire" en haut

Contenu:
1. Header:
   - Badge (si featured)
   - Title: "Premium"
   - Description: "Pour les parieurs sérieux"

2. Price:
   - "199€" (48px bold)
   - "/mois" (16px regular)

3. Features List:
   - Auto-layout: Vertical, gap 12px
   - Item structure:
     - Icon Check (20px, green)
     - Text (14px)

4. Button:
   - "Souscrire"
   - Primary (si featured) ou Outline
   - Full width
```

### 3.6 Footer

```
Height: 200px
Background: #F5F5F5
Border top: 1px solid #E8E8E8
Padding: 32px 48px

Layout: Horizontal, space-between

Section Gauche:
- Copyright text
- Font: Inter Regular 400, 14px, #8C8C8C

Section Droite:
- Links horizontal (gap 24px)
  - "Mentions légales"
  - "Confidentialité"
  - "Contact"
- Font: Inter Regular 400, 14px
- Hover: #E30613
```

---

## 4️⃣ PAGE: HOMEPAGE (MOBILE)

### Frame: 375×3500px

### 4.1 Mobile Header

```
Height: 64px
Padding: 0 16px
Background: White + Blur
Border bottom: 1px solid #E8E8E8

Layout: Horizontal, space-between

Logo: 140×40px

Hamburger Menu Icon:
- Button: 40×40px
- Icon: Menu (24×24px)
- Background: Transparent
- Border: None
```

### 4.2 Mobile Menu (Overlay)

```
Position: Fixed, right 0
Width: 280px (ou 100% si < 375px)
Height: 100vh
Background: White
Padding: 24px
Shadow: -4px 0 12px rgba(0,0,0,0.1)

Overlay:
- Position: Fixed
- Width: 100vw
- Height: 100vh
- Background: rgba(0,0,0,0.5)

Contenu:
1. Close Button (top right):
   - Icon: X
   - Size: 24×24px

2. Navigation (vertical, gap 24px):
   - Links
   - Font: Inter Medium 500, 18px

3. Button:
   - "S'abonner"
   - Full width
   - Margin top: 32px
```

### 4.3 Mobile Hero

```
Height: 600px
Padding: 64px 16px
(même structure que desktop, tailles réduites)

H1: 36px
Description: 16px
Buttons: Stack vertical, full width
Stats Grid: Reste 3 colonnes, mais plus compact
```

### 4.4 Mobile Features

```
Padding: 48px 16px

Grid: 1 colonne
Gap: 16px

Feature Cards: Full width
```

### 4.5 Mobile Pricing

```
Grid: 1 colonne
Gap: 24px

Pricing Cards: Full width
Scroll horizontal si besoin (avec swipe gesture)
```

---

## 5️⃣ PAGE: BETTING DASHBOARD (DESKTOP)

### Frame: 1920×2400px

### 5.1 Dashboard Layout

```
Layout: Grid
Grid template: "sidebar main" / 280px 1fr

Sidebar (gauche):
- Width: 280px
- Height: 100vh
- Position: Fixed
- Top: 64px (sous header)
- Background: White
- Border right: 1px solid #E8E8E8
- Padding: 24px 16px

Navigation Item (répéter):
- Auto-layout: Horizontal, gap 12px
- Padding: 12px 16px
- Border radius: 8px
- Hover: Background #F5F5F5
- Active: Background #FEE2E2, color #E30613, border-left 3px

Main Content:
- Margin left: 280px
- Padding: 24px
- Background: #FAFAFA
- Min height: calc(100vh - 64px)
```

### 5.2 Today's Games Section

```
Section Header:
- Horizontal, space-between
- H2: "Matchs du jour"
- Filter buttons

Games Grid:
- Grid: repeat(auto-fill, minmax(360px, 1fr))
- Gap: 16px

Game Card (répéter pour chaque match):
- Utiliser "Game Card" component
- Width: 100%
```

### 5.3 Analytics Panel

```
Section:
- Margin top: 32px

Header:
- H2: "Analyses & Tendances"

Grid: 2 colonnes
Gap: 24px

Column 1: Top Players
- Card avec table
- Headers: Joueur, Équipe, Minutes, PPG
- Rows: 10 joueurs
- Hover row: Background #F5F5F5

Column 2: Contextual Stats
- Card avec form
- Select player 1
- Select player 2
- Button: "Analyser"
- Results chart (Chart.js visual)
```

### 5.4 Odds Movement Chart

```
Full width card
Padding: 24px

Chart Container:
- Line chart (simuler visuellement)
- X-axis: Time
- Y-axis: Odds
- Multiple lines (différents bookmakers)
- Legend en haut
- Tooltip sur hover
```

---

## 6️⃣ PAGE: BETTING DASHBOARD (MOBILE)

### Frame: 375×2000px

### 6.1 Mobile Dashboard

```
No sidebar
Full width content
Padding: 16px

Top Navigation:
- Tabs horizontal scroll
- "Matchs du jour", "Analyses", "Historique"
- Sticky below header
```

### 6.2 Mobile Game Cards

```
Grid: 1 colonne
Full width cards
Gap: 16px

Game Card:
- Même structure que desktop
- Optimisé pour touch (min 44px touch targets)
- Odds section: Horizontal scroll si besoin
```

### 6.3 Mobile Analytics

```
Accordion style
Sections collapsibles
Full width

Top Players:
- Table remplacée par cards list
- Swipe pour voir plus de stats

Contextual Stats:
- Form en modal bottom sheet
- Results en card séparée
```

---

## 7️⃣ PROTOTYPING

### Interactions à Créer

#### Navigation
```
Logo → Homepage
Nav Links → Pages respectives
Mobile Menu:
  - Hamburger → Open overlay
  - X → Close overlay
  - Overlay click → Close
```

#### Buttons
```
Hover: État hover (transform + shadow)
Click: État active, puis navigation
```

#### Cards
```
Hover: Border color + shadow change
Click: Ouvre détails (modal ou nouvelle page)
```

#### Forms
```
Focus: Input border change
Submit: Loading state, puis success
```

### Animations
```
Page transitions: Fade in 300ms
Modal open: Slide in from right 300ms
Hover effects: 200ms ease
Menu toggle: 300ms ease
```

### Variants à Créer
```
Button: Default, Hover, Active, Disabled
Card: Default, Hover
Input: Default, Focus, Error, Disabled
Badge: Default, Primary, Success, Error
Navigation Item: Default, Hover, Active
```

---

## 8️⃣ EXPORT SPECS

### Assets à Exporter

#### Logo
```
- logo-primary.svg (couleur)
- logo-white.svg (blanc)
- logo-monochrome.svg (noir)
- favicon.png (32×32, 64×64)
```

#### Icons
```
- icons-24.svg (set complet Lucide)
- Format: SVG
- Stroke: 2px
```

#### Images
```
- hero-background.webp (1920×800)
- player-avatars (400×400)
- team-logos (200×200)
```

### Export Settings Figma

```
1. Select all components
2. Export settings:
   - Format: SVG (pour components)
   - Format: PNG 2x (pour images)
   - Format: WebP (pour photos)

3. Naming:
   - component-name-variant.svg
   - icon-name-24.svg
   - image-name-1920w.webp
```

---

## 9️⃣ CHECKLIST FINAL

### Avant de Commencer
- [ ] Installer Inter font
- [ ] Installer Lucide icons plugin
- [ ] Créer structure de pages
- [ ] Configurer grille (1280px container)

### Design System
- [ ] Créer color styles (Primary, Grays, Semantic)
- [ ] Créer text styles (H1-H6, Body, Caption)
- [ ] Créer effect styles (Shadows)
- [ ] Créer layout grids (Desktop, Tablet, Mobile)

### Components
- [ ] Buttons (3 variants × 3 sizes × 4 states)
- [ ] Cards (4 types × 2 states)
- [ ] Badges (6 variants)
- [ ] Inputs (4 states)
- [ ] Navigation items
- [ ] Tables

### Pages Desktop
- [ ] Homepage complète
- [ ] Dashboard layout
- [ ] Betting page
- [ ] Player detail page
- [ ] Team detail page

### Pages Mobile
- [ ] Homepage mobile
- [ ] Mobile menu
- [ ] Dashboard mobile
- [ ] Betting mobile

### Prototype
- [ ] Lier toutes les pages
- [ ] Ajouter interactions hover
- [ ] Ajouter transitions
- [ ] Tester le flow complet

### Export & Handoff
- [ ] Exporter assets
- [ ] Générer specs Zeplin/Inspect
- [ ] Documenter interactions
- [ ] Partager avec devs

---

## 🎯 Tips Figma

### Raccourcis Utiles
```
K: Scale tool
R: Rectangle
T: Text
O: Ellipse
A: Auto layout
Cmd+D: Duplicate
Cmd+G: Group
Cmd+Shift+G: Ungroup
Option+Drag: Duplicate
Shift+A: Auto layout (toggle)
```

### Plugins Recommandés
```
1. Iconify - Pour icons Lucide
2. Stark - Accessibilité
3. Contrast - Check contrasts
4. Content Reel - Dummy data
5. Lorem Ipsum - Texte placeholder
6. Unsplash - Photos
7. Figma to Code - Export React
8. Auto Layout - Quick layouts
```

### Organisation
```
1. Nommer clairement les layers
2. Utiliser frames au lieu de groups
3. Créer components pour réutilisation
4. Utiliser variants pour états
5. Documenter avec descriptions
6. Utiliser constraints pour responsive
7. Créer master components page
8. Versionner avec branches
```

---

**Document créé pour STATDISCUTE - Design System**  
*Version 1.0 - 23 octobre 2025*
