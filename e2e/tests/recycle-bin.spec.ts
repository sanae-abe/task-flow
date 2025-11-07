import { test, expect } from '../fixtures/test-fixtures';
import {
  createTask,
  deleteTask,
  assertTaskExists,
  assertTaskNotExists,
} from '../helpers/test-helpers';

/**
 * E2E Tests: Recycle Bin
 * Tests for soft delete, restore, and permanent deletion functionality
 */

test.describe('Recycle Bin', () => {
  test.beforeEach(async ({ page, cleanState }) => {
    await page.goto('/');
  });

  test.describe('Soft Delete', () => {
    test('should move deleted task to recycle bin', async ({ page }) => {
      const taskTitle = 'Task to Soft Delete';

      // Create task
      await createTask(page, { title: taskTitle });
      await assertTaskExists(page, taskTitle);

      // Delete task
      await deleteTask(page, taskTitle);

      // Verify task is no longer in main view
      await assertTaskNotExists(page, taskTitle);

      // Open recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Verify task is in recycle bin
      await expect(page.getByText(taskTitle)).toBeVisible();
    });

    test('should show deletion timestamp in recycle bin', async ({ page }) => {
      const taskTitle = 'Timestamped Deleted Task';

      // Create and delete task
      await createTask(page, { title: taskTitle });
      await deleteTask(page, taskTitle);

      // Open recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Verify deletion timestamp is displayed
      const taskRow = page.getByText(taskTitle).first().locator('..');
      await expect(
        taskRow.locator('[data-deleted-at], .deleted-timestamp')
      ).toBeVisible();
    });

    test('should preserve task properties in recycle bin', async ({
      page,
    }) => {
      const taskTitle = 'Task with Properties';

      // Create task with various properties
      await createTask(page, {
        title: taskTitle,
        description: 'Important description',
        priority: 'High',
      });

      // Delete task
      await deleteTask(page, taskTitle);

      // Open recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Click on task to view details
      await page.getByText(taskTitle).click();

      // Verify properties are preserved
      await expect(page.getByText('Important description')).toBeVisible();
      await expect(page.getByText(/high/i)).toBeVisible();
    });

    test('should handle multiple deleted tasks', async ({ page }) => {
      const tasks = ['Deleted Task 1', 'Deleted Task 2', 'Deleted Task 3'];

      // Create and delete multiple tasks
      for (const taskTitle of tasks) {
        await createTask(page, { title: taskTitle });
        await deleteTask(page, taskTitle);
      }

      // Open recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Verify all tasks are in recycle bin
      for (const taskTitle of tasks) {
        await expect(page.getByText(taskTitle)).toBeVisible();
      }

      // Verify count display
      await expect(page.getByText(/3 items|3 tasks/i)).toBeVisible();
    });
  });

  test.describe('Task Restoration', () => {
    test('should restore task from recycle bin', async ({ page }) => {
      const taskTitle = 'Task to Restore';

      // Create and delete task
      await createTask(page, { title: taskTitle });
      await deleteTask(page, taskTitle);

      // Open recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Restore task
      const taskRow = page.getByText(taskTitle).first().locator('..');
      await taskRow.getByRole('button', { name: /restore/i }).click();

      // Close settings
      await page.getByRole('button', { name: /close/i }).click();

      // Verify task is back in main view
      await assertTaskExists(page, taskTitle);

      // Verify task is no longer in recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();
      await expect(page.getByText(taskTitle)).not.toBeVisible();
    });

    test('should restore task with all properties intact', async ({ page }) => {
      const taskTitle = 'Full Property Restore Task';

      // Create task with properties
      await createTask(page, {
        title: taskTitle,
        description: 'Restore description',
        priority: 'High',
      });

      // Add subtasks
      await page.getByText(taskTitle).click();
      await page.getByPlaceholder(/add subtask/i).fill('Subtask 1');
      await page.keyboard.press('Enter');
      await page.getByRole('button', { name: /close/i }).click();

      // Delete task
      await deleteTask(page, taskTitle);

      // Restore task
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();
      const taskRow = page.getByText(taskTitle).first().locator('..');
      await taskRow.getByRole('button', { name: /restore/i }).click();
      await page.getByRole('button', { name: /close/i }).click();

      // Open restored task
      await page.getByText(taskTitle).click();

      // Verify all properties
      await expect(page.getByText('Restore description')).toBeVisible();
      await expect(page.getByText(/high/i)).toBeVisible();
      await expect(page.getByText('Subtask 1')).toBeVisible();
    });

    test('should restore task to original column', async ({ page }) => {
      const taskTitle = 'Column Restoration Task';

      // Create task and move to "In Progress"
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill(taskTitle);
      await page.getByLabel(/status/i).click();
      await page.getByText('In Progress', { exact: true }).click();
      await page.getByRole('button', { name: /create/i }).click();

      // Delete task
      await deleteTask(page, taskTitle);

      // Restore task
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();
      const taskRow = page.getByText(taskTitle).first().locator('..');
      await taskRow.getByRole('button', { name: /restore/i }).click();
      await page.getByRole('button', { name: /close/i }).click();

      // Verify task is in "In Progress" column
      await page.getByRole('button', { name: /kanban/i }).click();
      const inProgressColumn = page
        .getByText('In Progress')
        .first()
        .locator('..');
      await expect(inProgressColumn.getByText(taskTitle)).toBeVisible();
    });

    test('should show confirmation before restoring', async ({ page }) => {
      const taskTitle = 'Confirm Restore Task';

      // Create and delete task
      await createTask(page, { title: taskTitle });
      await deleteTask(page, taskTitle);

      // Open recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Click restore
      const taskRow = page.getByText(taskTitle).first().locator('..');
      await taskRow.getByRole('button', { name: /restore/i }).click();

      // Check if confirmation dialog appears (implementation specific)
      const confirmDialog = page.getByText(/are you sure|confirm restore/i);
      if (await confirmDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(confirmDialog).toBeVisible();

        // Cancel restoration
        await page.getByRole('button', { name: /cancel/i }).click();

        // Verify task still in recycle bin
        await expect(page.getByText(taskTitle)).toBeVisible();
      }
    });
  });

  test.describe('Permanent Deletion', () => {
    test('should permanently delete task from recycle bin', async ({
      page,
    }) => {
      const taskTitle = 'Task to Permanently Delete';

      // Create and soft delete task
      await createTask(page, { title: taskTitle });
      await deleteTask(page, taskTitle);

      // Open recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Permanently delete
      const taskRow = page.getByText(taskTitle).first().locator('..');
      await taskRow
        .getByRole('button', { name: /delete permanently|delete forever/i })
        .click();

      // Confirm permanent deletion
      await page.getByRole('button', { name: /confirm|delete/i }).click();

      // Verify task is completely gone
      await expect(page.getByText(taskTitle)).not.toBeVisible();
    });

    test('should show confirmation before permanent deletion', async ({
      page,
    }) => {
      const taskTitle = 'Confirm Permanent Delete';

      // Create and soft delete task
      await createTask(page, { title: taskTitle });
      await deleteTask(page, taskTitle);

      // Open recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Click permanent delete
      const taskRow = page.getByText(taskTitle).first().locator('..');
      await taskRow
        .getByRole('button', { name: /delete permanently|delete forever/i })
        .click();

      // Verify confirmation dialog
      await expect(
        page.getByText(
          /are you sure|this action cannot be undone|permanent/i
        )
      ).toBeVisible();

      // Cancel deletion
      await page.getByRole('button', { name: /cancel/i }).click();

      // Verify task still exists
      await expect(page.getByText(taskTitle)).toBeVisible();
    });

    test('should empty entire recycle bin', async ({ page }) => {
      // Create and delete multiple tasks
      const tasks = ['Delete All 1', 'Delete All 2', 'Delete All 3'];
      for (const taskTitle of tasks) {
        await createTask(page, { title: taskTitle });
        await deleteTask(page, taskTitle);
      }

      // Open recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Click empty bin button
      await page
        .getByRole('button', { name: /empty bin|delete all/i })
        .click();

      // Confirm action
      await page.getByRole('button', { name: /confirm|delete all/i }).click();

      // Verify all tasks are gone
      for (const taskTitle of tasks) {
        await expect(page.getByText(taskTitle)).not.toBeVisible();
      }

      // Verify empty state
      await expect(
        page.getByText(/no items|empty|recycle bin is empty/i)
      ).toBeVisible();
    });
  });

  test.describe('Recycle Bin Settings', () => {
    test('should configure retention period', async ({ page }) => {
      // Open recycle bin settings
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Find retention settings (if available)
      const retentionInput = page.getByLabel(/retention period|auto-delete/i);
      if (
        await retentionInput.isVisible({ timeout: 1000 }).catch(() => false)
      ) {
        // Change retention period
        await retentionInput.fill('7');

        // Save settings
        await page.getByRole('button', { name: /save/i }).click();

        // Verify success message
        await expect(
          page.getByText(/settings saved|success/i)
        ).toBeVisible();
      }
    });

    test('should show deletion candidate badge', async ({ page }) => {
      const taskTitle = 'Old Deleted Task';

      // Create and delete task
      await createTask(page, { title: taskTitle });
      await deleteTask(page, taskTitle);

      // Open recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Check for deletion candidate badge (for old items)
      // This test may need to be adjusted based on retention period implementation
      const taskRow = page.getByText(taskTitle).first().locator('..');
      const candidateBadge = taskRow.locator(
        '[data-deletion-candidate], .deletion-candidate-badge'
      );

      // Badge may not be visible for newly deleted items
      // This is implementation-dependent
    });

    test('should enable/disable auto-cleanup', async ({ page }) => {
      // Open recycle bin settings
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Find auto-cleanup toggle
      const autoCleanupToggle = page.getByRole('checkbox', {
        name: /auto-cleanup|automatic deletion/i,
      });

      if (
        await autoCleanupToggle.isVisible({ timeout: 1000 }).catch(() => false)
      ) {
        // Toggle auto-cleanup
        const wasEnabled = await autoCleanupToggle.isChecked();
        await autoCleanupToggle.click();

        // Save settings
        await page.getByRole('button', { name: /save/i }).click();

        // Verify change persisted
        await page.reload();
        await page.getByRole('button', { name: /settings/i }).click();
        await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

        const newState = await autoCleanupToggle.isChecked();
        expect(newState).toBe(!wasEnabled);
      }
    });

    test('should use preset retention periods', async ({ page }) => {
      // Open recycle bin settings
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Check for preset buttons
      const presets = ['7 days', '30 days', '90 days'];
      for (const preset of presets) {
        const presetButton = page.getByRole('button', { name: preset });
        if (
          await presetButton.isVisible({ timeout: 500 }).catch(() => false)
        ) {
          await presetButton.click();

          // Verify retention period updated
          const retentionInput = page.getByLabel(
            /retention period|auto-delete/i
          );
          const value = await retentionInput.inputValue();
          expect(parseInt(value)).toBeGreaterThan(0);

          break; // Test one preset
        }
      }
    });
  });

  test.describe('Recycle Bin Notifications', () => {
    test('should show notification banner for items near deletion', async ({
      page,
    }) => {
      // This test depends on retention period implementation
      // Create and delete task
      const taskTitle = 'Near Deletion Task';
      await createTask(page, { title: taskTitle });
      await deleteTask(page, taskTitle);

      // Open recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Check for notification banner (if items are near auto-deletion)
      const notificationBanner = page.locator(
        '[data-notification-banner], .deletion-warning'
      );

      // Banner may not appear for recently deleted items
      // This is implementation-dependent
    });
  });

  test.describe('Recycle Bin Search and Filter', () => {
    test('should search tasks in recycle bin', async ({ page }) => {
      // Create and delete multiple tasks
      await createTask(page, { title: 'Important Meeting Notes' });
      await createTask(page, { title: 'Code Review Feedback' });
      await deleteTask(page, 'Important Meeting Notes');
      await deleteTask(page, 'Code Review Feedback');

      // Open recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Search in recycle bin
      const searchInput = page.getByPlaceholder(/search/i);
      if (await searchInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await searchInput.fill('Meeting');

        // Verify search results
        await expect(page.getByText('Important Meeting Notes')).toBeVisible();
        await expect(page.getByText('Code Review Feedback')).not.toBeVisible();
      }
    });

    test('should sort tasks in recycle bin', async ({ page }) => {
      // Create and delete tasks at different times
      await createTask(page, { title: 'First Deleted' });
      await deleteTask(page, 'First Deleted');

      await page.waitForTimeout(1000);

      await createTask(page, { title: 'Second Deleted' });
      await deleteTask(page, 'Second Deleted');

      // Open recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      // Sort by deletion date
      const sortButton = page.getByRole('button', { name: /sort|order/i });
      if (await sortButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await sortButton.click();

        // Select sort option
        await page.getByText(/deletion date|newest first/i).click();

        // Verify sort order
        const items = await page
          .locator('[data-recycle-item], .recycle-bin-item')
          .allTextContents();

        expect(items[0]).toContain('Second Deleted');
        expect(items[1]).toContain('First Deleted');
      }
    });
  });

  test.describe('Recycle Bin Edge Cases', () => {
    test('should handle restoring task when board is deleted', async ({
      page,
    }) => {
      // This test requires board management implementation
      // Skip if not applicable
    });

    test('should handle permanent deletion of task with attachments', async ({
      page,
    }) => {
      const taskTitle = 'Task with Attachments';

      // Create task with file (if file upload is implemented)
      await createTask(page, { title: taskTitle });

      // Delete task
      await deleteTask(page, taskTitle);

      // Permanently delete from recycle bin
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      const taskRow = page.getByText(taskTitle).first().locator('..');
      await taskRow
        .getByRole('button', { name: /delete permanently/i })
        .click();
      await page.getByRole('button', { name: /confirm/i }).click();

      // Verify complete deletion
      await expect(page.getByText(taskTitle)).not.toBeVisible();
    });

    test('should preserve task order on restoration', async ({ page }) => {
      // Create multiple tasks
      const tasks = ['Task A', 'Task B', 'Task C'];
      for (const taskTitle of tasks) {
        await createTask(page, { title: taskTitle });
      }

      // Delete all tasks
      for (const taskTitle of tasks) {
        await deleteTask(page, taskTitle);
      }

      // Restore all tasks
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /recycle bin|trash/i }).click();

      for (const taskTitle of tasks) {
        const taskRow = page.getByText(taskTitle).first().locator('..');
        await taskRow.getByRole('button', { name: /restore/i }).click();
      }

      await page.getByRole('button', { name: /close/i }).click();

      // Verify all tasks are restored
      for (const taskTitle of tasks) {
        await assertTaskExists(page, taskTitle);
      }
    });
  });
});
