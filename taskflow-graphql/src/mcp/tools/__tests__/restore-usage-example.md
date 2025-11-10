# TODO Sync Restore Functionality - Usage Example

## Overview

The `handleRestore` function provides secure TODO.md backup restoration with the following features:

1. Path validation using PathValidator (prevents path traversal attacks)
2. Backup file validation (existence, readability, size limit)
3. Automatic backup of current TODO.md before restore
4. Automatic file_to_app sync after successful restore
5. Comprehensive error handling and logging

## Implementation Details

### Security Features

- **PathValidator Integration**: All file paths validated against path traversal attacks
- **File Size Validation**: Maximum 5MB to prevent memory exhaustion
- **Existence & Readability Checks**: Validates backup file before attempting restore
- **Security Event Logging**: Logs all validation failures for audit trail

### Process Flow

```
1. Validate backupPath parameter exists
2. Validate backup path with PathValidator
3. Check backup file exists and is readable
4. Validate file size (max 5MB)
5. Read backup file content
6. Validate TODO.md path with PathValidator
7. Create backup of current TODO.md (if exists)
8. Write backup content to TODO.md path
9. Trigger file_to_app sync
10. Return success message with restore details
```

### Backup of Current TODO.md

Before restoring, the function automatically creates a backup of the current TODO.md file:

- Location: `.backup/{basename}_before_restore_{timestamp}.md`
- Example: `.backup/TODO_before_restore_2025-11-09T12-30-45-123Z.md`
- This ensures you can rollback if the restore was unintended

## Usage Examples

### Example 1: Successful Restore

```typescript
// MCP Tool Call
const result = await handleTodoSync({
  action: 'restore',
  options: {
    backupPath: './.backup/TODO_backup_2025-11-09T10-00-00-000Z.md',
    todoPath: './TODO.md' // Optional, defaults to process.env.TODO_PATH or './TODO.md'
  }
}, database);

// Success Response
{
  "success": true,
  "action": "restore",
  "restore": {
    "backupPath": "/Users/user/project/.backup/TODO_backup_2025-11-09T10-00-00-000Z.md",
    "todoPath": "/Users/user/project/TODO.md",
    "backupSize": 2048,
    "backupModified": "2025-11-09T10:00:00.000Z",
    "currentBackupPath": "/Users/user/project/.backup/TODO_before_restore_2025-11-09T12-30-45-123Z.md"
  },
  "sync": {
    "tasksChanged": 5,
    "tasksCreated": 2,
    "tasksUpdated": 3,
    "tasksDeleted": 0,
    "conflictsDetected": 0,
    "conflictsResolved": 0,
    "durationMs": 150
  },
  "statistics": {
    "totalSyncs": 11,
    "successRate": "90.91%"
  }
}
```

### Example 2: Restore with Sync Failure (Partial Success)

```typescript
// If restore succeeds but sync fails, you get a partial success response
{
  "success": true,
  "action": "restore",
  "warning": "Restore succeeded but sync to app failed",
  "restore": {
    "backupPath": "/Users/user/project/.backup/TODO_backup_2025-11-09T10-00-00-000Z.md",
    "todoPath": "/Users/user/project/TODO.md",
    "backupSize": 2048,
    "backupModified": "2025-11-09T10:00:00.000Z",
    "currentBackupPath": "/Users/user/project/.backup/TODO_before_restore_2025-11-09T12-30-45-123Z.md"
  },
  "syncError": "Database connection lost",
  "recommendation": "Run file_to_app action manually to complete the restore"
}
```

### Example 3: Error - Missing backupPath

```typescript
const result = await handleTodoSync({
  action: 'restore',
  options: {} // Missing backupPath
}, database);

// Error Response
{
  "content": [
    {
      "type": "text",
      "text": "Error: backupPath is required for restore action"
    }
  ],
  "isError": true
}
```

### Example 4: Error - Invalid Path (Path Traversal Attempt)

```typescript
const result = await handleTodoSync({
  action: 'restore',
  options: {
    backupPath: '../../../etc/passwd' // Path traversal attempt
  }
}, database);

// Error Response
{
  "content": [
    {
      "type": "text",
      "text": "Error: Invalid backup path - Path traversal detected: ../../../etc/passwd resolves outside allowed base path"
    }
  ],
  "isError": true
}
```

### Example 5: Error - Backup File Not Found

```typescript
const result = await handleTodoSync({
  action: 'restore',
  options: {
    backupPath: './nonexistent-backup.md'
  }
}, database);

// Error Response
{
  "content": [
    {
      "type": "text",
      "text": "Error: Backup file not found at path: ./nonexistent-backup.md"
    }
  ],
  "isError": true
}
```

### Example 6: Error - File Too Large

```typescript
const result = await handleTodoSync({
  action: 'restore',
  options: {
    backupPath: './huge-backup.md' // File is 10MB
  }
}, database);

// Error Response
{
  "content": [
    {
      "type": "text",
      "text": "Error: File size exceeds 5MB limit: 10.00MB"
    }
  ],
  "isError": true
}
```

## Testing the Implementation

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { handleTodoSync } from '../todo-sync';

describe('handleRestore', () => {
  it('should restore from backup successfully', async () => {
    // Setup
    const backupPath = './.backup/TODO_backup_2025-11-09.md';

    // Execute
    const result = await handleTodoSync({
      action: 'restore',
      options: { backupPath }
    }, mockDatabase);

    // Assert
    expect(result.isError).toBe(false);
    const response = JSON.parse(result.content[0].text);
    expect(response.success).toBe(true);
    expect(response.restore.backupPath).toContain('TODO_backup_2025-11-09.md');
    expect(response.sync.tasksChanged).toBeGreaterThanOrEqual(0);
  });

  it('should reject path traversal attempts', async () => {
    const result = await handleTodoSync({
      action: 'restore',
      options: { backupPath: '../../etc/passwd' }
    }, mockDatabase);

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('Path traversal detected');
  });
});
```

### Manual Testing Steps

1. **Create a backup file**
   ```bash
   cp TODO.md .backup/TODO_backup_$(date +%Y-%m-%d).md
   ```

2. **Modify TODO.md** (make some changes)

3. **Restore from backup via MCP**
   ```json
   {
     "action": "restore",
     "options": {
       "backupPath": "./.backup/TODO_backup_2025-11-09.md"
     }
   }
   ```

4. **Verify restoration**
   - Check TODO.md content matches backup
   - Check tasks synced to app (IndexedDB)
   - Check current TODO.md was backed up before restore

5. **Verify security**
   ```json
   {
     "action": "restore",
     "options": {
       "backupPath": "../../../etc/passwd"
     }
   }
   ```
   Should fail with path traversal error

## Security Considerations

### Validated Security Checks

1. **Path Traversal Prevention**: PathValidator.validateAsync() prevents access outside project directory
2. **Null Byte Injection**: PathValidator checks for null bytes in paths
3. **Symbolic Link Traversal**: PathValidator resolves symbolic links and validates real paths
4. **File Size Limits**: Maximum 5MB to prevent DoS via memory exhaustion
5. **File Existence & Permissions**: Validates readable before attempting read
6. **Security Event Logging**: All validation failures logged for audit trail

### OWASP Compliance

- **A01:2021 – Broken Access Control**: PathValidator prevents unauthorized file access
- **A03:2021 – Injection**: Null byte and path traversal protection
- **A04:2021 – Insecure Design**: Automatic backup before restore prevents data loss
- **A09:2021 – Security Logging**: Comprehensive logging of security events

## Performance Characteristics

- **Validation Overhead**: ~5-10ms for path validation
- **Read Operation**: O(file size), max 5MB
- **Write Operation**: O(file size), max 5MB
- **Sync Operation**: Depends on number of tasks changed
- **Total Time**: Typically 50-200ms for small-medium files

## Logging

The restore operation logs the following events:

1. **Security Events** (via logger.logSecurityEvent):
   - Path validation failures
   - Path traversal attempts

2. **Info Events**:
   - Successful backup creation before restore
   - Successful restore to TODO.md
   - Successful sync to app

3. **Error Events**:
   - Backup file read failures
   - TODO.md write failures
   - Sync failures

4. **Warning Events**:
   - Failed to create backup before restore (non-blocking)

## Error Codes Summary

| Error Message | Cause | Resolution |
|--------------|-------|------------|
| `backupPath is required` | Missing backupPath parameter | Provide backupPath in options |
| `Invalid backup path - Path traversal detected` | Path outside allowed directory | Use relative paths within project |
| `Backup file not found` | File doesn't exist | Check backup file path |
| `Backup file is not readable` | Permission denied | Check file permissions |
| `File size exceeds 5MB limit` | Backup file too large | Use smaller backup file |
| `Failed to read backup file` | I/O error | Check file system health |
| `Invalid TODO.md path` | Invalid destination path | Check TODO_PATH configuration |
| `Failed to write restored content` | Write permission/disk space | Check permissions and disk space |
| `Restore succeeded but sync to app failed` | Partial success | Run file_to_app manually |

## File Paths Reference

All file paths in the implementation use absolute paths resolved from `process.cwd()`:

```typescript
// Example resolved paths
backupPath: /Users/user/project/.backup/TODO_backup_2025-11-09.md
todoPath: /Users/user/project/TODO.md
currentBackupPath: /Users/user/project/.backup/TODO_before_restore_2025-11-09T12-30-45-123Z.md
```
