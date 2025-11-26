# GCP Deployment Plan - Stat Discute

**Created**: 2025-11-25
**Status**: ✅ DEPLOYED AND LIVE
**Estimated Budget**: $30-50/month
**Architecture**: Single VM with Docker Compose
**Live URL**: http://34.140.155.16:3000

---

## Executive Summary

Deploy Stat Discute NBA analytics platform to Google Cloud Platform using a single Compute Engine VM with Docker Compose orchestration. This plan prioritizes cost efficiency while maintaining production-ready infrastructure.

### Requirements Summary
| Requirement | Decision |
|-------------|----------|
| Budget | $30-50/month |
| Scale | Personal/MVP (<100 users/day) |
| Access | IP address only (no domain initially) |
| Environments | Local dev + Production VM |
| GCP Status | Existing account, new project |
| CI/CD | Manual SSH deployment |

---

## Phase 1: GCP Project Setup

### 1.1 Create New GCP Project

```bash
# Create project (run from local machine with gcloud CLI)
gcloud projects create stat-discute-prod --name="Stat Discute Production"

# Set as active project
gcloud config set project stat-discute-prod

# Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
```

### 1.2 Configure Billing

1. Go to [GCP Console](https://console.cloud.google.com)
2. Navigate to Billing → Link billing account to project
3. Set budget alert at $40/month (80% of ceiling)

### 1.3 Create Service Account (Optional - for CI/CD later)

```bash
gcloud iam service-accounts create stat-discute-deploy \
    --display-name="Stat Discute Deployment"

gcloud projects add-iam-policy-binding stat-discute-prod \
    --member="serviceAccount:stat-discute-deploy@stat-discute-prod.iam.gserviceaccount.com" \
    --role="roles/compute.instanceAdmin.v1"
```

---

## Phase 2: Compute Engine VM Setup

### 2.1 VM Specifications

| Spec | Value | Rationale |
|------|-------|-----------|
| Machine Type | e2-medium | 2 vCPU, 4GB RAM - sufficient for MVP |
| Region | europe-west1-b | Low latency for EU users |
| Boot Disk | 50GB SSD | OS + Docker images + DB data |
| OS | Ubuntu 24.04 LTS | Long-term support, Docker native |
| Cost | ~$25-30/month | Within budget |

### 2.2 Create VM

```bash
gcloud compute instances create stat-discute-vm \
    --project=stat-discute-prod \
    --zone=europe-west1-b \
    --machine-type=e2-medium \
    --image-family=ubuntu-2404-lts-amd64 \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size=50GB \
    --boot-disk-type=pd-ssd \
    --tags=http-server,https-server \
    --metadata=startup-script='#!/bin/bash
apt-get update
apt-get install -y docker.io docker-compose-v2
usermod -aG docker $USER
systemctl enable docker
systemctl start docker'
```

### 2.3 Reserve Static IP (Optional but recommended)

```bash
# Reserve static IP
gcloud compute addresses create stat-discute-ip \
    --project=stat-discute-prod \
    --region=europe-west1

# Get the IP address
gcloud compute addresses describe stat-discute-ip \
    --region=europe-west1 --format="get(address)"

# Assign to VM
gcloud compute instances delete-access-config stat-discute-vm \
    --zone=europe-west1-b \
    --access-config-name="external-nat"

gcloud compute instances add-access-config stat-discute-vm \
    --zone=europe-west1-b \
    --address=$(gcloud compute addresses describe stat-discute-ip --region=europe-west1 --format="get(address)")
```

### 2.4 Firewall Rules

```bash
# Allow HTTP (port 3000 for Next.js)
gcloud compute firewall-rules create allow-http-3000 \
    --project=stat-discute-prod \
    --allow=tcp:3000 \
    --target-tags=http-server \
    --description="Allow Next.js on port 3000"

# Allow SSH (already exists by default)
# Allow PostgreSQL only from VM itself (internal)
# No external PostgreSQL access for security
```

---

## Phase 3: Docker Configuration

### 3.1 Project Structure for Docker

```
stat-discute.be/
├── docker/
│   ├── docker-compose.yml          # Production compose
│   ├── docker-compose.dev.yml      # Local development
│   ├── Dockerfile.frontend         # Next.js image
│   ├── Dockerfile.etl              # Python ETL image
│   └── .env.production             # Production secrets (not in git)
├── frontend/
├── 1.DATABASE/
└── ...
```

### 3.2 docker-compose.yml (Production)

```yaml
version: '3.8'

services:
  # PostgreSQL 16 (18 not yet available in official images)
  postgres:
    image: postgres:16-alpine
    container_name: stat-discute-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-nba_admin}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME:-nba_stats}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./1.DATABASE/migrations:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-nba_admin}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - stat-discute-network

  # Next.js Frontend
  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    container_name: stat-discute-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-nba_stats}
      DB_USER: ${DB_USER:-nba_admin}
      DB_PASSWORD: ${DB_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - stat-discute-network

  # ETL Service (runs on schedule)
  etl:
    build:
      context: .
      dockerfile: docker/Dockerfile.etl
    container_name: stat-discute-etl
    restart: unless-stopped
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME:-nba_stats}
      DB_USER: ${DB_USER:-nba_admin}
      DB_PASSWORD: ${DB_PASSWORD}
    volumes:
      - etl_logs:/app/logs
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - stat-discute-network

volumes:
  postgres_data:
  etl_logs:

networks:
  stat-discute-network:
    driver: bridge
```

### 3.3 Dockerfile.frontend

```dockerfile
# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

> **Note**: Requires adding `output: 'standalone'` to `next.config.ts`

### 3.4 Dockerfile.etl

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY 1.DATABASE/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ETL scripts
COPY 1.DATABASE/etl/ ./etl/
COPY 1.DATABASE/config/ ./config/

# Setup cron for daily ETL
COPY docker/etl-crontab /etc/cron.d/etl-crontab
RUN chmod 0644 /etc/cron.d/etl-crontab
RUN crontab /etc/cron.d/etl-crontab

# Create log directory
RUN mkdir -p /app/logs

# Run cron in foreground
CMD ["cron", "-f"]
```

### 3.5 etl-crontab

```cron
# Run daily ETL at 6:00 AM UTC (after NBA games finish)
0 6 * * * cd /app && python3 etl/sync_season_2025_26.py >> /app/logs/etl.log 2>&1
15 6 * * * cd /app && python3 etl/fetch_player_stats_direct.py >> /app/logs/etl.log 2>&1
30 6 * * * cd /app && python3 etl/analytics/run_all_analytics.py >> /app/logs/etl.log 2>&1

# Empty line required at end
```

### 3.6 .env.production (Template - DO NOT COMMIT)

```bash
# Database
DB_USER=nba_admin
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE
DB_NAME=nba_stats

# NBA API
NBA_API_TIMEOUT=30
NBA_API_RETRY_COUNT=3

# Environment
ENVIRONMENT=production
DEBUG=false
```

---

## Phase 4: Local Development Setup

### 4.1 docker-compose.dev.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: stat-discute-db-dev
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: chapirou
      POSTGRES_PASSWORD:
      POSTGRES_DB: nba_stats
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./1.DATABASE/migrations:/docker-entrypoint-initdb.d:ro

volumes:
  postgres_dev_data:
```

### 4.2 Local Development Workflow

```bash
# Start local database
docker compose -f docker/docker-compose.dev.yml up -d

# Run frontend in dev mode
cd frontend
npm run dev

# Run ETL scripts manually
cd 1.DATABASE/etl
python3 sync_season_2025_26.py
```

---

## Phase 5: Deployment Process

### 5.1 Initial Deployment Steps

```bash
# 1. SSH to VM
gcloud compute ssh stat-discute-vm --zone=europe-west1-b

# 2. Clone repository (first time only)
cd ~
git clone https://github.com/YOUR_USERNAME/stat-discute.be.git
cd stat-discute.be

# 3. Create production env file
cp docker/.env.production.template docker/.env.production
nano docker/.env.production  # Edit with secure passwords

# 4. Build and start services
docker compose -f docker/docker-compose.yml up -d --build

# 5. Verify services are running
docker compose ps
docker compose logs -f frontend

# 6. Run initial migrations (if not auto-run)
docker compose exec postgres psql -U nba_admin -d nba_stats \
    -f /docker-entrypoint-initdb.d/001_poc_minimal.sql
```

### 5.2 Update Deployment (Subsequent Deploys)

```bash
# SSH to VM
gcloud compute ssh stat-discute-vm --zone=europe-west1-b

# Pull latest code
cd ~/stat-discute.be
git pull origin main

# Rebuild and restart
docker compose -f docker/docker-compose.yml up -d --build

# Check logs
docker compose logs -f --tail=100
```

### 5.3 Deployment Script (deploy.sh)

```bash
#!/bin/bash
# deploy.sh - Run on VM to deploy latest changes

set -e

cd ~/stat-discute.be

echo "🔄 Pulling latest code..."
git pull origin main

echo "🏗️ Building containers..."
docker compose -f docker/docker-compose.yml build

echo "🚀 Restarting services..."
docker compose -f docker/docker-compose.yml up -d

echo "🔍 Checking service health..."
sleep 10
docker compose ps

echo "✅ Deployment complete!"
echo "📊 Frontend: http://$(curl -s ifconfig.me):3000"
```

---

## Phase 6: Backup Strategy

### 6.1 Database Backup Script

```bash
#!/bin/bash
# backup-db.sh - Daily database backup

BACKUP_DIR=/home/$USER/backups
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

mkdir -p $BACKUP_DIR

# Create backup
docker compose exec -T postgres pg_dump -U nba_admin nba_stats | \
    gzip > $BACKUP_DIR/nba_stats_$DATE.sql.gz

# Remove old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: nba_stats_$DATE.sql.gz"
```

### 6.2 Backup Cron (on VM)

```bash
# Add to crontab on VM
crontab -e

# Add line:
0 4 * * * /home/$USER/stat-discute.be/docker/backup-db.sh >> /home/$USER/backups/backup.log 2>&1
```

### 6.3 Disk Snapshot (Weekly)

```bash
# Create snapshot policy
gcloud compute resource-policies create snapshot-schedule stat-discute-weekly \
    --project=stat-discute-prod \
    --region=europe-west1 \
    --max-retention-days=14 \
    --on-source-disk-delete=keep-auto-snapshots \
    --weekly-schedule-from-file=snapshot-schedule.json

# Attach to disk
gcloud compute disks add-resource-policies stat-discute-vm \
    --resource-policies=stat-discute-weekly \
    --zone=europe-west1-b
```

---

## Phase 7: Monitoring & Maintenance

### 7.1 Basic Health Check Script

```bash
#!/bin/bash
# health-check.sh

# Check if frontend responds
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: DOWN"
fi

# Check PostgreSQL
if docker compose exec -T postgres pg_isready -U nba_admin > /dev/null 2>&1; then
    echo "✅ Database: OK"
else
    echo "❌ Database: DOWN"
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo "✅ Disk: ${DISK_USAGE}% used"
else
    echo "⚠️ Disk: ${DISK_USAGE}% used (HIGH)"
fi

# Check memory
MEM_FREE=$(free -m | awk 'NR==2 {print $4}')
echo "📊 Memory Free: ${MEM_FREE}MB"
```

### 7.2 View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f postgres
docker compose logs -f etl

# Last 100 lines
docker compose logs --tail=100 frontend
```

### 7.3 GCP Cloud Monitoring (Free Tier)

- CPU utilization alerts
- Memory usage alerts
- Uptime checks (basic)

---

## Phase 8: Security Hardening

### 8.1 SSH Security

```bash
# On VM: Disable password auth (use SSH keys only)
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### 8.2 Firewall (UFW)

```bash
# On VM
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 3000/tcp  # Next.js
sudo ufw enable
```

### 8.3 Docker Security

```bash
# Don't expose PostgreSQL externally (already in compose)
# Run containers as non-root (already in Dockerfiles)
# Use secrets management for production passwords
```

---

## Cost Breakdown

| Resource | Monthly Cost |
|----------|-------------|
| e2-medium VM | ~$25 |
| 50GB SSD | ~$4 |
| Static IP | ~$3 |
| Network egress | ~$1-3 |
| **Total** | **~$33-35/month** |

*Note: Costs may vary. First $300 free credits cover ~9 months.*

---

## Implementation Checklist

### Phase 1: GCP Setup
- [ ] Create GCP project `stat-discute-prod`
- [ ] Enable Compute Engine API
- [ ] Link billing account
- [ ] Set budget alert at $40

### Phase 2: VM Setup
- [ ] Create e2-medium VM in europe-west1-b
- [ ] Reserve static IP (optional)
- [ ] Configure firewall rules
- [ ] SSH and verify Docker installed

### Phase 3: Docker Configuration ✅ COMPLETED (2025-11-25)
- [x] Create `docker/` directory structure
- [x] Write `docker-compose.yml`
- [x] Write `docker-compose.dev.yml`
- [x] Write `Dockerfile.frontend`
- [x] Write `Dockerfile.etl`
- [x] Write `etl-crontab`
- [x] Update `next.config.ts` for standalone output
- [x] Create `env.production.template`
- [x] Create `deploy.sh`
- [x] Create `backup-db.sh`
- [x] Create `health-check.sh`
- [x] Local Docker build tested successfully
- [x] Local PostgreSQL container running with migrations

### Phase 4: Initial Deployment ✅ COMPLETED (2025-11-25)
- [x] Push code to git (local repo initialized, committed)
- [x] Deploy to VM (via tarball + scp)
- [x] Build and start containers
- [x] Run migrations (auto-run via docker-entrypoint-initdb.d)
- [x] Verify frontend accessible at http://34.140.155.16:3000

### Phase 5: Data & Backup ✅ COMPLETED (2025-11-25)
- [x] Run initial ETL to populate database
  - 30 teams loaded
  - 54 games (upcoming schedule) loaded
  - 1 season (2025-26) configured
  - ⚠️ NBA stats.nba.com API blocks GCP IPs (historical data needs local ETL)
- [x] Setup backup script (created)
- [x] Configure backup cron on VM (daily 4 AM UTC)
- [ ] Test backup restore

### Phase 6: Monitoring
- [x] Setup health check script (created)
- [ ] Configure GCP uptime monitoring
- [ ] Document runbook for common issues

---

## Known Limitations

### NBA API Access from GCP
The NBA stats.nba.com API consistently times out from GCP Compute Engine IPs.
This affects:
- Historical game data fetching (LeagueGameFinder endpoint)
- Player stats collection (nba_api library endpoints)

**Working endpoints from GCP**:
- Scoreboard API (cdn.nba.com) - used by fetch_schedule_direct.py
- Team data endpoints

**Workaround**: Run historical ETL from a local machine:
```bash
# From local machine (not GCP)
cd 1.DATABASE/etl
python3 sync_season_2025_26.py        # Fetch completed games
python3 fetch_player_stats_direct.py  # Fetch player box scores

# Then export and import to production:
pg_dump -h localhost -U chapirou nba_stats --data-only --inserts --no-owner --no-acl > /tmp/nba_stats_data.sql
gcloud compute scp /tmp/nba_stats_data.sql stat-discute-vm:/tmp/ --zone=europe-west1-b --project=calendarmcpclaude
gcloud compute ssh stat-discute-vm --zone=europe-west1-b --project=calendarmcpclaude --command="docker cp /tmp/nba_stats_data.sql stat-discute-db:/tmp/ && docker exec stat-discute-db psql -U nba_admin -d nba_stats -f /tmp/nba_stats_data.sql"
```

**Data Import Status (2025-11-26)**:
- ✅ 1947 games imported
- ✅ 37939 player game stats imported
- ✅ 647 players imported
- ✅ 30 teams imported
- ✅ All betting data and analytics imported

**Schema Sync Notes**: Before importing data, ensure production has all migrations applied:
```bash
# If schema mismatch errors occur, apply missing migrations first
gcloud compute ssh stat-discute-vm --zone=europe-west1-b --project=calendarmcpclaude --command="docker exec stat-discute-db psql -U nba_admin -d nba_stats -f /tmp/migration.sql"
```

---

## Rollback Procedure

```bash
# If deployment fails:

# 1. Check which version is running
docker compose images

# 2. Roll back to previous version
git checkout HEAD~1
docker compose up -d --build

# 3. If database issue, restore from backup
gunzip -c /home/$USER/backups/nba_stats_YYYYMMDD.sql.gz | \
    docker compose exec -T postgres psql -U nba_admin nba_stats
```

---

## Next Steps After MVP

1. **Add Domain**: Purchase stat-discute.be, configure DNS, add SSL with Let's Encrypt
2. **CI/CD**: GitHub Actions for automated deployment on push
3. **Monitoring**: Grafana dashboard for metrics visualization
4. **Scaling**: Move to Cloud Run + Cloud SQL if traffic grows
5. **CDN**: Add Cloud CDN for static assets

---

## Files to Create

| File | Purpose |
|------|---------|
| `docker/docker-compose.yml` | Production orchestration |
| `docker/docker-compose.dev.yml` | Local development |
| `docker/Dockerfile.frontend` | Next.js container |
| `docker/Dockerfile.etl` | Python ETL container |
| `docker/etl-crontab` | ETL schedule |
| `docker/.env.production.template` | Environment template |
| `docker/deploy.sh` | Deployment script |
| `docker/backup-db.sh` | Backup script |
| `docker/health-check.sh` | Health monitoring |

---

**Plan Status**: ✅ DEPLOYMENT COMPLETE
**Deployed**: 2025-11-25
**GCP Project**: calendarmcpclaude (reused existing project)
**VM External IP**: 34.140.155.16
