# NBA Statistics Database - Complete Implementation Plan

**Production-ready implementation guide for PostgreSQL 18**

---

## Table of Contents

1. [2-Hour Proof of Concept](#2-hour-proof-of-concept)
2. [PostgreSQL 18 Setup](#postgresql-18-setup)
3. [SQL Migration Templates](#sql-migration-templates)
4. [Python ETL Templates](#python-etl-templates)
5. [Full Implementation Roadmap](#full-implementation-roadmap)
6. [Technology Stack Decisions](#technology-stack-decisions)
7. [Configuration Management](#configuration-management)
8. [Testing Strategy](#testing-strategy)
9. [Production Deployment](#production-deployment)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 2-Hour Proof of Concept

**Goal**: Working database with live NBA data and meaningful queries

### Phase 1: Setup (30 minutes)

#### Install PostgreSQL 18

```bash
# macOS (Homebrew)
brew install postgresql@18
brew services start postgresql@18

# Ubuntu/Debian
sudo apt-get install postgresql-18
sudo systemctl start postgresql

# Verify installation
psql --version  # Should show PostgreSQL 18.x
```

#### Create Database

```bash
# Create database
createdb nba_stats

# Create user (if needed)
createuser nba_admin --createdb --password

# Grant privileges
psql -c "GRANT ALL PRIVILEGES ON DATABASE nba_stats TO nba_admin;"
```

#### Install Python Dependencies

```bash
# Create requirements.txt
cat > requirements.txt << EOF
nba_api==1.4.1
pandas>=2.0.0
psycopg2-binary>=2.9.0
python-dotenv>=1.0.0
sqlalchemy>=2.0.0
EOF

# Install
pip install -r requirements.txt
```

### Phase 2: Minimal Migration (45 minutes)

Create `migrations/001_poc_minimal.sql`:

```sql
-- ==================== POC: 4 Core Tables ====================

-- Table 1: Teams
CREATE TABLE teams (
    team_id INTEGER PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(3) NOT NULL UNIQUE,
    nickname VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50),
    year_founded INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Players
CREATE TABLE players (
    player_id INTEGER PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: Games (simplified)
CREATE TABLE games (
    game_id VARCHAR(10) PRIMARY KEY,
    game_date DATE NOT NULL,
    season VARCHAR(7) NOT NULL,
    home_team_id INTEGER REFERENCES teams(team_id),
    away_team_id INTEGER REFERENCES teams(team_id),
    home_team_score INTEGER,
    away_team_score INTEGER,
    game_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: Player Game Stats (simplified)
CREATE TABLE player_game_stats (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(10) REFERENCES games(game_id),
    player_id INTEGER REFERENCES players(player_id),
    team_id INTEGER REFERENCES teams(team_id),
    minutes INTEGER,
    points INTEGER,
    rebounds INTEGER,
    assists INTEGER,
    fg_made INTEGER,
    fg_attempted INTEGER,
    fg_pct NUMERIC(5,3),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, player_id)
);

-- Indexes for performance
CREATE INDEX idx_games_date ON games(game_date);
CREATE INDEX idx_games_season ON games(season);
CREATE INDEX idx_player_stats_game ON player_game_stats(game_id);
CREATE INDEX idx_player_stats_player ON player_game_stats(player_id);
```

Run migration:

```bash
psql nba_stats < migrations/001_poc_minimal.sql
```

### Phase 3: ETL Scripts (45 minutes)

#### Script 1: Sync Teams

Create `etl/sync_teams.py`:

```python
"""Sync NBA teams to database"""
import os
import psycopg2
from nba_api.stats.static import teams
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )

def sync_teams():
    """Fetch all NBA teams and insert into database"""
    print("🏀 Fetching NBA teams from API...")
    all_teams = teams.get_teams()

    conn = get_db_connection()
    cur = conn.cursor()

    print(f"📊 Found {len(all_teams)} teams")

    for team in all_teams:
        cur.execute("""
            INSERT INTO teams (team_id, full_name, abbreviation, nickname, city, state, year_founded)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (team_id) DO UPDATE
            SET full_name = EXCLUDED.full_name,
                abbreviation = EXCLUDED.abbreviation,
                nickname = EXCLUDED.nickname,
                city = EXCLUDED.city,
                state = EXCLUDED.state,
                year_founded = EXCLUDED.year_founded
        """, (
            team['id'],
            team['full_name'],
            team['abbreviation'],
            team['nickname'],
            team['city'],
            team['state'],
            team['year_founded']
        ))

    conn.commit()
    print("✅ Teams synced successfully!")

    cur.close()
    conn.close()

if __name__ == '__main__':
    sync_teams()
```

#### Script 2: Sync Today's Games

Create `etl/sync_games.py`:

```python
"""Sync today's NBA games"""
import os
import psycopg2
from datetime import datetime
from nba_api.stats.endpoints import scoreboardv2
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )

def sync_todays_games():
    """Fetch today's games and insert into database"""
    today = datetime.now().strftime('%Y-%m-%d')
    print(f"🏀 Fetching games for {today}...")

    scoreboard = scoreboardv2.ScoreboardV2(game_date=today)
    games_df = scoreboard.game_header.get_data_frame()

    if games_df.empty:
        print("⚠️  No games scheduled for today")
        return

    conn = get_db_connection()
    cur = conn.cursor()

    print(f"📊 Found {len(games_df)} games")

    for _, game in games_df.iterrows():
        cur.execute("""
            INSERT INTO games (game_id, game_date, season, home_team_id, away_team_id,
                               home_team_score, away_team_score, game_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (game_id) DO UPDATE
            SET home_team_score = EXCLUDED.home_team_score,
                away_team_score = EXCLUDED.away_team_score,
                game_status = EXCLUDED.game_status
        """, (
            game['GAME_ID'],
            game['GAME_DATE_EST'],
            game['SEASON'],
            game['HOME_TEAM_ID'],
            game['VISITOR_TEAM_ID'],
            game['HOME_TEAM_POINTS'] if game['HOME_TEAM_POINTS'] else None,
            game['VISITOR_TEAM_POINTS'] if game['VISITOR_TEAM_POINTS'] else None,
            game['GAME_STATUS_TEXT']
        ))

    conn.commit()
    print("✅ Games synced successfully!")

    cur.close()
    conn.close()

if __name__ == '__main__':
    sync_todays_games()
```

#### Script 3: Collect Box Scores

Create `etl/collect_box_scores.py`:

```python
"""Collect box scores for completed games"""
import os
import time
import psycopg2
from nba_api.stats.endpoints import boxscoretraditionalv2
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'nba_stats'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', '')
    )

def get_completed_games():
    """Get game IDs for completed games without box scores"""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT DISTINCT g.game_id
        FROM games g
        LEFT JOIN player_game_stats pgs ON g.game_id = pgs.game_id
        WHERE g.game_status = 'Final'
          AND g.game_date >= CURRENT_DATE - INTERVAL '7 days'
          AND pgs.id IS NULL
        LIMIT 5
    """)

    game_ids = [row[0] for row in cur.fetchall()]

    cur.close()
    conn.close()

    return game_ids

def collect_box_score(game_id):
    """Collect box score for a single game"""
    print(f"📊 Collecting box score for game {game_id}...")

    try:
        box_score = boxscoretraditionalv2.BoxScoreTraditionalV2(game_id=game_id)
        player_stats = box_score.player_stats.get_data_frame()

        conn = get_db_connection()
        cur = conn.cursor()

        for _, player in player_stats.iterrows():
            cur.execute("""
                INSERT INTO player_game_stats
                (game_id, player_id, team_id, minutes, points, rebounds, assists,
                 fg_made, fg_attempted, fg_pct)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (game_id, player_id) DO NOTHING
            """, (
                game_id,
                player['PLAYER_ID'],
                player['TEAM_ID'],
                player['MIN'] if player['MIN'] else 0,
                player['PTS'],
                player['REB'],
                player['AST'],
                player['FGM'],
                player['FGA'],
                player['FG_PCT']
            ))

        conn.commit()
        print(f"✅ Box score collected for game {game_id}")

        cur.close()
        conn.close()

        time.sleep(1)  # Rate limiting

    except Exception as e:
        print(f"❌ Error collecting box score for {game_id}: {e}")

def main():
    """Collect box scores for all completed games"""
    game_ids = get_completed_games()

    if not game_ids:
        print("⚠️  No completed games to process")
        return

    print(f"🏀 Found {len(game_ids)} games to process")

    for game_id in game_ids:
        collect_box_score(game_id)

if __name__ == '__main__':
    main()
```

### Phase 4: First Query (15 minutes)

Create `queries/poc_analysis.sql`:

```sql
-- Today's Games with Team Performance
SELECT
    g.game_date,
    ht.full_name AS home_team,
    at.full_name AS away_team,
    g.home_team_score,
    g.away_team_score,
    g.game_status,
    -- Home team recent performance (last 5 games)
    (SELECT ROUND(AVG(points), 1)
     FROM player_game_stats pgs
     WHERE pgs.team_id = g.home_team_id
       AND pgs.game_id IN (
           SELECT game_id FROM games
           WHERE (home_team_id = g.home_team_id OR away_team_id = g.home_team_id)
             AND game_date < g.game_date
             AND game_status = 'Final'
           ORDER BY game_date DESC
           LIMIT 5
       )
    ) AS home_avg_points_l5,
    -- Away team recent performance
    (SELECT ROUND(AVG(points), 1)
     FROM player_game_stats pgs
     WHERE pgs.team_id = g.away_team_id
       AND pgs.game_id IN (
           SELECT game_id FROM games
           WHERE (home_team_id = g.away_team_id OR away_team_id = g.away_team_id)
             AND game_date < g.game_date
             AND game_status = 'Final'
           ORDER BY game_date DESC
           LIMIT 5
       )
    ) AS away_avg_points_l5
FROM games g
JOIN teams ht ON g.home_team_id = ht.team_id
JOIN teams at ON g.away_team_id = at.team_id
WHERE g.game_date = CURRENT_DATE
ORDER BY g.game_date;
```

Run query:

```bash
psql nba_stats < queries/poc_analysis.sql
```

### Phase 5: Verification (15 minutes)

```bash
# Check data
psql nba_stats -c "SELECT COUNT(*) FROM teams;"
psql nba_stats -c "SELECT COUNT(*) FROM games WHERE game_date >= CURRENT_DATE - 7;"
psql nba_stats -c "SELECT COUNT(*) FROM player_game_stats;"

# Run full analysis
psql nba_stats < queries/poc_analysis.sql
```

### POC Success Criteria

✅ Database created with 4 core tables
✅ 30 NBA teams loaded
✅ Today's games synced
✅ Box scores collected for recent games
✅ Meaningful query executed (<100ms)

---

## PostgreSQL 18 Setup

### Installation

#### macOS (Homebrew)

```bash
brew install postgresql@18
brew services start postgresql@18

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@18/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Ubuntu 22.04+

```bash
# Add PostgreSQL repository
sudo apt-get install -y postgresql-common
sudo /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh

# Install PostgreSQL 18
sudo apt-get update
sudo apt-get install -y postgresql-18 postgresql-contrib-18

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Docker

```bash
docker run --name nba-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=nba_stats \
  -p 5432:5432 \
  -v nba-data:/var/lib/postgresql/data \
  -d postgres:18
```

### Configuration

Edit `postgresql.conf`:

```conf
# Memory
shared_buffers = 4GB                # 25% of RAM
effective_cache_size = 12GB         # 75% of RAM
work_mem = 64MB                     # For sorting/aggregation
maintenance_work_mem = 1GB          # For VACUUM, CREATE INDEX

# Query Planning
random_page_cost = 1.1              # For SSD
effective_io_concurrency = 200      # For SSD

# WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9
max_wal_size = 4GB
min_wal_size = 1GB

# Parallel Query
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_worker_processes = 8

# Autovacuum
autovacuum = on
autovacuum_max_workers = 4
autovacuum_naptime = 15s
```

### Database Tuning

```sql
-- Enable timing
\timing on

-- Set search path
SET search_path TO public;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For text search
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Configure query planner
SET random_page_cost = 1.1;
SET effective_io_concurrency = 200;
```

---

## SQL Migration Templates

### Migration Naming Convention

```
migrations/
├── 001_core_reference_tables.sql
├── 002_game_schedule_tables.sql
├── 003_performance_stats_tables.sql
├── 004_roster_availability_tables.sql
├── 005_betting_intelligence_tables.sql
├── 006_betting_analytics_tables.sql
├── 007_system_operations_tables.sql
├── 008_create_indexes.sql
├── 009_create_materialized_views.sql
└── 010_create_functions.sql
```

### Template Structure

```sql
-- ==================== Migration: [Name] ====================
-- Created: [Date]
-- Description: [Purpose]
-- Dependencies: [Previous migrations]
-- ================================================================

-- Begin transaction
BEGIN;

-- Set search path
SET search_path TO public;

-- ==================== Table Creation ====================

CREATE TABLE table_name (
    id SERIAL PRIMARY KEY,
    column1 VARCHAR(100) NOT NULL,
    column2 INTEGER,
    column3 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT check_constraint CHECK (column2 > 0),

    -- Foreign keys
    FOREIGN KEY (column2) REFERENCES other_table(id)
);

-- ==================== Indexes ====================

CREATE INDEX idx_table_column1 ON table_name(column1);
CREATE INDEX idx_table_column2 ON table_name(column2);

-- ==================== Comments ====================

COMMENT ON TABLE table_name IS 'Description of table purpose';
COMMENT ON COLUMN table_name.column1 IS 'Description of column';

-- Commit transaction
COMMIT;

-- ==================== Verification ====================

-- Verify table exists
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE tablename = 'table_name';

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'table_name';
```

### Migration: Core Reference Tables

See `migrations/001_core_reference_tables.sql` (will be created).

Key tables:
- `teams` - NBA franchises with historical data
- `players` - All NBA players (active + historical)
- `seasons` - Season definitions
- `venues` - Arena information
- `coaches` - NBA coaches
- `team_coaches` - Coaching assignments
- `trades_transactions` - Player movements
- `official_stats` - Referee tendencies

### Migration: Performance Stats

Key considerations:
- Partition large tables by season
- Use appropriate data types (NUMERIC for percentages)
- Create partial indexes for common filters
- Add check constraints for data validation

### Migration 009: Starter Position Tracking

**Purpose**: Enable starter vs bench analysis for betting prop accuracy

**Business Context**:
Player performance varies significantly between starting and bench roles. For betting analysis, filtering to starter-only games provides more accurate prop projections. For example:
- LaMelo Ball as starter: 21.2 PPG (175 games)
- LaMelo Ball overall: 19.8 PPG (including 15 bench games early in career)

**Schema Changes**:

```sql
-- Add to player_game_stats table
ALTER TABLE player_game_stats
ADD COLUMN IF NOT EXISTS start_position VARCHAR(5),
ADD COLUMN IF NOT EXISTS is_starter BOOLEAN GENERATED ALWAYS AS (start_position IS NOT NULL) STORED;
```

**Column Definitions**:
- `start_position` - Starting position from NBA API: 'F', 'G', 'C', 'F-C', 'G-F', or NULL for bench
- `is_starter` - Computed column: TRUE if player started, FALSE if bench (auto-generated)

**Indexes**:
```sql
-- Partial index for starter filtering (most common query pattern)
CREATE INDEX idx_player_game_stats_is_starter
ON player_game_stats(is_starter)
WHERE is_starter = TRUE;

-- Partial index for position analysis
CREATE INDEX idx_player_game_stats_start_position
ON player_game_stats(start_position)
WHERE start_position IS NOT NULL;
```

**Data Source**: NBA API `boxscoretraditionalv2` endpoint provides START_POSITION field

**ETL Integration**:
- Script: `etl/enrich_with_starters.py`
- Frequency: Daily (after box scores fetched)
- Validation: Exactly 10 starters per game (5 per team)
- Rate limiting: 0.6s between requests (~100 req/min)

**Query Examples**:

```sql
-- Starter-only season averages
SELECT
    p.full_name,
    COUNT(*) as games_started,
    ROUND(AVG(pgs.points), 1) as ppg,
    ROUND(AVG(pgs.assists), 1) as apg,
    ROUND(AVG(pgs.rebounds), 1) as rpg
FROM player_game_stats pgs
JOIN players p ON pgs.player_id = p.player_id
JOIN games g ON pgs.game_id = g.game_id
WHERE g.season = '2025-26'
  AND pgs.is_starter = TRUE
GROUP BY p.player_id, p.full_name
HAVING COUNT(*) >= 10
ORDER BY ppg DESC
LIMIT 50;

-- Starter vs bench performance split
SELECT
    p.full_name,
    SUM(CASE WHEN pgs.is_starter THEN 1 ELSE 0 END) as games_started,
    ROUND(AVG(CASE WHEN pgs.is_starter THEN pgs.points END), 1) as ppg_starter,
    SUM(CASE WHEN NOT pgs.is_starter THEN 1 ELSE 0 END) as games_bench,
    ROUND(AVG(CASE WHEN NOT pgs.is_starter THEN pgs.points END), 1) as ppg_bench,
    ROUND(AVG(CASE WHEN pgs.is_starter THEN pgs.points END) -
          AVG(CASE WHEN NOT pgs.is_starter THEN pgs.points END), 1) as ppg_diff
FROM player_game_stats pgs
JOIN players p ON pgs.player_id = p.player_id
JOIN games g ON pgs.game_id = g.game_id
WHERE g.season = '2025-26'
GROUP BY p.player_id, p.full_name
HAVING SUM(CASE WHEN pgs.is_starter THEN 1 ELSE 0 END) >= 10
   AND SUM(CASE WHEN NOT pgs.is_starter THEN 1 ELSE 0 END) >= 5
ORDER BY ppg_diff DESC;

-- Track role changes (starter ↔ bench transitions)
SELECT
    p.full_name,
    g.game_date,
    pgs.is_starter,
    LAG(pgs.is_starter) OVER (PARTITION BY pgs.player_id ORDER BY g.game_date) as prev_starter,
    pgs.points,
    pgs.minutes
FROM player_game_stats pgs
JOIN players p ON pgs.player_id = p.player_id
JOIN games g ON pgs.game_id = g.game_id
WHERE g.season = '2025-26'
  AND pgs.player_id = 1630163  -- LaMelo Ball example
ORDER BY g.game_date;
```

**Betting Analytics Use Cases**:
1. **Prop Accuracy**: Filter historical averages to starter-only games for current starters
2. **Role Impact**: Quantify performance drop when player moves to bench (injury, coaching change)
3. **Matchup Analysis**: Compare starter vs bench defensive impact by position
4. **Line Movement**: Detect when bookmakers haven't adjusted for role changes
5. **Lineup Optimization**: Identify which bench players perform better as starters

**Migration File**: `migrations/009_add_starter_info.sql`

---

## Python ETL Templates

### Base ETL Class

Create `etl/lib/base_etl.py`:

```python
"""Base ETL class with common functionality"""
import os
import logging
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class BaseETL:
    """Base class for all ETL scripts"""

    def __init__(self, name: str):
        self.name = name
        self.logger = self._setup_logger()
        self.conn = None
        self.cursor = None

    def _setup_logger(self):
        """Set up logging"""
        logger = logging.getLogger(self.name)
        logger.setLevel(logging.INFO)

        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

        return logger

    def connect(self):
        """Connect to database"""
        try:
            self.conn = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', '5432'),
                database=os.getenv('DB_NAME', 'nba_stats'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', '')
            )
            self.cursor = self.conn.cursor()
            self.logger.info("Database connection established")
        except Exception as e:
            self.logger.error(f"Database connection failed: {e}")
            raise

    def disconnect(self):
        """Disconnect from database"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        self.logger.info("Database connection closed")

    def execute_query(self, query: str, params=None):
        """Execute a single query"""
        try:
            self.cursor.execute(query, params)
            self.conn.commit()
            return self.cursor.rowcount
        except Exception as e:
            self.conn.rollback()
            self.logger.error(f"Query execution failed: {e}")
            raise

    def bulk_insert(self, table: str, columns: list, data: list):
        """Bulk insert data using execute_values"""
        if not data:
            self.logger.warning("No data to insert")
            return 0

        query = f"""
            INSERT INTO {table} ({', '.join(columns)})
            VALUES %s
            ON CONFLICT DO NOTHING
        """

        try:
            execute_values(self.cursor, query, data)
            self.conn.commit()
            self.logger.info(f"Inserted {len(data)} rows into {table}")
            return len(data)
        except Exception as e:
            self.conn.rollback()
            self.logger.error(f"Bulk insert failed: {e}")
            raise

    def log_refresh(self, table_name: str, rows_affected: int, status: str):
        """Log ETL execution to data_refresh_log table"""
        self.execute_query("""
            INSERT INTO data_refresh_log
            (table_name, rows_affected, refresh_status, refresh_duration_seconds)
            VALUES (%s, %s, %s, %s)
        """, (table_name, rows_affected, status, 0))  # Add duration tracking later

    def run(self):
        """Override this method in subclasses"""
        raise NotImplementedError("Subclass must implement run() method")
```

### ETL Script Template

```python
"""Template for ETL scripts"""
from etl.lib.base_etl import BaseETL
from nba_api.stats.endpoints import some_endpoint

class MyETL(BaseETL):
    """ETL for [purpose]"""

    def __init__(self):
        super().__init__(name="my_etl")

    def fetch_data(self):
        """Fetch data from NBA API"""
        self.logger.info("Fetching data from NBA API...")

        # Call NBA API endpoint
        data = some_endpoint.SomeEndpoint()
        df = data.get_data_frames()[0]

        self.logger.info(f"Fetched {len(df)} records")
        return df

    def transform_data(self, df):
        """Transform data for database insertion"""
        self.logger.info("Transforming data...")

        # Transform DataFrame to list of tuples
        data = [
            (row['col1'], row['col2'], row['col3'])
            for _, row in df.iterrows()
        ]

        return data

    def load_data(self, data):
        """Load data into database"""
        self.logger.info("Loading data into database...")

        rows = self.bulk_insert(
            table='my_table',
            columns=['col1', 'col2', 'col3'],
            data=data
        )

        return rows

    def run(self):
        """Execute ETL process"""
        try:
            self.connect()

            # ETL steps
            df = self.fetch_data()
            data = self.transform_data(df)
            rows = self.load_data(data)

            # Log success
            self.log_refresh('my_table', rows, 'success')
            self.logger.info(f"ETL completed successfully: {rows} rows")

        except Exception as e:
            self.logger.error(f"ETL failed: {e}")
            self.log_refresh('my_table', 0, 'failure')
            raise

        finally:
            self.disconnect()

if __name__ == '__main__':
    etl = MyETL()
    etl.run()
```

---

## Full Implementation Roadmap

### Week 1-2: MVP Database

**Goal**: Core functionality with live data

**Tasks**:
1. Run migrations 001-003 (core, schedule, stats tables)
2. Implement 5 ETL scripts:
   - `sync_teams.py`
   - `sync_players.py`
   - `sync_schedule.py`
   - `collect_box_scores.py`
   - `collect_advanced_stats.py`
3. Create 3 essential queries:
   - Today's games dashboard
   - Team stats aggregation
   - Player performance report
4. Test with current season data

**Deliverables**:
- ✅ Core database operational
- ✅ Daily schedule synced
- ✅ Box scores collected automatically
- ✅ Basic analytics queries working

### Week 3-4: Advanced Analytics

**Goal**: Four factors, trends, materialized views

**Tasks**:
1. Run migrations 004-005 (analytics tables)
2. Implement analytical ETL:
   - Four factors calculation
   - Team performance trends
   - Head-to-head history
   - Situational stats
3. Create materialized views:
   - `mv_team_current_form`
   - `mv_matchup_probabilities`
4. Performance testing and optimization

**Deliverables**:
- ✅ Advanced metrics calculated
- ✅ Trend analysis available
- ✅ Materialized views refreshing daily
- ✅ Query performance <100ms

### Week 5-6: Betting Intelligence

**Goal**: Betting lines, predictions, ATS tracking

**Tasks**:
1. Run migrations 006-007 (betting tables)
2. Integrate betting lines API (external)
3. Implement betting ETL:
   - Line movement tracking
   - ATS performance calculation
   - O/U trends analysis
4. Build prediction models (basic)
5. Create betting queries (8 queries from docs)

**Deliverables**:
- ✅ Betting lines tracked in real-time
- ✅ ATS/O/U performance calculated
- ✅ Prediction models operational
- ✅ Betting edge signals generated

### Week 7-8: Production Deployment

**Goal**: Automated, monitored, production-ready

**Tasks**:
1. Set up ETL automation (cron/Airflow)
2. Implement monitoring (Prometheus + Grafana)
3. Add data quality checks
4. Load historical data (3-5 seasons)
5. Performance tuning and optimization
6. Documentation and runbooks

**Deliverables**:
- ✅ Fully automated ETL pipeline
- ✅ Real-time monitoring dashboard
- ✅ Historical data loaded
- ✅ Production-ready deployment

---

## Technology Stack Decisions

### Database: PostgreSQL 18

**Why PostgreSQL 18?**
- Latest stable version with performance improvements
- Excellent JSON support for flexible metadata
- BRIN indexes for time-series data (30-40% faster)
- Parallel query execution
- Mature ecosystem and tooling

**Alternatives considered**:
- MySQL: Less advanced analytics features
- MongoDB: Not suitable for relational betting data
- TimescaleDB: Overkill for current scale

### ORM vs Raw SQL

**Decision**: Hybrid approach

**Raw SQL for**:
- Migrations (version control, portability)
- Complex analytical queries
- Performance-critical operations
- Materialized view definitions

**SQLAlchemy for**:
- ETL scripts (easier data mapping)
- CRUD operations
- Application layer queries
- Connection pooling management

### Migration Tool: Raw SQL

**Decision**: Raw SQL with version control

**Why not Alembic?**
- Simple migration needs
- Full control over SQL
- No ORM dependencies
- Easier to review and audit

**Process**:
```bash
# Apply migration
psql nba_stats < migrations/001_core_tables.sql

# Track in version control
git add migrations/001_core_tables.sql
git commit -m "Add core reference tables"
```

### Connection Pooling: PgBouncer

**Configuration** (`pgbouncer.ini`):

```ini
[databases]
nba_stats = host=localhost dbname=nba_stats

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt

pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
reserve_pool_size = 5
reserve_pool_timeout = 3

server_idle_timeout = 600
server_lifetime = 3600
server_connect_timeout = 15
```

### Caching: Redis

**Use cases**:
- API query results (5-15 min TTL)
- Materialized view snapshots
- Betting line snapshots
- Rate limit counters

**Configuration**:

```python
import redis

cache = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

# Cache query result
def get_todays_games():
    cache_key = f"games:today:{date.today()}"

    # Check cache
    cached = cache.get(cache_key)
    if cached:
        return json.loads(cached)

    # Query database
    result = execute_query("SELECT * FROM games WHERE game_date = CURRENT_DATE")

    # Cache for 5 minutes
    cache.setex(cache_key, 300, json.dumps(result))

    return result
```

### ETL Orchestration: Cron (Start) → Airflow (Scale)

**Phase 1 (MVP): Cron**

Simple, reliable, good for MVP:

```bash
# crontab -e

# Daily reference data sync (3 AM)
0 3 * * * /path/to/venv/bin/python /path/to/etl/reference_data/sync_teams.py

# Daily schedule sync (5 AM)
0 5 * * * /path/to/venv/bin/python /path/to/etl/schedule/sync_schedule.py

# Game day: Betting lines (every 15 min during games)
*/15 * * * * /path/to/venv/bin/python /path/to/etl/betting/sync_lines.py

# Post-game: Box scores (every hour)
0 * * * * /path/to/venv/bin/python /path/to/etl/game_data/collect_box_scores.py

# Daily aggregations (2 AM)
0 2 * * * /path/to/venv/bin/python /path/to/etl/analytics/refresh_aggregations.py
```

**Phase 2 (Production): Apache Airflow**

When you need:
- Complex dependencies
- Better monitoring
- Retry logic
- Backfill capabilities

---

## Configuration Management

### Environment Variables

Create `config/.env.example`:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nba_stats
DB_USER=nba_admin
DB_PASSWORD=your_secure_password

# NBA API Configuration
NBA_API_TIMEOUT=30
NBA_API_RETRY_COUNT=3
NBA_API_RATE_LIMIT_DELAY=1

# ETL Configuration
ETL_LOG_LEVEL=INFO
ETL_BATCH_SIZE=100
ETL_CONCURRENT_WORKERS=4

# Caching
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000

# Betting Lines API (if applicable)
BETTING_API_KEY=your_api_key
BETTING_API_URL=https://api.betting.com

# Feature Flags
ENABLE_SHOT_CHARTS=false
ENABLE_PLAY_BY_PLAY=false
ENABLE_BETTING_LINES=true

# Alerts
ALERT_EMAIL=alerts@yourdomain.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Python Configuration

Create `config/database.py`:

```python
"""Database configuration"""
import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class DatabaseConfig:
    host: str
    port: int
    database: str
    user: str
    password: str

    @classmethod
    def from_env(cls):
        return cls(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 5432)),
            database=os.getenv('DB_NAME', 'nba_stats'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', '')
        )

    @property
    def connection_string(self):
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}"

# Global config instance
db_config = DatabaseConfig.from_env()
```

---

## Testing Strategy

### SQL Tests

Create `tests/sql/test_schema.sql`:

```sql
-- Test: Verify all core tables exist
DO $$
DECLARE
    required_tables TEXT[] := ARRAY[
        'teams', 'players', 'games', 'team_game_stats',
        'player_game_stats', 'standings'
    ];
    missing_tables TEXT[];
BEGIN
    SELECT ARRAY_AGG(table_name)
    INTO missing_tables
    FROM unnest(required_tables) AS table_name
    WHERE NOT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = table_name
    );

    IF missing_tables IS NOT NULL THEN
        RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
    END IF;

    RAISE NOTICE 'All required tables exist';
END $$;

-- Test: Verify indexes exist
SELECT
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Test: Verify data integrity
SELECT
    'games' AS table_name,
    COUNT(*) AS total_rows,
    COUNT(*) FILTER (WHERE game_date >= CURRENT_DATE - 30) AS recent_rows
FROM games
UNION ALL
SELECT
    'teams',
    COUNT(*),
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - 30)
FROM teams;
```

### Python Tests

Create `tests/python/test_etl.py`:

```python
"""ETL tests"""
import pytest
from etl.lib.base_etl import BaseETL
from etl.sync_teams import TeamsETL

class TestBaseETL:
    """Test BaseETL class"""

    def test_connection(self):
        """Test database connection"""
        etl = BaseETL("test")
        etl.connect()
        assert etl.conn is not None
        assert etl.cursor is not None
        etl.disconnect()

    def test_execute_query(self):
        """Test query execution"""
        etl = BaseETL("test")
        etl.connect()

        result = etl.execute_query("SELECT 1 AS test")
        assert result > 0

        etl.disconnect()

class TestTeamsETL:
    """Test teams ETL"""

    def test_fetch_teams(self):
        """Test fetching teams from API"""
        etl = TeamsETL()
        teams = etl.fetch_data()

        assert len(teams) == 30
        assert 'team_id' in teams.columns
        assert 'full_name' in teams.columns

    def test_load_teams(self):
        """Test loading teams into database"""
        etl = TeamsETL()
        etl.connect()

        teams = etl.fetch_data()
        data = etl.transform_data(teams)
        rows = etl.load_data(data)

        assert rows == 30

        etl.disconnect()
```

Run tests:

```bash
# SQL tests
psql nba_stats < tests/sql/test_schema.sql

# Python tests
pytest tests/python/ -v
```

---

## Production Deployment

### Docker Deployment

Create `deployment/docker/docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:18
    container_name: nba-postgres
    environment:
      POSTGRES_DB: nba_stats
      POSTGRES_USER: nba_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: nba-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

  pgbouncer:
    image: pgbouncer/pgbouncer
    container_name: nba-pgbouncer
    environment:
      DATABASES_HOST: postgres
      DATABASES_PORT: 5432
      DATABASES_DBNAME: nba_stats
      DATABASES_USER: nba_admin
      DATABASES_PASSWORD: ${DB_PASSWORD}
      PGBOUNCER_POOL_MODE: transaction
      PGBOUNCER_MAX_CLIENT_CONN: 1000
      PGBOUNCER_DEFAULT_POOL_SIZE: 25
    ports:
      - "6432:6432"
    depends_on:
      - postgres
    restart: unless-stopped

  etl-scheduler:
    build: .
    container_name: nba-etl
    environment:
      DB_HOST: pgbouncer
      DB_PORT: 6432
      DB_NAME: nba_stats
      DB_USER: nba_admin
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
    volumes:
      - ./etl:/app/etl
      - ./config:/app/config
    depends_on:
      - postgres
      - redis
      - pgbouncer
    restart: unless-stopped

volumes:
  postgres-data:
  redis-data:
```

Start services:

```bash
docker-compose up -d
```

### Kubernetes Deployment

See `deployment/kubernetes/` for complete manifests.

Key components:
- PostgreSQL StatefulSet with persistent storage
- Redis Deployment
- PgBouncer Deployment
- ETL CronJobs
- ConfigMaps and Secrets

---

## Monitoring & Maintenance

### Prometheus Metrics

Create `monitoring/prometheus/nba_stats_exporter.py`:

```python
"""Prometheus metrics exporter for NBA database"""
from prometheus_client import start_http_server, Gauge, Counter
import psycopg2
import time

# Metrics
db_table_rows = Gauge('nba_db_table_rows', 'Number of rows in table', ['table'])
db_query_duration = Gauge('nba_db_query_duration_seconds', 'Query duration', ['query'])
etl_runs_total = Counter('nba_etl_runs_total', 'Total ETL runs', ['script', 'status'])

def collect_metrics():
    """Collect database metrics"""
    conn = psycopg2.connect("postgresql://localhost/nba_stats")
    cur = conn.cursor()

    # Table row counts
    tables = ['teams', 'games', 'player_game_stats']
    for table in tables:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        count = cur.fetchone()[0]
        db_table_rows.labels(table=table).set(count)

    cur.close()
    conn.close()

if __name__ == '__main__':
    start_http_server(8000)
    while True:
        collect_metrics()
        time.sleep(60)
```

### Grafana Dashboard

Import dashboard from `monitoring/grafana/dashboards/nba_stats.json`.

Key panels:
- Database size and growth
- Query performance
- ETL success rates
- API rate limit usage
- Recent errors and warnings

---

## Next Steps

### Immediate Actions (Today)

1. ✅ Review this implementation plan
2. ⏳ Set up PostgreSQL 18
3. ⏳ Create `.env` file with credentials
4. ⏳ Run 2-hour POC

### Week 1 Priorities

1. Complete MVP migrations
2. Implement core ETL scripts
3. Test with live data
4. Create first reports

### Month 1 Priorities

1. Complete all 42 tables
2. Implement full ETL pipeline
3. Add betting intelligence
4. Deploy to production

### Production Checklist

- [ ] All migrations tested
- [ ] ETL scripts automated
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Documentation complete
- [ ] Performance validated
- [ ] Security audit passed
- [ ] Disaster recovery tested

---

**Version**: 1.0.0
**Last Updated**: 2025-01-23
**Status**: Ready for Implementation
