# Plan: Skill de Wireframe ASCII

**Date**: 2026-01-09
**Status**: En attente de validation
**Objectif**: Créer un skill Claude Code pour générer des wireframes ASCII/Unicode avec alignement parfait des bordures

---

## Problème Identifié (Screenshot)

Le screenshot montre des wireframes avec des **bordures droites mal alignées**. Cause racine:
- Le calcul de largeur utilise `.length` (nombre de caractères) au lieu de la largeur visuelle
- Le contenu n'est pas paddé à une largeur fixe avant d'ajouter la bordure droite
- Résultat: lignes de longueurs différentes = bordures désalignées

---

## Solution: La Règle d'Or

```
CHAQUE LIGNE = EXACTEMENT TOTAL_WIDTH CARACTÈRES
Pas plus. Pas moins. Jamais d'exception.
```

**Algorithme de correction**:
```javascript
function contentLine(content, totalWidth, leftBorder, rightBorder) {
  const innerWidth = totalWidth - leftBorder.length - rightBorder.length;
  const truncated = content.substring(0, innerWidth);  // Tronquer si trop long
  const padded = truncated.padEnd(innerWidth, ' ');    // Padder si trop court
  return leftBorder + padded + rightBorder;            // GARANTIE: exactement totalWidth
}
```

---

## Structure du Skill

### Fichier: `~/.claude/commands/wireframe.md`

```yaml
---
name: wireframe
description: "Generate precise ASCII/Unicode wireframes for web pages with perfect border alignment. Use when designing UI layouts, mockups, or page structures. Triggers on keywords: wireframe, mockup, layout, ASCII design, page structure."
category: design
complexity: standard
allowed-tools: Read, Write
---
```

### Sections du Skill

1. **Règles Critiques d'Alignement** (obligatoires)
2. **Bibliothèque de Caractères Unicode**
3. **Templates de Composants UI**
4. **Algorithmes de Génération**
5. **Exemples d'Utilisation**
6. **Dépannage**

---

## Bibliothèque de Caractères Unicode

### Box Drawing (U+2500–U+257F)

| Style | H | V | TL | TR | BL | BR | T | B | L | R | X |
|-------|---|---|----|----|----|----|---|---|---|---|---|
| Light | ─ | │ | ┌ | ┐ | └ | ┘ | ┬ | ┴ | ├ | ┤ | ┼ |
| Heavy | ━ | ┃ | ┏ | ┓ | ┗ | ┛ | ┳ | ┻ | ┣ | ┫ | ╋ |
| Double | ═ | ║ | ╔ | ╗ | ╚ | ╝ | ╦ | ╩ | ╠ | ╣ | ╬ |
| Rounded | ─ | │ | ╭ | ╮ | ╰ | ╯ | ┬ | ┴ | ├ | ┤ | ┼ |
| Dashed | ╌ | ╎ | ┌ | ┐ | └ | ┘ | ┬ | ┴ | ├ | ┤ | ┼ |

### Block Elements (U+2580–U+259F)

```
Shading:   ░ ▒ ▓ █  (light → full)
Half:      ▀ ▄ ▌ ▐  (top, bottom, left, right)
```

### Symboles UI

```
Navigation:  ☰ ≡ ⋮ ⋯ ← → ↑ ↓ ↔ ↕
Actions:     ✕ ✓ ⊕ ⊖ ✎ ⚙ 🔍
Checkbox:    ☐ ☑ ☒
Radio:       ○ ◉ ●
Toggle:      [●○○] OFF  [○○●] ON
Progress:    ▓▓▓▓░░░░░░ 40%
Rating:      ★★★☆☆
Avatar:      (◉) ● 👤
Arrows:      ◀ ▶ ▲ ▼ ◁ ▷ △ ▽
```

---

## Templates de Composants

### 1. Page Layout Standard (Header + Sidebar + Content)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ☰  Logo                                          [Search...]    👤 User  ▾  │
├────────────────┬─────────────────────────────────────────────────────────────┤
│ Navigation     │ Main Content Area                                           │
│                │                                                              │
│ ▶ Dashboard    │ ┌─────────────────────────────────────────────────────────┐ │
│   Analytics    │ │ Card Title                                    ⋮        │ │
│   Reports      │ │                                                         │ │
│                │ │ Card content goes here with text that fits              │ │
│ ▶ Settings     │ │                                                         │ │
│   Profile      │ └─────────────────────────────────────────────────────────┘ │
│   Security     │                                                              │
│                │                                                              │
└────────────────┴─────────────────────────────────────────────────────────────┘
```

### 2. Card Component

```
╭──────────────────────────────────────╮
│ Card Title                     ⋮     │
├──────────────────────────────────────┤
│                                      │
│  Content area with padding           │
│                                      │
│  ☐ Option 1                          │
│  ☑ Option 2 (selected)               │
│                                      │
├──────────────────────────────────────┤
│ [  Cancel  ]          [  Submit  ]   │
╰──────────────────────────────────────╯
```

### 3. Modal/Dialog

```
╔══════════════════════════════════════════════════════════════╗
║ Modal Title                                              ✕   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Are you sure you want to proceed?                           ║
║                                                              ║
║  This action cannot be undone.                               ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                           [  Cancel  ]    [  Confirm  ]      ║
╚══════════════════════════════════════════════════════════════╝
```

### 4. Form Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Form Title                                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Email *                                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ user@example.com                                       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Password *                                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ••••••••••••                                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ☐ Remember me                                               │
│                                                              │
│  [          Sign In          ]                               │
│                                                              │
│  ─────────────── or ───────────────                          │
│                                                              │
│  [  G  Continue with Google  ]                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5. Data Table

```
┌────┬────────────────────┬─────────────────────────┬──────────┬─────────┐
│ ID │ Name               │ Email                   │ Role     │ Actions │
├────┼────────────────────┼─────────────────────────┼──────────┼─────────┤
│ 1  │ John Doe           │ john@example.com        │ Admin    │ ✎ ✕    │
│ 2  │ Jane Smith         │ jane@example.com        │ User     │ ✎ ✕    │
│ 3  │ Bob Johnson        │ bob@example.com         │ Editor   │ ✎ ✕    │
├────┴────────────────────┴─────────────────────────┴──────────┴─────────┤
│ ◀ 1 2 3 ... 10 ▶                              Showing 1-3 of 25       │
└────────────────────────────────────────────────────────────────────────┘
```

### 6. Mobile Layout (40 chars)

```
┌──────────────────────────────────────┐
│ ☰  App Name                      👤  │
├──────────────────────────────────────┤
│                                      │
│ Welcome back, User                   │
│                                      │
│ ╭────────────────────────────────╮   │
│ │ Stats Overview          ▶      │   │
│ │ ▓▓▓▓▓▓░░░░ 60%                 │   │
│ ╰────────────────────────────────╯   │
│                                      │
│ ╭────────────────────────────────╮   │
│ │ Recent Activity          ▶     │   │
│ │ • Item 1                       │   │
│ │ • Item 2                       │   │
│ ╰────────────────────────────────╯   │
│                                      │
├──────────────────────────────────────┤
│   🏠      📊      ⚙      👤         │
└──────────────────────────────────────┘
```

---

## Algorithme Multi-Colonnes

```
Entrée: totalWidth=80, columns=3

Étape 1: Calculer les largeurs
  - Bordures totales: columns + 1 = 4 caractères (│col│col│col│)
  - Espace disponible: 80 - 4 = 76
  - Par colonne: 76 / 3 = 25.33
  - Distribution: [25, 25, 26] (reste va à droite)

Étape 2: Générer la bordure supérieure
  ┌─────────────────────────┬─────────────────────────┬──────────────────────────┐
  │         25 chars        │         25 chars        │          26 chars        │

Étape 3: Générer les lignes de contenu
  │ Content padEnd(25)      │ Content padEnd(25)      │ Content padEnd(26)       │

Étape 4: Générer les séparateurs (si besoin)
  ├─────────────────────────┼─────────────────────────┼──────────────────────────┤

Étape 5: Générer la bordure inférieure
  └─────────────────────────┴─────────────────────────┴──────────────────────────┘
```

---

## Options du Skill

| Option | Valeurs | Description |
|--------|---------|-------------|
| `--width` | 40, 60, 80, 100, 120 | Largeur totale en caractères |
| `--style` | light, heavy, double, rounded, dashed, ascii | Style des bordures |
| `--mobile` | flag | Génère une version mobile (40 chars) |
| `--responsive` | flag | Génère desktop + mobile côte à côte |
| `--detailed` | flag | Ajoute plus de détails UI (icônes, placeholders) |

---

## Exemples d'Utilisation

```bash
# Dashboard avec sidebar
/wireframe dashboard with header, sidebar navigation, and 2-column content grid --width 100 --style rounded

# Page de login mobile
/wireframe mobile login page with email, password, remember me, and social login buttons --width 40

# Table de données
/wireframe data table with columns: ID, Name, Email, Status, Actions. Include pagination --width 120 --style light

# Modal de confirmation
/wireframe confirmation modal with title, message, cancel and confirm buttons --style double

# Layout responsive
/wireframe e-commerce product page with image, title, price, description, add to cart --responsive
```

---

## Règles de Validation (OBLIGATOIRES)

Le skill DOIT inclure ces règles dans ses instructions:

### 1. Validation de Largeur
```
AVANT d'afficher une ligne:
- Vérifier que line.length === TOTAL_WIDTH
- Si différent: ERREUR, recalculer
```

### 2. Padding Systématique
```
TOUJOURS:
- Tronquer le contenu si > innerWidth
- Padder avec espaces si < innerWidth
- JAMAIS concaténer sans padding
```

### 3. Jonctions Correctes
```
Utiliser les bons caractères de jonction:
- ┬ : T vers le bas (bordure sup avec colonnes)
- ┴ : T vers le haut (bordure inf avec colonnes)
- ├ : T vers la droite (bordure gauche avec lignes)
- ┤ : T vers la gauche (bordure droite avec lignes)
- ┼ : Croix (intersection complète)
```

---

## Dépannage

| Problème | Cause | Solution |
|----------|-------|----------|
| Bordure droite désalignée | Pas de padding | Utiliser `.padEnd(innerWidth, ' ')` |
| Colonnes inégales | Mauvais calcul | Distribuer le reste à la dernière colonne |
| Caractères mal rendus | Police non monospace | Vérifier que l'output utilise une police monospace |
| Jonctions incorrectes | Mauvais caractère | Consulter la table des caractères box-drawing |

---

## Sources de Recherche

- [PlantUML Salt](https://plantuml.com/salt) - Outil de wireframe ASCII
- [Unicode Box Drawing](https://unicode-table.com/en/blocks/box-drawing/) - 128 caractères (U+2500–U+257F)
- [Wikipedia Box-drawing](https://en.wikipedia.org/wiki/Box-drawing_characters) - Référence complète
- [js-boxdrawing](https://marklodato.github.io/js-boxdrawing/) - Outil interactif
- [ASCII wireframe workflow](https://www.nathanonn.com/codex-plans-with-ascii-wireframes-%E2%86%92-claude-code-builds-%E2%86%92-codex-reviews/) - Exemple de workflow

---

## Livrables

1. **`~/.claude/commands/wireframe.md`** - Le skill complet avec:
   - YAML frontmatter conforme aux best practices Anthropic
   - Instructions comportementales détaillées
   - Bibliothèque de caractères intégrée
   - Templates de composants
   - Algorithmes de génération
   - Règles de validation obligatoires
   - Exemples concrets

---

## Prochaines Étapes (après validation)

1. Créer le fichier `wireframe.md` dans `~/.claude/commands/`
2. Tester avec différents cas d'usage
3. Itérer sur les templates si nécessaire

---

**En attente de ta validation pour procéder à l'implémentation.**
