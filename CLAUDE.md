# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Stat Discute** is an NBA statistics and betting analytics platform built with PostgreSQL, Next.js, and Python ETL pipelines.

### Architecture Components
1. **PostgreSQL 18 Database** (`1.DATABASE/`) - 28 normalized tables with 155+ indexes
2. **Next.js 16 Frontend** (`frontend/`) - React 19 dashboard with Server Components and Tailwind v4
3. **Python ETL Pipeline** (`1.DATABASE/etl/`) - NBA.com data collection and analytics
4. **Docker Deployment** (`docker/`) - PostgreSQL + Next.js + ETL containerized stack
5. **Legacy Flask API** (`nba-schedule-api/`) - Being phased out, not for new development

**Current Season**: 2025-26 (auto-detected from database)
**Production URL**: https://stats.defendini.be (Traefik reverse proxy with Let's Encrypt)

## Slash Commands (Claude Code)

| Command | Description |
|---------|-------------|
| `/sync` | Full ETL pipeline: games → player stats → analytics |
| `/sync --games-only` | Only sync games, skip player stats and analytics |
| `/sync --analytics-only` | Only run analytics (assumes data already synced) |
| `/odds` | Fetch Pinnacle betting odds and show summary |
| `/odds --summary` | Show current odds without fetching new data |
| `/run-dev` | Start Next.js dev server at localhost:3000 |

## Common Commands

### Frontend Development
```bash
cd frontend
npm run dev        # Dev server at http://localhost:3000
npm run build      # Production build (checks TypeScript types)
npm run start      # Production server
npm run lint       # ESLint with Next.js config
```

### Database Operations
```bash
# Connect to database
psql nba_stats

# Run core migrations (execute in order)
cd 1.DATABASE
psql nba_stats < migrations/001_poc_minimal.sql
psql nba_stats < migrations/002_fix_integer_types.sql
psql nba_stats < migrations/003_advanced_reference_tables.sql
psql nba_stats < migrations/004_advanced_game_stats.sql
psql nba_stats < migrations/005_betting_intelligence.sql
psql nba_stats < migrations/006_analytics_system_operations.sql
psql nba_stats < migrations/007_indexes_constraints.sql
psql nba_stats < migrations/008_authentication_system.sql   # Users, sessions, login_attempts
psql nba_stats < migrations/016_seed_demo_users.sql         # Demo accounts

# Quick health checks
psql nba_stats -c "SELECT season_id, is_current FROM seasons WHERE is_current=true"
psql nba_stats -c "SELECT COUNT(*) FROM games WHERE season='2025-26'"
psql nba_stats -c "SELECT COUNT(*) FROM player_game_stats pgs JOIN games g ON pgs.game_id = g.game_id WHERE g.season='2025-26'"
```

### ETL Pipeline (Data Collection)
```bash
# Set current season (run once per season)
python3 1.DATABASE/etl/reference_data/sync_seasons_2025_26.py

# Daily data collection workflow
python3 1.DATABASE/etl/sync_season_2025_26.py              # Fetch games for current season
python3 1.DATABASE/etl/fetch_player_stats_direct.py       # Fetch player box scores
python3 1.DATABASE/etl/analytics/run_all_analytics.py     # Calculate derived stats

# Individual analytics (if needed separately)
python3 1.DATABASE/etl/analytics/calculate_team_stats.py
python3 1.DATABASE/etl/analytics/calculate_advanced_stats.py
python3 1.DATABASE/etl/analytics/calculate_standings.py
```

### NBA API Headers (Critical)
When creating new ETL scripts that fetch from NBA.com Stats API, these headers are **required**:
```python
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Accept': '*/*'
}
```
Without these headers, NBA API returns 403 Forbidden. See `1.DATABASE/etl/fetch_player_stats_direct.py:35-47` for reference.

### Docker Deployment (Production)
```bash
# Deploy to production (from project root)
cd docker
docker compose up -d --build

# View logs
docker compose logs -f frontend

# Rebuild after changes
docker compose build --no-cache
docker compose up -d
```

**Production URL**: https://stats.defendini.be (via Traefik reverse proxy)

## Architecture

### Database Schema (PostgreSQL 18)

**Core Tables** (28 total):
```
teams              - 30 NBA franchises (team_id BIGINT)
players            - Active/historical players (player_id BIGINT)
games              - Game schedule and scores (game_id VARCHAR(10), season VARCHAR(7))
player_game_stats  - Box scores per player per game
team_game_stats    - Team-level box scores
seasons            - Season management (is_current flag)
```

**Betting Intelligence Tables**:
```
betting_events     - Game betting markets
betting_lines      - Spread/moneyline/totals
betting_odds       - Odds history and movements
betting_trends     - ATS/Over-Under trends
```

**Analytics Tables**:
```
player_advanced_stats - eFG%, TS%, Usage%, etc.
team_standings        - Win/loss records, streaks
ats_performance       - Against the spread stats
game_predictions      - ML model predictions
```

**Authentication Tables** (migration 008):
```
users              - User accounts (Argon2id password hashes)
user_sessions      - Active sessions with device fingerprinting
login_attempts     - Rate limiting and security audit log
```

**Team Analysis Table** (migration 017):
```
team_analysis      - Daily generated French narrative analysis per team
  - analysis_data JSONB     - Structured data for analysis generation
  - analysis_html TEXT      - Pre-rendered French narrative
  - data_as_of DATE         - Prevents duplicate daily runs
```

**Critical Database Rules**:
1. **Season Filtering**: ALL queries joining `games` must filter by `season` column
2. **Type Casting**: PostgreSQL `ROUND()` returns `numeric` type → node-postgres sees it as string → use `parseFloat()` before `.toFixed()` in TypeScript
3. **ID Types**: `team_id` and `player_id` are BIGINT, `game_id` is VARCHAR(10)
4. **Indexes**: 155+ indexes optimize common query patterns (see migration 007)

### Frontend Stack (Next.js 16 + React 19.2 + Tailwind v4)

**React 19.2 Features in Use**:
- Server Components (default for all pages)
- Concurrent rendering features
- Framer Motion integration for animations

**Next.js 16 Features**:
- App Router with route groups (e.g., `(dashboard)/`)
- Turbopack for fast development builds
- Server Actions via `'use server'` directive

**Data Flow**:
```
PostgreSQL → lib/db.ts (pg pool) → lib/queries.ts → Server Components → Client UI
```

**Directory Structure**:
```
frontend/src/
├── app/                    # 37+ pages organized by feature
│   ├── (dashboard)/        # Dashboard layout group
│   │   ├── players/        # Player stats pages
│   │   ├── teams/          # Team standings + team detail pages
│   │   └── betting/        # Betting analytics pages
│   ├── admin/              # Admin dashboard (Server Component)
│   ├── api/                # API route handlers
│   ├── analysis/           # H2H, quarters, dispersion, pace analysis
│   ├── betting/            # Odds terminal, value finder, totals
│   ├── player-props/       # Player props analysis
│   ├── prototype/          # Prototype pages (storytelling)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── globals.css         # Tailwind v4 imports
├── components/
│   ├── layout/             # Layout components
│   │   ├── AppLayout.tsx   # Main app layout wrapper
│   │   └── index.ts        # Layout exports
│   ├── teams/              # Team visualization components
│   │   ├── DvP*.tsx        # Defense vs Position system
│   │   ├── TeamAnalysis.tsx # French narrative analysis
│   │   ├── TeamQuadrantChart.tsx
│   │   ├── TeamPresenceCalendar.tsx
│   │   └── TeamRankingDualChart.tsx
│   └── ui/                 # UI component library
└── lib/
    ├── db.ts              # PostgreSQL connection pool
    ├── queries.ts         # All database query functions
    ├── design-tokens.ts   # Design system tokens
    ├── team-colors.ts     # NBA team color mappings
    └── utils.ts           # Utility functions
```

**Key Patterns**:
- **Server Components by default**: Use React Server Components for data fetching
- **AppLayout Wrapper**: All pages use `<AppLayout>` for consistent header, navigation, and background
- **Client/Server Composition**: Client Component (AppLayout) can wrap Server Component content via children prop
- **Environment Variables**: Database config in `.env.local` (not committed)
- **Query Pattern**: All queries use parameterized statements for security
- **Season Filtering**: Every query joining `games` must filter by current season

**AppLayout Component Usage**:
```tsx
// Server Component (async with data fetching)
export default async function MyPage() {
  const data = await fetchData() // Server-side async

  return (
    <AppLayout>
      <div>{/* Your page content */}</div>
    </AppLayout>
  )
}

// Client Component
'use client'
export default function MyClientPage() {
  return (
    <AppLayout>
      <div>{/* Your interactive content */}</div>
    </AppLayout>
  )
}
```

**Tailwind v4 Breaking Changes**:
- Import: `@import "tailwindcss"` (not `@tailwind base/components/utilities`)
- PostCSS: Uses `@tailwindcss/postcss` v4 plugin
- CSS Variables: Don't auto-generate utility classes → use inline styles for dynamic colors
- Example: `style={{backgroundColor: 'oklch(96% 0 0)'}}` instead of custom utility class

### Design System

**Brand Identity**:
- **Background**: Pure black (#000000) with 15% opacity white dots (30px grid)
- **Logo**: Fixed at top center (256px width, 64px height)
- **Navigation**: Horizontal nav with white/gray states
- **Typography**: Inter for UI, JetBrains Mono for data/stats
- **Spacing**: 8px grid system
- **Border Radius**: 8px, 12px, 16px, 24px scale

**Design Token Files**:
- `frontend/src/lib/design-tokens.ts` - TypeScript design tokens
- `frontend/src/app/globals.css` - CSS custom properties

**Chart Components**:
- Y-axis positioning: Use absolute positioning with percentage-based `bottom` values calculated from data scale
- Gridlines: Position at exact Y-axis label values, not evenly spaced
- Bar heights: Calculate as `((value - minValue) / range) * 100` for proportional alignment with Y-axis

### Authentication System

**Security Stack**:
| Component | Technology | Notes |
|-----------|------------|-------|
| Password Hashing | Argon2id | OWASP 2025 recommended, 300x GPU-resistant vs bcrypt |
| JWT Tokens | EdDSA (Ed25519) | Via `jose` library, compact signatures |
| Rate Limiting | IP + Account based | 10/IP, 5/account per 15 minutes |
| Session Management | PostgreSQL | Device fingerprinting, refresh tokens |

**Key Files**:
```
frontend/src/lib/auth/
├── jwt.ts           # JWT generation/verification + normalizeKey()
├── password.ts      # Argon2id hashing configuration
└── rate-limit.ts    # IP and account rate limiting

frontend/src/app/api/auth/
├── login/route.ts   # POST /api/auth/login endpoint
├── logout/route.ts  # POST /api/auth/logout endpoint
└── signup/route.ts  # POST /api/auth/signup endpoint
```

**Rate Limiting Configuration** (`rate-limit.ts`):
```typescript
const RATE_LIMIT_CONFIG = {
  maxAttemptsPerIp: 10,        // 10 attempts per 15 minutes
  ipWindowMinutes: 15,
  maxAttemptsPerAccount: 5,    // 5 attempts per 15 minutes
  accountWindowMinutes: 15,
  lockoutDurationMinutes: 30,  // Account lockout after threshold
  lockoutThreshold: 5,
}
```

**Demo Accounts** (seeded by migration 016):
```
Admin: admin@stat-discute.be / Admin123!
User:  demo@stat-discute.be / Demo123!
```

**CRITICAL: JWT Keys in Docker** (`.env` format):
```bash
# ✅ CORRECT: Escaped newlines as literal \n strings
JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMC4CAQAw...\n-----END PRIVATE KEY-----
JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nMCowBQYD...\n-----END PUBLIC KEY-----

# ❌ WRONG: Real newlines (breaks in Docker Compose)
JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MC4CAQAw...
-----END PRIVATE KEY-----
```

The `normalizeKey()` function in `jwt.ts` converts `\n` strings to real newlines at runtime:
```typescript
function normalizeKey(pem: string): string {
  return pem.replace(/\\n/g, '\n')
}
```

**Generate New JWT Keys**:
```bash
# Generate EdDSA key pair
openssl genpkey -algorithm ed25519 -out private.pem
openssl pkey -in private.pem -pubout -out public.pem

# Convert to single-line with escaped newlines for .env
cat private.pem | tr '\n' '\\' | sed 's/\\/\\n/g' | sed 's/\\n$//'
cat public.pem | tr '\n' '\\' | sed 's/\\/\\n/g' | sed 's/\\n$//'
```

### Season-Aware Query Pattern (Required)
**Every query must filter by current season** to avoid mixing data from multiple years:

```typescript
// CORRECT: Season-aware query
export async function getPlayersWithStats() {
  const currentSeason = await getCurrentSeason()  // Gets '2025-26' from seasons table
  const result = await query(`
    SELECT p.player_id, p.full_name, AVG(pgs.points) as points_avg
    FROM players p
    JOIN player_game_stats pgs ON p.player_id = pgs.player_id
    JOIN games g ON pgs.game_id = g.game_id
    WHERE g.season = $1  -- CRITICAL: Filter by season
    GROUP BY p.player_id, p.full_name
  `, [currentSeason])
  return result.rows
}

// WRONG: Missing season filter (returns mixed multi-year data)
export async function getBadQuery() {
  const result = await query(`
    SELECT * FROM player_game_stats pgs
    JOIN games g ON pgs.game_id = g.game_id  -- Missing WHERE g.season = ?
  `)
  return result.rows  // ❌ Returns data from ALL seasons
}
```

**Why This Matters**:
- Database contains historical data from multiple seasons
- Without season filtering, averages mix current and past seasons
- Frontend assumes all data is from current season

## Basketball Analytics

### Four Factors (Dean Oliver)
1. **Shooting (40%)**: eFG% = (FGM + 0.5 * 3PM) / FGA
2. **Turnovers (25%)**: TOV% = TOV / (FGA + 0.44 * FTA + TOV)
3. **Rebounding (20%)**: OREB% = OREB / (OREB + Opp DREB)
4. **Free Throws (15%)**: FT Rate = FT / FGA

### Advanced Metrics
- **True Shooting %**: TS% = PTS / (2 * (FGA + 0.44 * FTA))
- **Possessions**: FGA + 0.44 * FTA - OREB + TOV
- **Pace**: (Possessions / Minutes) * 48
- **Offensive Rating**: (Points / Possessions) * 100

## Betting Data Integration (ps3838.com)

Betting odds are scraped from ps3838.com (Pinnacle) and stored in `betting_*` tables.

**Critical JSON Structure** (documented in `4.BETTING/json_structure_mapping.md`):
```javascript
// Correct team order (was incorrectly documented before)
e[3][1] = Home Team Name
e[3][2] = Away Team Name

// Markets by period
e[3][8]["0"]    = Full Game markets (ML, HDP, O/U)
e[3][8]["1"]    = First Half markets
e[3][8]["3"]    = Quarter markets
e[3][8]["4"]    = Other period markets

// Player props for each period
e[3][8][period][1] = Player props array
```

**ETL Scripts**:
- `1.DATABASE/etl/betting/fetch_pinnacle_odds.py` - Fetch odds from Pinnacle
- `1.DATABASE/etl/betting/parsers.py` - Parse JSON structure
- `1.DATABASE/etl/betting/utils.py` - Helper functions

## Development Workflows

### Adding a New Dashboard Page
1. **Create migration** (if new tables needed): `1.DATABASE/migrations/009_your_feature.sql`
2. **Add query function**: `frontend/src/lib/queries.ts` with season filtering
3. **Create page**: `frontend/src/app/your-feature/page.tsx` wrapped with `<AppLayout>`
4. **Add to navigation**: Update `navItems` in `components/layout/AppLayout.tsx` if needed

Example:
```bash
# 1. Create migration
psql nba_stats < 1.DATABASE/migrations/009_new_feature.sql

# 2. Add query to queries.ts with season filtering
# 3. Create page component with AppLayout wrapper
# 4. Test
cd frontend && npm run dev
```

### Daily Data Collection (Automated)
```bash
#!/bin/bash
# Typical daily ETL workflow
cd 1.DATABASE/etl

# 1. Fetch new games and scores
python3 sync_season_2025_26.py

# 2. Fetch player box scores
python3 fetch_player_stats_direct.py

# 3. Calculate analytics
python3 analytics/run_all_analytics.py

# 4. (Optional) Fetch betting odds
python3 betting/fetch_pinnacle_odds.py
```

### Common Issues and Solutions

**ETL Pipeline**:

| Issue | Cause | Solution |
|-------|-------|----------|
| **403 Forbidden from NBA API** | Missing required headers | Use headers from `fetch_player_stats_direct.py:35-47` |
| **Empty player stats** | Wrong season or no games | Check `seasons.is_current` flag and verify games exist |
| **Duplicate key errors** | Re-running script without ON CONFLICT | Add `ON CONFLICT (key) DO UPDATE SET ...` to INSERT statements |
| **Analytics show zero** | Analytics ran before data collection | Run data collection scripts before analytics scripts |
| **Mixed season data** | Missing season filter in query | Add `WHERE g.season = $1` to all queries joining games |

**Frontend Charts**:

| Issue | Cause | Solution |
|-------|-------|----------|
| **Bars don't align with Y-axis** | Y-axis labels evenly spaced with flexbox | Use absolute positioning: `bottom: ${((value - minValue) / range) * 100}%` |
| **Missing bars (height: 0%)** | Value equals minValue in calculation | Add padding to scale range (e.g., `minValue - 10`) instead of forcing minimum bar height |
| **Type errors with numeric values** | PostgreSQL ROUND() returns numeric type | Use `parseFloat()` before `.toFixed()` in TypeScript |

### Database Query Best Practices
```sql
-- ✅ GOOD: Season-filtered, parameterized, limited
SELECT p.full_name, AVG(pgs.points) as ppg
FROM players p
JOIN player_game_stats pgs ON p.player_id = pgs.player_id
JOIN games g ON pgs.game_id = g.game_id
JOIN teams t ON pgs.team_id = t.team_id  -- For abbreviations
WHERE g.season = $1
GROUP BY p.player_id, p.full_name
HAVING COUNT(pgs.game_id) >= 5  -- Minimum games threshold
ORDER BY ppg DESC
LIMIT 100;  -- Prevent huge result sets

-- ❌ BAD: No season filter, no minimum games, unlimited results
SELECT p.full_name, AVG(pgs.points) as ppg
FROM players p
JOIN player_game_stats pgs ON p.player_id = pgs.player_id
GROUP BY p.player_id, p.full_name;
```

## Project Structure

### Key Directories
```
stat-discute.be/
├── .claude/                     # Claude Code configuration
│   └── commands/                # Slash commands (/sync, /odds, /run-dev)
│
├── 1.DATABASE/                  # Database migrations and ETL pipeline
│   ├── migrations/              # SQL migrations (001-017+)
│   ├── etl/                     # Python ETL scripts
│   │   ├── reference_data/      # Season, venue sync scripts
│   │   ├── analytics/           # Stats calculation + team analysis
│   │   └── betting/             # Betting odds collection
│   └── config/                  # Database configuration
│
├── frontend/                    # Next.js 16 application
│   ├── src/
│   │   ├── app/                 # Next.js App Router (37+ pages)
│   │   │   └── api/auth/        # Authentication endpoints
│   │   ├── components/          # React components
│   │   │   ├── layout/          # AppLayout and layout components
│   │   │   ├── teams/           # Team visualization (DvP, Analysis, Charts)
│   │   │   └── ui/              # UI component library
│   │   └── lib/
│   │       ├── auth/            # JWT, password, rate-limiting
│   │       └── db.ts            # PostgreSQL connection pool
│   ├── public/                  # Static assets (logo-v5.png)
│   └── .env.local               # Database + JWT credentials (not committed)
│
├── docker/                      # Docker deployment configuration
│   ├── docker-compose.yml       # PostgreSQL + Frontend + ETL services
│   ├── Dockerfile.frontend      # Multi-stage Next.js build (~150MB)
│   └── Dockerfile.etl           # Python ETL container
│
├── 3.ACTIVE_PLANS/              # Current implementation plans
│   └── 2025_26_season_setup.md  # Current season setup status
│
├── 4.BETTING/                   # Betting documentation
│   └── json_structure_mapping.md # Pinnacle JSON structure reference
│
├── claudedocs/                  # Implementation reports and guides
│   └── production-login-deployment-guide.md  # Authentication deployment docs
│
├── nba-schedule-api/            # ⚠️ LEGACY Flask API (being phased out)
│   └── (do not use for new development)
│
└── README.md                    # Project overview (French)
```

### Critical Files Reference

| File | Purpose | Notes |
|------|---------|-------|
| `frontend/src/lib/queries.ts` | All database query functions | Every query must filter by season |
| `frontend/src/lib/db.ts` | PostgreSQL connection pool | Configured via `.env.local` |
| `frontend/src/lib/auth/jwt.ts` | JWT token generation/verification | Contains critical `normalizeKey()` for Docker |
| `frontend/src/lib/auth/rate-limit.ts` | Login rate limiting | IP (10/15min) + Account (5/15min) limits |
| `frontend/src/lib/team-colors.ts` | NBA team color mappings | Primary/secondary colors per team |
| `frontend/src/components/layout/AppLayout.tsx` | Main app layout wrapper | Logo, nav, dotted background |
| `frontend/src/components/teams/index.ts` | Team component exports | DvP, Analysis, Calendar, Charts |
| `docker/docker-compose.yml` | Production deployment stack | PostgreSQL + Frontend + ETL + Traefik |
| `docker/Dockerfile.frontend` | Multi-stage Next.js build | Final image ~150MB |
| `1.DATABASE/migrations/008_authentication_system.sql` | Auth tables schema | users, sessions, login_attempts |
| `1.DATABASE/migrations/016_seed_demo_users.sql` | Demo account seeding | admin@stat-discute.be, demo@stat-discute.be |
| `1.DATABASE/migrations/017_team_analysis.sql` | Team analysis table | Daily French narrative generation |
| `1.DATABASE/etl/fetch_player_stats_direct.py` | Player box score fetcher | Working NBA API with required headers |
| `1.DATABASE/etl/sync_season_2025_26.py` | Games and scores fetcher | Current season data collection |
| `1.DATABASE/etl/analytics/run_all_analytics.py` | Analytics orchestrator | Runs all analytics scripts in order |
| `1.DATABASE/etl/analytics/generate_team_analysis.py` | Team analysis generator | Creates French narratives per team |
| `.claude/commands/sync.md` | /sync command definition | Full ETL pipeline execution |
| `.claude/commands/odds.md` | /odds command definition | Pinnacle odds fetching |
| `claudedocs/production-login-deployment-guide.md` | Auth deployment guide | JWT Docker config, troubleshooting |
| `4.BETTING/json_structure_mapping.md` | Betting data structure | Corrected Pinnacle JSON mapping v2.0 |

## Environment Configuration

### Frontend (.env.local)
```bash
# PostgreSQL connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nba_stats
DB_USER=chapirou
DB_PASSWORD=

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000

# JWT Authentication (EdDSA Ed25519 keys)
# Use escaped \n for Docker, normalizeKey() converts at runtime
JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMC4CAQAw...\n-----END PRIVATE KEY-----
JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nMCowBQYD...\n-----END PUBLIC KEY-----
```

### ETL (1.DATABASE/config/.env)
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nba_stats
DB_USER=postgres
DB_PASSWORD=
```

**Note**: `.env.local` files are git-ignored. Copy from `.env.example` if it exists.

## Current Status

**Season**: 2025-26 (set as current, auto-detected by frontend)

**Database State**:
- 30+ tables with 155+ indexes
- 17+ migrations available (001-017)
  - Core: 001-008 (schema, auth system)
  - Extended: 009-017 (lineups, betting, team analysis)
- Current season games and player stats loaded
- Analytics and standings calculated

**Frontend State**:
- Next.js 16 + React 19.2 + Tailwind v4
- 37+ pages organized by feature
- Server Components for data fetching
- AppLayout applied across all pages
- Team visualization components (DvP, quadrant, calendar, analysis)
- Full season-aware query integration

**ETL Pipeline**:
- Working NBA API integration with proper headers
- Daily data collection scripts ready
- Analytics scripts operational
- Betting odds collection ready (Pinnacle)

**Known Limitations**:
- Legacy Flask API (`nba-schedule-api/`) not maintained - do not use for new features
- Tailwind v4 CSS variables require inline styles for dynamic colors
- PostgreSQL ROUND() type casting needed in TypeScript (numeric → string)
