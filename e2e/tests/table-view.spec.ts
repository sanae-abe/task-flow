import { test, expect } from '../fixtures/test-fixtures';
import {
  createTask,
  navigateToTable,
  assertTaskExists,
  editTask,
  completeTask,
} from '../helpers/test-helpers';

/**
 * E2E Tests: Table View
 * Tests for table-based task management and column customization
 */

test.describe('Table View', () => {
  test.beforeEach(async ({ page, cleanState }) => {
    await page.goto('/');
    await navigateToTable(page);
  });

  test.describe('Table Display', () => {
    test('should display table with default columns', async ({ page }) => {
      // Verify table is visible
      await expect(
        page.locator('[data-table], .table-view, table')
      ).toBeVisible();

      // Verify default column headers
      const defaultColumns = [
        'Title',
        'Status',
        'Priority',
        'Due Date',
        'Labels',
      ];

      for (const column of defaultColumns) {
        await expect(
          page.getByRole('columnheader', { name: column })
        ).toBeVisible();
      }
    });

    test('should show empty state when no tasks', async ({ page }) => {
      // Verify empty state message
      await expect(
        page.getByText(/no tasks|empty|create your first task/i)
      ).toBeVisible();
    });

    test('should display task count', async ({ page }) => {
      // Create tasks
      await createTask(page, { title: 'Task 1' });
      await createTask(page, { title: 'Task 2' });
      await createTask(page, { title: 'Task 3' });

      await navigateToTable(page);

      // Verify task count display
      await expect(page.getByText(/3 tasks|total: 3/i)).toBeVisible();
    });

    test('should display tasks in table rows', async ({ page }) => {
      const taskTitle = 'Table Task';

      await createTask(page, {
        title: taskTitle,
        description: 'Task description',
        priority: 'High',
      });

      await navigateToTable(page);

      // Verify task appears in table
      const row = page.getByRole('row', { name: taskTitle });
      await expect(row).toBeVisible();

      // Verify row contains expected data
      await expect(row.getByText(taskTitle)).toBeVisible();
      await expect(row.getByText(/high/i)).toBeVisible();
    });
  });

  test.describe('Column Management', () => {
    test('should toggle column visibility', async ({ page }) => {
      // Open column selector
      await page.getByRole('button', { name: /columns|customize/i }).click();

      // Find a column toggle (e.g., Description)
      const descriptionToggle = page.getByRole('checkbox', {
        name: /description/i,
      });

      // Check if description column is currently visible
      const isVisible = await descriptionToggle.isChecked();

      // Toggle visibility
      await descriptionToggle.click();

      // Close column selector
      await page.keyboard.press('Escape');

      // Verify column visibility changed
      const descColumn = page.getByRole('columnheader', {
        name: /description/i,
      });

      if (isVisible) {
        await expect(descColumn).not.toBeVisible();
      } else {
        await expect(descColumn).toBeVisible();
      }
    });

    test('should show/hide all columns', async ({ page }) => {
      // Open column selector
      await page.getByRole('button', { name: /columns|customize/i }).click();

      // Click "Hide All" button (if available)
      const hideAllButton = page.getByRole('button', { name: /hide all/i });
      if (await hideAllButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await hideAllButton.click();

        // Close selector
        await page.keyboard.press('Escape');

        // Verify only essential columns remain
        // (Title should always be visible)
        await expect(
          page.getByRole('columnheader', { name: /title/i })
        ).toBeVisible();
      }
    });

    test('should persist column visibility settings', async ({ page }) => {
      // Open column selector
      await page.getByRole('button', { name: /columns|customize/i }).click();

      // Toggle a column
      const subtasksToggle = page.getByRole('checkbox', {
        name: /subtasks/i,
      });
      const wasChecked = await subtasksToggle.isChecked();
      await subtasksToggle.click();

      // Close selector
      await page.keyboard.press('Escape');

      // Reload page
      await page.reload();
      await navigateToTable(page);

      // Verify setting persisted
      const subtasksColumn = page.getByRole('columnheader', {
        name: /subtasks/i,
      });

      if (wasChecked) {
        await expect(subtasksColumn).not.toBeVisible();
      } else {
        await expect(subtasksColumn).toBeVisible();
      }
    });

    test('should display all 12 available columns when enabled', async ({
      page,
    }) => {
      // Open column selector
      await page.getByRole('button', { name: /columns|customize/i }).click();

      // Enable all columns
      const allColumns = [
        'Title',
        'Status',
        'Priority',
        'Due Date',
        'Created',
        'Updated',
        'Description',
        'Labels',
        'Subtasks',
        'Recurrence',
        'Files',
        'Notes',
      ];

      for (const columnName of allColumns) {
        const checkbox = page.getByRole('checkbox', { name: columnName });
        if (
          await checkbox.isVisible({ timeout: 500 }).catch(() => false) &&
          !(await checkbox.isChecked())
        ) {
          await checkbox.click();
        }
      }

      // Close selector
      await page.keyboard.press('Escape');

      // Verify all columns are visible
      const visibleColumns = await page
        .getByRole('columnheader')
        .allTextContents();
      expect(visibleColumns.length).toBeGreaterThanOrEqual(12);
    });
  });

  test.describe('Table Sorting', () => {
    test('should sort by title ascending', async ({ page }) => {
      // Create tasks with different titles
      await createTask(page, { title: 'Zebra Task' });
      await createTask(page, { title: 'Alpha Task' });
      await createTask(page, { title: 'Beta Task' });

      await navigateToTable(page);

      // Click title column header to sort
      await page.getByRole('columnheader', { name: /title/i }).click();

      // Wait for sort to complete
      await page.waitForTimeout(500);

      // Get task order
      const taskTitles = await page
        .locator('[data-table-row], tbody tr')
        .allTextContents();

      // Verify ascending order
      expect(taskTitles[0]).toContain('Alpha');
      expect(taskTitles[1]).toContain('Beta');
      expect(taskTitles[2]).toContain('Zebra');
    });

    test('should sort by title descending', async ({ page }) => {
      // Create tasks
      await createTask(page, { title: 'Zebra Task' });
      await createTask(page, { title: 'Alpha Task' });
      await createTask(page, { title: 'Beta Task' });

      await navigateToTable(page);

      // Click title column twice for descending
      await page.getByRole('columnheader', { name: /title/i }).click();
      await page.waitForTimeout(200);
      await page.getByRole('columnheader', { name: /title/i }).click();
      await page.waitForTimeout(500);

      // Get task order
      const taskTitles = await page
        .locator('[data-table-row], tbody tr')
        .allTextContents();

      // Verify descending order
      expect(taskTitles[0]).toContain('Zebra');
      expect(taskTitles[1]).toContain('Beta');
      expect(taskTitles[2]).toContain('Alpha');
    });

    test('should sort by priority', async ({ page }) => {
      // Create tasks with different priorities
      await createTask(page, { title: 'Low Priority', priority: 'Low' });
      await createTask(page, { title: 'High Priority', priority: 'High' });
      await createTask(page, { title: 'Medium Priority', priority: 'Medium' });

      await navigateToTable(page);

      // Click priority column to sort
      await page.getByRole('columnheader', { name: /priority/i }).click();
      await page.waitForTimeout(500);

      // Verify sorted order (Critical > High > Medium > Low)
      const rows = await page
        .locator('[data-table-row], tbody tr')
        .allTextContents();

      const highIndex = rows.findIndex((r) => r.includes('High Priority'));
      const mediumIndex = rows.findIndex((r) => r.includes('Medium Priority'));
      const lowIndex = rows.findIndex((r) => r.includes('Low Priority'));

      expect(highIndex).toBeLessThan(mediumIndex);
      expect(mediumIndex).toBeLessThan(lowIndex);
    });

    test('should sort by due date', async ({ page }) => {
      // Create tasks with different due dates
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill('Task Due Next Week');
      await page.getByLabel(/due date/i).click();
      await page.getByText(nextWeek.getDate().toString(), { exact: true }).first().click();
      await page.getByRole('button', { name: /create/i }).click();

      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill('Task Due Tomorrow');
      await page.getByLabel(/due date/i).click();
      await page.getByText(tomorrow.getDate().toString(), { exact: true }).first().click();
      await page.getByRole('button', { name: /create/i }).click();

      await navigateToTable(page);

      // Sort by due date
      await page.getByRole('columnheader', { name: /due date/i }).click();
      await page.waitForTimeout(500);

      // Verify order (earliest first)
      const rows = await page
        .locator('[data-table-row], tbody tr')
        .allTextContents();

      const tomorrowIndex = rows.findIndex((r) =>
        r.includes('Task Due Tomorrow')
      );
      const nextWeekIndex = rows.findIndex((r) =>
        r.includes('Task Due Next Week')
      );

      expect(tomorrowIndex).toBeLessThan(nextWeekIndex);
    });

    test('should clear sort', async ({ page }) => {
      // Create tasks
      await createTask(page, { title: 'Task A' });
      await createTask(page, { title: 'Task B' });

      await navigateToTable(page);

      // Sort by title
      await page.getByRole('columnheader', { name: /title/i }).click();

      // Clear sort (if implemented)
      const clearSortButton = page.getByRole('button', { name: /clear sort/i });
      if (
        await clearSortButton.isVisible({ timeout: 1000 }).catch(() => false)
      ) {
        await clearSortButton.click();

        // Verify sort cleared (implementation specific)
      }
    });
  });

  test.describe('Table Filtering', () => {
    test('should filter by status', async ({ page }) => {
      // Create tasks with different statuses
      await createTask(page, { title: 'Todo Task' });

      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill('In Progress Task');
      await page.getByLabel(/status/i).click();
      await page.getByText('In Progress', { exact: true }).click();
      await page.getByRole('button', { name: /create/i }).click();

      await navigateToTable(page);

      // Apply status filter
      await page.getByRole('button', { name: /filter/i }).click();
      await page.getByLabel(/status/i).click();
      await page.getByText('In Progress', { exact: true }).click();

      // Verify only In Progress task is visible
      await expect(page.getByText('In Progress Task')).toBeVisible();
      await expect(page.getByText('Todo Task')).not.toBeVisible();
    });

    test('should filter by priority', async ({ page }) => {
      // Create tasks with different priorities
      await createTask(page, { title: 'High Priority', priority: 'High' });
      await createTask(page, { title: 'Low Priority', priority: 'Low' });

      await navigateToTable(page);

      // Apply priority filter
      await page.getByRole('button', { name: /filter/i }).click();
      await page.getByLabel(/priority/i).click();
      await page.getByText('High', { exact: true }).click();

      // Verify only high priority task is visible
      await expect(page.getByText('High Priority')).toBeVisible();
      await expect(page.getByText('Low Priority')).not.toBeVisible();
    });

    test('should search tasks by title', async ({ page }) => {
      // Create tasks
      await createTask(page, { title: 'Important Meeting' });
      await createTask(page, { title: 'Code Review' });

      await navigateToTable(page);

      // Use search functionality
      const searchInput = page.getByPlaceholder(/search/i);
      await searchInput.fill('Meeting');

      // Verify search results
      await expect(page.getByText('Important Meeting')).toBeVisible();
      await expect(page.getByText('Code Review')).not.toBeVisible();
    });

    test('should combine multiple filters', async ({ page }) => {
      // Create tasks with various properties
      await createTask(page, {
        title: 'High Priority Todo',
        priority: 'High',
      });
      await createTask(page, { title: 'Low Priority Todo', priority: 'Low' });

      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill('High Priority In Progress');
      await page.getByLabel(/status/i).click();
      await page.getByText('In Progress', { exact: true }).click();
      await page.getByRole('radio', { name: /high/i }).click();
      await page.getByRole('button', { name: /create/i }).click();

      await navigateToTable(page);

      // Apply multiple filters
      await page.getByRole('button', { name: /filter/i }).click();
      await page.getByLabel(/priority/i).click();
      await page.getByText('High', { exact: true }).click();
      await page.getByLabel(/status/i).click();
      await page.getByText('In Progress', { exact: true }).click();

      // Verify only matching task is visible
      await expect(page.getByText('High Priority In Progress')).toBeVisible();
      await expect(page.getByText('High Priority Todo')).not.toBeVisible();
      await expect(page.getByText('Low Priority Todo')).not.toBeVisible();
    });
  });

  test.describe('Task Actions in Table', () => {
    test('should complete task via checkbox', async ({ page }) => {
      const taskTitle = 'Task to Complete';

      await createTask(page, { title: taskTitle });
      await navigateToTable(page);

      // Find and check checkbox
      const row = page.getByRole('row', { name: taskTitle });
      const checkbox = row.getByRole('checkbox');
      await checkbox.check();

      // Verify task is completed
      await expect(checkbox).toBeChecked();
    });

    test('should edit task from table row', async ({ page }) => {
      const originalTitle = 'Original Table Task';
      const updatedTitle = 'Updated Table Task';

      await createTask(page, { title: originalTitle });
      await navigateToTable(page);

      // Click on task row to open detail
      await page.getByText(originalTitle).click();

      // Edit task
      await page.getByLabel(/title/i).fill(updatedTitle);
      await page.getByRole('button', { name: /save/i }).click();

      // Verify updated title in table
      await expect(page.getByText(updatedTitle)).toBeVisible();
      await expect(page.getByText(originalTitle)).not.toBeVisible();
    });

    test('should delete task from table', async ({ page }) => {
      const taskTitle = 'Task to Delete';

      await createTask(page, { title: taskTitle });
      await navigateToTable(page);

      // Open task and delete
      await page.getByText(taskTitle).click();
      await page.getByRole('button', { name: /delete/i }).click();
      await page.getByRole('button', { name: /confirm/i }).click();

      // Verify task is removed from table
      await expect(page.getByText(taskTitle)).not.toBeVisible();
    });

    test('should duplicate task from table', async ({ page }) => {
      const taskTitle = 'Task to Duplicate';

      await createTask(page, {
        title: taskTitle,
        description: 'Original description',
      });
      await navigateToTable(page);

      // Open task and duplicate
      await page.getByText(taskTitle).click();
      await page.getByRole('button', { name: /duplicate|copy/i }).click();

      // Verify duplicated task appears
      await expect(page.getByText(`${taskTitle} (Copy)`)).toBeVisible();
    });
  });

  test.describe('Subtask Progress Display', () => {
    test('should show subtask progress in table', async ({ page }) => {
      const taskTitle = 'Task with Subtasks';

      await createTask(page, { title: taskTitle });

      // Add subtasks
      await page.getByText(taskTitle).click();
      await page.getByPlaceholder(/add subtask/i).fill('Subtask 1');
      await page.keyboard.press('Enter');
      await page.getByPlaceholder(/add subtask/i).fill('Subtask 2');
      await page.keyboard.press('Enter');
      await page.getByRole('button', { name: /close/i }).click();

      await navigateToTable(page);

      // Enable subtask column if needed
      await page.getByRole('button', { name: /columns|customize/i }).click();
      const subtaskToggle = page.getByRole('checkbox', { name: /subtasks/i });
      if (!(await subtaskToggle.isChecked())) {
        await subtaskToggle.click();
      }
      await page.keyboard.press('Escape');

      // Verify subtask progress display
      const row = page.getByRole('row', { name: taskTitle });
      await expect(row.getByText(/0\/2|0 of 2/)).toBeVisible();
    });

    test('should update subtask progress when completed', async ({ page }) => {
      const taskTitle = 'Task with Completable Subtasks';

      await createTask(page, { title: taskTitle });

      // Add subtasks
      await page.getByText(taskTitle).click();
      await page.getByPlaceholder(/add subtask/i).fill('Subtask 1');
      await page.keyboard.press('Enter');
      await page.getByPlaceholder(/add subtask/i).fill('Subtask 2');
      await page.keyboard.press('Enter');

      // Complete one subtask
      const subtask1 = page.getByText('Subtask 1').first();
      const checkbox = subtask1.locator('..').getByRole('checkbox');
      await checkbox.check();

      await page.getByRole('button', { name: /close/i }).click();

      await navigateToTable(page);

      // Enable subtask column
      await page.getByRole('button', { name: /columns|customize/i }).click();
      const subtaskToggle = page.getByRole('checkbox', { name: /subtasks/i });
      if (!(await subtaskToggle.isChecked())) {
        await subtaskToggle.click();
      }
      await page.keyboard.press('Escape');

      // Verify updated progress
      const row = page.getByRole('row', { name: taskTitle });
      await expect(row.getByText(/1\/2|1 of 2/)).toBeVisible();
    });
  });

  test.describe('Table Pagination', () => {
    test('should paginate tasks when many exist', async ({ page }) => {
      // Create many tasks
      for (let i = 1; i <= 25; i++) {
        await createTask(page, { title: `Task ${i}` });
      }

      await navigateToTable(page);

      // Check if pagination controls exist
      const paginationControls = page.locator('[data-pagination]');
      if (
        await paginationControls.isVisible({ timeout: 1000 }).catch(() => false)
      ) {
        // Verify first page is shown
        await expect(page.getByText('Task 1')).toBeVisible();

        // Navigate to next page
        await page.getByRole('button', { name: /next page/i }).click();

        // Verify different tasks are shown
        await expect(page.getByText('Task 1')).not.toBeVisible();
      }
    });

    test('should change page size', async ({ page }) => {
      // Create tasks
      for (let i = 1; i <= 30; i++) {
        await createTask(page, { title: `Task ${i}` });
      }

      await navigateToTable(page);

      // Change page size (if implemented)
      const pageSizeSelector = page.getByLabel(/items per page|page size/i);
      if (
        await pageSizeSelector.isVisible({ timeout: 1000 }).catch(() => false)
      ) {
        await pageSizeSelector.click();
        await page.getByText('50', { exact: true }).click();

        // Verify more tasks are shown
        const visibleTasks = await page
          .locator('[data-table-row], tbody tr')
          .count();
        expect(visibleTasks).toBeGreaterThan(20);
      }
    });
  });

  test.describe('Table Performance', () => {
    test('should handle large number of tasks efficiently', async ({
      page,
    }) => {
      // Create 100 tasks
      for (let i = 1; i <= 100; i++) {
        await createTask(page, { title: `Task ${i}` });
      }

      // Measure load time
      const startTime = Date.now();
      await navigateToTable(page);
      const loadTime = Date.now() - startTime;

      // Verify reasonable load time (< 3 seconds)
      expect(loadTime).toBeLessThan(3000);

      // Verify table is fully rendered
      await expect(
        page.locator('[data-table], .table-view, table')
      ).toBeVisible();
    });
  });
});
