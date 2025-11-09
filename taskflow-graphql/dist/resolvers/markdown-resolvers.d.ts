/**
 * Markdown Export Resolvers for TaskFlow GraphQL
 * Handles all Markdown generation queries and mutations
 */
import type { QueryResolvers, MutationResolvers } from '../generated/graphql.js';
export declare const markdownQueries: Pick<QueryResolvers, 'exportBoardAsMarkdown' | 'exportTaskAsMarkdown' | 'exportTasksAsMarkdown'>;
export declare const markdownMutations: Pick<MutationResolvers, 'generateMarkdownReport'>;
declare const _default: {
    Query: Pick<QueryResolvers, "exportBoardAsMarkdown" | "exportTaskAsMarkdown" | "exportTasksAsMarkdown">;
    Mutation: Pick<MutationResolvers, "generateMarkdownReport">;
};
export default _default;
//# sourceMappingURL=markdown-resolvers.d.ts.map