# /injuries - Fetch NBA Injury Reports

Fetch current NBA injury reports from Basketball-Reference.

## Usage

```
/injuries                   # Show all injuries
/injuries MIL DEN           # Filter by teams
/injuries --save            # Save to database
```

## Instructions

Run the injury fetcher script with the provided arguments:

```bash
python3 1.DATABASE/etl/injuries/fetch_injuries.py $ARGUMENTS
```

## Output

The script fetches from Basketball-Reference and displays:
- Player name
- Team abbreviation
- Injury status (OUT, GTD, PROBABLE)
- Injury type (knee, ankle, etc.)
- Last update date

## Options

- `--team TEAM [TEAM...]` - Filter by team abbreviations (e.g., MIL DEN)
- `--save` - Save to `injury_reports` database table
- `--json` - Output as JSON format

## Examples

1. **Get all injuries**: `/injuries`
2. **Specific teams**: `/injuries MIL DEN LAL`
3. **Save to database**: `/injuries --save`
4. **JSON format**: `/injuries --json`

## Data Source

Primary: [Basketball-Reference Injuries](https://www.basketball-reference.com/friv/injuries.cgi)
