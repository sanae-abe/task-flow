# TODO.md Sync System - API Reference

Complete API documentation for developers integrating with the TODO.md sync system.

## Table of Contents

- [MCP Tool API](#mcp-tool-api)
- [SyncCoordinator API](#synccoordinator-api)
- [ThreeWayMerger API](#threewaymerger-api)
- [ConflictResolver API](#conflictresolver-api)
- [Configuration](#configuration)
- [Type Definitions](#type-definitions)
- [Examples](#examples)

---

## MCP Tool API

### `todo_sync`

Model Context Protocol tool for TODO.md synchronization.

#### Tool Definition

```typescript
{
  name: 'todo_sync',
  description: 'Synchronize TODO.md file with TaskFlow application',
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['file_to_app', 'app_to_file', 'status', 'backup', 'restore']
      },
      options: {
        type: 'object',
        properties: {
          todoPath: { type: 'string' },
          dryRun: { type: 'boolean' },
          force: { type: 'boolean' },
          backupPath: { type: 'string' },
          conflictResolution: {
            type: 'string',
            enum: ['prefer_file', 'prefer_app', 'manual']
          },
          historyLimit: {
            type: 'number',
            minimum: 1,
            maximum: 100
          }
        }
      }
    },
    required: ['action']
  }
}
```

#### Actions

##### `file_to_app`

Sync TODO.md file into TaskFlow application (IndexedDB).

**Request**:
```json
{
  "action": "file_to_app",
  "options": {
    "todoPath": "./TODO.md",
    "dryRun": false,
    "force": false,
    "conflictResolution": "prefer_file"
  }
}
```

**Response**:
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

##### `app_to_file`

Export TaskFlow tasks to TODO.md file.

**Request**:
```json
{
  "action": "app_to_file",
  "options": {
    "todoPath": "./TODO.md",
    "dryRun": false
  }
}
```

**Response**:
```json
{
  "success": true,
  "action": "app_to_file",
  "dryRun": false,
  "result": {
    "tasksWritten": 47,
    "durationMs": 189
  },
  "statistics": {
    "totalSyncs": 43,
    "successRate": "97.67%"
  }
}
```

##### `status`

Query sync statistics, history, and conflicts.

**Request**:
```json
{
  "action": "status",
  "options": {
    "historyLimit": 10
  }
}
```

**Response**:
```json
{
  "success": true,
  "action": "status",
  "statistics": {
    "summary": {
      "totalSyncs": 42,
      "successfulSyncs": 41,
      "failedSyncs": 1,
      "successRate": "97.62%"
    },
    "performance": {
      "averageDurationMs": 223,
      "lastSyncAt": "2025-11-09T10:30:00Z",
      "lastSuccessfulSyncAt": "2025-11-09T10:30:00Z"
    },
    "changes": {
      "totalTasksChanged": 156,
      "totalConflicts": 8,
      "autoResolvedConflicts": 7,
      "manualResolvedConflicts": 1
    }
  },
  "recentHistory": [
    {
      "id": "sync-42",
      "direction": "file_to_app",
      "startedAt": "2025-11-09T10:30:00Z",
      "completedAt": "2025-11-09T10:30:01Z",
      "durationMs": 245,
      "success": true,
      "changes": {
        "tasksChanged": 5,
        "tasksCreated": 2,
        "tasksUpdated": 3,
        "tasksDeleted": 0
      },
      "conflicts": {
        "detected": 1,
        "resolved": 1
      }
    }
  ],
  "unresolvedConflicts": {
    "count": 0,
    "conflicts": []
  }
}
```

##### `backup`

Trigger manual backup of TODO.md.

**Request**:
```json
{
  "action": "backup"
}
```

**Response**:
```json
{
  "success": true,
  "action": "backup",
  "message": "Automatic backups are enabled in SyncCoordinator",
  "note": "Backups are created automatically before each sync operation",
  "statistics": {
    "totalSyncs": 42,
    "lastSyncAt": "2025-11-09T10:30:00Z"
  }
}
```

##### `restore`

Restore TODO.md from a backup file.

**Request**:
```json
{
  "action": "restore",
  "options": {
    "backupPath": "./TODO.md.backup.1699564800000"
  }
}
```

**Response** (not yet implemented):
```json
{
  "success": false,
  "action": "restore",
  "message": "Restore functionality is not yet implemented",
  "note": "Manual restore: Copy backup file to TODO.md path and run file_to_app sync",
  "providedBackupPath": "./TODO.md.backup.1699564800000"
}
```

#### Error Responses

```json
{
  "success": false,
  "error": "Error message here",
  "action": "file_to_app",
  "suggestion": "Helpful suggestion for resolution"
}
```

**Common Errors**:
- `Authentication failed. MCP_AUTH_TOKEN is not valid or not configured.`
- `File not found: /path/to/TODO.md`
- `Path traversal detected`
- `File size exceeds 5MB limit`
- `Unknown action 'invalid_action'`

---

## SyncCoordinator API

### Class: `SyncCoordinator`

**Location**: `src/sync/database/sync-coordinator.ts`

Main orchestrator for TODO.md synchronization.

#### Constructor

```typescript
new SyncCoordinator(options: SyncCoordinatorOptions)
```

**Parameters**:
```typescript
interface SyncCoordinatorOptions {
  config: SyncConfig;
  fileWatcher?: FileWatcher;
  fileSystem?: FileSystem;
  database?: IDBPDatabase;
}
```

**Example**:
```typescript
import { SyncCoordinator } from './sync/database/sync-coordinator';
import { openDB } from 'idb';

const db = await openDB('taskflow', 1);

const coordinator = new SyncCoordinator({
  config: {
    todoPath: './TODO.md',
    direction: 'bidirectional',
    strategy: 'last_write_wins',
    conflictResolution: 'prefer_file',
    debounceMs: 1000,
    throttleMs: 5000,
    maxFileSizeMB: 5,
    maxTasks: 10000,
    webhooksEnabled: false,
    autoBackup: true,
    backupRetentionDays: 7,
    dryRun: false
  },
  database: db
});
```

#### Methods

##### `start()`

Start the sync coordinator (initialize watchers, load state).

```typescript
async start(): Promise<void>
```

**Example**:
```typescript
await coordinator.start();
console.log('Sync coordinator started');
```

##### `stop()`

Stop the sync coordinator (cleanup resources).

```typescript
async stop(): Promise<void>
```

**Example**:
```typescript
await coordinator.stop();
console.log('Sync coordinator stopped');
```

##### `syncFileToApp()`

Sync TODO.md file into the application (IndexedDB).

```typescript
async syncFileToApp(): Promise<void>
```

**Example**:
```typescript
try {
  await coordinator.syncFileToApp();
  console.log('File synced to app successfully');
} catch (error) {
  console.error('Sync failed:', error);
}
```

**Throws**:
- `Error` - If file path invalid, parse fails, or write fails

##### `syncAppToFile()`

Export application tasks to TODO.md file.

```typescript
async syncAppToFile(): Promise<void>
```

**Example**:
```typescript
try {
  await coordinator.syncAppToFile();
  console.log('App synced to file successfully');
} catch (error) {
  console.error('Export failed:', error);
}
```

**Throws**:
- `Error` - If database read fails or file write fails

##### `getStats()`

Get sync statistics.

```typescript
getStats(): SyncStatistics
```

**Returns**:
```typescript
interface SyncStatistics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageDurationMs: number;
  lastSyncAt?: Date;
  lastSuccessfulSyncAt?: Date;
  totalTasksChanged: number;
  totalConflicts: number;
  autoResolvedConflicts: number;
  manualResolvedConflicts: number;
}
```

**Example**:
```typescript
const stats = coordinator.getStats();
console.log(`Total syncs: ${stats.totalSyncs}`);
console.log(`Success rate: ${(stats.successfulSyncs / stats.totalSyncs * 100).toFixed(2)}%`);
```

##### `getSyncHistory()`

Get recent sync history.

```typescript
getSyncHistory(limit: number = 10): SyncHistory[]
```

**Parameters**:
- `limit` - Number of history entries to return (default: 10, max: 100)

**Returns**:
```typescript
interface SyncHistory {
  id: string;
  direction: SyncDirection;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  success: boolean;
  tasksChanged: number;
  tasksCreated: number;
  tasksUpdated: number;
  tasksDeleted: number;
  conflictsDetected: number;
  conflictsResolved: number;
  error?: Error;
}
```

**Example**:
```typescript
const history = coordinator.getSyncHistory(5);
history.forEach(h => {
  console.log(`${h.direction} sync at ${h.startedAt}: ${h.success ? 'SUCCESS' : 'FAILED'}`);
});
```

##### `getConflicts()`

Get unresolved conflicts.

```typescript
getConflicts(): Conflict[]
```

**Returns**:
```typescript
interface Conflict {
  id: string;
  taskId: string;
  conflictType: 'both_modified' | 'local_deleted' | 'remote_deleted';
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  fileVersion: Task;
  appVersion: Task;
}
```

**Example**:
```typescript
const conflicts = coordinator.getConflicts();
if (conflicts.length > 0) {
  console.warn(`${conflicts.length} unresolved conflicts detected`);
  conflicts.forEach(c => {
    console.log(`Task ${c.taskId}: ${c.conflictType}`);
  });
}
```

#### Events

SyncCoordinator extends EventEmitter and emits the following events:

```typescript
coordinator.on('sync:start', (direction: SyncDirection) => {
  console.log(`Sync started: ${direction}`);
});

coordinator.on('sync:complete', (stats: SyncStatistics) => {
  console.log('Sync completed:', stats);
});

coordinator.on('sync:error', (error: Error) => {
  console.error('Sync error:', error);
});

coordinator.on('conflict:detected', (conflict: Conflict) => {
  console.warn('Conflict detected:', conflict);
});

coordinator.on('conflict:resolved', (conflict: Conflict) => {
  console.log('Conflict resolved:', conflict);
});
```

---

## ThreeWayMerger API

### Class: `ThreeWayMerger`

**Location**: `src/sync/merge/three-way-merger.ts`

Implements 3-way merge algorithm for conflict detection and resolution.

#### Constructor

```typescript
new ThreeWayMerger(policy?: ConflictResolutionPolicy)
```

**Parameters**:
- `policy` - Conflict resolution policy (default: `'prefer_file'`)

**Example**:
```typescript
import { ThreeWayMerger } from './sync/merge/three-way-merger';

const merger = new ThreeWayMerger('prefer_file');
```

#### Methods

##### `merge()`

Merge three versions of a task using 3-way merge algorithm.

```typescript
merge(
  base: Task | null,
  file: Task | null,
  app: Task | null
): MergeResult
```

**Parameters**:
- `base` - Common ancestor (last sync state)
- `file` - Current TODO.md state
- `app` - Current IndexedDB state

**Returns**:
```typescript
interface MergeResult {
  mergedTask: Task;
  hasConflicts: boolean;
  conflicts: FieldConflict[];
  strategy: 'auto' | 'file_preferred' | 'app_preferred' | 'manual';
  report: MergeReport;
}

interface FieldConflict {
  field: keyof Task;
  baseValue: any;
  fileValue: any;
  appValue: any;
  severity: 'low' | 'medium' | 'high';
}

interface MergeReport {
  totalFields: number;
  fileOnlyChanges: string[];
  appOnlyChanges: string[];
  conflictingFields: string[];
  unchangedFields: string[];
  autoMergedFields: string[];
  timestamp: Date;
}
```

**Example**:
```typescript
const base = { id: '1', title: 'Task', status: 'pending' };
const file = { id: '1', title: 'Task', status: 'completed' };
const app = { id: '1', title: 'Updated Task', status: 'pending' };

const result = merger.merge(base, file, app);

if (result.hasConflicts) {
  console.log('Conflicts detected:', result.conflicts);
} else {
  console.log('Auto-merged successfully:', result.mergedTask);
}

console.log('Merge report:', result.report);
```

##### `setPolicy()`

Change conflict resolution policy.

```typescript
setPolicy(policy: ConflictResolutionPolicy): void
```

**Parameters**:
- `policy` - `'prefer_file'` | `'prefer_app'` | `'last_write_wins'` | `'manual'`

**Example**:
```typescript
merger.setPolicy('prefer_app');
```

---

## ConflictResolver API

### Class: `ConflictResolver`

**Location**: `src/sync/merge/conflict-resolver.ts`

Resolves detected conflicts using configured policies.

#### Constructor

```typescript
new ConflictResolver(policy?: ConflictResolutionPolicy)
```

**Example**:
```typescript
import { ConflictResolver } from './sync/merge/conflict-resolver';

const resolver = new ConflictResolver('prefer_file');
```

#### Methods

##### `resolve()`

Resolve a conflict using the configured policy.

```typescript
resolve(conflict: FieldConflict): any
```

**Parameters**:
```typescript
interface FieldConflict {
  field: keyof Task;
  baseValue: any;
  fileValue: any;
  appValue: any;
  severity: 'low' | 'medium' | 'high';
}
```

**Returns**: Resolved value for the field

**Example**:
```typescript
const conflict = {
  field: 'status',
  baseValue: 'pending',
  fileValue: 'completed',
  appValue: 'in_progress',
  severity: 'high'
};

const resolved = resolver.resolve(conflict);
console.log(`Resolved status: ${resolved}`);  // 'completed' (if prefer_file)
```

##### `resolveMultiple()`

Resolve multiple conflicts at once.

```typescript
resolveMultiple(conflicts: FieldConflict[]): Map<string, any>
```

**Returns**: Map of field name to resolved value

**Example**:
```typescript
const conflicts = [
  { field: 'status', baseValue: 'pending', fileValue: 'completed', appValue: 'in_progress' },
  { field: 'priority', baseValue: 'medium', fileValue: 'high', appValue: 'low' }
];

const resolutions = resolver.resolveMultiple(conflicts);
console.log('Resolved values:', Object.fromEntries(resolutions));
// { status: 'completed', priority: 'high' }
```

---

## Configuration

### SyncConfig

Complete configuration interface for sync system.

```typescript
interface SyncConfig {
  /** Path to TODO.md file */
  todoPath: string;

  /** Sync direction */
  direction: SyncDirection;

  /** Sync strategy */
  strategy: 'last_write_wins' | '3way_merge' | 'manual';

  /** Conflict resolution policy */
  conflictResolution: ConflictResolutionPolicy;

  /** Debounce delay in milliseconds */
  debounceMs: number;

  /** Throttle interval in milliseconds */
  throttleMs: number;

  /** Maximum file size in MB */
  maxFileSizeMB: number;

  /** Maximum number of tasks */
  maxTasks: number;

  /** Enable webhooks for app→file sync */
  webhooksEnabled: boolean;

  /** Enable automatic backups */
  autoBackup: boolean;

  /** Backup retention period in days */
  backupRetentionDays?: number;

  /** Dry run mode (no actual changes) */
  dryRun?: boolean;
}
```

**Default Configuration**:
```typescript
const defaultConfig: SyncConfig = {
  todoPath: './TODO.md',
  direction: 'bidirectional',
  strategy: 'last_write_wins',
  conflictResolution: 'prefer_file',
  debounceMs: 1000,
  throttleMs: 5000,
  maxFileSizeMB: 5,
  maxTasks: 10000,
  webhooksEnabled: false,
  autoBackup: true,
  backupRetentionDays: 7,
  dryRun: false
};
```

### Environment Variables

Configure via environment variables:

```bash
# TODO.md file path
TODO_PATH=./TODO.md

# Sync behavior
TODO_DEBOUNCE_MS=1000
TODO_THROTTLE_MS=5000

# Limits
TODO_MAX_FILE_SIZE_MB=5
TODO_MAX_TASKS=10000

# Conflict resolution
TODO_CONFLICT_RESOLUTION=prefer_file  # prefer_file | prefer_app | manual

# Backup
TODO_AUTO_BACKUP=true
TODO_BACKUP_RETENTION_DAYS=7

# Authentication
MCP_AUTH_TOKEN=your-secure-token-here

# Logging
LOG_LEVEL=info  # debug | info | warn | error
```

---

## Type Definitions

### Core Types

#### Task

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

type TaskStatus = 'pending' | 'in_progress' | 'completed';
type TaskPriority = 'low' | 'medium' | 'high';
```

#### SyncDirection

```typescript
type SyncDirection = 'file_to_app' | 'app_to_file' | 'bidirectional';
```

#### ConflictResolutionPolicy

```typescript
type ConflictResolutionPolicy =
  | 'prefer_file'      // File version wins
  | 'prefer_app'       // App version wins
  | 'last_write_wins'  // Most recent wins
  | 'manual';          // User intervention required
```

### Response Types

#### MCPToolResult

```typescript
interface MCPToolResult {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}
```

---

## Examples

### Example 1: Basic Sync Setup

```typescript
import { SyncCoordinator } from './sync/database/sync-coordinator';
import { openDB } from 'idb';

async function setupSync() {
  // Open IndexedDB
  const db = await openDB('taskflow', 1);

  // Create coordinator
  const coordinator = new SyncCoordinator({
    config: {
      todoPath: './TODO.md',
      direction: 'bidirectional',
      strategy: 'last_write_wins',
      conflictResolution: 'prefer_file',
      debounceMs: 1000,
      throttleMs: 5000,
      maxFileSizeMB: 5,
      maxTasks: 10000,
      webhooksEnabled: false,
      autoBackup: true,
      backupRetentionDays: 7
    },
    database: db
  });

  // Start sync
  await coordinator.start();

  // Listen to events
  coordinator.on('sync:complete', (stats) => {
    console.log('Sync completed:', stats);
  });

  coordinator.on('conflict:detected', (conflict) => {
    console.warn('Conflict:', conflict);
  });

  return coordinator;
}

const coordinator = await setupSync();
```

### Example 2: Manual Sync with Error Handling

```typescript
async function manualSync(coordinator: SyncCoordinator) {
  try {
    // Sync file to app
    console.log('Starting file→app sync...');
    await coordinator.syncFileToApp();

    // Check results
    const stats = coordinator.getStats();
    console.log(`Sync completed in ${stats.averageDurationMs}ms`);

    // Check for conflicts
    const conflicts = coordinator.getConflicts();
    if (conflicts.length > 0) {
      console.warn(`${conflicts.length} conflicts detected`);
      conflicts.forEach(c => {
        console.log(`- ${c.taskId}: ${c.conflictType}`);
      });
    }

    // Sync app to file (export)
    console.log('Starting app→file sync...');
    await coordinator.syncAppToFile();

  } catch (error) {
    console.error('Sync failed:', error);

    // Check if circuit breaker is open
    const stats = coordinator.getStats();
    if (stats.failedSyncs > 5) {
      console.warn('Multiple failures detected, sync may be unstable');
    }

    throw error;
  }
}
```

### Example 3: Using ThreeWayMerger Directly

```typescript
import { ThreeWayMerger } from './sync/merge/three-way-merger';

async function customMerge() {
  const merger = new ThreeWayMerger('prefer_file');

  // Load versions
  const base = await loadBaseState();
  const file = await parseFile('./TODO.md');
  const app = await loadFromDatabase();

  // Merge each task
  const mergedTasks = [];
  for (const baseTask of base) {
    const fileTask = file.find(t => t.id === baseTask.id);
    const appTask = app.find(t => t.id === baseTask.id);

    const result = merger.merge(baseTask, fileTask, appTask);

    if (result.hasConflicts) {
      console.log(`Conflicts in task ${baseTask.id}:`);
      result.conflicts.forEach(c => {
        console.log(`  ${c.field}: base=${c.baseValue}, file=${c.fileValue}, app=${c.appValue}`);
      });
    }

    mergedTasks.push(result.mergedTask);
  }

  return mergedTasks;
}
```

### Example 4: MCP Tool Integration

```typescript
import { handleTodoSync } from './mcp/tools/todo-sync';
import { openDB } from 'idb';

async function runMcpSync() {
  const db = await openDB('taskflow', 1);

  // File → App sync
  const result1 = await handleTodoSync(
    {
      action: 'file_to_app',
      options: {
        todoPath: './TODO.md',
        conflictResolution: 'prefer_file'
      }
    },
    db
  );

  console.log(JSON.parse(result1.content[0].text));

  // Query status
  const result2 = await handleTodoSync(
    {
      action: 'status',
      options: {
        historyLimit: 5
      }
    },
    db
  );

  console.log(JSON.parse(result2.content[0].text));
}
```

### Example 5: Custom Conflict Resolution

```typescript
import { ConflictResolver } from './sync/merge/conflict-resolver';

class CustomConflictResolver extends ConflictResolver {
  resolve(conflict: FieldConflict): any {
    // Custom logic: prefer higher priority
    if (conflict.field === 'priority') {
      const priorities = { low: 1, medium: 2, high: 3 };
      const fileVal = priorities[conflict.fileValue];
      const appVal = priorities[conflict.appValue];
      return fileVal >= appVal ? conflict.fileValue : conflict.appValue;
    }

    // Custom logic: prefer completed status
    if (conflict.field === 'status') {
      if (conflict.fileValue === 'completed' || conflict.appValue === 'completed') {
        return 'completed';
      }
    }

    // Default to parent implementation
    return super.resolve(conflict);
  }
}

const resolver = new CustomConflictResolver('prefer_file');
```

---

## See Also

- [User Guide](USER_GUIDE.md) - End-user documentation
- [Architecture](ARCHITECTURE.md) - System design and components
- [Deployment Guide](DEPLOYMENT.md) - Configuration and deployment
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions

---

**Version**: 1.0
**Last Updated**: 2025-11-09
**API Stability**: Stable (v1.0)
