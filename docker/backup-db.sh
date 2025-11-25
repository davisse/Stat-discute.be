#!/bin/bash
# =============================================================================
# Stat Discute - Database Backup Script
# =============================================================================
# Creates compressed PostgreSQL backups and manages retention
#
# Usage:
#   ./docker/backup-db.sh              # Create backup
#   ./docker/backup-db.sh --restore    # List available backups
#   ./docker/backup-db.sh --restore <filename>  # Restore specific backup
# =============================================================================

set -e

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$HOME/backups/stat-discute"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
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

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# -----------------------------------------------------------------------------
# Functions
# -----------------------------------------------------------------------------
create_backup() {
    log_info "Creating database backup..."

    # Ensure backup directory exists
    mkdir -p "$BACKUP_DIR"

    BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

    # Create backup using docker exec
    cd "$PROJECT_DIR"
    docker compose -f "$COMPOSE_FILE" exec -T postgres \
        pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

    # Verify backup
    if [ -s "$BACKUP_FILE" ]; then
        SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        log_info "Backup created: $BACKUP_FILE ($SIZE)"
    else
        log_error "Backup file is empty!"
        rm -f "$BACKUP_FILE"
        exit 1
    fi

    # Clean old backups
    log_info "Cleaning backups older than $RETENTION_DAYS days..."
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

    # List remaining backups
    log_info "Current backups:"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || log_warn "No backups found"
}

list_backups() {
    log_info "Available backups in $BACKUP_DIR:"
    echo ""
    if [ -d "$BACKUP_DIR" ]; then
        ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || log_warn "No backups found"
    else
        log_warn "Backup directory does not exist"
    fi
}

restore_backup() {
    local BACKUP_FILE="$1"

    if [ -z "$BACKUP_FILE" ]; then
        log_error "No backup file specified"
        list_backups
        echo ""
        echo "Usage: $0 --restore <backup_file>"
        exit 1
    fi

    # Handle relative path
    if [[ ! "$BACKUP_FILE" = /* ]]; then
        BACKUP_FILE="$BACKUP_DIR/$BACKUP_FILE"
    fi

    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi

    log_warn "This will OVERWRITE the current database!"
    read -p "Are you sure? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        log_info "Restore cancelled"
        exit 0
    fi

    log_info "Restoring from: $BACKUP_FILE"

    cd "$PROJECT_DIR"

    # Drop and recreate database
    docker compose -f "$COMPOSE_FILE" exec -T postgres \
        psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS ${DB_NAME};"

    docker compose -f "$COMPOSE_FILE" exec -T postgres \
        psql -U "$DB_USER" -c "CREATE DATABASE ${DB_NAME};"

    # Restore backup
    gunzip -c "$BACKUP_FILE" | docker compose -f "$COMPOSE_FILE" exec -T postgres \
        psql -U "$DB_USER" "$DB_NAME"

    log_info "Restore completed!"
}

# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------
case "${1:-}" in
    --restore)
        restore_backup "$2"
        ;;
    --list)
        list_backups
        ;;
    *)
        create_backup
        ;;
esac
