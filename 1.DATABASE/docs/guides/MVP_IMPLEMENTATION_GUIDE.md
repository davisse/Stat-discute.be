# NBA Betting Database - MVP Implementation Guide

**Version**: 1.0
**Target**: PostgreSQL 18
**Timeline**: 6 weeks (3 phases)
**Scope**: 12 tables + 1 materialized view

---

## Executive Summary

This guide outlines a **phased MVP approach** to implement the NBA Sports Betting Database. Instead of building all 42 tables, we start with **12 essential tables** that deliver core betting value in 6 weeks.

### MVP vs Full System

| Metric | MVP | Full System | Reduction |
|--------|-----|-------------|-----------|
| **Tables** | 12 + 1 MV | 42 + 5 MVs | 71% fewer |
| **Storage/Season** | ~6 GB | ~100 GB | 94% less |
| **Implementation** | 6 weeks | 7+ months | 78% faster |
| **ETL Jobs** | 6-8 | 20+ | 70% fewer |
| **Complexity** | Low | High | Much simpler |

### Value Delivered Per Phase

| Phase | Duration | Tables | User Value |
|-------|----------|--------|------------|
| **Phase 1** | Week 1-2 | 6 | "See NBA games with scores and stats" |
| **Phase 2** | Week 3-4 | +3 | "Get betting lines and ATS records" |
| **Phase 3** | Week 5-6 | +3 +1MV | "Make informed bets with full context" |

---

## Phase 1: Data Foundation (Week 1-2)

### Overview

**Goal**: Establish core NBA data infrastructure
**Tables**: 6 tables
**Value Proposition**: "See today's NBA games with scores and basic stats"

### Tables to Implement

#### 1. teams (Dimension Table)
```sql
CREATE TABLE teams (
    team_id BIGINT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(3) NOT NULL UNIQUE,
    city VARCHAR(50) NOT NULL,
    conference VARCHAR(10) CHECK (conference IN ('East', 'West')),
    division VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_abbreviation ON teams(abbreviation);
CREATE INDEX idx_teams_active ON teams(is_active);
```

#### 2. players (Dimension Table)
```sql
CREATE TABLE players (
    player_id BIGINT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    position VARCHAR(20),
    jersey_number VARCHAR(3),
    draft_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_players_active ON players(is_active);
CREATE INDEX idx_players_name ON players(last_name, first_name);
```

#### 3. seasons (Dimension Table)
```sql
CREATE TABLE seasons (
    season_id VARCHAR(10) PRIMARY KEY,  -- e.g., "22024"
    season_year VARCHAR(10) NOT NULL,   -- e.g., "2024-25"
    season_type VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false
);

CREATE INDEX idx_seasons_current ON seasons(is_current) WHERE is_current = true;
```

#### 4. games (Central Fact Table)
```sql
CREATE TABLE games (
    game_id VARCHAR(20) PRIMARY KEY,
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    game_date DATE NOT NULL,
    home_team_id BIGINT NOT NULL REFERENCES teams(team_id),
    away_team_id BIGINT NOT NULL REFERENCES teams(team_id),
    game_status VARCHAR(20) NOT NULL,  -- 'Scheduled', 'Final', 'In Progress'
    home_team_score INTEGER,
    away_team_score INTEGER,
    attendance INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (home_team_id != away_team_id)
);

CREATE INDEX idx_games_date ON games(game_date DESC);
CREATE INDEX idx_games_season ON games(season_id, game_date DESC);
CREATE INDEX idx_games_home_team ON games(home_team_id, game_date DESC);
CREATE INDEX idx_games_away_team ON games(away_team_id, game_date DESC);
CREATE INDEX idx_games_status ON games(game_status);
```

#### 5. team_game_stats (Box Scores)
```sql
CREATE TABLE team_game_stats (
    stat_id SERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    points INTEGER NOT NULL,
    field_goals_made INTEGER,
    field_goals_attempted INTEGER,
    three_pointers_made INTEGER,
    assists INTEGER,
    rebounds INTEGER,
    turnovers INTEGER,
    won BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, team_id)
);

CREATE INDEX idx_team_stats_game ON team_game_stats(game_id);
CREATE INDEX idx_team_stats_team ON team_game_stats(team_id, season_id);
CREATE INDEX idx_team_stats_season ON team_game_stats(season_id);
```

#### 6. player_game_stats (Player Performance)
```sql
CREATE TABLE player_game_stats (
    stat_id SERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    minutes_played VARCHAR(10),
    points INTEGER,
    field_goals_made INTEGER,
    assists INTEGER,
    rebounds INTEGER,
    plus_minus INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, player_id)
);

CREATE INDEX idx_player_stats_game ON player_game_stats(game_id);
CREATE INDEX idx_player_stats_player ON player_game_stats(player_id, game_id DESC);
CREATE INDEX idx_player_stats_team ON player_game_stats(team_id, game_id DESC);
```

### Phase 1 ETL Setup

**NBA API Endpoints Needed:**
1. `CommonAllPlayers` → players table
2. `CommonTeamRoster` → teams table + player roster data
3. `Scoreboard` → games table (schedule)
4. `BoxScoreTraditionalV2` → team_game_stats, player_game_stats

**Python ETL Script (Simplified):**
```python
from nba_api.stats.endpoints import scoreboard, boxscoretraditionalv2
import psycopg2
from datetime import datetime

# Daily schedule sync (run at 5:00 AM)
def sync_daily_schedule():
    games = scoreboard.Scoreboard(game_date=datetime.today())
    df = games.get_data_frames()[0]
    # Insert into games table

# Post-game stats sync (run 15 min after games)
def sync_game_stats(game_id):
    box = boxscoretraditionalv2.BoxScoreTraditionalV2(game_id=game_id)
    team_stats = box.get_data_frames()[0]
    player_stats = box.get_data_frames()[1]
    # Insert into team_game_stats and player_game_stats
```

**Cron Schedule:**
```bash
# Daily schedule at 5 AM
0 5 * * * python3 sync_schedule.py

# Post-game stats every 30 minutes (game days only)
*/30 * * * * python3 sync_postgame.py
```

### Phase 1 Deliverables

✅ **Database**: 6 core tables with indexes
✅ **ETL**: Python scripts for NBA API
✅ **Data**: Current season games + stats
✅ **Queries**: Today's games, team records, player stats

**Example Query** (Today's Games):
```sql
SELECT
    g.game_id,
    ht.abbreviation as home_team,
    at.abbreviation as away_team,
    g.game_date,
    g.home_team_score,
    g.away_team_score,
    g.game_status
FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
WHERE g.game_date = CURRENT_DATE
ORDER BY g.game_date;
```

---

## Phase 2: Betting Layer (Week 3-4)

### Overview

**Goal**: Add betting lines and ATS performance tracking
**Tables**: +3 tables
**Value Proposition**: "Get current betting lines and team ATS records"

### Tables to Implement

#### 7. betting_lines (Odds Tracking)
```sql
CREATE TABLE betting_lines (
    line_id BIGSERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    market_type VARCHAR(50) NOT NULL,  -- 'Spread', 'Moneyline', 'Total'
    spread DECIMAL(5,2),
    over_under DECIMAL(5,1),
    moneyline_home INTEGER,
    moneyline_away INTEGER,
    sportsbook VARCHAR(50),
    closed_at TIMESTAMPTZ
);

CREATE INDEX idx_betting_lines_game ON betting_lines(game_id, created_at DESC);
CREATE INDEX idx_betting_lines_active ON betting_lines(game_id)
    WHERE closed_at IS NULL;
```

#### 8. ats_performance (Against The Spread)
```sql
CREATE TABLE ats_performance (
    ats_id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    situation_type VARCHAR(100) NOT NULL,  -- 'Overall', 'Home', 'Away', 'Favorite', 'Underdog'
    games_covered INTEGER DEFAULT 0,
    games_not_covered INTEGER DEFAULT 0,
    ats_win_pct DECIMAL(5,4),
    avg_margin_vs_spread DECIMAL(6,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, season_id, situation_type)
);

CREATE INDEX idx_ats_team ON ats_performance(team_id, season_id);
```

#### 9. standings (League Standings)
```sql
CREATE TABLE standings (
    standing_id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    conference_rank INTEGER,
    division_rank INTEGER,
    wins INTEGER NOT NULL,
    losses INTEGER NOT NULL,
    win_pct DECIMAL(5,3),
    games_behind DECIMAL(4,1),
    streak VARCHAR(10),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, season_id)
);

CREATE INDEX idx_standings_season ON standings(season_id, conference_rank);
```

### Phase 2 ETL Setup

**Odds API Integration:**
```python
import requests

ODDS_API_KEY = "your_api_key"
ODDS_API_URL = "https://api.the-odds-api.com/v4"

def fetch_betting_lines():
    response = requests.get(
        f"{ODDS_API_URL}/sports/basketball_nba/odds/",
        params={
            "apiKey": ODDS_API_KEY,
            "regions": "us",
            "markets": "h2h,spreads,totals"
        }
    )
    # Insert into betting_lines table
```

**ATS Calculation (Nightly Batch):**
```sql
-- Update ATS performance after each game
WITH game_results AS (
    SELECT
        tgs.team_id,
        g.season_id,
        CASE
            WHEN g.home_team_id = tgs.team_id THEN 'Home'
            ELSE 'Away'
        END as location,
        tgs.points - (CASE WHEN g.home_team_id = tgs.team_id
                          THEN g.away_team_score
                          ELSE g.home_team_score END) as actual_margin,
        bl.spread
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    LEFT JOIN betting_lines bl ON g.game_id = bl.game_id
        AND bl.market_type = 'Spread'
    WHERE g.game_status = 'Final'
)
INSERT INTO ats_performance (team_id, season_id, situation_type, games_covered, games_not_covered)
SELECT
    team_id,
    season_id,
    location,
    SUM(CASE WHEN actual_margin + spread > 0 THEN 1 ELSE 0 END),
    SUM(CASE WHEN actual_margin + spread <= 0 THEN 1 ELSE 0 END)
FROM game_results
GROUP BY team_id, season_id, location
ON CONFLICT (team_id, season_id, situation_type)
DO UPDATE SET
    games_covered = EXCLUDED.games_covered,
    games_not_covered = EXCLUDED.games_not_covered;
```

**Cron Schedule:**
```bash
# Betting lines real-time (game days, every 15 min)
*/15 * * * * python3 sync_betting_lines.py

# ATS calculations (nightly at 2 AM)
0 2 * * * psql -f calculate_ats.sql

# Standings (daily at 6 AM)
0 6 * * * python3 sync_standings.py
```

### Phase 2 Deliverables

✅ **Database**: +3 betting-related tables
✅ **ETL**: Odds API integration + ATS calculations
✅ **Data**: Current odds + historical ATS performance
✅ **Queries**: Today's lines, team ATS records

**Example Query** (Today's Games with Odds):
```sql
SELECT
    g.game_id,
    ht.abbreviation as home_team,
    at.abbreviation as away_team,
    bl.spread,
    bl.over_under,
    ht_ats.ats_win_pct as home_ats_pct,
    at_ats.ats_win_pct as away_ats_pct
FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
LEFT JOIN betting_lines bl ON g.game_id = bl.game_id
LEFT JOIN ats_performance ht_ats ON ht.team_id = ht_ats.team_id
LEFT JOIN ats_performance at_ats ON at.team_id = at_ats.team_id
WHERE g.game_date = CURRENT_DATE
AND bl.closed_at IS NULL;
```

---

## Phase 3: Intelligence Layer (Week 5-6)

### Overview

**Goal**: Add injury tracking, team trends, and historical matchups
**Tables**: +3 tables + 1 materialized view
**Value Proposition**: "Make informed bets with injury data and team context"

### Tables to Implement

#### 10. player_injury_reports (Critical for Betting)
```sql
CREATE TABLE player_injury_reports (
    injury_id SERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    game_id VARCHAR(20) REFERENCES games(game_id),
    injury_status VARCHAR(50) NOT NULL,  -- 'Out', 'Questionable', 'Probable', 'Doubtful'
    injury_description TEXT,
    report_date DATE NOT NULL,
    return_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_injuries_player ON player_injury_reports(player_id, report_date DESC);
CREATE INDEX idx_injuries_team ON player_injury_reports(team_id, report_date DESC);
CREATE INDEX idx_injuries_game ON player_injury_reports(game_id);
CREATE INDEX idx_injuries_active ON player_injury_reports(player_id)
    WHERE return_date IS NULL OR return_date > CURRENT_DATE;
```

#### 11. team_performance_trends (Recent Form)
```sql
CREATE TABLE team_performance_trends (
    trend_id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    games_played INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    avg_points_scored DECIMAL(5,2),
    avg_points_allowed DECIMAL(5,2),
    trend_type VARCHAR(50),  -- 'Last10', 'Last20', 'Last30Days'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, season_id, trend_type)
);

CREATE INDEX idx_trends_team ON team_performance_trends(team_id, season_id, trend_type);
```

#### 12. head_to_head_history (Historical Matchups)
```sql
CREATE TABLE head_to_head_history (
    h2h_id SERIAL PRIMARY KEY,
    team1_id BIGINT NOT NULL REFERENCES teams(team_id),
    team2_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) REFERENCES seasons(season_id),
    total_games INTEGER NOT NULL,
    team1_wins INTEGER NOT NULL,
    team2_wins INTEGER NOT NULL,
    avg_point_diff DECIMAL(6,2),
    last_game_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team1_id, team2_id, season_id),
    CHECK (team1_id < team2_id)  -- Prevent duplicates
);

CREATE INDEX idx_h2h_teams ON head_to_head_history(team1_id, team2_id, season_id);
```

#### 13. mv_team_current_form (Materialized View)
```sql
CREATE MATERIALIZED VIEW mv_team_current_form AS
SELECT
    tgs.team_id,
    g.season_id,
    COUNT(*) as games_played,
    SUM(CASE WHEN tgs.won THEN 1 ELSE 0 END) as wins,
    COUNT(*) - SUM(CASE WHEN tgs.won THEN 1 ELSE 0 END) as losses,
    AVG(tgs.points) as avg_points_scored,
    AVG(CASE
        WHEN g.home_team_id = tgs.team_id THEN g.away_team_score
        ELSE g.home_team_score
    END) as avg_points_allowed,
    STRING_AGG(
        CASE WHEN tgs.won THEN 'W' ELSE 'L' END,
        '' ORDER BY g.game_date DESC
    ) as last_10_record,
    NOW() AS refreshed_at
FROM team_game_stats tgs
JOIN games g ON tgs.game_id = g.game_id
WHERE g.game_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY tgs.team_id, g.season_id;

CREATE UNIQUE INDEX idx_mv_form_unique ON mv_team_current_form(team_id, season_id);
```

### Phase 3 ETL Setup

**Injury Tracking (Hourly on Game Days):**
```python
from nba_api.stats.endpoints import leaguegamelog

def sync_injury_reports():
    # NBA API or web scraping for injury data
    # Insert into player_injury_reports
    pass
```

**Trend Calculations (Daily):**
```sql
-- Calculate last 10 games trends
INSERT INTO team_performance_trends (team_id, season_id, trend_type, date_range_start, date_range_end, games_played, wins, avg_points_scored, avg_points_allowed)
SELECT
    tgs.team_id,
    g.season_id,
    'Last10',
    MIN(g.game_date),
    MAX(g.game_date),
    COUNT(*),
    SUM(CASE WHEN tgs.won THEN 1 ELSE 0 END),
    AVG(tgs.points),
    AVG(CASE WHEN g.home_team_id = tgs.team_id THEN g.away_team_score ELSE g.home_team_score END)
FROM (
    SELECT tgs.*, ROW_NUMBER() OVER (PARTITION BY tgs.team_id ORDER BY g.game_date DESC) as rn
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
) ranked
WHERE rn <= 10
GROUP BY team_id, season_id
ON CONFLICT (team_id, season_id, trend_type) DO UPDATE SET
    date_range_start = EXCLUDED.date_range_start,
    date_range_end = EXCLUDED.date_range_end,
    games_played = EXCLUDED.games_played,
    wins = EXCLUDED.wins,
    avg_points_scored = EXCLUDED.avg_points_scored,
    avg_points_allowed = EXCLUDED.avg_points_allowed;
```

**Cron Schedule:**
```bash
# Injury reports (hourly on game days)
0 * * * * python3 sync_injuries.py

# Team trends (daily at 2:30 AM)
30 2 * * * psql -f calculate_trends.sql

# H2H history (daily at 3 AM)
0 3 * * * psql -f calculate_h2h.sql

# Refresh materialized view (daily at 2:45 AM)
45 2 * * * psql -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_team_current_form;"
```

### Phase 3 Deliverables

✅ **Database**: +3 intelligence tables + 1 MV
✅ **ETL**: Injury tracking + trend calculations
✅ **Data**: Current injuries + team form + H2H history
✅ **Queries**: Full context betting dashboard

**Example Query** (Complete Betting Dashboard):
```sql
SELECT
    g.game_id,
    ht.abbreviation as home_team,
    at.abbreviation as away_team,
    g.game_date,
    -- Betting lines
    bl.spread,
    bl.over_under,
    -- Recent form
    ht_form.wins || '-' || ht_form.losses as home_l10,
    at_form.wins || '-' || at_form.losses as away_l10,
    -- ATS records
    ht_ats.ats_win_pct as home_ats,
    at_ats.ats_win_pct as away_ats,
    -- Injuries
    (SELECT COUNT(*) FROM player_injury_reports
     WHERE team_id = ht.team_id AND injury_status = 'Out') as home_injuries,
    (SELECT COUNT(*) FROM player_injury_reports
     WHERE team_id = at.team_id AND injury_status = 'Out') as away_injuries,
    -- H2H
    h2h.team1_wins,
    h2h.team2_wins
FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
LEFT JOIN betting_lines bl ON g.game_id = bl.game_id AND bl.closed_at IS NULL
LEFT JOIN mv_team_current_form ht_form ON ht.team_id = ht_form.team_id
LEFT JOIN mv_team_current_form at_form ON at.team_id = at_form.team_id
LEFT JOIN ats_performance ht_ats ON ht.team_id = ht_ats.team_id AND ht_ats.situation_type = 'Overall'
LEFT JOIN ats_performance at_ats ON at.team_id = at_ats.team_id AND at_ats.situation_type = 'Overall'
LEFT JOIN head_to_head_history h2h ON
    (h2h.team1_id = ht.team_id AND h2h.team2_id = at.team_id) OR
    (h2h.team1_id = at.team_id AND h2h.team2_id = ht.team_id)
WHERE g.game_date = CURRENT_DATE;
```

---

## Post-MVP: Future Enhancements

Once MVP is successful, consider these additions:

### Phase 4: Advanced Analytics (Optional)
- Four Factors analysis
- Advanced stats (ORtg, DRtg, pace)
- Schedule metadata (rest days, travel)
- Situational stats (clutch, home/away splits)

### Phase 5: Detailed Data (Optional)
- Shot charts
- Play-by-play
- Lineup combinations
- Referee tendencies

### Phase 6: Optimization (As Needed)
- Additional materialized views
- Partitioning for large tables
- More aggressive caching
- Performance tuning

---

## Testing & Validation

### Data Quality Checks

```sql
-- Check for missing game stats
SELECT COUNT(*) FROM games g
LEFT JOIN team_game_stats tgs ON g.game_id = tgs.game_id
WHERE g.game_status = 'Final' AND tgs.stat_id IS NULL;

-- Verify ATS calculations
SELECT
    team_id,
    games_covered + games_not_covered as total_games,
    ROUND(games_covered::DECIMAL / NULLIF(games_covered + games_not_covered, 0), 3) as calculated_pct,
    ats_win_pct
FROM ats_performance
WHERE ABS(calculated_pct - ats_win_pct) > 0.01;  -- Flag discrepancies

-- Check injury data freshness
SELECT MAX(report_date) as latest_injury_report
FROM player_injury_reports;
```

### Performance Benchmarks

**Target Query Times (MVP):**
- Today's games: <30ms
- Team stats: <50ms
- Betting dashboard: <80ms

**Test Query Performance:**
```sql
EXPLAIN ANALYZE
SELECT ... FROM games ... WHERE game_date = CURRENT_DATE;
```

---

## Deployment Checklist

### Phase 1 Checklist
- [ ] PostgreSQL 18 installed and configured
- [ ] Database created: `nba_betting_mvp`
- [ ] 6 core tables created with indexes
- [ ] NBA API credentials obtained
- [ ] Python ETL scripts tested
- [ ] Cron jobs scheduled
- [ ] Initial data loaded (current season)
- [ ] Sample queries tested

### Phase 2 Checklist
- [ ] Odds API credentials obtained
- [ ] 3 betting tables created
- [ ] Betting ETL scripts tested
- [ ] ATS calculation script validated
- [ ] Real-time odds working
- [ ] Historical odds backfilled
- [ ] Betting queries tested

### Phase 3 Checklist
- [ ] 3 intelligence tables created
- [ ] Materialized view created with unique index
- [ ] Injury tracking implemented
- [ ] Trend calculations validated
- [ ] MV refresh scheduled (CONCURRENT)
- [ ] Full dashboard query optimized
- [ ] User acceptance testing complete

---

## Monitoring & Maintenance

### Daily Checks
- [ ] ETL jobs completed successfully
- [ ] Data freshness (<24h for games, <1h for injuries)
- [ ] Query performance within targets
- [ ] No failed cron jobs

### Weekly Tasks
- [ ] Review query performance logs
- [ ] Check database size growth
- [ ] Validate ATS calculations
- [ ] Test backup/restore

### Monthly Tasks
- [ ] Analyze usage patterns
- [ ] Plan next features
- [ ] Review and optimize slow queries
- [ ] Update documentation

---

## Cost Estimates

### Infrastructure (MVP)

| Resource | Specification | Monthly Cost |
|----------|---------------|--------------|
| **Database** | PostgreSQL 18, 50GB storage | $25-50 |
| **Compute** | 2 vCPU, 4GB RAM | $20-40 |
| **Odds API** | 500 req/day, NBA only | $50-100 |
| **Hosting** | Cloud VM or managed DB | $30-60 |
| **Total** | - | **$125-250/month** |

### Time Investment (MVP)

| Phase | Developer Time | Calendar Time |
|-------|----------------|---------------|
| Phase 1 | 40-60 hours | 2 weeks |
| Phase 2 | 30-40 hours | 2 weeks |
| Phase 3 | 30-40 hours | 2 weeks |
| **Total** | **100-140 hours** | **6 weeks** |

---

## Success Metrics

### Phase 1 Success Criteria
- ✅ All 30 NBA teams loaded
- ✅ Current season games updated daily
- ✅ Box scores available within 30 min of game end
- ✅ Query performance <50ms

### Phase 2 Success Criteria
- ✅ Betting lines updated every 15 min
- ✅ ATS records accurate to 99%+
- ✅ Standings updated daily
- ✅ Dashboard query <80ms

### Phase 3 Success Criteria
- ✅ Injury reports updated hourly
- ✅ Team trends calculated daily
- ✅ H2H history available for all matchups
- ✅ Materialized view refreshes successfully
- ✅ Full dashboard <100ms

---

## Support & Resources

### NBA API Documentation
- https://github.com/swar/nba_api
- https://github.com/swar/nba_api/tree/master/docs/nba_api/stats/endpoints

### Betting APIs
- The Odds API: https://the-odds-api.com/
- Odds Shark: https://www.oddsshark.com/
- Action Network: https://www.actionnetwork.com/

### PostgreSQL Resources
- PostgreSQL 18 Documentation: https://www.postgresql.org/docs/18/
- PostgreSQL Performance: https://wiki.postgresql.org/wiki/Performance_Optimization

---

**Version**: 1.0.0
**Last Updated**: 2025-01-23
**Maintainer**: Development Team

