#!/bin/bash
# Daily Betting Data Collection Pipeline
# Purpose: Orchestrate daily collection and processing of betting data
# Schedule: Run daily at 10:00 AM ET (before most games start)

set -e  # Exit on error

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
mkdir -p "$LOG_DIR"

# Log file with timestamp
LOG_FILE="$LOG_DIR/daily_pipeline_$(date +%Y%m%d_%H%M%S).log"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to run Python script with error handling
run_script() {
    local script_path="$1"
    local script_name=$(basename "$script_path")

    log "=========================================="
    log "Running: $script_name"
    log "=========================================="

    if python3 "$script_path" 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ SUCCESS: $script_name completed"
        return 0
    else
        log "❌ ERROR: $script_name failed"
        return 1
    fi
}

# Main pipeline
log "========================================"
log "DAILY BETTING DATA PIPELINE - START"
log "========================================"
log "Date: $(date '+%Y-%m-%d %H:%M:%S')"

# Step 1: Fetch latest betting odds from Pinnacle
log ""
log "STEP 1: Fetching betting odds from Pinnacle..."
if run_script "$SCRIPT_DIR/betting/fetch_pinnacle_odds.py"; then
    log "Odds collection complete"
else
    log "⚠️  Odds collection failed - continuing with pipeline"
fi

# Step 2: Transform odds into betting lines
log ""
log "STEP 2: Transforming odds into betting lines..."
if run_script "$SCRIPT_DIR/betting/populate_betting_lines.py"; then
    log "Betting lines populated"
else
    log "❌ CRITICAL: Betting lines transformation failed - stopping pipeline"
    exit 1
fi

# Step 3: Calculate ATS performance
log ""
log "STEP 3: Calculating ATS performance..."
if run_script "$SCRIPT_DIR/analytics/calculate_ats_performance.py"; then
    log "ATS performance calculated"
else
    log "⚠️  ATS calculation failed - continuing with pipeline"
fi

# Step 4: Calculate betting trends
log ""
log "STEP 4: Calculating betting trends..."
if run_script "$SCRIPT_DIR/analytics/calculate_betting_trends.py"; then
    log "Betting trends calculated"
else
    log "⚠️  Trend calculation failed - continuing with pipeline"
fi

# Step 5: Run value analysis for today's games
log ""
log "STEP 5: Running value analysis for today's games..."
if run_script "$SCRIPT_DIR/analytics/betting_value/analyze_todays_games.py"; then
    log "Value analysis complete"
else
    log "⚠️  Value analysis failed"
fi

# Summary
log ""
log "========================================"
log "DAILY BETTING DATA PIPELINE - COMPLETE"
log "========================================"
log "Log file: $LOG_FILE"

# Query database for pipeline metrics
log ""
log "Pipeline Metrics:"
log "----------------------------------------"

# Count betting lines
BETTING_LINES=$(psql -h localhost -U chapirou -d nba_stats -t -c "SELECT COUNT(*) FROM betting_lines;" 2>/dev/null || echo "N/A")
log "Total betting lines: $BETTING_LINES"

# Count games with lines
GAMES_WITH_LINES=$(psql -h localhost -U chapirou -d nba_stats -t -c "SELECT COUNT(DISTINCT game_id) FROM betting_lines;" 2>/dev/null || echo "N/A")
log "Games with betting lines: $GAMES_WITH_LINES"

# Count today's value analyses
TODAY=$(date +%Y-%m-%d)
VALUE_ANALYSES=$(psql -h localhost -U chapirou -d nba_stats -t -c "SELECT COUNT(*) FROM betting_value_analysis WHERE analysis_date = '$TODAY';" 2>/dev/null || echo "N/A")
log "Today's value analyses: $VALUE_ANALYSES"

# Count betting trends
BETTING_TRENDS=$(psql -h localhost -U chapirou -d nba_stats -t -c "SELECT COUNT(*) FROM betting_trends;" 2>/dev/null || echo "N/A")
log "Active betting trends: $BETTING_TRENDS"

log "========================================"
log "Pipeline execution complete!"
log "========================================"

exit 0
