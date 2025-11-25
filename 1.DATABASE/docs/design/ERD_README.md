# NBA Betting Database - Entity Relationship Diagrams

This directory contains UML/ERD diagrams for the complete database schema.

---

## Files

| File | Description |
|------|-------------|
| `DATABASE_ERD.puml` | Complete PlantUML diagram with all 42 tables + 5 materialized views |

---

## Viewing the Diagrams

### Option 1: VS Code (Recommended)

1. **Install PlantUML Extension**:
   - Open VS Code Extensions (Cmd+Shift+X)
   - Search for "PlantUML" by jebbs
   - Click Install

2. **View Diagram**:
   - Open `DATABASE_ERD.puml`
   - Press `Alt+D` (or `Cmd+D` on Mac) to preview
   - Or: Right-click → "Preview Current Diagram"

3. **Export**:
   - Right-click on preview → "Export Current Diagram"
   - Choose format: PNG, SVG, PDF

---

### Option 2: Online PlantUML Editor

1. Go to https://www.plantuml.com/plantuml/uml/
2. Copy contents of `DATABASE_ERD.puml`
3. Paste into editor
4. View rendered diagram
5. Download as PNG/SVG

---

### Option 3: Command Line (requires Java + Graphviz)

**Install Dependencies:**
```bash
# macOS
brew install graphviz
brew install plantuml

# Or download plantuml.jar from https://plantuml.com/download
```

**Generate Diagram:**
```bash
# PNG output
plantuml DATABASE_ERD.puml

# SVG output (recommended for web)
plantuml -tsvg DATABASE_ERD.puml

# PDF output
plantuml -tpdf DATABASE_ERD.puml
```

**Output**: Creates `DATABASE_ERD.png` (or .svg, .pdf) in the same directory

---

## Diagram Contents

### Complete ERD (`DATABASE_ERD.puml`)

**Includes:**
- All 42 core tables organized in 7 categories
- 5 materialized views
- All foreign key relationships
- Primary keys and key attributes
- Color-coded by functional area

**Categories:**
1. 🔵 **Core Reference Data** (8 tables) - Teams, Players, Seasons, Venues, Coaches
2. 🟢 **Game & Schedule** (5 tables) - Games, Playoffs, Lineups, Travel
3. 🟣 **Performance Statistics** (9 tables) - Traditional, Advanced, Four Factors
4. 🟠 **Roster & Availability** (3 tables) - Rosters, Injuries, Matchups
5. 🟡 **Betting Intelligence** (10 tables) - Lines, Predictions, Trends, H2H
6. 🔴 **Betting Analytics** (4 tables) - ATS, O/U, Streaks, Player Impact
7. ⚫ **System Operations** (3 tables) - Standings, ETL Logs, Rate Limits
8. 💙 **Materialized Views** (5 views) - Pre-computed Analytics

---

## Understanding the Relationships

### Cardinality Notation

```
||--o{ : One-to-Many (1:N)
||--|| : One-to-One (1:1)
}o--o{ : Many-to-Many (M:N)
```

**Examples:**
- `teams ||--o{ games` → One team has many games (as home or away)
- `games ||--o{ team_game_stats` → One game has many team stats entries
- `players ||--o{ player_game_stats` → One player has many game stat entries

---

### Key Tables and Their Relationships

#### Central Fact Table: `games`
The `games` table is the **star schema fact table** that connects to most dimension tables:

```
games
├── Referenced by: team_game_stats, player_game_stats
├── Referenced by: betting_lines, game_predictions
├── Referenced by: shot_charts, play_by_play
├── References: teams (home/away), seasons, venues
└── Central to: All betting analytics and performance tracking
```

#### Key Dimension Tables
- **teams** → Referenced by 20+ tables (central dimension)
- **players** → Referenced by 15+ tables (player-level analysis)
- **seasons** → Referenced by 25+ tables (temporal dimension)

---

## Database Statistics

| Metric | Count |
|--------|-------|
| Total Tables | 42 |
| Materialized Views | 5 |
| Foreign Key Relationships | ~80 |
| Indexes (Strategic) | 104 |
| Categories | 7 |

---

## Table Highlights

### Largest Tables (Storage)
1. `shot_charts` - ~40GB per season
2. `play_by_play` - ~30GB per season
3. `player_game_stats` - ~5GB per season
4. `betting_lines` - High write frequency

### Most Connected Tables (FK References)
1. `teams` - 20+ relationships
2. `games` - 15+ relationships
3. `players` - 15+ relationships
4. `seasons` - 25+ relationships

### Critical Betting Tables
1. `betting_lines` - Real-time odds tracking
2. `betting_market_odds` - Sharp money indicators
3. `ats_performance` - Against The Spread tracking
4. `over_under_trends` - Total points analysis
5. `mv_betting_edge_signals` - Combined betting insights (MV)

---

## Tips for Reading the Diagram

1. **Follow the Colors**: Each category has a distinct background color for easy identification
2. **Start with `games`**: The central fact table connects most entities
3. **Track Foreign Keys**: Look for `<<FK>>` markers to understand relationships
4. **Notice MVs**: Materialized Views (light blue) aggregate data from multiple tables
5. **JSONB Fields**: Modern flexible schema fields marked as `JSONB` type

---

## Exporting High-Quality Diagrams

### For Documentation (SVG - Best Quality)
```bash
plantuml -tsvg DATABASE_ERD.puml
```
- Scalable vector format
- Perfect for web documentation
- Infinitely zoomable without quality loss

### For Presentations (PNG - High DPI)
```bash
plantuml -DPLANTUML_LIMIT_SIZE=16384 DATABASE_ERD.puml
```
- High resolution bitmap
- Good for PowerPoint/Keynote
- Increase limit for very large diagrams

### For Print Documentation (PDF)
```bash
plantuml -tpdf DATABASE_ERD.puml
```
- Print-ready format
- Preserves fonts and layout
- Best for technical specifications

---

## Customizing the Diagrams

The PlantUML source is fully editable. Common customizations:

### Change Colors
```plantuml
!define CORE_COLOR #YourHexColor
```

### Hide/Show Categories
Comment out entire packages:
```plantuml
' package "System Operations" {
'   ... tables ...
' }
```

### Simplify Relationships
Remove less important relationships:
```plantuml
' teams ||--o{ pace : "analyzed"
```

### Add Notes
```plantuml
note right of games
  Central fact table
  Star schema hub
end note
```

---

## Integration with Documentation

The ERD diagram complements these documentation files:
- `DATABASE_DESIGN.md` - Detailed table specifications
- `BETTING_ANALYTICS_SCHEMA.md` - Betting-specific tables
- `BETTING_QUERIES.md` - SQL query examples
- `POSTGRESQL18_OPTIMIZATIONS.md` - Performance tuning
- `database-design-report.html` - Visual overview

---

## Diagram Maintenance

When updating the database schema:

1. **Add New Table**:
   ```plantuml
   entity "new_table" as new_table {
       * id : BIGINT <<PK>>
       --
       column : TYPE
   }
   ```

2. **Add Relationship**:
   ```plantuml
   parent_table ||--o{ new_table : "relationship name"
   ```

3. **Regenerate**:
   ```bash
   plantuml DATABASE_ERD.puml
   ```

---

## Troubleshooting

### Issue: "Syntax Error" when rendering

**Solution**: Check for:
- Unmatched quotes in entity names
- Missing closing braces `}`
- Invalid relationship syntax

### Issue: Diagram too large to render

**Solution**: Increase memory limit
```bash
plantuml -DPLANTUML_LIMIT_SIZE=16384 DATABASE_ERD.puml
```

### Issue: Missing Graphviz

**Solution**: Install Graphviz
```bash
brew install graphviz  # macOS
sudo apt-get install graphviz  # Linux
```

---

## Resources

- **PlantUML Documentation**: https://plantuml.com/
- **PlantUML Class Diagram**: https://plantuml.com/class-diagram
- **PlantUML Online Editor**: https://www.plantuml.com/plantuml/
- **VS Code Extension**: https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml

---

**Version**: 1.0.0
**Last Updated**: 2025-01-23
**Maintainer**: Development Team
