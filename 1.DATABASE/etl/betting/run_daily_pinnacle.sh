#!/bin/bash
# Daily Pinnacle Odds Collection
# Runs the Pinnacle ETL pipeline with logging and error handling

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs"
LOG_FILE="${LOG_DIR}/pinnacle_$(date +%Y%m%d_%H%M%S).log"
SESSION_FILE="${PROJECT_ROOT}/pinnacle_session.json"
PYTHON_BIN="/usr/bin/python3"

# Create logs directory if it doesn't exist
mkdir -p "${LOG_DIR}"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

log "============================================================"
log "Starting Pinnacle ETL Pipeline"
log "============================================================"

# Check if session exists and is valid
if [ -f "${SESSION_FILE}" ]; then
    log "Checking session health..."
    ${PYTHON_BIN} "${SCRIPT_DIR}/check_session.py" >> "${LOG_FILE}" 2>&1
    SESSION_STATUS=$?

    if [ ${SESSION_STATUS} -eq 1 ]; then
        log "❌ ERROR: Session expired - manual credential refresh required"
        log "Run: python3 ${SCRIPT_DIR}/update_session.py"
        exit 1
    elif [ ${SESSION_STATUS} -eq 2 ]; then
        log "⚠️  WARNING: Session expiring soon (< 30 minutes remaining)"
        log "Consider refreshing credentials soon"
    else
        log "✅ Session healthy"
    fi
else
    log "❌ ERROR: Session file not found at ${SESSION_FILE}"
    log "Run: python3 ${SCRIPT_DIR}/update_session.py"
    exit 1
fi

# Run the Pinnacle odds fetcher
log "Executing fetch_pinnacle_odds.py..."
${PYTHON_BIN} "${SCRIPT_DIR}/fetch_pinnacle_odds.py" >> "${LOG_FILE}" 2>&1
EXIT_CODE=$?

if [ ${EXIT_CODE} -eq 0 ]; then
    log "✅ Pinnacle ETL completed successfully"

    # Clean up old logs (keep last 30 days)
    find "${LOG_DIR}" -name "pinnacle_*.log" -mtime +30 -delete
else
    log "❌ ERROR: Pinnacle ETL failed with exit code ${EXIT_CODE}"
    log "Check log file: ${LOG_FILE}"

    # Optional: Send notification (uncomment if you want email alerts)
    # echo "Pinnacle ETL failed. Check ${LOG_FILE}" | mail -s "Pinnacle ETL Error" your@email.com

    exit ${EXIT_CODE}
fi

log "============================================================"
log "Pinnacle ETL Pipeline Complete"
log "============================================================"
