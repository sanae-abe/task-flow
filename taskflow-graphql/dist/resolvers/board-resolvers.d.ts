/**
 * Board Resolvers for TaskFlow GraphQL
 * Handles all Board-related queries and mutations
 */
import type { QueryResolvers, MutationResolvers, BoardResolvers, SubscriptionResolvers } from '../generated/graphql.js';
export declare const boardQueries: Pick<QueryResolvers, 'board' | 'boards' | 'currentBoard'>;
export declare const boardMutations: Pick<MutationResolvers, 'createBoard' | 'updateBoard' | 'deleteBoard'>;
export declare const boardFieldResolvers: BoardResolvers;
export declare const boardSubscriptions: Pick<SubscriptionResolvers, 'boardUpdated'>;
//# sourceMappingURL=board-resolvers.d.ts.map