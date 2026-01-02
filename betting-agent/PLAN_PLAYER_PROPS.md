# Player Props Implementation Plan

## Status: ✅ COMPLETE (2025-11-29)

All 7 phases implemented. Ready for end-to-end testing.

## Overview
Add player prop analysis to the NBA betting agent, supporting points, rebounds, assists, 3PM, PRA (points+rebounds+assists), and combo stats.

## Existing Infrastructure
- `player_props` table with prop lines from Pinnacle
- `betting_markets/betting_odds` tables with player prop markets
- `player_game_stats` with historical box scores
- `get_player_recent_stats()` and `get_player_averages()` in db_tool.py
- Memory schema already supports `PLAYER_PROP` bet type
- Data scout already parses player prop queries and builds basic context

## Implementation Steps

### Phase 1: Database Queries (db_tool.py)

Add methods:

```python
async def get_player_prop_odds(self, player_name: str, prop_type: str, game_id: str = None) -> dict:
    """Get current prop odds for a player"""
    # Query betting_markets + betting_odds for player props
    # Return: {line, over_odds, under_odds, market_id}

async def get_player_std_dev(self, player_id: int, stat: str, last_n_games: int = 10) -> float:
    """Calculate standard deviation for a player stat"""
    # Query player_game_stats, calculate STDDEV
    # Stats: points, rebounds, assists, fg3_made, steals, blocks, turnovers

async def get_player_vs_opponent(self, player_id: int, opponent_team_id: int) -> dict:
    """Get player's performance vs specific opponent"""
    # Historical matchup data

async def get_opponent_defensive_ranking(self, team_id: int, position: str = None) -> dict:
    """Get team's defensive stats (points allowed, etc.)"""
    # From team_game_stats or defensive_stats_by_position
```

### Phase 2: Monte Carlo Simulation (monte_carlo.py)

Add player prop simulation:

```python
def monte_carlo_player_prop(
    projection: float,
    std_dev: float,
    line: float,
    stat_type: str,  # 'points', 'rebounds', 'assists', '3pm', 'pra'
    n_sims: int = 10000,
    minutes_mean: float = 32.0,
    minutes_std: float = 5.0,
) -> dict:
    """
    Monte Carlo simulation for player props.

    - For counting stats (3pm, steals, blocks): Use Poisson distribution
    - For continuous stats (points, PRA): Use normal distribution
    - Account for minutes variance (DNP risk, blowout benching)

    Returns:
        p_over, p_under, ci_95, percentiles, edge metrics
    """
```

Key considerations:
- **Points**: Normal distribution, scaled by minutes
- **3PM**: Poisson (discrete counting stat), rate = 3PM/min * projected_mins
- **Rebounds/Assists**: Poisson or negative binomial
- **PRA**: Sum of three correlated normals
- **Minutes risk**: 5% chance of <15 mins (injury/blowout)

### Phase 3: Quant Analyst (quant_analyst.py)

Add player prop analysis method:

```python
async def _calculate_player_prop_edge(self, game_data: dict, odds_data: dict | None) -> dict:
    """
    Calculate edge for player prop bet.

    1. Get player's L5/L10/Season averages
    2. Adjust for opponent defensive matchup
    3. Run Monte Carlo simulation
    4. Compare to market odds
    5. Calculate edge and Kelly
    """

    # Projection formula:
    # base = weighted average (L5: 40%, L10: 35%, Season: 25%)
    # adjusted = base * opponent_factor * minutes_factor

    # Edge = p_over - implied_over (or p_under - implied_under)
```

Route in `__call__`:
```python
if bet_type == "player_prop":
    quant_result = await self._calculate_player_prop_edge(game_data, odds_data)
```

### Phase 4: Data Scout Enhancement (data_scout.py)

Enhance `_build_player_context`:

```python
async def _build_player_context(self, db, player, parsed) -> dict:
    # Existing: recent_stats, season_avg, last5_avg

    # Add:
    # 1. Get upcoming game for this player's team
    upcoming = await db.get_upcoming_games(player_team_id, limit=1)

    # 2. Get opponent info
    opponent_id = ...
    opponent_defense = await db.get_opponent_defensive_ranking(opponent_id)

    # 3. Get player's std dev for the stat
    std_dev = await db.get_player_std_dev(player_id, parsed['stat'])

    # 4. Get prop odds
    prop_odds = await db.get_player_prop_odds(player['full_name'], parsed['stat'])

    return {
        ...existing...,
        "opponent": opponent_info,
        "opponent_defense": opponent_defense,
        "stat_std_dev": std_dev,
        "prop_odds": prop_odds,
        "bet_type": "player_prop",
    }
```

### Phase 5: Debate Room (debate_room.py)

Add player prop debate logic:

```python
def _generate_player_prop_debate(self, state: AgentState) -> dict:
    """Generate bull/bear arguments for player props"""

    bull_factors = [
        "recent_hot_streak",      # L3 above average
        "favorable_matchup",      # vs weak defense
        "minutes_trend",          # increasing role
        "home_game",             # home court bump
    ]

    bear_factors = [
        "blowout_risk",          # game could get out of hand
        "injury_status",         # questionable/GTD
        "back_to_back",          # fatigue factor
        "tough_matchup",         # vs elite defense
        "regression_to_mean",    # hot streak unsustainable
    ]
```

### Phase 6: Memory Store (store.py)

Add player prop settlement:

```python
async def settle_player_prop(self, wager_id: int, actual_stat: float) -> dict:
    """Settle a player prop wager"""
    # Get wager line and direction
    # Compare actual_stat to line
    # Calculate outcome (WIN/LOSS/PUSH)
    # Update wager record

async def auto_settle_player_props(self, db) -> dict:
    """Auto-settle player props from game stats"""
    # Query unsettled PLAYER_PROP wagers
    # For each, get actual stat from player_game_stats
    # Settle based on line comparison
```

### Phase 7: Main Entry Point

Update query examples in main.py:
```python
# Examples:
# python -m src.main analyze "LeBron over 25.5 points"
# python -m src.main analyze "Curry under 4.5 threes"
# python -m src.main analyze "Jokic over 45.5 PRA"
```

## Stat Type Mapping

| Query Input | DB Column | Prop Type |
|-------------|-----------|-----------|
| points | points | points |
| rebounds, rebs | rebounds | rebounds |
| assists, asts | assists | assists |
| threes, 3s, 3pm | fg3_made | 3pm |
| steals | steals | steals |
| blocks | blocks | blocks |
| turnovers | turnovers | turnovers |
| pra, pts+rebs+asts | points+rebounds+assists | pra |
| pr, pts+rebs | points+rebounds | points_rebounds |
| pa, pts+asts | points+assists | points_assists |
| ra, rebs+asts | rebounds+assists | rebounds_assists |

## Edge Calculation Logic

```python
# 1. Calculate projection
l5_avg = player['last_5_averages'][stat]
l10_avg = player['recent_games_avg'][stat]
season_avg = player['season_averages'][stat]

projection = 0.40 * l5_avg + 0.35 * l10_avg + 0.25 * season_avg

# 2. Opponent adjustment
opp_def_factor = opponent_defense.get(f'{stat}_allowed_vs_avg', 1.0)
projection *= opp_def_factor

# 3. Monte Carlo simulation
mc_result = monte_carlo_player_prop(
    projection=projection,
    std_dev=player['stat_std_dev'],
    line=prop_odds['line'],
    stat_type=stat,
)

# 4. Edge calculation
direction = parsed.get('direction', 'over')
if direction == 'over':
    our_prob = mc_result['p_over']
    implied = 1 / prop_odds['over_odds']
else:
    our_prob = mc_result['p_under']
    implied = 1 / prop_odds['under_odds']

edge = our_prob - implied
```

## Contrarian Adjustments (from totals learnings)

Apply similar calibration:
- Cap confidence at 65%
- Favor UNDER picks (regression to mean)
- Penalize high-edge projections (inverse correlation possible)
- Track direction performance (OVER vs UNDER win rates)

## Files to Modify

1. `src/tools/db_tool.py` - Add 4 new query methods
2. `src/tools/monte_carlo.py` - Add player prop simulation
3. `src/agents/quant_analyst.py` - Add `_calculate_player_prop_edge`
4. `src/agents/data_scout.py` - Enhance `_build_player_context`
5. `src/agents/debate_room.py` - Add player prop debate logic
6. `src/memory/store.py` - Add player prop settlement
7. `src/main.py` - Update help text with examples

## Testing Plan

1. Test query parsing: "LeBron over 25.5 points"
2. Test player lookup and stats fetch
3. Test Monte Carlo simulation accuracy
4. Test edge calculation vs known odds
5. Test end-to-end recommendation
6. Test settlement logic

## Estimated Effort

- Phase 1 (DB queries): ~30 mins
- Phase 2 (Monte Carlo): ~45 mins
- Phase 3 (Quant Analyst): ~30 mins
- Phase 4 (Data Scout): ~20 mins
- Phase 5 (Debate Room): ~20 mins
- Phase 6 (Memory Store): ~20 mins
- Phase 7 (Main): ~10 mins
- Testing: ~30 mins

**Total: ~3 hours**
