/**
 * Webhook Resolvers for TaskFlow GraphQL
 * Handles all Webhook-related queries and mutations
 */
import type { QueryResolvers, MutationResolvers } from '../generated/graphql.js';
export declare const webhookQueries: Pick<QueryResolvers, 'webhook' | 'webhooks' | 'webhookDelivery' | 'webhookDeliveries' | 'webhookStats'>;
export declare const webhookMutations: Pick<MutationResolvers, 'createWebhook' | 'updateWebhook' | 'deleteWebhook' | 'testWebhook'>;
//# sourceMappingURL=webhook-resolvers.d.ts.map