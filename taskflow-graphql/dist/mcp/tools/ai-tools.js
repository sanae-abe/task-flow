/**
 * AI-powered MCP tools for task management
 * Integrates with existing AI utilities
 */
import { breakdownTaskWithAI } from '../../utils/ai-task-breakdown.js';
import { parseNaturalLanguageToTask } from '../../utils/ai-natural-language.js';
import { optimizeScheduleWithAI } from '../../utils/ai-schedule-optimizer.js';
import { getRecommendedTaskWithAI } from '../../utils/ai-recommendations.js';
import { getTask, getTasksByBoard, createTasks, createTask, getBoard, } from '../../utils/indexeddb.js';
/**
 * AI Tools Schema Definitions
 */
export const aiTools = [
    {
        name: 'breakdown_task',
        description: 'Break down a complex task into actionable subtasks using AI. Supports multiple breakdown strategies including sequential, parallel, and hybrid approaches.',
        inputSchema: {
            type: 'object',
            properties: {
                taskId: {
                    type: 'string',
                    description: 'The ID of the task to break down',
                },
                strategy: {
                    type: 'string',
                    enum: [
                        'SEQUENTIAL',
                        'PARALLEL',
                        'HYBRID',
                        'BY_FEATURE',
                        'BY_PHASE',
                        'BY_COMPONENT',
                        'BY_COMPLEXITY',
                    ],
                    description: 'Breakdown strategy to use',
                    default: 'HYBRID',
                },
            },
            required: ['taskId'],
        },
    },
    {
        name: 'create_task_from_natural_language',
        description: 'Create a task from natural language description. AI will extract task properties like title, description, priority, and due date.',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Natural language task description (e.g., "Create a high priority task to implement user authentication by next Friday")',
                },
                boardId: {
                    type: 'string',
                    description: 'The board ID where the task should be created',
                },
                columnId: {
                    type: 'string',
                    description: 'Optional column ID. If not provided, uses default column.',
                },
            },
            required: ['query', 'boardId'],
        },
    },
    {
        name: 'optimize_schedule',
        description: 'Optimize task schedule using AI to maximize efficiency and meet deadlines. Considers task dependencies, priorities, and resource constraints.',
        inputSchema: {
            type: 'object',
            properties: {
                boardId: {
                    type: 'string',
                    description: 'The board ID to optimize',
                },
                workHoursPerDay: {
                    type: 'number',
                    description: 'Available work hours per day',
                    default: 8,
                    minimum: 1,
                    maximum: 24,
                },
                teamSize: {
                    type: 'number',
                    description: 'Number of team members',
                    default: 1,
                    minimum: 1,
                },
            },
            required: ['boardId'],
        },
    },
    {
        name: 'get_recommended_task',
        description: 'Get AI-recommended next task to work on. Uses intelligent prioritization based on deadlines, dependencies, and current progress.',
        inputSchema: {
            type: 'object',
            properties: {
                boardId: {
                    type: 'string',
                    description: 'The board ID to get recommendations from',
                },
                context: {
                    type: 'string',
                    description: 'Optional context (e.g., "frontend development", "urgent fixes")',
                },
            },
            required: ['boardId'],
        },
    },
];
/**
 * Handler for breakdown_task tool
 */
export async function handleBreakdownTask(args) {
    try {
        const task = await getTask(args.taskId);
        if (!task) {
            throw new Error(`Task not found: ${args.taskId}`);
        }
        const strategy = args.strategy || 'HYBRID';
        const result = await breakdownTaskWithAI(task, { strategy });
        // Create subtasks in database
        const subtaskRecords = result.subtasks.map((title, index) => ({
            boardId: task.boardId,
            columnId: task.columnId,
            title,
            description: `Subtask ${index + 1} of ${task.title}`,
            status: 'TODO',
            priority: task.priority,
            labels: [],
            subtasks: [],
            files: [],
            position: index,
        }));
        const createdSubtasks = await createTasks(subtaskRecords);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        parentTask: {
                            id: task.id,
                            title: task.title,
                        },
                        strategy: result.strategy,
                        confidence: result.confidence,
                        reasoning: result.reasoning,
                        subtasksCreated: createdSubtasks.length,
                        subtasks: createdSubtasks.map(st => ({
                            id: st.id,
                            title: st.title,
                            description: st.description,
                            priority: st.priority,
                        })),
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: errorMessage,
                    }, null, 2),
                },
            ],
        };
    }
}
/**
 * Handler for create_task_from_natural_language tool
 */
export async function handleCreateTaskFromNaturalLanguage(args) {
    try {
        const board = await getBoard(args.boardId);
        if (!board) {
            throw new Error(`Board not found: ${args.boardId}`);
        }
        const parsedTask = await parseNaturalLanguageToTask(args.query);
        // Use provided columnId or first column
        const columnId = args.columnId || board.columns[0]?.id;
        if (!columnId) {
            throw new Error('No column available in board');
        }
        const taskRecord = {
            boardId: args.boardId,
            columnId,
            title: parsedTask.title,
            description: parsedTask.description,
            status: 'TODO',
            priority: parsedTask.priority || 'MEDIUM',
            dueDate: parsedTask.dueDate?.toISOString(),
            dueTime: parsedTask.dueTime,
            labels: parsedTask.labels || [],
            subtasks: parsedTask.subtasks?.map((title, index) => ({
                id: `subtask-${index}`,
                title,
                completed: false,
                position: index,
                createdAt: new Date().toISOString(),
            })) || [],
            files: [],
            position: 0,
        };
        const task = await createTask(taskRecord);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        task: {
                            id: task.id,
                            title: task.title,
                            description: task.description,
                            priority: task.priority,
                            dueDate: task.dueDate,
                            labels: task.labels,
                        },
                        parsedFrom: args.query,
                        confidence: parsedTask
                            .confidence,
                        extractedEntities: parsedTask.extractedEntities,
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: errorMessage,
                    }, null, 2),
                },
            ],
        };
    }
}
/**
 * Handler for optimize_schedule tool
 * Week 7 Day 43-49: Performance optimization with parallel data fetching
 */
export async function handleOptimizeSchedule(args) {
    try {
        // Parallel fetch: board and tasks simultaneously
        const [board, tasks] = await Promise.all([
            getBoard(args.boardId),
            getTasksByBoard(args.boardId),
        ]);
        if (!board) {
            throw new Error(`Board not found: ${args.boardId}`);
        }
        const workHoursPerDay = args.workHoursPerDay || 8;
        const teamSize = args.teamSize || 1;
        const optimizationOptions = {
            constraints: {
                workingHoursPerDay: workHoursPerDay,
                teamSize,
            },
        };
        const optimizedSchedule = await optimizeScheduleWithAI(tasks, optimizationOptions);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        board: {
                            id: board.id,
                            name: board.name,
                        },
                        optimization: {
                            totalTasks: tasks.length,
                            workHoursPerDay,
                            teamSize,
                            estimatedCompletionDate: optimizedSchedule.estimatedCompletionDate,
                        },
                        optimizedTasks: optimizedSchedule.optimizedTasks.map(task => ({
                            id: task.id,
                            title: task.title,
                            priority: task.priority,
                            dueDate: task.dueDate,
                        })),
                        suggestions: optimizedSchedule.suggestions,
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: errorMessage,
                    }, null, 2),
                },
            ],
        };
    }
}
/**
 * Handler for get_recommended_task tool
 * Week 7 Day 43-49: Performance optimization with parallel data fetching
 */
export async function handleGetRecommendedTask(args) {
    try {
        // Parallel fetch: board and tasks simultaneously
        const [board, tasks] = await Promise.all([
            getBoard(args.boardId),
            getTasksByBoard(args.boardId),
        ]);
        if (!board) {
            throw new Error(`Board not found: ${args.boardId}`);
        }
        const userContext = {
            currentTime: new Date(),
            workingHours: { start: '09:00', end: '18:00' },
        };
        const recommendation = await getRecommendedTaskWithAI(tasks, userContext);
        if (!recommendation) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            success: true,
                            board: {
                                id: board.id,
                                name: board.name,
                            },
                            recommendation: null,
                            message: 'No suitable task found for recommendation',
                            context: args.context,
                        }, null, 2),
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: true,
                        board: {
                            id: board.id,
                            name: board.name,
                        },
                        recommendation: {
                            taskId: recommendation.task.id,
                            taskTitle: recommendation.task.title,
                            priority: recommendation.task.priority,
                            score: recommendation.score,
                            reasoning: recommendation.reasoning,
                            confidence: recommendation.confidence,
                        },
                        context: args.context,
                    }, null, 2),
                },
            ],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: errorMessage,
                    }, null, 2),
                },
            ],
        };
    }
}
/**
 * Main handler that routes tool calls
 */
export async function handleAITool(toolName, args) {
    switch (toolName) {
        case 'breakdown_task':
            return handleBreakdownTask(args);
        case 'create_task_from_natural_language':
            return handleCreateTaskFromNaturalLanguage(args);
        case 'optimize_schedule':
            return handleOptimizeSchedule(args);
        case 'get_recommended_task':
            return handleGetRecommendedTask(args);
        default:
            throw new Error(`Unknown AI tool: ${toolName}`);
    }
}
//# sourceMappingURL=ai-tools.js.map