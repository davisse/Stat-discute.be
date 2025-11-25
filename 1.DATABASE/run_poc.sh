#!/bin/bash
# ==================== 2-Hour POC Execution Script ====================
# This script runs the complete POC workflow
# =====================================================================

set -e  # Exit on error

echo ""
echo "=========================================================================="
echo "🚀 NBA STATISTICS DATABASE - 2-HOUR POC"
echo "=========================================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# ==================== Phase 1: Verify Environment ====================
echo "📋 Phase 1: Verifying environment..."
echo ""

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL not found!${NC}"
    echo ""
    echo "Install PostgreSQL 18 first:"
    echo "  brew install postgresql@18"
    echo "  brew services start postgresql@18"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL found:${NC} $(psql --version | head -1)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Python found:${NC} $(python3 --version)"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw nba_stats; then
    echo -e "${YELLOW}⚠️  Database 'nba_stats' already exists${NC}"
    read -p "Drop and recreate? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        dropdb nba_stats
        echo -e "${GREEN}✅ Database dropped${NC}"
    fi
fi

# Create database if needed
if ! psql -lqt | cut -d \| -f 1 | grep -qw nba_stats; then
    echo "Creating database..."
    createdb nba_stats
    echo -e "${GREEN}✅ Database created${NC}"
fi

echo ""

# ==================== Phase 2: Install Dependencies ====================
echo "=========================================================================="
echo "📦 Phase 2: Installing Python dependencies..."
echo "=========================================================================="
echo ""

pip3 install -q -r requirements.txt
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# ==================== Phase 3: Run Migration ====================
echo "=========================================================================="
echo "🗄️  Phase 3: Running database migration..."
echo "=========================================================================="
echo ""

psql nba_stats < migrations/001_poc_minimal.sql

echo -e "${GREEN}✅ Migration completed${NC}"
echo ""

# ==================== Phase 4: Sync Teams ====================
echo "=========================================================================="
echo "🏀 Phase 4: Syncing NBA teams..."
echo "=========================================================================="
echo ""

python3 etl/sync_teams.py

echo ""

# ==================== Phase 5: Sync Games ====================
echo "=========================================================================="
echo "📅 Phase 5: Syncing today's games..."
echo "=========================================================================="
echo ""

python3 etl/sync_games.py

echo ""

# ==================== Phase 6: Collect Box Scores ====================
echo "=========================================================================="
echo "📊 Phase 6: Collecting recent box scores..."
echo "=========================================================================="
echo ""

python3 etl/collect_box_scores.py 5

echo ""

# ==================== Phase 7: Run Analysis ====================
echo "=========================================================================="
echo "📊 Phase 7: Running analysis query..."
echo "=========================================================================="
echo ""

psql nba_stats < queries/poc_analysis.sql

echo ""

# ==================== Phase 8: Summary ====================
echo "=========================================================================="
echo "✅ 2-HOUR POC COMPLETED SUCCESSFULLY"
echo "=========================================================================="
echo ""
echo "What was accomplished:"
echo "  ✅ PostgreSQL 18 database created"
echo "  ✅ 4 core tables created (teams, players, games, player_game_stats)"
echo "  ✅ 30 NBA teams synced"
echo "  ✅ Today's games synced"
echo "  ✅ Recent box scores collected"
echo "  ✅ Analysis queries executed"
echo ""
echo "Next steps:"
echo "  1. Review the analysis output above"
echo "  2. Run queries manually: psql nba_stats < queries/poc_analysis.sql"
echo "  3. Explore the database: psql nba_stats"
echo "  4. Read IMPLEMENTATION_PLAN.md for full implementation"
echo ""
echo "=========================================================================="
echo ""
