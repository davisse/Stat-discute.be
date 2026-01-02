# NBA Stats API Documentation

## Overview

This document details all available statistics endpoints and data structures from stats.nba.com, analyzed on 2025-12-20.

The NBA Stats website (nba.com/stats) is built on Next.js and provides comprehensive basketball statistics through multiple data sources.

---

## CDN Endpoints (Public JSON)

These endpoints return JSON data without authentication:

### Live Data Endpoints
```
https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json
https://cdn.nba.com/static/json/liveData/channels/v2/channels_00.json
https://cdn.nba.com/static/json/liveData/odds/odds_todaysGames.json
https://cdn.nba.com/next/on-ramp/nbc/east.json
https://cdn.nba.com/next/on-ramp/nbc/west.json
```

---

## Web Page URL Structure

### Players Stats Pages

| Page | URL | Description |
|------|-----|-------------|
| Traditional | `/stats/players/traditional` | Basic box score stats |
| Advanced | `/stats/players/advanced` | Advanced metrics (eFG%, TS%, etc.) |
| Clutch | `/stats/players/clutch` | Clutch time performance |
| Shooting | `/stats/players/shooting` | Shot distribution by distance |
| Defense Dashboard | `/stats/players/defense-dash-overall` | Defensive metrics |
| Hustle | `/stats/players/hustle` | Hustle stats (deflections, etc.) |
| Box Scores | `/stats/players/boxscores` | Game-by-game box scores |
| Play Type | `/stats/players/playtype` | Play type breakdown |
| Tracking | `/stats/players/tracking` | Player tracking data |
| Opponent Shooting | `/stats/players/opponent-shooting` | Opponent shooting vs player |
| Box Outs | `/stats/players/box-outs` | Box out statistics |
| Bios | `/stats/players/bio` | Player biographical info |

### Teams Stats Pages

| Page | URL | Description |
|------|-----|-------------|
| Traditional | `/stats/teams/traditional` | Team box score stats |
| Advanced | `/stats/teams/advanced` | Team advanced metrics |
| Clutch | `/stats/teams/clutch` | Team clutch performance |
| Shot Dashboard | `/stats/teams/shots-dashboard` | Team shot distribution |
| Defense Dashboard | `/stats/teams/defense-dashboard` | Team defensive metrics |
| Lineups | `/stats/teams/lineups` | Lineup combinations |
| Hustle Stats | `/stats/teams/hustle` | Team hustle metrics |
| Box Outs | `/stats/teams/box-outs` | Team box out stats |
| Box Scores | `/stats/teams/boxscores` | Team game box scores |

### Leaders Pages

| Page | URL | Description |
|------|-----|-------------|
| Official Leaders | `/stats/leaders` | Season leaders by stat category |
| All-Time Leaders | `/stats/alltime-leaders` | Historical leaders |
| Hustle Leaders | `/stats/hustle/leaders` | Hustle stat leaders |
| Advanced Leaders | `/stats/leaders/advanced` | Advanced stat leaders |

### Individual Entity Pages

| Page | URL Pattern | Description |
|------|-------------|-------------|
| Player Profile | `/stats/player/{player_id}/` | Individual player stats |
| Team Profile | `/stats/team/{team_id}/` | Individual team stats |
| Events/Plays | `/stats/events/` | Shot chart and play events |

### Other Stats Pages

| Page | URL | Description |
|------|-----|-------------|
| Draft Combine | `/stats/draft/combine` | Draft combine measurements |
| Draft History | `/stats/draft/history` | Historical draft data |
| Lineups Tool | `/stats/lineups/lineups-tool` | Custom lineup analysis |
| Cume Stats | `/stats/cumestats` | Cumulative statistics |

---

## Filter Parameters

All stats pages support these common filter parameters:

### Season Filters
- **Season**: `2025-26`, `2024-25`, etc.
- **Season Type**: `Regular Season`, `Playoffs`, `Pre Season`, `All Star`
- **Per Mode**: `Per Game`, `Totals`, `Per 36 Minutes`, `Per 100 Possessions`
- **Season Segment**: `All Season Segments`, `Pre All-Star`, `Post All-Star`

### Advanced Filters
- **Conference**: East, West
- **Division**: Atlantic, Central, Southeast, Northwest, Pacific, Southwest
- **Team**: Individual team filter
- **Location**: Home, Away
- **Outcome**: Wins, Losses
- **Game Segment**: First Half, Second Half, Overtime
- **Period**: 1, 2, 3, 4, OT1, OT2, etc.
- **Opponent**: Specific opponent team
- **Date Range**: From/To date filters

---

## Data Fields by Category

### Traditional Stats
```
Player, Team, Age, GP, W, L, Min, PTS, FGM, FGA, FG%, 3PM, 3PA, 3P%,
FTM, FTA, FT%, OREB, DREB, REB, AST, TOV, STL, BLK, PF, FP, DD2, TD3, +/-
```

### Advanced Stats
```
Player, Team, Age, GP, W, L, Min, OFFRTG, DEFRTG, NETRTG, AST%, AST/TO,
AST RATIO, OREB%, DREB%, REB%, TO RATIO, EFG%, TS%, USG%, PACE, PIE,
POSS, FGM, FGA, FGM PG, FGA PG, FG%
```

### Defense Dashboard
```
Player, Team, Age, Position, GP, G, FREQ%, DFGM, DFGA, DFG%, FG%, DIFF%
```

### Shooting by Distance
```
Less than 5ft: FGM, FGA, FG%
5-9 ft: FGM, FGA, FG%
10-14 ft: FGM, FGA, FG%
15-19 ft: FGM, FGA, FG%
20-24 ft: FGM, FGA, FG%
25-29 ft: FGM, FGA, FG%
```

### Hustle Stats
```
Player, Team, Age, GP, Min, ScreenAssists, ScreenAssists PTS, Deflections,
OFF Loose Balls Recovered, DEF Loose Balls Recovered, Loose Balls Recovered,
% Loose Balls Recovered OFF, % Loose Balls Recovered DEF, Charges Drawn,
Contested 2PT Shots, Contested 3PT Shots, Contested Shots
```

### Box Scores (Game-by-Game)
```
Player, Team, Match Up, Game Date, W/L, Min, PTS, FGM, FGA, FG%,
3PM, 3PA, 3P%, FTM, FTA, FT%, OREB, DREB, REB, AST, STL, BLK, TOV, PF, +/-, FP
```

### Team Traditional Stats
```
Team, GP, W, L, WIN%, Min, PTS, FGM, FGA, FG%, 3PM, 3PA, 3P%,
FTM, FTA, FT%, OREB, DREB, REB, AST, TOV, STL, BLK, BLKA, PF, PFD, +/-
```

### Leaders Stats
```
#, Player, Team, GP, Min, PTS, FGM, FGA, FG%, 3PM, 3PA, 3P%,
FTM, FTA, FT%, OREB, DREB, REB, AST, STL, BLK, TOV, EFF
```

---

## Events API Pattern

For shot charts and play-by-play events:
```
/stats/events/?CFID=&CFPARAMS=&ContextMeasure={measure}&GameID=&PlayerID={player_id}&Season={season}&SeasonType={season_type}&TeamID={team_id}&flag={flag}&sct=plot&section=game
```

### Context Measures Available
- `FGM`, `FGA` - Field Goals
- `FG3M`, `FG3A` - Three Pointers
- `OREB`, `DREB`, `REB` - Rebounds
- `AST` - Assists
- `TOV` - Turnovers
- `STL` - Steals
- `BLK` - Blocks
- `PF` - Personal Fouls

---

## Entity IDs

### Team IDs (Examples)
| Team | ID |
|------|-----|
| Atlanta Hawks | 1610612737 |
| Boston Celtics | 1610612738 |
| Cleveland Cavaliers | 1610612739 |
| Denver Nuggets | 1610612743 |
| Golden State Warriors | 1610612744 |
| Houston Rockets | 1610612745 |
| Los Angeles Lakers | 1610612747 |
| Memphis Grizzlies | 1610612763 |
| Milwaukee Bucks | 1610612749 |
| Minnesota Timberwolves | 1610612750 |
| New York Knicks | 1610612752 |
| Oklahoma City Thunder | 1610612760 |
| Philadelphia 76ers | 1610612755 |
| Phoenix Suns | 1610612756 |
| Washington Wizards | 1610612764 |

### Player IDs (Examples from current leaders)
| Player | ID |
|--------|-----|
| Luka Doncic | 1629029 |
| Shai Gilgeous-Alexander | 1628983 |
| Tyrese Maxey | 1630178 |
| Donovan Mitchell | 1628378 |
| Nikola Jokic | 203999 |
| Jaylen Brown | 1627759 |
| Giannis Antetokounmpo | 203507 |
| Stephen Curry | 201939 |
| Anthony Edwards | 1630162 |
| Jalen Brunson | 1628973 |

---

## Navigation Structure

### Main Stats Navigation
1. **Stats Home** (`/stats`)
2. **Players** (dropdown)
   - Players Home
   - Player Index
   - Traditional Stats
   - All Time Summary
   - Clutch
   - Shot Dashboard
   - Defensive Dashboard
   - Play Type
   - Tracking
   - Shooting
   - Opponent Shooting
   - Hustle
   - Box Outs
   - Bios
   - Box Scores
   - Advanced Box Scores

3. **Teams** (dropdown)
   - Teams Home
   - Traditional Stats
   - All Teams
   - Lineups
   - Clutch
   - Shot Dashboard
   - Defense Dashboard
   - Play Type
   - Tracking
   - Shooting
   - Opponent Shooting
   - Hustle Stats
   - Box Outs
   - Box Scores
   - Advanced Box Scores

4. **Leaders** (dropdown)
   - Official Leaders
   - All-Time Leaders
   - Hustle Leaders
   - Advanced Leaders

5. **Stats 101** (dropdown)
   - Franchise History
   - Statistical Minimums
   - Glossary
   - Transactions
   - Fantasy News
   - Articles
   - Weekly Stats Archive
   - FAQ
   - Video & Tracking Status
   - Video Rulebook

6. **Draft** (dropdown)
   - Draft Combine
   - Draft History
   - Combine Scrimmages
   - Combine Shooting Drills
   - Combine Strength & Agility
   - Combine Anthro

---

## Technical Notes

### Site Architecture
- Built with Next.js (React SSR framework)
- Data likely fetched server-side and hydrated on client
- Uses client-side routing for navigation between stats pages
- Responsive design with mobile support

### Data Refresh
- Live scoreboard data updates frequently during games
- Statistical data typically updated after game completion
- Historical data available for all NBA seasons

### Access Patterns
- Most data accessible without authentication
- Rate limiting may apply to frequent requests
- CDN endpoints are most reliable for programmatic access

---

## Comparison with Our Database

### Data We Already Have (PostgreSQL nba_stats)
- Games schedule and scores
- Player game stats (box scores)
- Team game stats
- Player advanced stats
- Team standings
- Betting data (from Pinnacle)

### Data We Could Add
- Hustle stats (deflections, loose balls, contested shots)
- Shooting by distance zones
- Play type breakdown
- Tracking data (speed, distance, touches)
- Clutch time splits
- Defense dashboard metrics
- Lineup combination stats

---

*Documentation generated from stats.nba.com analysis on 2025-12-20*
