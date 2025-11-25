#!/bin/bash

# ============================================================================
# 2025-26 NBA Season Setup Script
# Sets up the new season as current and fetches all available data
# ============================================================================

set -e  # Exit on error

echo "============================================================================"
echo "🏀 2025-26 NBA SEASON SETUP"
echo "============================================================================"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "This script will:"
echo "  1. Set 2025-26 as the current season"
echo "  2. Fetch all games for the new season"
echo "  3. Collect box scores for completed games"
echo "  4. Calculate analytics"
echo "============================================================================"
echo

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DB_DIR="$(dirname "$SCRIPT_DIR")"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo

# Step 1: Update seasons table
echo "============================================================================"
echo "📅 STEP 1: UPDATING SEASONS TABLE"
echo "============================================================================"
python3 "$SCRIPT_DIR/reference_data/sync_seasons_2025_26.py"
if [ $? -ne 0 ]; then
    echo "❌ Failed to update seasons table"
    exit 1
fi
echo

# Step 2: Sync 2025-26 games and box scores
echo "============================================================================"
echo "🏀 STEP 2: FETCHING 2025-26 GAMES AND BOX SCORES"
echo "============================================================================"
python3 "$SCRIPT_DIR/sync_season_2025_26.py"
if [ $? -ne 0 ]; then
    echo "⚠️  Games sync completed with warnings. Continuing..."
fi
echo

# Step 3: Calculate team stats
echo "============================================================================"
echo "📊 STEP 3: CALCULATING TEAM STATISTICS"
echo "============================================================================"
if [ -f "$SCRIPT_DIR/analytics/calculate_team_stats.py" ]; then
    python3 "$SCRIPT_DIR/analytics/calculate_team_stats.py"
    if [ $? -ne 0 ]; then
        echo "⚠️  Team stats calculation had issues. Continuing..."
    fi
else
    echo "⚠️  Team stats script not found. Skipping..."
fi
echo

# Step 4: Calculate advanced stats
echo "============================================================================"
echo "📈 STEP 4: CALCULATING ADVANCED STATISTICS"
echo "============================================================================"
if [ -f "$SCRIPT_DIR/analytics/calculate_advanced_stats.py" ]; then
    python3 "$SCRIPT_DIR/analytics/calculate_advanced_stats.py"
    if [ $? -ne 0 ]; then
        echo "⚠️  Advanced stats calculation had issues. Continuing..."
    fi
else
    echo "⚠️  Advanced stats script not found. Skipping..."
fi
echo

# Step 5: Calculate standings
echo "============================================================================"
echo "🏆 STEP 5: CALCULATING STANDINGS"
echo "============================================================================"
if [ -f "$SCRIPT_DIR/analytics/calculate_standings.py" ]; then
    python3 "$SCRIPT_DIR/analytics/calculate_standings.py"
    if [ $? -ne 0 ]; then
        echo "⚠️  Standings calculation had issues. Continuing..."
    fi
else
    echo "⚠️  Standings script not found. Skipping..."
fi
echo

# Step 6: Refresh materialized views
echo "============================================================================"
echo "🔄 STEP 6: REFRESHING MATERIALIZED VIEWS"
echo "============================================================================"
if [ -f "$SCRIPT_DIR/analytics/refresh_materialized_views.py" ]; then
    python3 "$SCRIPT_DIR/analytics/refresh_materialized_views.py"
    if [ $? -ne 0 ]; then
        echo "⚠️  View refresh had issues. Continuing..."
    fi
else
    echo "⚠️  View refresh script not found. Skipping..."
fi
echo

# Final verification
echo "============================================================================"
echo "✅ VERIFYING 2025-26 SEASON SETUP"
echo "============================================================================"

# Check database for results
if command -v psql &> /dev/null; then
    echo "Checking database status..."

    # Get database credentials (same as Python scripts use)
    DB_NAME="${DB_NAME:-nba_stats}"
    DB_USER="${DB_USER:-postgres}"

    # Check current season
    echo
    echo "Current Season:"
    psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT season_id, season_type, start_date, end_date FROM seasons WHERE is_current = true;"

    # Check games count
    echo
    echo "Games loaded for 2025-26:"
    psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as total_games, MIN(game_date) as first_game, MAX(game_date) as last_game FROM games WHERE season = '2025-26';"

    # Check player stats
    echo
    echo "Player stats for 2025-26:"
    psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as total_stats, COUNT(DISTINCT player_id) as unique_players FROM player_game_stats pgs JOIN games g ON pgs.game_id = g.game_id WHERE g.season = '2025-26';"
else
    echo "psql not found. Skipping database verification."
fi

echo
echo "============================================================================"
echo "🎉 2025-26 SEASON SETUP COMPLETE!"
echo "============================================================================"
echo "Completed at: $(date '+%Y-%m-%d %H:%M:%S')"
echo
echo "Next steps:"
echo "  • Check the frontend to see new season data"
echo "  • Run daily sync to keep data current"
echo "  • Monitor betting data collection for new season"
echo "============================================================================"