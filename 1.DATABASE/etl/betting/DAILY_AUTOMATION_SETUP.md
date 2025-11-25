# Daily Pinnacle ETL Automation Setup

## Overview

This guide explains how to automate the Pinnacle odds collection to run daily.

## Prerequisites

- Working Pinnacle session credentials (run `update_session.py` first)
- PostgreSQL database running
- Python 3 with required dependencies installed

## Option 1: Cron Job (Recommended)

### 1. Test the Script Manually

First, verify the script works:

```bash
cd /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting
./run_daily_pinnacle.sh
```

Check the log file in `logs/pinnacle_YYYYMMDD_HHMMSS.log` to verify success.

### 2. Add to Crontab

Edit your crontab:

```bash
crontab -e
```

Add one of these lines depending on your preferred schedule:

```cron
# Run daily at 2:00 AM (recommended - after games finish)
0 2 * * * /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/run_daily_pinnacle.sh

# Run daily at 10:00 AM (morning update)
0 10 * * * /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/run_daily_pinnacle.sh

# Run twice daily (2 AM and 2 PM)
0 2,14 * * * /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/run_daily_pinnacle.sh

# Run every 6 hours
0 */6 * * * /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/run_daily_pinnacle.sh
```

### 3. Verify Cron Job

List your cron jobs:

```bash
crontab -l
```

### 4. Monitor Logs

Logs are stored in:
```
/Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/logs/
```

View the latest log:
```bash
ls -lt /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/logs/ | head -n 2
tail -f /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/logs/pinnacle_*.log
```

Old logs (>30 days) are automatically cleaned up.

---

## Option 2: macOS launchd (Alternative)

For more control over macOS-specific features like running on wake or network changes.

### 1. Create Launch Agent

Create file: `~/Library/LaunchAgents/com.statdiscute.pinnacle.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.statdiscute.pinnacle</string>

    <key>ProgramArguments</key>
    <array>
        <string>/Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/run_daily_pinnacle.sh</string>
    </array>

    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>

    <key>StandardOutPath</key>
    <string>/Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/logs/launchd_out.log</string>

    <key>StandardErrorPath</key>
    <string>/Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/logs/launchd_err.log</string>
</dict>
</plist>
```

### 2. Load the Agent

```bash
launchctl load ~/Library/LaunchAgents/com.statdiscute.pinnacle.plist
```

### 3. Start Immediately (for testing)

```bash
launchctl start com.statdiscute.pinnacle
```

### 4. Check Status

```bash
launchctl list | grep pinnacle
```

### 5. Unload (if needed)

```bash
launchctl unload ~/Library/LaunchAgents/com.statdiscute.pinnacle.plist
```

---

## Session Credential Management

**IMPORTANT**: Pinnacle session credentials expire after 3 hours.

### Automated Session Refresh (Manual Intervention Required)

The script checks session health before running. If expired:

1. You'll receive an error in the log
2. Manually refresh credentials:
   ```bash
   # Get fresh cURL from browser (Network tab → Copy as cURL)
   # Update credentials in update_session.py
   python3 /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/update_session.py
   ```

### Recommendation

Refresh credentials **before each automated run** if sessions expire:
- Run automation less frequently (daily instead of hourly)
- OR manually refresh credentials daily

---

## Monitoring & Troubleshooting

### Check If Script is Running

```bash
ps aux | grep pinnacle
```

### View Recent Logs

```bash
# View last log
tail -50 $(ls -t /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/logs/pinnacle_*.log | head -1)

# Follow live
tail -f /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/logs/pinnacle_*.log
```

### Check Database for Recent Data

```bash
psql nba_stats -c "
  SELECT
    COUNT(*) as events,
    MAX(last_updated) as latest_update
  FROM betting_events
  WHERE last_updated > NOW() - INTERVAL '24 hours'
"
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Session expired | Credentials > 3 hours old | Run `update_session.py` with fresh cURL |
| No data collected | API rate limit or network | Check logs, wait and retry |
| Database connection error | PostgreSQL not running | Start PostgreSQL: `brew services start postgresql@18` |
| Script not executing | Cron environment issue | Use absolute paths in crontab |

---

## Email Notifications (Optional)

To receive email alerts on failures, uncomment this line in `run_daily_pinnacle.sh`:

```bash
# echo "Pinnacle ETL failed. Check ${LOG_FILE}" | mail -s "Pinnacle ETL Error" your@email.com
```

Requires `mail` command configured on macOS.

---

## Performance Optimization

For faster execution when running frequently:

1. **Reduce Market Fetching**: Modify `fetch_pinnacle_odds.py` to skip detailed markets for events >24 hours away
2. **Incremental Updates**: Only fetch events that changed since last run
3. **Parallel Execution**: Fetch markets concurrently (requires code modification)

---

## Recommended Schedule

**Best Practice**: Run once daily at 2:00 AM (after all NBA games finish)

```cron
0 2 * * * /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/run_daily_pinnacle.sh
```

**Why 2:00 AM?**
- All NBA games typically finish by midnight PT (3 AM ET)
- Fresh odds available for next day's games
- Low system load time
- Gives time to manually refresh credentials during the day if needed
