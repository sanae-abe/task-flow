/**
 * DataLoader for TaskFlow GraphQL
 * Prevents N+1 query problem with batching and caching
 */
import DataLoader from 'dataloader';
import { TaskRecord, BoardRecord, LabelRecord, TemplateRecord } from './indexeddb.js';
/**
 * Create Task DataLoader
 */
export declare function createTaskLoader(): DataLoader<string, TaskRecord | null>;
/**
 * Create Board DataLoader
 */
export declare function createBoardLoader(): DataLoader<string, BoardRecord | null>;
/**
 * Create Label DataLoader
 */
export declare function createLabelLoader(): DataLoader<string, LabelRecord | null>;
/**
 * Create Template DataLoader
 */
export declare function createTemplateLoader(): DataLoader<string, TemplateRecord | null>;
/**
 * Create all DataLoaders for GraphQL context
 */
export declare function createDataLoaders(): {
    taskLoader: DataLoader<string, TaskRecord | null, string>;
    boardLoader: DataLoader<string, BoardRecord | null, string>;
    labelLoader: DataLoader<string, LabelRecord | null, string>;
    templateLoader: DataLoader<string, TemplateRecord | null, string>;
};
export type DataLoaders = ReturnType<typeof createDataLoaders>;
//# sourceMappingURL=dataloader.d.ts.map