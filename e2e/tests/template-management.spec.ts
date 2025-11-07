import { test, expect } from '../fixtures/test-fixtures';
import {
  createTask,
  createTaskFromTemplate,
  saveAsTemplate,
} from '../helpers/test-helpers';

/**
 * E2E Tests: Template Management
 */

test.describe('Template Management', () => {
  test.beforeEach(async ({ page, cleanState }) => {
    await page.goto('/');
  });

  test.describe('Template Creation', () => {
    test('should create template from scratch', async ({ page }) => {
      // Open templates panel
      await page.getByRole('button', { name: /templates/i }).click();

      // Click create new template
      await page.getByRole('button', { name: /new template/i }).click();

      // Fill template details
      await page.getByLabel(/name/i).fill('Meeting Preparation');
      await page.getByLabel(/category/i).click();
      await page.getByText('Work', { exact: true }).click();

      // Add description
      const descField = page.locator('[contenteditable="true"]').first();
      await descField.click();
      await descField.fill('Prepare for upcoming meeting');

      // Save template
      await page.getByRole('button', { name: /save|create/i }).click();

      // Verify template was created
      await expect(page.getByText('Meeting Preparation')).toBeVisible();
    });

    test('should save task as template', async ({ page }) => {
      const taskTitle = 'Task to Save as Template';
      const templateName = 'Saved Task Template';

      // Create task
      await createTask(page, {
        title: taskTitle,
        description: 'Template description',
        priority: 'High',
      });

      // Save as template
      await saveAsTemplate(page, taskTitle, templateName);

      // Verify template exists
      await page.getByRole('button', { name: /templates/i }).click();
      await expect(page.getByText(templateName)).toBeVisible();
    });

    test('should validate template name is required', async ({ page }) => {
      // Open templates
      await page.getByRole('button', { name: /templates/i }).click();

      // Create new template
      await page.getByRole('button', { name: /new template/i }).click();

      // Try to save without name
      await page.getByRole('button', { name: /save|create/i }).click();

      // Verify validation error
      await expect(page.getByText(/name is required/i)).toBeVisible();
    });
  });

  test.describe('Template Editing', () => {
    test('should edit template name', async ({ page }) => {
      // Create template first
      await page.getByRole('button', { name: /templates/i }).click();
      await page.getByRole('button', { name: /new template/i }).click();

      await page.getByLabel(/name/i).fill('Original Template Name');
      await page.getByRole('button', { name: /save|create/i }).click();

      // Edit template
      const templateCard = page
        .getByText('Original Template Name')
        .first()
        .locator('..');
      await templateCard.getByRole('button', { name: /edit/i }).click();

      await page.getByLabel(/name/i).fill('Updated Template Name');
      await page.getByRole('button', { name: /save/i }).click();

      // Verify updated name
      await expect(page.getByText('Updated Template Name')).toBeVisible();
      await expect(page.getByText('Original Template Name')).not.toBeVisible();
    });

    test('should edit template category', async ({ page }) => {
      // Create template
      await page.getByRole('button', { name: /templates/i }).click();
      await page.getByRole('button', { name: /new template/i }).click();

      await page.getByLabel(/name/i).fill('Category Change Template');
      await page.getByLabel(/category/i).click();
      await page.getByText('Personal', { exact: true }).click();
      await page.getByRole('button', { name: /save|create/i }).click();

      // Edit category
      const templateCard = page
        .getByText('Category Change Template')
        .first()
        .locator('..');
      await templateCard.getByRole('button', { name: /edit/i }).click();

      await page.getByLabel(/category/i).click();
      await page.getByText('Work', { exact: true }).click();
      await page.getByRole('button', { name: /save/i }).click();

      // Verify category changed
      await expect(page.getByText('Work')).toBeVisible();
    });
  });

  test.describe('Template Deletion', () => {
    test('should delete template', async ({ page }) => {
      const templateName = 'Template to Delete';

      // Create template
      await page.getByRole('button', { name: /templates/i }).click();
      await page.getByRole('button', { name: /new template/i }).click();

      await page.getByLabel(/name/i).fill(templateName);
      await page.getByRole('button', { name: /save|create/i }).click();

      // Delete template
      const templateCard = page.getByText(templateName).first().locator('..');
      await templateCard.getByRole('button', { name: /delete/i }).click();

      // Confirm deletion
      await page.getByRole('button', { name: /confirm/i }).click();

      // Verify template is gone
      await expect(page.getByText(templateName)).not.toBeVisible();
    });

    test('should show confirmation before deletion', async ({ page }) => {
      const templateName = 'Template with Confirmation';

      // Create template
      await page.getByRole('button', { name: /templates/i }).click();
      await page.getByRole('button', { name: /new template/i }).click();

      await page.getByLabel(/name/i).fill(templateName);
      await page.getByRole('button', { name: /save|create/i }).click();

      // Try to delete
      const templateCard = page.getByText(templateName).first().locator('..');
      await templateCard.getByRole('button', { name: /delete/i }).click();

      // Verify confirmation dialog
      await expect(
        page.getByText(/are you sure|confirm delete/i)
      ).toBeVisible();

      // Cancel
      await page.getByRole('button', { name: /cancel/i }).click();

      // Verify still exists
      await expect(page.getByText(templateName)).toBeVisible();
    });
  });

  test.describe('Template Usage', () => {
    test('should create task from template', async ({ page }) => {
      const templateName = 'Usable Template';

      // Create template
      await page.getByRole('button', { name: /templates/i }).click();
      await page.getByRole('button', { name: /new template/i }).click();

      await page.getByLabel(/name/i).fill(templateName);

      const descField = page.locator('[contenteditable="true"]').first();
      await descField.click();
      await descField.fill('Template description');

      await page.getByRole('button', { name: /save|create/i }).click();

      // Use template
      await createTaskFromTemplate(page, templateName);

      // Verify task was created with template content
      await expect(page.getByText(templateName)).toBeVisible();
      await page.getByText(templateName).click();
      await expect(page.getByText('Template description')).toBeVisible();
    });

    test('should preserve template properties when creating task', async ({
      page,
    }) => {
      const templateName = 'Full Property Template';

      // Create comprehensive template
      await page.getByRole('button', { name: /templates/i }).click();
      await page.getByRole('button', { name: /new template/i }).click();

      await page.getByLabel(/name/i).fill(templateName);

      // Set priority
      await page.getByRole('radio', { name: /high/i }).click();

      // Add description
      const descField = page.locator('[contenteditable="true"]').first();
      await descField.click();
      await descField.fill('High priority template');

      await page.getByRole('button', { name: /save|create/i }).click();

      // Use template
      const templateCard = page.getByText(templateName).first();
      await templateCard.click();
      await page.getByRole('button', { name: /use template/i }).click();

      // Verify created task has all properties
      await page.getByText(templateName).click();
      await expect(page.getByText(/high/i)).toBeVisible();
      await expect(page.getByText('High priority template')).toBeVisible();
    });
  });

  test.describe('Template Favorites', () => {
    test('should mark template as favorite', async ({ page }) => {
      const templateName = 'Favorite Template';

      // Create template
      await page.getByRole('button', { name: /templates/i }).click();
      await page.getByRole('button', { name: /new template/i }).click();

      await page.getByLabel(/name/i).fill(templateName);
      await page.getByRole('button', { name: /save|create/i }).click();

      // Mark as favorite
      const templateCard = page.getByText(templateName).first().locator('..');
      const favoriteButton = templateCard.getByRole('button', {
        name: /favorite|star/i,
      });
      await favoriteButton.click();

      // Verify favorite indicator
      await expect(favoriteButton).toHaveAttribute('data-favorite', 'true');
    });

    test('should filter favorite templates', async ({ page }) => {
      // Create favorite and non-favorite templates
      await page.getByRole('button', { name: /templates/i }).click();

      // Template 1 - Favorite
      await page.getByRole('button', { name: /new template/i }).click();
      await page.getByLabel(/name/i).fill('Favorite Template');
      await page.getByRole('button', { name: /save|create/i }).click();

      const template1 = page.getByText('Favorite Template').first().locator('..');
      await template1.getByRole('button', { name: /favorite|star/i }).click();

      // Template 2 - Not favorite
      await page.getByRole('button', { name: /new template/i }).click();
      await page.getByLabel(/name/i).fill('Regular Template');
      await page.getByRole('button', { name: /save|create/i }).click();

      // Filter favorites
      await page.getByRole('button', { name: /favorites only/i }).click();

      // Verify only favorite is shown
      await expect(page.getByText('Favorite Template')).toBeVisible();
      await expect(page.getByText('Regular Template')).not.toBeVisible();
    });

    test('should unmark template from favorites', async ({ page }) => {
      const templateName = 'Unfavorite Template';

      // Create and mark as favorite
      await page.getByRole('button', { name: /templates/i }).click();
      await page.getByRole('button', { name: /new template/i }).click();

      await page.getByLabel(/name/i).fill(templateName);
      await page.getByRole('button', { name: /save|create/i }).click();

      const templateCard = page.getByText(templateName).first().locator('..');
      const favoriteButton = templateCard.getByRole('button', {
        name: /favorite|star/i,
      });

      // Mark as favorite
      await favoriteButton.click();

      // Unmark
      await favoriteButton.click();

      // Verify no longer favorite
      await expect(favoriteButton).toHaveAttribute('data-favorite', 'false');
    });
  });

  test.describe('Template Categories', () => {
    test('should filter templates by category', async ({ page }) => {
      // Create templates in different categories
      await page.getByRole('button', { name: /templates/i }).click();

      // Work template
      await page.getByRole('button', { name: /new template/i }).click();
      await page.getByLabel(/name/i).fill('Work Template');
      await page.getByLabel(/category/i).click();
      await page.getByText('Work', { exact: true }).click();
      await page.getByRole('button', { name: /save|create/i }).click();

      // Personal template
      await page.getByRole('button', { name: /new template/i }).click();
      await page.getByLabel(/name/i).fill('Personal Template');
      await page.getByLabel(/category/i).click();
      await page.getByText('Personal', { exact: true }).click();
      await page.getByRole('button', { name: /save|create/i }).click();

      // Filter by Work
      await page.getByRole('button', { name: /category/i }).click();
      await page.getByText('Work', { exact: true }).click();

      // Verify only work template is shown
      await expect(page.getByText('Work Template')).toBeVisible();
      await expect(page.getByText('Personal Template')).not.toBeVisible();
    });
  });
});
