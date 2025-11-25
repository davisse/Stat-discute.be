# Admin Dashboard - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN DASHBOARD                          │
│                    http://localhost:3000/admin                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  admin/layout.tsx                        │   │
│  │  ┌──────────────┐  ┌────────────────────────────────┐  │   │
│  │  │  Sidebar     │  │     Main Content Area          │  │   │
│  │  │  (240px)     │  │                                 │  │   │
│  │  │              │  │  ┌──────────────────────────┐  │  │   │
│  │  │  Navigation: │  │  │   admin/page.tsx         │  │  │   │
│  │  │  - Dashboard │  │  │                           │  │  │   │
│  │  │  - Games     │  │  │  Section 1: Stats Cards  │  │  │   │
│  │  │  - Players   │  │  │  ┌────┐┌────┐┌────┐┌────┐ │  │  │   │
│  │  │  - Standings │  │  │  │Card││Card││Card││Card│ │  │  │   │
│  │  │  - Sync      │  │  │  └────┘└────┘└────┘└────┘ │  │  │   │
│  │  │              │  │  │                           │  │  │   │
│  │  └──────────────┘  │  │  Section 2: Tabs         │  │  │   │
│  │                     │  │  ┌───────────────────┐   │  │  │   │
│  │                     │  │  │ Games│Players│... │   │  │  │   │
│  │                     │  │  ├───────────────────┤   │  │  │   │
│  │                     │  │  │   DataTable       │   │  │  │   │
│  │                     │  │  └───────────────────┘   │  │  │   │
│  │                     │  │                           │  │  │   │
│  │                     │  │  Section 3: Sync Actions │  │  │   │
│  │                     │  │  ┌────────┐┌────────┐    │  │  │   │
│  │                     │  │  │ Button ││ Button │    │  │  │   │
│  │                     │  │  └────────┘└────────┘    │  │  │   │
│  │                     │  │                           │  │  │   │
│  │                     │  │  Section 4: Sync Logs    │  │  │   │
│  │                     │  │  ┌───────────────────┐   │  │  │   │
│  │                     │  │  │   DataTable       │   │  │  │   │
│  │                     │  │  └───────────────────┘   │  │  │   │
│  │                     │  └──────────────────────────┘  │  │   │
│  │                     └────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        COMPONENTS LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │ StatsCard  │  │ DataTable  │  │SyncButton  │  │   Tabs     ││
│  │            │  │            │  │ (Client)   │  │ (Client)   ││
│  │ - title    │  │ - columns  │  │            │  │            ││
│  │ - value    │  │ - data     │  │ - loading  │  │ - switch   ││
│  │ - subtitle │  │ - hover    │  │ - success  │  │ - content  ││
│  │            │  │ - empty    │  │ - error    │  │            ││
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  GET ROUTES                           POST ROUTES                │
│  ┌────────────────────────┐          ┌────────────────────────┐ │
│  │ /api/admin/stats       │          │ /api/admin/sync-games  │ │
│  │ /api/admin/games       │          │ /api/admin/fetch-...   │ │
│  │ /api/admin/players     │          │ /api/admin/calculate-..│ │
│  │ /api/admin/standings   │          │                        │ │
│  │                        │          │ Execute Python:        │ │
│  │ Return JSON data       │          │ - spawn('python3')     │ │
│  │                        │          │ - insertSyncLog()      │ │
│  └────────────────────────┘          └────────────────────────┘ │
│              ▼                                    ▼               │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       QUERIES LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                     lib/queries.ts                               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ getAdminStats()         - Global statistics             │   │
│  │ getGamesWithStats()     - Games with stats count        │   │
│  │ getTopPlayers()         - Top scorers                   │   │
│  │ getSyncLogs()           - Recent sync logs              │   │
│  │ insertSyncLog()         - Log ETL operations            │   │
│  └─────────────────────────────────────────────────────────┘   │
│              ▼                                                    │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                    PostgreSQL 18                                 │
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │   games    │  │  players   │  │   teams    │  │sync_logs │ │
│  │            │  │            │  │            │  │          │ │
│  │ game_id    │  │ player_id  │  │ team_id    │  │ log_id   │ │
│  │ season     │  │ full_name  │  │ full_name  │  │ action   │ │
│  │ scores     │  │            │  │ abbr       │  │ status   │ │
│  │            │  │            │  │            │  │ duration │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
│        │               │                │               │       │
│  ┌────────────────────────────────────────────────────────┐   │
│  │         player_game_stats (box scores)                  │   │
│  │         - points, rebounds, assists, etc.               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ETL LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│                   Python Scripts                                 │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ sync_season_2025_26.py                                  │    │
│  │ - Fetch games from NBA.com API                          │    │
│  │ - Insert into games table                               │    │
│  └────────────────────────────────────────────────────────┘    │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ fetch_player_stats_direct.py                            │    │
│  │ - Fetch box scores for each game                        │    │
│  │ - Insert into player_game_stats                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ analytics/run_all_analytics.py                          │    │
│  │ - Calculate averages                                    │    │
│  │ - Update standings                                      │    │
│  │ - Compute advanced stats                                │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow - Sync Operations

```
User Click "Sync Games"
        │
        ▼
SyncButton (Client Component)
        │
        ├─ Show confirmation dialog
        ├─ Set loading state
        │
        ▼
POST /api/admin/sync-games
        │
        ├─ spawn('python3 sync_season_2025_26.py')
        ├─ Capture stdout/stderr
        ├─ Wait for process.on('close')
        │
        ▼
Python ETL Script
        │
        ├─ Fetch from NBA.com API
        ├─ Parse JSON response
        ├─ Insert into games table
        │
        ▼
Database Update
        │
        ├─ games table updated
        ├─ sync_logs table updated
        │
        ▼
API Response
        │
        ├─ { success, message, duration, output }
        │
        ▼
SyncButton Update
        │
        ├─ Show success/error message
        ├─ Call onSuccess() → reload page
        │
        ▼
Dashboard Refresh
        │
        └─ Stats Cards updated
           Tabs data refreshed
           Sync Logs shows new entry
```

## Component Hierarchy

```
admin/layout.tsx
└── admin/page.tsx (Server Component)
    ├── Section 1: Stats Cards Grid
    │   ├── StatsCard (Total Games)
    │   ├── StatsCard (Player Stats)
    │   ├── StatsCard (Unique Players)
    │   └── StatsCard (Last Update)
    │
    ├── Section 2: Tabs (Client Component)
    │   ├── Tab: Games
    │   │   └── DataTable (games data)
    │   ├── Tab: Players
    │   │   └── DataTable (players data)
    │   └── Tab: Standings
    │       └── DataTable (standings data)
    │
    ├── Section 3: Sync Actions Grid
    │   ├── SyncButton (Sync Games)
    │   ├── SyncButton (Fetch Player Stats)
    │   └── SyncButton (Calculate Analytics)
    │
    └── Section 4: Sync Logs
        └── DataTable (logs data)
```

## Technology Stack

```
┌─────────────────────────┐
│   Frontend Framework    │
│      Next.js 16         │
│      React 19           │
│   Server Components     │
└─────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│    Styling System       │
│   Tailwind CSS v4       │
│  Skeleton Theme (oklch) │
│   Inline styles (CSS)   │
└─────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│   Database Driver       │
│      node-postgres      │
│    Connection Pool      │
└─────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│      Database           │
│    PostgreSQL 18        │
│    28 tables            │
│   155+ indexes          │
└─────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│     ETL Pipeline        │
│   Python 3 scripts      │
│   NBA.com API           │
│   requests library      │
└─────────────────────────┘
```

## File Structure

```
stat-discute.be/
├── 1.DATABASE/
│   └── migrations/
│       └── 008_sync_logs.sql ✅
│
├── frontend/
│   └── src/
│       ├── lib/
│       │   └── queries.ts (+ 5 functions) ✅
│       │
│       └── app/
│           ├── api/admin/ ✅
│           │   ├── stats/route.ts
│           │   ├── games/route.ts
│           │   ├── players/route.ts
│           │   ├── standings/route.ts
│           │   ├── sync-games/route.ts
│           │   ├── fetch-player-stats/route.ts
│           │   └── calculate-analytics/route.ts
│           │
│           └── admin/ ✅
│               ├── layout.tsx
│               ├── page.tsx
│               ├── README.md
│               └── components/
│                   ├── StatsCard.tsx
│                   ├── DataTable.tsx
│                   ├── SyncButton.tsx
│                   └── Tabs.tsx
│
├── 3.ACTIVE_PLANS/
│   └── admin_dashboard_validation.md ✅
│
└── claudedocs/
    ├── admin_dashboard_implementation.md ✅
    ├── admin_dashboard_summary.md ✅
    ├── admin_architecture_diagram.md ✅
    └── admin_files_created.txt ✅
```
