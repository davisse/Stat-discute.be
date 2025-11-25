# STAT-DISCUTE Design System - Documentation

**Version** : 1.0
**Statut** : Phase 1 Complétée ✅

---

## Navigation Rapide

| Document | Description | Lire quand |
|----------|-------------|------------|
| **[design-system.md](./design-system.md)** | Charte graphique complète | Tu veux comprendre la vision globale |
| **[phase-1-implementation.md](./phase-1-implementation.md)** | Documentation technique Phase 1 | Tu veux savoir comment les tokens sont implémentés |
| **[PHASE_1_SUMMARY.md](./PHASE_1_SUMMARY.md)** | Résumé exécutif Phase 1 | Tu veux un overview rapide des changements |
| **[../NEXT_STEPS.md](../NEXT_STEPS.md)** | Guide de démarrage Phase 2 | Tu es prêt à créer les composants |

---

## Structure de la Documentation

```
frontend/docs/
├── README.md                      ← 📄 CE DOCUMENT
├── design-system.md               ← 📚 Charte complète (32KB)
├── phase-1-implementation.md      ← 🔧 Doc technique Phase 1 (12KB)
├── PHASE_1_SUMMARY.md             ← 📊 Résumé exécutif (6KB)
└── homepage-animation.md          ← 🎬 Animation logo (existant)
```

---

## Par Persona

### Designer / Product Owner
**Tu veux** : Comprendre la vision et les principes

**Lis** :
1. `design-system.md` - Section "Vision & Philosophie"
2. `design-system.md` - Section "Design Tokens" (couleurs, typo)
3. `PHASE_1_SUMMARY.md` - Vue d'ensemble des tokens

### Développeur Frontend
**Tu veux** : Implémenter les composants

**Lis** :
1. `phase-1-implementation.md` - Comment utiliser les tokens
2. `../NEXT_STEPS.md` - Templates et exemples de code
3. `design-system.md` - Section "Composants UI" pour les specs

### Chef de Projet
**Tu veux** : Suivre l'avancement

**Lis** :
1. `PHASE_1_SUMMARY.md` - Métriques et résultats
2. `../design-system-status.json` - État JSON machine-readable
3. `../NEXT_STEPS.md` - Prochaines étapes

---

## Phases du Design System

### ✅ Phase 1 : Design Tokens (Complétée)
**Durée** : 30 minutes
**Livrable** : 80+ tokens CSS + TypeScript exports
**Fichiers** : `globals.css`, `design-tokens.ts`
**Test** : http://localhost:3000/design-tokens-test

### 🔜 Phase 2 : Composants de Base (À venir)
**Durée estimée** : 1-2 semaines
**Composants** : Button, Input, Card, Modal, Tooltip, Loading
**Répertoire** : `frontend/src/components/ui/`

### ⏳ Phase 3 : Data Display (Planifiée)
**Durée estimée** : 1-2 semaines
**Composants** : StatCard, StatsTable, PlayerCard, TrendIndicator
**Répertoire** : `frontend/src/components/stats/`

### ⏳ Phase 4 : Data Visualization (Planifiée)
**Durée estimée** : 2-3 semaines
**Composants** : InteractiveLineChart, ThresholdControl, BarChart
**Répertoire** : `frontend/src/components/charts/`

### ⏳ Phase 5 : Betting Specific (Planifiée)
**Durée estimée** : 1 semaine
**Composants** : OddsDisplay, ConfidenceIndicator, AnalysisChecklist
**Répertoire** : `frontend/src/components/betting/`

---

## Règles Importantes

### Couleurs Fonctionnelles (CRITIQUE)

⚠️ **Vert (#10B981) et Rouge (#EF4444) sont UNIQUEMENT pour DONNÉES**

**✅ AUTORISÉ** :
- Indicateurs de tendance (+5.2% en vert)
- Résultats de matchs (W en vert, L en rouge)
- Over/Under dans tableaux

**❌ INTERDIT** :
- Boutons d'action ("Submit" vert)
- Messages de succès/erreur UI
- Décoration graphique

### Gris Anthracite (gray-850)

**Nouveau niveau** : #1F1F1F (entre 800 et 900)

**Usage** : Cards principales, zones de contenu importantes

**Classe Tailwind** : `bg-gray-850`, `border-gray-850`, etc.

### Police Monospace

**JetBrains Mono** : UNIQUEMENT pour chiffres et stats

**✅ Utiliser pour** :
- Statistiques (28.5 PPG)
- Odds (1.85)
- Pourcentages (58%)
- Tableaux de données

**❌ Ne pas utiliser pour** :
- Textes généraux
- Titres
- Paragraphes

---

## Utilisation des Tokens

### En Tailwind (Recommandé)

```tsx
// Couleurs
<div className="bg-gray-850 text-gray-400 border-gray-800">

// Espacement
<div className="p-6 gap-4 space-y-8">

// Typographie
<h1 className="text-3xl font-bold">Titre</h1>
<span className="font-mono">28.5</span>
```

### En TypeScript (Inline Styles)

```tsx
import { colors, spacing } from '@/lib/design-tokens'

<div style={{
  backgroundColor: colors.gray[850],
  padding: spacing[6],
  color: colors.gray[400]
}}>
```

### Fonctions Utilitaires

```tsx
import { spacingToPx, getGray, getDotsBackground } from '@/lib/design-tokens'

const pixels = spacingToPx(4)  // 16
const grayColor = getGray(850) // '#1F1F1F'
const bgStyle = getDotsBackground() // { backgroundImage: ..., opacity: ... }
```

---

## Standards de Code

### Composants

- **Nom** : PascalCase (`Button`, `StatCard`)
- **Props Interface** : `ComponentNameProps`
- **Export** : Named export + export dans index.ts
- **Documentation** : JSDoc avec exemples

### Styles

- **Ordre de préférence** :
  1. Classes Tailwind natives
  2. Tokens CSS via classes custom
  3. Styles inline avec tokens TypeScript
  4. Styles inline bruts (éviter)

### Accessibilité

- **WCAG 2.1 AA** : Minimum requis
- **Contraste** : Ratio 4.5:1 pour texte normal
- **Focus** : Visible avec `ring-2 ring-white`
- **ARIA** : Labels pour éléments interactifs

---

## Tests & Validation

### Avant de Commit

```bash
# Build production
npm run build

# Lint
npm run lint

# Tests (si configurés)
npm test
```

### Validation Visuelle

Visite : http://localhost:3000/design-tokens-test

**Vérifie** :
- Tokens couleurs correctement appliqués
- Espacement cohérent
- Typographie lisible (Inter + JetBrains Mono)
- Ombres (glows) visibles

---

## Ressources Externes

### Tailwind CSS v4
- **Docs** : https://tailwindcss.com/docs
- **Migration** : https://tailwindcss.com/docs/upgrade-guide

### Design Inspiration
- **Bloomberg Terminal** : Minimalisme data-focused
- **Linear** : UI spacieuse et moderne
- **Stripe Dashboard** : Hiérarchie claire

### Accessibilité
- **WCAG Quick Ref** : https://www.w3.org/WAI/WCAG21/quickref/
- **Contrast Checker** : https://webaim.org/resources/contrastchecker/

---

## FAQ

### Q: Où sont les tokens CSS ?
**R** : `frontend/src/app/globals.css` dans le block `@theme`

### Q: Comment importer les tokens TypeScript ?
**R** : `import { colors, spacing } from '@/lib/design-tokens'`

### Q: Quelle police pour les chiffres ?
**R** : JetBrains Mono (classe `font-mono`)

### Q: Comment tester visuellement ?
**R** : http://localhost:3000/design-tokens-test

### Q: Où créer les nouveaux composants ?
**R** : `frontend/src/components/ui/` pour Phase 2

### Q: Le vert/rouge pour les boutons ?
**R** : ❌ NON ! Uniquement pour données (stats, trends)

### Q: Tailwind v3 ou v4 ?
**R** : v4 (syntaxe `@theme`, pas `@tailwind`)

---

## Changelog

### v1.0 (2025-01-19)
- ✅ Phase 1 complétée
- ✅ 80+ design tokens implémentés
- ✅ Documentation technique créée
- ✅ Page de test visuel ajoutée

---

## Contact & Support

**Auteur** : Claude Code (Frontend Architect Agent)
**Documentation** : `/frontend/docs/`
**Bugs/Questions** : Créer issue ou contacter l'équipe

---

**Dernière mise à jour** : 2025-01-19
**Prochaine révision** : Après Phase 2
