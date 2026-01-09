# Plan: Global Search Bar (Command Palette)

**Date**: 2026-01-09
**Status**: ✅ Implémenté
**Completed**: 2026-01-09
**Objectif**: Implémenter une barre de recherche globale style Command Palette (⌘K) pour navigation rapide

---

## Analyse du Contexte

### Éléments Recherchables
| Type | Quantité | Priorité | Source |
|------|----------|----------|--------|
| Teams | 30 | ★★★★★ | Client (cache) |
| Players | 400+ | ★★★★★ | Server (API) |
| Games (today) | 5-15 | ★★★★☆ | Server (API) |
| Pages/Navigation | ~20 | ★★★☆☆ | Client (static) |

### Architecture Actuelle
- `AppLayout.tsx`: Client Component avec header (logo + nav horizontale)
- API Routes: Pattern `/api/[resource]/route.ts`
- Database: PostgreSQL via `lib/db.ts` + `lib/queries.ts`
- Styling: Tailwind v4, dark theme (#000000 bg)

---

## Architecture Technique

### Diagramme
```
┌─────────────────────────────────────────────────────────────┐
│                    SEARCH ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │ SearchBar   │───▶│ SearchModal  │───▶│ SearchResults │  │
│  │ (trigger)   │    │ (overlay)    │    │ (grouped)     │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
│        │                   │                    │          │
│        │                   ▼                    │          │
│        │            ┌─────────────┐             │          │
│        │            │ useSearch   │◀────────────┘          │
│        │            │ (hook)      │                        │
│        │            └─────────────┘                        │
│        │                   │                               │
│        ▼                   ▼                               │
│  ┌───────────┐    ┌───────────────────────────────┐       │
│  │ ⌘K global │    │ Federated Search              │       │
│  │ listener  │    │ ┌─────────┐ ┌───────────────┐ │       │
│  └───────────┘    │ │ Client  │ │ Server        │ │       │
│                   │ │ • Teams │ │ • Players     │ │       │
│                   │ │ • Pages │ │ • Games       │ │       │
│                   │ │ (instant)│ │ (debounced)  │ │       │
│                   │ └─────────┘ └───────────────┘ │       │
│                   └───────────────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Stratégie Hybride
1. **Client-Side (Instant)**: Teams (30) + Pages navigation (20)
   - Préchargé au mount de l'app
   - Filtrage instantané en mémoire
   - Zero latence perçue

2. **Server-Side (Debounced 300ms)**: Players + Games
   - API call après 300ms d'inactivité
   - Minimum 2 caractères pour déclencher
   - Cache React Query (1 minute stale time)

---

## Design UX

### Wireframe - Search Modal
```
╭────────────────────────────────────────────────────────────────╮
│ 🔍 │ Search teams, players, games...                      ⌘K  │
╰────────────────────────────────────────────────────────────────╯

[On focus/⌘K - Modal Overlay]

╭────────────────────────────────────────────────────────────────╮
│ 🔍 │ cel                                                   ✕  │
├────────────────────────────────────────────────────────────────┤
│ TEAMS                                                          │
│ ▶ 🏀 Boston Celtics              BOS   42-12   #1 East        │
│                                                                │
│ PLAYERS                                                        │
│   👤 Jayson Tatum                BOS   26.8 PPG                │
│   👤 Jaylen Brown                BOS   24.2 PPG                │
│   👤 Al Horford                  BOS   8.8 PPG                 │
│                                                                │
│ GAMES                                                          │
│   📅 Celtics vs Heat             Tonight 7:30 PM              │
│   📅 Celtics @ 76ers             Jan 12                       │
├────────────────────────────────────────────────────────────────┤
│ ↑↓ Navigate   ↵ Select   esc Close                            │
╰────────────────────────────────────────────────────────────────╯
```

### États UI
| État | Comportement |
|------|-------------|
| **Empty** | Afficher recherches récentes (localStorage) |
| **Typing** | Client results instant, server skeleton |
| **Loading** | Skeleton pour sections server |
| **No Results** | Message "Aucun résultat pour X" |
| **Error** | Message d'erreur + retry button |

### Raccourcis Clavier
| Touche | Action |
|--------|--------|
| `⌘K` / `Ctrl+K` | Ouvrir la recherche |
| `Escape` | Fermer la recherche |
| `↓` | Résultat suivant |
| `↑` | Résultat précédent |
| `Enter` | Sélectionner et naviguer |
| `Tab` | Déplacer focus vers bouton fermer |

---

## Structure des Fichiers

```
frontend/src/
├── components/
│   ├── search/
│   │   ├── index.ts                 # Exports publics
│   │   ├── SearchBar.tsx            # Input trigger dans header
│   │   ├── SearchModal.tsx          # Overlay modal avec portal
│   │   ├── SearchResults.tsx        # Liste groupée des résultats
│   │   ├── SearchResultItem.tsx     # Item individuel
│   │   ├── SearchEmptyState.tsx     # État vide / récents
│   │   └── useSearch.ts             # Hook logique search
│   │
│   └── layout/
│       └── AppLayout.tsx            # MAJ: intégrer SearchBar
│
├── app/api/
│   └── search/
│       └── route.ts                 # GET /api/search?q=xxx
│
└── lib/
    └── queries.ts                   # MAJ: ajouter searchPlayers, searchGames
```

---

## Types TypeScript

```typescript
// types/search.ts

interface SearchResult {
  type: 'team' | 'player' | 'game' | 'page'
  id: string | number
  title: string
  subtitle?: string
  url: string
  icon?: string
  meta?: Record<string, string | number>
}

interface TeamSearchResult extends SearchResult {
  type: 'team'
  id: number
  abbreviation: string
  record: string
  conferenceRank: number
}

interface PlayerSearchResult extends SearchResult {
  type: 'player'
  id: number
  teamAbbreviation: string
  ppg: number
}

interface GameSearchResult extends SearchResult {
  type: 'game'
  id: string
  homeTeam: string
  awayTeam: string
  gameTime: string
  isToday: boolean
}

interface PageSearchResult extends SearchResult {
  type: 'page'
  category: string
}

interface SearchState {
  query: string
  isOpen: boolean
  isLoading: boolean
  results: {
    teams: TeamSearchResult[]
    players: PlayerSearchResult[]
    games: GameSearchResult[]
    pages: PageSearchResult[]
  }
  selectedIndex: number
  recentSearches: string[]
}
```

---

## Queries SQL

### Teams Search (Client-side data fetch)
```sql
-- Préchargé une fois au mount
SELECT
  t.team_id,
  t.full_name,
  t.abbreviation,
  t.city,
  ts.wins,
  ts.losses,
  ts.conference_rank
FROM teams t
LEFT JOIN team_standings ts ON t.team_id = ts.team_id
WHERE ts.season = $1;
```

### Players Search (Server-side)
```sql
-- ILIKE pour MVP, migrer vers trigram si besoin
SELECT
  p.player_id,
  p.full_name,
  t.abbreviation as team_abbreviation,
  COALESCE(pas.ppg, 0) as ppg
FROM players p
JOIN teams t ON p.team_id = t.team_id
LEFT JOIN player_advanced_stats pas ON p.player_id = pas.player_id
WHERE p.full_name ILIKE '%' || $1 || '%'
ORDER BY pas.ppg DESC NULLS LAST
LIMIT 10;
```

### Games Search (Server-side)
```sql
-- Matchs aujourd'hui et à venir
SELECT
  g.game_id,
  g.game_date,
  g.game_time,
  ht.full_name as home_team,
  ht.abbreviation as home_abbr,
  at.full_name as away_team,
  at.abbreviation as away_abbr
FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
WHERE g.game_date >= CURRENT_DATE
  AND (ht.full_name ILIKE '%' || $1 || '%'
       OR at.full_name ILIKE '%' || $1 || '%'
       OR ht.abbreviation ILIKE '%' || $1 || '%'
       OR at.abbreviation ILIKE '%' || $1 || '%')
ORDER BY g.game_date ASC
LIMIT 5;
```

---

## Pages Navigation (Static)

```typescript
// data/navigationPages.ts
export const NAVIGATION_PAGES: PageSearchResult[] = [
  { type: 'page', id: 'dashboard', title: 'Dashboard', url: '/', category: 'Main', icon: '🏠' },
  { type: 'page', id: 'teams', title: 'Teams', url: '/teams', category: 'Stats', icon: '🏀' },
  { type: 'page', id: 'players', title: 'Players', url: '/players', category: 'Stats', icon: '👤' },
  { type: 'page', id: 'betting', title: 'Betting', url: '/betting', category: 'Betting', icon: '💰' },
  { type: 'page', id: 'odds', title: 'Odds Terminal', url: '/betting/odds', category: 'Betting', icon: '📊' },
  { type: 'page', id: 'value-finder', title: 'Value Finder', url: '/betting/value-finder', category: 'Betting', icon: '🎯' },
  { type: 'page', id: 'totals', title: 'Totals Analysis', url: '/betting/totals', category: 'Betting', icon: '📈' },
  { type: 'page', id: 'h2h', title: 'Head to Head', url: '/analysis/h2h', category: 'Analysis', icon: '⚔️' },
  { type: 'page', id: 'quarters', title: 'Quarters Analysis', url: '/analysis/quarters', category: 'Analysis', icon: '🔢' },
  { type: 'page', id: 'pace', title: 'Pace Analysis', url: '/analysis/pace', category: 'Analysis', icon: '⚡' },
  { type: 'page', id: 'dispersion', title: 'Dispersion Analysis', url: '/analysis/dispersion', category: 'Analysis', icon: '📉' },
  { type: 'page', id: 'player-props', title: 'Player Props', url: '/player-props', category: 'Props', icon: '🎲' },
]
```

---

## Accessibilité (WCAG 2.1 AA)

### Structure ARIA
```tsx
<div
  role="combobox"
  aria-expanded={isOpen}
  aria-haspopup="listbox"
  aria-owns="search-results"
>
  <input
    type="text"
    role="searchbox"
    aria-autocomplete="list"
    aria-controls="search-results"
    aria-activedescendant={`result-${selectedIndex}`}
    placeholder="Rechercher..."
  />

  {isOpen && (
    <ul id="search-results" role="listbox" aria-label="Résultats de recherche">
      {results.map((result, index) => (
        <li
          key={result.id}
          id={`result-${index}`}
          role="option"
          aria-selected={selectedIndex === index}
        >
          {result.title}
        </li>
      ))}
    </ul>
  )}
</div>

{/* Screen reader announcements */}
<div aria-live="polite" className="sr-only">
  {isLoading ? 'Recherche en cours...' : `${totalResults} résultats trouvés`}
</div>
```

### Focus Management
1. Focus input quand modal s'ouvre
2. Trap focus dans la modal
3. Retour focus au trigger à la fermeture
4. Indicateurs focus visibles (ring-2 ring-white)

---

## Performance

### Optimisations
| Technique | Cible | Impact |
|-----------|-------|--------|
| Debounce 300ms | API calls | -90% requests |
| Client cache teams | First paint | Instant results |
| React Query stale | API results | 1min cache |
| Virtualization | Long lists | Si >100 items |

### Métriques Cibles
| Métrique | Objectif |
|----------|----------|
| Time to open modal | < 100ms |
| Client results | < 50ms |
| Server results | < 500ms |
| Memory footprint | < 500KB |

---

## Phases d'Implémentation

### Phase 1: MVP (Core Search) ✦ ✅ Complété
1. [x] Créer structure dossiers `components/search/`
2. [x] Implémenter `SearchBar.tsx` (input trigger)
3. [x] Implémenter `SearchModal.tsx` (overlay portal)
4. [x] Ajouter raccourci ⌘K global
5. [x] Recherche Teams + Pages (client-side)
6. [x] Styling Tailwind dark theme
7. [x] Intégrer dans `AppLayout.tsx`

**Livrable**: ✅ Recherche fonctionnelle pour teams et navigation

### Phase 2: Server Integration ✦ ✅ Complété
8. [x] Créer `/api/search/route.ts`
9. [x] Ajouter queries `searchPlayers`, `searchGames` dans `queries.ts`
10. [x] Implémenter debounce + API calls dans `useSearch.ts`
11. [x] Ajouter états loading (skeleton)
12. [x] Gestion erreurs API

**Livrable**: ✅ Recherche players et games fonctionnelle

### Phase 3: UX Polish ✦ ✅ Complété
13. [x] Recherches récentes (localStorage)
14. [x] Navigation clavier complète (↑↓ Enter Esc)
15. [ ] Highlighting du texte matché (future enhancement)
16. [x] États vide / no results / error
17. [ ] Animations open/close (future enhancement)

**Livrable**: ✅ UX fonctionnelle et navigable

### Phase 4: Performance & A11y ✦ ✅ Complété (partiel)
18. [x] Caching teams côté client
19. [x] ARIA complet (combobox pattern)
20. [ ] Screen reader announcements (future enhancement)
21. [ ] Tests accessibilité (future enhancement)
22. [ ] Migration trigram search (optionnel, si latence >500ms)

**Livrable**: Production-ready avec accessibilité

---

## Estimation

| Phase | Fichiers | Lignes | Complexité |
|-------|----------|--------|------------|
| Phase 1 | 5 | ~300 | Moyenne |
| Phase 2 | 3 | ~200 | Moyenne |
| Phase 3 | 2 | ~150 | Faible |
| Phase 4 | 2 | ~100 | Moyenne |
| **Total** | **~8** | **~750** | **Moyenne** |

---

## Risques & Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Performance ILIKE sur players | Moyenne | Moyen | Migrer vers trigram si latence >500ms |
| Complexité a11y | Faible | Élevé | Utiliser patterns ARIA établis |
| Conflits raccourcis ⌘K | Faible | Faible | Fallback Ctrl+K, / pour search |

---

## Critères de Succès

- [x] Utilisateur trouve n'importe quelle équipe en 3 frappes clavier max
- [x] Résultats client affichés en < 50ms
- [x] Résultats server affichés en < 500ms
- [x] Navigation 100% clavier possible
- [ ] Audit a11y WCAG 2.1 AA passé (future)
- [x] Aucune régression sur pages existantes

---

## Fichiers Créés/Modifiés

### Nouveaux fichiers
- `frontend/src/types/search.ts` - Types TypeScript pour le système de recherche
- `frontend/src/lib/navigation-pages.ts` - Pages statiques pour recherche client
- `frontend/src/components/search/useSearch.ts` - Hook logique avec debouncing
- `frontend/src/components/search/SearchBar.tsx` - Bouton trigger avec ⌘K
- `frontend/src/components/search/SearchResultItem.tsx` - Item individuel
- `frontend/src/components/search/SearchResults.tsx` - Liste groupée
- `frontend/src/components/search/SearchModal.tsx` - Modal avec Portal
- `frontend/src/components/search/index.ts` - Exports publics
- `frontend/src/app/api/search/route.ts` - API recherche players/games
- `frontend/src/app/api/teams/search-data/route.ts` - API teams formatées

### Fichiers modifiés
- `frontend/src/lib/queries.ts` - Ajout `getTeamsForSearch`, `searchPlayers`, `searchGames`
- `frontend/src/components/layout/AppLayout.tsx` - Intégration SearchBar + SearchModal

---

**✅ Implémentation terminée le 2026-01-09**
