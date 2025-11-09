/**
 * GraphQL Context Type Definition
 * Provides type-safe context for all resolvers
 */
import type { DataLoaders } from './utils/dataloader.js';
/**
 * GraphQL Context
 * Available to all resolvers via the context parameter
 */
export interface GraphQLContext {
    /**
     * HTTP request headers
     */
    headers: Record<string, string | string[] | undefined>;
    /**
     * DataLoaders for efficient batch loading
     */
    loaders: DataLoaders;
}
//# sourceMappingURL=context.d.ts.map