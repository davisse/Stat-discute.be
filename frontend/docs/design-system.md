# STAT-DISCUTE - Design System

**Version**: v1.0
**Date**: 2025-01-19
**Statut**: Charte validée, prête pour implémentation

---

## 📋 Table des Matières

1. [Vision & Philosophie](#vision--philosophie)
2. [Design Tokens](#design-tokens)
3. [Composants UI](#composants-ui)
4. [Patterns d'Interaction](#patterns-dinteraction)
5. [Layouts & Pages](#layouts--pages)
6. [Accessibilité](#accessibilité)
7. [Plan d'Implémentation](#plan-dimplémentation)

---

## 🎯 Vision & Philosophie

### Positionnement

**STAT-DISCUTE** est une plateforme d'analyse statistique NBA avec focus betting qui se distingue par son approche **pédagogique et anti-impulsive**.

### Principes de Design

1. **Anti-impulsivité** : Encourager l'analyse réfléchie vs le betting impulsif
2. **Progressive Disclosure** : Révéler l'information par couches (macro → micro)
3. **Focus & Respiration** : Espacement généreux, une idée à la fois
4. **Interactivité Éducative** : Visualisations qui enseignent, pas seulement qui montrent
5. **Accessibilité Universelle** : Pro et grand public

### Public Cible

- **Primaire** : Parieurs sportifs recherchant une approche analytique
- **Secondaire** : Fans NBA intéressés par les statistiques avancées
- **Ton** : Sérieux, professionnel, éducatif (pas de gamification)

### Différenciation

| Plateforme | Style | STAT-DISCUTE |
|------------|-------|--------------|
| DraftKings/FanDuel | Couleurs vives, urgency, gamification | ❌ Monochrome, calme, éducatif |
| ESPN Stats | Dense, coloré, éditorial | ❌ Spacieux, focus, analytique |
| Basketball-Reference | Basique, old-school | ✅ Moderne, interactif, visualisations |

---

## 🎨 Design Tokens

### Palette de Couleurs

#### Couleurs de Base (Monochrome)

```css
/* Fond et texte principaux */
--color-background: #000000        /* Noir pur - Fond principal */
--color-foreground: #FFFFFF        /* Blanc pur - Texte principal */

/* Gris (profondeur et hiérarchie) */
--color-gray-950: #0A0A0A         /* Cards niveau 1 */
--color-gray-900: #171717         /* Hover states, cards niveau 2 */
--color-gray-850: #1F1F1F         /* Anthracite - Cards principales */
--color-gray-800: #262626         /* Borders, separators */
--color-gray-700: #404040         /* Disabled states */
--color-gray-600: #525252         /* Secondary text */
--color-gray-500: #737373         /* Tertiary text */
--color-gray-400: #A3A3A3         /* Placeholders, labels */

/* Pattern de fond */
--dots-pattern: radial-gradient(circle, #ffffff 1px, transparent 1px)
--dots-opacity: 0.15
--dots-size: 30px 30px
```

#### Couleurs Fonctionnelles (Données uniquement)

```css
/* Statistiques et tendances */
--color-positive: #10B981         /* Win, Over, Gains, Tendance haussière */
--color-negative: #EF4444         /* Loss, Under, Pertes, Tendance baissière */
--color-neutral: #6B7280          /* Push, Neutre, Pas de mouvement */

/* Backgrounds subtils pour zones (très faible opacity) */
--color-positive-bg: rgba(16, 185, 129, 0.05)
--color-negative-bg: rgba(239, 68, 68, 0.05)
```

**⚠️ Règle stricte** : Le vert et rouge ne sont **jamais** utilisés pour l'UI (boutons, déco). Uniquement pour des données fonctionnelles (win/loss, over/under, trends).

#### Contraste et Accessibilité

| Combinaison | Ratio | Norme WCAG |
|-------------|-------|------------|
| Blanc sur Noir | 21:1 | ✅ AAA (excellent) |
| Gray-400 sur Noir | 7.5:1 | ✅ AA Large (bon) |
| Gray-500 sur Noir | 5.8:1 | ✅ AA (minimum) |
| Vert sur Noir | 6.8:1 | ✅ AA (acceptable) |
| Rouge sur Noir | 5.2:1 | ⚠️ AA limite (vérifier) |

### Typographie

#### Polices

**Police Principale (UI/Interface)**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```
- **Usage** : Titres, navigation, boutons, textes généraux
- **Import** : Via `@import` dans globals.css (déjà présent)
- **Avantages** : Variable font, excellent lisibilité, optimisée écrans

**Police Données (Chiffres/Stats)**
```css
font-family: 'JetBrains Mono', 'Roboto Mono', monospace
```
- **Usage** : Statistiques, odds, pourcentages, tableaux de chiffres
- **Import** : À ajouter
- **Avantage** : Monospace = alignement parfait des chiffres

**Police Logo (Branding)**
- **Usage** : Logo uniquement (conserver typo actuelle)

#### Scale Typographique

Basée sur 16px (1rem) avec ratio ~1.25

```css
/* Tailles */
--text-xs: 12px      /* 0.75rem - Labels, footnotes */
--text-sm: 14px      /* 0.875rem - Secondary text, table data */
--text-base: 16px    /* 1rem - Body text (défaut) */
--text-lg: 18px      /* 1.125rem - Emphasized text */
--text-xl: 20px      /* 1.25rem - Section titles */
--text-2xl: 24px     /* 1.5rem - Page titles */
--text-3xl: 30px     /* 1.875rem - Hero titles */
--text-4xl: 36px     /* 2.25rem - Display (rare) */

/* Poids */
--font-regular: 400      /* Body text */
--font-medium: 500       /* Emphasis, buttons */
--font-semibold: 600     /* Subtitles */
--font-bold: 700         /* Titles */

/* Line heights */
--leading-tight: 1.2     /* Titres */
--leading-normal: 1.5    /* Body text (défaut) */
--leading-relaxed: 1.6   /* Textes longs */
```

#### Hiérarchie Typographique

```css
/* H1 - Page Title (1 seul par page) */
.h1 {
  font-size: var(--text-3xl);      /* 30px */
  font-weight: var(--font-bold);   /* 700 */
  line-height: var(--leading-tight);
  margin-bottom: 48px;
}

/* H2 - Section Title */
.h2 {
  font-size: var(--text-2xl);      /* 24px */
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  margin-top: 48px;
  margin-bottom: 24px;
}

/* H3 - Subsection */
.h3 {
  font-size: var(--text-xl);       /* 20px */
  font-weight: var(--font-medium);
  margin-top: 32px;
  margin-bottom: 16px;
}

/* H4 - Card Title */
.h4 {
  font-size: var(--text-lg);       /* 18px */
  font-weight: var(--font-medium);
  margin-bottom: 8px;
}

/* Body Text */
.body {
  font-size: var(--text-base);     /* 16px */
  font-weight: var(--font-regular);
  line-height: var(--leading-relaxed);
}

/* Small/Secondary */
.small {
  font-size: var(--text-sm);       /* 14px */
  color: var(--color-gray-500);
}
```

### Espacement

#### Système 8px Base

```css
--space-1: 4px       /* 0.25rem - Micro-spacing (icon-text gap) */
--space-2: 8px       /* 0.5rem - Tight (button padding) */
--space-3: 12px      /* 0.75rem - Comfortable */
--space-4: 16px      /* 1rem - Default (card padding) */
--space-6: 24px      /* 1.5rem - Section spacing */
--space-8: 32px      /* 2rem - Large (between sections) */
--space-12: 48px     /* 3rem - XL (page margins) */
--space-16: 64px     /* 4rem - XXL (major sections) */
--space-24: 96px     /* 6rem - XXXL (hero spacing) */
```

#### Règles d'Utilisation

**Cards :**
- Padding interne : `24px` (space-6) minimum
- Gap entre cards : `16px` (space-4) minimum

**Sections :**
- Gap entre sections : `64-96px` (space-16 ou space-24)
- Margin top H2 : `48px` (space-12)

**Grids :**
- Gap colonnes : `24px` (space-6)
- Gap rows : `16px` (space-4)

**Page Layout :**
- Margin left/right desktop : `48px` (space-12)
- Margin left/right mobile : `24px` (space-6)
- Max content width : `1280px`

### Border Radius

```css
--radius-sm: 4px        /* Badges, small elements */
--radius-md: 8px        /* Buttons, inputs (défaut) */
--radius-lg: 12px       /* Cards */
--radius-xl: 16px       /* Large cards, modals */
--radius-2xl: 24px      /* Hero elements */
--radius-full: 9999px   /* Pills, avatars */
```

### Ombres

Ombres adaptées pour fond noir = "glows" blancs subtils

```css
--shadow-sm: 0 0 8px rgba(255, 255, 255, 0.05)    /* Subtle card lift */
--shadow-md: 0 0 16px rgba(255, 255, 255, 0.08)   /* Card hover */
--shadow-lg: 0 0 24px rgba(255, 255, 255, 0.12)   /* Modal, dropdown */
--shadow-xl: 0 0 32px rgba(255, 255, 255, 0.15)   /* Major elevation */
```

### Transitions

```css
--transition-fast: 150ms ease-out      /* Color, opacity changes */
--transition-normal: 300ms ease-out    /* Transforms, borders */
--transition-slow: 500ms ease-out      /* Complex animations */
```

---

## 🧩 Composants UI

### 1. Button

#### Variants

**Primary**
```tsx
<button className="
  bg-white text-black
  px-4 py-2 rounded-md
  font-medium text-base
  transition-all duration-300
  hover:bg-gray-100 hover:scale-105 hover:shadow-md
  active:scale-98
  focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Primary Action
</button>
```

**Secondary (Outline)**
```tsx
<button className="
  bg-transparent border border-white text-white
  px-4 py-2 rounded-md
  font-medium text-base
  transition-all duration-300
  hover:bg-white hover:text-black
  active:scale-98
">
  Secondary Action
</button>
```

**Ghost**
```tsx
<button className="
  bg-transparent text-gray-400
  px-4 py-2 rounded-md
  font-medium text-base
  transition-all duration-300
  hover:text-white hover:bg-gray-900
">
  Ghost Action
</button>
```

#### Sizes

- `sm`: `px-3 py-1.5 text-sm`
- `md`: `px-4 py-2 text-base` (défaut)
- `lg`: `px-6 py-3 text-lg`
- `xl`: `px-8 py-4 text-xl`

#### States

- **Loading** : Spinner + `disabled`
- **Disabled** : `opacity-50` + `cursor-not-allowed`
- **Focus** : `ring-2 ring-white ring-offset-2`

### 2. Input / SearchInput

```tsx
<input
  type="text"
  className="
    w-full px-4 py-3
    bg-transparent
    border border-gray-800
    rounded-md
    text-white text-base
    placeholder:text-gray-500
    transition-all duration-300
    focus:border-white focus:ring-1 focus:ring-white focus:outline-none
    disabled:opacity-50 disabled:bg-gray-900
  "
  placeholder="Rechercher un joueur..."
/>
```

#### SearchInput avec Dropdown

Voir implémentation actuelle dans `player-props/page.tsx` :
- Dropdown : `bg-black border-gray-800 rounded-lg`
- Results : `hover:bg-gray-900`
- Selected : `bg-white text-black`

### 3. Card

```tsx
<div className="
  bg-gray-950
  border border-gray-800
  rounded-lg
  p-6
  transition-all duration-300
  hover:border-white hover:shadow-md hover:-translate-y-1
">
  {/* Card content */}
</div>
```

#### Variants

- **Default** : `bg-gray-950 border-gray-800`
- **Anthracite** : `bg-gray-850 border-gray-700` (cards principales)
- **Elevated** : `bg-gray-900 border-gray-700 shadow-md`

### 4. StatCard

Composant critique pour afficher une métrique clé.

```tsx
<div className="
  bg-gray-950 border border-gray-800 rounded-lg
  p-6 min-w-[160px] min-h-[120px]
  flex flex-col justify-between
  transition-all duration-300
  hover:border-white hover:shadow-md
">
  {/* Label */}
  <div className="text-sm text-gray-400 uppercase tracking-wide">
    Points Par Match
  </div>

  {/* Value */}
  <div className="text-3xl font-bold text-white">
    28.5
  </div>

  {/* Trend Indicator */}
  <div className="flex items-center gap-1 text-sm text-green-500">
    <ArrowUpIcon className="w-4 h-4" />
    <span>+5.2%</span>
  </div>
</div>
```

#### Variants

- **Positive** : Value et trend en `text-green-500`
- **Negative** : Value et trend en `text-red-500`
- **Neutral** : Value en `text-white`, trend en `text-gray-400`

### 5. StatsTable

```tsx
<table className="w-full">
  <thead>
    <tr className="bg-gray-900 border-b border-gray-800">
      <th className="
        py-3 px-4
        text-left text-xs font-medium uppercase
        text-gray-400 tracking-wider
      ">
        Joueur
      </th>
      <th className="text-right">PPG</th>
      {/* ... */}
    </tr>
  </thead>
  <tbody>
    <tr className="
      border-b border-gray-800
      transition-colors duration-150
      hover:bg-gray-950
    ">
      <td className="py-3 px-4 text-white">Luka Doncic</td>
      <td className="py-3 px-4 text-right font-mono">28.5</td>
      {/* ... */}
    </tr>
  </tbody>
</table>
```

**Règles :**
- Chiffres : Police monospace (`font-mono`)
- Alignement : Texte left, chiffres right
- Hover : `hover:bg-gray-950`
- Responsive : Scroll horizontal sur mobile

### 6. PlayerCard

```tsx
<div className="
  bg-gray-950 border border-gray-800 rounded-lg
  p-6 w-80
  transition-all duration-300
  hover:border-white hover:shadow-md hover:scale-102
">
  {/* Photo + Nom */}
  <div className="flex items-center gap-4 mb-6">
    <img
      src="/player.jpg"
      alt="Player"
      className="w-20 h-20 rounded-full border-2 border-gray-700"
    />
    <div>
      <h3 className="text-xl font-semibold text-white">Luka Doncic</h3>
      <p className="text-sm text-gray-400">Dallas Mavericks</p>
    </div>
  </div>

  {/* Stats Grid */}
  <div className="grid grid-cols-3 gap-4">
    <div>
      <div className="text-xs text-gray-500 uppercase">PPG</div>
      <div className="text-lg font-semibold text-white font-mono">28.5</div>
    </div>
    {/* ... autres stats */}
  </div>
</div>
```

### 7. TrendIndicator

Micro-composant très réutilisable.

```tsx
{/* Positive */}
<div className="flex items-center gap-1 text-sm text-green-500">
  <ArrowUpIcon className="w-4 h-4" />
  <span>+5.2%</span>
</div>

{/* Negative */}
<div className="flex items-center gap-1 text-sm text-red-500">
  <ArrowDownIcon className="w-4 h-4" />
  <span>-3.1%</span>
</div>

{/* Neutral */}
<div className="flex items-center gap-1 text-sm text-gray-400">
  <span>0.0%</span>
</div>
```

#### Variants

- **With background pill** : Ajouter `bg-green-500/10 px-2 py-1 rounded-full`
- **Without icon** : Juste le texte avec couleur

### 8. Modal / Dialog

```tsx
{/* Overlay */}
<div className="
  fixed inset-0
  bg-black/80 backdrop-blur-sm
  z-40
  transition-opacity duration-300
" />

{/* Modal */}
<div className="
  fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
  bg-gray-900 border border-gray-700 rounded-xl
  p-8 max-w-2xl w-full
  shadow-xl
  z-50
  transition-all duration-300
">
  {/* Close button top-right */}
  {/* Modal content */}
</div>
```

### 9. Tooltip

```tsx
<div className="
  absolute bottom-full left-1/2 -translate-x-1/2 mb-2
  bg-gray-900 border border-gray-700 rounded-md
  px-3 py-2
  text-sm text-white
  shadow-lg
  whitespace-nowrap
  pointer-events-none
">
  Tooltip text
  {/* Arrow */}
  <div className="
    absolute top-full left-1/2 -translate-x-1/2
    border-4 border-transparent border-t-gray-900
  "/>
</div>
```

### 10. Loading States

**Skeleton**
```tsx
<div className="
  bg-gray-900 rounded-md
  animate-pulse
  h-4 w-full
"/>
```

**Spinner**
```tsx
<div className="
  w-6 h-6 border-2 border-gray-600 border-t-white
  rounded-full animate-spin
"/>
```

---

## 🔄 Patterns d'Interaction

### Pattern 1 : Threshold Line (Ligne Seuil Interactive)

**Usage** : "Combien de fois le joueur a marqué plus de X points ?"

#### Composants

**InteractiveLineChart**
- Base : LineChart (Recharts ou Chart.js)
- Props :
  * `data`: `{date, value, opponent, result}[]`
  * `threshold`: `number` (contrôlé par parent)
  * `onPointClick`: `(point) => void`
- Style :
  * Line : `stroke-white stroke-width-2.5`
  * Points : `fill-white r-6` avec `hover:r-8`
  * Threshold line : `stroke-white stroke-dasharray-4-4 opacity-60`
  * Zone au-dessus : `fill-green-500 opacity-5`
  * Zone en-dessous : `fill-red-500 opacity-5`
- Animation :
  * Initial : Path draw 1000ms
  * Threshold change : 300ms ease-out

**ThresholdControl**
```tsx
<div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-4">
  {/* Label */}
  <label className="text-sm text-gray-400">Seuil :</label>

  {/* Slider */}
  <input
    type="range"
    min={0} max={50}
    value={threshold}
    onChange={(e) => setThreshold(e.target.value)}
    className="flex-1"
  />

  {/* Value Input */}
  <input
    type="number"
    value={threshold}
    className="w-16 px-2 py-1 bg-transparent border border-gray-700 rounded text-white text-center"
  />

  {/* Counter */}
  <div className="text-lg font-semibold text-white">
    12/20 matchs
  </div>
</div>
```

#### Flow d'Interaction

1. User voit le graph par défaut (threshold = moyenne)
2. User drag le slider ou type une valeur
3. Threshold line se déplace avec smooth animation
4. Zones colorées s'ajustent
5. Counter se met à jour : "X/Y matchs au-dessus"
6. Points changent de couleur (vert/rouge) selon position vs threshold

### Pattern 2 : Comparison Overlay

**Usage** : Comparer 2 joueurs sur le même graph

#### Implémentation

```tsx
<InteractiveLineChart
  data={playerA.stats}
  comparisonData={playerB.stats}
  showComparison={true}
/>

{/* Légende */}
<div className="flex items-center gap-4 mt-4">
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 bg-white rounded-full" />
    <span className="text-sm text-gray-400">Luka Doncic</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 bg-gray-500 rounded-full border border-gray-400" />
    <span className="text-sm text-gray-400">Trae Young</span>
  </div>
</div>
```

#### Style

- Player A : `stroke-white solid`
- Player B : `stroke-gray-500 stroke-dasharray-4-2`
- Hover : Tooltip montrant les 2 valeurs
- Highlight : Zone où A > B en `fill-green-500 opacity-5`

### Pattern 3 : Time Range Filter

**Usage** : Filtrer la vue temporelle du graph

#### Composants

```tsx
<div className="flex items-center gap-4 mb-6">
  {/* Presets */}
  <div className="flex gap-2">
    <button className="btn-ghost">Last 10</button>
    <button className="btn-ghost">Home only</button>
    <button className="btn-ghost">vs Top 10</button>
  </div>

  {/* Range Slider */}
  <div className="flex-1">
    <input type="range" /* double slider */ />
  </div>

  {/* Date Display */}
  <div className="text-sm text-gray-400">
    Oct 15 - Dec 20
  </div>
</div>
```

#### Interaction

1. User sélectionne preset ou ajuste range
2. Graph se met à jour avec smooth transition (data filtering)
3. Stats recap cards se mettent à jour (avg dans période)

### Pattern 4 : Drill-down Progressive

**Usage** : Cliquer sur un point pour plus de détails

#### Flow

```
1. Vue Macro : Graph saison complète
   └─> Click sur point

2. Modal avec détails match :
   ├─ Context (opponent, home/away, score)
   ├─ Stats complètes du match
   ├─ Highlights video (si dispo)
   └─ Actions : "Comparer avec matchs similaires"
```

#### Modal Style

```tsx
<Modal>
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-2xl font-semibold">vs Lakers</h3>
      <p className="text-sm text-gray-400">Dec 15, 2024 • Home • W 115-108</p>
    </div>
    <button className="close-btn">×</button>
  </div>

  {/* Stats Grid */}
  <div className="grid grid-cols-3 gap-4 mb-6">
    <StatCard label="Points" value="32" trend="+8 vs avg" />
    {/* ... */}
  </div>

  {/* Actions */}
  <div className="flex gap-4">
    <button className="btn-secondary">Compare similar games</button>
    <button className="btn-ghost">View highlights</button>
  </div>
</Modal>
```

### Pattern 5 : Analyse Guidée (Anti-Impulsivité)

**Objectif** : Encourager l'exploration avant toute action

#### Flow d'Interaction

```
1. User arrive sur page joueur
   └─> Vue d'ensemble : Nom, photo, 3 stats clés

2. Pas de bouton "Bet now" visible
   └─> Call-to-action : "Analyser les tendances ▼"

3. Click "Analyser" → Reveal smooth :
   ├─ Graph de performance
   ├─ Questions suggestives :
   │  - "Comment performe-t-il vs défenses top 10 ?"
   │  - "Impact du home/away ?"
   │  - "Constance sur 10 derniers matchs ?"
   └─> Chaque question clickable → affiche viz

4. Après exploration de 2+ dimensions :
   └─> Reveal "Options de paris" (pas urgent, pas flashy)
```

#### Implémentation

**Checklist d'Exploration**
```tsx
<div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
  <h4 className="text-sm font-medium text-gray-400 mb-3">
    Dimensions analysées :
  </h4>
  <ul className="space-y-2">
    <li className="flex items-center gap-2">
      <CheckIcon className="w-4 h-4 text-green-500" />
      <span className="text-sm text-white">Performance générale</span>
    </li>
    <li className="flex items-center gap-2">
      <div className="w-4 h-4 border border-gray-600 rounded" />
      <span className="text-sm text-gray-500">vs Défenses top 10</span>
    </li>
    {/* ... */}
  </ul>
  <p className="text-xs text-gray-500 mt-3">
    Nous recommandons d'explorer au moins 3 dimensions
  </p>
</div>
```

### Pattern 6 : Confidence Indicator

**Usage** : Montrer la solidité d'une prédiction

#### Composant

```tsx
<div className="flex items-center gap-3">
  {/* Label */}
  <span className="text-sm text-gray-400">Confiance :</span>

  {/* Gauge */}
  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
    <div
      className="h-full bg-white transition-all duration-500"
      style={{ width: `${confidence}%` }}
    />
  </div>

  {/* Value */}
  <span className="text-sm font-semibold text-white">{confidence}%</span>

  {/* Info tooltip */}
  <InfoIcon className="w-4 h-4 text-gray-500 cursor-help" />
</div>
```

#### Tooltip Explicatif

```
"Basé sur 15 matchs similaires
Précision historique : 73%
Facteurs : Opponent, Home/Away, Rest days"
```

#### Couleur (subtile)

- 0-40% : `bg-gray-500` (insufficient data)
- 40-70% : `bg-white` (moderate)
- 70-100% : `bg-white` (high)

Pas de vert/rouge pour ne pas suggérer "bon" ou "mauvais" bet.

---

## 📐 Layouts & Pages

### Layout Pattern : "Focus Dashboard"

#### Structure Générale

```
┌─────────────────────────────────────────────────┐
│ Navbar (96px height)                            │
│ Logo (centered) + Search + Navigation           │
├─────────────────────────────────────────────────┤
│                                                 │
│  Container (max-w-7xl, px-12)                   │
│  ════════════════════════════════════════════   │
│  ║ Hero Section                             ║   │ ← 48px margin top
│  ║ Player Header : Photo + Name + Stats    ║   │
│  ════════════════════════════════════════════   │
│                                                 │
│  ╔═══════════════════╗     ╔═════════════════╗  │ ← 64px gap
│  ║ Main Content      ║     ║ Sidebar         ║  │
│  ║ (60% width)       ║     ║ (35% width)     ║  │
│  ║                   ║     ║                 ║  │
│  ║ Graph + Controls  ║     ║ Context Cards   ║  │
│  ║                   ║     ║                 ║  │
│  ╚═══════════════════╝     ╚═════════════════╝  │
│                                                 │
│  ════════════════════════════════════════════   │ ← 96px gap
│  ║ Deep Dive Section (Progressive)         ║   │
│  ════════════════════════════════════════════   │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Spacing Rules

- **Page margins** : `px-12` (48px) desktop, `px-6` (24px) mobile
- **Max content width** : `max-w-7xl` (1280px)
- **Section gaps** : `gap-16` ou `gap-24` (64-96px)
- **Hero margin top** : `mt-12` (48px)
- **Max 2 colonnes** : Main (60%) + Sidebar (35%), gap 5%

### Page Example : Player Analysis

```tsx
export default function PlayerAnalysisPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navbar (déjà existante) */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-12 py-12">

        {/* Hero Section */}
        <section className="mb-16">
          <PlayerHeader
            player={player}
            keyStats={[
              { label: "PPG", value: "28.5", trend: "+5.2%" },
              { label: "Win %", value: "65%", trend: "+8.3%" },
              { label: "Over %", value: "58%", trend: "-2.1%" }
            ]}
          />
        </section>

        {/* Main + Sidebar */}
        <div className="grid grid-cols-[60%_35%] gap-[5%] mb-24">

          {/* Main Content */}
          <div className="space-y-8">
            <ThresholdControl value={threshold} onChange={setThreshold} />
            <InteractiveLineChart
              data={stats}
              threshold={threshold}
            />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <ConfidenceIndicator value={75} />
            <ContextCard title="Next Opponent">
              {/* ... */}
            </ContextCard>
            <AnalysisChecklist items={exploredDimensions} />
          </aside>
        </div>

        {/* Deep Dive Section (Progressive) */}
        <section className="mb-24">
          <h2 className="text-2xl font-semibold mb-8">
            Analyse Approfondie
          </h2>
          <Tabs>
            <Tab label="vs Top 10 Teams">{/* ... */}</Tab>
            <Tab label="Home vs Away">{/* ... */}</Tab>
            <Tab label="Back-to-Back Games">{/* ... */}</Tab>
          </Tabs>
        </section>

      </main>
    </div>
  )
}
```

### Responsive Strategy

**Breakpoints**
- `sm`: 640px (mobile landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (laptop)
- `xl`: 1280px (desktop)

**Adaptations**

**Mobile (< 640px)**
```css
/* Stack colonnes */
.grid-cols-[60%_35%] → .grid-cols-1

/* Reduce spacing */
px-12 → px-6
gap-24 → gap-12

/* Navbar */
Logo plus petit (w-48 au lieu de w-64)
Navigation hamburger

/* Tables */
Horizontal scroll ou stack cards
```

**Tablet (640-1024px)**
```css
/* 2 colonnes pour stats grid */
.grid-cols-3 → .grid-cols-2

/* Sidebar collapsible */
Position: fixed avec toggle
```

**Desktop (> 1024px)**
```css
/* Full layout comme défini */
/* Hover states activés */
/* Sidebar fixe visible */
```

---

## ♿ Accessibilité

### Standards WCAG 2.1 AA

#### Contraste

✅ **Respecté** :
- Blanc sur noir : 21:1 (AAA)
- Gray-400 sur noir : 7.5:1 (AA Large)
- Gray-500 sur noir : 5.8:1 (AA)

⚠️ **À vérifier** :
- Rouge (#EF4444) sur noir : 5.2:1 (limite AA)
- Solution : Utiliser rouge uniquement pour data, pas pour UI

#### Navigation Clavier

**Focus visible**
```css
:focus-visible {
  outline: 2px solid white;
  outline-offset: 2px;
}

/* Alternative : ring utility */
.focus-visible:ring-2 ring-white ring-offset-2 ring-offset-black
```

**Tabindex**
- Tous les éléments interactifs : `tabindex="0"` (ordre naturel)
- Skip to main content : Premier élément focusable

**Keyboard shortcuts**
- `?` : Ouvrir help/shortcuts
- `Ctrl+K` ou `Cmd+K` : Focus search
- `Esc` : Fermer modals

#### Screen Readers

**ARIA Labels**
```tsx
{/* Boutons avec icônes uniquement */}
<button aria-label="Close modal">
  <XIcon />
</button>

{/* ARIA live regions pour data updates */}
<div aria-live="polite" aria-atomic="true">
  {liveStats}
</div>

{/* Hidden labels pour inputs visuellement labelés */}
<label htmlFor="threshold" className="sr-only">
  Threshold value
</label>
<input id="threshold" type="number" />
```

**Rôles sémantiques**
```tsx
<nav role="navigation">
<main role="main">
<aside role="complementary">
<table role="table">
```

**Alt text descriptif**
```tsx
<img
  src="/player.jpg"
  alt="Luka Doncic shooting a three-pointer for Dallas Mavericks"
/>
```

#### Animations Respectueuses

**Prefers Reduced Motion**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Garder uniquement transitions de couleur/opacity */
  * {
    transition-property: color, background-color, opacity !important;
  }
}
```

#### Touch Targets

Minimum 44×44px pour tous les éléments interactifs sur mobile.

```css
@media (hover: none) and (pointer: coarse) {
  button, a, input[type="checkbox"], input[type="radio"] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

---

## 🚀 Plan d'Implémentation

### Phase 1 : Design Tokens (Semaine 1)

**Objectif** : Établir les fondations CSS

**Tasks** :
1. ✅ Mettre à jour `globals.css` avec toutes les variables CSS
2. ✅ Importer JetBrains Mono via Google Fonts
3. ✅ Définir les utility classes custom si nécessaire
4. ✅ Créer un fichier `design-tokens.ts` pour usage TypeScript

**Deliverable** : Design tokens accessibles via CSS variables et TypeScript

### Phase 2 : Composants de Base (Semaine 2)

**Objectif** : Créer les building blocks réutilisables

**Priority Order** :
1. Button (toutes variants)
2. Input / SearchInput
3. Card
4. Modal / Dialog
5. Tooltip
6. Loading states (Skeleton, Spinner)

**Structure** : `frontend/src/components/ui/`

### Phase 3 : Data Display (Semaine 3-4)

**Objectif** : Composants d'affichage de données

**Components** :
1. StatCard (avec TrendIndicator)
2. StatsTable (avec tri, responsive)
3. PlayerCard
4. TeamCard
5. ComparisonCard

**Structure** : `frontend/src/components/stats/`

### Phase 4 : Data Visualization (Semaine 5-6) - CRITIQUE

**Objectif** : Composants de visualisation interactive

**Components** :
1. InteractiveLineChart (avec threshold)
2. ThresholdControl (slider + presets)
3. BarChart
4. RadarChart
5. Heatmap
6. SparkLine

**Dépendances** :
- Recharts ou Chart.js (à décider)
- D3.js si interactions complexes

**Structure** : `frontend/src/components/charts/`

### Phase 5 : Betting Specific (Semaine 7)

**Objectif** : Composants spécifiques au betting

**Components** :
1. OddsDisplay
2. ConfidenceIndicator
3. ContextLayers (progressive disclosure)
4. AnalysisChecklist

**Structure** : `frontend/src/components/betting/`

### Phase 6 : Pages & Layouts (Semaine 8-9)

**Objectif** : Assembler les composants en pages complètes

**Pages** :
1. PlayerAnalysis (player-props amélioré)
2. TeamAnalysis
3. MatchupComparison
4. BettingDashboard

**Structure** : `frontend/src/app/(dashboard)/`

### MVP Minimum (2 semaines)

Pour valider l'approche rapidement :

**Composants MVP** :
1. Design tokens ✅
2. Button ✅
3. Input ✅
4. Card ✅
5. StatCard ✅
6. InteractiveLineChart ✅
7. ThresholdControl ✅
8. StatsTable ✅

**Page MVP** :
- PlayerAnalysis (version simplifiée)

**Objectif** : Expérience complète bout-en-bout pour 1 use case

---

## 📚 Ressources & Références

### Documentation Technique

- **Next.js 16** : https://nextjs.org/docs
- **React 19** : https://react.dev
- **Tailwind CSS v4** : https://tailwindcss.com/docs
- **Recharts** : https://recharts.org/en-US
- **WCAG 2.1** : https://www.w3.org/WAI/WCAG21/quickref/

### Inspiration Design

- **Bloomberg Terminal** : Minimalisme, focus données
- **Robinhood** : Visualisations élégantes
- **Linear** : UI spacieuse, moderne
- **Stripe Dashboard** : Hiérarchie claire

### Outils

- **Contrast Checker** : https://webaim.org/resources/contrastchecker/
- **Figma** : Maquettes et prototypes
- **Storybook** : Documentation composants (optionnel)

---

## 🔄 Changelog

### v1.0 (2025-01-19)
- ✅ Charte graphique complète validée
- ✅ Palette monochrome noir/blanc/gris anthracite
- ✅ Système d'espacement 8px
- ✅ Composants UI spécifiés
- ✅ Patterns d'interaction définis
- ✅ Approche anti-impulsivité intégrée
- ✅ Visualisations interactives (threshold lines)
- ✅ Plan d'implémentation en 9 semaines

---

**Document maintenu par** : Claude Code
**Dernière mise à jour** : 2025-01-19
**Prochaine révision** : Après Phase 1 (Design Tokens)