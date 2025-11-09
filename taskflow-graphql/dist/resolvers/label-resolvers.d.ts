/**
 * Label Resolvers for TaskFlow GraphQL
 * Handles all Label-related queries and mutations
 */
import type { QueryResolvers, MutationResolvers, LabelResolvers } from '../generated/graphql.js';
export declare const labelQueries: Pick<QueryResolvers, 'label' | 'labels'>;
export declare const labelMutations: Pick<MutationResolvers, 'createLabel' | 'updateLabel' | 'deleteLabel'>;
export declare const labelFieldResolvers: LabelResolvers;
//# sourceMappingURL=label-resolvers.d.ts.map