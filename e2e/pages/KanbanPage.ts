import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Kanban Board Page Object Model
 * Handles Kanban view interactions
 */
export class KanbanPage extends BasePage {
  // View navigation
  readonly kanbanViewButton: Locator;

  // Columns
  readonly todoColumn: Locator;
  readonly inProgressColumn: Locator;
  readonly doneColumn: Locator;

  // Actions
  readonly addTaskButton: Locator;
  readonly filterButton: Locator;
  readonly sortButton: Locator;

  constructor(page: Page) {
    super(page);
    this.kanbanViewButton = page.getByRole('button', { name: /kanban/i });
    this.addTaskButton = page.getByRole('button', { name: /add task/i });
    this.filterButton = page.getByRole('button', { name: /filter/i });
    this.sortButton = page.getByRole('button', { name: /sort/i });

    // Columns - adjust selectors based on actual implementation
    this.todoColumn = page.locator('[data-column="todo"]');
    this.inProgressColumn = page.locator('[data-column="in-progress"]');
    this.doneColumn = page.locator('[data-column="done"]');
  }

  /**
   * Navigate to Kanban view
   */
  async navigateToKanban(): Promise<void> {
    await this.kanbanViewButton.click();
    await this.waitForLoad();
  }

  /**
   * Get column by status
   */
  getColumn(status: 'todo' | 'in-progress' | 'done'): Locator {
    switch (status) {
      case 'todo':
        return this.todoColumn;
      case 'in-progress':
        return this.inProgressColumn;
      case 'done':
        return this.doneColumn;
    }
  }

  /**
   * Get task card by title
   */
  getTaskCard(title: string): Locator {
    return this.page.getByText(title).first();
  }

  /**
   * Get all tasks in a column
   */
  async getTasksInColumn(status: 'todo' | 'in-progress' | 'done'): Promise<string[]> {
    const column = this.getColumn(status);
    const taskCards = column.locator('[data-task-card]');
    return await taskCards.allTextContents();
  }

  /**
   * Drag task to column
   */
  async dragTaskToColumn(
    taskTitle: string,
    targetStatus: 'todo' | 'in-progress' | 'done'
  ): Promise<void> {
    const task = this.getTaskCard(taskTitle);
    const targetColumn = this.getColumn(targetStatus);

    await task.dragTo(targetColumn);
    await this.waitForLoad();
  }

  /**
   * Apply priority filter
   */
  async filterByPriority(priority: 'Critical' | 'High' | 'Medium' | 'Low'): Promise<void> {
    await this.filterButton.click();
    await this.page.getByRole('checkbox', { name: priority }).check();
    await this.waitForLoad();
  }

  /**
   * Apply label filter
   */
  async filterByLabel(label: string): Promise<void> {
    await this.filterButton.click();
    await this.page.getByRole('checkbox', { name: label }).check();
    await this.waitForLoad();
  }

  /**
   * Clear filters
   */
  async clearFilters(): Promise<void> {
    await this.filterButton.click();
    await this.page.getByRole('button', { name: /clear/i }).click();
    await this.waitForLoad();
  }

  /**
   * Sort by criteria
   */
  async sortBy(criteria: 'dueDate' | 'priority' | 'createdAt'): Promise<void> {
    await this.sortButton.click();
    await this.page.getByRole('option', { name: new RegExp(criteria, 'i') }).click();
    await this.waitForLoad();
  }

  /**
   * Get column task count
   */
  async getColumnTaskCount(status: 'todo' | 'in-progress' | 'done'): Promise<number> {
    const column = this.getColumn(status);
    const taskCards = column.locator('[data-task-card]');
    return await taskCards.count();
  }

  /**
   * Open task detail
   */
  async openTaskDetail(taskTitle: string): Promise<void> {
    await this.getTaskCard(taskTitle).click();
    await this.page.waitForSelector('[role="dialog"]');
  }
}
