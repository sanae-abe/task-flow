/**
 * Task Resolvers for TaskFlow GraphQL
 * Handles all Task-related queries and mutations
 */

import { GraphQLError } from 'graphql';
import type {
  QueryResolvers,
  MutationResolvers,
  TaskResolvers,
  SubscriptionResolvers,
} from '../generated/graphql.js';
import {
  getTask,
  getAllTasks,
  getTasksByBoard,
  createTask as createTaskDB,
  updateTask as updateTaskDB,
  createTasks as createTasksDB,
  TaskRecord,
  SubTaskRecord,
  AttachmentRecord,
  RecurrenceConfigRecord,
} from '../utils/indexeddb.js';
import {
  publishEvent,
  SUBSCRIPTION_TOPICS,
  subscribe,
} from '../utils/pubsub.js';
import {
  triggerTaskCreated,
  triggerTaskUpdated,
  triggerTaskCompleted,
  triggerTaskDeleted,
} from '../utils/webhook-events.js';
import {
  breakdownTaskWithAI,
  validateBreakdown,
} from '../utils/ai-task-breakdown.js';
import {
  parseNaturalLanguageToTask,
  convertToCreateTaskInput,
} from '../utils/ai-natural-language.js';
import { optimizeScheduleWithAI } from '../utils/ai-schedule-optimizer.js';
import { getRecommendedTaskWithAI } from '../utils/ai-recommendations.js';
import {
  buildUserContext,
  validateAIResponse,
  safeAIOperation,
} from '../utils/ai-helpers.js';

// ============================================================================
// Query Resolvers
// ============================================================================

export const taskQueries: Pick<
  QueryResolvers,
  | 'task'
  | 'tasks'
  | 'taskStatistics'
  | 'aiSuggestedTasks'
  | 'nextRecommendedTask'
  | 'searchTasksByNaturalLanguage'
> = {
  /**
   * Get single task by ID
   */
  task: async (_parent, { id }, _context) => await getTask(id),

  /**
   * Get tasks with advanced filtering
   */
  tasks: async (_parent, args) => {
    let tasks: TaskRecord[] = [];

    // Get tasks by board or all tasks
    if (args.boardId) {
      tasks = await getTasksByBoard(args.boardId);
    } else {
      tasks = await getAllTasks();
    }

    // Filter by status
    if (args.status) {
      tasks = tasks.filter(task => task.status === args.status);
    }

    // Filter by priority
    if (args.priority) {
      tasks = tasks.filter(task => task.priority === args.priority);
    }

    // Filter by labels
    if (args.labels && args.labels.length > 0) {
      tasks = tasks.filter(task =>
        args.labels!.some(labelId => task.labels.includes(labelId))
      );
    }

    // Filter by due date range
    if (args.dueBefore) {
      tasks = tasks.filter(
        task =>
          task.dueDate && new Date(task.dueDate) <= new Date(args.dueBefore!)
      );
    }

    if (args.dueAfter) {
      tasks = tasks.filter(
        task =>
          task.dueDate && new Date(task.dueDate) >= new Date(args.dueAfter!)
      );
    }

    // Filter by search query
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      tasks = tasks.filter(
        task =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || tasks.length;
    tasks = tasks.slice(offset, offset + limit);

    return tasks;
  },

  /**
   * Get task statistics
   */
  taskStatistics: async (_parent, { boardId }) => {
    let tasks: TaskRecord[] = [];

    if (boardId) {
      tasks = await getTasksByBoard(boardId);
    } else {
      tasks = await getAllTasks();
    }

    const total = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
    const now = new Date();

    // Count by status
    const byStatus = {
      todo: tasks.filter(t => t.status === 'TODO').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: completedTasks.length,
      deleted: tasks.filter(t => t.status === 'DELETED').length,
    };

    // Count by priority
    const byPriority = {
      critical: tasks.filter(t => t.priority === 'CRITICAL').length,
      high: tasks.filter(t => t.priority === 'HIGH').length,
      medium: tasks.filter(t => t.priority === 'MEDIUM').length,
      low: tasks.filter(t => t.priority === 'LOW').length,
    };

    // Calculate completion rate
    const completionRate = total > 0 ? completedTasks.length / total : 0;

    // Calculate average completion time (in hours)
    let averageCompletionTime: number | null = null;
    const completedWithTimes = completedTasks.filter(
      t => t.completedAt && t.createdAt
    );

    if (completedWithTimes.length > 0) {
      const totalTime = completedWithTimes.reduce((sum, task) => {
        const created = new Date(task.createdAt).getTime();
        const completed = new Date(task.completedAt!).getTime();
        return sum + (completed - created);
      }, 0);
      averageCompletionTime = Math.round(
        totalTime / completedWithTimes.length / (1000 * 60 * 60)
      ); // Convert to hours
    }

    // Count overdue tasks
    const overdueCount = tasks.filter(
      t =>
        t.status !== 'COMPLETED' &&
        t.status !== 'DELETED' &&
        t.dueDate &&
        new Date(t.dueDate) < now
    ).length;

    return {
      total,
      byStatus,
      byPriority,
      completionRate,
      averageCompletionTime,
      overdueCount,
    };
  },

  /**
   * AI-suggested tasks (placeholder)
   */
  aiSuggestedTasks: async (_parent, { context: _aiContext }) =>
    // TODO: Implement AI logic in future
    [],
  /**
   * Next recommended task (AI-powered)
   */
  nextRecommendedTask: async (_parent, { boardId }) => {
    const tasks = await getTasksByBoard(boardId);
    const incompleteTasks = tasks.filter(
      t => t.status !== 'COMPLETED' && t.status !== 'DELETED'
    );

    if (incompleteTasks.length === 0) return null;

    // Build user context from completed tasks
    const completedTasks = await getTasksByBoard(boardId);
    const userContext = buildUserContext(
      completedTasks.filter(t => t.status === 'COMPLETED'),
      new Date()
    );

    // Get AI recommendation
    const recommendation = await safeAIOperation(
      async () => await getRecommendedTaskWithAI(incompleteTasks, userContext),
      null
    );

    // Return recommended task or fallback to first incomplete task
    return recommendation?.task || incompleteTasks[0] || null;
  },

  /**
   * Search tasks by natural language (placeholder)
   */
  searchTasksByNaturalLanguage: async (_parent, { query }) => {
    // TODO: Implement AI-powered search in future
    const tasks = await getAllTasks();
    const queryLower = query.toLowerCase();
    return tasks.filter(
      task =>
        task.title.toLowerCase().includes(queryLower) ||
        task.description?.toLowerCase().includes(queryLower)
    );
  },
};

// ============================================================================
// Mutation Resolvers
// ============================================================================

export const taskMutations: Pick<
  MutationResolvers,
  | 'createTask'
  | 'updateTask'
  | 'deleteTask'
  | 'restoreTask'
  | 'moveTask'
  | 'duplicateTask'
  | 'createTasks'
  | 'updateTasks'
  | 'deleteTasks'
  | 'createTaskFromNaturalLanguage'
  | 'breakdownTask'
  | 'optimizeTaskSchedule'
> = {
  /**
   * Create a new task
   */
  createTask: async (_parent, { input }, _context) => {
    const priority = (input.priority ?? 'MEDIUM') as
      | 'CRITICAL'
      | 'HIGH'
      | 'MEDIUM'
      | 'LOW';

    const taskData = {
      boardId: input.boardId,
      columnId: input.columnId,
      title: input.title,
      description: input.description ?? '',
      status: 'TODO' as const,
      priority,
      dueDate: input.dueDate ? input.dueDate.toISOString() : undefined,
      dueTime: input.dueTime ?? undefined,
      labels: input.labels ?? [],
      subtasks: (input.subtasks ?? []).map(
        (st: any, index: number): SubTaskRecord => ({
          id: crypto.randomUUID(),
          title: st.title,
          completed: false,
          position: st.position ?? index,
          createdAt: new Date().toISOString(),
        })
      ),
      files: (input.files ?? []).map(
        (file: any): AttachmentRecord => ({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: file.data,
          uploadedAt: new Date().toISOString(),
        })
      ),
      recurrence: input.recurrence
        ? (input.recurrence as RecurrenceConfigRecord)
        : undefined,
      position: 0,
    };

    const newTask = await createTaskDB(taskData);

    // Publish subscription event
    await publishEvent(SUBSCRIPTION_TOPICS.TASK_CREATED, {
      taskCreated: newTask,
    });

    // Trigger webhook event
    await triggerTaskCreated(newTask as any);

    return newTask;
  },

  /**
   * Update an existing task
   */
  updateTask: async (_parent, { id, input }, _context) => {
    const updates: Partial<TaskRecord> = {};

    if (input.title !== undefined && input.title !== null)
      updates.title = input.title;
    if (input.description !== undefined)
      updates.description = input.description ?? undefined;
    if (input.status !== undefined && input.status !== null)
      updates.status = input.status;
    if (input.priority !== undefined && input.priority !== null)
      updates.priority = input.priority;
    if (input.dueDate !== undefined)
      updates.dueDate = input.dueDate ? input.dueDate.toISOString() : undefined;
    if (input.dueTime !== undefined)
      updates.dueTime = input.dueTime ?? undefined;
    if (input.labels !== undefined && input.labels !== null)
      updates.labels = input.labels;
    if (input.recurrence !== undefined)
      updates.recurrence = input.recurrence
        ? (input.recurrence as RecurrenceConfigRecord)
        : undefined;

    if (input.subtasks !== undefined && input.subtasks !== null) {
      updates.subtasks = input.subtasks.map((st: any): SubTaskRecord => {
        if (st.id) {
          return {
            id: st.id,
            title: st.title ?? '',
            completed: st.completed ?? false,
            position: st.position ?? 0,
            createdAt: st.createdAt ?? new Date().toISOString(),
          };
        } else {
          return {
            id: crypto.randomUUID(),
            title: st.title,
            completed: false,
            position: st.position ?? 0,
            createdAt: new Date().toISOString(),
          };
        }
      });
    }

    if (input.files !== undefined && input.files !== null) {
      updates.files = input.files.map(
        (file: any): AttachmentRecord => ({
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: file.data,
          uploadedAt: new Date().toISOString(),
        })
      );
    }

    // Set completedAt if status changed to COMPLETED
    if (input.status === 'COMPLETED' && !updates.completedAt) {
      updates.completedAt = new Date().toISOString();
    }

    const updated = await updateTaskDB(id, updates);

    if (!updated) {
      throw new GraphQLError('Task not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Publish subscription events
    await publishEvent(SUBSCRIPTION_TOPICS.TASK_UPDATED, {
      taskUpdated: updated,
    });

    // Trigger webhook events
    await triggerTaskUpdated(updated as any);

    if (input.status === 'COMPLETED') {
      await publishEvent(SUBSCRIPTION_TOPICS.TASK_COMPLETED, {
        taskCompleted: updated,
      });
      await triggerTaskCompleted(updated as any);
    }

    return updated;
  },

  /**
   * Delete a task (soft delete)
   */
  deleteTask: async (_parent, { id }, _context) => {
    const task = await getTask(id);
    if (!task) {
      throw new GraphQLError('Task not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Soft delete by updating status
    const deleted = await updateTaskDB(id, {
      status: 'DELETED',
      deletedAt: new Date().toISOString(),
    });

    if (deleted) {
      await publishEvent(SUBSCRIPTION_TOPICS.TASK_DELETED, {
        taskDeleted: deleted,
      });
      await triggerTaskDeleted(deleted as any);
    }

    return true;
  },

  /**
   * Restore a deleted task
   */
  restoreTask: async (_parent, { id }, _context) => {
    const task = await getTask(id);
    if (!task) {
      throw new GraphQLError('Task not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    const restored = await updateTaskDB(id, {
      status: 'TODO',
      deletedAt: undefined,
    });

    if (!restored) {
      throw new GraphQLError('Failed to restore task', {
        extensions: { code: 'INTERNAL_ERROR' },
      });
    }

    await publishEvent(SUBSCRIPTION_TOPICS.TASK_UPDATED, {
      taskUpdated: restored,
    });

    return restored;
  },

  /**
   * Move task to different column/position
   */
  moveTask: async (
    _parent,
    { id, targetColumnId, targetPosition },
    _context
  ) => {
    const moved = await updateTaskDB(id, {
      columnId: targetColumnId,
      position: targetPosition,
    });

    if (!moved) {
      throw new GraphQLError('Task not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    await publishEvent(SUBSCRIPTION_TOPICS.TASK_UPDATED, {
      taskUpdated: moved,
    });

    return moved;
  },

  /**
   * Duplicate a task
   */
  duplicateTask: async (_parent, { id }, _context) => {
    const original = await getTask(id);
    if (!original) {
      throw new GraphQLError('Task not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    const duplicateData = {
      boardId: original.boardId,
      columnId: original.columnId,
      title: `${original.title} (Copy)`,
      description: original.description,
      status: 'TODO' as const,
      priority: original.priority,
      dueDate: original.dueDate,
      dueTime: original.dueTime,
      labels: [...original.labels],
      subtasks: original.subtasks.map(st => ({
        ...st,
        id: crypto.randomUUID(),
        completed: false,
      })),
      files: [...original.files],
      recurrence: original.recurrence,
      position: original.position + 1,
    };

    const duplicate = await createTaskDB(duplicateData);

    await publishEvent(SUBSCRIPTION_TOPICS.TASK_CREATED, {
      taskCreated: duplicate,
    });

    return duplicate;
  },

  /**
   * Create multiple tasks (batch)
   */
  createTasks: async (_parent, { inputs }, _context) => {
    const tasksData = inputs.map(input => {
      const priority = (input.priority ?? 'MEDIUM') as
        | 'CRITICAL'
        | 'HIGH'
        | 'MEDIUM'
        | 'LOW';

      return {
        boardId: input.boardId,
        columnId: input.columnId,
        title: input.title,
        description: input.description ?? '',
        status: 'TODO' as const,
        priority,
        dueDate: input.dueDate ? input.dueDate.toISOString() : undefined,
        dueTime: input.dueTime ?? undefined,
        labels: input.labels ?? [],
        subtasks: (input.subtasks ?? []).map(
          (st: any, index: number): SubTaskRecord => ({
            id: crypto.randomUUID(),
            title: st.title,
            completed: false,
            position: st.position ?? index,
            createdAt: new Date().toISOString(),
          })
        ),
        files: (input.files ?? []).map(
          (file: any): AttachmentRecord => ({
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            size: file.size,
            data: file.data,
            uploadedAt: new Date().toISOString(),
          })
        ),
        recurrence: input.recurrence
          ? (input.recurrence as RecurrenceConfigRecord)
          : undefined,
        position: 0,
      };
    });

    const newTasks = await createTasksDB(tasksData);

    // Publish events for each task
    for (const task of newTasks) {
      await publishEvent(SUBSCRIPTION_TOPICS.TASK_CREATED, {
        taskCreated: task,
      });
    }

    return newTasks;
  },

  /**
   * Update multiple tasks (batch)
   */
  updateTasks: async (_parent, { ids, input }, _context) => {
    const updated: TaskRecord[] = [];

    // Convert InputMaybe types to proper types
    const updates: Partial<TaskRecord> = {};
    if (input.title !== undefined && input.title !== null)
      updates.title = input.title;
    if (input.description !== undefined)
      updates.description = input.description ?? undefined;
    if (input.status !== undefined && input.status !== null)
      updates.status = input.status;
    if (input.priority !== undefined && input.priority !== null)
      updates.priority = input.priority;
    if (input.dueDate !== undefined)
      updates.dueDate = input.dueDate ? input.dueDate.toISOString() : undefined;
    if (input.dueTime !== undefined)
      updates.dueTime = input.dueTime ?? undefined;
    if (input.labels !== undefined && input.labels !== null)
      updates.labels = input.labels;

    for (const id of ids) {
      const task = await updateTaskDB(id, updates);
      if (task) {
        updated.push(task);
        await publishEvent(SUBSCRIPTION_TOPICS.TASK_UPDATED, {
          taskUpdated: task,
        });
      }
    }

    return updated;
  },

  /**
   * Delete multiple tasks (batch)
   */
  deleteTasks: async (_parent, { ids }, _context) => {
    for (const id of ids) {
      const task = await getTask(id);
      if (task) {
        const deleted = await updateTaskDB(id, {
          status: 'DELETED',
          deletedAt: new Date().toISOString(),
        });

        if (deleted) {
          await publishEvent(SUBSCRIPTION_TOPICS.TASK_DELETED, {
            taskDeleted: deleted,
          });
        }
      }
    }

    return true;
  },

  /**
   * Create task from natural language (AI-powered)
   */
  createTaskFromNaturalLanguage: async (
    _parent,
    { query, context: aiContext }
  ) => {
    // Parse natural language using AI
    const parseResult = await parseNaturalLanguageToTask(query, {
      defaultBoardId: aiContext?.boardId || 'default',
      defaultColumnId: 'todo',
      context: aiContext
        ? {
            boardId: aiContext.boardId || undefined,
            recentActivity: aiContext.recentActivity || undefined,
            preferences: aiContext.preferences
              ? {
                  workingHours: aiContext.preferences.workingHours
                    ? {
                        start: aiContext.preferences.workingHours.start,
                        end: aiContext.preferences.workingHours.end,
                      }
                    : undefined,
                  preferredPriority:
                    aiContext.preferences.preferredPriority || undefined,
                  autoBreakdownEnabled:
                    aiContext.preferences.autoBreakdownEnabled || undefined,
                }
              : undefined,
          }
        : undefined,
      includeSubtasks: true,
    });

    // Validate AI response
    const validation = validateAIResponse(parseResult, parseResult.confidence);
    if (!validation.valid) {
      console.warn(`AI parsing warning: ${validation.reason}`);
    }

    // Convert to CreateTaskInput
    const taskInput = convertToCreateTaskInput(parseResult, {
      defaultBoardId: aiContext?.boardId || 'default',
      defaultColumnId: 'todo',
      includeSubtasks: true,
    });

    // Create task data
    const taskData = {
      boardId: taskInput.boardId,
      columnId: taskInput.columnId,
      title: taskInput.title,
      description: taskInput.description || '',
      status: 'TODO' as const,
      priority: (taskInput.priority || 'MEDIUM') as
        | 'CRITICAL'
        | 'HIGH'
        | 'MEDIUM'
        | 'LOW',
      dueDate: taskInput.dueDate ? taskInput.dueDate.toISOString() : undefined,
      dueTime: taskInput.dueTime || undefined,
      labels: taskInput.labels || [],
      subtasks: (taskInput.subtasks || []).map(
        (st, index): SubTaskRecord => ({
          id: crypto.randomUUID(),
          title: st.title,
          completed: false,
          position: st.position ?? index,
          createdAt: new Date().toISOString(),
        })
      ),
      files: [],
      position: 0,
    };

    const newTask = await createTaskDB(taskData);

    await publishEvent(SUBSCRIPTION_TOPICS.TASK_CREATED, {
      taskCreated: newTask,
    });

    await triggerTaskCreated(newTask as any);

    return newTask;
  },

  /**
   * Breakdown task into subtasks (AI-powered)
   */
  breakdownTask: async (_parent, { taskId, strategy }) => {
    const original = await getTask(taskId);
    if (!original) {
      throw new GraphQLError('Task not found', {
        extensions: { code: 'NOT_FOUND' },
      });
    }

    // Break down task using AI
    const breakdownResult = await breakdownTaskWithAI(original, {
      strategy: strategy || undefined,
      maxSubtasks: 7,
      minSubtasks: 2,
    });

    // Validate breakdown
    if (!validateBreakdown(breakdownResult)) {
      console.warn('AI breakdown validation failed, returning empty array');
      return [];
    }

    // Create subtasks as new tasks
    const subtasksData = breakdownResult.subtasks.map(
      (subtaskTitle, index) => ({
        boardId: original.boardId,
        columnId: original.columnId,
        title: subtaskTitle,
        description: `Subtask of: ${original.title}`,
        status: 'TODO' as const,
        priority: original.priority,
        dueDate: original.dueDate,
        dueTime: original.dueTime,
        labels: original.labels,
        subtasks: [] as SubTaskRecord[],
        files: [] as AttachmentRecord[],
        position: original.position + index + 1,
      })
    );

    const newSubtasks = await createTasksDB(subtasksData);

    // Publish events
    for (const task of newSubtasks) {
      await publishEvent(SUBSCRIPTION_TOPICS.TASK_CREATED, {
        taskCreated: task,
      });
      await triggerTaskCreated(task as any);
    }

    return newSubtasks;
  },

  /**
   * Optimize task schedule (AI-powered)
   */
  optimizeTaskSchedule: async (_parent, { boardId, constraints }) => {
    const tasks = await getTasksByBoard(boardId);
    const incompleteTasks = tasks.filter(
      t => t.status !== 'COMPLETED' && t.status !== 'DELETED'
    );

    if (incompleteTasks.length === 0) {
      return {
        optimizedTasks: [],
        estimatedCompletionDate: new Date(),
        suggestions: ['No incomplete tasks to optimize'],
      };
    }

    // Prepare constraints
    const optimizationConstraints = {
      workingHoursPerDay: constraints?.workingHoursPerDay || 8,
      deadline: constraints?.deadline || undefined,
      prioritizeBy: (constraints?.prioritizeBy || 'CRITICAL') as
        | 'CRITICAL'
        | 'HIGH'
        | 'MEDIUM'
        | 'LOW',
    };

    // Optimize schedule using AI
    const optimizationResult = await optimizeScheduleWithAI(incompleteTasks, {
      constraints: optimizationConstraints,
      considerDependencies: false,
      balanceWorkload: true,
    });

    return optimizationResult;
  },
};

// ============================================================================
// Field Resolvers
// ============================================================================

export const taskFieldResolvers: TaskResolvers = {
  /**
   * Check if task is overdue
   */
  isOverdue: parent => {
    if (!parent.dueDate || parent.status === 'COMPLETED') return false;
    return new Date(parent.dueDate) < new Date();
  },

  /**
   * Calculate completion percentage based on subtasks
   */
  completionPercentage: parent => {
    if (!parent.subtasks || parent.subtasks.length === 0) {
      return parent.status === 'COMPLETED' ? 100 : 0;
    }

    const completedSubtasks = parent.subtasks.filter(st => st.completed).length;
    return (completedSubtasks / parent.subtasks.length) * 100;
  },

  /**
   * Estimate task duration (placeholder)
   */
  estimatedDuration: _parent =>
    // TODO: Implement AI-based estimation in future
    null,
  /**
   * Resolve labels from IDs
   */
  labels: async (parent, _args, context) => {
    const labels = await Promise.all(
      parent.labels.map(labelId => context.loaders.labelLoader.load(labelId))
    );
    return labels.filter(label => label !== null);
  },
};

// ============================================================================
// Subscription Resolvers
// ============================================================================

export const taskSubscriptions: Pick<
  SubscriptionResolvers,
  'taskCreated' | 'taskUpdated' | 'taskCompleted' | 'taskDeleted'
> = {
  taskCreated: {
    subscribe: (_parent, { boardId: _boardId }) =>
      subscribe(SUBSCRIPTION_TOPICS.TASK_CREATED),
  },

  taskUpdated: {
    subscribe: (_parent, { boardId: _boardId }) =>
      subscribe(SUBSCRIPTION_TOPICS.TASK_UPDATED),
  },

  taskCompleted: {
    subscribe: (_parent, { boardId: _boardId }) =>
      subscribe(SUBSCRIPTION_TOPICS.TASK_COMPLETED),
  },

  taskDeleted: {
    subscribe: (_parent, { boardId: _boardId }) =>
      subscribe(SUBSCRIPTION_TOPICS.TASK_DELETED),
  },
};
