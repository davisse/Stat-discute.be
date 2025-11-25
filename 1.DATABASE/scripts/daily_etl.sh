#!/bin/bash
# ================================================================
# Daily ETL Workflow - NBA Stats Database
# ================================================================
# Purpose: Automated daily data collection and analytics pipeline
# Schedule: Run daily at 6 AM ET (after all games completed)
# Author: Claude Code
# ================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ETL_DIR="$(dirname "$SCRIPT_DIR")/etl"
LOG_DIR="$SCRIPT_DIR/../logs"
LOG_FILE="$LOG_DIR/daily_etl_$(date +%Y%m%d).log"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

# Error handler
error_exit() {
    log_error "Error in $1"
    log_error "Daily ETL workflow failed. Check log: $LOG_FILE"
    exit 1
}

# ================================================================
# Main ETL Workflow
# ================================================================

log "════════════════════════════════════════════════════════════"
log "🏀 NBA Stats Daily ETL Workflow Starting"
log "════════════════════════════════════════════════════════════"

# ----------------------------------------------------------------
# Step 1: Sync Season Games and Scores
# ----------------------------------------------------------------
log "📅 Step 1: Syncing season games and scores..."
if python3 "$ETL_DIR/sync_season_2025_26.py"; then
    log_success "Season games synced successfully"
else
    error_exit "sync_season_2025_26.py"
fi

# ----------------------------------------------------------------
# Step 2: Fetch Player Box Scores
# ----------------------------------------------------------------
log "📊 Step 2: Fetching player box scores..."
if python3 "$ETL_DIR/fetch_player_stats_direct.py"; then
    log_success "Player box scores fetched successfully"
else
    error_exit "fetch_player_stats_direct.py"
fi

# ----------------------------------------------------------------
# Step 3: Enrich with Starter Data
# ----------------------------------------------------------------
log "🏁 Step 3: Enriching with starter position data..."
if python3 "$ETL_DIR/enrich_with_starters.py"; then
    log_success "Starter data enriched successfully"
else
    error_exit "enrich_with_starters.py"
fi

# ----------------------------------------------------------------
# Step 4: Calculate Analytics
# ----------------------------------------------------------------
log "📈 Step 4: Running analytics calculations..."
if python3 "$ETL_DIR/analytics/run_all_analytics.py"; then
    log_success "Analytics calculated successfully"
else
    error_exit "run_all_analytics.py"
fi

# ----------------------------------------------------------------
# Step 5: Optional - Fetch Betting Odds
# ----------------------------------------------------------------
if [ -f "$ETL_DIR/betting/fetch_pinnacle_odds.py" ]; then
    log "💰 Step 5: Fetching betting odds (optional)..."
    if python3 "$ETL_DIR/betting/fetch_pinnacle_odds.py"; then
        log_success "Betting odds fetched successfully"
    else
        log_warning "Betting odds fetch failed (non-critical)"
    fi
else
    log_warning "Betting odds script not found, skipping..."
fi

# ----------------------------------------------------------------
# Step 6: Database Validation
# ----------------------------------------------------------------
log "✓ Step 6: Running validation checks..."

# Check for games without player stats
GAMES_WITHOUT_STATS=$(psql nba_stats -t -c "
    SELECT COUNT(*)
    FROM games g
    WHERE g.season = '2025-26'
      AND g.home_team_score IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM player_game_stats pgs
          WHERE pgs.game_id = g.game_id
      );
")

if [ "$GAMES_WITHOUT_STATS" -gt 0 ]; then
    log_warning "Found $GAMES_WITHOUT_STATS completed games without player stats"
else
    log_success "All completed games have player stats"
fi

# Check for games without starter data
GAMES_WITHOUT_STARTERS=$(psql nba_stats -t -c "
    SELECT COUNT(*)
    FROM games g
    WHERE g.season = '2025-26'
      AND g.home_team_score IS NOT NULL
      AND EXISTS (
          SELECT 1 FROM player_game_stats pgs
          WHERE pgs.game_id = g.game_id
            AND pgs.start_position IS NULL
      );
")

if [ "$GAMES_WITHOUT_STARTERS" -gt 0 ]; then
    log_warning "Found $GAMES_WITHOUT_STARTERS completed games without starter data"
else
    log_success "All completed games have starter data"
fi

# ----------------------------------------------------------------
# Step 7: Generate Summary Report
# ----------------------------------------------------------------
log "📋 Step 7: Generating summary report..."

TOTAL_GAMES=$(psql nba_stats -t -c "SELECT COUNT(*) FROM games WHERE season = '2025-26';")
COMPLETED_GAMES=$(psql nba_stats -t -c "SELECT COUNT(*) FROM games WHERE season = '2025-26' AND home_team_score IS NOT NULL;")
TOTAL_PLAYER_STATS=$(psql nba_stats -t -c "SELECT COUNT(*) FROM player_game_stats pgs JOIN games g ON pgs.game_id = g.game_id WHERE g.season = '2025-26';")
GAMES_WITH_STARTERS=$(psql nba_stats -t -c "
    SELECT COUNT(DISTINCT pgs.game_id)
    FROM player_game_stats pgs
    JOIN games g ON pgs.game_id = g.game_id
    WHERE g.season = '2025-26'
      AND pgs.is_starter = TRUE;
")

log "════════════════════════════════════════════════════════════"
log "📊 Daily ETL Summary Report"
log "════════════════════════════════════════════════════════════"
log "Season: 2025-26"
log "Total Games: $TOTAL_GAMES"
log "Completed Games: $COMPLETED_GAMES"
log "Player Game Stats: $TOTAL_PLAYER_STATS"
log "Games with Starter Data: $GAMES_WITH_STARTERS"
log "════════════════════════════════════════════════════════════"

log_success "Daily ETL workflow completed successfully!"
log "Log file: $LOG_FILE"

exit 0
