# Pinnacle ETL Quick Start Guide

## ⚡ Quick Setup (3 Steps)

### 1. Test the Script
```bash
cd /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting
./run_daily_pinnacle.sh
```

### 2. Add to Crontab
```bash
crontab -e
```

Add this line (runs daily at 2 AM):
```cron
0 2 * * * /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/run_daily_pinnacle.sh
```

### 3. Verify
```bash
crontab -l
```

---

## 📊 Monitoring

### View Latest Log
```bash
tail -50 $(ls -t /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/logs/pinnacle_*.log | head -1)
```

### Check Database
```bash
psql nba_stats -c "
  SELECT COUNT(*) as events, MAX(last_updated) as latest
  FROM betting_events
  WHERE last_updated > NOW() - INTERVAL '24 hours'
"
```

### Session Health
```bash
python3 /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/check_session.py
```

---

## 🔄 Credential Refresh (When Session Expires)

**Sessions expire after 3 hours** - you'll need to manually refresh:

1. Open https://www.ps3838.com in browser and log in
2. Open DevTools → Network tab
3. Navigate to NBA betting page
4. Find any API request → Right-click → Copy as cURL
5. Update credentials:
```bash
# Edit update_session.py with new cURL headers/cookies
nano /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/update_session.py

# Run update
python3 /Users/chapirou/dev/perso/stat-discute.be/1.DATABASE/etl/betting/update_session.py
```

---

## ⏰ Recommended Schedules

| Schedule | Cron Expression | Use Case |
|----------|----------------|----------|
| Daily at 2 AM | `0 2 * * *` | **Recommended** - After games finish |
| Daily at 10 AM | `0 10 * * *` | Morning update |
| Twice daily | `0 2,14 * * *` | 2 AM and 2 PM |
| Every 6 hours | `0 */6 * * *` | Frequent updates |

---

## 🆘 Troubleshooting

| Error | Fix |
|-------|-----|
| Session expired | Run `update_session.py` with fresh credentials |
| Database error | Check PostgreSQL is running: `brew services list` |
| Script not running | Check crontab: `crontab -l` |
| No data collected | Check logs in `logs/` directory |

---

## 📁 File Locations

```
stat-discute.be/
├── pinnacle_session.json              # Session credentials (root)
└── 1.DATABASE/etl/betting/
    ├── run_daily_pinnacle.sh          # Main automation script ✅
    ├── fetch_pinnacle_odds.py         # ETL script
    ├── update_session.py              # Credential updater
    ├── check_session.py               # Health check
    ├── logs/                          # Log files (auto-cleanup 30 days)
    ├── DAILY_AUTOMATION_SETUP.md      # Detailed setup guide
    └── QUICK_START.md                 # This file
```

---

## 📞 Support

For detailed information, see:
- **Full Setup Guide**: `DAILY_AUTOMATION_SETUP.md`
- **Phase 2 Implementation**: `claudedocs/phase2-integration-complete-2025-11-23.md`
- **JSON Structure**: `/4.BETTING/json_structure_mapping.md`
