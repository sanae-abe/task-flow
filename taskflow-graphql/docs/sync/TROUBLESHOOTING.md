# TODO.md Sync System - Troubleshooting Guide

Comprehensive troubleshooting guide for common issues and error scenarios.

## Table of Contents

- [Common Issues](#common-issues)
- [Error Codes](#error-codes)
- [Debug Logging](#debug-logging)
- [Performance Issues](#performance-issues)
- [Conflict Resolution](#conflict-resolution)
- [File System Issues](#file-system-issues)
- [Authentication Problems](#authentication-problems)
- [Recovery Procedures](#recovery-procedures)

---

## Common Issues

### Issue 1: File Not Found

**Symptoms**:
```
Error: ENOENT: no such file or directory, open './TODO.md'
```

**Causes**:
1. TODO.md doesn't exist
2. Incorrect path in configuration
3. Permission issues

**Solutions**:

**Solution 1**: Create TODO.md
```bash
# Create empty TODO.md
touch TODO.md

# Or create with basic structure
cat > TODO.md << 'EOF'
# 📋 TaskFlow TODO

## 🔴 High Priority

- [ ] Your first task

EOF
```

**Solution 2**: Verify path configuration
```bash
# Check environment variable
echo $TODO_PATH

# Verify file exists
ls -la $(echo $TODO_PATH)

# Fix path if needed
export TODO_PATH=./TODO.md
```

**Solution 3**: Check permissions
```bash
# Check file permissions
ls -l TODO.md

# Fix permissions if needed
chmod 644 TODO.md

# Check directory permissions
ls -ld $(dirname TODO.md)
```

---

### Issue 2: Authentication Failed

**Symptoms**:
```
Error: Authentication failed. MCP_AUTH_TOKEN is not valid or not configured.
```

**Causes**:
1. MCP_AUTH_TOKEN not set
2. Token too short (< 16 characters)
3. Token mismatch between server and client

**Solutions**:

**Solution 1**: Set auth token
```bash
# Generate token
export MCP_AUTH_TOKEN=$(openssl rand -base64 32)

# Add to .env
echo "MCP_AUTH_TOKEN=${MCP_AUTH_TOKEN}" >> .env

# Restart server
npm restart
```

**Solution 2**: Verify token length
```bash
# Check token length
echo -n $MCP_AUTH_TOKEN | wc -c

# Should be >= 16 characters
# Regenerate if too short
export MCP_AUTH_TOKEN=$(openssl rand -base64 32)
```

**Solution 3**: Sync tokens
```bash
# Server token
grep MCP_AUTH_TOKEN .env

# Client token (Claude Code config)
cat ~/.claude/config.json | jq '.mcpServers.taskflow.env.MCP_AUTH_TOKEN'

# Ensure they match!
```

---

### Issue 3: Sync Loop Detected

**Symptoms**:
```
Warning: Potential sync loop detected, pausing file watcher
```

**Causes**:
1. File watcher not properly paused during writes
2. Multiple sync processes running
3. External process modifying TODO.md

**Solutions**:

**Solution 1**: Check pause mechanism
```typescript
// Verify watcher pause in logs
DEBUG=sync:* npm start

// Look for:
// sync:watcher Pausing watcher for write
// sync:watcher Resuming watcher after 1000ms
```

**Solution 2**: Check for duplicate processes
```bash
# Find sync processes
ps aux | grep 'taskflow-sync\|todo_sync'

# Kill duplicates
kill <pid>

# Or use PM2
pm2 list
pm2 delete taskflow-sync
pm2 start dist/server.js --name taskflow-sync
```

**Solution 3**: Increase debounce delay
```bash
# Edit .env
TODO_DEBOUNCE_MS=2000  # Increase from 1000 to 2000
TODO_THROTTLE_MS=10000 # Increase from 5000 to 10000

# Restart
npm restart
```

---

### Issue 4: Parse Errors

**Symptoms**:
```
Error: Failed to parse TODO.md at line 42: Invalid task format
```

**Causes**:
1. Malformed Markdown syntax
2. Invalid checkbox format
3. Unexpected characters

**Solutions**:

**Solution 1**: Validate TODO.md format
```bash
# Check specific line
sed -n '42p' TODO.md

# Common issues:
# ❌ -[ ] Task           (missing space)
# ❌ - [] Task           (space in checkbox)
# ❌ - [x ] Task         (space after x)
# ✅ - [ ] Task          (correct)
# ✅ - [x] Task          (correct)
```

**Solution 2**: Use dry run to preview
```bash
# Test parse without applying changes
todo_sync file_to_app --dryRun

# Output shows which tasks would be synced
# Fix format issues before actual sync
```

**Solution 3**: Auto-fix common issues
```bash
# Remove BOM (Byte Order Mark)
sed -i '1s/^\xEF\xBB\xBF//' TODO.md

# Fix mixed line endings
dos2unix TODO.md

# Remove trailing whitespace
sed -i 's/[[:space:]]*$//' TODO.md
```

---

### Issue 5: High Memory Usage

**Symptoms**:
```
Node.js heap out of memory
Process killed (OOM)
```

**Causes**:
1. Very large TODO.md file (> 10,000 tasks)
2. Memory leaks in cache
3. Large diff accumulation

**Solutions**:

**Solution 1**: Increase memory limit
```bash
# Increase Node.js heap size
export NODE_OPTIONS="--max-old-space-size=4096"  # 4GB

# Restart
npm restart
```

**Solution 2**: Split large TODO files
```bash
# Split into multiple files
mv TODO.md TODO-main.md
cat TODO-main.md | grep "🔴" > TODO-high-priority.md
cat TODO-main.md | grep "🟠" > TODO-medium-priority.md
cat TODO-main.md | grep "🟢" > TODO-low-priority.md

# Sync each separately
todo_sync file_to_app --todoPath ./TODO-high-priority.md
todo_sync file_to_app --todoPath ./TODO-medium-priority.md
todo_sync file_to_app --todoPath ./TODO-low-priority.md
```

**Solution 3**: Clear cache
```typescript
// In code: Clear cache periodically
import { CacheManager } from './sync/performance/cache-manager';

const cache = CacheManager.getInstance();
cache.clear();  // Clear all cached data
```

**Solution 4**: Increase task limit
```bash
# Edit .env
TODO_MAX_TASKS=50000  # Increase from 10000

# Or use streaming parser for very large files
TODO_USE_STREAMING_PARSER=true
```

---

### Issue 6: Conflicts Not Resolving

**Symptoms**:
```
Warning: 5 unresolved conflicts detected
```

**Causes**:
1. Conflict resolution policy set to 'manual'
2. Both file and app modified same field
3. Conflict resolver not configured

**Solutions**:

**Solution 1**: Check conflict resolution policy
```bash
# View current policy
todo_sync status | jq '.config.conflictResolution'

# Change policy
export TODO_CONFLICT_RESOLUTION=prefer_file  # or prefer_app

# Retry sync
todo_sync file_to_app --force
```

**Solution 2**: Review conflicts manually
```bash
# Get conflict details
todo_sync status --format=json > conflicts.json

# View conflicts
cat conflicts.json | jq '.unresolvedConflicts.conflicts[]'

# Example output:
# {
#   "taskId": "task-123",
#   "conflictType": "both_modified",
#   "fileVersion": { "status": "completed" },
#   "appVersion": { "status": "in_progress" }
# }
```

**Solution 3**: Resolve conflicts manually
```bash
# Option 1: Accept file version
todo_sync file_to_app --conflictResolution=prefer_file

# Option 2: Accept app version
todo_sync app_to_file --conflictResolution=prefer_app

# Option 3: Edit TODO.md or app to match
# Then re-sync
```

---

### Issue 7: Slow Sync Performance

**Symptoms**:
```
Sync taking > 5 seconds for 100 tasks
Average duration: 8234ms
```

**Causes**:
1. Large file without differential sync
2. Inefficient database writes
3. Network file system

**Solutions**:

**Solution 1**: Enable performance optimizations
```bash
# Edit .env
TODO_USE_DIFF_DETECTOR=true        # Enable differential sync
TODO_USE_BATCH_WRITER=true         # Enable batch writes
TODO_DEBOUNCE_MS=500               # Reduce delay
```

**Solution 2**: Profile performance
```bash
# Run with profiling
node --prof dist/server.js

# Analyze profile
node --prof-process isolate-*.log > profile.txt

# Identify bottlenecks
grep -A 5 "Statistical profiling" profile.txt
```

**Solution 3**: Optimize for network drives
```bash
# Use polling instead of native file watching
export TODO_USE_POLLING=true
export TODO_POLL_INTERVAL=2000  # 2 seconds

# Reduce sync frequency
export TODO_THROTTLE_MS=10000   # 10 seconds
```

---

## Error Codes

### ERR_SYNC_001: Path Traversal Detected

**Error**:
```
Error [ERR_SYNC_001]: Path traversal attempt detected: ../../../etc/passwd
```

**Cause**: Attempted to access file outside allowed directory

**Solution**:
```bash
# Use relative path from project root
TODO_PATH=./TODO.md

# Or absolute path within project
TODO_PATH=/absolute/path/to/project/TODO.md

# Never use:
# ❌ TODO_PATH=../../../etc/passwd
# ❌ TODO_PATH=/etc/passwd
```

---

### ERR_SYNC_002: File Size Exceeded

**Error**:
```
Error [ERR_SYNC_002]: File size exceeds 5MB limit: 8.3MB
```

**Cause**: TODO.md larger than configured limit

**Solution**:
```bash
# Option 1: Increase limit
export TODO_MAX_FILE_SIZE_MB=10

# Option 2: Split file
# See "Issue 5: High Memory Usage" above

# Option 3: Archive completed tasks
# Move old completed tasks to ARCHIVE.md
```

---

### ERR_SYNC_003: XSS Detected

**Error**:
```
Error [ERR_SYNC_003]: Potentially malicious content detected in task title
```

**Cause**: Task contains script tags or dangerous HTML

**Solution**:
```bash
# Edit TODO.md and remove script tags
# Before:
- [ ] <script>alert('XSS')</script> Task

# After:
- [ ] Task

# System automatically sanitizes, but logs warning
```

---

### ERR_SYNC_004: Database Locked

**Error**:
```
Error [ERR_SYNC_004]: IndexedDB database locked, retry in 1000ms
```

**Cause**: Another process has exclusive lock on database

**Solution**:
```bash
# Wait for automatic retry (3 attempts)
# Or manually retry:
sleep 2
todo_sync file_to_app

# If persists, close other tabs/windows using TaskFlow
# Or clear IndexedDB:
# Chrome DevTools > Application > IndexedDB > taskflow > Delete
```

---

### ERR_SYNC_005: Circuit Breaker Open

**Error**:
```
Error [ERR_SYNC_005]: Circuit breaker open, sync service temporarily unavailable
```

**Cause**: Too many consecutive failures (> 5)

**Solution**:
```bash
# Wait 30 seconds for auto-recovery
sleep 30
todo_sync status

# Or manually reset circuit breaker
todo_sync reset-breaker

# Check health
todo_sync status

# Fix underlying issue (check logs)
tail -f logs/sync.log
```

---

## Debug Logging

### Enable Debug Mode

```bash
# Enable all debug logs
export LOG_LEVEL=debug
export DEBUG=sync:*

# Or specific modules
export DEBUG=sync:parser,sync:merger,sync:watcher

# Restart
npm restart
```

### Debug Output

```
DEBUG sync:watcher File change detected: TODO.md +0ms
DEBUG sync:parser Parsing TODO.md (12 lines) +5ms
DEBUG sync:parser Found 3 tasks +2ms
DEBUG sync:merger Merging base(3) + file(3) + app(2) +1ms
DEBUG sync:merger Detected 1 conflict in task-123 +3ms
DEBUG sync:resolver Resolving conflict: prefer_file policy +0ms
DEBUG sync:writer Writing 3 tasks to IndexedDB +2ms
DEBUG sync:writer Batch write completed in 45ms +50ms
DEBUG sync:coordinator Sync completed successfully (total: 108ms) +8ms
```

### Verbose Logging

```bash
# Maximum verbosity
export LOG_LEVEL=trace
export DEBUG=*

# Outputs every function call
# WARNING: Very large log files!
```

### Log Analysis

```bash
# Find errors
grep ERROR logs/sync.log

# Find slow operations (> 1s)
grep -E "duration.*[0-9]{4,}" logs/sync.log

# Count sync operations
grep "Sync completed" logs/sync.log | wc -l

# Average sync duration
grep "Sync completed" logs/sync.log | \
  grep -oE "duration.*[0-9]+" | \
  awk '{sum+=$2; count++} END {print sum/count}'
```

---

## Performance Issues

### Diagnosis Checklist

- [ ] **Check file size**: `ls -lh TODO.md`
- [ ] **Check task count**: `grep -c "^- \[" TODO.md`
- [ ] **Check sync duration**: `todo_sync status | jq '.performance.averageDurationMs'`
- [ ] **Check memory usage**: `ps aux | grep node`
- [ ] **Check CPU usage**: `top -p $(pgrep -f taskflow)`

### Performance Benchmarks

| Scenario | Expected | Action if Slower |
|----------|----------|------------------|
| Parse 100 tasks | < 200ms | Enable diff detector |
| Parse 1000 tasks | < 1s | Enable streaming parser |
| Write 100 tasks | < 100ms | Enable batch writer |
| Full sync 1000 tasks | < 2s | Increase memory, split file |

### Optimization Steps

1. **Enable Differential Sync**
   ```bash
   export TODO_USE_DIFF_DETECTOR=true
   ```

2. **Enable Batch Writes**
   ```bash
   export TODO_USE_BATCH_WRITER=true
   ```

3. **Increase Memory**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

4. **Reduce Sync Frequency**
   ```bash
   export TODO_DEBOUNCE_MS=2000
   export TODO_THROTTLE_MS=10000
   ```

5. **Profile and Identify Bottlenecks**
   ```bash
   node --prof dist/server.js
   node --prof-process isolate-*.log
   ```

---

## Conflict Resolution

### Understanding Conflicts

**Conflict Types**:
1. **both_modified**: Both file and app changed same field
2. **local_deleted**: App deleted task, file modified it
3. **remote_deleted**: File deleted task, app modified it

### Viewing Conflicts

```bash
# Get conflict summary
todo_sync status | jq '.unresolvedConflicts'

# Get detailed conflict info
todo_sync status --format=json | \
  jq '.unresolvedConflicts.conflicts[] | {
    taskId,
    type: .conflictType,
    fileStatus: .fileVersion.status,
    appStatus: .appVersion.status
  }'
```

### Resolving Conflicts

#### Strategy 1: Prefer File

```bash
# Use file version for all conflicts
todo_sync file_to_app --conflictResolution=prefer_file
```

#### Strategy 2: Prefer App

```bash
# Use app version for all conflicts
todo_sync app_to_file --conflictResolution=prefer_app
```

#### Strategy 3: Manual Resolution

```bash
# 1. View conflicts
todo_sync status > conflicts.txt

# 2. Edit TODO.md or app to resolve
# Make changes so both match

# 3. Re-sync
todo_sync file_to_app --force
```

#### Strategy 4: Field-Specific

```typescript
// Custom resolver
class CustomConflictResolver extends ConflictResolver {
  resolve(conflict: FieldConflict): any {
    // Always prefer completed status
    if (conflict.field === 'status') {
      if (conflict.fileValue === 'completed' || conflict.appValue === 'completed') {
        return 'completed';
      }
    }

    // Prefer higher priority
    if (conflict.field === 'priority') {
      const priorities = { low: 1, medium: 2, high: 3 };
      return priorities[conflict.fileValue] >= priorities[conflict.appValue]
        ? conflict.fileValue
        : conflict.appValue;
    }

    return super.resolve(conflict);
  }
}
```

---

## File System Issues

### Permission Denied

**Error**:
```
Error: EACCES: permission denied, open './TODO.md'
```

**Solution**:
```bash
# Check permissions
ls -l TODO.md

# Fix permissions
chmod 644 TODO.md

# Check ownership
ls -l TODO.md
chown $(whoami) TODO.md
```

### File in Use

**Error**:
```
Error: EBUSY: resource busy or locked
```

**Solution**:
```bash
# Close other programs using TODO.md
lsof | grep TODO.md

# Or force unlock (macOS)
rm -f TODO.md~

# Windows: Close applications
tasklist | findstr TODO.md
```

### Network Drive Issues

**Symptoms**:
- File watcher not detecting changes
- Slow sync performance

**Solution**:
```bash
# Enable polling for network drives
export TODO_USE_POLLING=true
export TODO_POLL_INTERVAL=2000

# Increase timeouts
export TODO_DEBOUNCE_MS=2000
export TODO_WRITE_TIMEOUT_MS=5000
```

---

## Authentication Problems

### Token Not Set

```bash
# Check if token exists
echo $MCP_AUTH_TOKEN

# Set token
export MCP_AUTH_TOKEN=$(openssl rand -base64 32)

# Persist
echo "MCP_AUTH_TOKEN=${MCP_AUTH_TOKEN}" >> .env
```

### Token Mismatch

```bash
# Server token
grep MCP_AUTH_TOKEN .env

# Client token
cat ~/.claude/config.json | jq '.mcpServers.taskflow.env.MCP_AUTH_TOKEN'

# Update client
# Edit ~/.claude/config.json
# Set "MCP_AUTH_TOKEN" to match server token
```

### Token Too Short

```bash
# Generate proper length token (32+ chars)
export MCP_AUTH_TOKEN=$(openssl rand -base64 32)

# Verify length
echo -n $MCP_AUTH_TOKEN | wc -c
# Should output: 44
```

---

## Recovery Procedures

### Corrupted TODO.md

**Symptoms**:
- Parse errors
- Unexpected task data
- Sync failures

**Recovery**:
```bash
# 1. Stop sync
npm stop

# 2. Backup current file
cp TODO.md TODO.md.corrupted.$(date +%s)

# 3. Restore from backup
ls -lt TODO.md.backup.* | head -1  # Find latest backup
cp TODO.md.backup.1699564800000 TODO.md

# 4. Validate restored file
todo_sync file_to_app --dryRun

# 5. Sync if valid
todo_sync file_to_app
```

### Lost Data Recovery

**Scenario**: Accidentally deleted tasks

**Recovery**:
```bash
# 1. Check backups
ls -lt TODO.md.backup.*

# 2. View backup content
cat TODO.md.backup.1699564800000

# 3. Extract lost tasks
diff TODO.md TODO.md.backup.1699564800000

# 4. Manually add back to TODO.md
# Or restore entire backup (see above)
```

### IndexedDB Corruption

**Symptoms**:
- Database errors
- Tasks not loading in UI
- Sync failures

**Recovery**:
```bash
# 1. Export current state to file
todo_sync app_to_file --force

# 2. Clear IndexedDB
# Chrome DevTools > Application > IndexedDB > taskflow > Delete

# 3. Re-import from file
todo_sync file_to_app --force
```

### Complete System Reset

**Last resort recovery**:
```bash
# 1. Backup everything
cp TODO.md TODO.md.backup.manual.$(date +%s)
cp -r backups backups.manual.$(date +%s)

# 2. Stop all processes
npm stop
pm2 stop taskflow-sync

# 3. Clear state
rm -rf node_modules dist logs
rm .env

# 4. Fresh install
npm install
npm run build

# 5. Reconfigure
cp .env.example .env
# Edit .env with proper values

# 6. Start clean
npm start

# 7. Import data
todo_sync file_to_app --force
```

---

## Getting Help

### Self-Help Resources

1. **Check Logs**: `tail -f logs/sync.log`
2. **View Status**: `todo_sync status`
3. **Run Tests**: `npm test -- src/sync/__tests__/`
4. **Read Docs**: See other documentation files

### Reporting Issues

When reporting issues, include:

```bash
# System information
uname -a
node --version
npm --version

# Configuration
cat .env | grep -v TOKEN  # Redact sensitive info

# Recent logs
tail -100 logs/sync.log

# Sync status
todo_sync status

# Error reproduction steps
# 1. ...
# 2. ...
# 3. ...
```

### Emergency Contacts

- **Documentation**: [docs/sync/README.md](README.md)
- **Architecture**: [docs/sync/ARCHITECTURE.md](ARCHITECTURE.md)
- **API Reference**: [docs/sync/API_REFERENCE.md](API_REFERENCE.md)

---

**Version**: 1.0
**Last Updated**: 2025-11-09
**Status**: Production-Ready
