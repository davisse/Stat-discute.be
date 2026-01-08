# GitHub Actions Daily Sync Setup

This document explains how to configure GitHub Actions for automated NBA data synchronization.

## Overview

The workflow fetches NBA data from the NBA Stats API (using GitHub's IPs which aren't blocked) and imports it to the production database via SSH tunnel.

## Required GitHub Secrets

Go to **Repository Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VPS_HOST` | VPS IP address or hostname | `57.129.74.182` |
| `VPS_USER` | SSH username | `debian` |
| `VPS_SSH_KEY` | Private SSH key (full content) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

### Getting the SSH Key

The SSH key is the private key used to connect to the VPS:

```bash
# View the private key content
cat ~/.ssh/ovh_backtoschool_rsa
```

Copy the **entire** content including `-----BEGIN` and `-----END` lines.

## Workflow Configuration

### File Location
`.github/workflows/daily-sync.yml`

### Schedule
- **Automatic**: Daily at 12:00 UTC (7:00 AM EST) - after all NBA games finish
- **Manual**: Can be triggered via GitHub Actions UI with options:
  - `full` - Sync games, player stats, and analytics
  - `games-only` - Only sync games (faster)
  - `analytics-only` - Only recalculate standings/DVP

### Scripts Used
| Script | Purpose |
|--------|---------|
| `github_sync_games.py` | Fetches games from NBA API, outputs SQL |
| `github_sync_player_stats.py` | Fetches player box scores, outputs SQL |
| `github_sync_analytics.py` | Generates SQL for standings/DVP calculation |

## Testing

### Manual Trigger
1. Go to **Actions** tab in GitHub repository
2. Select **Daily NBA Data Sync** workflow
3. Click **Run workflow**
4. Select sync type and click **Run workflow**

### Local Testing
```bash
# Test games sync (outputs SQL to stdout)
cd 1.DATABASE/etl
python github_sync_games.py > /tmp/games.sql
head -50 /tmp/games.sql

# Test player stats sync
python github_sync_player_stats.py > /tmp/stats.sql
head -50 /tmp/stats.sql

# Test analytics generation
python github_sync_analytics.py > /tmp/analytics.sql
head -100 /tmp/analytics.sql
```

## Troubleshooting

### SSH Connection Failed
- Verify `VPS_SSH_KEY` secret contains the complete private key
- Check that the key has correct permissions on VPS (`~/.ssh/authorized_keys`)
- Ensure `VPS_HOST` and `VPS_USER` are correct

### NBA API Timeout
GitHub Actions IPs should not be blocked, but if issues occur:
- Check workflow logs for specific error messages
- NBA API may be temporarily unavailable
- Re-run the workflow

### Database Connection Failed
- Verify the postgres container is running: `docker ps | grep postgres`
- Check `$POSTGRES_USER` environment variable is set in VPS docker-compose

### Missing Player Stats
- Player stats script only fetches last 7 days of games
- Run a full sync after extended downtime
- Check if games have `game_status = 'Final'`

## Monitoring

### GitHub Actions
- Check **Actions** tab for workflow run history
- Each run shows:
  - Games synced count
  - Player stats count
  - Final verification query results

### Manual Verification
```bash
# SSH to VPS and check data
ssh ovh-vps "docker exec postgres psql -U \$POSTGRES_USER -d statdiscute -c \"
SELECT 'Games: ' || COUNT(*) FROM games WHERE season = '2025-26';
SELECT 'Final: ' || COUNT(*) FROM games WHERE season = '2025-26' AND game_status = 'Final';
\""
```

## Security Notes

- SSH key is stored encrypted in GitHub Secrets
- Database credentials never leave the VPS (uses `$POSTGRES_USER` env var)
- All connections go through SSH tunnel
- No ports exposed on the production database
