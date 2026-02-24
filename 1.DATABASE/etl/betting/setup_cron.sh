#!/bin/bash
#
# Setup script for Pinnacle odds scraper cron job
# Runs every 15 minutes from 9 AM to 11 PM on game days
#

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PYTHON_PATH=$(which python3)
LOG_DIR="/var/log/pinnacle"
LOG_FILE="${LOG_DIR}/pinnacle_scraper.log"

echo "🏀 Pinnacle NBA Odds Scraper - Cron Setup"
echo "=========================================="

# Create log directory if it doesn't exist
if [ ! -d "$LOG_DIR" ]; then
    echo "Creating log directory: $LOG_DIR"
    sudo mkdir -p "$LOG_DIR"
    sudo chown $(whoami) "$LOG_DIR"
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip3 install -r "${SCRIPT_DIR}/requirements.txt"

# Create wrapper script for cron
WRAPPER_SCRIPT="${SCRIPT_DIR}/run_scraper.sh"
cat > "$WRAPPER_SCRIPT" << EOF
#!/bin/bash
# Wrapper script for cron execution

# Load environment variables if .env exists
if [ -f "${SCRIPT_DIR}/.env" ]; then
    export \$(grep -v '^#' ${SCRIPT_DIR}/.env | xargs)
fi

# Set database environment variables
export DATABASE_HOST=\${DATABASE_HOST:-localhost}
export DATABASE_PORT=\${DATABASE_PORT:-5432}
export DATABASE_NAME=\${DATABASE_NAME:-nba_stats}
export DATABASE_USER=\${DATABASE_USER:-chapirou}
export DATABASE_PASSWORD=\${DATABASE_PASSWORD:-}

# Run the scraper
cd "${SCRIPT_DIR}"
${PYTHON_PATH} fetch_pinnacle_odds.py >> "${LOG_FILE}" 2>&1

# Log rotation (keep last 7 days)
find "${LOG_DIR}" -name "*.log" -mtime +7 -delete

# Check if scraper hasn't run successfully in 2 hours
LAST_SUCCESS=\$(grep "✅ Stored" "${LOG_FILE}" | tail -1 | cut -d' ' -f1-2)
if [ ! -z "\$LAST_SUCCESS" ]; then
    LAST_TIMESTAMP=\$(date -j -f "%Y-%m-%d %H:%M:%S" "\$LAST_SUCCESS" +%s 2>/dev/null)
    CURRENT_TIMESTAMP=\$(date +%s)
    DIFF=\$((CURRENT_TIMESTAMP - LAST_TIMESTAMP))

    # Alert if no data for 2 hours (7200 seconds)
    if [ \$DIFF -gt 7200 ]; then
        echo "⚠️ WARNING: No successful data collection in \$((DIFF / 3600)) hours" >> "${LOG_FILE}"
    fi
fi
EOF

chmod +x "$WRAPPER_SCRIPT"
echo "✅ Created wrapper script: $WRAPPER_SCRIPT"

# Add cron job
echo ""
echo "Adding cron job..."
echo ""
echo "The following line will be added to your crontab:"
echo "*/15 9-23 * * * ${WRAPPER_SCRIPT}"
echo ""
read -p "Do you want to add this cron job? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Add to crontab
    (crontab -l 2>/dev/null | grep -v "pinnacle_odds" ; echo "*/15 9-23 * * * ${WRAPPER_SCRIPT}") | crontab -
    echo "✅ Cron job added successfully!"
    echo ""
    echo "To view your cron jobs: crontab -l"
    echo "To remove the cron job: crontab -e (then delete the line)"
else
    echo "❌ Cron job not added."
    echo ""
    echo "To add manually later, run:"
    echo "crontab -e"
    echo "Then add this line:"
    echo "*/15 9-23 * * * ${WRAPPER_SCRIPT}"
fi

echo ""
echo "📊 Monitoring Commands:"
echo "========================"
echo "Watch live logs:         tail -f ${LOG_FILE}"
echo "Check last 100 lines:    tail -100 ${LOG_FILE}"
echo "Search for errors:       grep ERROR ${LOG_FILE}"
echo "Count stored odds:       grep '✅ Stored' ${LOG_FILE} | wc -l"
echo ""

# Test dry run
echo "Testing scraper in dry-run mode..."
echo "=================================="
${PYTHON_PATH} "${SCRIPT_DIR}/fetch_pinnacle_odds.py" --dry-run

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update DATABASE_* environment variables in ${SCRIPT_DIR}/.env"
echo "2. Test with: ${WRAPPER_SCRIPT}"
echo "3. Monitor logs: tail -f ${LOG_FILE}"