# Plan: Redesign Page Games + Page Détail Match

**Date**: 2025-01-09
**Branch**: `feature/games-page-redesign`
**Status**: ✅ Complété

---

## Objectif

Transformer la page `/games` en hub betting-centric avec:
- Navigation par jour (date picker horizontal)
- Focus "Ce soir" puis "Hier"
- Cards cliquables vers page détail
- Odds inline (spread + total) - placeholder pour future intégration
- Design compact

---

## Phase 0: Setup ✅
- [x] Créer branche `feature/games-page-redesign`
- [x] Vérifier structure actuelle de `/games`

---

## Phase 1: Page Détail Match (Skeleton) ✅

### 1.1 Route `/games/[gameId]/page.tsx` créée
- Route dynamique avec paramètre `gameId`
- Header avec équipes, date, records
- Score pour matchs terminés
- Onglets placeholder (H2H, Forme, Stats, Trends)

---

## Phase 2: Data Layer ✅

### Queries créées dans `queries.ts`:
- `getGameById(gameId)` - Détails d'un match
- `getGamesByDate(date)` - Matchs d'une date
- `getGamesCountByDateRange(start, end)` - Compteurs pour date picker

### Types TypeScript:
```typescript
interface GameWithOdds {
  game_id: string
  game_date: string
  game_time: string | null
  home/away_team_id, abbr, name
  home/away_score, wins, losses
  status: 'Scheduled' | 'In Progress' | 'Final'
  spread_home, total (null pour l'instant)
}

interface GameDetail extends GameWithOdds {
  venue, attendance
}
```

---

## Phase 3: Composants UI ✅

### Fichiers créés:
- `components/games/DatePicker.tsx` - Sélecteur horizontal 7 jours
- `components/games/GameCard.tsx` - Card cliquable avec équipes, scores, odds
- `components/games/GameSection.tsx` - Section avec titre et grille
- `components/games/index.ts` - Exports

---

## Phase 4: Refactor Page Games ✅

### Nouveau layout:
- DatePicker en haut
- Section "Ce soir" pour matchs du jour
- Section "Hier" pour résultats (visible seulement si aujourd'hui sélectionné)
- Navigation par click sur dates

### APIs créées:
- `GET /api/games?date=YYYY-MM-DD` - Matchs d'une date
- `GET /api/games/count?start=...&end=...` - Compteurs

---

## Phase 5: Tests & Validation ✅

- [x] Navigation date picker fonctionnelle
- [x] Click cards → page détail
- [x] Affichage scores pour matchs terminés
- [x] Trophy icon pour gagnant
- [x] Design responsive (1/2/3 colonnes)
- [x] Build TypeScript réussi

---

## Fichiers créés/modifiés

### Nouveaux fichiers:
- `frontend/src/app/games/[gameId]/page.tsx`
- `frontend/src/app/api/games/count/route.ts`
- `frontend/src/components/games/DatePicker.tsx`
- `frontend/src/components/games/GameCard.tsx`
- `frontend/src/components/games/GameSection.tsx`
- `frontend/src/components/games/index.ts`

### Fichiers modifiés:
- `frontend/src/app/games/page.tsx` - Refactor complet (client component)
- `frontend/src/app/api/games/route.ts` - Ajout support date param
- `frontend/src/lib/queries.ts` - Nouvelles queries + fix season filter

---

## Phase 6: Heures des matchs ✅

### Problème identifié:
- La table `games` n'avait pas de colonne pour l'heure
- L'API `LeagueGameFinder` ne fournit que la date, pas l'heure
- Tous les matchs affichaient "00:00"

### Solution implémentée:
1. **Migration 025**: Ajout colonnes `game_time` (TIME), `game_time_et` (VARCHAR), `arena`
2. **ETL script**: `1.DATABASE/etl/sync_game_times.py` - Récupère les heures depuis ScoreboardV2
3. **Conversion timezone**: UTC → CET (UTC+1) dans les requêtes SQL
4. **Queries mises à jour**: `getGameById`, `getGamesByDate` utilisent maintenant `game_time`

### Vérification heures du 2026-01-09:
| Match | Heure CET | Heure officielle |
|-------|-----------|------------------|
| TOR @ BOS | 01:00 | 1:00 AM CET ✅ |
| PHI @ ORL | 01:00 | 1:00 AM CET ✅ |
| NOP @ WAS | 01:00 | 1:00 AM CET ✅ |
| LAC @ BKN | 01:30 | 1:30 AM CET ✅ |
| OKC @ MEM | 02:00 | 2:00 AM CET ✅ |
| ATL @ DEN | 03:00 | 3:00 AM CET ✅ |
| NYK @ PHX | 03:00 | 3:00 AM CET ✅ |
| SAC @ GSW | 04:00 | 4:00 AM CET ✅ |
| HOU @ POR | 04:00 | 4:00 AM CET ✅ |
| MIL @ LAL | 04:30 | 4:30 AM CET ✅ |

---

## Améliorations futures

- [ ] Intégration vraies odds depuis `betting_odds` table
- [ ] Indicateurs cover/miss pour matchs terminés
- [ ] Contenu page détail (H2H, forme, stats, trends)
- [ ] Animation transition entre pages
- [ ] Intégrer `sync_game_times.py` dans le workflow ETL quotidien
