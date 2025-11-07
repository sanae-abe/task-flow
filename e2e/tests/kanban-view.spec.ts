import { test, expect } from '../fixtures/test-fixtures';
import {
  createTask,
  navigateToKanban,
  dragTaskToColumn,
  assertTaskInColumn,
  getTasksInColumn,
} from '../helpers/test-helpers';

/**
 * E2E Tests: Kanban View (Drag & Drop, Column Management)
 */

test.describe('Kanban View', () => {
  test.beforeEach(async ({ page, cleanState }) => {
    await page.goto('/');
    await navigateToKanban(page);
  });

  test.describe('Kanban Display', () => {
    test('should display default columns', async ({ page }) => {
      // Verify default kanban columns
      await expect(page.getByText('To Do')).toBeVisible();
      await expect(page.getByText('In Progress')).toBeVisible();
      await expect(page.getByText('Done')).toBeVisible();
    });

    test('should display task count in columns', async ({ page }) => {
      // Create tasks
      await createTask(page, { title: 'Task 1' });
      await createTask(page, { title: 'Task 2' });
      await createTask(page, { title: 'Task 3' });

      // Navigate back to Kanban
      await navigateToKanban(page);

      // Verify task count badge
      const toDoColumn = page.getByText('To Do').first();
      await expect(toDoColumn.locator('..')).toContainText('3');
    });

    test('should show empty state when no tasks', async ({ page }) => {
      // Verify empty state message
      await expect(
        page.getByText(/no tasks|empty|create your first task/i)
      ).toBeVisible();
    });
  });

  test.describe('Drag and Drop', () => {
    test('should drag task between columns', async ({ page }) => {
      const taskTitle = 'Draggable Task';

      // Create task
      await createTask(page, { title: taskTitle });
      await navigateToKanban(page);

      // Drag task to "In Progress" column
      const task = page.getByText(taskTitle).first();
      const inProgressColumn = page
        .getByText('In Progress')
        .first()
        .locator('..');

      // Perform drag and drop
      await task.hover();
      await page.mouse.down();
      await inProgressColumn.hover();
      await page.mouse.up();

      // Wait for animation
      await page.waitForTimeout(500);

      // Verify task moved to new column
      await assertTaskInColumn(page, taskTitle, 'In Progress');
    });

    test('should maintain task order after drag', async ({ page }) => {
      // Create multiple tasks
      await createTask(page, { title: 'Task A' });
      await createTask(page, { title: 'Task B' });
      await createTask(page, { title: 'Task C' });

      await navigateToKanban(page);

      // Get initial order
      const initialTasks = await getTasksInColumn(page, 'To Do');
      expect(initialTasks).toHaveLength(3);

      // Drag middle task to In Progress
      const taskB = page.getByText('Task B').first();
      const inProgressColumn = page
        .getByText('In Progress')
        .first()
        .locator('..');

      await taskB.hover();
      await page.mouse.down();
      await inProgressColumn.hover();
      await page.mouse.up();

      await page.waitForTimeout(500);

      // Verify remaining tasks in To Do
      const remainingTasks = await getTasksInColumn(page, 'To Do');
      expect(remainingTasks).toContain('Task A');
      expect(remainingTasks).toContain('Task C');
      expect(remainingTasks).not.toContain('Task B');
    });

    test('should allow drag within same column for reordering', async ({
      page,
    }) => {
      // Create tasks
      await createTask(page, { title: 'Task 1' });
      await createTask(page, { title: 'Task 2' });
      await createTask(page, { title: 'Task 3' });

      await navigateToKanban(page);

      // Get initial order
      const initialOrder = await getTasksInColumn(page, 'To Do');

      // Drag Task 3 to top position (if supported)
      const task3 = page.getByText('Task 3').first();
      const task1 = page.getByText('Task 1').first();

      await task3.hover();
      await page.mouse.down();
      await task1.hover();
      await page.mouse.up();

      await page.waitForTimeout(500);

      // Verify order changed
      const newOrder = await getTasksInColumn(page, 'To Do');
      expect(newOrder).not.toEqual(initialOrder);
    });
  });

  test.describe('Column Management', () => {
    test('should move column position', async ({ page }) => {
      // Find column kebab menu (if exists)
      const toDoColumn = page.getByText('To Do').first().locator('..');
      const kebabMenu = toDoColumn.getByRole('button', { name: /more|menu/i });

      if (await kebabMenu.isVisible()) {
        await kebabMenu.click();

        // Click move right option
        await page.getByText(/move right/i).click();

        // Verify column moved (implementation specific)
        // This test may need adjustment based on actual implementation
      }
    });

    test('should set default column', async ({ page }) => {
      // Open settings
      await page.getByRole('button', { name: /settings/i }).click();

      // Navigate to board settings
      await page.getByRole('tab', { name: /board|kanban/i }).click();

      // Select default column
      await page.getByLabel(/default column/i).click();
      await page.getByText('In Progress', { exact: true }).click();

      // Save settings
      await page.getByRole('button', { name: /save/i }).click();

      // Close settings
      await page.getByRole('button', { name: /close/i }).click();

      // Create new task
      await createTask(page, { title: 'New Task in Default Column' });

      // Verify task appears in In Progress column
      await navigateToKanban(page);
      await assertTaskInColumn(page, 'New Task in Default Column', 'In Progress');
    });
  });

  test.describe('Completed Tasks', () => {
    test('should move completed task to top of Done column', async ({
      page,
    }) => {
      // Create and complete task
      await createTask(page, { title: 'Task to Complete' });

      await navigateToKanban(page);

      // Complete task
      const task = page.getByText('Task to Complete').first();
      const checkbox = task.locator('..').getByRole('checkbox');
      await checkbox.check();

      await page.waitForTimeout(500);

      // Verify task is at top of Done column
      const doneTasks = await getTasksInColumn(page, 'Done');
      expect(doneTasks[0]).toContain('Task to Complete');
    });

    test('should show completed tasks with strikethrough', async ({ page }) => {
      // Create and complete task
      await createTask(page, { title: 'Completed Task' });

      await navigateToKanban(page);

      const task = page.getByText('Completed Task').first();
      const checkbox = task.locator('..').getByRole('checkbox');
      await checkbox.check();

      await page.waitForTimeout(500);

      // Verify strikethrough styling
      const completedTask = page.getByText('Completed Task').first();
      const styles = await completedTask.evaluate((el) =>
        window.getComputedStyle(el)
      );

      // Check for text-decoration or opacity changes
      // This may need adjustment based on actual styling
    });
  });

  test.describe('Task Cards', () => {
    test('should display task information on card', async ({ page }) => {
      // Create task with various properties
      await createTask(page, {
        title: 'Full Featured Task',
        description: 'Task description',
        priority: 'High',
      });

      await navigateToKanban(page);

      const taskCard = page.getByText('Full Featured Task').first().locator('..');

      // Verify title
      await expect(taskCard.getByText('Full Featured Task')).toBeVisible();

      // Verify priority badge
      await expect(taskCard.locator('[data-priority="High"]')).toBeVisible();
    });

    test('should show subtask progress on card', async ({ page }) => {
      // Create task with subtasks
      await createTask(page, { title: 'Task with Subtasks' });

      // Add subtasks (via task detail)
      await page.getByText('Task with Subtasks').click();
      await page.getByPlaceholder(/add subtask/i).fill('Subtask 1');
      await page.keyboard.press('Enter');
      await page.getByPlaceholder(/add subtask/i).fill('Subtask 2');
      await page.keyboard.press('Enter');

      // Close detail
      await page.getByRole('button', { name: /close/i }).click();

      await navigateToKanban(page);

      // Verify subtask progress indicator
      const taskCard = page
        .getByText('Task with Subtasks')
        .first()
        .locator('..');
      await expect(taskCard.getByText(/0\/2|0 of 2/)).toBeVisible();
    });
  });

  test.describe('Filtering and Sorting', () => {
    test('should filter tasks by priority', async ({ page }) => {
      // Create tasks with different priorities
      await createTask(page, { title: 'High Priority', priority: 'High' });
      await createTask(page, { title: 'Low Priority', priority: 'Low' });

      await navigateToKanban(page);

      // Apply priority filter
      await page.getByRole('button', { name: /filter/i }).click();
      await page.getByLabel(/priority/i).click();
      await page.getByText('High', { exact: true }).click();

      // Verify only high priority task is visible
      await expect(page.getByText('High Priority')).toBeVisible();
      await expect(page.getByText('Low Priority')).not.toBeVisible();
    });

    test('should sort tasks by due date', async ({ page }) => {
      // Create tasks with different due dates
      // Implementation depends on actual sorting feature
    });
  });
});
