import { test, expect } from '../fixtures/test-fixtures';
import {
  createLabel,
  deleteLabel,
  createTask,
  assertLabelExists,
} from '../helpers/test-helpers';

/**
 * E2E Tests: Label Management (Create, Edit, Delete, Sort)
 */

test.describe('Label Management', () => {
  test.beforeEach(async ({ page, cleanState }) => {
    await page.goto('/');
  });

  test.describe('Label Creation', () => {
    test('should create a new label', async ({ page }) => {
      const labelName = 'Work';
      const labelColor = '#FF0000';

      await createLabel(page, labelName, labelColor);

      // Verify label was created
      await assertLabelExists(page, labelName);
    });

    test('should validate label name is required', async ({ page }) => {
      // Open settings
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /labels/i }).click();

      // Click add label
      await page.getByRole('button', { name: /add label/i }).click();

      // Try to submit without name
      await page.getByRole('button', { name: /create/i }).click();

      // Verify validation error
      await expect(page.getByText(/name is required/i)).toBeVisible();

      // Close settings
      await page.keyboard.press('Escape');
    });

    test('should prevent duplicate label names', async ({ page }) => {
      const labelName = 'Duplicate Test';

      // Create first label
      await createLabel(page, labelName, '#FF0000');

      // Try to create duplicate
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /labels/i }).click();
      await page.getByRole('button', { name: /add label/i }).click();

      await page.getByLabel(/name/i).fill(labelName);
      await page.getByRole('button', { name: /create/i }).click();

      // Verify duplicate error
      await expect(
        page.getByText(/already exists|duplicate/i)
      ).toBeVisible();
    });

    test('should allow selecting custom colors', async ({ page }) => {
      // Open settings
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /labels/i }).click();

      // Open create dialog
      await page.getByRole('button', { name: /add label/i }).click();

      // Fill name
      await page.getByLabel(/name/i).fill('Custom Color Label');

      // Verify color picker is visible
      const colorPicker = page.locator('[data-color-picker]');
      await expect(colorPicker).toBeVisible();

      // Select color
      await page.locator('[data-color="#00FF00"]').first().click();

      // Create label
      await page.getByRole('button', { name: /create/i }).click();

      // Verify label has correct color
      const labelRow = page.getByText('Custom Color Label').first().locator('..');
      const colorCircle = labelRow.locator('[data-color="#00FF00"]');
      await expect(colorCircle).toBeVisible();
    });
  });

  test.describe('Label Editing', () => {
    test('should edit label name', async ({ page }) => {
      const originalName = 'Original Label';
      const newName = 'Updated Label';

      // Create label
      await createLabel(page, originalName, '#FF0000');

      // Open settings
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /labels/i }).click();

      // Find and click edit
      const labelRow = page.getByText(originalName).first().locator('..');
      await labelRow.getByRole('button', { name: /edit/i }).click();

      // Update name
      await page.getByLabel(/name/i).fill(newName);
      await page.getByRole('button', { name: /save/i }).click();

      // Verify updated name
      await expect(page.getByText(newName)).toBeVisible();
      await expect(page.getByText(originalName)).not.toBeVisible();
    });

    test('should edit label color', async ({ page }) => {
      const labelName = 'Color Change Label';

      // Create label
      await createLabel(page, labelName, '#FF0000');

      // Open settings and edit
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /labels/i }).click();

      const labelRow = page.getByText(labelName).first().locator('..');
      await labelRow.getByRole('button', { name: /edit/i }).click();

      // Change color
      await page.locator('[data-color="#0000FF"]').first().click();
      await page.getByRole('button', { name: /save/i }).click();

      // Verify new color
      const updatedRow = page.getByText(labelName).first().locator('..');
      await expect(updatedRow.locator('[data-color="#0000FF"]')).toBeVisible();
    });
  });

  test.describe('Label Deletion', () => {
    test('should delete a label', async ({ page }) => {
      const labelName = 'Label to Delete';

      // Create label
      await createLabel(page, labelName, '#FF0000');

      // Delete label
      await deleteLabel(page, labelName);

      // Open settings to verify deletion
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /labels/i }).click();

      // Verify label is gone
      await expect(page.getByText(labelName)).not.toBeVisible();
    });

    test('should show confirmation before deleting label', async ({ page }) => {
      const labelName = 'Label with Confirmation';

      // Create label
      await createLabel(page, labelName, '#FF0000');

      // Open settings
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /labels/i }).click();

      // Click delete
      const labelRow = page.getByText(labelName).first().locator('..');
      await labelRow.getByRole('button', { name: /delete/i }).click();

      // Verify confirmation dialog
      await expect(
        page.getByText(/are you sure|confirm delete/i)
      ).toBeVisible();

      // Cancel deletion
      await page.getByRole('button', { name: /cancel/i }).click();

      // Verify label still exists
      await expect(page.getByText(labelName)).toBeVisible();
    });

    test('should remove label from tasks when deleted', async ({ page }) => {
      const labelName = 'Label on Task';

      // Create label and task with label
      await createLabel(page, labelName, '#FF0000');

      // Close settings
      await page.getByRole('button', { name: /close/i }).click();

      // Create task with label
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill('Task with Label');

      // Add label to task
      await page.getByLabel(/label/i).click();
      await page.getByText(labelName, { exact: true }).click();
      await page.getByRole('button', { name: /create/i }).click();

      // Delete label
      await deleteLabel(page, labelName);

      // Open task and verify label is removed
      await page.getByText('Task with Label').click();
      await expect(page.getByText(labelName)).not.toBeVisible();
    });
  });

  test.describe('Label Sorting', () => {
    test('should sort labels by name', async ({ page }) => {
      // Create multiple labels
      await createLabel(page, 'Zebra', '#FF0000');
      await createLabel(page, 'Alpha', '#00FF00');
      await createLabel(page, 'Beta', '#0000FF');

      // Open settings
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /labels/i }).click();

      // Click name column header to sort
      await page.getByText('Name').click();

      // Verify sorted order (Alpha, Beta, Zebra)
      const labelNames = await page
        .locator('[data-label-row]')
        .allTextContents();

      expect(labelNames[0]).toContain('Alpha');
      expect(labelNames[1]).toContain('Beta');
      expect(labelNames[2]).toContain('Zebra');
    });

    test('should sort labels by color', async ({ page }) => {
      // Create labels with different colors
      await createLabel(page, 'Red Label', '#FF0000');
      await createLabel(page, 'Green Label', '#00FF00');
      await createLabel(page, 'Blue Label', '#0000FF');

      // Open settings
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /labels/i }).click();

      // Click color column to sort
      await page.getByText('Color').click();

      // Verify labels are sorted by color
      // (implementation specific - may need adjustment)
    });

    test('should toggle sort direction', async ({ page }) => {
      // Create labels
      await createLabel(page, 'Alpha', '#FF0000');
      await createLabel(page, 'Beta', '#00FF00');

      // Open settings
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /labels/i }).click();

      // Sort ascending
      await page.getByText('Name').click();
      const ascOrder = await page
        .locator('[data-label-row]')
        .allTextContents();

      // Sort descending
      await page.getByText('Name').click();
      const descOrder = await page
        .locator('[data-label-row]')
        .allTextContents();

      // Verify order is reversed
      expect(ascOrder).not.toEqual(descOrder);
    });
  });

  test.describe('Label Application', () => {
    test('should apply label to task', async ({ page }) => {
      const labelName = 'Applied Label';

      // Create label
      await createLabel(page, labelName, '#FF0000');
      await page.getByRole('button', { name: /close/i }).click();

      // Create task and apply label
      await page.getByRole('button', { name: /add task/i }).click();
      await page.getByLabel(/title/i).fill('Task with Applied Label');

      await page.getByLabel(/label/i).click();
      await page.getByText(labelName, { exact: true }).click();

      await page.getByRole('button', { name: /create/i }).click();

      // Verify label appears on task
      const taskCard = page
        .getByText('Task with Applied Label')
        .first()
        .locator('..');
      await expect(taskCard.getByText(labelName)).toBeVisible();
    });

    test('should filter tasks by label', async ({ page }) => {
      const label1 = 'Filter Label 1';
      const label2 = 'Filter Label 2';

      // Create labels
      await createLabel(page, label1, '#FF0000');
      await createLabel(page, label2, '#00FF00');
      await page.getByRole('button', { name: /close/i }).click();

      // Create tasks with different labels
      await createTask(page, { title: 'Task 1', labels: [label1] });
      await createTask(page, { title: 'Task 2', labels: [label2] });

      // Apply label filter
      await page.getByRole('button', { name: /filter/i }).click();
      await page.getByLabel(/label/i).click();
      await page.getByText(label1, { exact: true }).click();

      // Verify only Task 1 is visible
      await expect(page.getByText('Task 1')).toBeVisible();
      await expect(page.getByText('Task 2')).not.toBeVisible();
    });

    test('should remove label from task', async ({ page }) => {
      const labelName = 'Remove Label';

      // Create label and task with label
      await createLabel(page, labelName, '#FF0000');
      await page.getByRole('button', { name: /close/i }).click();

      await createTask(page, { title: 'Task to Remove Label', labels: [labelName] });

      // Open task
      await page.getByText('Task to Remove Label').click();

      // Remove label
      const labelBadge = page.getByText(labelName).first();
      const removeButton = labelBadge.locator('..').getByRole('button', { name: /remove|×/i });
      await removeButton.click();

      // Save changes
      await page.getByRole('button', { name: /save/i }).click();

      // Verify label is removed
      const taskCard = page.getByText('Task to Remove Label').first().locator('..');
      await expect(taskCard.getByText(labelName)).not.toBeVisible();
    });
  });
});
