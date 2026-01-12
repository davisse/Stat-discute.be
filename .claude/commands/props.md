# /props - Absence-Based Prop Finder

Find player prop value opportunities based on key player absences.

## Usage

```bash
/props                    # Analyze today's games
/props --game 0022500554  # Specific game
/props --team DEN         # Games involving team
```

## Pipeline

1. **Identify games** - Today's games or specified
2. **Detect absences** - Star players missing (≥3 games, ≥20 min, ≥10 pts avg)
3. **Cascade analysis** - Who benefits from the absence
4. **Fetch props** - Get available betting lines
5. **Evaluate value** - Compare line vs performance without absent player
6. **Validate** - Check volume (minutes), efficiency (FG%), floor

## Confidence Levels

- **HIGH**: Edge ≥5 pts + Minutes boost ≥5 + FG% stable + Floor above line
- **MEDIUM**: Edge ≥3 pts + Minutes boost ≥3
- **LOW**: Edge ≥2 pts

## Execute

```bash
python3 1.DATABASE/etl/analytics/absence_prop_finder.py $ARGS
```
