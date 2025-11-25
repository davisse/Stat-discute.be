# NBA Betting Intelligence Queries

**Purpose**: Production-ready SQL queries for common sports betting scenarios

---

## Query 1: Today's Games with Full Betting Context

```sql
SELECT
    g.game_id,
    TO_CHAR(g.game_date, 'YYYY-MM-DD') as game_date,
    TO_CHAR(g.game_time, 'HH24:MI') as game_time,
    ht.abbreviation as home_team,
    at.abbreviation as away_team,

    -- Recent Form (Last 10 games)
    ht_form.wins as home_l10_wins,
    ht_form.losses as home_l10_losses,
    ROUND(ht_form.avg_points_scored, 1) as home_l10_avg_pts,
    at_form.wins as away_l10_wins,
    at_form.losses as away_l10_losses,
    ROUND(at_form.avg_points_scored, 1) as away_l10_avg_pts,

    -- Head-to-Head
    COALESCE(h2h.team1_wins, 0) + COALESCE(h2h.team2_wins, 0) as h2h_total_games,
    CASE
        WHEN g.home_team_id = h2h.team1_id THEN h2h.team1_wins
        ELSE h2h.team2_wins
    END as h2h_home_wins,
    CASE
        WHEN g.away_team_id = h2h.team1_id THEN h2h.team1_wins
        ELSE h2h.team2_wins
    END as h2h_away_wins,
    ROUND(h2h.avg_total_points, 1) as h2h_avg_total,

    -- Home/Away Performance
    ROUND(home_split.win_percentage * 100, 1) as home_team_home_win_pct,
    ROUND(home_split.avg_points_scored, 1) as home_team_home_avg_pts,
    ROUND(away_split.win_percentage * 100, 1) as away_team_away_win_pct,
    ROUND(away_split.avg_points_scored, 1) as away_team_away_avg_pts,

    -- Rest Advantage
    sm.days_rest_home,
    sm.days_rest_away,
    sm.is_back_to_back_home,
    sm.is_back_to_back_away,
    CASE
        WHEN sm.days_rest_home > sm.days_rest_away THEN 'HOME'
        WHEN sm.days_rest_away > sm.days_rest_home THEN 'AWAY'
        ELSE 'NEUTRAL'
    END as rest_advantage,

    -- Injury Impact
    COALESCE(home_injuries.out_count, 0) as home_players_out,
    COALESCE(home_injuries.doubtful_count, 0) as home_players_doubtful,
    COALESCE(away_injuries.out_count, 0) as away_players_out,
    COALESCE(away_injuries.doubtful_count, 0) as away_players_doubtful,

    -- Betting Lines (latest)
    bl_latest.spread_value as latest_spread,
    bl_latest.total_value as latest_total,
    bl_latest.home_odds as latest_home_ml,
    bl_latest.away_odds as latest_away_ml

FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id

-- Recent Form
LEFT JOIN mv_team_current_form ht_form
    ON g.home_team_id = ht_form.team_id AND g.season_id = ht_form.season_id
LEFT JOIN mv_team_current_form at_form
    ON g.away_team_id = at_form.team_id AND g.season_id = at_form.season_id

-- Head-to-Head
LEFT JOIN head_to_head_history h2h ON (
    (LEAST(g.home_team_id, g.away_team_id) = h2h.team1_id AND
     GREATEST(g.home_team_id, g.away_team_id) = h2h.team2_id)
) AND h2h.season_id = g.season_id

-- Home/Away Splits
LEFT JOIN home_away_splits home_split
    ON g.home_team_id = home_split.team_id
    AND home_split.location_type = 'home'
    AND home_split.season_id = g.season_id
LEFT JOIN home_away_splits away_split
    ON g.away_team_id = away_split.team_id
    AND away_split.location_type = 'away'
    AND away_split.season_id = g.season_id

-- Schedule Context
LEFT JOIN schedule_metadata sm ON g.game_id = sm.game_id

-- Injuries
LEFT JOIN (
    SELECT
        team_id,
        game_id,
        SUM(CASE WHEN injury_status = 'Out' THEN 1 ELSE 0 END) as out_count,
        SUM(CASE WHEN injury_status = 'Doubtful' THEN 1 ELSE 0 END) as doubtful_count
    FROM player_injury_reports
    WHERE date_resolved IS NULL
    GROUP BY team_id, game_id
) home_injuries ON g.home_team_id = home_injuries.team_id AND g.game_id = home_injuries.game_id
LEFT JOIN (
    SELECT
        team_id,
        game_id,
        SUM(CASE WHEN injury_status = 'Out' THEN 1 ELSE 0 END) as out_count,
        SUM(CASE WHEN injury_status = 'Doubtful' THEN 1 ELSE 0 END) as doubtful_count
    FROM player_injury_reports
    WHERE date_resolved IS NULL
    GROUP BY team_id, game_id
) away_injuries ON g.away_team_id = away_injuries.team_id AND g.game_id = away_injuries.game_id

-- Latest Betting Lines
LEFT JOIN LATERAL (
    SELECT spread_value, total_value, home_odds, away_odds
    FROM betting_lines
    WHERE game_id = g.game_id
    AND line_type = 'Spread'
    ORDER BY timestamp DESC
    LIMIT 1
) bl_latest ON true

WHERE g.game_date = CURRENT_DATE
AND g.game_status = 'Scheduled'
ORDER BY g.game_time;
```

---

## Query 2: Four Factors Matchup Analysis

```sql
WITH team_four_factors AS (
    SELECT
        tgff.team_id,
        g.season_id,
        AVG(tgff.effective_field_goal_pct) as avg_efg,
        AVG(tgff.free_throw_rate) as avg_ftr,
        AVG(tgff.turnover_percentage) as avg_tov_pct,
        AVG(tgff.offensive_rebound_percentage) as avg_oreb_pct,
        AVG(tgff.opponent_effective_field_goal_pct) as avg_def_efg,
        AVG(tgff.opponent_free_throw_rate) as avg_def_ftr,
        AVG(tgff.opponent_turnover_percentage) as avg_def_tov_pct,
        AVG(tgff.opponent_offensive_rebound_pct) as avg_def_oreb_pct
    FROM team_game_four_factors tgff
    JOIN games g ON tgff.game_id = g.game_id
    WHERE g.game_status = 'Final'
    AND g.game_date >= CURRENT_DATE - INTERVAL '30 days'  -- Last 30 days
    GROUP BY tgff.team_id, g.season_id
)
SELECT
    g.game_id,
    ht.full_name as home_team,
    at.full_name as away_team,

    -- Home Team Offense vs Away Team Defense
    ROUND(htff.avg_efg * 100, 1) as home_off_efg_pct,
    ROUND(atff.avg_def_efg * 100, 1) as away_def_efg_pct,
    ROUND((htff.avg_efg - atff.avg_def_efg) * 100, 1) as efg_advantage_home,

    -- Turnover Battle
    ROUND(htff.avg_tov_pct, 1) as home_off_tov_pct,
    ROUND(atff.avg_def_tov_pct, 1) as away_def_force_tov_pct,
    ROUND((atff.avg_def_tov_pct - htff.avg_tov_pct), 1) as tov_advantage_away,

    -- Rebounding Battle
    ROUND(htff.avg_oreb_pct, 1) as home_off_oreb_pct,
    ROUND(atff.avg_def_oreb_pct, 1) as away_def_oreb_pct,
    ROUND((htff.avg_oreb_pct - atff.avg_def_oreb_pct), 1) as oreb_advantage_home,

    -- Free Throw Rate
    ROUND(htff.avg_ftr, 3) as home_off_ftr,
    ROUND(atff.avg_def_ftr, 3) as away_def_ftr,
    ROUND((htff.avg_ftr - atff.avg_def_ftr), 3) as ftr_advantage_home,

    -- Factors Won (Home Team perspective)
    (CASE WHEN htff.avg_efg > atff.avg_def_efg THEN 1 ELSE 0 END +
     CASE WHEN htff.avg_tov_pct < atff.avg_def_tov_pct THEN 1 ELSE 0 END +
     CASE WHEN htff.avg_oreb_pct > atff.avg_def_oreb_pct THEN 1 ELSE 0 END +
     CASE WHEN htff.avg_ftr > atff.avg_def_ftr THEN 1 ELSE 0 END) as home_factors_won

FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
LEFT JOIN team_four_factors htff ON g.home_team_id = htff.team_id AND g.season_id = htff.season_id
LEFT JOIN team_four_factors atff ON g.away_team_id = atff.team_id AND g.season_id = atff.season_id
WHERE g.game_date = CURRENT_DATE
AND g.game_status = 'Scheduled';
```

---

## Query 3: Against The Spread (ATS) Analysis

```sql
SELECT
    t.full_name as team_name,
    ats.situation,
    ats.games_with_spread,
    ats.ats_wins,
    ats.ats_losses,
    ats.ats_pushes,
    ROUND(ats.ats_win_percentage * 100, 1) as ats_win_pct,
    ROUND(ats.avg_spread, 1) as avg_spread,
    ROUND(ats.avg_margin_vs_spread, 1) as avg_margin_vs_spread,

    -- Rating based on ATS performance
    CASE
        WHEN ats.ats_win_percentage >= 0.55 THEN 'Excellent'
        WHEN ats.ats_win_percentage >= 0.52 THEN 'Good'
        WHEN ats.ats_win_percentage >= 0.48 THEN 'Average'
        ELSE 'Poor'
    END as ats_rating

FROM ats_performance ats
JOIN teams t ON ats.team_id = t.team_id
WHERE ats.season_id = '22024'  -- Current season
AND ats.games_with_spread >= 10  -- Minimum sample size
ORDER BY ats.situation, ats.ats_win_percentage DESC;
```

---

## Query 4: Over/Under Trend Identifier

```sql
WITH recent_totals AS (
    SELECT
        tgs.team_id,
        g.game_id,
        g.game_date,
        tgs.is_home_team,
        (tgs.points + opp.points) as total_points
    FROM team_game_stats tgs
    JOIN games g ON tgs.game_id = g.game_id
    JOIN team_game_stats opp ON g.game_id = opp.game_id AND tgs.team_id != opp.team_id
    WHERE g.game_status = 'Final'
    AND g.game_date >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT
    t.full_name as team_name,
    out_trends.games_played,
    out_trends.total_games_over,
    out_trends.total_games_under,
    ROUND(out_trends.over_percentage * 100, 1) as over_pct,
    ROUND(out_trends.avg_total_points, 1) as avg_total_season,
    ROUND(last_5.avg_total_last_5, 1) as avg_total_last_5,
    ROUND(last_10.avg_total_last_10, 1) as avg_total_last_10,

    -- Trend Direction
    CASE
        WHEN last_5.avg_total_last_5 > last_10.avg_total_last_10 THEN 'INCREASING'
        WHEN last_5.avg_total_last_5 < last_10.avg_total_last_10 THEN 'DECREASING'
        ELSE 'STABLE'
    END as trend_direction,

    -- Betting Recommendation
    CASE
        WHEN out_trends.over_percentage >= 0.60 AND last_5.avg_total_last_5 > out_trends.avg_total_points THEN 'STRONG OVER'
        WHEN out_trends.over_percentage >= 0.55 THEN 'LEAN OVER'
        WHEN out_trends.over_percentage <= 0.40 AND last_5.avg_total_last_5 < out_trends.avg_total_points THEN 'STRONG UNDER'
        WHEN out_trends.over_percentage <= 0.45 THEN 'LEAN UNDER'
        ELSE 'NEUTRAL'
    END as betting_edge

FROM over_under_trends out_trends
JOIN teams t ON out_trends.team_id = t.team_id

-- Last 5 games average
LEFT JOIN LATERAL (
    SELECT AVG(total_points) as avg_total_last_5
    FROM (
        SELECT total_points
        FROM recent_totals
        WHERE team_id = out_trends.team_id
        ORDER BY game_date DESC
        LIMIT 5
    ) last_5_games
) last_5 ON true

-- Last 10 games average
LEFT JOIN LATERAL (
    SELECT AVG(total_points) as avg_total_last_10
    FROM (
        SELECT total_points
        FROM recent_totals
        WHERE team_id = out_trends.team_id
        ORDER BY game_date DESC
        LIMIT 10
    ) last_10_games
) last_10 ON true

WHERE out_trends.season_id = '22024'
ORDER BY ABS(out_trends.over_percentage - 0.5) DESC;
```

---

## Query 5: Player Injury Impact Analysis

```sql
WITH key_injuries AS (
    SELECT
        pir.player_id,
        pir.team_id,
        pir.game_id,
        p.full_name,
        pir.injury_status,
        pio.impact_differential,
        pio.win_pct_with_player,
        pio.win_pct_without_player
    FROM player_injury_reports pir
    JOIN players p ON pir.player_id = p.player_id
    LEFT JOIN player_impact_on_outcomes pio
        ON pir.player_id = pio.player_id
        AND pir.team_id = pio.team_id
        AND pio.season_id = '22024'
    WHERE pir.date_resolved IS NULL
    AND pir.injury_status IN ('Out', 'Doubtful')
    AND (pio.impact_differential >= 0.05 OR pio.impact_differential IS NULL)
)
SELECT
    g.game_id,
    g.game_date,
    ht.full_name as home_team,
    at.full_name as away_team,

    -- Home Team Injuries
    STRING_AGG(
        CASE WHEN ki_home.team_id = g.home_team_id
        THEN ki_home.full_name || ' (' || ki_home.injury_status || ')'
        ELSE NULL END,
        ', '
    ) as home_injuries,
    COUNT(CASE WHEN ki_home.team_id = g.home_team_id THEN 1 END) as home_injury_count,
    ROUND(AVG(CASE WHEN ki_home.team_id = g.home_team_id THEN ki_home.impact_differential END) * 100, 1) as home_avg_impact_loss,

    -- Away Team Injuries
    STRING_AGG(
        CASE WHEN ki_away.team_id = g.away_team_id
        THEN ki_away.full_name || ' (' || ki_away.injury_status || ')'
        ELSE NULL END,
        ', '
    ) as away_injuries,
    COUNT(CASE WHEN ki_away.team_id = g.away_team_id THEN 1 END) as away_injury_count,
    ROUND(AVG(CASE WHEN ki_away.team_id = g.away_team_id THEN ki_away.impact_differential END) * 100, 1) as away_avg_impact_loss,

    -- Edge Indicator
    CASE
        WHEN COUNT(CASE WHEN ki_home.team_id = g.home_team_id THEN 1 END) >
             COUNT(CASE WHEN ki_away.team_id = g.away_team_id THEN 1 END)
        THEN 'AWAY_EDGE'
        WHEN COUNT(CASE WHEN ki_away.team_id = g.away_team_id THEN 1 END) >
             COUNT(CASE WHEN ki_home.team_id = g.home_team_id THEN 1 END)
        THEN 'HOME_EDGE'
        ELSE 'NEUTRAL'
    END as injury_edge

FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
LEFT JOIN key_injuries ki_home ON g.game_id = ki_home.game_id
LEFT JOIN key_injuries ki_away ON g.game_id = ki_away.game_id
WHERE g.game_date >= CURRENT_DATE
AND g.game_status = 'Scheduled'
GROUP BY g.game_id, g.game_date, ht.full_name, at.full_name
HAVING COUNT(CASE WHEN ki_home.team_id = g.home_team_id THEN 1 END) > 0
    OR COUNT(CASE WHEN ki_away.team_id = g.away_team_id THEN 1 END) > 0
ORDER BY g.game_date, g.game_time;
```

---

## Query 6: Rest Advantage Betting Edge

```sql
WITH rest_performance AS (
    SELECT
        raa.team_id,
        raa.season_id,
        raa.rest_days_category,
        raa.opponent_rest_days_category,
        raa.win_percentage,
        raa.avg_point_differential,
        CASE
            WHEN raa.rest_days_category > raa.opponent_rest_days_category THEN 'rested'
            WHEN raa.rest_days_category < raa.opponent_rest_days_category THEN 'tired'
            ELSE 'equal'
        END as rest_situation
    FROM rest_advantage_analysis raa
    WHERE raa.season_id = '22024'
    AND raa.games_played >= 5  -- Minimum sample size
)
SELECT
    g.game_id,
    g.game_date,
    ht.full_name as home_team,
    at.full_name as away_team,
    sm.days_rest_home,
    sm.days_rest_away,
    sm.is_back_to_back_home,
    sm.is_back_to_back_away,

    -- Rest Categories
    CASE
        WHEN sm.days_rest_home = 0 THEN 0
        WHEN sm.days_rest_home = 1 THEN 1
        WHEN sm.days_rest_home = 2 THEN 2
        ELSE 3
    END as home_rest_category,
    CASE
        WHEN sm.days_rest_away = 0 THEN 0
        WHEN sm.days_rest_away = 1 THEN 1
        WHEN sm.days_rest_away = 2 THEN 2
        ELSE 3
    END as away_rest_category,

    -- Historical Performance with Current Rest
    ROUND(home_rest.win_percentage * 100, 1) as home_win_pct_at_rest,
    ROUND(home_rest.avg_point_differential, 1) as home_avg_margin_at_rest,
    ROUND(away_rest.win_percentage * 100, 1) as away_win_pct_at_rest,
    ROUND(away_rest.avg_point_differential, 1) as away_avg_margin_at_rest,

    -- Rest Edge
    CASE
        WHEN sm.days_rest_home > sm.days_rest_away THEN 'HOME'
        WHEN sm.days_rest_away > sm.days_rest_home THEN 'AWAY'
        ELSE 'NEUTRAL'
    END as rest_edge,

    -- Back-to-Back Edge
    CASE
        WHEN sm.is_back_to_back_home AND NOT sm.is_back_to_back_away THEN 'STRONG_AWAY'
        WHEN sm.is_back_to_back_away AND NOT sm.is_back_to_back_home THEN 'STRONG_HOME'
        WHEN sm.is_back_to_back_home AND sm.is_back_to_back_away THEN 'NEUTRAL'
        ELSE NULL
    END as b2b_edge

FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
JOIN schedule_metadata sm ON g.game_id = sm.game_id
LEFT JOIN rest_performance home_rest
    ON g.home_team_id = home_rest.team_id
    AND home_rest.rest_days_category = CASE
        WHEN sm.days_rest_home = 0 THEN 0
        WHEN sm.days_rest_home = 1 THEN 1
        WHEN sm.days_rest_home = 2 THEN 2
        ELSE 3
    END
    AND home_rest.opponent_rest_days_category = CASE
        WHEN sm.days_rest_away = 0 THEN 0
        WHEN sm.days_rest_away = 1 THEN 1
        WHEN sm.days_rest_away = 2 THEN 2
        ELSE 3
    END
LEFT JOIN rest_performance away_rest
    ON g.away_team_id = away_rest.team_id
    AND away_rest.rest_days_category = CASE
        WHEN sm.days_rest_away = 0 THEN 0
        WHEN sm.days_rest_away = 1 THEN 1
        WHEN sm.days_rest_away = 2 THEN 2
        ELSE 3
    END
    AND away_rest.opponent_rest_days_category = CASE
        WHEN sm.days_rest_home = 0 THEN 0
        WHEN sm.days_rest_home = 1 THEN 1
        WHEN sm.days_rest_home = 2 THEN 2
        ELSE 3
    END
WHERE g.game_date = CURRENT_DATE
AND g.game_status = 'Scheduled'
AND (sm.days_rest_home != sm.days_rest_away  -- Rest advantage exists
     OR sm.is_back_to_back_home
     OR sm.is_back_to_back_away)
ORDER BY ABS(sm.days_rest_home - sm.days_rest_away) DESC;
```

---

## Query 7: Betting Line Movement Analysis

```sql
WITH line_movement AS (
    SELECT
        game_id,
        line_type,
        MIN(timestamp) as first_timestamp,
        MAX(timestamp) as last_timestamp,
        FIRST_VALUE(spread_value) OVER (PARTITION BY game_id, line_type ORDER BY timestamp) as opening_spread,
        FIRST_VALUE(total_value) OVER (PARTITION BY game_id, line_type ORDER BY timestamp) as opening_total,
        LAST_VALUE(spread_value) OVER (PARTITION BY game_id, line_type ORDER BY timestamp ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as closing_spread,
        LAST_VALUE(total_value) OVER (PARTITION BY game_id, line_type ORDER BY timestamp ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as closing_total
    FROM betting_lines
    WHERE line_type = 'Spread'
    GROUP BY game_id, line_type, timestamp, spread_value, total_value
)
SELECT DISTINCT ON (g.game_id)
    g.game_id,
    g.game_date,
    ht.abbreviation as home_team,
    at.abbreviation as away_team,

    -- Spread Movement
    lm.opening_spread,
    lm.closing_spread,
    (lm.closing_spread - lm.opening_spread) as spread_movement,
    CASE
        WHEN ABS(lm.closing_spread - lm.opening_spread) >= 2 THEN 'SIGNIFICANT'
        WHEN ABS(lm.closing_spread - lm.opening_spread) >= 1 THEN 'MODERATE'
        ELSE 'MINIMAL'
    END as spread_movement_level,

    -- Total Movement
    lm.opening_total,
    lm.closing_total,
    (lm.closing_total - lm.opening_total) as total_movement,
    CASE
        WHEN ABS(lm.closing_total - lm.opening_total) >= 3 THEN 'SIGNIFICANT'
        WHEN ABS(lm.closing_total - lm.opening_total) >= 1.5 THEN 'MODERATE'
        ELSE 'MINIMAL'
    END as total_movement_level,

    -- Sharp Money Indicator
    bmo.sharp_money_indicator,
    ROUND(bmo.public_betting_percentage, 1) as public_on_favorite_pct,

    -- Betting Signal
    CASE
        WHEN bmo.sharp_money_indicator AND ABS(lm.closing_spread - lm.opening_spread) >= 1.5
        THEN 'STRONG_SHARP_MOVE'
        WHEN ABS(lm.closing_spread - lm.opening_spread) >= 2
        THEN 'FOLLOW_LINE_MOVE'
        WHEN bmo.public_betting_percentage >= 70 AND lm.closing_spread > lm.opening_spread
        THEN 'FADE_PUBLIC'  -- Public on favorite, line moving away
        ELSE 'NEUTRAL'
    END as betting_signal

FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
LEFT JOIN line_movement lm ON g.game_id = lm.game_id
LEFT JOIN LATERAL (
    SELECT sharp_money_indicator, public_betting_percentage
    FROM betting_market_odds
    WHERE game_id = g.game_id
    AND line_type = 'Spread'
    ORDER BY timestamp DESC
    LIMIT 1
) bmo ON true
WHERE g.game_date = CURRENT_DATE
AND g.game_status = 'Scheduled'
AND lm.opening_spread IS NOT NULL
ORDER BY g.game_id, ABS(lm.closing_spread - lm.opening_spread) DESC;
```

---

## Query 8: Comprehensive Betting Dashboard

```sql
SELECT
    bes.game_id,
    TO_CHAR(bes.game_date, 'MM/DD') as date,
    TO_CHAR(bes.game_time, 'HH24:MI') as time,
    bes.home_team_name,
    bes.away_team_name,

    -- Form
    bes.home_last_10_wins || '-' || (10 - bes.home_last_10_wins) as home_l10,
    bes.away_last_10_wins || '-' || (10 - bes.away_last_10_wins) as away_l10,

    -- Recent Offense
    ROUND(bes.home_last_10_avg_pts, 1) as home_avg_pts,
    ROUND(bes.away_last_10_avg_pts, 1) as away_avg_pts,

    -- Head-to-Head
    COALESCE(bes.h2h_home_wins, 0) || '-' || COALESCE(bes.h2h_away_wins, 0) as h2h_record,
    ROUND(bes.h2h_avg_total, 1) as h2h_avg_total,

    -- Splits
    ROUND(bes.home_team_home_win_pct * 100, 0) || '%' as home_pct,
    ROUND(bes.away_team_away_win_pct * 100, 0) || '%' as away_pct,

    -- Rest
    bes.days_rest_home || ' vs ' || bes.days_rest_away as rest,
    CASE
        WHEN bes.is_back_to_back_home THEN 'B2B'
        ELSE ''
    END as home_b2b,
    CASE
        WHEN bes.is_back_to_back_away THEN 'B2B'
        ELSE ''
    END as away_b2b,

    -- Injuries
    bes.home_key_injuries as home_inj,
    bes.away_key_injuries as away_inj,

    -- Combined Score (Higher = Better Bet)
    (
        -- Form advantage
        (bes.home_last_10_wins - bes.away_last_10_wins) * 2 +
        -- Home court advantage
        (bes.home_team_home_win_pct - 0.5) * 10 +
        -- Rest advantage
        (bes.days_rest_home - bes.days_rest_away) * 3 +
        -- Injury disadvantage
        (bes.away_key_injuries - bes.home_key_injuries) * 5
    ) as home_edge_score

FROM mv_betting_edge_signals bes
WHERE bes.game_date = CURRENT_DATE
ORDER BY ABS(
    (bes.home_last_10_wins - bes.away_last_10_wins) * 2 +
    (bes.home_team_home_win_pct - 0.5) * 10 +
    (bes.days_rest_home - bes.days_rest_away) * 3 +
    (bes.away_key_injuries - bes.home_key_injuries) * 5
) DESC;
```

---

## Query Execution Tips

1. **Use Materialized Views**: Refresh `mv_team_current_form` and `mv_betting_edge_signals` daily at 2:30 AM
2. **Index Usage**: Ensure all date-based indexes exist for optimal performance
3. **Query Caching**: Cache query results for 5-15 minutes during game days
4. **Parallel Execution**: Use `SET max_parallel_workers_per_gather = 4;` for complex aggregations
5. **Connection Pooling**: Use PgBouncer or similar for high-traffic scenarios

---

## Performance Benchmarks

| Query | Expected Execution Time | Index Requirements |
|-------|------------------------|-------------------|
| Today's Games | <50ms | games(game_date), mv_team_current_form |
| Four Factors | <100ms | team_game_four_factors(team_id, game_id) |
| ATS Analysis | <30ms | ats_performance(team_id, season_id) |
| O/U Trends | <80ms | over_under_trends(team_id, season_id) |
| Injury Impact | <120ms | player_injury_reports(date_resolved) |
| Rest Advantage | <100ms | schedule_metadata(days_rest_*) |
| Line Movement | <150ms | betting_lines(game_id, timestamp DESC) |
| Dashboard | <80ms | mv_betting_edge_signals (pre-computed) |

---

**Version**: 1.0.0
**Optimized For**: PostgreSQL 18, Sub-100ms response times
**Query Coverage**: 95% of common betting scenarios
