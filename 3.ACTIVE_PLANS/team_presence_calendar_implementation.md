# Plan d'Implémentation - TeamPresenceCalendar

**Date**: 2026-01-02
**Status**: Validé - En attente d'implémentation

## Objectif
Créer un composant `TeamPresenceCalendar` équivalent au `PlayerPresenceCalendar` pour la page d'équipe individuelle. Ce calendrier de type GitHub affichera tous les matchs d'une équipe sur la saison avec un code couleur basé sur les résultats (Victoire/Défaite) et l'écart de points.

---

## Vue d'Ensemble de l'Architecture

```
frontend/src/
├── components/teams/
│   ├── TeamPresenceCalendar.tsx    # NOUVEAU - Composant principal
│   └── index.ts                     # MODIFIER - Export du composant
├── lib/
│   └── queries.ts                   # MODIFIER - Ajout getTeamGameHistory()
├── app/api/teams/[teamId]/
│   └── games/route.ts               # NOUVEAU - API endpoint
└── app/(dashboard)/teams/[teamId]/
    └── page.tsx                     # MODIFIER - Intégration du calendrier
```

---

## 1. Interface TypeScript

### TeamGameDay (équivalent de GameDay pour joueur)
```typescript
interface TeamGameDay {
  game_id: string
  game_date: string          // ISO date: "2025-12-25"
  opponent: string           // Abbreviation: "LAL"
  is_home: boolean           // true = domicile, false = extérieur
  team_pts: number           // Points marqués
  opp_pts: number            // Points adverses
  result: 'W' | 'L'          // Résultat du match
  point_diff: number         // Écart de points (positif = victoire)
}

interface TeamPresenceCalendarProps {
  games: TeamGameDay[]
  seasonStart: string        // '2025-10-22'
  seasonEnd: string          // '2026-04-13'
  teamAbbr: string           // 'ATL', 'LAL', etc.
  fullSize?: boolean         // Mode plein écran (80vh)
  className?: string
}
```

---

## 2. Schéma de Couleurs

### Logique du code couleur (basé sur l'écart de points)

```
Date future OU hors saison → 'bg-transparent'
↓
Pas de match ce jour → 'bg-zinc-900/50' (jour de repos)
↓
VICTOIRE (result === 'W'):
  - Écart ≥ 20 pts → bg-emerald-400 (blow-out victoire)
  - Écart ≥ 15 pts → bg-emerald-500
  - Écart ≥ 10 pts → bg-emerald-600
  - Écart ≥ 5 pts  → bg-emerald-700
  - Écart < 5 pts  → bg-emerald-800 (victoire serrée)
↓
DÉFAITE (result === 'L'):
  - Écart ≥ 20 pts → bg-red-400 (blow-out défaite)
  - Écart ≥ 15 pts → bg-red-500
  - Écart ≥ 10 pts → bg-red-600
  - Écart ≥ 5 pts  → bg-red-700
  - Écart < 5 pts  → bg-red-800 (défaite serrée)
```

---

## 3. Requête Base de Données

### Fonction: `getTeamGameHistory(teamId: number)`

Emplacement: `frontend/src/lib/queries.ts`

```typescript
export interface TeamGameDay {
  game_id: string
  game_date: string
  opponent: string
  is_home: boolean
  team_pts: number
  opp_pts: number
  result: 'W' | 'L'
  point_diff: number
}

export async function getTeamGameHistory(teamId: number): Promise<TeamGameDay[]> {
  const currentSeason = await getCurrentSeason()

  const result = await query(`
    SELECT
      g.game_id,
      g.game_date::text,
      CASE WHEN g.home_team_id = $1 THEN at.abbreviation ELSE ht.abbreviation END as opponent,
      CASE WHEN g.home_team_id = $1 THEN true ELSE false END as is_home,
      CASE WHEN g.home_team_id = $1 THEN g.home_team_score ELSE g.away_team_score END as team_pts,
      CASE WHEN g.home_team_id = $1 THEN g.away_team_score ELSE g.home_team_score END as opp_pts,
      CASE
        WHEN g.home_team_id = $1 AND g.home_team_score > g.away_team_score THEN 'W'
        WHEN g.away_team_id = $1 AND g.away_team_score > g.home_team_score THEN 'W'
        ELSE 'L'
      END as result
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.team_id
    JOIN teams at ON g.away_team_id = at.team_id
    WHERE g.season = $2
      AND g.game_status = 'Final'
      AND (g.home_team_id = $1 OR g.away_team_id = $1)
    ORDER BY g.game_date ASC
  `, [teamId, currentSeason])

  return result.rows.map(row => ({
    game_id: row.game_id,
    game_date: row.game_date,
    opponent: row.opponent,
    is_home: row.is_home,
    team_pts: parseInt(row.team_pts),
    opp_pts: parseInt(row.opp_pts),
    result: row.result as 'W' | 'L',
    point_diff: parseInt(row.team_pts) - parseInt(row.opp_pts)
  }))
}
```

---

## 4. API Endpoint

### Route: `/api/teams/[teamId]/games`

Emplacement: `frontend/src/app/api/teams/[teamId]/games/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getTeamGameHistory } from '@/lib/queries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const teamIdNum = parseInt(teamId, 10)

    if (isNaN(teamIdNum)) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 })
    }

    const games = await getTeamGameHistory(teamIdNum)
    return NextResponse.json(games)
  } catch (error) {
    console.error('Error fetching team games:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## 5. Composant React

### Structure du composant TeamPresenceCalendar

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: Légende + Stats                                         │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                             │
│ │ ■ Win   │ │ ■ Loss  │ │ ■ Off   │  Record: 25W-15L (.625)    │
│ └─────────┘ └─────────┘ └─────────┘                             │
├─────────────────────────────────────────────────────────────────┤
│ CALENDAR GRID (Week-based, responsive)                          │
│                                                                  │
│     Oct           Nov           Dec           Jan               │
│     22  29  05  12  19  26  03  10  17  24  31  07  14  21     │
│ S   ■   ■   □   ■   ■   □   ■   ■   □   ■   ■   □   ■   ■      │
│ M   □   ■   □   □   ■   □   □   ■   □   □   ■   □   □   ■      │
│ T   ■   □   ■   ■   □   ■   ■   □   ■   ■   □   ■   ■   □      │
│ W   □   ■   □   □   ■   □   □   ■   □   □   ■   □   □   ■      │
│ T   ■   □   ■   ■   □   ■   ■   □   ■   ■   □   ■   ■   □      │
│ F   □   ■   □   □   ■   □   □   ■   □   □   ■   □   □   ■      │
│ S   ■   □   ■   ■   □   ■   ■   □   ■   ■   □   ■   ■   □      │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│ FOOTER: Résumé                                                   │
│ 40 matchs joués • 25V-15D • +5.2 avg point diff                 │
└─────────────────────────────────────────────────────────────────┘
```

### Fonctionnalités clés à implémenter

1. **Grille week-based**
   - Calquer exactement la logique de `PlayerPresenceCalendar`
   - Semaines de dimanche à samedi
   - Affichage jusqu'à aujourd'hui uniquement

2. **Sizing responsive**
   - Utiliser `useRef` + `ResizeObserver` pour mesurer le container
   - Calcul: `squareSize = floor((containerWidth - gaps) / weekCount)`
   - Contraintes: min 8px, max 60px

3. **Tooltips**
   - Au hover: "vs LAL (H) - W 112-105 (+7)"
   - Format: "vs {opponent} ({H/A}) - {result} {team_pts}-{opp_pts} ({diff})"

4. **Labels des jours**
   - Mobile: S, M, T, W, T, F, S
   - Desktop: Sun, Mon, Tue, Wed, Thu, Fri, Sat

5. **Labels des semaines**
   - Afficher le mois + jour de début de semaine
   - Transition de mois clairement visible

---

## 6. Intégration Page Équipe

### Modification de `teams/[teamId]/page.tsx`

```typescript
// Ajouts aux imports
import { TeamPresenceCalendar } from '@/components/teams'

// Ajout au state
const [teamGames, setTeamGames] = useState<TeamGameDay[]>([])

// Ajout au useEffect (fetch des données)
const gamesRes = await fetch(`/api/teams/${teamId}/games`)
if (gamesRes.ok) {
  const gamesData = await gamesRes.json()
  setTeamGames(gamesData)
}

// Ajout au JSX (après TeamRankingDualChart)
{teamGames.length > 0 && (
  <div className="mt-8">
    <TeamPresenceCalendar
      games={teamGames}
      seasonStart={`2025-10-22`}
      seasonEnd={`2026-04-13`}
      teamAbbr={teamStats.abbreviation}
      fullSize={true}
    />
  </div>
)}
```

---

## 7. Stats Affichées

### Header
- Légende couleurs: Win (emerald) | Loss (red) | Off day (zinc)
- Record: "25W-15D"
- Win%: ".625"

### Footer
- Matchs joués: "40 matchs"
- Record complet: "25V-15D"
- Point diff moyen: "+5.2 avg"
- Home/Away split: "15-5 (H) • 10-10 (A)"

---

## 8. Fichiers à Créer/Modifier

| Fichier | Action | Complexité |
|---------|--------|------------|
| `components/teams/TeamPresenceCalendar.tsx` | CREATE | Haute |
| `components/teams/index.ts` | MODIFY | Basse |
| `lib/queries.ts` | MODIFY | Moyenne |
| `app/api/teams/[teamId]/games/route.ts` | CREATE | Basse |
| `app/(dashboard)/teams/[teamId]/page.tsx` | MODIFY | Moyenne |

---

## 9. Ordre d'Exécution

### Phase 1: Backend (Query + API)
- [ ] Ajouter `TeamGameDay` interface dans `queries.ts`
- [ ] Implémenter `getTeamGameHistory()` dans `queries.ts`
- [ ] Créer `/api/teams/[teamId]/games/route.ts`
- [ ] Tester l'endpoint manuellement

### Phase 2: Composant UI
- [ ] Créer `TeamPresenceCalendar.tsx` (copier structure de PlayerPresenceCalendar)
- [ ] Adapter les interfaces et la logique de couleurs
- [ ] Implémenter le tooltip avec format équipe
- [ ] Exporter dans `index.ts`

### Phase 3: Intégration
- [ ] Modifier `teams/[teamId]/page.tsx` pour fetch et afficher
- [ ] Tester visuellement sur différentes équipes
- [ ] Vérifier responsive sur mobile

---

## 10. Patterns à Réutiliser de PlayerPresenceCalendar

| Pattern | Lignes Source | Usage |
|---------|---------------|-------|
| Week generation | L78-109 | Génération grille calendrier |
| GameMap useMemo | L111-120 | Lookup rapide par date |
| Responsive sizing | L122-160 | Calcul taille carrés |
| Day labels | L178-195 | Labels jours de la semaine |
| Week labels | L197-230 | Labels mois/semaine |
| Grid rendering | L232-280 | Rendu des carrés |
| Color logic | L55-75 | Fonction getSquareColor |
| Stats calculation | L162-176 | Calcul W/L/total |

---

## 11. Différences Clés vs PlayerPresenceCalendar

| Aspect | PlayerPresenceCalendar | TeamPresenceCalendar |
|--------|------------------------|----------------------|
| État "missed" | DNP (joueur pas joué) | N/A (équipe joue toujours) |
| Couleur intensité | Points marqués (10-30+) | Écart de points (0-20+) |
| Double couleur | Non (emerald uniquement) | Oui (emerald=W, red=L) |
| Tooltip | Points + opponent | Score complet + diff |
| Stats footer | Played/Missed/W/L | Record + Home/Away split |

---

## 12. Spécifications Design

### Design Tokens
- Background carré: `bg-zinc-900/50` (jour sans match)
- Victoire: gradient `bg-emerald-400` à `bg-emerald-800`
- Défaite: gradient `bg-red-400` à `bg-red-800`
- Border: `border border-zinc-800`
- Container: `bg-zinc-900/50 border border-zinc-800 rounded-lg p-4`

### Typography
- Titre: `text-white text-sm font-medium`
- Labels jours: `text-[10px] md:text-xs text-zinc-500`
- Labels semaines: `text-[10px] text-zinc-500`
- Stats: `font-mono text-white`
- Record: `text-emerald-400` (positive) / `text-red-400` (negative)

### Responsive
- Mobile: Carrés 11-14px, labels abrégés (S, M, T...)
- Desktop: Carrés 14-60px, labels complets
- fullSize mode: 80vh height, calcul dynamique

---

## Validation Checklist

- [ ] Query retourne les bons matchs pour la saison courante
- [ ] API endpoint fonctionne avec différents team_id
- [ ] Calendrier s'affiche correctement pour toutes les équipes
- [ ] Couleurs reflètent W/L et intensité d'écart
- [ ] Tooltips affichent score complet
- [ ] Responsive fonctionne sur mobile
- [ ] Stats header/footer sont corrects
- [ ] Build TypeScript sans erreurs
