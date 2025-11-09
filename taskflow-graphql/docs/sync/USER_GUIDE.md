# TODO.md Sync System - User Guide

Complete guide for using the TODO.md synchronization system in TaskFlow.

## Table of Contents

- [Quick Start](#quick-start)
- [TODO.md File Format](#file-format)
- [Sync Actions](#sync-actions)
- [MCP Tool Usage](#mcp-tool-usage)
- [Conflict Resolution](#conflict-resolution)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Create TODO.md

Create a `TODO.md` file in your project root:

```bash
cd /path/to/your/project
touch TODO.md
```

### 2. Initial Sync (File → App)

Sync your TODO.md into TaskFlow:

```bash
# Using MCP tool from Claude Code
todo_sync file_to_app
```

Or edit directly in Claude Code - changes will auto-sync if file watcher is enabled.

### 3. Start Making Changes

Edit `TODO.md` or use the TaskFlow UI - changes sync automatically!

---

## File Format

### Basic Structure

```markdown
# 📋 TaskFlow TODO

**Last Updated**: 2025-11-09
**Auto-generated**: TaskFlow App

---

## 🔴 High Priority

- [ ] **Implement user authentication**
  - Due: 2025-11-15
  - Status: in_progress

- [x] **Setup database schema**
  - Completed: 2025-11-08

---

## 🟠 Medium Priority

- [ ] Write API documentation
- [ ] Add unit tests for auth module

---

## 🟢 Low Priority

- [ ] Refactor legacy code
- [ ] Update dependencies
```

### Format Specification

#### Headers

- `# 📋 TaskFlow TODO` - Main title (required)
- `## 🔴 High Priority` - Section for high priority tasks
- `## 🟠 Medium Priority` - Section for medium priority tasks
- `## 🟢 Low Priority` - Section for low priority tasks

#### Task Syntax

```markdown
- [ ] Task title                    # Pending task
- [x] Task title                    # Completed task
- [ ] **Task with emphasis**        # High priority (bold)
  - Due: YYYY-MM-DD                 # Due date (optional)
  - Status: pending|in_progress|completed
  - Description line 1              # Additional details
  - Description line 2
```

#### Priority Detection

Priority is determined by section:
- `🔴 High Priority` / `最優先` → `high`
- `🟠 Medium Priority` / `高優先度` → `medium`
- `🟢 Low Priority` / `長期計画` → `low`

#### Status Detection

```markdown
- [ ]  → status: pending
- [x]  → status: completed
- [X]  → status: completed (case insensitive)
```

### Advanced Features

#### Metadata Fields

```markdown
- [ ] Complex task with metadata
  - Due: 2025-12-01
  - Priority: high
  - Tags: backend, authentication
  - Assignee: @username
  - Estimate: 4h
```

#### Nested Tasks (Subtasks)

```markdown
- [ ] Parent task
  - [ ] Subtask 1
  - [ ] Subtask 2
  - [x] Subtask 3 (completed)
```

> **Note**: Subtasks are currently parsed as separate tasks. Full hierarchical support is planned for Phase 6.

---

## Sync Actions

### Available Actions

#### 1. File to App (`file_to_app`)

Syncs TODO.md into TaskFlow application.

```bash
# Basic sync
todo_sync file_to_app

# With options
todo_sync file_to_app --todoPath ./custom-todo.md --force
```

**When to use**:
- After editing TODO.md in an external editor
- Initial import of existing TODO.md
- Recovery after app data loss

#### 2. App to File (`app_to_file`)

Exports TaskFlow tasks to TODO.md.

```bash
# Basic export
todo_sync app_to_file

# Dry run (preview without writing)
todo_sync app_to_file --dryRun
```

**When to use**:
- Generate TODO.md from TaskFlow tasks
- Backup current state to file
- Share tasks via version control

#### 3. Status Query (`status`)

Check sync statistics and history.

```bash
# View sync status
todo_sync status

# View last 20 sync operations
todo_sync status --historyLimit 20
```

**Output includes**:
- Total syncs performed
- Success rate
- Recent sync history
- Unresolved conflicts
- Performance metrics

#### 4. Backup (`backup`)

Create manual backup of TODO.md.

```bash
# Trigger manual backup
todo_sync backup
```

**Note**: Automatic backups are created before each sync operation.

#### 5. Restore (`restore`)

Restore from a previous backup.

```bash
# Restore from specific backup
todo_sync restore --backupPath ./TODO.md.backup.1699564800000
```

> **Status**: Restore functionality is planned for Phase 6. Currently, manual restore is supported:
> ```bash
> cp TODO.md.backup.1699564800000 TODO.md
> todo_sync file_to_app
> ```

---

## MCP Tool Usage

### From Claude Code

The `todo_sync` MCP tool is available in Claude Code/Desktop:

#### Basic Syntax

```typescript
// File → App sync
{
  "action": "file_to_app"
}

// App → File sync
{
  "action": "app_to_file",
  "options": {
    "dryRun": false
  }
}

// Status query
{
  "action": "status",
  "options": {
    "historyLimit": 10
  }
}
```

#### Natural Language Examples

Ask Claude Code:

```
"Sync my TODO.md file into the app"
→ Executes: todo_sync file_to_app

"Export my tasks to TODO.md"
→ Executes: todo_sync app_to_file

"Show me the sync status"
→ Executes: todo_sync status

"What conflicts do I have?"
→ Executes: todo_sync status (shows conflicts section)
```

### Configuration Options

```typescript
interface TodoSyncOptions {
  // Custom TODO.md path
  todoPath?: string;           // Default: "./TODO.md"

  // Preview mode (no actual changes)
  dryRun?: boolean;            // Default: false

  // Force sync even if no changes detected
  force?: boolean;             // Default: false

  // Conflict resolution strategy override
  conflictResolution?: 'prefer_file' | 'prefer_app' | 'manual';

  // History entries to return (status action)
  historyLimit?: number;       // Default: 10, Max: 100
}
```

### Response Format

#### Success Response

```json
{
  "success": true,
  "action": "file_to_app",
  "dryRun": false,
  "result": {
    "tasksChanged": 5,
    "tasksCreated": 2,
    "tasksUpdated": 3,
    "tasksDeleted": 0,
    "conflictsDetected": 1,
    "conflictsResolved": 1,
    "durationMs": 245
  },
  "statistics": {
    "totalSyncs": 42,
    "successRate": "97.62%"
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": "File not found: /path/to/TODO.md",
  "action": "file_to_app",
  "suggestion": "Create TODO.md file or check todoPath configuration"
}
```

---

## Conflict Resolution

### Understanding Conflicts

A conflict occurs when the same task is modified in both TODO.md and the app between syncs.

#### Conflict Types

1. **Both Modified**: Task edited in both file and app
2. **Local Deleted**: Task deleted in app but modified in file
3. **Remote Deleted**: Task deleted in file but modified in app

### Automatic Resolution

The system uses a **3-way merge** algorithm:

```
Base Version (last sync) + File Version + App Version
                    ↓
              Merge Algorithm
                    ↓
           Resolved Version
```

#### Resolution Strategies

##### 1. Auto-Merge (No Conflicts)

```
Base:  status=pending, priority=medium
File:  status=completed              (changed status)
App:   priority=high                 (changed priority)
→ Merged: status=completed, priority=high  ✅ No conflict
```

##### 2. Last-Write-Wins (Default for conflicts)

```
Base:  status=pending
File:  status=completed              (modified)
App:   status=in_progress            (modified)
→ Conflict detected ⚠️
→ Resolution: Use file version (prefer_file default)
→ Result: status=completed
```

##### 3. Manual Resolution (Future)

For critical conflicts, the system can prompt for manual intervention:

```
Conflict in task "Implement authentication":
  Base:      status=pending
  File:      status=completed
  App:       status=in_progress

Choose resolution:
  [1] Use file version (completed)
  [2] Use app version (in_progress)
  [3] Edit manually
```

> **Note**: Manual resolution UI is planned for Phase 6.

### Conflict Resolution Policies

Configure in `MCP_AUTH_TOKEN` environment or per-sync:

#### prefer_file (Default)

```typescript
{
  "action": "file_to_app",
  "options": {
    "conflictResolution": "prefer_file"
  }
}
```

When conflicts occur, file version wins.

**Best for**: Editing TODO.md as primary interface

#### prefer_app

```typescript
{
  "action": "app_to_file",
  "options": {
    "conflictResolution": "prefer_app"
  }
}
```

When conflicts occur, app version wins.

**Best for**: Using TaskFlow UI as primary interface

#### manual (Future)

```typescript
{
  "action": "file_to_app",
  "options": {
    "conflictResolution": "manual"
  }
}
```

System pauses sync and prompts for manual resolution.

**Best for**: Critical tasks where data loss is unacceptable

### Preventing Conflicts

#### Best Practices

1. **Choose Primary Interface**
   - Edit tasks primarily in TODO.md OR TaskFlow UI, not both
   - Use the other interface for viewing/reviewing

2. **Sync Frequently**
   - Enable file watcher for automatic sync
   - Manually sync before making major changes

3. **Use Unique Task Titles**
   - Avoid duplicate task names
   - Makes conflict detection more accurate

4. **Leverage Sections**
   - Keep related tasks in same section
   - Reduces cross-section conflicts

#### Conflict Indicators

The system tracks conflicts in sync status:

```bash
todo_sync status
```

Output:
```json
{
  "unresolvedConflicts": {
    "count": 2,
    "conflicts": [
      {
        "id": "conflict-123",
        "taskId": "task-456",
        "conflictType": "both_modified",
        "detectedAt": "2025-11-09T10:30:00Z",
        "resolved": false,
        "fileVersion": {
          "title": "Implement auth",
          "status": "completed",
          "priority": "high"
        },
        "appVersion": {
          "title": "Implement auth",
          "status": "in_progress",
          "priority": "high"
        }
      }
    ]
  }
}
```

---

## Best Practices

### File Organization

#### Recommended Structure

```markdown
# 📋 TaskFlow TODO

## 🔴 Today (High Priority)
- [ ] Critical tasks for today

## 🟠 This Week (Medium Priority)
- [ ] Important tasks for this week

## 🟢 Backlog (Low Priority)
- [ ] Future tasks and ideas

## ✅ Completed
- [x] Recent completions (for tracking)
```

#### Section Naming

Use consistent emoji + text format:
- ✅ `## 🔴 High Priority`
- ✅ `## 🟠 Medium Priority`
- ❌ `## high priority` (lowercase, no emoji)
- ❌ `## URGENT!!!` (non-standard)

### Task Writing

#### Good Task Format

```markdown
- [ ] **Implement user authentication** [Backend]
  - Due: 2025-11-15
  - Includes: JWT tokens, password hashing, session management
  - Dependencies: Database schema, API routes
  - Estimate: 8h
```

#### Poor Task Format

```markdown
- [ ] do auth stuff
```

#### Tips

- **Be Specific**: "Implement JWT authentication" > "Auth"
- **Add Context**: Include due dates, estimates, dependencies
- **Use Bold for Critical**: `**Critical task**` gets high priority
- **Keep Titles Short**: Move details to description lines

### Version Control

#### .gitignore Setup

```bash
# Don't commit backups
TODO.md.backup.*

# Optionally ignore TODO.md if it contains sensitive info
# TODO.md
```

#### Commit Strategy

```bash
# Commit TODO.md changes with descriptive messages
git add TODO.md
git commit -m "Add authentication tasks to TODO.md"

# Use pre-commit hooks to validate TODO.md format
# See: docs/DEPLOYMENT.md#pre-commit-hooks
```

### Performance Tips

#### Large TODO Files (1000+ tasks)

1. **Split by Project**
   ```
   project-a/TODO.md
   project-b/TODO.md
   shared/TODO.md
   ```

2. **Archive Completed Tasks**
   ```markdown
   ## ✅ Completed
   See: ARCHIVE.md for older completions
   ```

3. **Use Differential Sync**
   ```typescript
   // System automatically uses diff detection
   // No manual configuration needed
   ```

#### Sync Frequency

- **File Watcher**: Auto-sync on save (< 1 second delay)
- **Manual Sync**: Sync before/after major editing sessions
- **Batch Operations**: Use `--force` flag sparingly (full resync)

---

## Troubleshooting

### Common Issues

#### 1. File Not Found

**Error**: `TODO.md not found at path: ./TODO.md`

**Solution**:
```bash
# Create TODO.md in project root
touch TODO.md

# Or specify custom path
todo_sync file_to_app --todoPath /path/to/TODO.md
```

#### 2. Authentication Failed

**Error**: `Authentication failed. MCP_AUTH_TOKEN is not valid`

**Solution**:
```bash
# Set environment variable
export MCP_AUTH_TOKEN="your-token-here"

# Or add to .env file
echo "MCP_AUTH_TOKEN=your-token" >> .env
```

See: [Deployment Guide - Authentication](DEPLOYMENT.md#authentication)

#### 3. Sync Loop Detected

**Error**: `Infinite sync loop detected, stopping...`

**Cause**: File watcher triggering on its own write operations

**Solution**:
- Automatically handled by debounce/throttle
- If persists, check file watcher logs: `src/sync/utils/logger.ts`

#### 4. Parse Errors

**Error**: `Failed to parse TODO.md: Unexpected format at line 42`

**Solution**:
```bash
# Validate TODO.md format
# Use dry run to check before actual sync
todo_sync file_to_app --dryRun

# Check problematic line
sed -n '42p' TODO.md
```

#### 5. High Memory Usage

**Symptom**: Node.js process using > 500MB RAM

**Cause**: Large TODO.md file (> 10,000 tasks)

**Solution**:
```bash
# Split TODO.md into multiple files
# Or increase max task limit
export TODO_MAX_TASKS=50000

# Check current size
wc -l TODO.md
```

### Debug Mode

Enable detailed logging:

```bash
# Set log level to debug
export LOG_LEVEL=debug

# Run sync with verbose output
todo_sync file_to_app

# Check logs
tail -f logs/sync.log
```

### Getting Help

1. **Check Status**: `todo_sync status` shows sync health
2. **Review Logs**: See `logs/sync.log` for detailed events
3. **Validate Format**: Use dry run mode to test changes
4. **Consult Docs**: See [Troubleshooting Guide](TROUBLESHOOTING.md) for more

---

## Next Steps

- **[Architecture Documentation](ARCHITECTURE.md)** - Understand how it works
- **[API Reference](API_REFERENCE.md)** - Integrate with your code
- **[Deployment Guide](DEPLOYMENT.md)** - Configure for production
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Solve advanced issues

---

**Version**: 1.0
**Last Updated**: 2025-11-09
**Feedback**: Open an issue or submit a pull request
