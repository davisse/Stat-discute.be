#!/bin/bash
# =============================================================================
# Stat Discute - Deployment Script
# =============================================================================
# Run this script on the GCP VM to deploy the latest version
#
# Usage:
#   ./docker/deploy.sh
#   ./docker/deploy.sh --no-build  # Skip rebuild, just restart
#   ./docker/deploy.sh --logs      # Deploy and follow logs
# =============================================================================

set -e  # Exit on error

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# -----------------------------------------------------------------------------
# Functions
# -----------------------------------------------------------------------------
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_env_file() {
    if [ ! -f "$SCRIPT_DIR/.env.production" ]; then
        log_error ".env.production not found!"
        log_info "Create it from template:"
        log_info "  cp $SCRIPT_DIR/env.production.template $SCRIPT_DIR/.env.production"
        log_info "  nano $SCRIPT_DIR/.env.production"
        exit 1
    fi
}

# -----------------------------------------------------------------------------
# Parse arguments
# -----------------------------------------------------------------------------
NO_BUILD=false
FOLLOW_LOGS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-build)
            NO_BUILD=true
            shift
            ;;
        --logs)
            FOLLOW_LOGS=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# -----------------------------------------------------------------------------
# Main deployment
# -----------------------------------------------------------------------------
echo "=============================================="
echo "  Stat Discute Deployment"
echo "=============================================="
echo ""

cd "$PROJECT_DIR"

# Check prerequisites
check_env_file

# Pull latest code
log_info "Pulling latest code from git..."
git pull origin main || {
    log_warn "Git pull failed or not a git repo. Continuing..."
}

# Load environment variables
export $(grep -v '^#' "$SCRIPT_DIR/.env.production" | xargs)

# Build containers (unless --no-build)
if [ "$NO_BUILD" = false ]; then
    log_info "Building Docker containers..."
    docker compose -f "$COMPOSE_FILE" build
fi

# Stop and restart services
log_info "Restarting services..."
docker compose -f "$COMPOSE_FILE" down
docker compose -f "$COMPOSE_FILE" up -d

# Wait for services to start
log_info "Waiting for services to be healthy..."
sleep 15

# Check service status
log_info "Checking service status..."
docker compose -f "$COMPOSE_FILE" ps

# Verify frontend is responding
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    log_info "Frontend is responding OK"
else
    log_warn "Frontend may not be ready yet. Check logs."
fi

# Get external IP
EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")

echo ""
echo "=============================================="
log_info "Deployment complete!"
echo "=============================================="
echo ""
echo "  Frontend URL: http://${EXTERNAL_IP}:3000"
echo ""
echo "  Useful commands:"
echo "    View logs:     docker compose -f $COMPOSE_FILE logs -f"
echo "    Stop:          docker compose -f $COMPOSE_FILE down"
echo "    Restart:       docker compose -f $COMPOSE_FILE restart"
echo ""

# Follow logs if requested
if [ "$FOLLOW_LOGS" = true ]; then
    log_info "Following logs (Ctrl+C to exit)..."
    docker compose -f "$COMPOSE_FILE" logs -f
fi
