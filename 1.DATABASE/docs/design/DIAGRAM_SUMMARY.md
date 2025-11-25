# NBA Betting Database ERD - Quick Reference

Generated on: 2025-01-23

---

## 📊 Available Diagram Files

| File | Format | Size | Best For |
|------|--------|------|----------|
| `DATABASE_ERD.png` | PNG Image | 712 KB | Quick viewing, presentations |
| `DATABASE_ERD.svg` | SVG Vector | 260 KB | Web, infinite zoom, print |
| `DATABASE_ERD.puml` | PlantUML Source | Text | Editing, version control |

---

## 🎯 Quick View

**PNG Diagram**: Open `DATABASE_ERD.png` in any image viewer
**SVG Diagram**: Open `DATABASE_ERD.svg` in browser or vector editor

---

## 📈 Diagram Statistics

- **Total Tables**: 42
- **Materialized Views**: 5
- **Foreign Key Relationships**: ~80
- **Functional Categories**: 7
- **Diagram Width**: 8,518 pixels (original)
- **Displayed Width**: 4,096 pixels (size-limited for compatibility)

---

## 🎨 Color Legend

| Color | Category | Tables |
|-------|----------|--------|
| 🔵 Light Blue | Core Reference | 8 tables |
| 🟢 Light Green | Game & Schedule | 5 tables |
| 🟣 Light Purple | Performance Statistics | 9 tables |
| 🟠 Light Orange | Roster & Availability | 3 tables |
| 🟡 Light Yellow | Betting Intelligence | 10 tables |
| 🔴 Light Pink | Betting Analytics | 4 tables |
| ⚫ Light Gray | System Operations | 3 tables |
| 💙 Cyan | Materialized Views | 5 views |

---

## 🔑 Key Tables to Understand

### Central Fact Table
**`games`** - The star schema hub
- Referenced by 15+ tables
- Links teams, venues, seasons
- Central to all analytics

### Major Dimension Tables
1. **`teams`** (20+ relationships) - NBA franchises
2. **`players`** (15+ relationships) - Player data
3. **`seasons`** (25+ relationships) - Temporal dimension

### Critical Betting Tables
1. **`betting_lines`** - Real-time odds
2. **`betting_market_odds`** - Sharp money indicators
3. **`ats_performance`** - Against The Spread
4. **`over_under_trends`** - Total points analysis
5. **`mv_betting_edge_signals`** - Combined insights (MV)

---

## 📍 Reading the Diagram

### Notation Guide

**Entity Structure:**
```
┌──────────────────────┐
│ table_name           │
├──────────────────────┤
│ * primary_key : TYPE │ <<PK>>
│ foreign_key : TYPE   │ <<FK>>
│ regular_column : TYPE│
└──────────────────────┘
```

**Relationship Notation:**
```
||--o{ : One-to-Many (1:N)
||--|| : One-to-One (1:1)
}o--o{ : Many-to-Many (M:N)
```

**Example:**
```
teams ||--o{ games : "plays in"
```
Means: One team plays in many games

---

## 🔍 Finding Specific Information

### By Category
- **Teams & Players**: Top-left (blue section)
- **Game Data**: Upper-middle (green section)
- **Statistics**: Middle (purple section)
- **Betting Data**: Lower sections (yellow/pink)
- **System Tables**: Bottom (gray section)

### By Relationship Type
- **Core Entity Relations**: Follow lines from `teams`, `players`, `games`
- **Betting Relations**: Follow lines from `betting_lines` to analytics tables
- **Aggregations**: Look for Materialized Views (cyan) connections

---

## 🛠️ Regenerating the Diagram

If you modify `DATABASE_ERD.puml`:

```bash
# Standard resolution
plantuml -tpng DATABASE_ERD.puml
plantuml -tsvg DATABASE_ERD.puml

# High resolution (no size limit)
PLANTUML_LIMIT_SIZE=16384 plantuml -tpng DATABASE_ERD.puml
```

---

## 📱 Viewing on Different Devices

### Desktop
- **Windows**: Photos app, Paint, web browser
- **macOS**: Preview, web browser
- **Linux**: Eye of GNOME, web browser

### Mobile
- Transfer SVG file for best mobile viewing
- PNG works but may be large for some devices

### Web
- Embed SVG in HTML:
  ```html
  <img src="DATABASE_ERD.svg" alt="Database ERD" />
  ```

---

## 🔗 Related Documentation

- `ERD_README.md` - Detailed viewing guide
- `DATABASE_DESIGN.md` - Table specifications
- `BETTING_ANALYTICS_SCHEMA.md` - Betting tables
- `POSTGRESQL18_OPTIMIZATIONS.md` - Performance tuning
- `database-design-report.html` - Interactive overview

---

## ⚡ Quick Tips

1. **Zoom In**: Use SVG for infinite zoom without quality loss
2. **Print**: Use SVG or high-res PNG for print quality
3. **Edit**: Modify `.puml` source and regenerate
4. **Share**: SVG is smallest for web sharing
5. **Present**: PNG is best for PowerPoint/Keynote

---

## 📏 Diagram Dimensions

- **Original Width**: 8,518 pixels
- **Original Height**: ~3,800 pixels
- **Aspect Ratio**: ~2.24:1 (wide)
- **Recommended Viewing**: Landscape orientation, large screen

---

## 🎓 Understanding Patterns

### Star Schema Pattern
```
     teams
       |
    games (FACT)
    /  |  \
teams  |   players
    seasons
```

### Analytical Pattern
```
games → team_game_stats → team_performance_trends
                          → ats_performance
                          → over_under_trends
```

### Betting Intelligence Flow
```
games → betting_lines → betting_market_odds
                       → game_predictions
                       → mv_betting_edge_signals
```

---

**Version**: 1.0.0
**Generated**: 2025-01-23 14:15 CET
**Tool**: PlantUML 1.2025.9 + Graphviz 14.0.2
