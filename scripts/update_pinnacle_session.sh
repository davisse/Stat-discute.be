#!/bin/bash
# =============================================================================
# Update Pinnacle Session on Production
# =============================================================================
# This script copies your local pinnacle_session.json to the production ETL container.
#
# Prerequisites:
# 1. Log into ps3838.com in your browser
# 2. Run the session extractor (see below) to create pinnacle_session.json
# 3. Run this script to upload to production
#
# Session lifetime: ~3 hours (you'll need to refresh periodically)
# =============================================================================

set -e

# Configuration (matches deploy.yml secrets)
VPS_HOST="${VPS_HOST:-57.129.74.182}"
VPS_USER="${VPS_USER:-root}"
DEPLOY_PATH="${VPS_DEPLOY_PATH:-/opt/stat-discute}"
LOCAL_SESSION_FILE="${1:-1.DATABASE/etl/betting/pinnacle_session.json}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW} Pinnacle Session Updater${NC}"
echo -e "${YELLOW}========================================${NC}"

# Check if local session file exists
if [ ! -f "$LOCAL_SESSION_FILE" ]; then
    echo -e "${RED}Error: Session file not found: $LOCAL_SESSION_FILE${NC}"
    echo ""
    echo "To create a session file:"
    echo "1. Log into https://www.ps3838.com in your browser"
    echo "2. Open DevTools (F12) > Application > Cookies"
    echo "3. Copy the required cookies (auth, custid, etc.)"
    echo "4. Run: python3 1.DATABASE/etl/betting/extract_session.py"
    echo ""
    exit 1
fi

echo -e "Local session file: ${GREEN}$LOCAL_SESSION_FILE${NC}"
echo -e "Target: ${GREEN}$VPS_USER@$VPS_HOST${NC}"
echo ""

# Check session file validity
SESSION_AGE=$(python3 -c "
import json
from datetime import datetime
with open('$LOCAL_SESSION_FILE') as f:
    data = json.load(f)
    login_time = datetime.fromisoformat(data.get('login_time', '2000-01-01'))
    age_hours = (datetime.now() - login_time).total_seconds() / 3600
    print(f'{age_hours:.1f}')
" 2>/dev/null || echo "unknown")

if [ "$SESSION_AGE" != "unknown" ]; then
    echo -e "Session age: ${YELLOW}${SESSION_AGE} hours${NC}"
    if (( $(echo "$SESSION_AGE > 3" | bc -l) )); then
        echo -e "${RED}Warning: Session may be expired (>3 hours old)${NC}"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

echo ""
echo "Uploading session to production..."

# Copy session file to VPS
scp "$LOCAL_SESSION_FILE" "$VPS_USER@$VPS_HOST:/tmp/pinnacle_session.json"

# Copy into Docker volume
ssh "$VPS_USER@$VPS_HOST" << 'ENDSSH'
    # Get the session volume mount point
    VOLUME_PATH=$(docker volume inspect stat-discute-etl-sessions --format '{{ .Mountpoint }}' 2>/dev/null)

    if [ -z "$VOLUME_PATH" ]; then
        echo "Creating sessions volume..."
        docker volume create stat-discute-etl-sessions
        VOLUME_PATH=$(docker volume inspect stat-discute-etl-sessions --format '{{ .Mountpoint }}')
    fi

    # Copy session file to volume
    cp /tmp/pinnacle_session.json "$VOLUME_PATH/pinnacle_session.json"
    chmod 600 "$VOLUME_PATH/pinnacle_session.json"
    rm /tmp/pinnacle_session.json

    echo "Session file installed at: $VOLUME_PATH/pinnacle_session.json"

    # Verify the file
    if [ -f "$VOLUME_PATH/pinnacle_session.json" ]; then
        echo "✅ Session file verified"
    else
        echo "❌ Error: Session file not found after copy"
        exit 1
    fi
ENDSSH

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} Session Updated Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "The ETL container will use this session for the next ~3 hours."
echo "Cron runs every 10 minutes: */10 * * * *"
echo ""
echo "To check odds logs:"
echo "  ssh $VPS_USER@$VPS_HOST 'docker logs stat-discute-etl --tail 50'"
echo ""
echo "To manually trigger a fetch:"
echo "  ssh $VPS_USER@$VPS_HOST 'docker exec stat-discute-etl python3 /app/etl/betting/fetch_pinnacle_odds.py'"
