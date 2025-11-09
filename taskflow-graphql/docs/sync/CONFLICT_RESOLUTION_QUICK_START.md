# Conflict Resolution Quick Start Guide

## Installation & Import

```typescript
import {
  ConflictResolver,
  ConflictStrategy,
  type Conflict,
  type ResolutionResult,
} from '@/sync';
```

---

## Quick Examples

### 1. Simple Resolution (Last Write Wins)

```typescript
const resolver = new ConflictResolver();

// Resolve based on timestamp
const result = resolver.resolve(conflict);

if (result.success) {
  await saveTask(result.resolvedTask);
}
```

### 2. Always Prefer File

```typescript
const result = resolver.resolve(conflict, 'prefer_file');
// File version always wins
```

### 3. Always Prefer Database

```typescript
const result = resolver.resolve(conflict, 'prefer_app');
// Database version always wins
```

### 4. Intelligent Merge

```typescript
const result = resolver.resolve(conflict, 'merge');
// Smart field-level merge
```

### 5. Batch Processing

```typescript
const conflicts = await detectConflicts();
const batchResult = await resolver.resolveBatch(conflicts, 'merge');

console.log(`Resolved ${batchResult.resolved}/${batchResult.total}`);
```

### 6. Get Smart Suggestions

```typescript
const suggestion = resolver.getResolutionSuggestion(conflict);

console.log(`Suggested: ${suggestion.suggestedPolicy}`);
console.log(`Confidence: ${(suggestion.confidence * 100).toFixed(0)}%`);
console.log(`Reason: ${suggestion.reason}`);
```

---

## Strategy Comparison

| Strategy | Use When | Auto-Resolve |
|----------|----------|--------------|
| `LastWriteWins` | Simple sync, temporal ordering important | Yes |
| `FileWins` | File is source of truth | Yes |
| `DbWins` | Database is source of truth | Yes |
| `Merge` | Bidirectional sync, preserve all changes | Partial |

---

## Common Patterns

### Pattern 1: File Import

```typescript
// User imports tasks from file - file should win
const resolver = new ConflictResolver({ policy: 'prefer_file' });

for (const conflict of conflicts) {
  const result = await resolver.resolveAsync(conflict);
  await importTask(result.mergedTask);
}
```

### Pattern 2: File Export

```typescript
// User exports tasks to file - database should win
const resolver = new ConflictResolver({ policy: 'prefer_app' });

for (const conflict of conflicts) {
  const result = await resolver.resolveAsync(conflict);
  await exportToFile(result.mergedTask);
}
```

### Pattern 3: Real-time Sync

```typescript
// Real-time bidirectional sync - merge intelligently
const resolver = new ConflictResolver({ policy: 'merge' });

watcher.on('change', async () => {
  const conflicts = await detectConflicts();
  const results = await resolver.resolveBatch(conflicts, 'merge');
  await applyResults(results);
});
```

### Pattern 4: User Choice

```typescript
// Let user decide based on suggestions
const suggestion = resolver.getResolutionSuggestion(conflict);

if (suggestion.confidence > 0.9) {
  // High confidence - auto-resolve
  return resolver.resolve(conflict, suggestion.suggestedPolicy);
} else {
  // Low confidence - ask user
  const userChoice = await promptUser(suggestion);
  return resolver.resolve(conflict, userChoice);
}
```

---

## Type Definitions

### Conflict

```typescript
interface Conflict {
  id: string;
  taskId: string;
  fileVersion: Task;      // Version from file
  appVersion: Task;       // Version from database
  baseVersion?: Task;     // Common ancestor (for 3-way merge)
  detectedAt: Date;
  conflictType: 'content' | 'deletion' | 'creation';
  resolved: boolean;
}
```

### Task

```typescript
interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;      // Used for timestamp comparison
  tags?: string[];
  parentId?: string;
  order?: number;
  section?: string;
  archived?: boolean;
}
```

### ResolutionResult

```typescript
interface ResolutionResult {
  success: boolean;
  resolvedTask?: Task;              // The merged task
  resolution?: ConflictResolution;  // Resolution metadata
  requiresManualResolution?: boolean;
  error?: string;
}
```

---

## Error Handling

```typescript
try {
  const result = resolver.resolve(conflict, 'merge');

  if (!result.success) {
    // Resolution failed
    console.error(result.error);

    if (result.requiresManualResolution) {
      // Show UI for manual resolution
      await showManualResolutionUI(conflict);
    }
  }
} catch (error) {
  // Critical error (invalid data, etc.)
  console.error('Failed to resolve conflict:', error);

  // Fallback: use newer version
  const fallback = conflict.fileVersion.updatedAt > conflict.appVersion.updatedAt
    ? conflict.fileVersion
    : conflict.appVersion;

  await saveTask(fallback);
}
```

---

## Testing

### Run Tests

```bash
npm test -- src/sync/merge/__tests__/conflict-resolver.test.ts
```

### Coverage Report

```bash
npm run test:coverage -- src/sync/merge/
```

### Create Test Conflict

```typescript
import { describe, it, expect } from 'vitest';

describe('My Sync Feature', () => {
  it('should resolve conflicts', () => {
    const fileTask = {
      id: 'task-1',
      title: 'Updated in file',
      status: 'in_progress' as const,
      priority: 'high' as const,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02T12:00:00Z'),
    };

    const appTask = {
      id: 'task-1',
      title: 'Updated in app',
      status: 'completed' as const,
      priority: 'medium' as const,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02T10:00:00Z'),
    };

    const conflict: Conflict = {
      id: 'conflict-1',
      taskId: 'task-1',
      fileVersion: fileTask,
      appVersion: appTask,
      detectedAt: new Date(),
      conflictType: 'content',
      resolved: false,
    };

    const resolver = new ConflictResolver();
    const result = resolver.resolve(conflict);

    expect(result.success).toBe(true);
    expect(result.resolvedTask?.title).toBe('Updated in file'); // File is newer
  });
});
```

---

## Performance Tips

1. **Use batch resolution for multiple conflicts**
   ```typescript
   // Good
   await resolver.resolveBatch(conflicts, 'merge');

   // Bad
   for (const c of conflicts) {
     await resolver.resolveAsync(c, 'merge');
   }
   ```

2. **Monitor statistics for optimization**
   ```typescript
   const stats = resolver.getStatistics();
   if (stats.autoResolvedPercentage < 70) {
     // Consider using simpler strategy
   }
   ```

3. **Reset statistics periodically**
   ```typescript
   // Daily reset
   setInterval(() => {
     resolver.resetStatistics();
   }, 24 * 60 * 60 * 1000);
   ```

---

## Troubleshooting

### Issue: All conflicts require manual resolution

**Cause**: Using 'manual' policy or conflicts are too complex

**Solution**:
```typescript
// Check suggestion confidence
const suggestion = resolver.getResolutionSuggestion(conflict);
console.log('Confidence:', suggestion.confidence);

// Try merge strategy
const result = resolver.resolve(conflict, 'merge');
```

### Issue: Wrong version is being chosen

**Cause**: Timestamps may be incorrect or strategy mismatch

**Solution**:
```typescript
// Verify timestamps
console.log('File updated:', conflict.fileVersion.updatedAt);
console.log('App updated:', conflict.appVersion.updatedAt);

// Use explicit strategy
const result = resolver.resolve(conflict, 'prefer_file'); // or 'prefer_app'
```

### Issue: Data loss in merge

**Cause**: Base version missing or fields not properly detected

**Solution**:
```typescript
// Provide base version for 3-way merge
const conflict = {
  ...conflictData,
  baseVersion: originalTask, // Common ancestor
};

// Or use prefer_file/prefer_app to prevent data loss
const result = resolver.resolve(conflict, 'prefer_app');
```

---

## Next Steps

- Read full documentation: [CONFLICT_RESOLUTION_IMPLEMENTATION.md](./CONFLICT_RESOLUTION_IMPLEMENTATION.md)
- Review test suite: `src/sync/merge/__tests__/conflict-resolver.test.ts`
- Check API reference: [API_REFERENCE.md](./API_REFERENCE.md)
- See integration examples: [SYNC_COORDINATOR.md](./SYNC_COORDINATOR.md)

---

**Last Updated**: 2025-11-09
