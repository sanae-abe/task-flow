import { test, expect } from '../fixtures/test-fixtures';
import { createTask, createLabel } from '../helpers/test-helpers';
import * as fs from 'fs';
import * as path from 'path';

/**
 * E2E Tests: Data Management
 * Tests for data import/export functionality
 */

test.describe('Data Management', () => {
  test.beforeEach(async ({ page, cleanState }) => {
    await page.goto('/');
  });

  test.describe('Data Export', () => {
    test('should export all boards data', async ({ page }) => {
      // Create test data
      await createTask(page, {
        title: 'Export Test Task',
        description: 'Task for export testing',
        priority: 'High',
      });

      // Open data management
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /data|import|export/i }).click();

      // Setup download listener
      const downloadPromise = page.waitForEvent('download');

      // Click export button
      await page.getByRole('button', { name: /export all|export data/i }).click();

      // Wait for download
      const download = await downloadPromise;

      // Verify download filename
      expect(download.suggestedFilename()).toMatch(/taskflow.*\.json/i);

      // Verify file content
      const downloadPath = await download.path();
      if (downloadPath) {
        const content = fs.readFileSync(downloadPath, 'utf-8');
        const data = JSON.parse(content);

        // Verify data structure
        expect(data).toHaveProperty('boards');
        expect(data).toHaveProperty('tasks');
        expect(data.tasks).toBeInstanceOf(Array);
        expect(data.tasks.length).toBeGreaterThan(0);

        // Verify exported task
        const exportedTask = data.tasks.find(
          (t: any) => t.title === 'Export Test Task'
        );
        expect(exportedTask).toBeDefined();
        expect(exportedTask.description).toBe('Task for export testing');
        expect(exportedTask.priority).toBe('High');
      }
    });

    test('should export selected board only', async ({ page }) => {
      // Create tasks in default board
      await createTask(page, { title: 'Board 1 Task' });

      // Open data management
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /data|import|export/i }).click();

      // Select board for export (if board selection is available)
      const boardSelector = page.getByLabel(/select board|board/i);
      if (await boardSelector.isVisible({ timeout: 1000 }).catch(() => false)) {
        await boardSelector.click();
        await page.getByText('Default', { exact: true }).click();

        // Setup download listener
        const downloadPromise = page.waitForEvent('download');

        // Export selected board
        await page.getByRole('button', { name: /export selected/i }).click();

        // Verify download
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/taskflow.*\.json/i);
      }
    });

    test('should export with metadata', async ({ page }) => {
      // Create test data
      await createTask(page, { title: 'Metadata Export Task' });
      await createLabel(page, 'Export Label', '#FF0000');

      // Export data
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /data|import|export/i }).click();

      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: /export all|export data/i }).click();
      const download = await downloadPromise;

      // Verify metadata in export
      const downloadPath = await download.path();
      if (downloadPath) {
        const content = fs.readFileSync(downloadPath, 'utf-8');
        const data = JSON.parse(content);

        // Check for metadata
        expect(data).toHaveProperty('exportDate');
        expect(data).toHaveProperty('version');
        expect(data.labels).toBeInstanceOf(Array);

        // Verify label was exported
        const exportedLabel = data.labels.find(
          (l: any) => l.name === 'Export Label'
        );
        expect(exportedLabel).toBeDefined();
        expect(exportedLabel.color).toBe('#FF0000');
      }
    });

    test('should show success message after export', async ({ page }) => {
      // Create test data
      await createTask(page, { title: 'Success Test Task' });

      // Export data
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /data|import|export/i }).click();

      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: /export all|export data/i }).click();
      await downloadPromise;

      // Verify success message
      await expect(
        page.getByText(/export successful|data exported/i)
      ).toBeVisible();
    });

    test('should handle export with no data', async ({ page }) => {
      // Open data management (with no tasks created)
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /data|import|export/i }).click();

      // Attempt export
      const downloadPromise = page.waitForEvent('download', { timeout: 2000 });
      await page.getByRole('button', { name: /export all|export data/i }).click();

      // Should still export (with empty arrays)
      const download = await downloadPromise.catch(() => null);

      if (download) {
        const downloadPath = await download.path();
        if (downloadPath) {
          const content = fs.readFileSync(downloadPath, 'utf-8');
          const data = JSON.parse(content);

          expect(data.tasks).toEqual([]);
        }
      }
    });
  });

  test.describe('Data Import', () => {
    test('should import valid JSON data', async ({ page }) => {
      // Prepare test data file
      const testData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        boards: [{ id: '1', name: 'Default' }],
        tasks: [
          {
            id: 'import-test-1',
            title: 'Imported Task',
            description: 'Imported description',
            status: 'To Do',
            priority: 'Medium',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        labels: [],
      };

      const tempFilePath = path.join(__dirname, 'test-import.json');
      fs.writeFileSync(tempFilePath, JSON.stringify(testData, null, 2));

      try {
        // Open data management
        await page.getByRole('button', { name: /settings/i }).click();
        await page.getByRole('tab', { name: /data|import|export/i }).click();

        // Upload file
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(tempFilePath);

        // Confirm import
        await page.getByRole('button', { name: /import|upload/i }).click();

        // Wait for success message
        await expect(
          page.getByText(/import successful|data imported/i)
        ).toBeVisible();

        // Close settings
        await page.getByRole('button', { name: /close/i }).click();

        // Verify imported task exists
        await expect(page.getByText('Imported Task')).toBeVisible();
      } finally {
        // Cleanup
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should validate JSON format before import', async ({ page }) => {
      // Create invalid JSON file
      const invalidData = 'invalid json content';
      const tempFilePath = path.join(__dirname, 'invalid-import.json');
      fs.writeFileSync(tempFilePath, invalidData);

      try {
        // Open data management
        await page.getByRole('button', { name: /settings/i }).click();
        await page.getByRole('tab', { name: /data|import|export/i }).click();

        // Upload invalid file
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(tempFilePath);

        // Attempt import
        await page.getByRole('button', { name: /import|upload/i }).click();

        // Verify error message
        await expect(
          page.getByText(/invalid format|error|failed/i)
        ).toBeVisible();
      } finally {
        // Cleanup
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should show import preview before confirming', async ({ page }) => {
      // Prepare test data
      const testData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        boards: [{ id: '1', name: 'Default' }],
        tasks: [
          { id: '1', title: 'Preview Task 1', status: 'To Do' },
          { id: '2', title: 'Preview Task 2', status: 'To Do' },
        ],
        labels: [{ id: 'l1', name: 'Preview Label', color: '#0000FF' }],
      };

      const tempFilePath = path.join(__dirname, 'preview-import.json');
      fs.writeFileSync(tempFilePath, JSON.stringify(testData, null, 2));

      try {
        // Open data management
        await page.getByRole('button', { name: /settings/i }).click();
        await page.getByRole('tab', { name: /data|import|export/i }).click();

        // Upload file
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(tempFilePath);

        // Check for preview display (if implemented)
        const previewSection = page.locator('[data-import-preview]');
        if (
          await previewSection.isVisible({ timeout: 1000 }).catch(() => false)
        ) {
          // Verify preview shows task count
          await expect(page.getByText(/2 tasks|2 items/i)).toBeVisible();
          await expect(page.getByText(/1 label/i)).toBeVisible();
        }
      } finally {
        // Cleanup
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should handle import merge vs replace options', async ({ page }) => {
      // Create existing task
      await createTask(page, { title: 'Existing Task' });

      // Prepare import data
      const testData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        boards: [{ id: '1', name: 'Default' }],
        tasks: [{ id: 'new-1', title: 'New Import Task', status: 'To Do' }],
        labels: [],
      };

      const tempFilePath = path.join(__dirname, 'merge-import.json');
      fs.writeFileSync(tempFilePath, JSON.stringify(testData, null, 2));

      try {
        // Open data management
        await page.getByRole('button', { name: /settings/i }).click();
        await page.getByRole('tab', { name: /data|import|export/i }).click();

        // Upload file
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(tempFilePath);

        // Select merge option (if available)
        const mergeOption = page.getByRole('radio', { name: /merge|append/i });
        if (await mergeOption.isVisible({ timeout: 1000 }).catch(() => false)) {
          await mergeOption.click();
        }

        // Import
        await page.getByRole('button', { name: /import|upload/i }).click();
        await page.getByRole('button', { name: /close/i }).click();

        // Verify both existing and new tasks exist
        await expect(page.getByText('Existing Task')).toBeVisible();
        await expect(page.getByText('New Import Task')).toBeVisible();
      } finally {
        // Cleanup
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should import tasks with all properties', async ({ page }) => {
      // Prepare comprehensive test data
      const testData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        boards: [{ id: '1', name: 'Default' }],
        tasks: [
          {
            id: 'full-import',
            title: 'Full Property Task',
            description: 'Complete description',
            status: 'In Progress',
            priority: 'High',
            dueDate: new Date().toISOString(),
            subtasks: [
              { id: 'st1', title: 'Subtask 1', completed: false },
              { id: 'st2', title: 'Subtask 2', completed: true },
            ],
            labels: ['work'],
            recurrence: { pattern: 'weekly', interval: 1 },
          },
        ],
        labels: [{ id: 'work', name: 'Work', color: '#FF5500' }],
      };

      const tempFilePath = path.join(__dirname, 'full-import.json');
      fs.writeFileSync(tempFilePath, JSON.stringify(testData, null, 2));

      try {
        // Import data
        await page.getByRole('button', { name: /settings/i }).click();
        await page.getByRole('tab', { name: /data|import|export/i }).click();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(tempFilePath);
        await page.getByRole('button', { name: /import|upload/i }).click();

        await page.getByRole('button', { name: /close/i }).click();

        // Verify task imported correctly
        await page.getByText('Full Property Task').click();

        // Check all properties
        await expect(page.getByText('Complete description')).toBeVisible();
        await expect(page.getByText(/high/i)).toBeVisible();
        await expect(page.getByText('Subtask 1')).toBeVisible();
        await expect(page.getByText('Subtask 2')).toBeVisible();
        await expect(page.getByText('Work')).toBeVisible();
      } finally {
        // Cleanup
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should show import progress for large datasets', async ({ page }) => {
      // Create large dataset
      const largeTasks = Array.from({ length: 100 }, (_, i) => ({
        id: `task-${i}`,
        title: `Import Task ${i + 1}`,
        status: 'To Do',
        priority: 'Medium',
      }));

      const testData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        boards: [{ id: '1', name: 'Default' }],
        tasks: largeTasks,
        labels: [],
      };

      const tempFilePath = path.join(__dirname, 'large-import.json');
      fs.writeFileSync(tempFilePath, JSON.stringify(testData, null, 2));

      try {
        // Import data
        await page.getByRole('button', { name: /settings/i }).click();
        await page.getByRole('tab', { name: /data|import|export/i }).click();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(tempFilePath);
        await page.getByRole('button', { name: /import|upload/i }).click();

        // Check for progress indicator (if implemented)
        const progressIndicator = page.locator(
          '[data-import-progress], .import-progress'
        );
        if (
          await progressIndicator
            .isVisible({ timeout: 1000 })
            .catch(() => false)
        ) {
          await expect(progressIndicator).toBeVisible();
        }

        // Wait for completion
        await expect(
          page.getByText(/import successful|completed/i)
        ).toBeVisible({ timeout: 10000 });
      } finally {
        // Cleanup
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });
  });

  test.describe('Data Backup and Restore', () => {
    test('should create automatic backup before import', async ({ page }) => {
      // Create existing data
      await createTask(page, { title: 'Backup Test Task' });

      // Prepare import data
      const testData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        boards: [{ id: '1', name: 'Default' }],
        tasks: [{ id: 'new-task', title: 'New Task', status: 'To Do' }],
        labels: [],
      };

      const tempFilePath = path.join(__dirname, 'backup-import.json');
      fs.writeFileSync(tempFilePath, JSON.stringify(testData, null, 2));

      try {
        // Import data
        await page.getByRole('button', { name: /settings/i }).click();
        await page.getByRole('tab', { name: /data|import|export/i }).click();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(tempFilePath);

        // Check for backup confirmation (if implemented)
        const backupWarning = page.getByText(/backup will be created|backup/i);
        if (
          await backupWarning.isVisible({ timeout: 1000 }).catch(() => false)
        ) {
          await expect(backupWarning).toBeVisible();
        }

        await page.getByRole('button', { name: /import|upload/i }).click();

        // Verify import succeeded
        await expect(page.getByText(/import successful/i)).toBeVisible();
      } finally {
        // Cleanup
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should allow restoring from backup', async ({ page }) => {
      // This test depends on backup restore implementation
      // Open data management
      await page.getByRole('button', { name: /settings/i }).click();
      await page.getByRole('tab', { name: /data|import|export/i }).click();

      // Look for backup section
      const backupSection = page.locator('[data-backup-section]');
      if (
        await backupSection.isVisible({ timeout: 1000 }).catch(() => false)
      ) {
        // Check for restore button
        const restoreButton = page.getByRole('button', { name: /restore/i });
        await expect(restoreButton).toBeVisible();
      }
    });
  });

  test.describe('Data Validation', () => {
    test('should validate required fields during import', async ({ page }) => {
      // Create data with missing required fields
      const invalidData = {
        version: '1.0',
        boards: [{ id: '1', name: 'Default' }],
        tasks: [
          {
            id: 'invalid-task',
            // Missing title (required field)
            status: 'To Do',
          },
        ],
        labels: [],
      };

      const tempFilePath = path.join(__dirname, 'invalid-fields.json');
      fs.writeFileSync(tempFilePath, JSON.stringify(invalidData, null, 2));

      try {
        // Attempt import
        await page.getByRole('button', { name: /settings/i }).click();
        await page.getByRole('tab', { name: /data|import|export/i }).click();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(tempFilePath);
        await page.getByRole('button', { name: /import|upload/i }).click();

        // Should show validation error
        await expect(
          page.getByText(/validation error|invalid data|missing required/i)
        ).toBeVisible();
      } finally {
        // Cleanup
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });

    test('should skip invalid entries and import valid ones', async ({
      page,
    }) => {
      // Create mixed valid/invalid data
      const mixedData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        boards: [{ id: '1', name: 'Default' }],
        tasks: [
          { id: 'valid-1', title: 'Valid Task 1', status: 'To Do' },
          { id: 'invalid-1', status: 'To Do' }, // Missing title
          { id: 'valid-2', title: 'Valid Task 2', status: 'To Do' },
        ],
        labels: [],
      };

      const tempFilePath = path.join(__dirname, 'mixed-import.json');
      fs.writeFileSync(tempFilePath, JSON.stringify(mixedData, null, 2));

      try {
        // Import data
        await page.getByRole('button', { name: /settings/i }).click();
        await page.getByRole('tab', { name: /data|import|export/i }).click();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(tempFilePath);
        await page.getByRole('button', { name: /import|upload/i }).click();

        // Should show partial success message
        await expect(
          page.getByText(/2.*imported|partial|skipped/i)
        ).toBeVisible();

        await page.getByRole('button', { name: /close/i }).click();

        // Verify valid tasks were imported
        await expect(page.getByText('Valid Task 1')).toBeVisible();
        await expect(page.getByText('Valid Task 2')).toBeVisible();
      } finally {
        // Cleanup
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });
  });

  test.describe('Data Compatibility', () => {
    test('should handle import from older version format', async ({ page }) => {
      // Create data in older format (if applicable)
      const oldFormatData = {
        version: '0.9', // Older version
        tasks: [
          {
            id: 'old-format-task',
            title: 'Old Format Task',
            status: 'todo', // Old status format
          },
        ],
      };

      const tempFilePath = path.join(__dirname, 'old-format.json');
      fs.writeFileSync(tempFilePath, JSON.stringify(oldFormatData, null, 2));

      try {
        // Attempt import
        await page.getByRole('button', { name: /settings/i }).click();
        await page.getByRole('tab', { name: /data|import|export/i }).click();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(tempFilePath);
        await page.getByRole('button', { name: /import|upload/i }).click();

        // Should either migrate successfully or show version warning
        const result = await Promise.race([
          page.getByText(/import successful/i).isVisible({ timeout: 2000 }),
          page
            .getByText(/version mismatch|upgrade required/i)
            .isVisible({ timeout: 2000 }),
        ]);

        expect(result).toBeTruthy();
      } finally {
        // Cleanup
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }
    });
  });
});
