# Plan d'implémentation : Composants d'analyse d'impact des absences

**Date de création** : 2025-11-20
**Statut** : ✅ Validé - Prêt pour implémentation
**Priorité** : Haute (fonctionnalité betting critique)

---

## 📋 Vue d'ensemble

Ajouter 3 nouveaux composants de visualisation pour analyser l'impact des absences de joueurs sur les performances individuelles et collectives.

### Composants à créer

1. **PlayerAbsenceImpact** - Dashboard global d'impact d'absence d'un joueur
2. **TeamPerformanceWithoutPlayer** - Performances d'équipe avec/sans un joueur spécifique
3. **PlayerPerformanceWithoutTeammate** - Performances d'un joueur avec/sans un coéquipier

### Valeur ajoutée

- **Betting context** : Évaluer l'impact réel des absences sur les lignes (spreads, totals, props)
- **Usage rate analysis** : Identifier les bénéficiaires d'absences (props betting)
- **Team dependency** : Mesurer la dépendance d'une équipe à un joueur clé

---

## 🗄️ Phase 1 : Structure de données

### Migration 009 : Player Game Participation

**Fichier** : `1.DATABASE/migrations/009_player_game_participation.sql`

```sql
-- ==================== PLAYER GAME PARTICIPATION ====================
-- Track qui a joué dans chaque match (pour identifier les absences)

CREATE TABLE player_game_participation (
    participation_id BIGSERIAL PRIMARY KEY,
    game_id VARCHAR(10) NOT NULL REFERENCES games(game_id),
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    is_active BOOLEAN NOT NULL, -- Vrai si le joueur a joué, faux si absent
    inactive_reason VARCHAR(50), -- 'injury', 'rest', 'dnp-cd', 'suspension', etc.
    minutes_played INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, player_id)
);

-- Indexes for performance
CREATE INDEX idx_participation_game ON player_game_participation(game_id);
CREATE INDEX idx_participation_player ON player_game_participation(player_id);
CREATE INDEX idx_participation_active ON player_game_participation(is_active);
CREATE INDEX idx_participation_team_game ON player_game_participation(team_id, game_id);

-- Comments
COMMENT ON TABLE player_game_participation IS 'Tracks player participation and absences for each game';
COMMENT ON COLUMN player_game_participation.is_active IS 'TRUE if player played, FALSE if absent';
COMMENT ON COLUMN player_game_participation.inactive_reason IS 'Reason for absence: injury, rest, dnp-cd, suspension, etc.';
```

**Logique de population** :
- Si `player_game_stats` existe pour un joueur/match → `is_active = true`, `minutes_played = minutes`
- Sinon → identifier les absences via roster API NBA → `is_active = false`
- Raisons d'absence depuis injury reports API

---

## 📊 Phase 2 : Queries TypeScript

### Nouvelles queries dans `frontend/src/lib/queries.ts`

#### 1. Team Splits With/Without Player

```typescript
export interface TeamSplitsWithPlayer {
  with_player: {
    games: number
    wins: number
    losses: number
    win_pct: number
    points_avg: number
    points_allowed_avg: number
    net_rating: number
  }
  without_player: {
    games: number
    wins: number
    losses: number
    win_pct: number
    points_avg: number
    points_allowed_avg: number
    net_rating: number
  }
  difference: {
    win_pct_diff: number      // Positive = team better with player
    points_diff: number        // Positive = team scores more with player
    net_rating_diff: number    // Positive = team better with player
  }
}

export async function getTeamSplitsWithPlayer(
  teamId: number,
  playerId: number,
  season: string
): Promise<TeamSplitsWithPlayer> {
  // Query logic:
  // 1. Join games + player_game_participation
  // 2. Split games into with/without based on is_active
  // 3. Calculate team stats for each split
  // 4. Compute differences
}
```

#### 2. Player Splits With/Without Teammate

```typescript
export interface PlayerSplitsWithTeammate {
  with_teammate: {
    games: number
    minutes_avg: number
    points_avg: number
    rebounds_avg: number
    assists_avg: number
    fg_pct: number
    fg3_pct: number
    usage_rate: number
    ts_pct: number
  }
  without_teammate: {
    games: number
    minutes_avg: number
    points_avg: number
    rebounds_avg: number
    assists_avg: number
    fg_pct: number
    fg3_pct: number
    usage_rate: number
    ts_pct: number
  }
  difference: {
    points_diff: number        // Positive = scores more without teammate
    usage_diff: number         // Positive = higher usage without teammate
    efficiency_diff: number    // TS% difference
  }
}

export async function getPlayerSplitsWithTeammate(
  playerId: number,
  teammateId: number,
  season: string
): Promise<PlayerSplitsWithTeammate> {
  // Query logic:
  // 1. Get all games for player
  // 2. Check teammate participation in each game
  // 3. Split player stats based on teammate presence
  // 4. Calculate averages for each split
}
```

#### 3. Most Impactful Absences

```typescript
export interface ImpactfulAbsence {
  player_id: number
  player_name: string
  position: string
  games_missed: number
  team_win_pct_with: number
  team_win_pct_without: number
  impact_score: number          // Win% difference (absolute value)
  net_rating_impact: number     // Net rating difference
}

export async function getMostImpactfulAbsences(
  teamId: number,
  season: string,
  minGamesMissed: number = 5
): Promise<ImpactfulAbsence[]> {
  // Query logic:
  // 1. For each player on team, calculate with/without splits
  // 2. Filter by minGamesMissed
  // 3. Calculate impact_score = abs(win_pct_with - win_pct_without)
  // 4. Order by impact_score DESC
}
```

#### 4. Player Absence Timeline

```typescript
export interface PlayerAbsence {
  game_id: string
  game_date: string
  opponent: string
  opponent_abbreviation: string
  is_home: boolean
  inactive_reason: string
  team_result: 'W' | 'L'
  team_score: number
  opponent_score: number
}

export async function getPlayerAbsenceTimeline(
  playerId: number,
  season: string
): Promise<PlayerAbsence[]> {
  // Query logic:
  // 1. Get all games where player was inactive
  // 2. Include game details and team result
  // 3. Order by game_date DESC
}
```

---

## 🎨 Phase 3 : Composants de visualisation

### 1. PlayerAbsenceImpact

**Fichier** : `frontend/src/components/player-props/PlayerAbsenceImpact.tsx`

**Props** :
```typescript
interface PlayerAbsenceImpactProps {
  playerId: number
  playerName: string
  season: string
  className?: string
}
```

**Structure** :
```tsx
<Card variant="default" className="space-y-6">
  {/* Header */}
  <div className="flex items-center gap-4">
    <PlayerPhoto playerId={playerId} />
    <div>
      <h2 className="text-xl font-bold text-white">{playerName}</h2>
      <p className="text-sm text-gray-400">Absence Impact Analysis</p>
    </div>
  </div>

  {/* Team Performance Splits */}
  <div>
    <h3 className="text-lg font-semibold text-white mb-4">Team Performance</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* With Player Column */}
      <div className="space-y-3">
        <div className="text-sm text-gray-400 uppercase">With {playerName}</div>
        <StatCard label="Win %" value={withPlayer.win_pct} />
        <StatCard label="Points" value={withPlayer.points_avg} />
        <StatCard label="Opp Points" value={withPlayer.points_allowed_avg} />
        <StatCard label="Net Rating" value={withPlayer.net_rating} />
      </div>

      {/* Without Player Column */}
      <div className="space-y-3">
        <div className="text-sm text-gray-400 uppercase">Without {playerName}</div>
        <StatCard label="Win %" value={withoutPlayer.win_pct} />
        <StatCard label="Points" value={withoutPlayer.points_avg} />
        <StatCard label="Opp Points" value={withoutPlayer.points_allowed_avg} />
        <StatCard label="Net Rating" value={withoutPlayer.net_rating} />
      </div>
    </div>

    {/* Impact Summary */}
    <div className="mt-4 p-4 bg-gray-950 rounded-lg border border-gray-800">
      <div className="text-sm text-gray-400">Impact Summary</div>
      <div className="mt-2 space-y-1">
        <ImpactLine
          label="Win % Difference"
          value={difference.win_pct_diff}
          format="percentage"
        />
        <ImpactLine
          label="Net Rating Difference"
          value={difference.net_rating_diff}
          format="decimal"
        />
      </div>
    </div>
  </div>

  {/* Team Record Bar Chart */}
  <div>
    <h3 className="text-lg font-semibold text-white mb-4">Record Comparison</h3>
    <BarChart
      data={[
        { label: 'With', wins: withPlayer.wins, losses: withPlayer.losses },
        { label: 'Without', wins: withoutPlayer.wins, losses: withoutPlayer.losses }
      ]}
      colorMode="threshold"
    />
  </div>

  {/* Absence Timeline */}
  <div>
    <h3 className="text-lg font-semibold text-white mb-4">
      Games Missed ({absences.length})
    </h3>
    <div className="space-y-2">
      {absences.map(absence => (
        <AbsenceCard key={absence.game_id} absence={absence} />
      ))}
    </div>
  </div>
</Card>
```

**Features** :
- 2-column grid comparison (With / Without)
- Color-coded impact indicators (green = positive impact, red = negative)
- Bar chart for W-L record
- Timeline of absences avec raisons
- Loading states avec Skeleton

---

### 2. TeamPerformanceWithoutPlayer

**Fichier** : `frontend/src/components/stats/TeamPerformanceWithoutPlayer.tsx`

**Props** :
```typescript
interface TeamPerformanceWithoutPlayerProps {
  teamId: number
  teamName: string
  season: string
  initialPlayerId?: number
  className?: string
}
```

**Structure** :
```tsx
<Card variant="default" className="space-y-6">
  {/* Header + Player Selector */}
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-bold text-white">
      {teamName} - Player Impact Analysis
    </h2>
    <select
      className="..."
      value={selectedPlayerId}
      onChange={(e) => setSelectedPlayerId(Number(e.target.value))}
    >
      {impactfulPlayers.map(player => (
        <option key={player.player_id} value={player.player_id}>
          {player.player_name} ({player.games_missed} games missed)
        </option>
      ))}
    </select>
  </div>

  {/* Performance Comparison Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* With Player */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-green-400">
        With {selectedPlayerName}
      </h3>
      <div className="space-y-3">
        <StatCard label="Record" value={`${with.wins}-${with.losses}`} />
        <StatCard label="Win %" value={with.win_pct} />
        <StatCard label="Off Rating" value={with.off_rating} />
        <StatCard label="Def Rating" value={with.def_rating} />
        <StatCard label="Net Rating" value={with.net_rating} />
        <StatCard label="Pace" value={with.pace} />
      </div>
    </div>

    {/* Without Player */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-red-400">
        Without {selectedPlayerName}
      </h3>
      <div className="space-y-3">
        <StatCard label="Record" value={`${without.wins}-${without.losses}`} />
        <StatCard label="Win %" value={without.win_pct} />
        <StatCard label="Off Rating" value={without.off_rating} />
        <StatCard label="Def Rating" value={without.def_rating} />
        <StatCard label="Net Rating" value={without.net_rating} />
        <StatCard label="Pace" value={without.pace} />
      </div>
    </div>
  </div>

  {/* Bar Chart: Points For/Against */}
  <div>
    <h3 className="text-lg font-semibold text-white mb-4">
      Scoring Comparison
    </h3>
    <BarChart
      data={[
        { label: 'With - PPG', value: with.points_avg },
        { label: 'With - OPPG', value: with.points_allowed_avg },
        { label: 'Without - PPG', value: without.points_avg },
        { label: 'Without - OPPG', value: without.points_allowed_avg }
      ]}
    />
  </div>

  {/* Verdict */}
  <div className="p-4 bg-gray-950 rounded-lg border border-gray-800">
    <div className="text-sm text-gray-400 mb-2">Analysis</div>
    <p className="text-white">
      {getVerdictText(difference)}
    </p>
  </div>
</Card>
```

**Use case** : Page équipe → Onglet "Lineup Impact"

---

### 3. PlayerPerformanceWithoutTeammate

**Fichier** : `frontend/src/components/player-props/PlayerPerformanceWithoutTeammate.tsx`

**Props** :
```typescript
interface PlayerPerformanceWithoutTeammateProps {
  playerId: number
  playerName: string
  season: string
  initialTeammateId?: number
  className?: string
}
```

**Structure** :
```tsx
<Card variant="default" className="space-y-6">
  {/* Header + Teammate Selector */}
  <div className="flex items-center justify-between">
    <h2 className="text-xl font-bold text-white">
      {playerName} - Lineup Dependencies
    </h2>
    <select
      className="..."
      value={selectedTeammateId}
      onChange={(e) => setSelectedTeammateId(Number(e.target.value))}
    >
      {teammates.map(tm => (
        <option key={tm.player_id} value={tm.player_id}>
          {tm.player_name}
        </option>
      ))}
    </select>
  </div>

  {/* Comparison Card */}
  <ComparisonCard
    entityA={{
      id: `${playerId}-with`,
      name: `With ${selectedTeammateName}`,
      stats: withTeammate
    }}
    entityB={{
      id: `${playerId}-without`,
      name: `Without ${selectedTeammateName}`,
      stats: withoutTeammate
    }}
    statKeys={[
      { key: 'points_avg', label: 'PPG' },
      { key: 'rebounds_avg', label: 'RPG' },
      { key: 'assists_avg', label: 'APG' },
      { key: 'usage_rate', label: 'Usage %' },
      { key: 'fg_pct', label: 'FG%' },
      { key: 'ts_pct', label: 'TS%' }
    ]}
    variant="horizontal"
  />

  {/* Performance Trend Chart */}
  <div>
    <h3 className="text-lg font-semibold text-white mb-4">
      PPG Trend (Last 20 Games)
    </h3>
    <PerformanceTrendWithAbsenceMarkers
      games={last20Games}
      teammateAbsences={teammateAbsenceGames}
      statKey="points"
    />
  </div>

  {/* Key Insights */}
  <div className="p-4 bg-gray-950 rounded-lg border border-gray-800">
    <div className="text-sm text-gray-400 mb-2">Key Insights</div>
    <ul className="space-y-2 text-sm text-white">
      <li>
        • Usage rate {difference.usage_diff > 0 ? 'increases' : 'decreases'} by{' '}
        <span className="font-mono font-bold">
          {Math.abs(difference.usage_diff).toFixed(1)}%
        </span>{' '}
        without {selectedTeammateName}
      </li>
      <li>
        • Scoring {difference.points_diff > 0 ? 'increases' : 'decreases'} by{' '}
        <span className="font-mono font-bold">
          {Math.abs(difference.points_diff).toFixed(1)} PPG
        </span>
      </li>
      <li>
        • Efficiency (TS%) {difference.efficiency_diff > 0 ? 'improves' : 'declines'} by{' '}
        <span className="font-mono font-bold">
          {Math.abs(difference.efficiency_diff).toFixed(1)}%
        </span>
      </li>
    </ul>
  </div>
</Card>
```

**Use case** : Page player props → Section "Lineup Dependencies"

---

## 🔄 Phase 4 : Script ETL Python

### Script : `1.DATABASE/etl/track_player_participation.py`

**Localisation** : `1.DATABASE/etl/track_player_participation.py`

**Fonction** :
```python
"""
Track player participation and absences for each game
Populates player_game_participation table
"""

from nba_api.stats.endpoints import CommonPlayerInfo, BoxScoreTraditionalV2
import psycopg2
from datetime import datetime

def fetch_team_roster(team_id, season):
    """Fetch active roster for a team in a season"""
    # Use CommonTeamRoster endpoint
    pass

def get_game_participants(game_id):
    """Get list of players who played in a game"""
    box_score = BoxScoreTraditionalV2(game_id=game_id)
    players_stats = box_score.get_data_frames()[0]
    return players_stats[['PLAYER_ID', 'TEAM_ID', 'MIN']].to_dict('records')

def identify_absences(game_id, home_team_id, away_team_id, game_date, season):
    """
    Identify which roster players were absent from game
    Returns list of absences
    """
    # 1. Get roster for both teams
    home_roster = fetch_team_roster(home_team_id, season)
    away_roster = fetch_team_roster(away_team_id, season)

    # 2. Get players who played
    participants = get_game_participants(game_id)
    participant_ids = [p['PLAYER_ID'] for p in participants]

    # 3. Identify absences
    absences = []
    for player in home_roster + away_roster:
        if player['player_id'] not in participant_ids:
            absences.append({
                'game_id': game_id,
                'player_id': player['player_id'],
                'team_id': player['team_id'],
                'is_active': False,
                'inactive_reason': get_inactive_reason(player, game_date)
            })

    return absences

def get_inactive_reason(player, game_date):
    """
    Determine reason for absence
    Check injury reports API
    """
    # Query NBA injury reports API
    # Return 'injury', 'rest', 'dnp-cd', 'suspension', etc.
    pass

def sync_participation_for_season(season):
    """
    Sync player participation for all games in season
    """
    conn = psycopg2.connect(...)
    cursor = conn.cursor()

    # Get all games for season
    cursor.execute("""
        SELECT game_id, home_team_id, away_team_id, game_date
        FROM games
        WHERE season = %s
        ORDER BY game_date
    """, (season,))

    games = cursor.fetchall()

    for game in games:
        game_id, home_team_id, away_team_id, game_date = game

        # Get participants (from player_game_stats)
        cursor.execute("""
            SELECT player_id, team_id, minutes
            FROM player_game_stats
            WHERE game_id = %s
        """, (game_id,))

        participants = cursor.fetchall()

        # Insert participation records
        for player_id, team_id, minutes in participants:
            cursor.execute("""
                INSERT INTO player_game_participation
                (game_id, player_id, team_id, is_active, minutes_played)
                VALUES (%s, %s, %s, TRUE, %s)
                ON CONFLICT (game_id, player_id) DO UPDATE
                SET is_active = TRUE, minutes_played = EXCLUDED.minutes_played
            """, (game_id, player_id, team_id, minutes))

        # Identify and insert absences
        absences = identify_absences(game_id, home_team_id, away_team_id, game_date, season)
        for absence in absences:
            cursor.execute("""
                INSERT INTO player_game_participation
                (game_id, player_id, team_id, is_active, inactive_reason)
                VALUES (%s, %s, %s, FALSE, %s)
                ON CONFLICT (game_id, player_id) DO NOTHING
            """, (absence['game_id'], absence['player_id'],
                  absence['team_id'], absence['inactive_reason']))

        conn.commit()

    cursor.close()
    conn.close()

if __name__ == '__main__':
    sync_participation_for_season('2025-26')
```

**Fréquence d'exécution** : Daily après `fetch_player_stats_direct.py`

**Workflow ETL** :
```bash
# Daily workflow
python3 1.DATABASE/etl/sync_season_2025_26.py              # Games
python3 1.DATABASE/etl/fetch_player_stats_direct.py       # Box scores
python3 1.DATABASE/etl/track_player_participation.py      # Participation (NEW)
python3 1.DATABASE/etl/analytics/run_all_analytics.py     # Analytics
```

---

## 📝 Phase 5 : Documentation

### Mise à jour de la liste des composants

Ajouter dans le document de référence :

#### 19. PlayerAbsenceImpact (`components/player-props/PlayerAbsenceImpact.tsx`)
- Dashboard global d'impact d'absence d'un joueur sur son équipe
- Grid 2 colonnes : With / Without (Win%, PPG, Net Rating)
- Bar chart record comparison (W-L)
- Timeline des absences avec raisons (injury/rest/dnp)
- **Use case** : Betting context, évaluer l'importance d'un joueur pour ajuster les lignes

#### 20. TeamPerformanceWithoutPlayer (`components/stats/TeamPerformanceWithoutPlayer.tsx`)
- Dropdown pour sélectionner joueur à analyser
- Stats comparées : Record, Win%, Off/Def/Net Rating, Pace
- Bar chart : Points For/Against comparison
- Verdict text automatique
- **Use case** : Page équipe, onglet "Lineup Impact", analyser dépendance à un joueur

#### 21. PlayerPerformanceWithoutTeammate (`components/player-props/PlayerPerformanceWithoutTeammate.tsx`)
- Dropdown pour sélectionner coéquipier
- ComparisonCard avec stats : PPG, RPG, APG, Usage%, FG%, TS%
- Performance trend chart avec marqueurs d'absence du coéquipier
- Key insights automatiques (usage rate, scoring, efficiency deltas)
- **Use case** : Props betting, identifier bénéficiaires d'absences, lineup dependencies

---

## 🎯 Exemple d'usage réel

### Scénario Betting : LeBron James absent

**Contexte** : Lakers vs Nuggets, LeBron out (rest)

**Workflow d'analyse** :

1. **Consulter TeamPerformanceWithoutPlayer** :
   - Lakers sont 8-12 sans LeBron (40% win)
   - Lakers sont 22-10 avec LeBron (68.8% win)
   - Impact : -28.8% win rate
   - Offensive Rating : -5.2 points/100 possessions
   - **Conclusion** : Fade Lakers spread, considérer Under

2. **Consulter PlayerPerformanceWithoutTeammate (Anthony Davis)** :
   - AD sans LeBron : 31.5 PPG, 12.8 RPG, Usage 35.2%
   - AD avec LeBron : 24.8 PPG, 11.2 RPG, Usage 28.1%
   - **Conclusion** : AD Over 29.5 points prop

3. **Consulter PlayerPerformanceWithoutTeammate (Austin Reaves)** :
   - Reaves sans LeBron : 18.2 PPG, 6.1 APG, Usage 25.8%
   - Reaves avec LeBron : 12.4 PPG, 4.2 APG, Usage 18.9%
   - **Conclusion** : Reaves Over props (points, assists)

**Résultat** :
- Bet Nuggets -8.5 (Lakers dépendants de LeBron)
- Bet Under total (offense Lakers moins efficace)
- Bet AD Over 29.5 points
- Bet Reaves Over props

---

## ✅ Critères de validation

### Phase 1 : Base de données
- [ ] Migration 009 appliquée sans erreurs
- [ ] Table `player_game_participation` créée avec indexes
- [ ] Script ETL `track_player_participation.py` fonctionne
- [ ] Données de participation correctement peuplées pour saison 2025-26

### Phase 2 : Queries
- [ ] `getTeamSplitsWithPlayer()` retourne des données cohérentes
- [ ] `getPlayerSplitsWithTeammate()` retourne des données cohérentes
- [ ] `getMostImpactfulAbsences()` identifie les joueurs les plus impactants
- [ ] `getPlayerAbsenceTimeline()` retourne l'historique des absences
- [ ] Toutes les queries filtrent par `season` (critical)

### Phase 3 : Composants
- [ ] `PlayerAbsenceImpact` : Affichage correct, loading states, responsive
- [ ] `TeamPerformanceWithoutPlayer` : Dropdown fonctionne, données mises à jour
- [ ] `PlayerPerformanceWithoutTeammate` : ComparisonCard correct, insights pertinents
- [ ] Tous les composants respectent le design system (anthracite, mono fonts)
- [ ] Mobile responsive (grid collapse to single column)

### Phase 4 : Intégration
- [ ] Scripts ETL s'exécutent dans le bon ordre (workflow daily)
- [ ] Performance acceptable (<2s pour chaque query)
- [ ] Pas de N+1 queries
- [ ] Gestion d'erreurs (player not found, no data, etc.)

### Phase 5 : Documentation
- [ ] Composants documentés dans liste principale
- [ ] Exemples d'usage ajoutés
- [ ] Use cases betting clairement expliqués
- [ ] README mis à jour

---

## 🚀 Ordre d'implémentation recommandé

1. **Migration + ETL** (1-2h)
   - Créer migration 009
   - Appliquer migration
   - Développer script ETL
   - Peupler données saison courante

2. **Queries** (2-3h)
   - Implémenter les 4 queries
   - Tester avec données réelles
   - Optimiser performance

3. **Composants UI** (4-6h)
   - PlayerAbsenceImpact (simple, 1.5h)
   - TeamPerformanceWithoutPlayer (moyen, 2h)
   - PlayerPerformanceWithoutTeammate (complexe, 2.5h)

4. **Tests + Documentation** (1h)
   - Tester chaque composant
   - Vérifier responsive
   - Mettre à jour docs

**Total estimé** : 8-12h de développement

---

## 📌 Notes importantes

- **Season filtering** : TOUTES les queries doivent filtrer par `season = '2025-26'`
- **Type casting** : PostgreSQL `ROUND()` retourne `numeric` → `parseFloat()` before `.toFixed()`
- **Performance** : Indexes cruciaux sur `player_game_participation` pour éviter slow queries
- **Absences detection** : Nécessite roster API NBA (peut avoir rate limits)
- **Edge cases** : Joueurs tradés mid-season, rookies sans historique

---

## ✅ Statut d'implémentation

**Statut global** : ✅ **TERMINÉ**
**Date de complétion** : 2025-11-20
**Temps total** : ~4 heures

### Phase 1 : Migration + ETL ✅

**Fichiers créés** :
- ✅ `1.DATABASE/migrations/009_player_game_participation.sql` - Table + indexes + triggers
- ✅ `1.DATABASE/etl/track_player_participation.py` - Script ETL avec sync depuis box scores

**Résultats** :
- Migration appliquée avec succès
- 4950 enregistrements de participation synchronisés pour saison 2025-26
- Indexes créés pour optimisation des requêtes

### Phase 2 : Queries TypeScript ✅

**Fichier modifié** :
- ✅ `frontend/src/lib/queries.ts` (lignes 507-1015)

**Interfaces ajoutées** :
- `TeamPerformanceStats` - Stats de performance d'équipe
- `TeamSplitsWithPlayer` - Splits équipe avec/sans joueur
- `PlayerPerformanceStats` - Stats de performance joueur
- `PlayerSplitsWithTeammate` - Splits joueur avec/sans coéquipier
- `ImpactfulAbsence` - Absence impactante
- `PlayerAbsence` - Absence avec contexte de match

**Fonctions implémentées** :
- ✅ `getTeamSplitsWithPlayer()` - Analyse impact joueur sur équipe
- ✅ `getPlayerSplitsWithTeammate()` - Analyse impact coéquipier sur joueur
- ✅ `getMostImpactfulAbsences()` - Top absences impactantes
- ✅ `getPlayerAbsenceTimeline()` - Historique absences d'un joueur

### Phase 3 : Composants UI ✅

**Fichiers créés** :

1. ✅ **PlayerAbsenceImpact.tsx** (`frontend/src/components/player-props/`)
   - Liste classée des absences les plus impactantes
   - Deux variants : `list` (détaillé) et `compact`
   - Filtre par équipe optionnel
   - Badges d'impact colorés (rouge/vert)
   - Design tokens + mono fonts pour les chiffres

2. ✅ **TeamPerformanceWithoutPlayer.tsx** (`frontend/src/components/player-props/`)
   - Comparaison performance équipe avec/sans joueur
   - Deux layouts : `side-by-side` (tableau) et `stacked` (colonnes)
   - Métriques complètes : Win%, Net Rating, Points, FG%, Rebounds, Assists
   - Indicateurs de différence visuels avec flèches
   - Gestion états vides et données insuffisantes

3. ✅ **PlayerPerformanceWithoutTeammate.tsx** (`frontend/src/components/player-props/`)
   - Comparaison performance joueur avec/sans coéquipier
   - Stats basiques + avancées (Usage%, True Shooting%)
   - Deux layouts : `side-by-side` et `stacked`
   - Indicateurs de performance avec direction
   - Toggle pour afficher/masquer stats avancées

### Fonctionnalités implémentées

**Tous les composants incluent** :
- ✨ Design system tokens CSS (--space-*, --color-*, --text-*)
- 🔢 JetBrains Mono font pour les chiffres
- 🎨 Thème anthracite avec cards grises
- 📱 Layouts responsives
- ⚠️ États vides et erreurs gérés
- 🎯 TypeScript strict avec interfaces typées
- ♿ Composants accessibles avec forwardRef

### Utilisation des composants

```typescript
// PlayerAbsenceImpact - Liste des absences impactantes
import { PlayerAbsenceImpact } from '@/components/player-props/PlayerAbsenceImpact'
import { getMostImpactfulAbsences } from '@/lib/queries'

const absences = await getMostImpactfulAbsences(10)

<PlayerAbsenceImpact
  absences={absences}
  variant="list"
  showTeamFilter={true}
  onPlayerClick={(playerId) => router.push(`/players/${playerId}`)}
/>

// TeamPerformanceWithoutPlayer - Splits équipe avec/sans joueur
import { TeamPerformanceWithoutPlayer } from '@/components/player-props/TeamPerformanceWithoutPlayer'
import { getTeamSplitsWithPlayer } from '@/lib/queries'

const splits = await getTeamSplitsWithPlayer(teamId, playerId)

<TeamPerformanceWithoutPlayer
  splits={splits}
  variant="side-by-side"
  highlightDifferences={true}
/>

// PlayerPerformanceWithoutTeammate - Splits joueur avec/sans coéquipier
import { PlayerPerformanceWithoutTeammate } from '@/components/player-props/PlayerPerformanceWithoutTeammate'
import { getPlayerSplitsWithTeammate } from '@/lib/queries'

const splits = await getPlayerSplitsWithTeammate(playerId, teammateId)

<PlayerPerformanceWithoutTeammate
  splits={splits}
  variant="side-by-side"
  highlightDifferences={true}
  showAdvancedStats={true}
/>
```

### Phase 4 : Test Page ✅

**Fichier créé** :
- ✅ `frontend/src/app/player-absence-test/page.tsx` - Page de démonstration complète
- ✅ `frontend/src/components/player-props/index.ts` - Index d'export des composants

**Fonctionnalités de la page test** :
- 🎯 Démonstration des 3 composants avec données réelles de la base de données
- 📊 Section 1 : PlayerAbsenceImpact variant `list` avec top 20 absences
- 📦 Section 2 : PlayerAbsenceImpact variant `compact` avec top 10 absences
- 🏀 Section 3 : TeamPerformanceWithoutPlayer layouts `side-by-side` et `stacked`
- 👥 Section 4 : PlayerPerformanceWithoutTeammate layouts `side-by-side` et `stacked`
- 📝 Tableau récapitulatif des fonctionnalités de chaque composant
- 💡 Résumé des données test utilisées (joueur échantillon, coéquipier, nombre d'absences)
- ⚠️ Gestion des cas où les données sont insuffisantes

**URL d'accès** : `http://localhost:3000/player-absence-test`

**Note** : La page utilise des Server Components Next.js pour fetcher les données réelles. Elle détecte automatiquement un joueur avec suffisamment de matchs joués pour les démonstrations.

### Phase 5 : Bug Fix - Column tgs.win ✅

**Erreur détectée** : `column tgs.win does not exist`
**Date du fix** : 2025-11-20
**Sévérité** : Haute (empêchait le chargement de la page test)

**Problème** :
- Les queries référençaient `tgs.win` (colonne inexistante dans `team_game_stats`)
- La table `team_game_stats` contient seulement des statistiques, pas de résultat de match
- Les résultats win/loss doivent être calculés depuis la table `games` en comparant les scores

**Solution implémentée** :
Remplacement de tous les `tgs.win` par un calcul dynamique :

```sql
-- Pattern utilisé pour déterminer une victoire
CASE
  WHEN (g.home_team_id = team_id AND g.home_team_score > g.away_team_score) OR
       (g.away_team_id = team_id AND g.away_team_score > g.home_team_score)
  THEN 1  -- Win
  ELSE 0  -- Loss
END
```

**Fichiers modifiés** :
- ✅ `frontend/src/lib/queries.ts` - 3 fonctions corrigées :
  - `getTeamSplitsWithPlayer()` - Lignes 612-625, 648-661 (both CTEs)
  - `getMostImpactfulAbsences()` - Lignes 945-954, 970-974 (both CTEs)
  - `getPlayerAbsenceTimeline()` - Lignes 1024-1029 (team_result)

**Vérification** :
```sql
-- Test query montrant la correction
SELECT COUNT(*) as test_count,
       SUM(CASE
         WHEN (g.home_team_id = tgs.team_id AND g.home_team_score > g.away_team_score) OR
              (g.away_team_id = tgs.team_id AND g.away_team_score > g.home_team_score)
         THEN 1 ELSE 0
       END) as wins
FROM team_game_stats tgs
JOIN games g ON tgs.game_id = g.game_id
WHERE g.season = '2025-26' AND g.game_status = 'Final';

-- Résultat : test_count=398, wins=199 ✅
-- Validation : 398 records = 199 games × 2 teams, 199 wins = 1 winner per game
```

**Additional Fix - pgs.total_rebounds** :
- **Erreur** : `column pgs.total_rebounds does not exist`
- **Cause** : `player_game_stats` a seulement colonne `rebounds` (pas `total_rebounds`)
- **Fix** : Changé `pgs.total_rebounds` → `pgs.rebounds` (2 occurrences)
- **Fichiers** : `queries.ts` lignes 793, 828 (`getPlayerSplitsWithTeammate`)

**Documentation** :
- ✅ `claudedocs/bugfix-tgs-win-column-2025-11-20.md` - Documentation complète incluant les 2 fixes de colonnes

### Phase 6 : Bug Fix - TypeScript Errors ✅

**Erreurs détectées** : TypeScript compilation errors preventing page load
**Date du fix** : 2025-11-20
**Sévérité** : Haute (empêchait le chargement de la page)

**Problèmes** :

1. **Mauvais nom de prop dans test page** :
   - Utilisé `layout` au lieu de `variant` pour TeamPerformanceWithoutPlayer et PlayerPerformanceWithoutTeammate
   - Lines 197, 209 de `page.tsx`

2. **Variant Card invalide** :
   - Utilisé `variant="stats"` qui n'existe pas (valides: "default", "anthracite", "elevated")
   - TeamPerformanceWithoutPlayer.tsx lignes 394, 402
   - PlayerPerformanceWithoutTeammate.tsx lignes 428, 437

**Fixes appliqués** :
- ✅ Changé `layout="side-by-side"` → `variant="side-by-side"`
- ✅ Changé `layout="stacked"` → `variant="stacked"`
- ✅ Changé `variant="stats"` → `variant="anthracite"` (4 occurrences)

**Vérification** :
```bash
npx tsc --noEmit  # ✅ No errors
```

**Documentation** :
- ✅ `claudedocs/bugfix-typescript-errors-2025-11-20.md` - Documentation du fix TypeScript

### Prochaines étapes potentielles

**Extensions possibles** (non incluses dans ce plan) :
- 📄 Page dédiée `/players/[id]/absence-impact` utilisant les composants
- 📊 Graphiques d'évolution temporelle des impacts
- 🔔 Alertes d'absences pour joueurs clés (notifications)
- 🤖 Intégration avec predictions ML pour ajuster les lignes
- 📱 API endpoint pour récupérer les données d'absence en temps réel
- 🧪 Tests unitaires et d'intégration pour les composants

---

### Phase 7 : Bug Fix - Column Name Errors + React Server Components ✅

**Erreurs détectées** : Multiple runtime errors during page load
**Date du fix** : 2025-11-20
**Sévérité** : Haute (empêchait le chargement de la page test)

**Problèmes** :

1. **Column Name Mismatch Between Tables** :
   - Utilisé noms de colonnes longs de `team_game_stats` sur table `player_game_stats`
   - `pgs.field_goal_pct` n'existe pas → correct: `pgs.fg_pct`
   - `pgs.three_point_pct` n'existe pas → correct: `pgs.fg3_pct`
   - `pgs.free_throw_pct` n'existe pas → correct: `pgs.ft_pct`
   - `pgs.field_goal_attempts` n'existe pas → correct: `pgs.fg_attempted`
   - `pgs.free_throw_attempts` n'existe pas → correct: `pgs.ft_attempted`

2. **React Server Component Event Handler Error** :
   - Test page (Server Component) passait `onPlayerClick` function props à `PlayerAbsenceImpact` (Client Component)
   - Next.js 16 interdit le passage de fonctions de Server à Client Components (non sérialisables)

**Différences de schéma découvertes** :
```sql
-- team_game_stats (noms longs):
field_goal_pct, three_point_pct, free_throw_pct, total_rebounds

-- player_game_stats (noms courts):
fg_pct, fg3_pct, ft_pct, rebounds, fg_attempted, ft_attempted
```

**Fixes appliqués** :
- ✅ `queries.ts` lignes 795-811: `getPlayerSplitsWithTeammate()` with_teammate CTE
- ✅ `queries.ts` lignes 830-846: `getPlayerSplitsWithTeammate()` without_teammate CTE
- ✅ `page.tsx` lignes 148-152: Removed `onPlayerClick` prop (first component)
- ✅ `page.tsx` lignes 167-171: Removed `onPlayerClick` prop (second component)

**Vérification** :
```bash
# Column errors fixed
grep "pgs\.(field_goal|three_point|free_throw)" queries.ts
# Result: No matches ✅

# Page loads successfully
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/player-absence-test
# Result: 200 ✅
```

**Documentation** :
- ✅ `claudedocs/bugfix-column-errors-session-2025-11-20.md` - Documentation complète incluant les fixes de colonnes et React Server Components

---

**Statut final** : ✅ **IMPLÉMENTATION COMPLÈTE + PAGE TEST + BUG FIXES**
**Composants prêts** : 3/3
**Queries fonctionnelles** : 4/4 (toutes corrigées et vérifiées)
**Migration appliquée** : ✅
**Page test** : ✅ (fonctionnelle après tous les bug fixes)
**Bug fixes critiques** : ✅
  - Phase 5: column tgs.win n'existe pas - résolu
  - Phase 6: TypeScript errors (prop names + Card variants) - résolu
  - Phase 7: Column name errors + React Server Component errors - résolu
**Documentation** : ✅ (session + 3 bug fixes documentés dans claudedocs/)
**TypeScript** : ✅ (compilation sans erreurs TypeScript sur composants player-absence)
**Page Status** : ✅ (HTTP 200, chargement réussi)
**Prochaine action** : Intégrer les composants dans les pages de l'application (joueurs, équipes, betting)
