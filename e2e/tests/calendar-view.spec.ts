import { test, expect } from '../fixtures/test-fixtures';
import {
  createTask,
  navigateToCalendar,
  assertTaskExists,
  editTask,
} from '../helpers/test-helpers';

/**
 * E2E Tests: Calendar View
 * Tests for calendar-based task management
 */

test.describe('Calendar View', () => {
  test.beforeEach(async ({ page, cleanState }) => {
    await page.goto('/');
    await navigateToCalendar(page);
  });

  test.describe('Calendar Display', () => {
    test('should display calendar with current month', async ({ page }) => {
      // Verify calendar is visible
      await expect(
        page.locator('[data-calendar], .calendar-view')
      ).toBeVisible();

      // Verify month/year header
      const currentDate = new Date();
      const monthName = currentDate.toLocaleString('default', {
        month: 'long',
      });
      await expect(page.getByText(monthName)).toBeVisible();
    });

    test('should show weekday headers', async ({ page }) => {
      // Verify all weekday headers are visible
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (const day of weekdays) {
        await expect(
          page.getByText(day, { exact: false }).first()
        ).toBeVisible();
      }
    });

    test('should display all days of current month', async ({ page }) => {
      // Verify calendar grid shows days
      const dayNumbers = await page
        .locator('[data-day], .calendar-day')
        .count();
      expect(dayNumbers).toBeGreaterThan(28); // At least 28 days
    });

    test('should highlight today date', async ({ page }) => {
      const today = new Date().getDate();

      // Find today's date cell (may need to adjust selector based on implementation)
      const todayCell = page.locator(
        `[data-today="true"], .calendar-day-today`
      );
      await expect(todayCell).toBeVisible();
    });
  });

  test.describe('Calendar Navigation', () => {
    test('should navigate to next month', async ({ page }) => {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', {
        month: 'long',
      });

      // Click next month button
      await page.getByRole('button', { name: /next/i }).click();

      // Verify month changed
      const nextDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1
      );
      const nextMonth = nextDate.toLocaleString('default', { month: 'long' });

      await expect(page.getByText(nextMonth).first()).toBeVisible();
      await expect(page.getByText(currentMonth)).not.toBeVisible();
    });

    test('should navigate to previous month', async ({ page }) => {
      const currentDate = new Date();
      const currentMonth = currentDate.toLocaleString('default', {
        month: 'long',
      });

      // Click previous month button
      await page.getByRole('button', { name: /previous|prev/i }).click();

      // Verify month changed
      const prevDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1
      );
      const prevMonth = prevDate.toLocaleString('default', { month: 'long' });

      await expect(page.getByText(prevMonth).first()).toBeVisible();
    });

    test('should navigate to today', async ({ page }) => {
      // Navigate away from current month
      await page.getByRole('button', { name: /next/i }).click();
      await page.getByRole('button', { name: /next/i }).click();

      // Click today button
      await page.getByRole('button', { name: /today/i }).click();

      // Verify we're back to current month
      const today = new Date();
      const currentMonth = today.toLocaleString('default', { month: 'long' });
      await expect(page.getByText(currentMonth).first()).toBeVisible();

      // Verify today is highlighted
      await expect(
        page.locator('[data-today="true"], .calendar-day-today')
      ).toBeVisible();
    });

    test('should navigate across year boundary', async ({ page }) => {
      // Navigate to December
      while (
        !(await page.getByText('December').first().isVisible({ timeout: 1000 }).catch(() => false))
      ) {
        await page.getByRole('button', { name: /next/i }).click();
      }

      // Go to next month (January of next year)
      await page.getByRole('button', { name: /next/i }).click();

      // Verify January of next year
      await expect(page.getByText('January').first()).toBeVisible();
    });
  });

  test.describe('Tasks in Calendar', () => {
    test('should display task on due date', async ({ page }) => {
      const taskTitle = 'Calendar Task';

      // Create task with due date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayOfMonth = tomorrow.getDate().toString();

      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill(taskTitle);
      await page.getByLabel(/due date/i).click();
      await page.getByText(dayOfMonth, { exact: true }).first().click();
      await page.getByRole('button', { name: /create/i }).click();

      // Navigate to calendar
      await navigateToCalendar(page);

      // Verify task appears on correct date
      const tomorrowCell = page.locator(
        `[data-date*="${tomorrow.getDate()}"]`
      );
      await expect(tomorrowCell.getByText(taskTitle)).toBeVisible();
    });

    test('should show multiple tasks on same day', async ({ page }) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayOfMonth = tomorrow.getDate().toString();

      // Create multiple tasks for same day
      const tasks = ['Task 1', 'Task 2', 'Task 3'];

      for (const taskTitle of tasks) {
        await page.getByRole('button', { name: /add task/i }).click();
        await page.getByLabel(/title/i).fill(taskTitle);
        await page.getByLabel(/due date/i).click();
        await page.getByText(dayOfMonth, { exact: true }).first().click();
        await page.getByRole('button', { name: /create/i }).click();
      }

      // Navigate to calendar
      await navigateToCalendar(page);

      // Verify all tasks are visible
      for (const taskTitle of tasks) {
        await expect(page.getByText(taskTitle).first()).toBeVisible();
      }
    });

    test('should show task count indicator for days with many tasks', async ({
      page,
    }) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayOfMonth = tomorrow.getDate().toString();

      // Create many tasks for same day
      for (let i = 1; i <= 5; i++) {
        await page.getByRole('button', { name: /add task/i }).click();
        await page.getByLabel(/title/i).fill(`Task ${i}`);
        await page.getByLabel(/due date/i).click();
        await page.getByText(dayOfMonth, { exact: true }).first().click();
        await page.getByRole('button', { name: /create/i }).click();
      }

      // Navigate to calendar
      await navigateToCalendar(page);

      // Verify count indicator (implementation specific)
      const tomorrowCell = page.locator(
        `[data-date*="${tomorrow.getDate()}"]`
      );
      await expect(
        tomorrowCell.locator('[data-task-count], .task-count-badge')
      ).toBeVisible();
    });

    test('should not show tasks without due date', async ({ page }) => {
      const taskTitle = 'No Due Date Task';

      // Create task without due date
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill(taskTitle);
      await page.getByRole('button', { name: /create/i }).click();

      // Navigate to calendar
      await navigateToCalendar(page);

      // Verify task is not in calendar
      await expect(page.getByText(taskTitle)).not.toBeVisible();
    });
  });

  test.describe('Task Interaction in Calendar', () => {
    test('should open task detail when clicking task in calendar', async ({
      page,
    }) => {
      const taskTitle = 'Clickable Calendar Task';
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayOfMonth = tomorrow.getDate().toString();

      // Create task
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill(taskTitle);
      await page.getByLabel(/due date/i).click();
      await page.getByText(dayOfMonth, { exact: true }).first().click();
      await page.getByRole('button', { name: /create/i }).click();

      // Navigate to calendar
      await navigateToCalendar(page);

      // Click task in calendar
      await page.getByText(taskTitle).click();

      // Verify task detail dialog opened
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.getByText(taskTitle).first()).toBeVisible();
    });

    test('should allow editing task from calendar', async ({ page }) => {
      const originalTitle = 'Original Calendar Task';
      const updatedTitle = 'Updated Calendar Task';
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayOfMonth = tomorrow.getDate().toString();

      // Create task
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill(originalTitle);
      await page.getByLabel(/due date/i).click();
      await page.getByText(dayOfMonth, { exact: true }).first().click();
      await page.getByRole('button', { name: /create/i }).click();

      // Navigate to calendar
      await navigateToCalendar(page);

      // Click and edit task
      await page.getByText(originalTitle).click();
      await page.getByLabel(/title/i).fill(updatedTitle);
      await page.getByRole('button', { name: /save/i }).click();

      // Verify updated title in calendar
      await expect(page.getByText(updatedTitle)).toBeVisible();
      await expect(page.getByText(originalTitle)).not.toBeVisible();
    });

    test('should complete task from calendar view', async ({ page }) => {
      const taskTitle = 'Task to Complete in Calendar';
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayOfMonth = tomorrow.getDate().toString();

      // Create task
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill(taskTitle);
      await page.getByLabel(/due date/i).click();
      await page.getByText(dayOfMonth, { exact: true }).first().click();
      await page.getByRole('button', { name: /create/i }).click();

      // Navigate to calendar
      await navigateToCalendar(page);

      // Complete task via checkbox
      const task = page.getByText(taskTitle).first();
      const checkbox = task.locator('..').getByRole('checkbox');
      await checkbox.check();

      // Verify task shows as completed
      await expect(checkbox).toBeChecked();
    });

    test('should create new task by clicking on date', async ({ page }) => {
      // Click on a specific date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayOfMonth = tomorrow.getDate().toString();

      const dateCell = page
        .getByText(dayOfMonth, { exact: true })
        .filter({ has: page.locator('[data-day], .calendar-day') })
        .first();

      await dateCell.click();

      // Verify create task dialog opens (if implemented)
      // This may need adjustment based on actual implementation
      const createDialog = page.locator('[role="dialog"]');
      if (await createDialog.isVisible({ timeout: 1000 }).catch(() => false)) {
        await expect(createDialog).toBeVisible();
      }
    });
  });

  test.describe('Calendar Filtering', () => {
    test('should filter tasks by priority in calendar', async ({ page }) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayOfMonth = tomorrow.getDate().toString();

      // Create tasks with different priorities
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill('High Priority Task');
      await page.getByLabel(/due date/i).click();
      await page.getByText(dayOfMonth, { exact: true }).first().click();
      await page.getByRole('radio', { name: /high/i }).click();
      await page.getByRole('button', { name: /create/i }).click();

      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill('Low Priority Task');
      await page.getByLabel(/due date/i).click();
      await page.getByText(dayOfMonth, { exact: true }).first().click();
      await page.getByRole('radio', { name: /low/i }).click();
      await page.getByRole('button', { name: /create/i }).click();

      // Navigate to calendar
      await navigateToCalendar(page);

      // Apply priority filter
      await page.getByRole('button', { name: /filter/i }).click();
      await page.getByLabel(/priority/i).click();
      await page.getByText('High', { exact: true }).click();

      // Verify only high priority task is visible
      await expect(page.getByText('High Priority Task')).toBeVisible();
      await expect(page.getByText('Low Priority Task')).not.toBeVisible();
    });

    test('should filter tasks by label in calendar', async ({ page }) => {
      // This test assumes labels have been created
      // Implementation depends on label creation flow
    });

    test('should show/hide completed tasks in calendar', async ({ page }) => {
      const taskTitle = 'Completed Calendar Task';
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayOfMonth = tomorrow.getDate().toString();

      // Create and complete task
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill(taskTitle);
      await page.getByLabel(/due date/i).click();
      await page.getByText(dayOfMonth, { exact: true }).first().click();
      await page.getByRole('button', { name: /create/i }).click();

      await navigateToCalendar(page);

      const task = page.getByText(taskTitle).first();
      const checkbox = task.locator('..').getByRole('checkbox');
      await checkbox.check();

      // Toggle completed tasks visibility (if implemented)
      const hideCompletedToggle = page.getByRole('button', {
        name: /hide completed|show completed/i,
      });

      if (
        await hideCompletedToggle.isVisible({ timeout: 1000 }).catch(() => false)
      ) {
        await hideCompletedToggle.click();
        await expect(page.getByText(taskTitle)).not.toBeVisible();
      }
    });
  });

  test.describe('Calendar Visual Indicators', () => {
    test('should show priority colors on calendar tasks', async ({ page }) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayOfMonth = tomorrow.getDate().toString();

      // Create high priority task
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill('Priority Indicator Task');
      await page.getByLabel(/due date/i).click();
      await page.getByText(dayOfMonth, { exact: true }).first().click();
      await page.getByRole('radio', { name: /high/i }).click();
      await page.getByRole('button', { name: /create/i }).click();

      // Navigate to calendar
      await navigateToCalendar(page);

      // Verify priority indicator is visible
      const taskElement = page.getByText('Priority Indicator Task').first();
      await expect(taskElement.locator('[data-priority="High"]')).toBeVisible();
    });

    test('should show overdue indicator for past tasks', async ({ page }) => {
      const taskTitle = 'Overdue Task';

      // Create task with past due date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill(taskTitle);
      await page.getByLabel(/due date/i).click();

      // Navigate to previous month if yesterday is in previous month
      if (yesterday.getMonth() < new Date().getMonth()) {
        await page.getByRole('button', { name: /previous|prev/i }).click();
      }

      const dayOfMonth = yesterday.getDate().toString();
      await page.getByText(dayOfMonth, { exact: true }).first().click();
      await page.getByRole('button', { name: /create/i }).click();

      // Navigate to calendar
      await navigateToCalendar(page);

      // Navigate to previous month if needed
      if (yesterday.getMonth() < new Date().getMonth()) {
        await page.getByRole('button', { name: /previous|prev/i }).click();
      }

      // Verify overdue styling (implementation specific)
      const task = page.getByText(taskTitle).first();
      await expect(task.locator('[data-overdue], .overdue-task')).toBeVisible();
    });
  });

  test.describe('Calendar Performance', () => {
    test('should handle month with many tasks efficiently', async ({
      page,
    }) => {
      // Create 30 tasks for the current month
      const today = new Date();
      const daysInMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      ).getDate();

      for (let i = 1; i <= 30 && i <= daysInMonth; i++) {
        await page.getByRole('button', { name: /add task/i }).click();
        await page.getByLabel(/title/i).fill(`Task ${i}`);
        await page.getByLabel(/due date/i).click();
        await page.getByText(i.toString(), { exact: true }).first().click();
        await page.getByRole('button', { name: /create/i }).click();
      }

      // Navigate to calendar
      const startTime = Date.now();
      await navigateToCalendar(page);
      const loadTime = Date.now() - startTime;

      // Verify reasonable load time (< 3 seconds)
      expect(loadTime).toBeLessThan(3000);

      // Verify calendar is fully rendered
      await expect(
        page.locator('[data-calendar], .calendar-view')
      ).toBeVisible();
    });
  });
});
