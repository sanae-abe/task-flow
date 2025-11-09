/**
 * DataLoader for TaskFlow GraphQL
 * Prevents N+1 query problem with batching and caching
 */
import DataLoader from 'dataloader';
import { getTask, getBoard, getLabel, getTemplate, } from './indexeddb.js';
/**
 * Create Task DataLoader
 */
export function createTaskLoader() {
    return new DataLoader(async (ids) => {
        const tasks = await Promise.all(ids.map(id => getTask(id)));
        return tasks;
    });
}
/**
 * Create Board DataLoader
 */
export function createBoardLoader() {
    return new DataLoader(async (ids) => {
        const boards = await Promise.all(ids.map(id => getBoard(id)));
        return boards;
    });
}
/**
 * Create Label DataLoader
 */
export function createLabelLoader() {
    return new DataLoader(async (ids) => {
        const labels = await Promise.all(ids.map(id => getLabel(id)));
        return labels;
    });
}
/**
 * Create Template DataLoader
 */
export function createTemplateLoader() {
    return new DataLoader(async (ids) => {
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
//# sourceMappingURL=dataloader.js.map