import { test, expect } from '../fixtures/test-fixtures';
import {
  createTask,
  editTask,
  deleteTask,
  completeTask,
  assertTaskExists,
  assertTaskNotExists,
  waitForToast,
} from '../helpers/test-helpers';

/**
 * E2E Tests: Task Management (Create, Edit, Delete, Complete)
 */

test.describe('Task Management', () => {
  test.beforeEach(async ({ page, cleanState }) => {
    await page.goto('/');
  });

  test.describe('Task Creation', () => {
    test('should create a simple task', async ({ page }) => {
      const taskTitle = 'Simple Task';

      await createTask(page, { title: taskTitle });

      // Verify task was created
      await assertTaskExists(page, taskTitle);
    });

    test('should create a task with description', async ({ page }) => {
      const taskTitle = 'Task with Description';
      const description = 'This is a detailed description';

      await createTask(page, {
        title: taskTitle,
        description,
      });

      // Verify task was created
      await assertTaskExists(page, taskTitle);

      // Open task to verify description
      await page.getByText(taskTitle).click();
      await expect(page.getByText(description)).toBeVisible();
    });

    test('should create a task with priority', async ({ page }) => {
      const taskTitle = 'High Priority Task';

      await createTask(page, {
        title: taskTitle,
        priority: 'High',
      });

      // Verify task was created
      await assertTaskExists(page, taskTitle);

      // Verify priority badge is visible
      await expect(
        page.locator('[data-priority="High"]').first()
      ).toBeVisible();
    });

    test('should create a task with due date', async ({ page }) => {
      const taskTitle = 'Task with Due Date';

      // Open create dialog
      await page.getByRole('button', { name: /add task/i }).click();

      // Fill title
      await page.getByLabel(/title/i).fill(taskTitle);

      // Set due date (tomorrow)
      await page.getByLabel(/due date/i).click();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayOfMonth = tomorrow.getDate().toString();
      await page.getByText(dayOfMonth, { exact: true }).first().click();

      // Submit
      await page.getByRole('button', { name: /create/i }).click();

      // Verify task was created
      await assertTaskExists(page, taskTitle);
    });

    test('should validate required fields', async ({ page }) => {
      // Open create dialog
      await page.getByRole('button', { name: /add task/i }).click();

      // Try to submit without title
      await page.getByRole('button', { name: /create/i }).click();

      // Verify validation error
      await expect(page.getByText(/title is required/i)).toBeVisible();
    });
  });

  test.describe('Task Editing', () => {
    test('should edit task title', async ({ page }) => {
      const originalTitle = 'Original Title';
      const newTitle = 'Updated Title';

      // Create task
      await createTask(page, { title: originalTitle });

      // Edit task
      await editTask(page, originalTitle, { title: newTitle });

      // Verify new title
      await assertTaskExists(page, newTitle);
      await assertTaskNotExists(page, originalTitle);
    });

    test('should edit task description', async ({ page }) => {
      const taskTitle = 'Task to Edit';
      const newDescription = 'Updated description content';

      // Create task
      await createTask(page, { title: taskTitle });

      // Edit description
      await editTask(page, taskTitle, { description: newDescription });

      // Verify updated description
      await page.getByText(taskTitle).click();
      await expect(page.getByText(newDescription)).toBeVisible();
    });

    test('should change task status', async ({ page }) => {
      const taskTitle = 'Task to Change Status';

      // Create task
      await createTask(page, { title: taskTitle });

      // Change status to "In Progress"
      await editTask(page, taskTitle, { status: 'In Progress' });

      // Verify task moved to correct column (if in Kanban view)
      await page.getByText(taskTitle).click();
      await expect(page.getByText('In Progress')).toBeVisible();
    });
  });

  test.describe('Task Deletion', () => {
    test('should delete a task', async ({ page }) => {
      const taskTitle = 'Task to Delete';

      // Create task
      await createTask(page, { title: taskTitle });
      await assertTaskExists(page, taskTitle);

      // Delete task
      await deleteTask(page, taskTitle);

      // Verify task was deleted (moved to recycle bin)
      await assertTaskNotExists(page, taskTitle);
    });

    test('should show confirmation dialog before deletion', async ({ page }) => {
      const taskTitle = 'Task to Delete with Confirmation';

      // Create task
      await createTask(page, { title: taskTitle });

      // Open task
      await page.getByText(taskTitle).click();

      // Click delete button
      await page.getByRole('button', { name: /delete/i }).click();

      // Verify confirmation dialog
      await expect(
        page.getByText(/are you sure|confirm/i)
      ).toBeVisible();

      // Cancel deletion
      await page.getByRole('button', { name: /cancel/i }).click();

      // Verify task still exists
      await assertTaskExists(page, taskTitle);
    });
  });

  test.describe('Task Completion', () => {
    test('should mark task as complete', async ({ page }) => {
      const taskTitle = 'Task to Complete';

      // Create task
      await createTask(page, { title: taskTitle });

      // Complete task
      await completeTask(page, taskTitle);

      // Verify task is marked as complete
      const checkbox = page
        .getByText(taskTitle)
        .first()
        .locator('..')
        .getByRole('checkbox');
      await expect(checkbox).toBeChecked();
    });

    test('should move completed task to Done column', async ({ page }) => {
      const taskTitle = 'Task to Complete in Kanban';

      // Create task
      await createTask(page, { title: taskTitle });

      // Complete task
      await completeTask(page, taskTitle);

      // Wait for animation
      await page.waitForTimeout(500);

      // Verify task moved to Done column
      const doneColumn = page.getByText(/done|completed/i).first().locator('..');
      await expect(doneColumn.getByText(taskTitle)).toBeVisible();
    });

    test('should unmark completed task', async ({ page }) => {
      const taskTitle = 'Task to Uncomplete';

      // Create and complete task
      await createTask(page, { title: taskTitle });
      await completeTask(page, taskTitle);

      // Uncheck task
      const checkbox = page
        .getByText(taskTitle)
        .first()
        .locator('..')
        .getByRole('checkbox');
      await checkbox.uncheck();

      // Verify task is not completed
      await expect(checkbox).not.toBeChecked();
    });
  });

  test.describe('Task Duplication', () => {
    test('should duplicate a task', async ({ page }) => {
      const taskTitle = 'Task to Duplicate';

      // Create task
      await createTask(page, {
        title: taskTitle,
        description: 'Original description',
      });

      // Open task detail
      await page.getByText(taskTitle).click();

      // Click duplicate button
      await page.getByRole('button', { name: /duplicate|copy/i }).click();

      // Verify duplicated task exists (usually with "Copy" suffix)
      await expect(page.getByText(`${taskTitle} (Copy)`).first()).toBeVisible();
    });
  });
});
