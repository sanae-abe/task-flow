/**
 * Template Resolvers for TaskFlow GraphQL
 * Handles all Template-related queries and mutations
 */
import type { QueryResolvers, MutationResolvers, TemplateResolvers } from '../generated/graphql.js';
export declare const templateQueries: Pick<QueryResolvers, 'template' | 'templates'>;
export declare const templateMutations: Pick<MutationResolvers, 'createTemplate' | 'updateTemplate' | 'deleteTemplate'>;
export declare const templateFieldResolvers: TemplateResolvers;
//# sourceMappingURL=template-resolvers.d.ts.map