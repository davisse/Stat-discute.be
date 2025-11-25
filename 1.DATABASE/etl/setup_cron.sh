#!/bin/bash
# Cron Job Setup Helper for Daily Betting Pipeline
# Purpose: Install cron job for automated daily data collection

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIPELINE_SCRIPT="$SCRIPT_DIR/daily_betting_pipeline.sh"

echo "========================================"
echo "Daily Betting Pipeline - Cron Setup"
echo "========================================"
echo ""

# Check if pipeline script exists
if [ ! -f "$PIPELINE_SCRIPT" ]; then
    echo "❌ ERROR: Pipeline script not found at $PIPELINE_SCRIPT"
    exit 1
fi

# Check if script is executable
if [ ! -x "$PIPELINE_SCRIPT" ]; then
    echo "⚠️  Making pipeline script executable..."
    chmod +x "$PIPELINE_SCRIPT"
fi

echo "Pipeline script: $PIPELINE_SCRIPT"
echo ""

# Proposed cron schedule
echo "Proposed cron schedule:"
echo "  Time: 10:00 AM ET daily"
echo "  Frequency: Once per day"
echo "  Rationale: Runs before most NBA games start (typically 7:00 PM ET)"
echo ""

# Cron line (10:00 AM ET = 14:00 UTC in winter, 15:00 UTC in summer)
# Using 14:00 UTC for Eastern Standard Time
CRON_LINE="0 14 * * * $PIPELINE_SCRIPT >> $SCRIPT_DIR/logs/cron_output.log 2>&1"

echo "Cron line to add:"
echo "  $CRON_LINE"
echo ""

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -q "daily_betting_pipeline.sh"; then
    echo "⚠️  Cron job already exists!"
    echo ""
    echo "Current cron jobs containing 'daily_betting_pipeline.sh':"
    crontab -l 2>/dev/null | grep "daily_betting_pipeline.sh" || true
    echo ""
    echo "To remove existing cron job:"
    echo "  crontab -e"
    echo "  (then delete the line containing daily_betting_pipeline.sh)"
    echo ""
    read -p "Do you want to replace the existing cron job? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi

    # Remove existing cron job
    crontab -l 2>/dev/null | grep -v "daily_betting_pipeline.sh" | crontab -
    echo "✅ Removed existing cron job"
fi

# Add cron job
echo ""
read -p "Install cron job for daily execution at 10:00 AM ET? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Add to crontab
    (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
    echo "✅ Cron job installed successfully!"
    echo ""
    echo "Verify installation:"
    echo "  crontab -l | grep daily_betting_pipeline"
    echo ""
    echo "View logs:"
    echo "  tail -f $SCRIPT_DIR/logs/cron_output.log"
    echo "  ls -lh $SCRIPT_DIR/logs/daily_pipeline_*.log"
    echo ""
    echo "Manual execution (for testing):"
    echo "  $PIPELINE_SCRIPT"
else
    echo "Setup cancelled."
    echo ""
    echo "To manually add later, run:"
    echo "  crontab -e"
    echo "Then add this line:"
    echo "  $CRON_LINE"
fi

echo ""
echo "========================================"
echo "Setup complete!"
echo "========================================"
