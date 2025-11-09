# E2E Integration Tests - TODO.md ↔ TaskFlow App Bidirectional Sync

Comprehensive end-to-end integration tests for the TODO.md ↔ TaskFlow App bidirectional synchronization system (Phase 5 Day 25-28).

## Overview

This test suite validates the complete synchronization workflow from file parsing to database persistence, conflict resolution, and resilience mechanisms.

**Total Tests: 74**
- Full Sync Workflow: 20 tests
- Bidirectional Sync: 16 tests
- FileWatcher Integration: 16 tests
- Performance & Resilience: 22 tests

## Test Files

### 1. `file_to_app_e2e.test.ts` (20 tests)

Tests the complete File → App synchronization workflow.

**Coverage:**
- ✅ Basic file parsing and task creation
- ✅ Empty file handling
- ✅ Status, priority, section, and tag parsing
- ✅ Incremental updates (add, edit, delete)
- ✅ Batch operations (50-5000 tasks)
- ✅ Unicode and special character support
- ✅ Sync history tracking
- ✅ Error handling for malformed markdown

**Key Scenarios:**
```typescript
// Parse TODO.md and create tasks
it('should parse TODO.md and create tasks in IndexedDB')

// Handle incremental updates
it('should detect and sync only changed tasks')

// Large file performance
it('should handle large file sync (1000+ tasks)')
```

### 2. `bidirectional_e2e.test.ts` (16 tests)

Tests concurrent edits and 3-way merge conflict resolution.

**Coverage:**
- ✅ Concurrent edit detection
- ✅ Base version tracking
- ✅ 3-way merge auto-resolution
- ✅ Conflict resolution policies (prefer_file, prefer_app, merge)
- ✅ Array field merging (tags)
- ✅ Manual conflict resolution
- ✅ App → File sync
- ✅ Bidirectional sync cycles

**Key Scenarios:**
```typescript
// 3-way merge
it('should auto-merge non-conflicting changes')

// Conflict policies
it('should prefer file version with prefer_file policy')

// Full bidirectional cycle
it('should handle complete bidirectional sync cycle')
```

### 3. `file_watcher_e2e.test.ts` (16 tests)

Tests automatic file watching and rate limiting.

**Coverage:**
- ✅ Automatic file change detection
- ✅ Debounce validation (500ms)
- ✅ Throttle validation (2000ms)
- ✅ Burst handling and rate limiting
- ✅ File system event metadata
- ✅ SyncCoordinator integration
- ✅ Concurrent sync prevention
- ✅ Error handling

**Key Scenarios:**
```typescript
// Debouncing
it('should debounce rapid file changes (500ms)')

// Throttling
it('should throttle high-frequency events (2000ms)')

// Burst handling
it('should handle burst of rapid file changes')
```

### 4. `resilience_e2e.test.ts` (22 tests)

Tests circuit breaker, retry mechanisms, and performance.

**Coverage:**
- ✅ Circuit breaker activation (50% error threshold)
- ✅ Retry mechanism (3 attempts, exponential backoff)
- ✅ Large file handling (1000-5000 tasks)
- ✅ Max file size/task limits
- ✅ Backup/restore workflow
- ✅ Differential sync optimization
- ✅ Error recovery and consistency
- ✅ Concurrency control

**Key Scenarios:**
```typescript
// Circuit breaker
it('should activate circuit breaker after error threshold (50%)')

// Retry with backoff
it('should use exponential backoff for retries')

// Large datasets
it('should handle 5000+ tasks with batch processing')

// Backup/restore
it('should restore from backup successfully')
```

## Helper Utilities

### `helpers/test-fixtures.ts`

Mock data generators and test utilities:
- `createMockTask()` - Generate single task
- `createMockTasks()` - Generate multiple tasks
- `createTasksWithStatuses/Priorities/Sections/Tags()` - Specialized task sets
- `createLargeTaskDataset()` - Performance testing datasets
- `createConflictingTasks()` - 3-way merge test data
- `generateTodoMarkdown()` - Convert tasks to TODO.md format
- `sleep()`, `waitForCondition()` - Async test helpers

### `helpers/e2e-setup.ts`

Common setup and teardown functions:
- `setupE2ETest()` - Initialize test environment
- `createTestCoordinator()` - Create SyncCoordinator instance
- `writeTasksToDB()` / `readTasksFromDB()` - Database operations
- `writeTodoFile()` / `readTodoFile()` - File operations
- `waitForSyncComplete()` - Async sync helpers
- `assertTasksEqual()` - Task comparison utilities
- `measureSyncPerformance()` - Performance measurement
- `verifyDatabaseIntegrity()` - Data validation

## Running the Tests

### Run all E2E tests
```bash
npm test -- src/sync/__tests__/e2e
```

### Run specific test suite
```bash
npm test -- src/sync/__tests__/e2e/file_to_app_e2e.test.ts
npm test -- src/sync/__tests__/e2e/bidirectional_e2e.test.ts
npm test -- src/sync/__tests__/e2e/file_watcher_e2e.test.ts
npm test -- src/sync/__tests__/e2e/resilience_e2e.test.ts
```

### Run with coverage
```bash
npm test -- --coverage src/sync/__tests__/e2e
```

### Run in watch mode
```bash
npm test -- --watch src/sync/__tests__/e2e
```

## Test Environment

### Dependencies
- `vitest` - Test framework
- `fake-indexeddb` - IndexedDB mocking
- `uuid` - Task ID generation

### Test Isolation
Each test:
1. Creates isolated temporary directory
2. Creates fresh IndexedDB instance
3. Initializes clean SyncCoordinator
4. Cleans up all resources in afterEach

### Mocking Strategy
- **IndexedDB**: `fake-indexeddb` for full IndexedDB simulation
- **File System**: Real fs operations in temp directories
- **FileWatcher**: Mock implementation for controlled testing
- **Time**: `sleep()` utilities for async validation

## Performance Benchmarks

### Expected Performance
- **Small sync** (< 10 tasks): < 1 second
- **Medium sync** (50-100 tasks): < 2 seconds
- **Large sync** (1000 tasks): < 10 seconds
- **Very large sync** (5000 tasks): < 30 seconds

### Rate Limiting
- **Debounce**: 500ms (configurable)
- **Throttle**: 2000ms (configurable)
- **Circuit Breaker**: 50% error threshold
- **Retry**: 3 attempts with exponential backoff

## Integration Points

### Components Tested
- `SyncCoordinator` - Main orchestrator
- `MarkdownParser` - TODO.md parsing
- `MarkdownSerializer` - TODO.md generation
- `ThreeWayMerger` - Conflict resolution
- `ConflictResolver` - Policy-based resolution
- `DiffDetector` - Change detection
- `BatchWriter` - Batch database operations
- `CircuitBreaker` - Resilience mechanism
- `Retry` - Retry logic
- `SyncStateManager` - State persistence

### External Dependencies
- File system operations (fs.promises)
- IndexedDB (via fake-indexeddb)
- Chokidar (mocked for FileWatcher)

## Test Data

### Task Variants
- **Statuses**: pending, in_progress, completed
- **Priorities**: low, medium, high
- **Sections**: Work, Personal, Shopping, Projects
- **Tags**: Multiple tags per task
- **Due dates**: Today, tomorrow, next week
- **Unicode**: Japanese text, emoji, special characters

### File Formats
```markdown
# TODO

## Work
- [ ] Task 1 (!high @2025-12-31 #urgent)
- [x] Task 2 (!low #optional)

## Personal
- [ ] Shopping task (#groceries #weekend)
```

## Troubleshooting

### Common Issues

**Issue: Tests timeout**
- Solution: Increase timeout in test config or optimize sync operations

**Issue: IndexedDB errors**
- Solution: Ensure `fake-indexeddb/auto` is imported in setup files

**Issue: File permission errors**
- Solution: Tests create files in `.test-e2e-*` directories with proper permissions

**Issue: Flaky FileWatcher tests**
- Solution: Adjust debounce/throttle delays or use mock FileWatcher

### Debug Mode
```typescript
// Enable verbose logging
process.env.LOG_LEVEL = 'debug';
```

## Future Enhancements

- [ ] Performance regression detection
- [ ] Stress testing with 10,000+ tasks
- [ ] Network partition simulation
- [ ] Browser-specific IndexedDB testing
- [ ] Multi-user conflict scenarios
- [ ] Webhook integration tests
- [ ] Real-time sync validation

## Related Documentation

- Core sync implementation: `src/sync/database/sync-coordinator.ts`
- 3-way merge algorithm: `src/sync/merge/three-way-merger.ts`
- Markdown parsing: `src/sync/parsers/markdown-parser.ts`
- Type definitions: `src/sync/types/`

---

**Status**: ✅ Complete (Phase 5 Day 25-28)
**Total Tests**: 74 E2E integration tests
**Coverage**: Full sync workflow, bidirectional sync, FileWatcher, resilience
