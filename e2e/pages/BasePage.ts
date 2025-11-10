import { Page, Locator } from '@playwright/test';

/**
 * Base Page Object Model
 * Contains common methods for all pages
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to home page
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for loading state
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get toast notification
   */
  getToast(message: string): Locator {
    return this.page.locator('[role="status"]').filter({ hasText: message });
  }

  /**
   * Get dialog
   */
  getDialog(): Locator {
    return this.page.locator('[role="dialog"]');
  }

  /**
   * Wait for dialog to close
   */
  async waitForDialogClose(): Promise<void> {
    await this.page.locator('[role="dialog"]').waitFor({ state: 'hidden' });
  }

  /**
   * Click button by name
   */
  async clickButton(name: string | RegExp): Promise<void> {
    await this.page.getByRole('button', { name }).click();
  }

  /**
   * Fill input field
   */
  async fillInput(label: string | RegExp, value: string): Promise<void> {
    await this.page.getByLabel(label).fill(value);
  }

  /**
   * Take screenshot
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }
}
