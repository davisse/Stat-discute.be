# Page d'Accueil - Documentation Technique

**Date**: 2025-01-19
**Version**: v1.0
**Fichier**: `frontend/src/app/page.tsx`

## Vue d'ensemble

La page d'accueil présente une animation fluide du logo STAT-DISCUTE qui se déplace du centre de la page vers une navbar en haut. Cette animation crée une transition élégante vers l'interface principale de l'application.

## Design System

### Palette de Couleurs
- **Fond principal**: `#000000` (Noir pur)
- **Trait navbar**: `#FFFFFF` (Blanc pur)
- **Dots pattern**: `#FFFFFF` avec `opacity: 0.15`

### Typographie & Dimensions
- **Logo centré (T0)**: 384px × 128px (`w-96 h-32`)
- **Logo navbar (T1)**: 256px × 64px (`w-64 h-16`)
- **Position navbar**: `top-6` (24px du haut)
- **Trait blanc**: 1px de hauteur à `top-24` (96px du haut)

## Animation Timeline

### État T0 - Logo Centré (0-2s)
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    · · · · · · · · · · · · · · · · · · · · · · · · · ·    │
│                                                             │
│    · · · · · · · · · · · · · · · · · · · · · · · · · ·    │
│                                                             │
│    · · · · · · ┌─────────────────┐ · · · · · · · · · ·    │
│    · · · · · · │   STAT-DISCUTE  │ · · · · · · · · · ·    │
│    · · · · · · │    384×128px    │ · · · · · · · · · ·    │
│    · · · · · · └─────────────────┘ · · · · · · · · · ·    │
│                                                             │
│    · · · · · · · · · · · · · · · · · · · · · · · · · ·    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Caractéristiques**:
- Position: `fixed` avec `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`
- Dimensions: `w-96 h-32` (384px × 128px)
- État: Logo visible, trait invisible

### Phase de Transition (2-3.5s)
**Durée**: 1500ms
**Easing**: `ease-out`
**Propriétés animées**: `top, width, height, transform`

**Changements**:
- Position Y: centre → `top-6` (24px du haut)
- Largeur: 384px → 256px
- Hauteur: 128px → 64px
- Trait blanc: `opacity: 0` → `opacity: 1` (1000ms)

### État T1 - Logo en Navbar (3.5s+)
```
┌─────────────────────────────────────────────────────────────┐
│                      ┌────────────┐                          │
│                      │STAT-DISCUTE│                          │
│                      │ 256×64px   │                          │
│                      └────────────┘                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    · · · · · · · · · · · · · · · · · · · · · · · · · ·    │
│                                                             │
│                    [CONTENU FUTUR]                          │
│             (Zone de contenu disponible)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Caractéristiques**:
- Position: `fixed top-6 left-1/2 -translate-x-1/2`
- Dimensions: `w-64 h-16` (256px × 64px)
- Trait blanc: Visible à `top-24`
- Zone contenu: Disponible de `top-32` à `bottom-0`

## Structure Technique

### Composant React
```tsx
'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [logoAnimated, setLogoAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogoAnimated(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (...)
}
```

### États React
- `logoAnimated`: Boolean contrôlant l'état de l'animation
  - `false`: Logo au centre (T0)
  - `true`: Logo dans navbar (T1)

### Éléments Principaux

#### 1. Fond avec Dots Pattern
```tsx
<div className="absolute inset-0" style={{
  opacity: 0.15,
  backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
  backgroundSize: '30px 30px',
  backgroundPosition: '0 0, 15px 15px'
}} />
```

#### 2. Logo avec Animation
```tsx
<div className={`logo-link fixed left-1/2 -translate-x-1/2
  transition-all duration-1500 ease-out ${
    logoAnimated
      ? 'top-6 w-64 h-16'
      : 'top-1/2 -translate-y-1/2 w-96 h-32'
}`} />
```

#### 3. Trait Blanc Navbar
```tsx
<div className={`fixed top-24 left-0 right-0 h-px bg-white z-20
  transition-opacity duration-1000 ${
    logoAnimated ? 'opacity-100' : 'opacity-0'
}`} />
```

#### 4. Zone de Contenu Future
```tsx
<div className={`fixed top-32 left-0 right-0 bottom-0
  transition-opacity duration-1000 delay-500 ${
    logoAnimated ? 'opacity-100' : 'opacity-0 pointer-events-none'
}`}>
  {/* Contenu à ajouter */}
</div>
```

## Interactions

### Hover sur Logo
- **État actuel**: Zoom léger (`scale-105`)
- **Durée**: 700ms
- **Easing**: `ease-out`
- **Comportement**: Fonctionne dans les deux états (T0 et T1)

### Clic sur Logo
- **Action**: Aucune (lien retiré)
- **Précédent**: Redirigeait vers `/player-props`

## Styles CSS Globaux

### Dans `globals.css`
```css
/* Logo hover effect - No glow */
.logo-link {
  background: transparent !important;
  border: none;
}

.logo-link > div {
  background: transparent !important;
}

.logo-image {
  background: transparent !important;
}

.logo-image img {
  background: transparent !important;
}
```

## Performance

### Optimisations Next.js Image
- `priority`: Image chargée en priorité (LCP optimization)
- `placeholder="empty"`: Pas de placeholder blur
- `unoptimized`: Pas d'optimisation d'image (PNG avec transparence)
- `sizes`: Responsive basé sur état animation

### Animations CSS
- Utilisation de `transform` pour performance GPU
- `transition-all` avec propriétés explicites
- Pas de `layout shift` grâce à `position: fixed`

## Prochaines Étapes

### Zone de Contenu (T1)
La zone sous la navbar (`top-32`) est prête pour accueillir:
- Champ de recherche de joueurs
- Navigation secondaire
- Contenu principal de l'application

### Améliorations Possibles
1. **Animation d'entrée du logo**: Fade in initial avant le centrage
2. **Parallax dots**: Mouvement subtil du pattern au scroll/hover
3. **Skeleton loading**: Pour le contenu qui apparaîtra après T1
4. **Responsive design**: Ajuster les tailles pour mobile
5. **Préférence utilisateur**: Option pour désactiver l'animation

## Compatibilité

### Navigateurs Supportés
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

### Technologies Utilisées
- Next.js 16 (App Router)
- React 19 (Client Component)
- Tailwind CSS v4
- Next.js Image Optimization

## Notes de Développement

### Timing de l'Animation
- **2 secondes** avant déclenchement: Laisse le temps au logo d'être apprécié
- **1.5 secondes** de transition: Suffisamment lent pour être fluide, assez rapide pour ne pas frustrer
- **1 seconde** pour le trait: Apparaît légèrement après le début du mouvement du logo
- **0.5 seconde** de délai pour le contenu: Donne une séquence visuelle naturelle

### Décisions de Design
1. **Position fixed**: Permet une animation fluide sans reflow
2. **Pas de glow effect**: Évite le rectangle gris problématique
3. **Centre horizontal conservé**: Continuité visuelle
4. **Trait blanc simple**: Épuré, graphisme noir et blanc cohérent

### Historique des Modifications
- **v1.0** (2025-01-19): Implémentation initiale de l'animation
  - Animation centre → navbar avec timeline 2s
  - Retrait du glow effect suite aux problèmes de rectangle
  - Suppression du lien cliquable vers `/player-props`
  - Ajout du trait blanc séparateur

## Fichiers Associés

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Page d'accueil avec animation
│   │   └── globals.css        # Styles globaux logo
│   └── public/
│       └── logo-v5.png        # Logo STAT-DISCUTE (500×128 RGBA)
└── docs/
    └── homepage-animation.md  # Ce document
```
