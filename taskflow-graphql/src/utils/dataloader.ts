/**
 * DataLoader for TaskFlow GraphQL
 * Prevents N+1 query problem with batching and caching
 */

import DataLoader from 'dataloader';
import {
  getTask,
  getBoard,
  getLabel,
  getTemplate,
  TaskRecord,
  BoardRecord,
  LabelRecord,
  TemplateRecord,
} from './indexeddb.js';

/**
 * Create Task DataLoader
 */
export function createTaskLoader(): DataLoader<string, TaskRecord | null> {
  return new DataLoader<string, TaskRecord | null>(async ids => {
    const tasks = await Promise.all(ids.map(id => getTask(id)));
    return tasks;
  });
}

/**
 * Create Board DataLoader
 */
export function createBoardLoader(): DataLoader<string, BoardRecord | null> {
  return new DataLoader<string, BoardRecord | null>(async ids => {
    const boards = await Promise.all(ids.map(id => getBoard(id)));
    return boards;
  });
}

/**
 * Create Label DataLoader
 */
export function createLabelLoader(): DataLoader<string, LabelRecord | null> {
  return new DataLoader<string, LabelRecord | null>(async ids => {
    const labels = await Promise.all(ids.map(id => getLabel(id)));
    return labels;
  });
}

/**
 * Create Template DataLoader
 */
export function createTemplateLoader(): DataLoader<
  string,
  TemplateRecord | null
> {
  return new DataLoader<string, TemplateRecord | null>(async ids => {
    const templates = await Promise.all(ids.map(id => getTemplate(id)));
    return templates;
  });
}

/**
 * Create all DataLoaders for GraphQL context
 */
export function createDataLoaders() {
  return {
    taskLoader: createTaskLoader(),
    boardLoader: createBoardLoader(),
    labelLoader: createLabelLoader(),
    templateLoader: createTemplateLoader(),
  };
}

export type DataLoaders = ReturnType<typeof createDataLoaders>;
