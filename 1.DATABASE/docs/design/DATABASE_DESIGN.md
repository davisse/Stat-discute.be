# NBA Sports Betting Database Design

**Design Philosophy**: Enterprise-grade relational database optimized for sports betting analytics, combining normalized core entities with denormalized analytical tables for query performance.

**Database**: PostgreSQL 18
**Total Tables**: 42 core tables + 5 materialized views
**Design Pattern**: Hybrid (Normalized core + Star schema analytics)

---

## Executive Summary

This database design captures comprehensive NBA data from 136 API endpoints, organized into 7 functional categories:

1. **Core Reference Data** (8 tables) - Teams, players, coaches, venues
2. **Game & Schedule Data** (5 tables) - Games, schedules, travel logistics
3. **Performance Statistics** (9 tables) - Traditional, advanced, and four factors stats
4. **Roster & Availability** (3 tables) - Rosters, injuries, matchup ratings
5. **Betting Intelligence** (10 tables) - Trends, head-to-head, predictions
6. **Betting Analytics** (4 tables) - Streaks, player impact, over/under, ATS
7. **System Operations** (3 tables) - Standings, ETL logs, rate limits

**Key Features for Sports Betting**:
- Real-time injury impact analysis
- Rest days advantage calculations
- Home/away performance splits
- Head-to-head historical trends
- Four factors matchup analysis
- Clutch performance metrics
- Against The Spread (ATS) tracking
- Over/Under trend analysis
- Sharp money and line movement tracking

---

## Database Schema Categories

### Category 1: Core Reference Data (8 tables)

#### 1. teams
**Purpose**: NBA franchise information (dimension table)

```sql
CREATE TABLE teams (
    team_id BIGINT PRIMARY KEY,  -- NBA API team ID
    full_name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(3) NOT NULL UNIQUE,
    nickname VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50),
    year_founded INTEGER,
    conference VARCHAR(10) CHECK (conference IN ('East', 'West')),
    division VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_abbreviation ON teams(abbreviation);
CREATE INDEX idx_teams_conference ON teams(conference, is_active);
```

#### 2. players
**Purpose**: All NBA players (historical + active)

```sql
CREATE TABLE players (
    player_id BIGINT PRIMARY KEY,  -- NBA API player ID
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    birthdate DATE,
    country VARCHAR(50),
    height VARCHAR(10),  -- e.g., "6-8"
    weight INTEGER,      -- pounds
    position VARCHAR(20),  -- G, F, C, G-F, F-C
    jersey_number VARCHAR(3),
    draft_year INTEGER,
    draft_round INTEGER,
    draft_number INTEGER,
    college VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_players_active ON players(is_active);
CREATE INDEX idx_players_name ON players(last_name, first_name);
```

#### 3. seasons
**Purpose**: Season period definitions

```sql
CREATE TABLE seasons (
    season_id VARCHAR(10) PRIMARY KEY,  -- e.g., "22024" for 2024-25
    season_year VARCHAR(10) NOT NULL,   -- e.g., "2024-25"
    season_type VARCHAR(20) NOT NULL,   -- Regular Season, Playoffs, Preseason, All-Star
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(season_year, season_type)
);

CREATE INDEX idx_seasons_current ON seasons(is_current) WHERE is_current = true;
CREATE INDEX idx_seasons_dates ON seasons(start_date, end_date);
```

#### 4. venues
**Purpose**: Arena information

```sql
CREATE TABLE venues (
    venue_id SERIAL PRIMARY KEY,
    venue_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50),
    capacity INTEGER,
    team_id BIGINT REFERENCES teams(team_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_venues_team ON venues(team_id);
```

#### 5. coaches
**Purpose**: NBA coaches information

```sql
CREATE TABLE coaches (
    coach_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coaches_active ON coaches(is_active);
```

#### 6. team_coaches
**Purpose**: Coaching history (time-series)

```sql
CREATE TABLE team_coaches (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    coach_id INTEGER NOT NULL REFERENCES coaches(coach_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    position VARCHAR(50) NOT NULL,  -- Head Coach, Assistant Coach
    date_from DATE NOT NULL,
    date_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, coach_id, season_id, date_from)
);

CREATE INDEX idx_team_coaches_team ON team_coaches(team_id, season_id);
CREATE INDEX idx_team_coaches_active ON team_coaches(team_id, coach_id) WHERE date_to IS NULL;
```

#### 7. trades_transactions
**Purpose**: Player movement tracking

```sql
CREATE TABLE trades_transactions (
    id SERIAL PRIMARY KEY,
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,  -- Trade, Free Agent Signing, Waiver, Draft
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    from_team_id BIGINT REFERENCES teams(team_id),
    to_team_id BIGINT REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_player ON trades_transactions(player_id, transaction_date DESC);
CREATE INDEX idx_transactions_team ON trades_transactions(to_team_id, transaction_date DESC);
CREATE INDEX idx_transactions_date ON trades_transactions(transaction_date DESC);
```

#### 8. official_stats
**Purpose**: Referee tendencies (betting relevance)

```sql
CREATE TABLE official_stats (
    id SERIAL PRIMARY KEY,
    referee_name VARCHAR(100) NOT NULL,
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    games_officiated INTEGER DEFAULT 0,
    avg_fouls_called DECIMAL(5,2),
    avg_technical_fouls DECIMAL(5,2),
    home_team_win_pct DECIMAL(5,4),  -- Home bias indicator
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(referee_name, season_id)
);

CREATE INDEX idx_official_stats_season ON official_stats(season_id, referee_name);
```

---

### Category 2: Game & Schedule Data (5 tables)

#### 9. games
**Purpose**: CENTRAL FACT TABLE - All NBA games (past, present, future)

```sql
CREATE TABLE games (
    game_id VARCHAR(20) PRIMARY KEY,  -- NBA API game ID
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    game_date DATE NOT NULL,
    game_time TIME,
    home_team_id BIGINT NOT NULL REFERENCES teams(team_id),
    away_team_id BIGINT NOT NULL REFERENCES teams(team_id),
    venue_id INTEGER REFERENCES venues(venue_id),
    game_status VARCHAR(20) NOT NULL,  -- Scheduled, InProgress, Final, Postponed, Cancelled
    home_team_score INTEGER,
    away_team_score INTEGER,
    attendance INTEGER,
    game_duration_minutes INTEGER,
    overtime_periods INTEGER DEFAULT 0,
    playoff_series_id INTEGER REFERENCES playoff_series(series_id),
    playoff_game_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (home_team_id != away_team_id)
);

-- CRITICAL INDEXES for betting queries
CREATE INDEX idx_games_date ON games(game_date DESC);
CREATE INDEX idx_games_home_team ON games(home_team_id, game_date DESC);
CREATE INDEX idx_games_away_team ON games(away_team_id, game_date DESC);
CREATE INDEX idx_games_season ON games(season_id, game_date DESC);
CREATE INDEX idx_games_status ON games(game_status, game_date);
CREATE INDEX idx_games_today ON games(game_date) WHERE game_status IN ('Scheduled', 'InProgress');

-- Partition by season for performance
-- CREATE TABLE games_2024 PARTITION OF games FOR VALUES IN ('22024');
```

#### 10. playoff_series
**Purpose**: Playoff matchup tracking

```sql
CREATE TABLE playoff_series (
    series_id SERIAL PRIMARY KEY,
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    round_number INTEGER NOT NULL CHECK (round_number BETWEEN 1 AND 4),
    round_name VARCHAR(50) NOT NULL,  -- First Round, Conference Semifinals, Conference Finals, Finals
    team1_id BIGINT NOT NULL REFERENCES teams(team_id),
    team2_id BIGINT NOT NULL REFERENCES teams(team_id),
    team1_seed INTEGER,
    team2_seed INTEGER,
    team1_wins INTEGER DEFAULT 0,
    team2_wins INTEGER DEFAULT 0,
    series_winner_id BIGINT REFERENCES teams(team_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(season_id, round_number, team1_id, team2_id)
);

CREATE INDEX idx_playoff_series_season ON playoff_series(season_id, round_number);
```

#### 11. game_lineups
**Purpose**: Starting lineups per game

```sql
CREATE TABLE game_lineups (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    position VARCHAR(10) NOT NULL,  -- PG, SG, SF, PF, C
    lineup_order INTEGER NOT NULL CHECK (lineup_order BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, team_id, player_id)
);

CREATE INDEX idx_game_lineups_game ON game_lineups(game_id);
CREATE INDEX idx_game_lineups_player ON game_lineups(player_id, game_id DESC);
```

#### 12. schedule_metadata
**Purpose**: Game context for betting analysis (CRITICAL)

```sql
CREATE TABLE schedule_metadata (
    game_id VARCHAR(20) PRIMARY KEY REFERENCES games(game_id),
    is_back_to_back_home BOOLEAN DEFAULT false,
    is_back_to_back_away BOOLEAN DEFAULT false,
    days_rest_home INTEGER,
    days_rest_away INTEGER,
    is_rivalry_game BOOLEAN DEFAULT false,
    is_nationally_televised BOOLEAN DEFAULT false,
    miles_traveled_home INTEGER,
    miles_traveled_away INTEGER,
    timezone_difference INTEGER,  -- Hours difference
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedule_meta_b2b ON schedule_metadata(game_id) WHERE is_back_to_back_home OR is_back_to_back_away;
CREATE INDEX idx_schedule_meta_rest ON schedule_metadata(days_rest_home, days_rest_away);
```

#### 13. team_travel_schedule
**Purpose**: Travel logistics impact

```sql
CREATE TABLE team_travel_schedule (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    origin_city VARCHAR(50),
    destination_city VARCHAR(50) NOT NULL,
    travel_date DATE NOT NULL,
    miles_traveled INTEGER,
    time_zones_crossed INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_travel_team_date ON team_travel_schedule(team_id, travel_date DESC);
```

---

### Category 3: Performance Statistics (9 tables)

#### 14. team_game_stats
**Purpose**: Team performance per game (traditional box score)

```sql
CREATE TABLE team_game_stats (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    is_home_team BOOLEAN NOT NULL,
    won BOOLEAN NOT NULL,
    minutes_played INTEGER,
    points INTEGER NOT NULL,
    field_goals_made INTEGER,
    field_goals_attempted INTEGER,
    field_goal_percentage DECIMAL(5,3),
    three_pointers_made INTEGER,
    three_pointers_attempted INTEGER,
    three_point_percentage DECIMAL(5,3),
    free_throws_made INTEGER,
    free_throws_attempted INTEGER,
    free_throw_percentage DECIMAL(5,3),
    offensive_rebounds INTEGER,
    defensive_rebounds INTEGER,
    total_rebounds INTEGER,
    assists INTEGER,
    steals INTEGER,
    blocks INTEGER,
    turnovers INTEGER,
    personal_fouls INTEGER,
    plus_minus INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, team_id)
);

-- CRITICAL INDEXES
CREATE INDEX idx_tgs_game ON team_game_stats(game_id);
CREATE INDEX idx_tgs_team_game ON team_game_stats(team_id, game_id DESC);
CREATE INDEX idx_tgs_team_home ON team_game_stats(team_id, is_home_team, game_id DESC);

-- Partition by season
-- ALTER TABLE team_game_stats PARTITION BY LIST (EXTRACT(YEAR FROM created_at));
```

#### 15. player_game_stats
**Purpose**: Player performance per game (traditional box score)

```sql
CREATE TABLE player_game_stats (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    is_starter BOOLEAN NOT NULL,
    start_position VARCHAR(10),  -- PG, SG, SF, PF, C
    minutes_played DECIMAL(5,2),
    points INTEGER,
    field_goals_made INTEGER,
    field_goals_attempted INTEGER,
    field_goal_percentage DECIMAL(5,3),
    three_pointers_made INTEGER,
    three_pointers_attempted INTEGER,
    three_point_percentage DECIMAL(5,3),
    free_throws_made INTEGER,
    free_throws_attempted INTEGER,
    free_throw_percentage DECIMAL(5,3),
    offensive_rebounds INTEGER,
    defensive_rebounds INTEGER,
    total_rebounds INTEGER,
    assists INTEGER,
    steals INTEGER,
    blocks INTEGER,
    turnovers INTEGER,
    personal_fouls INTEGER,
    plus_minus INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, player_id)
);

CREATE INDEX idx_pgs_game ON player_game_stats(game_id);
CREATE INDEX idx_pgs_player_game ON player_game_stats(player_id, game_id DESC);
CREATE INDEX idx_pgs_team_game ON player_game_stats(team_id, game_id DESC);
```

#### 16. team_game_advanced_stats
**Purpose**: Advanced team metrics per game

```sql
CREATE TABLE team_game_advanced_stats (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    offensive_rating DECIMAL(6,2),  -- Points per 100 possessions
    defensive_rating DECIMAL(6,2),
    net_rating DECIMAL(6,2),
    assist_percentage DECIMAL(5,2),
    assist_to_turnover_ratio DECIMAL(5,2),
    assist_ratio DECIMAL(5,2),
    offensive_rebound_percentage DECIMAL(5,2),
    defensive_rebound_percentage DECIMAL(5,2),
    total_rebound_percentage DECIMAL(5,2),
    true_shooting_percentage DECIMAL(5,3),
    effective_field_goal_percentage DECIMAL(5,3),
    pace DECIMAL(6,2),  -- Possessions per 48 minutes
    pie DECIMAL(5,3),   -- Player Impact Estimate
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, team_id)
);

CREATE INDEX idx_tgas_game ON team_game_advanced_stats(game_id);
CREATE INDEX idx_tgas_team ON team_game_advanced_stats(team_id, game_id DESC);
```

#### 17. player_game_advanced_stats
**Purpose**: Advanced player metrics per game

```sql
CREATE TABLE player_game_advanced_stats (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    offensive_rating DECIMAL(6,2),
    defensive_rating DECIMAL(6,2),
    net_rating DECIMAL(6,2),
    assist_percentage DECIMAL(5,2),
    assist_to_turnover_ratio DECIMAL(5,2),
    assist_ratio DECIMAL(5,2),
    offensive_rebound_percentage DECIMAL(5,2),
    defensive_rebound_percentage DECIMAL(5,2),
    total_rebound_percentage DECIMAL(5,2),
    usage_percentage DECIMAL(5,2),
    true_shooting_percentage DECIMAL(5,3),
    effective_field_goal_percentage DECIMAL(5,3),
    pace DECIMAL(6,2),
    pie DECIMAL(5,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, player_id)
);

CREATE INDEX idx_pgas_game ON player_game_advanced_stats(game_id);
CREATE INDEX idx_pgas_player ON player_game_advanced_stats(player_id, game_id DESC);
```

#### 18. team_game_four_factors
**Purpose**: Dean Oliver's Four Factors (KEY BETTING METRIC)

```sql
CREATE TABLE team_game_four_factors (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    effective_field_goal_pct DECIMAL(5,3),      -- (FGM + 0.5 * 3PM) / FGA
    free_throw_rate DECIMAL(5,3),               -- FTA / FGA
    turnover_percentage DECIMAL(5,2),            -- TOV / (FGA + 0.44*FTA + TOV)
    offensive_rebound_percentage DECIMAL(5,2),   -- OREB / (OREB + Opp DREB)
    opponent_effective_field_goal_pct DECIMAL(5,3),
    opponent_free_throw_rate DECIMAL(5,3),
    opponent_turnover_percentage DECIMAL(5,2),
    opponent_offensive_rebound_pct DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, team_id)
);

CREATE INDEX idx_tgff_game ON team_game_four_factors(game_id);
CREATE INDEX idx_tgff_team ON team_game_four_factors(team_id, game_id DESC);
```

#### 19. lineup_combinations
**Purpose**: 5-man lineup performance tracking

```sql
CREATE TABLE lineup_combinations (
    id SERIAL PRIMARY KEY,
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    lineup_hash VARCHAR(64) NOT NULL,  -- MD5 hash of sorted player IDs
    player1_id BIGINT NOT NULL REFERENCES players(player_id),
    player2_id BIGINT NOT NULL REFERENCES players(player_id),
    player3_id BIGINT NOT NULL REFERENCES players(player_id),
    player4_id BIGINT NOT NULL REFERENCES players(player_id),
    player5_id BIGINT NOT NULL REFERENCES players(player_id),
    games_played INTEGER DEFAULT 0,
    minutes_played DECIMAL(10,2) DEFAULT 0,
    points_scored INTEGER DEFAULT 0,
    points_allowed INTEGER DEFAULT 0,
    plus_minus INTEGER DEFAULT 0,
    offensive_rating DECIMAL(6,2),
    defensive_rating DECIMAL(6,2),
    net_rating DECIMAL(6,2),
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(season_id, team_id, lineup_hash)
);

CREATE INDEX idx_lineup_team ON lineup_combinations(team_id, season_id, net_rating DESC);
CREATE INDEX idx_lineup_hash ON lineup_combinations(lineup_hash);
```

#### 20. shot_charts
**Purpose**: Shot location data for spatial analysis

```sql
CREATE TABLE shot_charts (
    id BIGSERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    period INTEGER NOT NULL,
    minutes_remaining INTEGER,
    seconds_remaining INTEGER,
    shot_made BOOLEAN NOT NULL,
    shot_type VARCHAR(10) NOT NULL,  -- 2PT, 3PT
    shot_zone_basic VARCHAR(50),     -- Restricted Area, In The Paint, Mid-Range, etc.
    shot_zone_area VARCHAR(50),      -- Left, Center, Right
    shot_distance DECIMAL(5,1),      -- Feet from basket
    loc_x INTEGER,                   -- Court x-coordinate
    loc_y INTEGER,                   -- Court y-coordinate
    action_type VARCHAR(100),        -- Jump Shot, Layup, Dunk, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shot_game_player ON shot_charts(game_id, player_id);
CREATE INDEX idx_shot_player_season ON shot_charts(player_id, game_id DESC);

-- Partition by season for performance
```

#### 21. play_by_play
**Purpose**: Detailed game events (for advanced analysis)

```sql
CREATE TABLE play_by_play (
    id BIGSERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    event_num INTEGER NOT NULL,
    period INTEGER NOT NULL,
    time_minutes INTEGER,
    time_seconds INTEGER,
    event_type VARCHAR(50) NOT NULL,  -- FGM, FGA, FTM, FTA, REB, AST, STL, BLK, TOV, etc.
    home_description TEXT,
    away_description TEXT,
    player1_id BIGINT REFERENCES players(player_id),
    player2_id BIGINT REFERENCES players(player_id),  -- For assists, blocks
    player3_id BIGINT REFERENCES players(player_id),
    home_score INTEGER,
    away_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, event_num)
);

CREATE INDEX idx_pbp_game ON play_by_play(game_id, event_num);
CREATE INDEX idx_pbp_player1 ON play_by_play(player1_id, game_id);

-- Partition by season
```

#### 22. referee_assignments
**Purpose**: Referee assignments per game

```sql
CREATE TABLE referee_assignments (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    referee_name VARCHAR(100) NOT NULL,
    referee_position VARCHAR(50),  -- Crew Chief, Referee, Umpire
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_referee_game ON referee_assignments(game_id);
CREATE INDEX idx_referee_name ON referee_assignments(referee_name, game_id DESC);
```

---

### Category 4: Roster & Availability (3 tables)

#### 23. team_rosters
**Purpose**: Historical team rosters (time-series)

```sql
CREATE TABLE team_rosters (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    jersey_number VARCHAR(3),
    position VARCHAR(20),
    date_from DATE NOT NULL,
    date_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, player_id, season_id, date_from)
);

CREATE INDEX idx_roster_team_season ON team_rosters(team_id, season_id, is_active);
CREATE INDEX idx_roster_player ON team_rosters(player_id, season_id);
CREATE INDEX idx_roster_active ON team_rosters(is_active) WHERE is_active = true;
```

#### 24. player_injury_reports
**Purpose**: Injury tracking (CRITICAL for betting decisions)

```sql
CREATE TABLE player_injury_reports (
    id SERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    game_id VARCHAR(20) REFERENCES games(game_id),  -- Nullable if general injury
    injury_status VARCHAR(20) NOT NULL,  -- Out, Doubtful, Questionable, Probable, Available
    injury_description TEXT,
    date_reported DATE NOT NULL,
    date_resolved DATE,
    games_missed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_injury_player_date ON player_injury_reports(player_id, date_reported DESC);
CREATE INDEX idx_injury_game ON player_injury_reports(game_id) WHERE game_id IS NOT NULL;
CREATE INDEX idx_injury_status ON player_injury_reports(injury_status, date_reported DESC);
CREATE INDEX idx_injury_active ON player_injury_reports(player_id) WHERE date_resolved IS NULL;
```

#### 25. key_matchup_ratings
**Purpose**: Position vs position advantages

```sql
CREATE TABLE key_matchup_ratings (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    position VARCHAR(10) NOT NULL,  -- PG, SG, SF, PF, C
    home_player_id BIGINT REFERENCES players(player_id),
    away_player_id BIGINT REFERENCES players(player_id),
    home_advantage_score DECIMAL(4,2) CHECK (home_advantage_score BETWEEN -5 AND 5),  -- -5 to +5
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matchup_game ON key_matchup_ratings(game_id);
```

---

## Performance Optimization

### Partitioning Strategy
```sql
-- Partition large fact tables by season
ALTER TABLE team_game_stats PARTITION BY LIST (season_id);
ALTER TABLE player_game_stats PARTITION BY LIST (season_id);
ALTER TABLE shot_charts PARTITION BY LIST (season_id);
ALTER TABLE play_by_play PARTITION BY LIST (season_id);

-- Create partitions for each season
CREATE TABLE team_game_stats_2024 PARTITION OF team_game_stats FOR VALUES IN ('22024');
CREATE TABLE team_game_stats_2025 PARTITION OF team_game_stats FOR VALUES IN ('22025');
```

### Key Indexing Principles
1. **Temporal indexes**: All date-based queries use DESC for recent-first ordering
2. **Composite indexes**: Multi-column indexes for common JOIN patterns
3. **Partial indexes**: WHERE clauses for frequently filtered subsets
4. **Covering indexes**: Include columns for index-only scans where beneficial

---

## Data Refresh Strategy

### Frequency Matrix
| Data Type | Refresh Frequency | Trigger |
|-----------|------------------|---------|
| Reference data (teams, players) | Daily 3 AM ET | Scheduled |
| Game schedule | Daily 5 AM ET | Scheduled |
| Injury reports | Hourly on game days | Scheduled |
| Betting lines | Every 5-15 min | Real-time |
| Box scores | 15 min post-game | Event-driven |
| Aggregations | Daily 2 AM ET | After games complete |
| Materialized views | Daily 2:30 AM ET | After aggregations |
| Shot charts | Daily 4 AM ET | Next morning batch |

### ETL Workflow
```
3:00 AM - Sync reference data
5:00 AM - Sync schedule, standings
Pre-game (-2h) - Injury updates, betting lines, predictions
Post-game (+15m) - Box scores, stats
2:00 AM - Run aggregations
2:30 AM - Refresh materialized views
4:00 AM - Detailed data (shot charts, play-by-play)
```

---

## NBA API Endpoint Mapping

### Core Data Sources (11 key endpoints)

| NBA API Endpoint | Target Tables | Refresh Frequency |
|------------------|---------------|-------------------|
| `CommonAllPlayers` | players | Daily |
| `CommonTeamRoster` | team_rosters | Daily |
| `LeagueStandingsV3` | standings | Daily |
| `Scoreboard` | games | Hourly on game days |
| `BoxScoreTraditionalV2` | team_game_stats, player_game_stats | Post-game |
| `BoxScoreAdvancedV2` | team_game_advanced_stats, player_game_advanced_stats | Post-game |
| `BoxScoreFourFactorsV2` | team_game_four_factors | Post-game |
| `ShotChartDetail` | shot_charts | Next day |
| `PlayByPlayV2` | play_by_play | Next day |
| `LeagueGameFinder` | games (backfill) | One-time + incremental |
| `CommonPlayerInfo` | players (details) | Weekly |

---

## Betting Query Patterns

### Essential Queries Supported

1. **Today's Games with Context**
   - Last 10 game form
   - Head-to-head history
   - Home/away splits
   - Injury impact
   - Rest advantage

2. **Against The Spread Analysis**
   - ATS record by situation
   - Margin vs spread trends
   - Situational performance

3. **Over/Under Trends**
   - Total points by context
   - Pace matchup analysis
   - Recent scoring trends

4. **Four Factors Matchup**
   - eFG%, TOV%, OREB%, FTR comparisons
   - Factor advantage predictions

5. **Player Impact Analysis**
   - Team performance with/without key players
   - Injury impact quantification

6. **Rest Advantage**
   - Back-to-back performance
   - Rest days differential impact

---

## Next Steps

1. **Create Migration Files**: Run SQL migration scripts in `migrations/` directory
2. **Set Up ETL Pipeline**: Implement data collection scripts for each endpoint
3. **Configure Refresh Jobs**: Set up cron jobs or schedulers for data refresh
4. **Implement Aggregations**: Create stored procedures for analytical table updates
5. **Build API Layer**: Expose betting insights through REST API endpoints
6. **Add Monitoring**: Implement data quality checks and alerting

---

## Schema Version

**Version**: 1.0.0
**Last Updated**: 2025-01-23
**PostgreSQL**: 14+
**Estimated Total Storage**: ~100GB per season (with full shot chart and play-by-play data)
