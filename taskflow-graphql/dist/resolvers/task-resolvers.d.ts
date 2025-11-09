/**
 * Task Resolvers for TaskFlow GraphQL
 * Handles all Task-related queries and mutations
 */
import type { QueryResolvers, MutationResolvers, TaskResolvers, SubscriptionResolvers } from '../generated/graphql.js';
export declare const taskQueries: Pick<QueryResolvers, 'task' | 'tasks' | 'taskStatistics' | 'aiSuggestedTasks' | 'nextRecommendedTask' | 'searchTasksByNaturalLanguage'>;
export declare const taskMutations: Pick<MutationResolvers, 'createTask' | 'updateTask' | 'deleteTask' | 'restoreTask' | 'moveTask' | 'duplicateTask' | 'createTasks' | 'updateTasks' | 'deleteTasks' | 'createTaskFromNaturalLanguage' | 'breakdownTask' | 'optimizeTaskSchedule'>;
export declare const taskFieldResolvers: TaskResolvers;
export declare const taskSubscriptions: Pick<SubscriptionResolvers, 'taskCreated' | 'taskUpdated' | 'taskCompleted' | 'taskDeleted'>;
//# sourceMappingURL=task-resolvers.d.ts.map