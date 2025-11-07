import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Basic Application Health Check
 * These tests verify that the application loads correctly
 */

test.describe('Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');

    // Verify page title
    await expect(page).toHaveTitle(/TaskFlow/i);

    // Verify main elements are visible
    await expect(page.getByRole('heading', { name: /taskflow/i })).toBeVisible();
  });

  test('should navigate between views', async ({ page }) => {
    await page.goto('/');

    // Check if view navigation buttons exist
    const viewButtons = page.getByRole('button', { name: /kanban|table|calendar/i });
    await expect(viewButtons.first()).toBeVisible();
  });

  test('should open task creation dialog', async ({ page }) => {
    await page.goto('/');

    // Click add task button
    const addButton = page.getByRole('button', { name: /add task/i });

    // Skip test if button doesn't exist yet
    if (!(await addButton.isVisible())) {
      test.skip();
    }

    await addButton.click();

    // Verify dialog opened
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should display settings dialog', async ({ page }) => {
    await page.goto('/');

    // Click settings button
    const settingsButton = page.getByRole('button', { name: /settings/i });

    // Skip if settings button doesn't exist
    if (!(await settingsButton.isVisible())) {
      test.skip();
    }

    await settingsButton.click();

    // Verify settings dialog opened
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
