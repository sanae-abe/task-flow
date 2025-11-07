import { Page, Locator, expect } from '@playwright/test';

/**
 * E2E Test Helper Functions
 * Common utilities for TaskFlow E2E tests
 */

// =====================================
// Navigation Helpers
// =====================================

/**
 * Navigate to Kanban view
 */
export async function navigateToKanban(page: Page): Promise<void> {
  await page.getByRole('button', { name: /kanban/i }).click();
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to Table view
 */
export async function navigateToTable(page: Page): Promise<void> {
  await page.getByRole('button', { name: /table/i }).click();
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to Calendar view
 */
export async function navigateToCalendar(page: Page): Promise<void> {
  await page.getByRole('button', { name: /calendar/i }).click();
  await page.waitForLoadState('networkidle');
}

// =====================================
// Task Operations
// =====================================

/**
 * Create a new task via dialog
 */
export async function createTask(
  page: Page,
  options: {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: 'Critical' | 'High' | 'Medium' | 'Low';
    labels?: string[];
  }
): Promise<void> {
  // Open create dialog
  await page.getByRole('button', { name: /add task/i }).click();

  // Fill title
  await page.getByLabel(/title/i).fill(options.title);

  // Fill description if provided
  if (options.description) {
    const descriptionField = page.locator('[contenteditable="true"]').first();
    await descriptionField.click();
    await descriptionField.fill(options.description);
  }

  // Set due date if provided
  if (options.dueDate) {
    await page.getByLabel(/due date/i).click();
    await page.getByText(options.dueDate).click();
  }

  // Set priority if provided
  if (options.priority) {
    await page.getByRole('radio', { name: options.priority }).click();
  }

  // Add labels if provided
  if (options.labels && options.labels.length > 0) {
    for (const label of options.labels) {
      await page.getByLabel(/label/i).click();
      await page.getByText(label, { exact: true }).click();
    }
  }

  // Submit
  await page.getByRole('button', { name: /create/i }).click();
  await page.waitForLoadState('networkidle');
}

/**
 * Edit an existing task
 */
export async function editTask(
  page: Page,
  taskTitle: string,
  updates: {
    title?: string;
    description?: string;
    status?: string;
  }
): Promise<void> {
  // Find and click task card
  await page.getByText(taskTitle).click();

  // Wait for edit form to open
  await page.waitForSelector('[role="dialog"]');

  // Update title if provided
  if (updates.title) {
    await page.getByLabel(/title/i).fill(updates.title);
  }

  // Update description if provided
  if (updates.description) {
    const descriptionField = page.locator('[contenteditable="true"]').first();
    await descriptionField.click();
    await descriptionField.clear();
    await descriptionField.fill(updates.description);
  }

  // Update status if provided
  if (updates.status) {
    await page.getByLabel(/status/i).click();
    await page.getByText(updates.status, { exact: true }).click();
  }

  // Save changes
  await page.getByRole('button', { name: /save/i }).click();
  await page.waitForLoadState('networkidle');
}

/**
 * Delete a task
 */
export async function deleteTask(page: Page, taskTitle: string): Promise<void> {
  // Find task card
  const taskCard = page.getByText(taskTitle).first();
  await taskCard.click();

  // Click delete button
  await page.getByRole('button', { name: /delete/i }).click();

  // Confirm deletion
  await page.getByRole('button', { name: /confirm/i }).click();
  await page.waitForLoadState('networkidle');
}

/**
 * Complete a task
 */
export async function completeTask(page: Page, taskTitle: string): Promise<void> {
  const taskCard = page.getByText(taskTitle).first();
  const checkbox = taskCard.locator('..').getByRole('checkbox');
  await checkbox.check();
  await page.waitForLoadState('networkidle');
}

// =====================================
// Kanban Operations
// =====================================

/**
 * Drag and drop task to different column
 */
export async function dragTaskToColumn(
  page: Page,
  taskTitle: string,
  targetColumn: string
): Promise<void> {
  const task = page.getByText(taskTitle).first();
  const column = page.getByText(targetColumn).first();

  await task.dragTo(column);
  await page.waitForLoadState('networkidle');
}

/**
 * Get tasks in a specific column
 */
export async function getTasksInColumn(
  page: Page,
  columnName: string
): Promise<string[]> {
  const column = page.getByText(columnName).first().locator('..');
  const tasks = await column.locator('[data-task-card]').allTextContents();
  return tasks;
}

// =====================================
// Label Operations
// =====================================

/**
 * Create a new label
 */
export async function createLabel(
  page: Page,
  name: string,
  color: string
): Promise<void> {
  // Open settings
  await page.getByRole('button', { name: /settings/i }).click();

  // Navigate to label management
  await page.getByRole('tab', { name: /labels/i }).click();

  // Click create label
  await page.getByRole('button', { name: /add label/i }).click();

  // Fill label details
  await page.getByLabel(/name/i).fill(name);
  await page.locator(`[data-color="${color}"]`).click();

  // Save label
  await page.getByRole('button', { name: /create/i }).click();
  await page.waitForLoadState('networkidle');

  // Close settings
  await page.getByRole('button', { name: /close/i }).click();
}

/**
 * Delete a label
 */
export async function deleteLabel(page: Page, labelName: string): Promise<void> {
  // Open settings
  await page.getByRole('button', { name: /settings/i }).click();

  // Navigate to label management
  await page.getByRole('tab', { name: /labels/i }).click();

  // Find and delete label
  const labelRow = page.getByText(labelName).first().locator('..');
  await labelRow.getByRole('button', { name: /delete/i }).click();

  // Confirm deletion
  await page.getByRole('button', { name: /confirm/i }).click();
  await page.waitForLoadState('networkidle');

  // Close settings
  await page.getByRole('button', { name: /close/i }).click();
}

// =====================================
// Subtask Operations
// =====================================

/**
 * Add subtask to existing task
 */
export async function addSubtask(
  page: Page,
  taskTitle: string,
  subtaskTitle: string
): Promise<void> {
  // Open task detail
  await page.getByText(taskTitle).click();

  // Add subtask
  await page.getByPlaceholder(/add subtask/i).fill(subtaskTitle);
  await page.keyboard.press('Enter');
  await page.waitForLoadState('networkidle');

  // Close task detail
  await page.getByRole('button', { name: /close/i }).click();
}

/**
 * Complete a subtask
 */
export async function completeSubtask(
  page: Page,
  taskTitle: string,
  subtaskTitle: string
): Promise<void> {
  // Open task detail
  await page.getByText(taskTitle).click();

  // Find and check subtask
  const subtask = page.getByText(subtaskTitle).first();
  const checkbox = subtask.locator('..').getByRole('checkbox');
  await checkbox.check();
  await page.waitForLoadState('networkidle');

  // Close task detail
  await page.getByRole('button', { name: /close/i }).click();
}

// =====================================
// Recurrence Operations
// =====================================

/**
 * Set task recurrence
 */
export async function setRecurrence(
  page: Page,
  taskTitle: string,
  pattern: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly'
): Promise<void> {
  // Open task detail
  await page.getByText(taskTitle).click();

  // Open recurrence settings
  await page.getByLabel(/recurrence/i).click();

  // Select pattern
  await page.getByText(pattern, { exact: true }).click();

  // Save changes
  await page.getByRole('button', { name: /save/i }).click();
  await page.waitForLoadState('networkidle');

  // Close task detail
  await page.getByRole('button', { name: /close/i }).click();
}

// =====================================
// Template Operations
// =====================================

/**
 * Create task from template
 */
export async function createTaskFromTemplate(
  page: Page,
  templateName: string
): Promise<void> {
  // Open templates
  await page.getByRole('button', { name: /templates/i }).click();

  // Select template
  await page.getByText(templateName).click();

  // Create task
  await page.getByRole('button', { name: /use template/i }).click();
  await page.waitForLoadState('networkidle');
}

/**
 * Save task as template
 */
export async function saveAsTemplate(
  page: Page,
  taskTitle: string,
  templateName: string
): Promise<void> {
  // Open task detail
  await page.getByText(taskTitle).click();

  // Click save as template
  await page.getByRole('button', { name: /save as template/i }).click();

  // Fill template name
  await page.getByLabel(/template name/i).fill(templateName);

  // Save template
  await page.getByRole('button', { name: /save/i }).click();
  await page.waitForLoadState('networkidle');

  // Close task detail
  await page.getByRole('button', { name: /close/i }).click();
}

// =====================================
// Assertion Helpers
// =====================================

/**
 * Assert task exists
 */
export async function assertTaskExists(
  page: Page,
  taskTitle: string
): Promise<void> {
  await expect(page.getByText(taskTitle).first()).toBeVisible();
}

/**
 * Assert task does not exist
 */
export async function assertTaskNotExists(
  page: Page,
  taskTitle: string
): Promise<void> {
  await expect(page.getByText(taskTitle).first()).not.toBeVisible();
}

/**
 * Assert task is in column
 */
export async function assertTaskInColumn(
  page: Page,
  taskTitle: string,
  columnName: string
): Promise<void> {
  const tasks = await getTasksInColumn(page, columnName);
  expect(tasks).toContain(taskTitle);
}

/**
 * Assert label exists
 */
export async function assertLabelExists(
  page: Page,
  labelName: string
): Promise<void> {
  // Open settings
  await page.getByRole('button', { name: /settings/i }).click();
  await page.getByRole('tab', { name: /labels/i }).click();

  // Check label exists
  await expect(page.getByText(labelName).first()).toBeVisible();

  // Close settings
  await page.getByRole('button', { name: /close/i }).click();
}

// =====================================
// Wait Helpers
// =====================================

/**
 * Wait for toast notification
 */
export async function waitForToast(
  page: Page,
  message: string
): Promise<void> {
  await expect(
    page.locator('[role="status"]').filter({ hasText: message })
  ).toBeVisible();
}

/**
 * Wait for dialog to close
 */
export async function waitForDialogClose(page: Page): Promise<void> {
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
}

// =====================================
// Data Reset Helpers
// =====================================

/**
 * Clear all tasks (for test isolation)
 */
export async function clearAllTasks(page: Page): Promise<void> {
  // This assumes localStorage-based storage
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await page.waitForLoadState('networkidle');
}

/**
 * Setup test data
 */
export async function setupTestData(page: Page): Promise<void> {
  // This can be expanded based on test needs
  await clearAllTasks(page);
}
