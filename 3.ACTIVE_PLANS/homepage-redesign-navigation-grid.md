# Homepage Redesign - Navigation Grid Implementation Plan

**Status**: Implémenté ✅
**Date**: 2025-01-09
**Auteur**: Claude (Expert UX/UI Frontend)
**Fichier cible**: `frontend/src/app/page.tsx`

---

## 1. Objectif

Transformer la homepage de 5+ viewport heights de scroll vers une structure compacte avec:
- Hero section (70vh) - **inchangé**
- Navigation Grid section (~50vh) - **nouveau**
- Footer section - **inchangé**

**Gain scroll estimé**: 73% (520vh → 140vh)

---

## 2. Analyse de l'État Actuel

### Structure du fichier `page.tsx` (526 lignes)

| Lignes | Composant | Action |
|--------|-----------|--------|
| 1-8 | Imports | **MODIFIER** (ajouter lucide-react) |
| 9-28 | Types (NavLinkProps, SectionProps) | **MODIFIER** (ajouter CardData) |
| 30-63 | `NavLink` component | **CONSERVER** (réutiliser pattern) |
| 65-80 | `stickyNavItems` array | **MODIFIER** (3 sections) |
| 82-206 | `FixedNav` component | **CONSERVER** |
| 208-321 | `AnimatedSection` component | **SUPPRIMER** (113 lignes) |
| 323-406 | `HeroSection` component | **CONSERVER** |
| 408-440 | `FooterSection` component | **CONSERVER** |
| 442-489 | `sections` data array | **REMPLACER** (nouvelle structure) |
| 491-513 | `HomeContent` component | **MODIFIER** |
| 515-525 | Export | **CONSERVER** |

### Bilan des changements

- **Supprimer**: ~120 lignes (AnimatedSection + sections data)
- **Ajouter**: ~150 lignes (NavigationGrid + cards data + types)
- **Modifier**: ~30 lignes (imports, HomeContent, stickyNavItems)
- **Variation nette**: +30 lignes

---

## 3. Spécifications Techniques

### 3.1 Nouvelle Interface TypeScript

```typescript
interface CardData {
  id: string
  section: 'equipes' | 'joueurs' | 'betting'
  number: string
  category: string
  href: string
  icon: LucideIcon
  title: string
  features: string[]
  badge?: string
  badgeColor?: string
}

type SectionColorKey = 'equipes' | 'joueurs' | 'betting'
```

### 3.2 Données des 6 Cartes (Liens Vérifiés)

| # | Section | Titre | Lien | Icône |
|---|---------|-------|------|-------|
| 1 | equipes | Équipes | `/teams` | Users |
| 2 | equipes | Matchs du Jour | `/games` | Calendar |
| 3 | joueurs | Recherche Joueur | `/players` | Search |
| 4 | betting | Totals O/U | `/betting/totals` | BarChart3 |
| 5 | betting | Value Finder | `/betting/value-finder` | TrendingUp |
| 6 | betting | Analyse Q1 | `/analysis/q1-value` | LineChart |

### 3.3 Système de Couleurs par Section

```typescript
const sectionColors: Record<SectionColorKey, {
  badge: string
  icon: string
  hover: string
}> = {
  equipes: {
    badge: 'bg-emerald-500/20 text-emerald-400',
    icon: 'text-emerald-500',
    hover: 'hover:border-emerald-500/50'
  },
  joueurs: {
    badge: 'bg-blue-500/20 text-blue-400',
    icon: 'text-blue-500',
    hover: 'hover:border-blue-500/50'
  },
  betting: {
    badge: 'bg-amber-500/20 text-amber-400',
    icon: 'text-amber-500',
    hover: 'hover:border-amber-500/50'
  }
}
```

### 3.4 Classes Tailwind du Grid

```tsx
// Container
<section className="py-16 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto">

    // Grid
    <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      // Card
      <motion.div className="
        group relative p-6 min-h-[180px]
        bg-zinc-900/50 border border-zinc-800 rounded-xl
        cursor-pointer transition-all duration-300
        hover:border-white hover:bg-zinc-900/70
      ">
```

### 3.5 Animations Framer Motion (Simplifiées)

```typescript
// Container variants (stagger children)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

// Card variants (fade up)
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
}
```

---

## 4. Plan d'Implémentation (10 Phases)

### Phase 0: Préparation Git

```bash
git checkout -b feature/homepage-navigation-grid
git status  # Vérifier état propre
```

**Critère de succès**: Branche créée, working tree propre

---

### Phase 1: Ajouter Import lucide-react

**Fichier**: `page.tsx` ligne ~6

```typescript
// Ajouter après les imports existants
import { Users, Calendar, Search, BarChart3, TrendingUp, LineChart } from 'lucide-react'
```

**Critère de succès**: Pas d'erreur TypeScript

---

### Phase 2: Ajouter Types et Données

**Fichier**: `page.tsx` après ligne 28

```typescript
// ============================================================================
// Card Types and Data
// ============================================================================

interface CardData {
  id: string
  section: 'equipes' | 'joueurs' | 'betting'
  number: string
  category: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  features: string[]
  badge?: string
  badgeColor?: string
}

const sectionColors = {
  equipes: {
    badge: 'bg-emerald-500/20 text-emerald-400',
    icon: 'text-emerald-500',
    hover: 'hover:border-emerald-500/50'
  },
  joueurs: {
    badge: 'bg-blue-500/20 text-blue-400',
    icon: 'text-blue-500',
    hover: 'hover:border-blue-500/50'
  },
  betting: {
    badge: 'bg-amber-500/20 text-amber-400',
    icon: 'text-amber-500',
    hover: 'hover:border-amber-500/50'
  }
} as const

const navigationCards: CardData[] = [
  // Column 1 - Équipes
  {
    id: 'teams',
    section: 'equipes',
    number: '01',
    category: 'ÉQUIPES',
    href: '/teams',
    icon: Users,
    title: 'Équipes',
    features: ['Standings', 'Stats off/def', 'DvP analysis']
  },
  {
    id: 'games',
    section: 'equipes',
    number: '01',
    category: 'ÉQUIPES',
    href: '/games',
    icon: Calendar,
    title: 'Matchs du Jour',
    features: ['Schedule', 'Live scores', "Today's games"]
  },
  // Column 2 - Joueurs
  {
    id: 'players',
    section: 'joueurs',
    number: '02',
    category: 'JOUEURS',
    href: '/players',
    icon: Search,
    title: 'Recherche Joueur',
    features: ['Autocomplete', 'Stats avancées', 'Player detail']
  },
  // Column 3 - Betting & Analyse
  {
    id: 'totals',
    section: 'betting',
    number: '03',
    category: 'BETTING',
    href: '/betting/totals',
    icon: BarChart3,
    title: 'Totals O/U',
    features: ['Over/Under', 'Props analysis', 'Trends'],
    badge: 'MC',
    badgeColor: 'bg-emerald-600'
  },
  {
    id: 'value',
    section: 'betting',
    number: '03',
    category: 'BETTING',
    href: '/betting/value-finder',
    icon: TrendingUp,
    title: 'Value Finder',
    features: ['Best odds', 'Upside value', 'Edge finder']
  },
  {
    id: 'analysis',
    section: 'betting',
    number: '03',
    category: 'ANALYSE',
    href: '/analysis/q1-value',
    icon: LineChart,
    title: 'Analyse Q1',
    features: ['Q1 patterns', 'Dispersion', 'Pace analysis']
  }
]
```

**Critère de succès**: Données compilent sans erreur

---

### Phase 3: Créer NavigationCard Component

**Fichier**: `page.tsx` après les données (nouveau composant inline)

```typescript
// ============================================================================
// NavigationCard Component
// ============================================================================

function NavigationCard({ card }: { card: CardData }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { startTransition } = usePageTransition()
  const colors = sectionColors[card.section]

  const handleClick = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      startTransition(rect, card.href, 'rgb(24, 24, 27)')
    }
  }

  const Icon = card.icon

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      onClick={handleClick}
      className={`
        group relative p-6 min-h-[180px]
        bg-zinc-900/50 border border-zinc-800 rounded-xl
        cursor-pointer transition-all duration-300
        hover:border-white hover:bg-zinc-900/70
        ${colors.hover}
      `}
    >
      {/* Badge */}
      {card.badge && (
        <span className={`absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${card.badgeColor} text-white`}>
          {card.badge}
        </span>
      )}

      {/* Section Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${colors.badge}`}>
          {card.number} {card.category}
        </span>
      </div>

      {/* Icon */}
      <Icon className={`w-6 h-6 mb-3 ${colors.icon}`} />

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>

      {/* Separator */}
      <div className="w-full h-px bg-zinc-800 mb-3" />

      {/* Features */}
      <ul className="space-y-1">
        {card.features.map((feature, index) => (
          <li key={index} className="text-sm text-zinc-400 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            {feature}
          </li>
        ))}
      </ul>

      {/* Arrow */}
      <span className="absolute bottom-6 right-6 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-200">
        →
      </span>
    </motion.div>
  )
}
```

**Critère de succès**: Composant compile, click fonctionne

---

### Phase 4: Créer NavigationGrid Component

**Fichier**: `page.tsx` après NavigationCard

```typescript
// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
}

// ============================================================================
// NavigationGrid Component
// ============================================================================

function NavigationGrid() {
  const gridRef = useRef<HTMLElement>(null)
  const isInView = useInView(gridRef, { once: true, amount: 0.2 })

  return (
    <section
      ref={gridRef}
      id="navigation"
      className="py-16 px-4 sm:px-6 lg:px-8 relative"
    >
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white mb-4">
            Explorer
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Statistiques NBA, betting intelligence et analyses avancées
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {navigationCards.map((card) => (
            <NavigationCard key={card.id} card={card} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
```

**Critère de succès**: Grid s'affiche, cards animées

---

### Phase 5: Mettre à jour HomeContent

**Fichier**: `page.tsx` lignes 491-513

**AVANT**:
```typescript
function HomeContent() {
  return (
    <div className="bg-black min-h-screen">
      <FixedNav />
      <HeroSection />
      {sections.map((section) => (
        <AnimatedSection key={section.id} {...section} />
      ))}
      <FooterSection />
    </div>
  )
}
```

**APRÈS**:
```typescript
function HomeContent() {
  return (
    <div className="bg-black min-h-screen">
      <FixedNav />
      <HeroSection />
      <NavigationGrid />
      <FooterSection />
    </div>
  )
}
```

**Critère de succès**: Page affiche Hero → Grid → Footer

---

### Phase 6: Supprimer AnimatedSection et Données Obsolètes

**Supprimer**:
1. `AnimatedSection` component (lignes 208-321) → 113 lignes
2. `sections` array (lignes 442-489) → 47 lignes
3. `SectionProps` interface (lignes 20-28) → 8 lignes

**Total supprimé**: ~168 lignes

**Critère de succès**: Pas d'erreur TypeScript, code mort supprimé

---

### Phase 7: Mettre à jour stickyNavItems

**Fichier**: `page.tsx` lignes 75-80

**AVANT**:
```typescript
const stickyNavItems: StickyTitleItem[] = [
  { id: 'teams', number: '01', title: 'ÉQUIPES' },
  { id: 'players', number: '02', title: 'JOUEURS' },
  { id: 'betting', number: '03', title: 'PARIS' },
  { id: 'analysis', number: '04', title: 'ANALYSE' },
]
```

**APRÈS**:
```typescript
const stickyNavItems: StickyTitleItem[] = [
  { id: 'navigation', number: '01', title: 'EXPLORER' },
]
```

**Alternative**: Garder la liste mais avec liens vers sections dans le grid:
```typescript
const stickyNavItems: StickyTitleItem[] = [
  { id: 'teams', number: '01', title: 'ÉQUIPES' },
  { id: 'players', number: '02', title: 'JOUEURS' },
  { id: 'betting', number: '03', title: 'PARIS' },
]
```

**Critère de succès**: Menu hamburger fonctionne, scrollTo correct

---

### Phase 8: Nettoyer les Imports Inutilisés

**Vérifier et supprimer si non utilisés**:
- `useScroll` (utilisé uniquement dans AnimatedSection supprimé)
- `useTransform` (utilisé uniquement dans AnimatedSection supprimé)

**AVANT**:
```typescript
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
```

**APRÈS**:
```typescript
import { motion, useInView, AnimatePresence } from 'framer-motion'
```

**Critère de succès**: Pas de warnings "unused imports"

---

### Phase 9: Tests et Validation

| Test | Critère | Méthode |
|------|---------|---------|
| Responsive 375px | 1 colonne, cards lisibles | Chrome DevTools |
| Responsive 640px | 2 colonnes | Chrome DevTools |
| Responsive 1024px | 3 colonnes | Chrome DevTools |
| Navigation cards | 6 liens fonctionnels | Click chaque card |
| Transition page | Animation zoom correcte | Click → observer |
| Menu hamburger | S'ouvre, liens marchent | Click hamburger |
| Scroll header | Logo apparaît à 35% | Scroll down |
| Animation stagger | Cards apparaissent en séquence | Refresh page |
| Hover states | Border + arrow transition | Hover cards |
| Performance | LCP < 2.5s, CLS < 0.1 | Lighthouse |

---

### Phase 10: Commit Final

```bash
git add frontend/src/app/page.tsx
git commit -m "feat(homepage): replace full-height sections with compact 3-column navigation grid

- Replace 4 full-height AnimatedSection with single NavigationGrid
- Add 6 navigation cards mapped to verified pages
- Implement section color coding (emerald/blue/amber)
- Add stagger entrance animations
- Reduce scroll from ~520vh to ~140vh (73% reduction)
- Maintain cinematic design language
- Mobile-first responsive (1/2/3 columns)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git status
```

---

## 5. Évaluation des Risques

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Page transitions cassées | Moyenne | Haut | Tester chaque card après implémentation |
| Layout mobile dégradé | Faible | Moyen | Tester 375px avant commit |
| Header sticky bugué | Faible | Faible | Ajuster threshold si nécessaire |
| Animation jank | Faible | Faible | Utiliser will-change sparingly |
| Accessibilité réduite | Faible | Moyen | Vérifier keyboard nav + aria labels |

---

## 6. Métriques de Succès

### Avant/Après

| Métrique | Avant | Après | Objectif |
|----------|-------|-------|----------|
| Viewport heights | ~520vh | ~140vh | -70% scroll |
| Sections visibles simultanément | 1 | 3 (desktop) | Multi-section discovery |
| Lignes de code | 526 | ~410 | -20% LOC |
| Cards/links | 4 sections, 6 links | 6 cards, 6 links | Même couverture |
| LCP (Lighthouse) | TBD | < 2.5s | Performance |

### Critères d'Acceptation

- [ ] 6 cards fonctionnelles avec liens vérifiés
- [ ] Grid responsive (1/2/3 colonnes)
- [ ] Animations stagger à l'entrée
- [ ] Hover states sur cards
- [ ] Page transitions préservées
- [ ] Menu hamburger fonctionnel
- [ ] Scroll < 2 viewport heights pour voir tout
- [ ] Aucune régression TypeScript
- [ ] Lighthouse Performance > 90

---

## 7. Rollback Plan

Si problème critique après déploiement:

```bash
git revert HEAD
git push
```

Ou restaurer depuis la branche main:

```bash
git checkout main -- frontend/src/app/page.tsx
```

---

## 8. Questions Ouvertes (À Valider)

1. **stickyNavItems**: Garder 4 items (scroll vers sections cards) ou réduire à 1 ("Explorer")?
2. **Section header**: Titre "Explorer" avec description, ou supprimer pour encore plus compact?
3. **Card order**: L'ordre actuel (Équipes → Joueurs → Betting) est-il correct pour mobile (stack vertical)?

---

**Prêt pour validation avant implémentation.**
