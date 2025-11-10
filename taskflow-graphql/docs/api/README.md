# TaskFlow TODO.md Sync API Documentation

Complete API documentation for the TODO.md synchronization system.

## Documents

- [SyncCoordinator API](./sync-coordinator.md) - Core bidirectional sync engine
- [MCP Server API](./mcp-server.md) - Model Context Protocol interface
- [Types Reference](./types.md) - TypeScript type definitions

## Quick Start

### MCP Tool Usage (Claude Code)

```json
{
  "name": "todo_sync",
  "arguments": {
    "action": "file_to_app",
    "options": {
      "todoPath": "./TODO.md"
    }
  }
}
```

### Direct API Usage

```typescript
import { SyncCoordinator } from './sync/database/sync-coordinator';
import { RealFileSystem } from './sync/file-system/real-file-system';

const coordinator = new SyncCoordinator({
  config: {
    todoPath: './TODO.md',
    direction: 'bidirectional',
    strategy: 'last_write_wins',
    conflictResolution: 'prefer_file',
  },
  fileSystem: new RealFileSystem(),
  database,
});

await coordinator.start();
await coordinator.syncFileToApp();
```

## Architecture

```
┌─────────────┐
│ Claude Code │
└──────┬──────┘
       │ MCP Protocol
       ▼
┌──────────────┐     ┌──────────────────┐
│  MCP Server  │────▶│ SyncCoordinator  │
│ (todo_sync)  │     │  (Phase 3)       │
└──────────────┘     └────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              ┌──────────┐        ┌──────────┐
              │ TODO.md  │        │IndexedDB │
              │ (File)   │        │ (Tasks)  │
              └──────────┘        └──────────┘
```

## Features

- ✅ **Bidirectional Sync**: TODO.md ↔ IndexedDB
- ✅ **Differential Sync**: Content hash-based change detection
- ✅ **Conflict Resolution**: 4 strategies (LastWriteWins, FileWins, DbWins, Merge)
- ✅ **Retry Logic**: Exponential backoff with circuit breaker
- ✅ **Event-Driven**: Real-time sync status updates
- ✅ **Auto-Backup**: Before every file write
- ✅ **MCP Integration**: Claude Code native support

## Supported Actions

| Action | Description | MCP Tool |
|--------|-------------|----------|
| `file_to_app` | Sync TODO.md → IndexedDB | ✅ |
| `app_to_file` | Sync IndexedDB → TODO.md | ✅ |
| `status` | Get sync statistics and history | ✅ |
| `backup` | Create manual backup | ✅ |
| `restore` | Restore from backup | ⏳ Planned |

## Test Coverage

- **Phase 1**: 85/85 tests (100%)
- **Phase 2**: 73/73 tests (100%)
- **Phase 3**: 81/98 tests (83%)
- **Total**: 239/256 tests (93%)

## Security

- ✅ XSS Prevention (DOMPurify sanitization)
- ✅ Path Traversal Protection (PathValidator)
- ✅ File Size Limits (5MB default)
- ✅ Input Validation (Zod schemas)
- ✅ MCP Authentication (MCP_AUTH_TOKEN)

## Performance

- Average sync time: < 100ms (typical)
- Batch operations: Up to 1000 tasks
- Debounce: 1000ms (configurable)
- Throttle: 5000ms (configurable)

## Error Handling

```typescript
try {
  await coordinator.syncFileToApp();
} catch (error) {
  if (error.message.includes('Path traversal')) {
    // Security violation
  } else if (error.message.includes('File too large')) {
    // Size limit exceeded
  } else {
    // Other errors
  }
}
```

## Events

```typescript
coordinator.on('sync-start', (event) => {
  console.log('Sync started:', event.direction);
});

coordinator.on('sync-completed', (history) => {
  console.log('Tasks changed:', history.tasksChanged);
});

coordinator.on('sync-error', (error) => {
  console.error('Sync failed:', error);
});
```

## Configuration

```typescript
interface SyncConfig {
  todoPath: string;                    // TODO.md file path
  direction: SyncDirection;            // bidirectional | file_to_app | app_to_file
  strategy: SyncStrategy;              // last_write_wins | three_way_merge
  conflictResolution: ConflictResolutionPolicy; // prefer_file | prefer_app | manual
  debounceMs: number;                  // Debounce delay (default: 1000)
  throttleMs: number;                  // Throttle limit (default: 5000)
  maxFileSizeMB: number;               // Max file size (default: 5)
  maxTasks: number;                    // Max tasks (default: 10000)
  webhooksEnabled: boolean;            // Webhook support (default: false)
  autoBackup: boolean;                 // Auto-backup (default: true)
  backupRetentionDays?: number;        // Backup retention (default: 7)
  dryRun?: boolean;                    // Dry run mode (default: false)
}
```

## Related Documentation

- [SyncCoordinator Implementation](../../src/sync/database/sync-coordinator.ts)
- [MCP Tool Implementation](../../src/mcp/tools/todo-sync.ts)
- [Test Suite](../../src/sync/__tests__/sync-orchestrator.test.ts)
- [TODO.md](../../TODO.md) - Project progress tracker
