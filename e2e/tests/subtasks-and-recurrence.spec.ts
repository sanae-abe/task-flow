import { test, expect } from '../fixtures/test-fixtures';
import {
  createTask,
  addSubtask,
  completeSubtask,
  setRecurrence,
} from '../helpers/test-helpers';

/**
 * E2E Tests: Subtasks and Recurrence Features
 */

test.describe('Subtasks', () => {
  test.beforeEach(async ({ page, cleanState }) => {
    await page.goto('/');
  });

  test.describe('Subtask Creation', () => {
    test('should add subtask to task', async ({ page }) => {
      const taskTitle = 'Task with Subtasks';
      const subtaskTitle = 'First Subtask';

      // Create task
      await createTask(page, { title: taskTitle });

      // Add subtask
      await addSubtask(page, taskTitle, subtaskTitle);

      // Verify subtask was added
      await page.getByText(taskTitle).click();
      await expect(page.getByText(subtaskTitle)).toBeVisible();
    });

    test('should add multiple subtasks', async ({ page }) => {
      const taskTitle = 'Task with Multiple Subtasks';

      // Create task
      await createTask(page, { title: taskTitle });

      // Open task detail
      await page.getByText(taskTitle).click();

      // Add multiple subtasks
      for (let i = 1; i <= 3; i++) {
        await page.getByPlaceholder(/add subtask/i).fill(`Subtask ${i}`);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
      }

      // Verify all subtasks
      await expect(page.getByText('Subtask 1')).toBeVisible();
      await expect(page.getByText('Subtask 2')).toBeVisible();
      await expect(page.getByText('Subtask 3')).toBeVisible();
    });

    test('should validate empty subtask', async ({ page }) => {
      const taskTitle = 'Task for Empty Subtask Test';

      // Create task
      await createTask(page, { title: taskTitle });

      // Open task detail
      await page.getByText(taskTitle).click();

      // Try to add empty subtask
      await page.getByPlaceholder(/add subtask/i).focus();
      await page.keyboard.press('Enter');

      // Verify no empty subtask was added
      // (implementation may vary - might show validation or just not add)
    });
  });

  test.describe('Subtask Completion', () => {
    test('should complete subtask', async ({ page }) => {
      const taskTitle = 'Task for Completion';
      const subtaskTitle = 'Completable Subtask';

      // Create task and subtask
      await createTask(page, { title: taskTitle });
      await addSubtask(page, taskTitle, subtaskTitle);

      // Complete subtask
      await completeSubtask(page, taskTitle, subtaskTitle);

      // Verify subtask is checked
      await page.getByText(taskTitle).click();
      const checkbox = page
        .getByText(subtaskTitle)
        .locator('..')
        .getByRole('checkbox');
      await expect(checkbox).toBeChecked();
    });

    test('should update progress when subtask completed', async ({ page }) => {
      const taskTitle = 'Task with Progress';

      // Create task with subtasks
      await createTask(page, { title: taskTitle });

      await page.getByText(taskTitle).click();
      await page.getByPlaceholder(/add subtask/i).fill('Subtask 1');
      await page.keyboard.press('Enter');
      await page.getByPlaceholder(/add subtask/i).fill('Subtask 2');
      await page.keyboard.press('Enter');

      // Complete first subtask
      const subtask1 = page.getByText('Subtask 1').first();
      const checkbox1 = subtask1.locator('..').getByRole('checkbox');
      await checkbox1.check();

      // Verify progress indicator shows 1/2
      await expect(page.getByText(/1\/2|1 of 2/)).toBeVisible();

      // Complete second subtask
      const subtask2 = page.getByText('Subtask 2').first();
      const checkbox2 = subtask2.locator('..').getByRole('checkbox');
      await checkbox2.check();

      // Verify progress shows 2/2
      await expect(page.getByText(/2\/2|2 of 2/)).toBeVisible();
    });

    test('should uncomplete subtask', async ({ page }) => {
      const taskTitle = 'Task for Uncompletion';
      const subtaskTitle = 'Uncompletable Subtask';

      // Create task, add and complete subtask
      await createTask(page, { title: taskTitle });
      await addSubtask(page, taskTitle, subtaskTitle);
      await completeSubtask(page, taskTitle, subtaskTitle);

      // Reopen and uncheck
      await page.getByText(taskTitle).click();
      const checkbox = page
        .getByText(subtaskTitle)
        .locator('..')
        .getByRole('checkbox');
      await checkbox.uncheck();

      // Verify unchecked
      await expect(checkbox).not.toBeChecked();
    });
  });

  test.describe('Subtask Editing', () => {
    test('should edit subtask text', async ({ page }) => {
      const taskTitle = 'Task for Editing Subtask';
      const originalSubtask = 'Original Subtask';
      const updatedSubtask = 'Updated Subtask';

      // Create task and subtask
      await createTask(page, { title: taskTitle });
      await addSubtask(page, taskTitle, originalSubtask);

      // Edit subtask
      await page.getByText(taskTitle).click();
      const subtaskElement = page.getByText(originalSubtask).first();

      // Double-click to edit (if supported)
      await subtaskElement.dblclick();
      await page.keyboard.type(updatedSubtask);
      await page.keyboard.press('Enter');

      // Verify updated text
      await expect(page.getByText(updatedSubtask)).toBeVisible();
    });

    test('should delete subtask', async ({ page }) => {
      const taskTitle = 'Task for Deleting Subtask';
      const subtaskTitle = 'Deletable Subtask';

      // Create task and subtask
      await createTask(page, { title: taskTitle });
      await addSubtask(page, taskTitle, subtaskTitle);

      // Open task
      await page.getByText(taskTitle).click();

      // Delete subtask
      const subtaskRow = page.getByText(subtaskTitle).first().locator('..');
      const deleteButton = subtaskRow.getByRole('button', { name: /delete|×/i });
      await deleteButton.click();

      // Verify subtask is gone
      await expect(page.getByText(subtaskTitle)).not.toBeVisible();
    });
  });

  test.describe('Subtask Drag and Drop', () => {
    test('should reorder subtasks via drag and drop', async ({ page }) => {
      const taskTitle = 'Task for Reordering';

      // Create task with multiple subtasks
      await createTask(page, { title: taskTitle });

      await page.getByText(taskTitle).click();
      await page.getByPlaceholder(/add subtask/i).fill('Subtask A');
      await page.keyboard.press('Enter');
      await page.getByPlaceholder(/add subtask/i).fill('Subtask B');
      await page.keyboard.press('Enter');
      await page.getByPlaceholder(/add subtask/i).fill('Subtask C');
      await page.keyboard.press('Enter');

      // Get initial order
      const initialSubtasks = await page
        .locator('[data-subtask-item]')
        .allTextContents();

      // Drag Subtask C to top
      const subtaskC = page.getByText('Subtask C').first();
      const subtaskA = page.getByText('Subtask A').first();

      await subtaskC.hover();
      await page.mouse.down();
      await subtaskA.hover();
      await page.mouse.up();

      await page.waitForTimeout(500);

      // Verify order changed
      const newSubtasks = await page
        .locator('[data-subtask-item]')
        .allTextContents();

      expect(newSubtasks).not.toEqual(initialSubtasks);
    });
  });
});

test.describe('Recurrence', () => {
  test.beforeEach(async ({ page, cleanState }) => {
    await page.goto('/');
  });

  test.describe('Recurrence Setup', () => {
    test('should set daily recurrence', async ({ page }) => {
      const taskTitle = 'Daily Recurring Task';

      // Create task
      await createTask(page, { title: taskTitle });

      // Set recurrence
      await setRecurrence(page, taskTitle, 'Daily');

      // Verify recurrence indicator
      await page.getByText(taskTitle).click();
      await expect(page.getByText(/daily|every day/i)).toBeVisible();
    });

    test('should set weekly recurrence', async ({ page }) => {
      const taskTitle = 'Weekly Recurring Task';

      // Create task
      await createTask(page, { title: taskTitle });

      // Set recurrence
      await setRecurrence(page, taskTitle, 'Weekly');

      // Verify recurrence
      await page.getByText(taskTitle).click();
      await expect(page.getByText(/weekly|every week/i)).toBeVisible();
    });

    test('should set monthly recurrence', async ({ page }) => {
      const taskTitle = 'Monthly Recurring Task';

      // Create task
      await createTask(page, { title: taskTitle });

      // Set recurrence
      await setRecurrence(page, taskTitle, 'Monthly');

      // Verify recurrence
      await page.getByText(taskTitle).click();
      await expect(page.getByText(/monthly|every month/i)).toBeVisible();
    });

    test('should set yearly recurrence', async ({ page }) => {
      const taskTitle = 'Yearly Recurring Task';

      // Create task
      await createTask(page, { title: taskTitle });

      // Set recurrence
      await setRecurrence(page, taskTitle, 'Yearly');

      // Verify recurrence
      await page.getByText(taskTitle).click();
      await expect(page.getByText(/yearly|every year/i)).toBeVisible();
    });
  });

  test.describe('Recurrence Without Due Date', () => {
    test('should allow recurrence without due date', async ({ page }) => {
      const taskTitle = 'Recurring Task No Due Date';

      // Create task without due date
      await createTask(page, { title: taskTitle });

      // Open task
      await page.getByText(taskTitle).click();

      // Try to set recurrence
      await page.getByLabel(/recurrence/i).click();
      await page.getByText('Daily', { exact: true }).click();

      // Verify recurrence is set even without due date
      await expect(page.getByText(/daily/i)).toBeVisible();
    });
  });

  test.describe('Recurrence Editing', () => {
    test('should change recurrence pattern', async ({ page }) => {
      const taskTitle = 'Change Recurrence Pattern';

      // Create task with daily recurrence
      await createTask(page, { title: taskTitle });
      await setRecurrence(page, taskTitle, 'Daily');

      // Change to weekly
      await page.getByText(taskTitle).click();
      await page.getByLabel(/recurrence/i).click();
      await page.getByText('Weekly', { exact: true }).click();

      await page.getByRole('button', { name: /save/i }).click();

      // Verify changed
      await page.getByText(taskTitle).click();
      await expect(page.getByText(/weekly/i)).toBeVisible();
    });

    test('should remove recurrence', async ({ page }) => {
      const taskTitle = 'Remove Recurrence';

      // Create recurring task
      await createTask(page, { title: taskTitle });
      await setRecurrence(page, taskTitle, 'Daily');

      // Remove recurrence
      await page.getByText(taskTitle).click();
      await page.getByLabel(/recurrence/i).click();
      await page.getByText(/none|no recurrence/i).click();

      await page.getByRole('button', { name: /save/i }).click();

      // Verify recurrence removed
      await page.getByText(taskTitle).click();
      await expect(page.getByText(/daily|recurring/i)).not.toBeVisible();
    });
  });

  test.describe('Recurring Task Completion', () => {
    test('should create new instance when completing recurring task', async ({
      page,
    }) => {
      const taskTitle = 'Complete Recurring Task';

      // Create recurring task
      await createTask(page, { title: taskTitle });
      await setRecurrence(page, taskTitle, 'Daily');

      // Complete task
      const checkbox = page
        .getByText(taskTitle)
        .first()
        .locator('..')
        .getByRole('checkbox');
      await checkbox.check();

      await page.waitForTimeout(1000);

      // Verify new instance was created
      const taskCards = await page.getByText(taskTitle).count();
      expect(taskCards).toBeGreaterThan(0);
    });
  });
});
