# Test Patterns & Best Practices for SyncOrchestrator

This document provides reusable test patterns and best practices used in the SyncOrchestrator test suite.

---

## Table of Contents

1. [Mock Setup Patterns](#mock-setup-patterns)
2. [Async Testing Patterns](#async-testing-patterns)
3. [Event Testing Patterns](#event-testing-patterns)
4. [Error Handling Patterns](#error-handling-patterns)
5. [Data-Driven Test Patterns](#data-driven-test-patterns)
6. [Performance Testing Patterns](#performance-testing-patterns)

---

## Mock Setup Patterns

### Pattern 1: Factory Functions for Test Data

```typescript
/**
 * Create mock task with sensible defaults
 * @param overrides - Partial task properties to override
 */
function createMockTask(overrides?: Partial<Task>): Task {
  const now = new Date();
  return {
    id: `task-${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Task',
    status: 'pending',
    priority: 'medium',
    createdAt: now,
    updatedAt: now,
    ...overrides, // Override defaults
  };
}

// Usage
const task = createMockTask({
  title: 'Custom Task',
  status: 'completed'
});
```

**Benefits**:
- Reduces boilerplate
- Ensures valid test data
- Easy to override specific fields

---

### Pattern 2: Reusable Mock Classes

```typescript
/**
 * Mock FileSystem for testing
 */
class MockFileSystem {
  private files: Map<string, string> = new Map();

  setFile(path: string, content: string): void {
    this.files.set(path, content);
  }

  async readFile(path: string): Promise<string> {
    const content = this.files.get(path);
    if (!content) throw new Error(`File not found: ${path}`);
    return content;
  }

  clear(): void {
    this.files.clear();
  }
}

// Usage
beforeEach(() => {
  mockFileSystem = new MockFileSystem();
  mockFileSystem.setFile('/test/TODO.md', '- [ ] Task 1');
});
```

**Benefits**:
- Encapsulates mock logic
- Provides test helper methods
- Maintains state between calls

---

### Pattern 3: Module-Level Mocks with Hoisting

```typescript
// Mock external dependencies at module level
vi.mock('../utils/logger', () => {
  const createMockLogger = () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(function(this: any) { return this; }),
  });

  const logger = createMockLogger();

  return {
    Logger: {
      getInstance: () => logger,
    },
  };
});
```

**Benefits**:
- Avoids hoisting issues
- Consistent mock behavior
- Easy to reset in beforeEach

---

## Async Testing Patterns

### Pattern 1: Testing Async Operations

```typescript
it('should complete async operation', async () => {
  // Arrange
  mockFileSystem.setFile('/test/TODO.md', '- [ ] Task');

  // Act
  await coordinator.syncFileToApp();

  // Assert
  const tasks = mockDatabase.getTasks();
  expect(tasks).toHaveLength(1);
});
```

**Key Points**:
- Always use `async/await`
- Don't forget `await` on async operations
- Test completes after all promises resolve

---

### Pattern 2: Testing Promise Rejection

```typescript
it('should handle errors correctly', async () => {
  // Arrange - setup to trigger error
  mockFileSystem.readFile = vi.fn().mockRejectedValue(
    new Error('File not found')
  );

  // Act & Assert
  await expect(coordinator.syncFileToApp()).rejects.toThrow('File not found');

  // Additional assertions
  const stats = coordinator.getStats();
  expect(stats.failedSyncs).toBe(1);
});
```

**Key Points**:
- Use `rejects.toThrow()` for error assertions
- Can check error message or type
- Assert side effects after error

---

### Pattern 3: Testing Concurrent Operations

```typescript
it('should prevent concurrent syncs', async () => {
  mockFileSystem.setFile('/test/TODO.md', '- [ ] Task');

  // Start multiple syncs concurrently
  const sync1 = coordinator.syncFileToApp();
  const sync2 = coordinator.syncFileToApp();
  const sync3 = coordinator.syncFileToApp();

  // Wait for all to complete
  await Promise.allSettled([sync1, sync2, sync3]);

  // Only one should execute
  const stats = coordinator.getStats();
  expect(stats.totalSyncs).toBe(1);
});
```

**Key Points**:
- Use `Promise.allSettled()` to wait for all promises
- Test the resulting state, not individual promises
- Check for proper synchronization

---

## Event Testing Patterns

### Pattern 1: Testing Event Emission

```typescript
it('should emit sync-completed event', async () => {
  // Arrange
  mockFileSystem.setFile('/test/TODO.md', '- [ ] Task');

  // Setup spy before action
  const completedSpy = vi.fn();
  coordinator.on('sync-completed', completedSpy);

  // Act
  await coordinator.syncFileToApp();

  // Assert
  expect(completedSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      direction: 'file_to_app',
      tasksChanged: expect.any(Number),
    })
  );
});
```

**Key Points**:
- Register spy before triggering action
- Use `expect.objectContaining()` for partial matching
- Use `expect.any(Type)` for type checking

---

### Pattern 2: Testing Event Data Structure

```typescript
it('should provide detailed event data', async () => {
  const completedSpy = vi.fn();
  coordinator.on('sync-completed', completedSpy);

  await coordinator.syncFileToApp();

  // Extract event data
  const eventData = completedSpy.mock.calls[0][0];

  // Assert structure
  expect(eventData).toHaveProperty('id');
  expect(eventData).toHaveProperty('startedAt');
  expect(eventData).toHaveProperty('completedAt');
  expect(eventData.durationMs).toBeGreaterThan(0);
});
```

**Key Points**:
- Access call data via `mock.calls`
- Test both presence and values
- Verify computed fields

---

### Pattern 3: Testing Event Order

```typescript
it('should emit events in correct order', async () => {
  const events: string[] = [];

  coordinator.on('sync-start', () => events.push('start'));
  coordinator.on('sync-completed', () => events.push('complete'));

  await coordinator.syncFileToApp();

  expect(events).toEqual(['start', 'complete']);
});
```

**Key Points**:
- Track event order in array
- Use `toEqual()` for exact matching
- Test event sequences

---

## Error Handling Patterns

### Pattern 1: Testing Error Propagation

```typescript
it('should propagate errors correctly', async () => {
  // Setup to trigger error
  mockDatabase.getTasks = vi.fn().mockRejectedValue(
    new Error('Database error')
  );

  // Should throw and not swallow error
  await expect(coordinator.syncAppToFile()).rejects.toThrow('Database error');

  // Check error was logged
  const stats = coordinator.getStats();
  expect(stats.failedSyncs).toBeGreaterThan(0);
});
```

**Key Points**:
- Verify error propagates to caller
- Check error logging/tracking
- Don't swallow errors in tests

---

### Pattern 2: Testing Graceful Degradation

```typescript
it('should degrade gracefully on non-critical errors', async () => {
  // Setup warning condition
  mockFileSystem.setFile('/test/TODO.md', '- [ Malformed task');

  // Should not throw
  await expect(coordinator.syncFileToApp()).resolves.not.toThrow();

  // But should log warning
  expect(mockLogger.warn).toHaveBeenCalled();
});
```

**Key Points**:
- Test partial success scenarios
- Verify warnings are logged
- System continues operating

---

### Pattern 3: Testing Error Recovery

```typescript
it('should recover from transient errors', async () => {
  let attemptCount = 0;

  mockFileSystem.readFile = vi.fn().mockImplementation(async () => {
    attemptCount++;
    if (attemptCount < 3) {
      throw new Error('Transient error');
    }
    return '- [ ] Task';
  });

  await coordinator.syncFileToApp();

  expect(attemptCount).toBeGreaterThanOrEqual(3);
  expect(coordinator.getStats().successfulSyncs).toBe(1);
});
```

**Key Points**:
- Simulate transient failures
- Verify retry logic
- Confirm eventual success

---

## Data-Driven Test Patterns

### Pattern 1: Parameterized Tests

```typescript
describe.each([
  { priority: 'high', emoji: '🔥' },
  { priority: 'medium', emoji: '📌' },
  { priority: 'low', emoji: '📝' },
])('Priority $priority', ({ priority, emoji }) => {
  it(`should parse ${priority} priority from ${emoji}`, async () => {
    const markdown = `## ${emoji} ${priority.toUpperCase()}\n\n- [ ] Task`;
    mockFileSystem.setFile('/test/TODO.md', markdown);

    await coordinator.syncFileToApp();

    const tasks = mockDatabase.getTasks();
    expect(tasks[0].priority).toBe(priority);
  });
});
```

**Benefits**:
- Reduce code duplication
- Test multiple scenarios
- Clear test output

---

### Pattern 2: Edge Case Matrix

```typescript
const edgeCases = [
  { input: '', expected: 0, description: 'empty file' },
  { input: '# TODO', expected: 0, description: 'header only' },
  { input: '- [ ] Task', expected: 1, description: 'single task' },
  { input: '- [ ] Task 1\n- [ ] Task 2', expected: 2, description: 'multiple tasks' },
];

edgeCases.forEach(({ input, expected, description }) => {
  it(`should handle ${description}`, async () => {
    mockFileSystem.setFile('/test/TODO.md', input);
    await coordinator.syncFileToApp();
    expect(mockDatabase.getTasks()).toHaveLength(expected);
  });
});
```

**Benefits**:
- Comprehensive edge case coverage
- Easy to add new cases
- Self-documenting tests

---

## Performance Testing Patterns

### Pattern 1: Timing Measurements

```typescript
it('should complete within time limit', async () => {
  const tasks = Array.from({ length: 1000 }, (_, i) =>
    createMockTask({ title: `Task ${i + 1}` })
  );
  mockDatabase.setTasks(tasks);

  const startTime = Date.now();
  await coordinator.syncAppToFile();
  const duration = Date.now() - startTime;

  expect(duration).toBeLessThan(1000); // Should complete in < 1 second
});
```

**Key Points**:
- Measure actual duration
- Set realistic thresholds
- Account for CI variability

---

### Pattern 2: Throughput Testing

```typescript
it('should handle high throughput', async () => {
  const markdown = Array.from({ length: 500 }, (_, i) =>
    `- [ ] Task ${i + 1}`
  ).join('\n');

  mockFileSystem.setFile('/test/TODO.md', markdown);

  await coordinator.syncFileToApp();

  const tasks = mockDatabase.getTasks();
  expect(tasks).toHaveLength(500);

  // Verify batch operations were used
  expect(mockDatabase.batchCreateTasks).toHaveBeenCalled();
});
```

**Key Points**:
- Test with realistic data volumes
- Verify optimizations are used
- Check for performance regressions

---

### Pattern 3: Memory Usage Patterns

```typescript
it('should not leak memory during large operations', async () => {
  const initialMemory = process.memoryUsage().heapUsed;

  // Perform multiple large operations
  for (let i = 0; i < 10; i++) {
    const tasks = Array.from({ length: 1000 }, (_, j) =>
      createMockTask()
    );
    mockDatabase.setTasks(tasks);
    await coordinator.syncAppToFile();
    mockDatabase.clear();
  }

  // Force garbage collection if available
  if (global.gc) global.gc();

  const finalMemory = process.memoryUsage().heapUsed;
  const memoryGrowth = finalMemory - initialMemory;

  // Memory growth should be minimal
  expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // < 10MB
});
```

**Key Points**:
- Test with multiple iterations
- Clear resources between iterations
- Check for memory leaks

---

## Best Practices Summary

### ✅ DO

- Use descriptive test names (`should do X when Y`)
- Test one thing per test
- Use factory functions for test data
- Clean up in `afterEach`
- Test error paths as well as happy paths
- Use appropriate matchers (`toBe` vs `toEqual`)
- Mock external dependencies
- Test public interface, not internals

### ❌ DON'T

- Share state between tests
- Use hard-coded IDs or timestamps
- Forget to await async operations
- Test implementation details
- Mix multiple assertions without context
- Ignore flaky tests
- Skip cleanup in afterEach
- Use `setTimeout` for async operations

---

## Common Pitfalls

### Pitfall 1: Forgetting to await

```typescript
// ❌ BAD - Missing await
it('should sync', () => {
  coordinator.syncFileToApp(); // Promise not awaited!
  expect(mockDatabase.getTasks()).toHaveLength(1);
});

// ✅ GOOD
it('should sync', async () => {
  await coordinator.syncFileToApp();
  expect(mockDatabase.getTasks()).toHaveLength(1);
});
```

### Pitfall 2: Shared mutable state

```typescript
// ❌ BAD - Shared state
let coordinator; // Shared across tests

it('test 1', async () => {
  await coordinator.syncFileToApp();
});

it('test 2', async () => {
  // State from test 1 affects this test!
  await coordinator.syncFileToApp();
});

// ✅ GOOD - Fresh state per test
beforeEach(() => {
  coordinator = new SyncCoordinator({ ... });
});
```

### Pitfall 3: Testing timing-dependent code

```typescript
// ❌ BAD - Timing-dependent
it('should debounce', async () => {
  await coordinator.syncFileToApp();
  await coordinator.syncFileToApp(); // Might run too fast
  expect(coordinator.getStats().totalSyncs).toBe(1);
});

// ✅ GOOD - Use fake timers
it('should debounce', async () => {
  vi.useFakeTimers();

  coordinator.syncFileToApp();
  coordinator.syncFileToApp();

  await vi.runAllTimersAsync();

  expect(coordinator.getStats().totalSyncs).toBe(1);
});
```

---

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Test Doubles](https://martinfowler.com/bliki/TestDouble.html)
- [AAA Pattern](https://wiki.c2.com/?ArrangeActAssert)

---

**Last Updated**: 2025-11-09
**Maintainer**: Test Automation Engineer
