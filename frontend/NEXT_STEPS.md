# Prochaines Étapes : Phase 2 - Composants de Base

**Pré-requis** : Phase 1 complétée ✅

---

## Démarrage Rapide Phase 2

### 1. Créer la Structure des Composants

```bash
# Créer les répertoires
mkdir -p frontend/src/components/ui
mkdir -p frontend/src/components/stats
mkdir -p frontend/src/components/charts
mkdir -p frontend/src/components/betting

# Créer le premier composant (Button)
touch frontend/src/components/ui/Button.tsx
touch frontend/src/components/ui/index.ts
```

### 2. Template de Départ pour Button.tsx

```tsx
'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  // Variants styles
  const variants = {
    primary: 'bg-white text-black hover:bg-gray-100 hover:scale-105 hover:shadow-md',
    secondary: 'bg-transparent border border-white text-white hover:bg-white hover:text-black',
    ghost: 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-900'
  }

  // Sizes styles
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }

  return (
    <button
      className={cn(
        // Base styles
        'rounded-md font-medium transition-all duration-300',
        'focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-98',
        // Variant & size
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  )
}
```

### 3. Créer utils.ts si manquant

```bash
touch frontend/src/lib/utils.ts
```

```tsx
// frontend/src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 4. Installer dépendances si nécessaire

```bash
npm install clsx tailwind-merge
```

---

## Ordre de Création (Recommandé)

### Semaine 1-2 : Composants de Base

1. **Button** (1 jour)
   - 3 variants : primary, secondary, ghost
   - 4 sizes : sm, md, lg, xl
   - States : loading, disabled, focus

2. **Input** (1 jour)
   - Base input avec styles
   - Focus states
   - Error states

3. **Card** (1 jour)
   - 3 variants : default, anthracite, elevated
   - Hover effects
   - Padding variants

4. **Modal/Dialog** (2 jours)
   - Overlay avec backdrop
   - Animation d'ouverture/fermeture
   - Close button
   - Keyboard handling (ESC)

5. **Tooltip** (1 jour)
   - Positionnement automatique
   - Arrow indicator
   - Hover trigger

6. **Loading States** (1 jour)
   - Skeleton loader
   - Spinner
   - Inline loading

---

## Checklist par Composant

Pour chaque composant, vérifier :

- [ ] TypeScript props interface définie
- [ ] Variants implémentés (si applicable)
- [ ] Sizes implémentés (si applicable)
- [ ] States (hover, focus, disabled, loading)
- [ ] Accessibilité (ARIA labels, keyboard nav)
- [ ] Utilise les design tokens
- [ ] Export dans index.ts
- [ ] Documentation JSDoc
- [ ] Exemple d'utilisation dans commentaire

---

## Tests Rapides

### Tester un Composant

```tsx
// Dans app/design-tokens-test/page.tsx (ou créer nouvelle page)
import { Button } from '@/components/ui/Button'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-black text-white p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Button Tests</h1>

        {/* Variants */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Variants</h2>
          <div className="flex gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </section>

        {/* Sizes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Sizes</h2>
          <div className="flex items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">X-Large</Button>
          </div>
        </section>

        {/* States */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">States</h2>
          <div className="flex gap-4">
            <Button>Normal</Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </section>
      </div>
    </div>
  )
}
```

---

## Ressources Utiles

### Design System Complet
- **Charte** : `frontend/docs/design-system.md`
- **Phase 1** : `frontend/docs/phase-1-implementation.md`

### Tokens
- **CSS** : `frontend/src/app/globals.css`
- **TypeScript** : `frontend/src/lib/design-tokens.ts`

### Exemples de Composants
- Voir section "Composants UI" dans `design-system.md`
- Exemples de code pour chaque composant fournis

### Tailwind CSS v4
- Configuration : Block `@theme` dans globals.css
- Classes custom : Toutes préfixées par `--`
- Documentation : https://tailwindcss.com/docs

---

## Questions Fréquentes

### Q: Où mettre les composants ?
**R** : `frontend/src/components/ui/` pour composants de base (Phase 2)

### Q: Comment importer les tokens ?
**R** :
```tsx
import { colors, spacing } from '@/lib/design-tokens'
```

### Q: Comment tester un composant ?
**R** : Ajouter dans `/design-tokens-test` ou créer nouvelle page de test

### Q: Les composants doivent être 'use client' ?
**R** : Seulement si utilisation de hooks (useState, useEffect, etc.)

### Q: Comment gérer les variants ?
**R** : Objet de styles avec cn() pour merge :
```tsx
const variants = {
  primary: 'bg-white text-black',
  secondary: 'bg-transparent border'
}
cn(variants[variant], className)
```

---

## Commandes Rapides

```bash
# Dev server
npm run dev

# Build test
npm run build

# Lint
npm run lint

# Créer composant
touch frontend/src/components/ui/NomComposant.tsx
```

---

## Contact & Support

- **Documentation** : `frontend/docs/`
- **Design System** : `frontend/docs/design-system.md`
- **Tokens visuels** : http://localhost:3000/design-tokens-test

---

**Prêt à démarrer Phase 2 !** 🚀

Commence par créer le composant **Button** en suivant le template ci-dessus.
