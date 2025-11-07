import { test as base, expect } from '@playwright/test';
import { setupTestData, clearAllTasks } from '../helpers/test-helpers';

/**
 * E2E Test Fixtures
 * Extended Playwright test with custom fixtures for TaskFlow
 */

type TaskFlowFixtures = {
  cleanState: void;
};

/**
 * Extended test with fixtures
 */
export const test = base.extend<TaskFlowFixtures>({
  /**
   * Clean state fixture - ensures clean environment for each test
   */
  cleanState: async ({ page }, use) => {
    // Setup: Clear all data before test
    await page.goto('/');
    await setupTestData(page);

    // Run test
    await use();

    // Teardown: Clean up after test (optional)
    // await clearAllTasks(page);
  },
});

export { expect };
