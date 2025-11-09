# Production Deployment Guide

**Version**: 1.0.0
**Date**: 2025-11-09
**Status**: Ready for Review
**Security Audit**: Completed (see SECURITY_AUDIT_REPORT.md)

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Infrastructure Requirements](#infrastructure-requirements)
3. [Environment Configuration](#environment-configuration)
4. [Security Hardening](#security-hardening)
5. [Deployment Methods](#deployment-methods)
6. [Monitoring & Observability](#monitoring--observability)
7. [Backup & Recovery](#backup--recovery)
8. [Rollback Procedures](#rollback-procedures)
9. [Post-Deployment Verification](#post-deployment-verification)

---

## 🎯 Pre-Deployment Checklist

### Code Quality
- [x] TypeScript compilation: **0 errors**
- [x] Tests passing: **100+ tests, 100% pass rate**
- [x] Code coverage: **~85%**
- [x] Linting: No critical issues
- [ ] Security audit remediation: **Critical items addressed**

### Security (Based on Audit Results)
- [ ] **CRITICAL-01**: Add GraphQL query depth/complexity limits
- [ ] **CRITICAL-02**: Implement input validation framework
- [ ] **CRITICAL-03**: Remove API key from console logs
- [ ] **HIGH-01**: Enable Redis TLS connection
- [ ] **HIGH-02**: Implement authentication/authorization
- [ ] **HIGH-03**: Configure proper CORS policy

### Documentation
- [x] API documentation complete
- [x] Environment variables documented (.env.example)
- [x] Week 8 completion report
- [x] Week 9 planning document
- [x] Security audit report
- [ ] Production runbook
- [ ] Incident response playbook

### Infrastructure
- [ ] Production server provisioned
- [ ] Redis server configured
- [ ] Domain name configured
- [ ] SSL/TLS certificates obtained
- [ ] CDN configured (optional)
- [ ] Load balancer configured (optional)

---

## 🏗️ Infrastructure Requirements

### Minimum Requirements

**Application Server**:
- CPU: 2 vCPUs
- RAM: 4GB
- Storage: 20GB SSD
- Network: 100 Mbps
- OS: Ubuntu 22.04 LTS / Amazon Linux 2023

**Redis Server**:
- CPU: 1 vCPU
- RAM: 2GB
- Storage: 10GB SSD
- Version: Redis 7.x

**External Services**:
- OpenAI API account (gpt-4o-mini)
- IP Geolocation API (optional premium tier)
- Monitoring service (Datadog, New Relic, or similar)
- Log aggregation (ELK, Splunk, or CloudWatch)

### Recommended Production Setup

**Application Servers** (2+ instances):
- CPU: 4 vCPUs
- RAM: 8GB
- Storage: 50GB SSD
- Auto-scaling: Min 2, Max 10 instances
- Load balancer: Application Load Balancer (ALB)

**Redis Cluster**:
- Redis Cluster or ElastiCache (AWS)
- 3-node cluster with automatic failover
- Persistence: AOF + RDB snapshots
- Backup: Daily snapshots, 7-day retention

**CDN**:
- CloudFlare or AWS CloudFront
- Global edge locations
- DDoS protection

---

## ⚙️ Environment Configuration

### Production Environment Variables

Create `.env` file (DO NOT commit to Git):

```bash
# ============================================================================
# Server Configuration
# ============================================================================
NODE_ENV=production
PORT=4000

# ============================================================================
# AI Integration
# ============================================================================
AI_API_ENABLED=true
AI_PROVIDER=openai
AI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx  # REQUIRED
AI_MODEL=gpt-4o-mini

# ============================================================================
# IP Geolocation
# ============================================================================
# Optional: Use premium tier for better reliability
IP_GEOLOCATION_API_KEY=your_premium_api_key_here

# ============================================================================
# Redis Configuration (REQUIRED for production)
# ============================================================================
REDIS_ENABLED=true

# Option 1: Redis URL (recommended for managed services)
REDIS_URL=rediss://username:password@redis.example.com:6380/0  # Note: rediss:// for TLS

# Option 2: Individual settings (for self-hosted)
# REDIS_HOST=redis.example.com
# REDIS_PORT=6380
# REDIS_PASSWORD=strong_password_here
# REDIS_DB=0
# REDIS_TLS=true  # IMPORTANT: Enable TLS in production

# Rate Limiting Configuration
RATE_LIMIT_MAX_REQUESTS=1000  # Increase for production
RATE_LIMIT_WINDOW_SECONDS=60

# ============================================================================
# Logging Configuration
# ============================================================================
LOG_LEVEL=info  # info in production, debug for troubleshooting

# Sentry DSN for error tracking (RECOMMENDED)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# ============================================================================
# Security Configuration (NEW - to be implemented)
# ============================================================================
# GraphQL Security
GRAPHQL_DEPTH_LIMIT=10
GRAPHQL_COMPLEXITY_LIMIT=1000

# CORS Configuration
CORS_ORIGIN=https://taskflow.example.com,https://app.taskflow.example.com
CORS_CREDENTIALS=true

# Authentication (to be implemented)
# JWT_SECRET=your_jwt_secret_here  # Generate with: openssl rand -base64 32
# JWT_EXPIRES_IN=7d
# REFRESH_TOKEN_EXPIRES_IN=30d

# ============================================================================
# Monitoring & Observability
# ============================================================================
# APM Service (optional)
# NEW_RELIC_LICENSE_KEY=your_new_relic_key
# DATADOG_API_KEY=your_datadog_key

# Health Check Configuration
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_TIMEOUT=5000
```

### Environment Variable Validation

Create `src/config/env-validation.ts`:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().regex(/^\d+$/).transform(Number),

  // AI Configuration
  AI_API_ENABLED: z.enum(['true', 'false']).transform(v => v === 'true'),
  AI_API_KEY: z.string().min(20).optional(),
  AI_MODEL: z.string().default('gpt-4o-mini'),

  // Redis Configuration
  REDIS_ENABLED: z.enum(['true', 'false']).transform(v => v === 'true'),
  REDIS_URL: z.string().url().optional(),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error', 'fatal']),

  // Security
  GRAPHQL_DEPTH_LIMIT: z.string().regex(/^\d+$/).transform(Number).default('10'),
  GRAPHQL_COMPLEXITY_LIMIT: z.string().regex(/^\d+$/).transform(Number).default('1000'),
});

export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
}
```

---

## 🔒 Security Hardening

### Critical Security Fixes (Pre-Deployment Required)

#### 1. GraphQL Query Depth & Complexity Limits

```bash
# Install dependencies
npm install graphql-depth-limit graphql-validation-complexity
```

```typescript
// src/server.ts
import depthLimit from 'graphql-depth-limit';
import { createComplexityLimitRule } from 'graphql-validation-complexity';

const server = new ApolloServer({
  schema,
  validationRules: [
    depthLimit(parseInt(process.env.GRAPHQL_DEPTH_LIMIT || '10', 10)),
    createComplexityLimitRule(parseInt(process.env.GRAPHQL_COMPLEXITY_LIMIT || '1000', 10)),
  ],
  // ... other config
});
```

#### 2. Input Validation Framework

```bash
# Install dependencies
npm install zod validator dompurify
npm install --save-dev @types/validator @types/dompurify
```

```typescript
// src/utils/validation.ts
import { z } from 'zod';
import validator from 'validator';
import DOMPurify from 'dompurify';

export const TaskInputSchema = z.object({
  title: z.string().min(1).max(200).transform(str => DOMPurify.sanitize(str)),
  description: z.string().max(5000).optional().transform(str =>
    str ? DOMPurify.sanitize(str) : undefined
  ),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  dueDate: z.string().refine(validator.isISO8601).optional(),
});

// Usage in resolvers
export const createTask = async (parent, args, context) => {
  const validated = TaskInputSchema.parse(args.input);
  // ... rest of resolver
};
```

#### 3. Remove Console Logging

```typescript
// src/utils/ai-client.ts - BEFORE
console.log('OpenAI API Key:', process.env.AI_API_KEY); // REMOVE THIS

// AFTER
import { logger } from './logger.js';
logger.debug('OpenAI client initialized', {
  model: process.env.AI_MODEL,
  enabled: process.env.AI_API_ENABLED
  // DO NOT log API key
});
```

#### 4. Enable Redis TLS

```typescript
// src/utils/redis-client.ts
import Redis from 'ioredis';

export function getRedisClient(): Redis | null {
  if (!REDIS_ENABLED) return null;

  const options = {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
    // Production TLS configuration
    ...(process.env.NODE_ENV === 'production' && {
      tls: {
        rejectUnauthorized: true,
      },
    }),
  };

  if (REDIS_URL) {
    return new Redis(REDIS_URL, options);
  }

  return new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    db: REDIS_DB,
    ...options,
  });
}
```

#### 5. Security Headers

```bash
npm install helmet
```

```typescript
// src/server.ts
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

#### 6. CORS Configuration

```typescript
// src/server.ts
app.use(
  '/graphql',
  cors<cors.CorsRequest>({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [];

      // Allow no origin for same-origin requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: process.env.CORS_CREDENTIALS === 'true',
  }),
  // ... rest of middleware
);
```

---

## 🚀 Deployment Methods

### Method 1: Docker Deployment (Recommended)

#### Dockerfile

```dockerfile
# Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/server.js"]
```

#### docker-compose.yml (for local testing)

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
    env_file:
      - .env.production
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
```

#### Build and Deploy

```bash
# Build Docker image
docker build -t taskflow-graphql:1.0.0 .

# Test locally
docker-compose up -d

# Tag for registry
docker tag taskflow-graphql:1.0.0 your-registry.com/taskflow-graphql:1.0.0

# Push to registry
docker push your-registry.com/taskflow-graphql:1.0.0

# Deploy to production server
ssh production-server << 'EOF'
  docker pull your-registry.com/taskflow-graphql:1.0.0
  docker stop taskflow-graphql || true
  docker rm taskflow-graphql || true
  docker run -d \
    --name taskflow-graphql \
    --restart unless-stopped \
    -p 4000:4000 \
    --env-file /opt/taskflow/.env \
    your-registry.com/taskflow-graphql:1.0.0
EOF
```

### Method 2: PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Build application
npm run build

# PM2 ecosystem file
```

**ecosystem.config.js**:

```javascript
module.exports = {
  apps: [{
    name: 'taskflow-graphql',
    script: './dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    max_memory_restart: '1G',
    watch: false,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
  }],
};
```

```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Method 3: Kubernetes Deployment

**deployment.yaml**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: taskflow-graphql
spec:
  replicas: 3
  selector:
    matchLabels:
      app: taskflow-graphql
  template:
    metadata:
      labels:
        app: taskflow-graphql
    spec:
      containers:
      - name: taskflow-graphql
        image: your-registry.com/taskflow-graphql:1.0.0
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: taskflow-secrets
              key: redis-url
        - name: AI_API_KEY
          valueFrom:
            secretKeyRef:
              name: taskflow-secrets
              key: openai-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: taskflow-graphql
spec:
  selector:
    app: taskflow-graphql
  ports:
  - port: 80
    targetPort: 4000
  type: LoadBalancer
```

---

## 📊 Monitoring & Observability

### Health Check Endpoint

Already implemented at `/health`:

```bash
curl http://localhost:4000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-09T10:30:00.000Z",
  "message": "TaskFlow GraphQL Server is running",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Metrics to Monitor

**Application Metrics**:
- Request rate (req/sec)
- Response time (p50, p95, p99)
- Error rate (%)
- GraphQL query complexity
- Rate limit rejections

**Infrastructure Metrics**:
- CPU usage (%)
- Memory usage (MB)
- Disk I/O
- Network bandwidth
- Redis connection pool

**Business Metrics**:
- Active users
- Tasks created/updated
- AI recommendations served
- Webhook deliveries

### Logging Strategy

**Structured Logging** (Already implemented with Pino):

```json
{
  "level": 30,
  "time": "2025-11-09T10:30:00.123Z",
  "env": "production",
  "type": "http_request",
  "method": "POST",
  "url": "/graphql",
  "ip": "192.168.1.100",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "msg": "HTTP Request"
}
```

**Log Levels**:
- `error`: Application errors, exceptions
- `warn`: Warnings, rate limits, retries
- `info`: Normal operations, requests, responses
- `debug`: Development debugging (disable in production)

**Log Aggregation**:
- Ship logs to ELK Stack, Splunk, or CloudWatch
- Set up alerts for error spikes
- Create dashboards for key metrics

### Recommended Monitoring Tools

**APM (Application Performance Monitoring)**:
- **New Relic**: Full-stack observability
- **Datadog**: Infrastructure + APM
- **AWS CloudWatch**: For AWS deployments

**Error Tracking**:
- **Sentry**: Real-time error tracking (recommended)
- **Rollbar**: Error monitoring
- **Bugsnag**: Error reporting

**Uptime Monitoring**:
- **UptimeRobot**: Simple uptime checks
- **Pingdom**: Advanced monitoring
- **StatusCake**: Multi-location checks

---

## 💾 Backup & Recovery

### Data Backup Strategy

**Redis Backups**:
```bash
# Configure Redis persistence (redis.conf)
save 900 1      # Save after 900 sec if at least 1 key changed
save 300 10     # Save after 300 sec if at least 10 keys changed
save 60 10000   # Save after 60 sec if at least 10000 keys changed

appendonly yes  # Enable AOF persistence
appendfsync everysec

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/redis"
DATE=$(date +%Y%m%d_%H%M%S)

redis-cli BGSAVE
sleep 5
cp /var/lib/redis/dump.rdb "$BACKUP_DIR/dump_$DATE.rdb"

# Retain last 7 days
find "$BACKUP_DIR" -name "dump_*.rdb" -mtime +7 -delete
```

**Configuration Backups**:
- Store `.env` files securely (encrypted vault)
- Version control configuration files
- Document manual configuration steps

### Disaster Recovery Plan

**RTO (Recovery Time Objective)**: 30 minutes
**RPO (Recovery Point Objective)**: 1 hour

**Recovery Steps**:
1. Provision new server/container
2. Restore Redis from backup
3. Deploy application from Docker registry
4. Restore environment variables
5. Verify health check
6. Update DNS/load balancer
7. Monitor for issues

---

## 🔄 Rollback Procedures

### Quick Rollback

**Docker**:
```bash
# Rollback to previous version
docker stop taskflow-graphql
docker run -d \
  --name taskflow-graphql \
  --restart unless-stopped \
  -p 4000:4000 \
  --env-file /opt/taskflow/.env \
  your-registry.com/taskflow-graphql:0.9.0  # Previous version
```

**PM2**:
```bash
# Stop current version
pm2 stop taskflow-graphql

# Checkout previous version
git checkout v0.9.0
npm ci
npm run build

# Start previous version
pm2 start ecosystem.config.js --env production
```

**Kubernetes**:
```bash
# Rollback to previous deployment
kubectl rollout undo deployment/taskflow-graphql

# Rollback to specific revision
kubectl rollout undo deployment/taskflow-graphql --to-revision=2
```

### Rollback Checklist

- [ ] Identify issue and confirm rollback needed
- [ ] Notify team/stakeholders
- [ ] Execute rollback procedure
- [ ] Verify health check passes
- [ ] Monitor error rates and metrics
- [ ] Document incident (postmortem)

---

## ✅ Post-Deployment Verification

### Smoke Tests

```bash
# 1. Health check
curl https://api.taskflow.example.com/health

# 2. GraphQL introspection
curl -X POST https://api.taskflow.example.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name } } }"}'

# 3. Create task test
curl -X POST https://api.taskflow.example.com/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createTask(input: { title: \"Test\", priority: \"low\" }) { id title } }"
  }'

# 4. Rate limiting test
for i in {1..5}; do
  curl -I https://api.taskflow.example.com/graphql
done
# Check X-RateLimit-* headers

# 5. WebSocket connection test
wscat -c wss://api.taskflow.example.com/graphql
```

### Performance Baseline

Run load tests to establish baseline:

```bash
# Install autocannon
npm install -g autocannon

# Run load test
autocannon -c 100 -d 30 \
  -H "Content-Type: application/json" \
  -m POST \
  -b '{"query":"{ tasks { id } }"}' \
  https://api.taskflow.example.com/graphql
```

**Expected Results**:
- Requests/sec: 1000+
- Latency p50: <50ms
- Latency p95: <100ms
- Error rate: <0.1%

### Monitoring Setup Verification

- [ ] Logs flowing to aggregation service
- [ ] Metrics being collected
- [ ] Alerts configured and tested
- [ ] Error tracking active (Sentry)
- [ ] Uptime monitoring active
- [ ] Team notifications working

---

## 📚 Additional Resources

### Production Runbook

Create detailed runbook for operations team:
- Common issues and resolutions
- Scaling procedures
- Maintenance windows
- On-call procedures

### Incident Response Playbook

Document incident response procedures:
- Severity classification
- Escalation paths
- Communication templates
- Postmortem template

### Compliance & Auditing

For regulated industries:
- GDPR compliance checklist
- SOC 2 requirements
- HIPAA considerations (if applicable)
- Audit log retention policies

---

## 🎯 Production Readiness Score

| Category | Status | Score |
|----------|--------|-------|
| **Code Quality** | ✅ Complete | 95% |
| **Testing** | ✅ Complete | 85% |
| **Security** | ⚠️ Partial | 65% |
| **Documentation** | ✅ Complete | 90% |
| **Monitoring** | ⚠️ Planned | 50% |
| **Infrastructure** | ⚠️ Planned | 40% |
| **Disaster Recovery** | ⚠️ Planned | 50% |

**Overall Readiness**: **68%** - Needs security hardening and infrastructure setup

### Next Steps to 100%

1. **Complete security fixes** (Critical items from audit) - 1 week
2. **Set up production infrastructure** - 3-5 days
3. **Implement monitoring & observability** - 2-3 days
4. **Test disaster recovery procedures** - 1-2 days
5. **Conduct load testing** - 1 day
6. **Final security review** - 1 day

**Estimated time to production-ready**: **2-3 weeks**

---

## 📞 Support & Contact

**Production Issues**: production-alerts@taskflow.example.com
**Security Issues**: security@taskflow.example.com
**General Support**: support@taskflow.example.com

**On-Call Rotation**: See PagerDuty schedule

---

**Last Updated**: 2025-11-09
**Next Review**: 2025-12-09
**Document Owner**: DevOps Team
