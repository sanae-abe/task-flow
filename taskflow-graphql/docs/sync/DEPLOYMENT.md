# TODO.md Sync System - Deployment Guide

Complete deployment and configuration guide for production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Authentication](#authentication)
- [File Watcher Configuration](#file-watcher-configuration)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup Strategy](#backup-strategy)
- [Performance Tuning](#performance-tuning)
- [Security Hardening](#security-hardening)
- [Deployment Checklist](#deployment-checklist)

---

## Prerequisites

### System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **TypeScript**: 5.0.0 or higher
- **Operating System**: macOS, Linux, or Windows (with WSL2 recommended)

### Runtime Requirements

- **Memory**: Minimum 512MB available, 1GB recommended
- **Disk Space**: 100MB for application, 10MB for TODO.md and backups
- **File System**: Local file system with read/write access

### Dependencies

```json
{
  "dependencies": {
    "chokidar": "^3.6.0",
    "fast-diff": "^1.3.0",
    "isomorphic-dompurify": "^2.9.0",
    "@lifeomic/attempt": "^3.1.0",
    "opossum": "^8.1.0",
    "lodash-es": "^4.17.21",
    "idb": "^8.0.0",
    "pino": "^8.16.0"
  },
  "devDependencies": {
    "@types/chokidar": "^2.1.3",
    "@types/lodash-es": "^4.17.12"
  }
}
```

---

## Installation

### 1. Clone Repository

```bash
cd ~/workspace/taskflow-app
git clone <repository-url> taskflow-graphql
cd taskflow-graphql
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build Application

```bash
npm run build
```

### 4. Verify Installation

```bash
npm test -- src/sync/__tests__/
```

Expected output:
```
✓ src/sync/__tests__/markdown-parser.test.ts (30 tests)
✓ src/sync/__tests__/three-way-merger.test.ts (25 tests)
✓ src/sync/__tests__/integration.test.ts (20 tests)

Test Files  3 passed (3)
     Tests  75 passed (75)
```

---

## Environment Setup

### Environment Variables

Create `.env` file in project root:

```bash
# Copy template
cp .env.example .env

# Edit with your configuration
vim .env
```

### Required Variables

```bash
# TODO.md Configuration
TODO_PATH=./TODO.md
TODO_DEBOUNCE_MS=1000
TODO_THROTTLE_MS=5000
TODO_MAX_FILE_SIZE_MB=5
TODO_MAX_TASKS=10000

# Conflict Resolution
TODO_CONFLICT_RESOLUTION=prefer_file  # prefer_file | prefer_app | manual

# Backup
TODO_AUTO_BACKUP=true
TODO_BACKUP_RETENTION_DAYS=7

# Authentication (Required for MCP)
MCP_AUTH_TOKEN=<generate-secure-token>

# Logging
LOG_LEVEL=info  # debug | info | warn | error
LOG_FILE=./logs/sync.log

# Performance
NODE_ENV=production
```

### Generate Auth Token

```bash
# Generate secure 32-character token
openssl rand -base64 32

# Add to .env
echo "MCP_AUTH_TOKEN=$(openssl rand -base64 32)" >> .env
```

### Validate Configuration

```bash
# Run configuration validator
npm run validate:config

# Expected output:
# ✓ TODO_PATH: ./TODO.md (valid)
# ✓ MCP_AUTH_TOKEN: ****** (valid, 44 chars)
# ✓ TODO_MAX_FILE_SIZE_MB: 5 (valid)
# ✓ All required variables present
```

---

## Authentication

### MCP Authentication Setup

#### 1. Generate Token

```bash
# Generate strong token
export MCP_AUTH_TOKEN=$(openssl rand -base64 32)

# Persist to .env
echo "MCP_AUTH_TOKEN=${MCP_AUTH_TOKEN}" >> .env
```

#### 2. Configure Claude Code/Desktop

Add to Claude MCP settings (`~/.claude/config.json`):

```json
{
  "mcpServers": {
    "taskflow": {
      "command": "node",
      "args": ["dist/mcp/server.js"],
      "env": {
        "MCP_AUTH_TOKEN": "your-generated-token-here"
      }
    }
  }
}
```

#### 3. Verify Authentication

```bash
# Test MCP tool with authentication
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MCP_AUTH_TOKEN}" \
  -d '{
    "tool": "todo_sync",
    "arguments": {
      "action": "status"
    }
  }'
```

Expected response:
```json
{
  "success": true,
  "action": "status",
  "statistics": { ... }
}
```

### Security Best Practices

1. **Never commit `.env` file**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use environment-specific tokens**
   ```bash
   # Development
   MCP_AUTH_TOKEN=dev-token-12345

   # Production
   MCP_AUTH_TOKEN=prod-secure-token-67890
   ```

3. **Rotate tokens regularly**
   ```bash
   # Generate new token
   NEW_TOKEN=$(openssl rand -base64 32)

   # Update .env
   sed -i "s/MCP_AUTH_TOKEN=.*/MCP_AUTH_TOKEN=${NEW_TOKEN}/" .env

   # Restart service
   npm run restart
   ```

4. **Use secrets management in production**
   ```bash
   # AWS Secrets Manager
   aws secretsmanager get-secret-value --secret-id taskflow/mcp-token

   # HashiCorp Vault
   vault kv get secret/taskflow/mcp-token
   ```

---

## File Watcher Configuration

### Enable File Watcher

File watcher automatically syncs TODO.md changes to the app.

#### Configuration

```typescript
// src/sync/database/sync-coordinator.ts

const watcherConfig = {
  // Watch TODO.md file
  path: process.env.TODO_PATH || './TODO.md',

  // Ignore patterns
  ignored: /(^|[\/\\])\.(git|node_modules)/,

  // Wait for file write to stabilize
  awaitWriteFinish: {
    stabilityThreshold: 1000,  // 1 second
    pollInterval: 100          // 100ms
  },

  // Performance
  persistent: true,
  ignoreInitial: false,

  // Platform-specific
  usePolling: false,           // Set to true for network drives
  interval: 100,               // Polling interval (if usePolling=true)
};
```

#### Platform-Specific Settings

##### macOS

```typescript
const watcherConfig = {
  usePolling: false,
  useFsEvents: true,  // Native macOS FSEvents API
};
```

##### Linux

```typescript
const watcherConfig = {
  usePolling: false,
  useInotify: true,   // Native Linux inotify API
};
```

##### Windows

```typescript
const watcherConfig = {
  usePolling: false,
  awaitWriteFinish: {
    stabilityThreshold: 2000,  // Longer stabilization
    pollInterval: 200
  }
};
```

##### Network Drives / Docker Volumes

```typescript
const watcherConfig = {
  usePolling: true,   // Required for network mounts
  interval: 1000,     // Poll every 1 second
};
```

### Disable File Watcher

To run sync manually only:

```bash
# Set environment variable
export ENABLE_FILE_WATCHER=false

# Or in code
const coordinator = new SyncCoordinator({
  config: { ... },
  fileWatcher: undefined  // Don't provide file watcher
});
```

---

## Monitoring and Logging

### Logging Configuration

#### Log Levels

```bash
# Development: Verbose logging
LOG_LEVEL=debug

# Staging: Moderate logging
LOG_LEVEL=info

# Production: Minimal logging
LOG_LEVEL=warn
```

#### Log Output

```bash
# Console only (development)
LOG_OUTPUT=console

# File only (production)
LOG_OUTPUT=file
LOG_FILE=./logs/sync.log

# Both console and file
LOG_OUTPUT=both
```

#### Structured Logging

```typescript
import { Logger } from './sync/utils/logger';

const logger = Logger.getInstance();

// Standard log
logger.info('Sync started', { direction: 'file_to_app' });

// Performance timing
const timer = logger.startTimer('sync-operation');
// ... perform operation ...
timer.done({ itemsProcessed: 100 });

// Security events
logger.logSecurityEvent(
  'auth_failure',
  { feature: 'mcp-todo-sync' },
  'Invalid token provided'
);
```

**Log Format**:
```json
{
  "level": "info",
  "time": "2025-11-09T10:30:00.123Z",
  "pid": 12345,
  "hostname": "taskflow-server",
  "msg": "Sync started",
  "direction": "file_to_app",
  "duration": 245,
  "itemsProcessed": 100
}
```

### Metrics Collection

#### Built-in Metrics

```typescript
const stats = coordinator.getStats();

// Prometheus-style metrics
const metrics = {
  'sync_total': stats.totalSyncs,
  'sync_success_total': stats.successfulSyncs,
  'sync_failure_total': stats.failedSyncs,
  'sync_duration_ms': stats.averageDurationMs,
  'sync_conflicts_total': stats.totalConflicts,
  'sync_conflicts_resolved': stats.autoResolvedConflicts,
};
```

#### Export to Prometheus

```typescript
// src/monitoring/prometheus.ts

import { register, Counter, Histogram } from 'prom-client';

const syncCounter = new Counter({
  name: 'taskflow_sync_total',
  help: 'Total number of sync operations',
  labelNames: ['direction', 'status']
});

const syncDuration = new Histogram({
  name: 'taskflow_sync_duration_seconds',
  help: 'Sync operation duration',
  labelNames: ['direction']
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

#### Grafana Dashboard

Example Prometheus queries:

```promql
# Sync success rate
rate(taskflow_sync_total{status="success"}[5m]) /
rate(taskflow_sync_total[5m]) * 100

# Average sync duration
avg(taskflow_sync_duration_seconds) by (direction)

# Conflict rate
rate(taskflow_sync_conflicts_total[5m])
```

### Health Checks

```typescript
// src/monitoring/health.ts

export async function healthCheck(): Promise<HealthStatus> {
  const stats = coordinator.getStats();
  const lastSyncAge = Date.now() - (stats.lastSyncAt?.getTime() || 0);

  return {
    status: lastSyncAge < 300000 ? 'healthy' : 'degraded',  // 5 min threshold
    checks: {
      lastSync: {
        status: lastSyncAge < 300000 ? 'pass' : 'warn',
        value: lastSyncAge,
        unit: 'ms'
      },
      successRate: {
        status: stats.totalSyncs > 0 && stats.successfulSyncs / stats.totalSyncs > 0.95 ? 'pass' : 'fail',
        value: stats.successfulSyncs / stats.totalSyncs * 100,
        unit: '%'
      },
      conflicts: {
        status: stats.totalConflicts === 0 ? 'pass' : 'warn',
        value: stats.totalConflicts
      }
    }
  };
}

// HTTP endpoint
app.get('/health', async (req, res) => {
  const health = await healthCheck();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});
```

---

## Backup Strategy

### Automatic Backups

Backups are created automatically before each sync operation.

#### Configuration

```bash
# Enable automatic backups
TODO_AUTO_BACKUP=true

# Retention period
TODO_BACKUP_RETENTION_DAYS=7

# Backup location
TODO_BACKUP_DIR=./backups
```

#### Backup Naming

```
TODO.md.backup.<timestamp>
```

Example:
```
TODO.md.backup.1699564800000
TODO.md.backup.1699565100000
TODO.md.backup.1699565400000
```

### Manual Backups

```bash
# Create manual backup
cp TODO.md TODO.md.backup.$(date +%s)

# Or use MCP tool
todo_sync backup
```

### Backup Rotation

Automatic cleanup of old backups:

```typescript
// src/sync/backup/rotation.ts

async function cleanupOldBackups(
  basePath: string,
  retentionDays: number
): Promise<void> {
  const backupPattern = `${basePath}.backup.*`;
  const backupFiles = await glob(backupPattern);

  const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);

  for (const file of backupFiles) {
    const timestamp = parseInt(file.split('.').pop()!);
    if (timestamp < cutoffTime) {
      await fs.unlink(file);
      logger.info(`Deleted old backup: ${file}`);
    }
  }
}
```

### Restore from Backup

```bash
# List backups
ls -lh TODO.md.backup.*

# Choose backup to restore
BACKUP_FILE=TODO.md.backup.1699564800000

# Restore (with current backup)
cp TODO.md TODO.md.backup.before-restore.$(date +%s)
cp ${BACKUP_FILE} TODO.md

# Sync restored file to app
todo_sync file_to_app
```

### Offsite Backup

```bash
# Sync backups to S3
aws s3 sync ./backups s3://taskflow-backups/$(hostname)/

# Or to cloud storage
rclone sync ./backups remote:taskflow-backups/
```

---

## Performance Tuning

### Optimization Strategies

#### 1. Adjust Debounce/Throttle

```bash
# Fast response (< 1 second), more frequent syncs
TODO_DEBOUNCE_MS=500
TODO_THROTTLE_MS=2000

# Balanced (1-2 seconds), moderate frequency
TODO_DEBOUNCE_MS=1000
TODO_THROTTLE_MS=5000

# Conservative (2-5 seconds), fewer syncs
TODO_DEBOUNCE_MS=2000
TODO_THROTTLE_MS=10000
```

#### 2. Increase File Size Limit

```bash
# For large TODO files (10,000+ tasks)
TODO_MAX_FILE_SIZE_MB=10
TODO_MAX_TASKS=50000
```

#### 3. Enable Caching

```typescript
// src/sync/performance/cache-manager.ts

const cacheConfig = {
  enabled: true,
  maxSize: 10000,      // Max cached items
  ttl: 300000,         // 5 minutes TTL
};
```

#### 4. Batch Size Tuning

```typescript
// src/sync/performance/batch-writer.ts

const batchConfig = {
  maxBatchSize: 100,   // Tasks per batch
  concurrency: 5,      // Parallel batches
};
```

### Performance Benchmarks

Target performance metrics:

| Operation | Tasks | Target | Measured |
|-----------|-------|--------|----------|
| Parse TODO.md | 100 | < 200ms | 150ms ✓ |
| Parse TODO.md | 1000 | < 1s | 800ms ✓ |
| Write IndexedDB | 100 | < 100ms | 50ms ✓ |
| 3-way Merge | 100 | < 500ms | 350ms ✓ |
| Full Sync (file→app) | 1000 | < 2s | 1.5s ✓ |

### Performance Testing

```bash
# Run performance tests
npm run test:perf

# Output:
# ✓ Parse 1000 tasks: 800ms (target: 1000ms)
# ✓ Write 1000 tasks: 120ms (target: 200ms)
# ✓ Full sync 1000 tasks: 1500ms (target: 2000ms)
```

### Memory Profiling

```bash
# Run with memory profiling
node --inspect dist/server.js

# Open Chrome DevTools
chrome://inspect

# Take heap snapshot before/after sync
# Check for memory leaks
```

---

## Security Hardening

### 1. File System Permissions

```bash
# Restrict TODO.md access
chmod 600 TODO.md

# Restrict backup directory
chmod 700 ./backups
chown $(whoami):$(whoami) ./backups
```

### 2. Path Validation

Ensure path validator is enabled:

```typescript
// src/sync/security/path-validator.ts

const validator = new PathValidator({
  allowedBasePath: process.cwd(),
  allowedExtensions: ['.md'],
  maxFileSize: 5 * 1024 * 1024,  // 5MB
});
```

### 3. Input Sanitization

DOMPurify configuration:

```typescript
// src/sync/security/sanitizer.ts

const sanitizeConfig = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_TRUSTED_TYPE: false,
};
```

### 4. Rate Limiting

```typescript
// src/mcp/middleware/rate-limit.ts

const rateLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,             // 100 requests per minute
  message: 'Too many sync requests, please try again later'
});

app.use('/mcp', rateLimiter);
```

### 5. Audit Logging

```typescript
// Log all security events
logger.logSecurityEvent('auth_attempt', { userId }, 'MCP auth attempt');
logger.logSecurityEvent('path_validation', { path }, 'Path validated');
logger.logSecurityEvent('xss_detected', { title }, 'XSS attempt blocked');
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] **Environment variables configured**
  - [ ] `MCP_AUTH_TOKEN` set (32+ characters)
  - [ ] `TODO_PATH` points to valid location
  - [ ] `LOG_LEVEL` appropriate for environment
  - [ ] `NODE_ENV=production`

- [ ] **Dependencies installed**
  ```bash
  npm ci --production
  ```

- [ ] **Application built**
  ```bash
  npm run build
  ```

- [ ] **Tests passing**
  ```bash
  npm test
  ```

- [ ] **Configuration validated**
  ```bash
  npm run validate:config
  ```

### Deployment

- [ ] **Deploy application**
  ```bash
  npm run deploy
  ```

- [ ] **Start service**
  ```bash
  npm start
  # Or with process manager:
  pm2 start dist/server.js --name taskflow-sync
  ```

- [ ] **Verify health endpoint**
  ```bash
  curl http://localhost:3000/health
  ```

- [ ] **Test sync operations**
  ```bash
  todo_sync status
  todo_sync file_to_app
  ```

### Post-Deployment

- [ ] **Monitor logs**
  ```bash
  tail -f logs/sync.log
  # Or with PM2:
  pm2 logs taskflow-sync
  ```

- [ ] **Check metrics**
  ```bash
  curl http://localhost:3000/metrics
  ```

- [ ] **Verify backups**
  ```bash
  ls -lh backups/
  ```

- [ ] **Set up monitoring alerts**
  - [ ] Sync failure rate > 5%
  - [ ] No sync in last 5 minutes
  - [ ] Unresolved conflicts > 10

- [ ] **Document deployment**
  - [ ] Update runbook
  - [ ] Record configuration
  - [ ] Note any issues encountered

### Rollback Plan

```bash
# Stop current version
pm2 stop taskflow-sync

# Restore previous version
git checkout <previous-tag>
npm ci --production
npm run build

# Restore backup if needed
cp TODO.md.backup.<timestamp> TODO.md

# Start previous version
pm2 start dist/server.js --name taskflow-sync

# Verify
curl http://localhost:3000/health
```

---

## Production Recommendations

### Process Management

Use PM2 for production:

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/server.js --name taskflow-sync

# Configure startup
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Systemd Service

```ini
# /etc/systemd/system/taskflow-sync.service

[Unit]
Description=TaskFlow TODO.md Sync Service
After=network.target

[Service]
Type=simple
User=taskflow
WorkingDirectory=/opt/taskflow-app/taskflow-graphql
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=taskflow-sync
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl enable taskflow-sync
sudo systemctl start taskflow-sync

# Check status
sudo systemctl status taskflow-sync

# View logs
sudo journalctl -u taskflow-sync -f
```

### Container Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

```bash
# Build and run
docker build -t taskflow-sync .
docker run -d \
  --name taskflow-sync \
  -v $(pwd)/TODO.md:/app/TODO.md \
  -v $(pwd)/backups:/app/backups \
  -e MCP_AUTH_TOKEN=${MCP_AUTH_TOKEN} \
  -p 3000:3000 \
  taskflow-sync
```

---

**Version**: 1.0
**Last Updated**: 2025-11-09
**Deployment Target**: Production
