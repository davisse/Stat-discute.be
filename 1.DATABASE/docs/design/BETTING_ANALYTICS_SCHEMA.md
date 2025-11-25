# NBA Betting Analytics Schema

**Purpose**: Betting-specific analytical tables optimized for sports betting insights

---

## Category 5: Betting Intelligence (10 tables)

### 26. team_performance_trends
**Purpose**: Rolling performance metrics (updated daily)

```sql
CREATE TABLE team_performance_trends (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    as_of_date DATE NOT NULL,  -- Snapshot date
    games_played INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    losses INTEGER NOT NULL,
    win_percentage DECIMAL(5,3),
    last_5_wins INTEGER,
    last_5_losses INTEGER,
    last_10_wins INTEGER,
    last_10_losses INTEGER,
    last_20_wins INTEGER,
    last_20_losses INTEGER,
    home_record_wins INTEGER,
    home_record_losses INTEGER,
    away_record_wins INTEGER,
    away_record_losses INTEGER,
    avg_points_scored DECIMAL(6,2),
    avg_points_allowed DECIMAL(6,2),
    avg_point_differential DECIMAL(6,2),
    avg_offensive_rating DECIMAL(6,2),
    avg_defensive_rating DECIMAL(6,2),
    avg_pace DECIMAL(6,2),
    current_streak VARCHAR(10),  -- e.g., "W5", "L3"
    days_since_last_game INTEGER,
    back_to_back_games INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, season_id, as_of_date)
);

CREATE INDEX idx_tpt_team_date ON team_performance_trends(team_id, as_of_date DESC);
CREATE INDEX idx_tpt_season ON team_performance_trends(season_id, as_of_date DESC);
```

### 27. head_to_head_history
**Purpose**: Historical matchup performance

```sql
CREATE TABLE head_to_head_history (
    id SERIAL PRIMARY KEY,
    team1_id BIGINT NOT NULL REFERENCES teams(team_id),  -- Always lower ID
    team2_id BIGINT NOT NULL REFERENCES teams(team_id),  -- Always higher ID
    season_id VARCHAR(10) REFERENCES seasons(season_id),  -- NULL for all-time
    total_games INTEGER DEFAULT 0,
    team1_wins INTEGER DEFAULT 0,
    team2_wins INTEGER DEFAULT 0,
    team1_home_wins INTEGER DEFAULT 0,
    team2_home_wins INTEGER DEFAULT 0,
    avg_total_points DECIMAL(6,2),
    avg_point_differential DECIMAL(6,2),
    last_meeting_date DATE,
    last_meeting_winner_id BIGINT REFERENCES teams(team_id),
    last_5_meetings_team1_wins INTEGER DEFAULT 0,
    last_5_meetings_team2_wins INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (team1_id < team2_id),
    UNIQUE(team1_id, team2_id, season_id)
);

CREATE INDEX idx_h2h_teams ON head_to_head_history(team1_id, team2_id, season_id);
CREATE INDEX idx_h2h_season ON head_to_head_history(season_id);
```

### 28. betting_lines
**Purpose**: Betting odds tracking

```sql
CREATE TABLE betting_lines (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    sportsbook_name VARCHAR(50) NOT NULL,  -- DraftKings, FanDuel, BetMGM, etc.
    line_type VARCHAR(20) NOT NULL,  -- Moneyline, Spread, Total
    timestamp TIMESTAMP NOT NULL,
    home_odds INTEGER,  -- American odds (e.g., -150, +120)
    away_odds INTEGER,
    spread_value DECIMAL(4,1),  -- e.g., -7.5 for home team
    spread_home_odds INTEGER,
    spread_away_odds INTEGER,
    total_value DECIMAL(5,1),  -- Over/under points
    over_odds INTEGER,
    under_odds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bl_game_time ON betting_lines(game_id, timestamp DESC);
CREATE INDEX idx_bl_game_type ON betting_lines(game_id, line_type, timestamp DESC);
CREATE INDEX idx_bl_sportsbook ON betting_lines(sportsbook_name, game_id);
```

### 29. betting_market_odds
**Purpose**: Market movement tracking (sharp money indicator)

```sql
CREATE TABLE betting_market_odds (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    line_type VARCHAR(20) NOT NULL,  -- Moneyline, Spread, Total
    market_open_value DECIMAL(6,2),
    market_current_value DECIMAL(6,2),
    market_close_value DECIMAL(6,2),
    sharp_money_indicator BOOLEAN DEFAULT false,  -- Large professional bets
    public_betting_percentage DECIMAL(5,2),  -- % of bets on favorite
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bmo_game ON betting_market_odds(game_id, line_type, timestamp DESC);
```

### 30. game_predictions
**Purpose**: Model predictions for accuracy tracking

```sql
CREATE TABLE game_predictions (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    model_name VARCHAR(100) NOT NULL,  -- e.g., "ELO", "Four Factors", "ML Model v1"
    prediction_timestamp TIMESTAMP NOT NULL,
    predicted_winner_id BIGINT NOT NULL REFERENCES teams(team_id),
    predicted_home_score DECIMAL(5,1),
    predicted_away_score DECIMAL(5,1),
    predicted_total_points DECIMAL(5,1),
    predicted_spread DECIMAL(4,1),
    win_probability_home DECIMAL(5,3),
    win_probability_away DECIMAL(5,3),
    confidence_score DECIMAL(5,3),  -- 0-1
    actual_winner_id BIGINT REFERENCES teams(team_id),
    prediction_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pred_game ON game_predictions(game_id, model_name);
CREATE INDEX idx_pred_model ON game_predictions(model_name, prediction_correct);
```

### 31. situational_stats
**Purpose**: Context-aware performance (CRITICAL for betting)

```sql
CREATE TABLE situational_stats (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    situation_type VARCHAR(50) NOT NULL,  -- back_to_back, rest_days_0, rest_days_1, rest_days_2, rest_days_3plus, home, away, vs_above_500, vs_below_500, playoff_contender, conference_game, division_game
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    win_percentage DECIMAL(5,3),
    avg_points_scored DECIMAL(6,2),
    avg_points_allowed DECIMAL(6,2),
    avg_point_differential DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, season_id, situation_type)
);

CREATE INDEX idx_ss_team_situation ON situational_stats(team_id, season_id, situation_type);
CREATE INDEX idx_ss_season ON situational_stats(season_id, situation_type);
```

### 32. clutch_performance
**Purpose**: Performance in close games (final 5 minutes, score within 5)

```sql
CREATE TABLE clutch_performance (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(10) NOT NULL,  -- 'team' or 'player'
    entity_id BIGINT NOT NULL,  -- team_id or player_id
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    clutch_games_played INTEGER DEFAULT 0,
    clutch_minutes DECIMAL(10,2) DEFAULT 0,
    clutch_points INTEGER DEFAULT 0,
    clutch_field_goals_made INTEGER DEFAULT 0,
    clutch_field_goals_attempted INTEGER DEFAULT 0,
    clutch_field_goal_percentage DECIMAL(5,3),
    clutch_win_percentage DECIMAL(5,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_type, entity_id, season_id)
);

CREATE INDEX idx_clutch_entity ON clutch_performance(entity_type, entity_id, season_id);
```

### 33. rest_advantage_analysis
**Purpose**: Rest days impact on performance

```sql
CREATE TABLE rest_advantage_analysis (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    rest_days_category INTEGER NOT NULL,  -- 0=back-to-back, 1=one day, 2=two days, 3+=three plus
    opponent_rest_days_category INTEGER NOT NULL,
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    win_percentage DECIMAL(5,3),
    avg_points_scored DECIMAL(6,2),
    avg_points_allowed DECIMAL(6,2),
    avg_point_differential DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, season_id, rest_days_category, opponent_rest_days_category)
);

CREATE INDEX idx_raa_team ON rest_advantage_analysis(team_id, season_id);
CREATE INDEX idx_raa_rest ON rest_advantage_analysis(rest_days_category, opponent_rest_days_category);
```

### 34. home_away_splits
**Purpose**: Detailed home vs away performance

```sql
CREATE TABLE home_away_splits (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    location_type VARCHAR(10) NOT NULL,  -- 'home' or 'away'
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    win_percentage DECIMAL(5,3),
    avg_points_scored DECIMAL(6,2),
    avg_points_allowed DECIMAL(6,2),
    avg_point_differential DECIMAL(6,2),
    avg_offensive_rating DECIMAL(6,2),
    avg_defensive_rating DECIMAL(6,2),
    avg_pace DECIMAL(6,2),
    avg_effective_fg_pct DECIMAL(5,3),
    avg_turnover_pct DECIMAL(5,2),
    avg_offensive_rebound_pct DECIMAL(5,2),
    avg_free_throw_rate DECIMAL(5,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, season_id, location_type)
);

CREATE INDEX idx_has_team_loc ON home_away_splits(team_id, season_id, location_type);
```

### 35. pace_matchup_analysis
**Purpose**: How team pace affects outcomes

```sql
CREATE TABLE pace_matchup_analysis (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    opponent_pace_category VARCHAR(20) NOT NULL,  -- 'slow' (<95), 'medium' (95-100), 'fast' (>100)
    games_played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    win_percentage DECIMAL(5,3),
    avg_game_pace DECIMAL(6,2),
    avg_points_scored DECIMAL(6,2),
    avg_points_allowed DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, season_id, opponent_pace_category)
);

CREATE INDEX idx_pma_team ON pace_matchup_analysis(team_id, season_id);
```

---

## Category 6: Betting Analytics (4 tables)

### 36. streak_analysis
**Purpose**: Win/loss streak tracking

```sql
CREATE TABLE streak_analysis (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    game_id VARCHAR(20) NOT NULL REFERENCES games(game_id),
    game_date DATE NOT NULL,
    streak_type VARCHAR(10) NOT NULL,  -- 'win' or 'loss'
    current_streak_length INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_streak_team ON streak_analysis(team_id, season_id, is_active);
CREATE INDEX idx_streak_date ON streak_analysis(game_date DESC);
```

### 37. player_impact_on_outcomes
**Purpose**: Player availability impact (for injury analysis)

```sql
CREATE TABLE player_impact_on_outcomes (
    id SERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES players(player_id),
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    games_played INTEGER DEFAULT 0,
    games_missed INTEGER DEFAULT 0,
    team_record_with_player_wins INTEGER DEFAULT 0,
    team_record_with_player_losses INTEGER DEFAULT 0,
    team_record_without_player_wins INTEGER DEFAULT 0,
    team_record_without_player_losses INTEGER DEFAULT 0,
    win_pct_with_player DECIMAL(5,3),
    win_pct_without_player DECIMAL(5,3),
    impact_differential DECIMAL(5,3),  -- Difference in win%
    avg_points_with_player DECIMAL(6,2),
    avg_points_without_player DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, team_id, season_id)
);

CREATE INDEX idx_pio_player ON player_impact_on_outcomes(player_id, season_id);
CREATE INDEX idx_pio_impact ON player_impact_on_outcomes(impact_differential DESC);
```

### 38. over_under_trends
**Purpose**: Total points trends for betting

```sql
CREATE TABLE over_under_trends (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    games_played INTEGER DEFAULT 0,
    total_games_over INTEGER DEFAULT 0,
    total_games_under INTEGER DEFAULT 0,
    over_percentage DECIMAL(5,3),
    avg_total_points DECIMAL(6,2),
    avg_total_points_home DECIMAL(6,2),
    avg_total_points_away DECIMAL(6,2),
    avg_total_points_last_5 DECIMAL(6,2),
    avg_total_points_last_10 DECIMAL(6,2),
    highest_scoring_game INTEGER,
    lowest_scoring_game INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, season_id)
);

CREATE INDEX idx_out_team ON over_under_trends(team_id, season_id);
CREATE INDEX idx_out_over_pct ON over_under_trends(over_percentage DESC);
```

### 39. ats_performance
**Purpose**: Against The Spread performance tracking

```sql
CREATE TABLE ats_performance (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    situation VARCHAR(50) NOT NULL,  -- overall, home, away, favorite, underdog
    games_with_spread INTEGER DEFAULT 0,
    ats_wins INTEGER DEFAULT 0,  -- Covered spread
    ats_losses INTEGER DEFAULT 0,  -- Didn't cover
    ats_pushes INTEGER DEFAULT 0,  -- Exactly hit spread
    ats_win_percentage DECIMAL(5,3),
    avg_spread DECIMAL(4,1),
    avg_margin_vs_spread DECIMAL(5,2),  -- How much they beat/miss spread by
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, season_id, situation)
);

CREATE INDEX idx_ats_team ON ats_performance(team_id, season_id, situation);
CREATE INDEX idx_ats_win_pct ON ats_performance(ats_win_percentage DESC);
```

---

## Category 7: System Operations (3 tables)

### 40. standings
**Purpose**: League/conference/division standings

```sql
CREATE TABLE standings (
    id SERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES teams(team_id),
    season_id VARCHAR(10) NOT NULL REFERENCES seasons(season_id),
    standing_date DATE NOT NULL,
    conference VARCHAR(10) NOT NULL,  -- East, West
    division VARCHAR(20) NOT NULL,
    conference_rank INTEGER,
    division_rank INTEGER,
    wins INTEGER NOT NULL,
    losses INTEGER NOT NULL,
    win_percentage DECIMAL(5,3),
    games_behind DECIMAL(4,1),
    home_record VARCHAR(10),  -- e.g., "20-10"
    away_record VARCHAR(10),
    conference_record VARCHAR(10),
    division_record VARCHAR(10),
    last_10_record VARCHAR(10),
    current_streak VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, season_id, standing_date)
);

CREATE INDEX idx_standings_date ON standings(season_id, standing_date DESC);
CREATE INDEX idx_standings_rank ON standings(season_id, conference, conference_rank);
```

### 41. data_refresh_log
**Purpose**: ETL tracking and monitoring

```sql
CREATE TABLE data_refresh_log (
    id SERIAL PRIMARY KEY,
    endpoint_name VARCHAR(100) NOT NULL,
    refresh_type VARCHAR(20) NOT NULL,  -- full, incremental
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    records_processed INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL,  -- success, failed, partial
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_log_endpoint ON data_refresh_log(endpoint_name, start_time DESC);
CREATE INDEX idx_refresh_log_status ON data_refresh_log(status, start_time DESC);
```

### 42. api_rate_limits
**Purpose**: Rate limit tracking for NBA API

```sql
CREATE TABLE api_rate_limits (
    id SERIAL PRIMARY KEY,
    endpoint_name VARCHAR(100) NOT NULL,
    requests_made INTEGER DEFAULT 0,
    requests_limit INTEGER NOT NULL,
    window_start TIMESTAMP NOT NULL,
    window_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rate_limits_endpoint ON api_rate_limits(endpoint_name, window_start DESC);
```

---

## Materialized Views

### MV 1: Team Current Form
**Purpose**: Pre-computed last 10 games performance

```sql
CREATE MATERIALIZED VIEW mv_team_current_form AS
SELECT
    tgs.team_id,
    g.season_id,
    COUNT(*) as games_played,
    SUM(CASE WHEN tgs.won THEN 1 ELSE 0 END) as wins,
    SUM(CASE WHEN NOT tgs.won THEN 1 ELSE 0 END) as losses,
    AVG(tgs.points) as avg_points_scored,
    AVG(CASE
        WHEN tgs.is_home_team THEN g.away_team_score
        ELSE g.home_team_score
    END) as avg_points_allowed,
    AVG(tgs.plus_minus) as avg_plus_minus,
    MAX(g.game_date) as last_game_date
FROM (
    SELECT DISTINCT tgs.team_id, g.season_id
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    WHERE g.game_status = 'Final'
) teams
JOIN LATERAL (
    SELECT tgs2.*, g2.game_date, g2.home_team_score, g2.away_team_score
    FROM team_game_stats tgs2
    JOIN games g2 ON tgs2.game_id = g2.game_id
    WHERE tgs2.team_id = teams.team_id
    AND g2.season_id = teams.season_id
    AND g2.game_status = 'Final'
    ORDER BY g2.game_date DESC
    LIMIT 10
) AS last_10 ON true
JOIN games g ON last_10.game_id = g.game_id
JOIN team_game_stats tgs ON last_10.id = tgs.id
GROUP BY tgs.team_id, g.season_id;

CREATE UNIQUE INDEX idx_mv_tcf_team ON mv_team_current_form(team_id, season_id);

-- Refresh schedule: Daily at 2:30 AM ET
```

### MV 2: Betting Edge Signals
**Purpose**: Combined betting indicators for quick lookups

```sql
CREATE MATERIALIZED VIEW mv_betting_edge_signals AS
SELECT
    g.game_id,
    g.game_date,
    g.game_time,
    g.home_team_id,
    g.away_team_id,
    ht.full_name as home_team_name,
    at.full_name as away_team_name,
    ht_form.wins as home_last_10_wins,
    ht_form.avg_points_scored as home_last_10_avg_pts,
    at_form.wins as away_last_10_wins,
    at_form.avg_points_scored as away_last_10_avg_pts,
    h2h.team1_wins as h2h_home_wins,
    h2h.team2_wins as h2h_away_wins,
    h2h.avg_total_points as h2h_avg_total,
    home_split.win_percentage as home_team_home_win_pct,
    away_split.win_percentage as away_team_away_win_pct,
    sm.days_rest_home,
    sm.days_rest_away,
    sm.is_back_to_back_home,
    sm.is_back_to_back_away,
    COALESCE(home_injuries.count, 0) as home_key_injuries,
    COALESCE(away_injuries.count, 0) as away_key_injuries
FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
LEFT JOIN mv_team_current_form ht_form ON g.home_team_id = ht_form.team_id AND g.season_id = ht_form.season_id
LEFT JOIN mv_team_current_form at_form ON g.away_team_id = at_form.team_id AND g.season_id = at_form.season_id
LEFT JOIN head_to_head_history h2h ON (
    (g.home_team_id = h2h.team1_id AND g.away_team_id = h2h.team2_id) OR
    (g.home_team_id = h2h.team2_id AND g.away_team_id = h2h.team1_id)
) AND h2h.season_id = g.season_id
LEFT JOIN home_away_splits home_split ON g.home_team_id = home_split.team_id
    AND home_split.location_type = 'home' AND home_split.season_id = g.season_id
LEFT JOIN home_away_splits away_split ON g.away_team_id = away_split.team_id
    AND away_split.location_type = 'away' AND away_split.season_id = g.season_id
LEFT JOIN schedule_metadata sm ON g.game_id = sm.game_id
LEFT JOIN (
    SELECT team_id, game_id, COUNT(*) as count
    FROM player_injury_reports pir
    WHERE injury_status IN ('Out', 'Doubtful')
    AND date_resolved IS NULL
    GROUP BY team_id, game_id
) home_injuries ON g.home_team_id = home_injuries.team_id AND g.game_id = home_injuries.game_id
LEFT JOIN (
    SELECT team_id, game_id, COUNT(*) as count
    FROM player_injury_reports pir
    WHERE injury_status IN ('Out', 'Doubtful')
    AND date_resolved IS NULL
    GROUP BY team_id, game_id
) away_injuries ON g.away_team_id = away_injuries.team_id AND g.game_id = away_injuries.game_id
WHERE g.game_status IN ('Scheduled', 'InProgress')
AND g.game_date >= CURRENT_DATE - INTERVAL '7 days';

CREATE UNIQUE INDEX idx_mv_bes_game ON mv_betting_edge_signals(game_id);

-- Refresh schedule: Every 15 minutes on game days, otherwise hourly
```

---

## Calculated Metrics & Formulas

### Pythagorean Win Expectation
```sql
CREATE OR REPLACE FUNCTION calculate_pythagorean_wins(
    points_scored DECIMAL,
    points_allowed DECIMAL,
    games_played INTEGER
) RETURNS DECIMAL AS $$
DECLARE
    exponent CONSTANT DECIMAL := 13.91;
    expected_win_pct DECIMAL;
BEGIN
    expected_win_pct := POWER(points_scored, exponent) /
                       (POWER(points_scored, exponent) + POWER(points_allowed, exponent));
    RETURN expected_win_pct * games_played;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### Four Factors Calculation
```sql
-- Effective Field Goal %: (FGM + 0.5 * 3PM) / FGA
-- Turnover %: TOV / (FGA + 0.44*FTA + TOV)
-- Offensive Rebound %: OREB / (OREB + Opp DREB)
-- Free Throw Rate: FTA / FGA
```

### Possessions Estimation
```sql
CREATE OR REPLACE FUNCTION estimate_possessions(
    fga INTEGER,
    oreb INTEGER,
    tov INTEGER,
    fta INTEGER
) RETURNS DECIMAL AS $$
BEGIN
    RETURN (fga - oreb) + tov + (0.4 * fta);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

## Data Quality Checks

### Referential Integrity
```sql
-- All game_ids in stats tables must exist in games
ALTER TABLE team_game_stats ADD CONSTRAINT fk_tgs_game
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE;

-- Box score totals must match game scores
CREATE OR REPLACE FUNCTION validate_box_score_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM games g
        WHERE g.game_id = NEW.game_id
        AND g.game_status = 'Final'
        AND (
            g.home_team_score != (SELECT points FROM team_game_stats WHERE game_id = NEW.game_id AND is_home_team = true)
            OR
            g.away_team_score != (SELECT points FROM team_game_stats WHERE game_id = NEW.game_id AND is_home_team = false)
        )
    ) THEN
        RAISE EXCEPTION 'Box score totals do not match game scores for game_id %', NEW.game_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_box_score
    AFTER INSERT OR UPDATE ON team_game_stats
    FOR EACH ROW EXECUTE FUNCTION validate_box_score_totals();
```

---

## Refresh Strategy

### Aggregation Update Procedure
```sql
CREATE OR REPLACE PROCEDURE refresh_betting_analytics(p_season_id VARCHAR DEFAULT NULL)
LANGUAGE plpgsql AS $$
BEGIN
    -- Refresh team performance trends
    CALL refresh_team_performance_trends(p_season_id);

    -- Refresh head to head history
    CALL refresh_head_to_head_history(p_season_id);

    -- Refresh situational stats
    CALL refresh_situational_stats(p_season_id);

    -- Refresh home/away splits
    CALL refresh_home_away_splits(p_season_id);

    -- Refresh over/under trends
    CALL refresh_over_under_trends(p_season_id);

    -- Refresh ATS performance
    CALL refresh_ats_performance(p_season_id);

    -- Refresh materialized views
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_team_current_form;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_betting_edge_signals;

    -- Log completion
    INSERT INTO data_refresh_log (endpoint_name, refresh_type, start_time, end_time, status)
    VALUES ('betting_analytics', 'full', NOW(), NOW(), 'success');
END;
$$;
```

---

## Schema Statistics

| Category | Tables | Indexes | MVs | Total Size (est) |
|----------|--------|---------|-----|------------------|
| Reference Data | 8 | 15 | 0 | ~100 MB |
| Game & Schedule | 5 | 18 | 0 | ~500 MB |
| Performance Stats | 9 | 27 | 0 | ~80 GB/season |
| Roster & Availability | 3 | 8 | 0 | ~200 MB |
| Betting Intelligence | 10 | 22 | 2 | ~2 GB |
| Betting Analytics | 4 | 10 | 0 | ~500 MB |
| System Operations | 3 | 4 | 0 | ~100 MB |
| **TOTAL** | **42** | **104** | **5** | **~100 GB/season** |

---

**Version**: 1.0.0
**Optimized For**: PostgreSQL 18, Sports Betting Analytics
**Estimated Query Performance**: <100ms for 95% of betting queries with proper indexing
