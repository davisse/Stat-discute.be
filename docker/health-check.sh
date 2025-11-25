#!/bin/bash
# =============================================================================
# Stat Discute - Health Check Script
# =============================================================================
# Checks the health of all services and reports status
#
# Usage:
#   ./docker/health-check.sh
#   ./docker/health-check.sh --json    # Output as JSON
#   ./docker/health-check.sh --quiet   # Exit code only (for monitoring)
# =============================================================================

set -e

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"

# Load environment
if [ -f "$SCRIPT_DIR/.env.production" ]; then
    export $(grep -v '^#' "$SCRIPT_DIR/.env.production" | xargs)
fi

DB_USER="${DB_USER:-nba_admin}"
DB_NAME="${DB_NAME:-nba_stats}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Track overall health
ALL_HEALTHY=true
RESULTS=()

# -----------------------------------------------------------------------------
# Parse arguments
# -----------------------------------------------------------------------------
OUTPUT_JSON=false
QUIET=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --json)
            OUTPUT_JSON=true
            shift
            ;;
        --quiet)
            QUIET=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# -----------------------------------------------------------------------------
# Check functions
# -----------------------------------------------------------------------------
check_service() {
    local name="$1"
    local status="$2"
    local details="$3"

    if [ "$status" = "healthy" ]; then
        RESULTS+=("{\"service\":\"$name\",\"status\":\"healthy\",\"details\":\"$details\"}")
        [ "$QUIET" = false ] && [ "$OUTPUT_JSON" = false ] && echo -e "${GREEN}✅${NC} $name: OK ($details)"
    else
        ALL_HEALTHY=false
        RESULTS+=("{\"service\":\"$name\",\"status\":\"unhealthy\",\"details\":\"$details\"}")
        [ "$QUIET" = false ] && [ "$OUTPUT_JSON" = false ] && echo -e "${RED}❌${NC} $name: FAILED ($details)"
    fi
}

check_warning() {
    local name="$1"
    local details="$2"

    RESULTS+=("{\"service\":\"$name\",\"status\":\"warning\",\"details\":\"$details\"}")
    [ "$QUIET" = false ] && [ "$OUTPUT_JSON" = false ] && echo -e "${YELLOW}⚠️${NC} $name: WARNING ($details)"
}

# -----------------------------------------------------------------------------
# Run checks
# -----------------------------------------------------------------------------
cd "$PROJECT_DIR"

[ "$QUIET" = false ] && [ "$OUTPUT_JSON" = false ] && echo "======================================"
[ "$QUIET" = false ] && [ "$OUTPUT_JSON" = false ] && echo "  Stat Discute Health Check"
[ "$QUIET" = false ] && [ "$OUTPUT_JSON" = false ] && echo "======================================"
[ "$QUIET" = false ] && [ "$OUTPUT_JSON" = false ] && echo ""

# Check Docker daemon
if docker info > /dev/null 2>&1; then
    check_service "Docker" "healthy" "daemon running"
else
    check_service "Docker" "unhealthy" "daemon not running"
fi

# Check PostgreSQL
if docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
    # Get row count for basic data check
    ROW_COUNT=$(docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM games;" 2>/dev/null | tr -d ' ' || echo "0")
    check_service "PostgreSQL" "healthy" "${ROW_COUNT} games in database"
else
    check_service "PostgreSQL" "unhealthy" "not responding"
fi

# Check Frontend
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    check_service "Frontend" "healthy" "HTTP 200"
elif [ "$HTTP_CODE" = "000" ]; then
    check_service "Frontend" "unhealthy" "not responding"
else
    check_service "Frontend" "unhealthy" "HTTP $HTTP_CODE"
fi

# Check ETL container
ETL_STATUS=$(docker compose -f "$COMPOSE_FILE" ps -q etl 2>/dev/null)
if [ -n "$ETL_STATUS" ]; then
    if docker compose -f "$COMPOSE_FILE" exec -T etl pgrep cron > /dev/null 2>&1; then
        check_service "ETL" "healthy" "cron running"
    else
        check_service "ETL" "unhealthy" "cron not running"
    fi
else
    check_service "ETL" "unhealthy" "container not running"
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    check_service "Disk" "healthy" "${DISK_USAGE}% used"
elif [ "$DISK_USAGE" -lt 90 ]; then
    check_warning "Disk" "${DISK_USAGE}% used (getting full)"
else
    check_service "Disk" "unhealthy" "${DISK_USAGE}% used (critical)"
fi

# Check memory
MEM_AVAILABLE=$(free -m | awk 'NR==2 {print $7}')
MEM_TOTAL=$(free -m | awk 'NR==2 {print $2}')
MEM_PERCENT=$((100 - (MEM_AVAILABLE * 100 / MEM_TOTAL)))
if [ "$MEM_PERCENT" -lt 80 ]; then
    check_service "Memory" "healthy" "${MEM_PERCENT}% used (${MEM_AVAILABLE}MB free)"
elif [ "$MEM_PERCENT" -lt 90 ]; then
    check_warning "Memory" "${MEM_PERCENT}% used (${MEM_AVAILABLE}MB free)"
else
    check_service "Memory" "unhealthy" "${MEM_PERCENT}% used (${MEM_AVAILABLE}MB free)"
fi

# -----------------------------------------------------------------------------
# Output results
# -----------------------------------------------------------------------------
[ "$QUIET" = false ] && [ "$OUTPUT_JSON" = false ] && echo ""

if [ "$OUTPUT_JSON" = true ]; then
    # Join results as JSON array
    printf '{"timestamp":"%s","healthy":%s,"checks":[%s]}\n' \
        "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        "$ALL_HEALTHY" \
        "$(IFS=,; echo "${RESULTS[*]}")"
fi

if [ "$ALL_HEALTHY" = true ]; then
    [ "$QUIET" = false ] && [ "$OUTPUT_JSON" = false ] && echo -e "${GREEN}All services healthy!${NC}"
    exit 0
else
    [ "$QUIET" = false ] && [ "$OUTPUT_JSON" = false ] && echo -e "${RED}Some services are unhealthy!${NC}"
    exit 1
fi
