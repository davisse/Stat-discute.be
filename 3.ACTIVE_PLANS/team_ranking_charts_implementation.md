# Plan d'Implémentation - Charts de Classement Équipes

## Objectif
Créer 3 composants React pour visualiser le classement des équipes NBA par PPG (attaque) et OPP PPG (défense) sous forme de bar charts horizontaux.

---

## Vue d'Ensemble des Composants

```
frontend/src/components/teams/
├── TeamPPGRankingChart.tsx      # Chart PPG (attaque) - indépendant
├── TeamOppPPGRankingChart.tsx   # Chart OPP PPG (défense) - indépendant
└── TeamRankingDualChart.tsx     # Composant combiné (utilise les 2 ci-dessus)
```

---

## 1. Composant TeamPPGRankingChart

### Description
Bar chart horizontal affichant les 30 équipes classées par PPG (Points Per Game).
- Équipe avec le plus de PPG en haut (#1)
- Équipe avec le moins de PPG en bas (#30)
- Barres allant de gauche vers le centre (plus grand PPG = barre plus longue)

### Props Interface
```typescript
interface TeamPPGRankingChartProps {
  data: TeamRankingData[]        // Données des équipes
  selectedTeamId?: number        // ID de l'équipe sélectionnée (barre blanche)
  className?: string             // Classes CSS additionnelles
}

interface TeamRankingData {
  team_id: number
  abbreviation: string
  ppg: number
  opp_ppg: number
}
```

### Comportement
- ❌ Pas de hover
- ❌ Pas de tooltip
- ❌ Pas de navigation au clic
- ✅ Équipe sélectionnée = barre blanche solide
- ✅ Autres équipes = barres zinc-600

### Style Visuel
```
#1   BOS  ████████████████████████ 121.3
#2   IND  ███████████████████████  119.8
...
#15  TOR  ██████████               107.5  ← WHITE (selected)
...
#30  DET  █                         92.1
```

---

## 2. Composant TeamOppPPGRankingChart

### Description
Bar chart horizontal affichant les 30 équipes classées par OPP PPG (défense).
- Meilleure défense (OPP PPG le plus bas) en haut (#1)
- Pire défense (OPP PPG le plus haut) en bas (#30)
- Barres allant du centre vers la droite
- **Important**: La longueur de barre représente la valeur OPP PPG
  - Bonne défense (faible OPP PPG) = barre COURTE
  - Mauvaise défense (haut OPP PPG) = barre LONGUE

### Props Interface
```typescript
interface TeamOppPPGRankingChartProps {
  data: TeamRankingData[]        // Mêmes données que PPG chart
  selectedTeamId?: number        // ID de l'équipe sélectionnée
  className?: string             // Classes CSS additionnelles
}
```

### Comportement
- Identique au chart PPG (pas de hover/tooltip/clic)

### Style Visuel
```
102.1 ███                         CLE  #1   (best defense = SHORT bar)
103.5 ████                        BOS  #2
...
113.5 █████████████████           TOR  #15  ← WHITE (selected)
...
123.3 ████████████████████████████DET  #30  (worst defense = LONG bar)
```

---

## 3. Composant TeamRankingDualChart

### Description
Composant wrapper qui affiche les 2 charts côte à côte avec des titres.

### Props Interface
```typescript
interface TeamRankingDualChartProps {
  data: TeamRankingData[]        // Données passées aux 2 sous-composants
  selectedTeamId?: number        // ID de l'équipe sélectionnée
  className?: string
}
```

### Structure
```
┌─────────────────────────────────────────────────────────────────┐
│                PPG (ATTAQUE)     │     OPP PPG (DÉFENSE)        │
│            Plus = meilleur       │      Moins = meilleur        │
├─────────────────────────────────┼───────────────────────────────┤
│  <TeamPPGRankingChart />        │  <TeamOppPPGRankingChart />   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Query Backend (queries.ts)

### Nouvelle fonction requise
```typescript
export async function getAllTeamsRanking(): Promise<TeamRankingData[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    WITH team_scoring AS (
      SELECT
        t.team_id,
        t.abbreviation,
        ROUND(AVG(CASE
          WHEN g.home_team_id = t.team_id THEN g.home_team_score
          ELSE g.away_team_score
        END), 1) as ppg,
        ROUND(AVG(CASE
          WHEN g.home_team_id = t.team_id THEN g.away_team_score
          ELSE g.home_team_score
        END), 1) as opp_ppg
      FROM teams t
      LEFT JOIN games g ON (g.home_team_id = t.team_id OR g.away_team_id = t.team_id)
        AND g.game_status = 'Final'
        AND g.season = $1
      GROUP BY t.team_id, t.abbreviation
      HAVING COUNT(g.game_id) > 0
    )
    SELECT * FROM team_scoring
    ORDER BY ppg DESC
  `, [currentSeason])

  return result.rows
}
```

---

## 5. API Route

### Fichier: `frontend/src/app/api/teams/ranking/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { getAllTeamsRanking } from '@/lib/queries'

export async function GET() {
  try {
    const data = await getAllTeamsRanking()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
```

---

## 6. Intégration dans la Page Équipe

### Fichier: `frontend/src/app/(dashboard)/teams/[teamId]/page.tsx`

Ajouter après le grid des stats actuelles:
```tsx
<TeamRankingDualChart
  data={allTeamsRanking}
  selectedTeamId={teamStats.team_id}
/>
```

---

## Exécution Parallèle avec Sub-Agents

### Agent 1: TeamPPGRankingChart
- Créer le composant PPG
- Style horizontal bar chart
- Tri par PPG DESC
- Highlight équipe sélectionnée

### Agent 2: TeamOppPPGRankingChart
- Créer le composant OPP PPG
- Style mirror (barres vers droite)
- Tri par OPP PPG ASC
- Même système de highlight

### Agent 3: Backend + Integration
- Ajouter query `getAllTeamsRanking` dans queries.ts
- Créer API route `/api/teams/ranking`
- Créer TeamRankingDualChart wrapper
- Intégrer dans page équipe

---

## Fichiers à Créer/Modifier

| Fichier | Action | Agent |
|---------|--------|-------|
| `components/teams/TeamPPGRankingChart.tsx` | CREATE | Agent 1 |
| `components/teams/TeamOppPPGRankingChart.tsx` | CREATE | Agent 2 |
| `components/teams/TeamRankingDualChart.tsx` | CREATE | Agent 3 |
| `components/teams/index.ts` | CREATE | Agent 3 |
| `lib/queries.ts` | MODIFY (add function) | Agent 3 |
| `app/api/teams/ranking/route.ts` | CREATE | Agent 3 |
| `app/(dashboard)/teams/[teamId]/page.tsx` | MODIFY (add chart) | Agent 3 |

---

## Spécifications Techniques

### Design Tokens Utilisés
- Background: `bg-zinc-900/50`
- Border: `border border-zinc-800`
- Text labels: `text-zinc-500`
- Values: `text-white font-mono`
- Selected bar: `bg-white`
- Other bars: `bg-zinc-600`

### Dimensions
- Hauteur par équipe: 24px
- Gap entre équipes: 2px
- Hauteur totale estimée: ~780px (30 * 26px)
- Largeur max barre: Calculée proportionnellement

### Responsive
- Desktop: 2 colonnes côte à côte
- Mobile: Stack vertical (1 colonne)

---

## Validation

- [x] Plan approuvé par l'utilisateur
- [x] 3 agents parallèles avec --ultrathink
- [x] Build réussi sans erreurs TypeScript
- [ ] Tests visuels sur page équipe
- [ ] Vérification highlight équipe correcte

## Implémentation Terminée (2025-01-02)

### Fichiers créés :
- `frontend/src/components/teams/TeamPPGRankingChart.tsx`
- `frontend/src/components/teams/TeamOppPPGRankingChart.tsx`
- `frontend/src/components/teams/TeamRankingDualChart.tsx`
- `frontend/src/components/teams/index.ts`
- `frontend/src/app/api/teams/ranking/route.ts`

### Fichiers modifiés :
- `frontend/src/lib/queries.ts` (ajout getAllTeamsRanking + TeamRankingData)
- `frontend/src/app/(dashboard)/teams/[teamId]/page.tsx` (intégration dual chart)
