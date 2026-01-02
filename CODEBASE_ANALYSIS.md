# Codebase Analysis - Stat Discute

**Date**: 2025-01-23  
**Project**: Stat Discute - NBA Statistics & Betting Analytics Platform  
**Status**: Production-ready with active development

---

## Executive Summary

**Stat Discute** is a comprehensive NBA statistics and betting analytics platform built with a modern tech stack. The platform combines real-time NBA data collection, advanced analytics, and betting intelligence to provide actionable insights for sports betting analysis.

### Key Metrics
- **Database**: PostgreSQL 18 with 28+ tables, 155+ indexes
- **Frontend**: Next.js 16 + React 19 + Tailwind v4
- **Backend**: Python ETL pipeline with NBA.com API integration
- **Current Season**: 2025-26
- **Codebase Size**: ~200+ TypeScript/TSX files, 65+ Python scripts
- **Documentation**: Extensive (49 markdown files in claudedocs/)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                     │
│  - React 19 Server Components                               │
│  - Tailwind v4 Design System                                │
│  - PostgreSQL via node-postgres                             │
│  - Authentication (JWT + Argon2)                            │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│              Database (PostgreSQL 18)                       │
│  - 28 core tables                                           │
│  - 155+ indexes                                              │
│  - Materialized views                                        │
│  - Betting intelligence tables                               │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│            ETL Pipeline (Python)                            │
│  - NBA.com API integration                                  │
│  - Pinnacle odds scraping                                   │
│  - Analytics calculations                                   │
│  - Automated daily sync                                     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 16.0.0 | React framework with App Router |
| **Frontend** | React | 19.2.0 | UI library |
| **Frontend** | Tailwind CSS | 4.x | Styling |
| **Frontend** | TypeScript | 5.x | Type safety |
| **Database** | PostgreSQL | 18 | Primary data store |
| **Backend** | Python | 3.9+ | ETL scripts |
| **Backend** | nba_api | 1.4.1 | NBA.com API wrapper |
| **Auth** | jose | 6.1.2 | JWT handling |
| **Auth** | @node-rs/argon2 | 2.0.2 | Password hashing |
| **Deployment** | Docker | - | Containerization |

---

## Directory Structure

### Core Directories

```
stat-discute.be/
├── 1.DATABASE/              # Database & ETL
│   ├── migrations/           # 21 SQL migration files
│   ├── etl/                  # 65 Python scripts
│   │   ├── analytics/        # Stats calculations
│   │   ├── betting/          # Odds scraping & parsing
│   │   ├── reference_data/   # Teams, players, seasons
│   │   └── schedule/         # Game schedule sync
│   ├── schemas/              # Table definitions
│   ├── queries/              # Production SQL queries
│   └── docs/                 # 16 documentation files
│
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/              # App Router pages
│   │   │   ├── (dashboard)/  # Dashboard routes
│   │   │   ├── admin/        # Admin dashboard
│   │   │   ├── api/          # API route handlers
│   │   │   └── betting/      # Betting pages
│   │   ├── components/       # React components
│   │   │   ├── layout/       # AppLayout, navigation
│   │   │   └── ui/           # UI component library
│   │   └── lib/              # Utilities & queries
│   └── public/               # Static assets
│
├── betting-agent/            # AI Betting Agent (LangGraph)
│   ├── src/                  # 29 Python files
│   ├── scripts/              # 12 utility scripts
│   └── tests/                 # 7 test files
│
├── 3.ACTIVE_PLANS/           # Implementation plans (20 files)
├── 4.BETTING/                # Betting documentation
├── docker/                   # Docker configuration
└── claudedocs/              # Implementation reports (49 files)
```

---

## Database Architecture

### Schema Overview

**28 Core Tables** organized in 7 categories:

1. **Core Reference** (8 tables)
   - `teams`, `players`, `seasons`, `venues`, `coaches`
   - Reference data with minimal changes

2. **Game & Schedule** (5 tables)
   - `games` - Central fact table (game_id VARCHAR(10))
   - `playoffs`, `lineups`, `game_officials`

3. **Performance Stats** (9 tables)
   - `player_game_stats` - Box scores per player
   - `team_game_stats` - Team-level stats
   - `player_advanced_stats` - Advanced metrics
   - `four_factors` - Dean Oliver's four factors

4. **Roster & Availability** (3 tables)
   - `rosters`, `injuries`, `matchup_ratings`

5. **Betting Intelligence** (10 tables)
   - `betting_events`, `betting_lines`, `betting_odds`
   - `betting_trends`, `game_predictions`

6. **Betting Analytics** (4 tables)
   - `ats_performance`, `player_impact_analysis`
   - `over_under_trends`

7. **System Operations** (3 tables)
   - `standings`, `sync_logs`, `api_rate_limits`

### Key Design Patterns

**Season-Aware Queries** (Critical):
- All queries joining `games` must filter by `season` column
- Current season auto-detected from `seasons.is_current` flag
- Prevents mixing data from multiple seasons

**ID Types**:
- `team_id`, `player_id`: BIGINT
- `game_id`: VARCHAR(10)
- All foreign keys properly indexed

**Performance Optimizations**:
- 155+ indexes on common query patterns
- Materialized views for complex aggregations
- Partitioning strategy for large tables (future)

---

## Frontend Architecture

### Next.js App Router Structure

```
frontend/src/app/
├── (dashboard)/              # Dashboard layout group
│   ├── players/              # Player stats pages
│   ├── teams/                # Team standings
│   └── betting/              # Betting analytics
│
├── admin/                    # Admin dashboard
│   ├── components/           # Admin-specific components
│   └── page.tsx              # Main admin page
│
├── api/                      # API route handlers
│   ├── admin/                # Admin endpoints
│   ├── auth/                 # Authentication
│   ├── betting/              # Betting APIs
│   └── players/              # Player data APIs
│
└── layout.tsx                # Root layout
```

### Key Components

**AppLayout** (`components/layout/AppLayout.tsx`):
- Main layout wrapper for all pages
- Fixed logo at top center (256px × 64px)
- Dotted background (15% opacity white dots, 30px grid)
- Horizontal navigation (desktop) + burger menu (mobile)
- Authentication-aware (shows user menu when logged in)

**Design System**:
- **Background**: Pure black (#000000) with white dots
- **Logo**: Fixed positioning, hover effects
- **Typography**: Inter for UI, JetBrains Mono for stats
- **Spacing**: 8px grid system
- **Colors**: Defined in `lib/design-tokens.ts`

### Data Flow

```
PostgreSQL → lib/db.ts (pg pool) → lib/queries.ts → Server Components → Client UI
```

**Query Pattern**:
- All queries use parameterized statements (security)
- Season filtering mandatory for game-related queries
- Type casting: PostgreSQL `ROUND()` returns `numeric` → use `parseFloat()` in TypeScript

---

## ETL Pipeline

### Data Collection Workflow

**Daily Automation**:
```bash
1. sync_season_2025_26.py          # Fetch games for current season
2. fetch_player_stats_direct.py    # Fetch player box scores
3. run_all_analytics.py            # Calculate derived stats
4. fetch_pinnacle_odds.py          # Scrape betting odds (optional)
```

### Key Scripts

**Reference Data**:
- `sync_teams.py` - NBA teams sync
- `sync_seasons_2025_26.py` - Season setup
- `sync_venues.py` - Venue information

**Game Data**:
- `sync_season_2025_26.py` - Schedule sync
- `fetch_player_stats_direct.py` - Box score collection
- `scrape_rotowire_lineups.py` - Lineup data

**Analytics**:
- `calculate_team_stats.py` - Team averages
- `calculate_advanced_stats.py` - Advanced metrics
- `calculate_ats_performance.py` - Against the spread
- `calculate_betting_trends.py` - Betting trends

**Betting**:
- `fetch_pinnacle_odds.py` - Pinnacle odds scraping
- `parsers.py` - JSON structure parsing
- `populate_betting_lines.py` - Database population

### NBA API Integration

**Critical Headers** (Required for all NBA.com requests):
```python
headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0',
    'Referer': 'https://www.nba.com/',
    'Origin': 'https://www.nba.com',
    'Accept': '*/*'
}
```

Without these headers, NBA API returns 403 Forbidden.

---

## Betting Integration

### Pinnacle Odds Scraping

**Source**: ps3838.com (Pinnacle Sports)

**JSON Structure** (documented in `4.BETTING/json_structure_mapping.md`):
```javascript
e[3][1] = Home Team Name
e[3][2] = Away Team Name
e[3][8]["0"] = Full Game markets (ML, HDP, O/U)
e[3][8]["1"] = First Half markets
e[3][8][period][1] = Player props array
```

**Automation**:
- Daily cron job at 2:00 AM
- Session management with auto-refresh
- Error recovery and logging
- Database population with conflict handling

### Betting Analytics

**Tables**:
- `betting_lines` - Current and historical lines
- `betting_odds` - Odds movements
- `betting_trends` - ATS/Over-Under trends
- `ats_performance` - Team performance vs spread

**Features**:
- Value calculation (edge detection)
- Odds movement tracking
- Historical performance analysis
- Player prop analysis

---

## Authentication System

### Implementation

**Technology**:
- JWT tokens (jose library)
- Argon2 password hashing (@node-rs/argon2)
- HTTP-only cookies for session management

**Endpoints**:
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Session validation
- `POST /api/auth/password-reset/request` - Password reset
- `POST /api/auth/password-reset/confirm` - Reset confirmation

**Database**:
- `users` table (migration 008)
- Password reset tokens with expiration
- Session tracking

---

## Betting Agent (AI)

### Architecture

**Framework**: LangGraph (System 2 - Council of Experts)

**Components** (from `betting-agent/ROADMAP.md`):
1. **Supervisor** - Routes requests to experts
2. **Quant Engine** - Edge calculation with Python sandbox
3. **Data Scout** - NBA API wrapper with error recovery
4. **Bull/Bear Debate** - Adversarial analysis
5. **Narrative Researcher** - News/sentiment analysis
6. **Judge** - Synthesis and confidence calibration
7. **Memory System** - SQLite for episodic memory

**Status**: In development (Phase 1-2)

---

## Deployment

### Docker Configuration

**Services** (`docker/docker-compose.yml`):
1. **PostgreSQL** - Database container
2. **Frontend** - Next.js production build
3. **ETL** - Cron-based data collection

**Features**:
- Health checks for all services
- Volume persistence for database
- Network isolation
- Auto-run migrations on first start

### Environment Variables

**Frontend** (`.env.local`):
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nba_stats
DB_USER=chapirou
DB_PASSWORD=
JWT_PRIVATE_KEY=
JWT_PUBLIC_KEY=
```

**ETL** (`1.DATABASE/config/.env`):
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nba_stats
DB_USER=postgres
DB_PASSWORD=
```

---

## Key Features

### Implemented ✅

1. **Admin Dashboard**
   - Data synchronization controls
   - Statistics overview
   - Sync logs tracking
   - Games/Players/Standings tables

2. **Player Statistics**
   - Season averages
   - Game-by-game breakdowns
   - Advanced metrics (eFG%, TS%, Usage%)
   - Positional matchup analysis

3. **Team Statistics**
   - Standings and records
   - Four factors analysis
   - Defensive stats by position
   - Pace and offensive/defensive ratings

4. **Betting Analytics**
   - Odds tracking (Pinnacle)
   - ATS performance
   - Over/Under trends
   - Value calculation
   - Player props analysis

5. **Authentication**
   - User registration/login
   - Password reset
   - Session management
   - Protected routes

### In Development 🚧

1. **Betting Agent** (LangGraph)
   - Phase 1-2: Skeleton & Quant Engine
   - Multi-expert system
   - Memory integration planned

2. **Advanced Analytics**
   - Monte Carlo simulations
   - Head-to-head analysis
   - Player absence impact
   - Rest/fatigue analysis

---

## Code Quality & Patterns

### Strengths ✅

1. **Type Safety**: TypeScript throughout frontend
2. **Season Awareness**: Consistent season filtering
3. **Error Handling**: NBA API headers properly configured
4. **Documentation**: Extensive markdown documentation
5. **Modularity**: Clear separation of concerns
6. **Security**: Parameterized queries, JWT auth

### Areas for Improvement ⚠️

1. **Testing**: Limited test coverage
   - No frontend tests
   - Minimal ETL tests
   - No integration tests

2. **Error Handling**: Inconsistent patterns
   - Some API routes lack try/catch
   - Frontend error boundaries missing

3. **Code Duplication**: Similar patterns across pages
   - Could extract reusable components
   - Query patterns could be abstracted

4. **Performance**: Some optimization opportunities
   - Query result caching
   - Client-side data caching
   - Image optimization

---

## Documentation

### Key Documents

| Document | Purpose | Location |
|----------|---------|----------|
| **CLAUDE.md** | Development guide for AI assistants | Root |
| **README.md** | Project overview (French) | Root |
| **ANALYSE_ARCHITECTURE.md** | Architecture analysis (legacy Vue.js) | Root |
| **CHANGELOG.md** | Feature changelog | Root |
| **Database README** | Database setup guide | `1.DATABASE/README.md` |
| **Implementation Plan** | Database schema guide | `1.DATABASE/IMPLEMENTATION_PLAN.md` |
| **Betting Agent Roadmap** | AI agent development plan | `betting-agent/ROADMAP.md` |

### Implementation Reports

49 markdown files in `claudedocs/` documenting:
- Feature implementations
- Component integrations
- Bug fixes
- Architecture decisions

---

## Known Issues & Limitations

### Technical Debt

1. **Legacy Flask API** (`nba-schedule-api/`)
   - Marked as deprecated
   - Not for new development
   - Should be removed eventually

2. **Tailwind v4 Breaking Changes**
   - CSS variables require inline styles for dynamic colors
   - Migration from v3 patterns ongoing

3. **PostgreSQL Type Casting**
   - `ROUND()` returns `numeric` type
   - Requires `parseFloat()` in TypeScript
   - Documented but could be abstracted

### Missing Features

1. **Testing Infrastructure**
   - No Jest/Vitest setup
   - No E2E tests
   - Limited unit tests

2. **Monitoring & Logging**
   - No centralized logging
   - No error tracking (Sentry, etc.)
   - No performance monitoring

3. **CI/CD Pipeline**
   - No automated testing
   - No deployment automation
   - Manual migration runs

---

## Recommendations

### Immediate (1-2 weeks)

1. **Add Error Boundaries**
   - React error boundaries for frontend
   - Global error handler for API routes

2. **Improve Error Handling**
   - Consistent try/catch patterns
   - User-friendly error messages
   - Error logging

3. **Add Loading States**
   - Skeleton loaders
   - Progress indicators
   - Better UX during data fetching

### Short Term (1 month)

1. **Testing Setup**
   - Jest/Vitest for frontend
   - pytest for ETL scripts
   - Integration test suite

2. **Performance Optimization**
   - Query result caching (Redis)
   - Image optimization (Next.js Image)
   - Code splitting improvements

3. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Database query monitoring

### Long Term (3+ months)

1. **CI/CD Pipeline**
   - Automated testing
   - Deployment automation
   - Migration automation

2. **Scalability**
   - Database partitioning
   - Caching layer (Redis)
   - CDN for static assets

3. **Feature Enhancements**
   - Real-time updates (WebSockets)
   - Mobile app (iOS in progress)
   - Advanced ML predictions

---

## Conclusion

**Stat Discute** is a well-architected, production-ready platform with:

✅ **Strong Foundation**:
- Modern tech stack (Next.js 16, PostgreSQL 18)
- Clean architecture with clear separation
- Comprehensive database schema
- Extensive documentation

✅ **Active Development**:
- Regular feature additions
- Betting agent in development
- Continuous improvements

⚠️ **Areas for Growth**:
- Testing infrastructure
- Monitoring & observability
- Performance optimization
- CI/CD automation

The codebase demonstrates solid engineering practices with room for improvement in testing and operational tooling. The platform is ready for production use with ongoing enhancements planned.

---

**Analysis Date**: 2025-01-23  
**Next Review**: Recommended quarterly  
**Maintainer**: Stat Discute Team

