# 0.SCRIPTS-EXPORTS

This folder contains outputs from analysis scripts and data exports following project organization best practices.

## Directory Structure

```
0.SCRIPTS-EXPORTS/
├── data/           # CSV exports, JSON data files
├── charts/         # PNG/JPG visualizations, graphs
├── reports/        # Markdown reports, analysis summaries
├── logs/           # Execution logs, timestamps
└── README.md       # This file
```

## Folder Purposes

### `data/`
- CSV exports from analysis scripts
- JSON data dumps
- Excel files (if generated)
- Raw data outputs

### `charts/`
- Visualization images (PNG, JPG, SVG)
- Comparison charts
- Graphs and plots
- Statistical visualizations

### `reports/`
- Markdown analysis reports
- HTML reports (if generated)
- PDF exports
- Summary documents

### `logs/`
- Script execution logs
- Timestamp records
- Error logs
- Performance metrics

## Naming Conventions

### Data Files
Format: `{analysis_name}_{date}_{type}.{ext}`
- Example: `ad_lebron_comparison_2024-01-23_gamelog.csv`

### Charts
Format: `{analysis_name}_{chart_type}_{date}.png`
- Example: `ad_lebron_scoring_comparison_2024-01-23.png`

### Reports
Format: `{analysis_name}_report_{date}.md`
- Example: `ad_lebron_impact_report_2024-01-23.md`

### Logs
Format: `{script_name}_{timestamp}.log`
- Example: `ad_lebron_analysis_2024-01-23_143022.log`

## Current Analyses

### Anthony Davis vs LeBron James Impact Analysis
- **Script**: `nba-schedule-api/ad_lebron_analysis.py`
- **Season**: 2023-24 Lakers Regular Season
- **Outputs**:
  - `data/ad_lebron_comparison_YYYY-MM-DD.csv` - Game-by-game data
  - `charts/ad_lebron_comparison_charts_YYYY-MM-DD.png` - 6-panel comparison
  - `charts/ad_lebron_stats_table_YYYY-MM-DD.png` - Statistics summary
  - `logs/ad_lebron_analysis_YYYY-MM-DD_HHMMSS.log` - Execution log

## Maintenance

### Cleanup Strategy
- **Weekly**: Review and archive old logs
- **Monthly**: Compress old data exports
- **Quarterly**: Archive outdated analyses

### Retention Policy
- Keep most recent 3 versions of each analysis
- Archive older versions to `0.SCRIPTS-EXPORTS/archive/`
- Logs older than 30 days can be deleted

## Notes

- All scripts should output to this directory structure
- Use date stamps to avoid overwriting
- Document new analysis types in this README
- Follow naming conventions consistently

---

**Created**: 2025-01-23
**Last Updated**: 2025-01-23
