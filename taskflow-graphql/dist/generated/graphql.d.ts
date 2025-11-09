import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { TaskRecord, BoardRecord, LabelRecord, TemplateRecord, SubTaskRecord, AttachmentRecord, RecurrenceConfigRecord, BoardColumnRecord, BoardSettingsRecord, TaskTemplateDataRecord } from '../types/database';
import type { GraphQLContext } from '../types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends {
    [key: string]: unknown;
}> = {
    [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
    [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<T extends {
    [key: string]: unknown;
}, K extends keyof T> = {
    [_ in K]?: never;
};
export type Incremental<T> = T | {
    [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
};
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
    [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: {
        input: string;
        output: string;
    };
    String: {
        input: string;
        output: string;
    };
    Boolean: {
        input: boolean;
        output: boolean;
    };
    Int: {
        input: number;
        output: number;
    };
    Float: {
        input: number;
        output: number;
    };
    /** ISO 8601 date-time string (e.g., "2025-11-08T10:30:00Z") */
    DateTime: {
        input: Date;
        output: Date;
    };
    /** Arbitrary JSON data */
    JSON: {
        input: any;
        output: any;
    };
};
export type AiContextInput = {
    boardId?: InputMaybe<Scalars['ID']['input']>;
    preferences?: InputMaybe<UserPreferencesInput>;
    recentActivity?: InputMaybe<Array<Scalars['String']['input']>>;
};
export type AiSuggestion = {
    __typename?: 'AISuggestion';
    actions: Array<SuggestedAction>;
    confidence: Scalars['Float']['output'];
    message: Scalars['String']['output'];
    task?: Maybe<Task>;
    type: SuggestionType;
};
export type Attachment = {
    __typename?: 'Attachment';
    data: Scalars['String']['output'];
    id: Scalars['ID']['output'];
    name: Scalars['String']['output'];
    size: Scalars['Int']['output'];
    storagePath?: Maybe<Scalars['String']['output']>;
    type: Scalars['String']['output'];
    uploadedAt: Scalars['DateTime']['output'];
};
export type AttachmentInput = {
    data: Scalars['String']['input'];
    name: Scalars['String']['input'];
    size: Scalars['Int']['input'];
    type: Scalars['String']['input'];
};
export type Board = {
    __typename?: 'Board';
    columns: Array<BoardColumn>;
    completedTaskCount: Scalars['Int']['output'];
    createdAt: Scalars['DateTime']['output'];
    description?: Maybe<Scalars['String']['output']>;
    id: Scalars['ID']['output'];
    isShared: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    settings: BoardSettings;
    taskCount: Scalars['Int']['output'];
    updatedAt: Scalars['DateTime']['output'];
};
export type BoardColumn = {
    __typename?: 'BoardColumn';
    color?: Maybe<Scalars['String']['output']>;
    id: Scalars['ID']['output'];
    position: Scalars['Int']['output'];
    taskCount: Scalars['Int']['output'];
    title: Scalars['String']['output'];
};
export type BoardColumnInput = {
    color?: InputMaybe<Scalars['String']['input']>;
    id?: InputMaybe<Scalars['ID']['input']>;
    position: Scalars['Int']['input'];
    title: Scalars['String']['input'];
};
export type BoardSettings = {
    __typename?: 'BoardSettings';
    autoArchiveCompleted: Scalars['Boolean']['output'];
    completedColumnId?: Maybe<Scalars['ID']['output']>;
    defaultColumnId?: Maybe<Scalars['ID']['output']>;
    recycleBinRetentionDays: Scalars['Int']['output'];
};
export type BoardSettingsInput = {
    autoArchiveCompleted?: InputMaybe<Scalars['Boolean']['input']>;
    completedColumnId?: InputMaybe<Scalars['ID']['input']>;
    defaultColumnId?: InputMaybe<Scalars['ID']['input']>;
    recycleBinRetentionDays?: InputMaybe<Scalars['Int']['input']>;
};
export declare enum BreakdownStrategy {
    ByComplexity = "BY_COMPLEXITY",
    ByComponent = "BY_COMPONENT",
    ByFeature = "BY_FEATURE",
    ByPhase = "BY_PHASE"
}
export type CreateBoardInput = {
    columns?: InputMaybe<Array<BoardColumnInput>>;
    description?: InputMaybe<Scalars['String']['input']>;
    name: Scalars['String']['input'];
};
export type CreateLabelInput = {
    boardId?: InputMaybe<Scalars['ID']['input']>;
    color: Scalars['String']['input'];
    name: Scalars['String']['input'];
};
export type CreateSubTaskInput = {
    position?: InputMaybe<Scalars['Int']['input']>;
    title: Scalars['String']['input'];
};
export type CreateTaskInput = {
    boardId: Scalars['ID']['input'];
    columnId: Scalars['ID']['input'];
    description?: InputMaybe<Scalars['String']['input']>;
    dueDate?: InputMaybe<Scalars['DateTime']['input']>;
    dueTime?: InputMaybe<Scalars['String']['input']>;
    files?: InputMaybe<Array<AttachmentInput>>;
    labels?: InputMaybe<Array<Scalars['ID']['input']>>;
    priority?: InputMaybe<Priority>;
    recurrence?: InputMaybe<RecurrenceConfigInput>;
    subtasks?: InputMaybe<Array<CreateSubTaskInput>>;
    title: Scalars['String']['input'];
};
export type CreateTemplateInput = {
    category?: InputMaybe<Scalars['String']['input']>;
    isFavorite?: InputMaybe<Scalars['Boolean']['input']>;
    name: Scalars['String']['input'];
    taskTemplate: TaskTemplateDataInput;
};
export type CreateWebhookInput = {
    allowedIPs?: InputMaybe<Array<Scalars['String']['input']>>;
    events: Array<WebhookEvent>;
    rateLimit?: InputMaybe<Scalars['Int']['input']>;
    secret?: InputMaybe<Scalars['String']['input']>;
    url: Scalars['String']['input'];
};
export type Label = {
    __typename?: 'Label';
    boardId?: Maybe<Scalars['ID']['output']>;
    color: Scalars['String']['output'];
    createdAt: Scalars['DateTime']['output'];
    id: Scalars['ID']['output'];
    name: Scalars['String']['output'];
    taskCount: Scalars['Int']['output'];
};
export declare enum MarkdownFormat {
    GithubFlavored = "GITHUB_FLAVORED",
    Obsidian = "OBSIDIAN",
    Standard = "STANDARD"
}
export type MarkdownMetadata = {
    __typename?: 'MarkdownMetadata';
    boardName: Scalars['String']['output'];
    completedCount: Scalars['Int']['output'];
    includeAttachments: Scalars['Boolean']['output'];
    includeLabels: Scalars['Boolean']['output'];
    includeSubtasks: Scalars['Boolean']['output'];
    taskCount: Scalars['Int']['output'];
};
export type MarkdownReport = {
    __typename?: 'MarkdownReport';
    content: Scalars['String']['output'];
    format: MarkdownFormat;
    generatedAt: Scalars['DateTime']['output'];
    metadata: MarkdownMetadata;
};
export type MarkdownReportInput = {
    boardId: Scalars['ID']['input'];
    filters?: InputMaybe<TaskFilters>;
    format?: InputMaybe<MarkdownFormat>;
    includeAttachments?: InputMaybe<Scalars['Boolean']['input']>;
    includeCompleted?: InputMaybe<Scalars['Boolean']['input']>;
    includeLabels?: InputMaybe<Scalars['Boolean']['input']>;
    includeSubtasks?: InputMaybe<Scalars['Boolean']['input']>;
};
export type Mutation = {
    __typename?: 'Mutation';
    breakdownTask: Array<Task>;
    createBoard: Board;
    createLabel: Label;
    createTask: Task;
    createTaskFromNaturalLanguage: Task;
    createTasks: Array<Task>;
    createTemplate: Template;
    createWebhook: Webhook;
    deleteBoard: Scalars['Boolean']['output'];
    deleteLabel: Scalars['Boolean']['output'];
    deleteTask: Scalars['Boolean']['output'];
    deleteTasks: Scalars['Boolean']['output'];
    deleteTemplate: Scalars['Boolean']['output'];
    deleteWebhook: Scalars['Boolean']['output'];
    duplicateTask: Task;
    generateMarkdownReport: MarkdownReport;
    moveTask: Task;
    optimizeTaskSchedule: ScheduleOptimization;
    restoreTask: Task;
    testWebhook: WebhookDelivery;
    updateBoard: Board;
    updateLabel: Label;
    updateTask: Task;
    updateTasks: Array<Task>;
    updateTemplate: Template;
    updateWebhook: Webhook;
};
export type MutationBreakdownTaskArgs = {
    strategy?: InputMaybe<BreakdownStrategy>;
    taskId: Scalars['ID']['input'];
};
export type MutationCreateBoardArgs = {
    input: CreateBoardInput;
};
export type MutationCreateLabelArgs = {
    input: CreateLabelInput;
};
export type MutationCreateTaskArgs = {
    input: CreateTaskInput;
};
export type MutationCreateTaskFromNaturalLanguageArgs = {
    context?: InputMaybe<AiContextInput>;
    query: Scalars['String']['input'];
};
export type MutationCreateTasksArgs = {
    inputs: Array<CreateTaskInput>;
};
export type MutationCreateTemplateArgs = {
    input: CreateTemplateInput;
};
export type MutationCreateWebhookArgs = {
    input: CreateWebhookInput;
};
export type MutationDeleteBoardArgs = {
    id: Scalars['ID']['input'];
};
export type MutationDeleteLabelArgs = {
    id: Scalars['ID']['input'];
};
export type MutationDeleteTaskArgs = {
    id: Scalars['ID']['input'];
};
export type MutationDeleteTasksArgs = {
    ids: Array<Scalars['ID']['input']>;
};
export type MutationDeleteTemplateArgs = {
    id: Scalars['ID']['input'];
};
export type MutationDeleteWebhookArgs = {
    id: Scalars['ID']['input'];
};
export type MutationDuplicateTaskArgs = {
    id: Scalars['ID']['input'];
};
export type MutationGenerateMarkdownReportArgs = {
    input: MarkdownReportInput;
};
export type MutationMoveTaskArgs = {
    id: Scalars['ID']['input'];
    targetColumnId: Scalars['ID']['input'];
    targetPosition: Scalars['Int']['input'];
};
export type MutationOptimizeTaskScheduleArgs = {
    boardId: Scalars['ID']['input'];
    constraints?: InputMaybe<ScheduleConstraints>;
};
export type MutationRestoreTaskArgs = {
    id: Scalars['ID']['input'];
};
export type MutationTestWebhookArgs = {
    id: Scalars['ID']['input'];
};
export type MutationUpdateBoardArgs = {
    id: Scalars['ID']['input'];
    input: UpdateBoardInput;
};
export type MutationUpdateLabelArgs = {
    id: Scalars['ID']['input'];
    input: UpdateLabelInput;
};
export type MutationUpdateTaskArgs = {
    id: Scalars['ID']['input'];
    input: UpdateTaskInput;
};
export type MutationUpdateTasksArgs = {
    ids: Array<Scalars['ID']['input']>;
    input: UpdateTaskInput;
};
export type MutationUpdateTemplateArgs = {
    id: Scalars['ID']['input'];
    input: UpdateTemplateInput;
};
export type MutationUpdateWebhookArgs = {
    id: Scalars['ID']['input'];
    input: UpdateWebhookInput;
};
export declare enum Priority {
    Critical = "CRITICAL",
    High = "HIGH",
    Low = "LOW",
    Medium = "MEDIUM"
}
export type PriorityBreakdown = {
    __typename?: 'PriorityBreakdown';
    critical: Scalars['Int']['output'];
    high: Scalars['Int']['output'];
    low: Scalars['Int']['output'];
    medium: Scalars['Int']['output'];
};
export type Query = {
    __typename?: 'Query';
    aiSuggestedTasks: Array<Task>;
    board?: Maybe<Board>;
    boards: Array<Board>;
    currentBoard?: Maybe<Board>;
    exportBoardAsMarkdown: Scalars['String']['output'];
    exportTaskAsMarkdown: Scalars['String']['output'];
    exportTasksAsMarkdown: Scalars['String']['output'];
    label?: Maybe<Label>;
    labels: Array<Label>;
    nextRecommendedTask?: Maybe<Task>;
    searchTasksByNaturalLanguage: Array<Task>;
    task?: Maybe<Task>;
    taskStatistics: TaskStatistics;
    tasks: Array<Task>;
    template?: Maybe<Template>;
    templates: Array<Template>;
    webhook?: Maybe<Webhook>;
    webhookDeliveries: Array<WebhookDelivery>;
    webhookDelivery?: Maybe<WebhookDelivery>;
    webhookStats: WebhookStats;
    webhooks: Array<Webhook>;
};
export type QueryAiSuggestedTasksArgs = {
    context: AiContextInput;
};
export type QueryBoardArgs = {
    id: Scalars['ID']['input'];
};
export type QueryExportBoardAsMarkdownArgs = {
    boardId: Scalars['ID']['input'];
    filters?: InputMaybe<TaskFilters>;
};
export type QueryExportTaskAsMarkdownArgs = {
    taskId: Scalars['ID']['input'];
};
export type QueryExportTasksAsMarkdownArgs = {
    boardId: Scalars['ID']['input'];
    filters?: InputMaybe<TaskFilters>;
};
export type QueryLabelArgs = {
    id: Scalars['ID']['input'];
};
export type QueryLabelsArgs = {
    boardId?: InputMaybe<Scalars['ID']['input']>;
};
export type QueryNextRecommendedTaskArgs = {
    boardId: Scalars['ID']['input'];
};
export type QuerySearchTasksByNaturalLanguageArgs = {
    query: Scalars['String']['input'];
};
export type QueryTaskArgs = {
    id: Scalars['ID']['input'];
};
export type QueryTaskStatisticsArgs = {
    boardId?: InputMaybe<Scalars['ID']['input']>;
};
export type QueryTasksArgs = {
    boardId?: InputMaybe<Scalars['ID']['input']>;
    dueAfter?: InputMaybe<Scalars['DateTime']['input']>;
    dueBefore?: InputMaybe<Scalars['DateTime']['input']>;
    labels?: InputMaybe<Array<Scalars['String']['input']>>;
    limit?: InputMaybe<Scalars['Int']['input']>;
    offset?: InputMaybe<Scalars['Int']['input']>;
    priority?: InputMaybe<Priority>;
    search?: InputMaybe<Scalars['String']['input']>;
    status?: InputMaybe<TaskStatus>;
};
export type QueryTemplateArgs = {
    id: Scalars['ID']['input'];
};
export type QueryTemplatesArgs = {
    category?: InputMaybe<Scalars['String']['input']>;
    isFavorite?: InputMaybe<Scalars['Boolean']['input']>;
};
export type QueryWebhookArgs = {
    id: Scalars['ID']['input'];
};
export type QueryWebhookDeliveriesArgs = {
    limit?: InputMaybe<Scalars['Int']['input']>;
    offset?: InputMaybe<Scalars['Int']['input']>;
    webhookId: Scalars['ID']['input'];
};
export type QueryWebhookDeliveryArgs = {
    id: Scalars['ID']['input'];
};
export type RecurrenceConfig = {
    __typename?: 'RecurrenceConfig';
    dayOfMonth?: Maybe<Scalars['Int']['output']>;
    dayOfWeekInMonth?: Maybe<Scalars['Int']['output']>;
    daysOfWeek?: Maybe<Array<Scalars['Int']['output']>>;
    enabled: Scalars['Boolean']['output'];
    endDate?: Maybe<Scalars['DateTime']['output']>;
    interval: Scalars['Int']['output'];
    maxOccurrences?: Maybe<Scalars['Int']['output']>;
    pattern: RecurrencePattern;
    weekOfMonth?: Maybe<Scalars['Int']['output']>;
};
export type RecurrenceConfigInput = {
    dayOfMonth?: InputMaybe<Scalars['Int']['input']>;
    dayOfWeekInMonth?: InputMaybe<Scalars['Int']['input']>;
    daysOfWeek?: InputMaybe<Array<Scalars['Int']['input']>>;
    enabled: Scalars['Boolean']['input'];
    endDate?: InputMaybe<Scalars['DateTime']['input']>;
    interval: Scalars['Int']['input'];
    maxOccurrences?: InputMaybe<Scalars['Int']['input']>;
    pattern: RecurrencePattern;
    weekOfMonth?: InputMaybe<Scalars['Int']['input']>;
};
export declare enum RecurrencePattern {
    Daily = "DAILY",
    Monthly = "MONTHLY",
    Weekly = "WEEKLY",
    Yearly = "YEARLY"
}
export type ScheduleConstraints = {
    deadline?: InputMaybe<Scalars['DateTime']['input']>;
    prioritizeBy?: InputMaybe<Priority>;
    workingHoursPerDay?: InputMaybe<Scalars['Int']['input']>;
};
export type ScheduleOptimization = {
    __typename?: 'ScheduleOptimization';
    estimatedCompletionDate: Scalars['DateTime']['output'];
    optimizedTasks: Array<Task>;
    suggestions: Array<Scalars['String']['output']>;
};
export type StatusBreakdown = {
    __typename?: 'StatusBreakdown';
    completed: Scalars['Int']['output'];
    deleted: Scalars['Int']['output'];
    inProgress: Scalars['Int']['output'];
    todo: Scalars['Int']['output'];
};
export type SubTask = {
    __typename?: 'SubTask';
    completed: Scalars['Boolean']['output'];
    createdAt: Scalars['DateTime']['output'];
    id: Scalars['ID']['output'];
    position: Scalars['Int']['output'];
    title: Scalars['String']['output'];
};
export type Subscription = {
    __typename?: 'Subscription';
    aiSuggestionAvailable: AiSuggestion;
    boardUpdated: Board;
    taskCompleted: Task;
    taskCreated: Task;
    taskDeleted: Task;
    taskUpdated: Task;
};
export type SubscriptionAiSuggestionAvailableArgs = {
    boardId: Scalars['ID']['input'];
};
export type SubscriptionBoardUpdatedArgs = {
    boardId?: InputMaybe<Scalars['ID']['input']>;
};
export type SubscriptionTaskCompletedArgs = {
    boardId?: InputMaybe<Scalars['ID']['input']>;
};
export type SubscriptionTaskCreatedArgs = {
    boardId?: InputMaybe<Scalars['ID']['input']>;
};
export type SubscriptionTaskDeletedArgs = {
    boardId?: InputMaybe<Scalars['ID']['input']>;
};
export type SubscriptionTaskUpdatedArgs = {
    boardId?: InputMaybe<Scalars['ID']['input']>;
};
export type SuggestedAction = {
    __typename?: 'SuggestedAction';
    description: Scalars['String']['output'];
    parameters?: Maybe<Scalars['JSON']['output']>;
    type: Scalars['String']['output'];
};
export declare enum SuggestionType {
    BreakdownRecommended = "BREAKDOWN_RECOMMENDED",
    DeadlineAlert = "DEADLINE_ALERT",
    NextTask = "NEXT_TASK",
    PriorityAdjustment = "PRIORITY_ADJUSTMENT",
    RelatedTasks = "RELATED_TASKS"
}
export type Task = {
    __typename?: 'Task';
    boardId: Scalars['ID']['output'];
    columnId: Scalars['ID']['output'];
    completedAt?: Maybe<Scalars['DateTime']['output']>;
    completionPercentage: Scalars['Float']['output'];
    createdAt: Scalars['DateTime']['output'];
    deletedAt?: Maybe<Scalars['DateTime']['output']>;
    description?: Maybe<Scalars['String']['output']>;
    dueDate?: Maybe<Scalars['DateTime']['output']>;
    dueTime?: Maybe<Scalars['String']['output']>;
    estimatedDuration?: Maybe<Scalars['Int']['output']>;
    files: Array<Attachment>;
    id: Scalars['ID']['output'];
    isOverdue: Scalars['Boolean']['output'];
    labels: Array<Label>;
    position: Scalars['Int']['output'];
    priority: Priority;
    recurrence?: Maybe<RecurrenceConfig>;
    status: TaskStatus;
    subtasks: Array<SubTask>;
    title: Scalars['String']['output'];
    updatedAt: Scalars['DateTime']['output'];
};
export type TaskFilters = {
    dueAfter?: InputMaybe<Scalars['DateTime']['input']>;
    dueBefore?: InputMaybe<Scalars['DateTime']['input']>;
    labels?: InputMaybe<Array<Scalars['String']['input']>>;
    priority?: InputMaybe<Priority>;
    search?: InputMaybe<Scalars['String']['input']>;
    status?: InputMaybe<TaskStatus>;
};
export type TaskStatistics = {
    __typename?: 'TaskStatistics';
    averageCompletionTime?: Maybe<Scalars['Int']['output']>;
    byPriority: PriorityBreakdown;
    byStatus: StatusBreakdown;
    completionRate: Scalars['Float']['output'];
    overdueCount: Scalars['Int']['output'];
    total: Scalars['Int']['output'];
};
export declare enum TaskStatus {
    Completed = "COMPLETED",
    Deleted = "DELETED",
    InProgress = "IN_PROGRESS",
    Todo = "TODO"
}
export type TaskTemplateData = {
    __typename?: 'TaskTemplateData';
    description?: Maybe<Scalars['String']['output']>;
    dueDate?: Maybe<Scalars['String']['output']>;
    labels: Array<Label>;
    priority?: Maybe<Priority>;
    recurrence?: Maybe<RecurrenceConfig>;
    subtasks: Array<SubTask>;
    title: Scalars['String']['output'];
};
export type TaskTemplateDataInput = {
    description?: InputMaybe<Scalars['String']['input']>;
    dueDate?: InputMaybe<Scalars['String']['input']>;
    labels: Array<Scalars['ID']['input']>;
    priority?: InputMaybe<Priority>;
    recurrence?: InputMaybe<RecurrenceConfigInput>;
    subtasks?: InputMaybe<Array<CreateSubTaskInput>>;
    title: Scalars['String']['input'];
};
export type Template = {
    __typename?: 'Template';
    category?: Maybe<Scalars['String']['output']>;
    createdAt: Scalars['DateTime']['output'];
    id: Scalars['ID']['output'];
    isFavorite: Scalars['Boolean']['output'];
    name: Scalars['String']['output'];
    taskTemplate: TaskTemplateData;
    updatedAt: Scalars['DateTime']['output'];
};
export type UpdateBoardInput = {
    columns?: InputMaybe<Array<BoardColumnInput>>;
    description?: InputMaybe<Scalars['String']['input']>;
    name?: InputMaybe<Scalars['String']['input']>;
    settings?: InputMaybe<BoardSettingsInput>;
};
export type UpdateLabelInput = {
    color?: InputMaybe<Scalars['String']['input']>;
    name?: InputMaybe<Scalars['String']['input']>;
};
export type UpdateSubTaskInput = {
    completed?: InputMaybe<Scalars['Boolean']['input']>;
    id: Scalars['ID']['input'];
    position?: InputMaybe<Scalars['Int']['input']>;
    title?: InputMaybe<Scalars['String']['input']>;
};
export type UpdateTaskInput = {
    description?: InputMaybe<Scalars['String']['input']>;
    dueDate?: InputMaybe<Scalars['DateTime']['input']>;
    dueTime?: InputMaybe<Scalars['String']['input']>;
    files?: InputMaybe<Array<AttachmentInput>>;
    labels?: InputMaybe<Array<Scalars['ID']['input']>>;
    priority?: InputMaybe<Priority>;
    recurrence?: InputMaybe<RecurrenceConfigInput>;
    status?: InputMaybe<TaskStatus>;
    subtasks?: InputMaybe<Array<UpdateSubTaskInput>>;
    title?: InputMaybe<Scalars['String']['input']>;
};
export type UpdateTemplateInput = {
    category?: InputMaybe<Scalars['String']['input']>;
    isFavorite?: InputMaybe<Scalars['Boolean']['input']>;
    name?: InputMaybe<Scalars['String']['input']>;
    taskTemplate?: InputMaybe<TaskTemplateDataInput>;
};
export type UpdateWebhookInput = {
    active?: InputMaybe<Scalars['Boolean']['input']>;
    allowedIPs?: InputMaybe<Array<Scalars['String']['input']>>;
    events?: InputMaybe<Array<WebhookEvent>>;
    rateLimit?: InputMaybe<Scalars['Int']['input']>;
    secret?: InputMaybe<Scalars['String']['input']>;
    url?: InputMaybe<Scalars['String']['input']>;
};
export type UserPreferencesInput = {
    autoBreakdownEnabled?: InputMaybe<Scalars['Boolean']['input']>;
    preferredPriority?: InputMaybe<Priority>;
    workingHours?: InputMaybe<WorkingHoursInput>;
};
export type Webhook = {
    __typename?: 'Webhook';
    active: Scalars['Boolean']['output'];
    allowedIPs?: Maybe<Array<Scalars['String']['output']>>;
    createdAt: Scalars['DateTime']['output'];
    events: Array<WebhookEvent>;
    id: Scalars['ID']['output'];
    rateLimit?: Maybe<Scalars['Int']['output']>;
    secret?: Maybe<Scalars['String']['output']>;
    updatedAt: Scalars['DateTime']['output'];
    url: Scalars['String']['output'];
};
export type WebhookDelivery = {
    __typename?: 'WebhookDelivery';
    deliveredAt: Scalars['DateTime']['output'];
    event: WebhookEvent;
    id: Scalars['ID']['output'];
    payload: Scalars['JSON']['output'];
    response?: Maybe<Scalars['JSON']['output']>;
    status?: Maybe<Scalars['Int']['output']>;
    success: Scalars['Boolean']['output'];
    webhookId: Scalars['ID']['output'];
};
export declare enum WebhookEvent {
    BoardCreated = "BOARD_CREATED",
    BoardDeleted = "BOARD_DELETED",
    BoardUpdated = "BOARD_UPDATED",
    TaskCompleted = "TASK_COMPLETED",
    TaskCreated = "TASK_CREATED",
    TaskDeleted = "TASK_DELETED",
    TaskUpdated = "TASK_UPDATED"
}
export type WebhookStats = {
    __typename?: 'WebhookStats';
    activeWebhooks: Scalars['Int']['output'];
    failedDeliveries: Scalars['Int']['output'];
    successRate: Scalars['Float']['output'];
    successfulDeliveries: Scalars['Int']['output'];
    totalDeliveries: Scalars['Int']['output'];
    totalWebhooks: Scalars['Int']['output'];
};
export type WorkingHoursInput = {
    end: Scalars['String']['input'];
    start: Scalars['String']['input'];
};
export type ResolverTypeWrapper<T> = Promise<T> | T;
export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
    resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;
export type ResolverFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<TResult> | TResult;
export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;
export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<{
        [key in TKey]: TResult;
    }, TParent, TContext, TArgs>;
    resolve?: SubscriptionResolveFn<TResult, {
        [key in TKey]: TResult;
    }, TContext, TArgs>;
}
export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
    subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
    resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}
export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> = SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs> | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;
export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> = ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>) | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;
export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (parent: TParent, context: TContext, info: GraphQLResolveInfo) => Maybe<TTypes> | Promise<Maybe<TTypes>>;
export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;
export type NextResolverFn<T> = () => Promise<T>;
export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (next: NextResolverFn<TResult>, parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => TResult | Promise<TResult>;
/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
    AIContextInput: ResolverTypeWrapper<Partial<AiContextInput>>;
    AISuggestion: ResolverTypeWrapper<Partial<Omit<AiSuggestion, 'task'> & {
        task?: Maybe<ResolversTypes['Task']>;
    }>>;
    Attachment: ResolverTypeWrapper<AttachmentRecord>;
    AttachmentInput: ResolverTypeWrapper<Partial<AttachmentInput>>;
    Board: ResolverTypeWrapper<BoardRecord>;
    BoardColumn: ResolverTypeWrapper<BoardColumnRecord>;
    BoardColumnInput: ResolverTypeWrapper<Partial<BoardColumnInput>>;
    BoardSettings: ResolverTypeWrapper<BoardSettingsRecord>;
    BoardSettingsInput: ResolverTypeWrapper<Partial<BoardSettingsInput>>;
    Boolean: ResolverTypeWrapper<Partial<Scalars['Boolean']['output']>>;
    BreakdownStrategy: ResolverTypeWrapper<Partial<BreakdownStrategy>>;
    CreateBoardInput: ResolverTypeWrapper<Partial<CreateBoardInput>>;
    CreateLabelInput: ResolverTypeWrapper<Partial<CreateLabelInput>>;
    CreateSubTaskInput: ResolverTypeWrapper<Partial<CreateSubTaskInput>>;
    CreateTaskInput: ResolverTypeWrapper<Partial<CreateTaskInput>>;
    CreateTemplateInput: ResolverTypeWrapper<Partial<CreateTemplateInput>>;
    CreateWebhookInput: ResolverTypeWrapper<Partial<CreateWebhookInput>>;
    DateTime: ResolverTypeWrapper<Partial<Scalars['DateTime']['output']>>;
    Float: ResolverTypeWrapper<Partial<Scalars['Float']['output']>>;
    ID: ResolverTypeWrapper<Partial<Scalars['ID']['output']>>;
    Int: ResolverTypeWrapper<Partial<Scalars['Int']['output']>>;
    JSON: ResolverTypeWrapper<Partial<Scalars['JSON']['output']>>;
    Label: ResolverTypeWrapper<LabelRecord>;
    MarkdownFormat: ResolverTypeWrapper<Partial<MarkdownFormat>>;
    MarkdownMetadata: ResolverTypeWrapper<Partial<MarkdownMetadata>>;
    MarkdownReport: ResolverTypeWrapper<Partial<MarkdownReport>>;
    MarkdownReportInput: ResolverTypeWrapper<Partial<MarkdownReportInput>>;
    Mutation: ResolverTypeWrapper<{}>;
    Priority: ResolverTypeWrapper<Partial<Priority>>;
    PriorityBreakdown: ResolverTypeWrapper<Partial<PriorityBreakdown>>;
    Query: ResolverTypeWrapper<{}>;
    RecurrenceConfig: ResolverTypeWrapper<RecurrenceConfigRecord>;
    RecurrenceConfigInput: ResolverTypeWrapper<Partial<RecurrenceConfigInput>>;
    RecurrencePattern: ResolverTypeWrapper<Partial<RecurrencePattern>>;
    ScheduleConstraints: ResolverTypeWrapper<Partial<ScheduleConstraints>>;
    ScheduleOptimization: ResolverTypeWrapper<Partial<Omit<ScheduleOptimization, 'optimizedTasks'> & {
        optimizedTasks: Array<ResolversTypes['Task']>;
    }>>;
    StatusBreakdown: ResolverTypeWrapper<Partial<StatusBreakdown>>;
    String: ResolverTypeWrapper<Partial<Scalars['String']['output']>>;
    SubTask: ResolverTypeWrapper<SubTaskRecord>;
    Subscription: ResolverTypeWrapper<{}>;
    SuggestedAction: ResolverTypeWrapper<Partial<SuggestedAction>>;
    SuggestionType: ResolverTypeWrapper<Partial<SuggestionType>>;
    Task: ResolverTypeWrapper<TaskRecord>;
    TaskFilters: ResolverTypeWrapper<Partial<TaskFilters>>;
    TaskStatistics: ResolverTypeWrapper<Partial<TaskStatistics>>;
    TaskStatus: ResolverTypeWrapper<Partial<TaskStatus>>;
    TaskTemplateData: ResolverTypeWrapper<TaskTemplateDataRecord>;
    TaskTemplateDataInput: ResolverTypeWrapper<Partial<TaskTemplateDataInput>>;
    Template: ResolverTypeWrapper<TemplateRecord>;
    UpdateBoardInput: ResolverTypeWrapper<Partial<UpdateBoardInput>>;
    UpdateLabelInput: ResolverTypeWrapper<Partial<UpdateLabelInput>>;
    UpdateSubTaskInput: ResolverTypeWrapper<Partial<UpdateSubTaskInput>>;
    UpdateTaskInput: ResolverTypeWrapper<Partial<UpdateTaskInput>>;
    UpdateTemplateInput: ResolverTypeWrapper<Partial<UpdateTemplateInput>>;
    UpdateWebhookInput: ResolverTypeWrapper<Partial<UpdateWebhookInput>>;
    UserPreferencesInput: ResolverTypeWrapper<Partial<UserPreferencesInput>>;
    Webhook: ResolverTypeWrapper<Partial<Webhook>>;
    WebhookDelivery: ResolverTypeWrapper<Partial<WebhookDelivery>>;
    WebhookEvent: ResolverTypeWrapper<Partial<WebhookEvent>>;
    WebhookStats: ResolverTypeWrapper<Partial<WebhookStats>>;
    WorkingHoursInput: ResolverTypeWrapper<Partial<WorkingHoursInput>>;
};
/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
    AIContextInput: Partial<AiContextInput>;
    AISuggestion: Partial<Omit<AiSuggestion, 'task'> & {
        task?: Maybe<ResolversParentTypes['Task']>;
    }>;
    Attachment: AttachmentRecord;
    AttachmentInput: Partial<AttachmentInput>;
    Board: BoardRecord;
    BoardColumn: BoardColumnRecord;
    BoardColumnInput: Partial<BoardColumnInput>;
    BoardSettings: BoardSettingsRecord;
    BoardSettingsInput: Partial<BoardSettingsInput>;
    Boolean: Partial<Scalars['Boolean']['output']>;
    CreateBoardInput: Partial<CreateBoardInput>;
    CreateLabelInput: Partial<CreateLabelInput>;
    CreateSubTaskInput: Partial<CreateSubTaskInput>;
    CreateTaskInput: Partial<CreateTaskInput>;
    CreateTemplateInput: Partial<CreateTemplateInput>;
    CreateWebhookInput: Partial<CreateWebhookInput>;
    DateTime: Partial<Scalars['DateTime']['output']>;
    Float: Partial<Scalars['Float']['output']>;
    ID: Partial<Scalars['ID']['output']>;
    Int: Partial<Scalars['Int']['output']>;
    JSON: Partial<Scalars['JSON']['output']>;
    Label: LabelRecord;
    MarkdownMetadata: Partial<MarkdownMetadata>;
    MarkdownReport: Partial<MarkdownReport>;
    MarkdownReportInput: Partial<MarkdownReportInput>;
    Mutation: {};
    PriorityBreakdown: Partial<PriorityBreakdown>;
    Query: {};
    RecurrenceConfig: RecurrenceConfigRecord;
    RecurrenceConfigInput: Partial<RecurrenceConfigInput>;
    ScheduleConstraints: Partial<ScheduleConstraints>;
    ScheduleOptimization: Partial<Omit<ScheduleOptimization, 'optimizedTasks'> & {
        optimizedTasks: Array<ResolversParentTypes['Task']>;
    }>;
    StatusBreakdown: Partial<StatusBreakdown>;
    String: Partial<Scalars['String']['output']>;
    SubTask: SubTaskRecord;
    Subscription: {};
    SuggestedAction: Partial<SuggestedAction>;
    Task: TaskRecord;
    TaskFilters: Partial<TaskFilters>;
    TaskStatistics: Partial<TaskStatistics>;
    TaskTemplateData: TaskTemplateDataRecord;
    TaskTemplateDataInput: Partial<TaskTemplateDataInput>;
    Template: TemplateRecord;
    UpdateBoardInput: Partial<UpdateBoardInput>;
    UpdateLabelInput: Partial<UpdateLabelInput>;
    UpdateSubTaskInput: Partial<UpdateSubTaskInput>;
    UpdateTaskInput: Partial<UpdateTaskInput>;
    UpdateTemplateInput: Partial<UpdateTemplateInput>;
    UpdateWebhookInput: Partial<UpdateWebhookInput>;
    UserPreferencesInput: Partial<UserPreferencesInput>;
    Webhook: Partial<Webhook>;
    WebhookDelivery: Partial<WebhookDelivery>;
    WebhookStats: Partial<WebhookStats>;
    WorkingHoursInput: Partial<WorkingHoursInput>;
};
export type AiSuggestionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['AISuggestion'] = ResolversParentTypes['AISuggestion']> = {
    actions?: Resolver<Array<ResolversTypes['SuggestedAction']>, ParentType, ContextType>;
    confidence?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
    message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType>;
    type?: Resolver<ResolversTypes['SuggestionType'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type AttachmentResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Attachment'] = ResolversParentTypes['Attachment']> = {
    data?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    size?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    storagePath?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    uploadedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type BoardResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Board'] = ResolversParentTypes['Board']> = {
    columns?: Resolver<Array<ResolversTypes['BoardColumn']>, ParentType, ContextType>;
    completedTaskCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
    description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    isShared?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    settings?: Resolver<ResolversTypes['BoardSettings'], ParentType, ContextType>;
    taskCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type BoardColumnResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['BoardColumn'] = ResolversParentTypes['BoardColumn']> = {
    color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    taskCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type BoardSettingsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['BoardSettings'] = ResolversParentTypes['BoardSettings']> = {
    autoArchiveCompleted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    completedColumnId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
    defaultColumnId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
    recycleBinRetentionDays?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
    name: 'DateTime';
}
export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
    name: 'JSON';
}
export type LabelResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Label'] = ResolversParentTypes['Label']> = {
    boardId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
    color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    taskCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type MarkdownMetadataResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['MarkdownMetadata'] = ResolversParentTypes['MarkdownMetadata']> = {
    boardName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    completedCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    includeAttachments?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    includeLabels?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    includeSubtasks?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    taskCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type MarkdownReportResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['MarkdownReport'] = ResolversParentTypes['MarkdownReport']> = {
    content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    format?: Resolver<ResolversTypes['MarkdownFormat'], ParentType, ContextType>;
    generatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
    metadata?: Resolver<ResolversTypes['MarkdownMetadata'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
    breakdownTask?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationBreakdownTaskArgs, 'taskId'>>;
    createBoard?: Resolver<ResolversTypes['Board'], ParentType, ContextType, RequireFields<MutationCreateBoardArgs, 'input'>>;
    createLabel?: Resolver<ResolversTypes['Label'], ParentType, ContextType, RequireFields<MutationCreateLabelArgs, 'input'>>;
    createTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<MutationCreateTaskArgs, 'input'>>;
    createTaskFromNaturalLanguage?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<MutationCreateTaskFromNaturalLanguageArgs, 'query'>>;
    createTasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationCreateTasksArgs, 'inputs'>>;
    createTemplate?: Resolver<ResolversTypes['Template'], ParentType, ContextType, RequireFields<MutationCreateTemplateArgs, 'input'>>;
    createWebhook?: Resolver<ResolversTypes['Webhook'], ParentType, ContextType, RequireFields<MutationCreateWebhookArgs, 'input'>>;
    deleteBoard?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteBoardArgs, 'id'>>;
    deleteLabel?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteLabelArgs, 'id'>>;
    deleteTask?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTaskArgs, 'id'>>;
    deleteTasks?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTasksArgs, 'ids'>>;
    deleteTemplate?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteTemplateArgs, 'id'>>;
    deleteWebhook?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteWebhookArgs, 'id'>>;
    duplicateTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<MutationDuplicateTaskArgs, 'id'>>;
    generateMarkdownReport?: Resolver<ResolversTypes['MarkdownReport'], ParentType, ContextType, RequireFields<MutationGenerateMarkdownReportArgs, 'input'>>;
    moveTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<MutationMoveTaskArgs, 'id' | 'targetColumnId' | 'targetPosition'>>;
    optimizeTaskSchedule?: Resolver<ResolversTypes['ScheduleOptimization'], ParentType, ContextType, RequireFields<MutationOptimizeTaskScheduleArgs, 'boardId'>>;
    restoreTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<MutationRestoreTaskArgs, 'id'>>;
    testWebhook?: Resolver<ResolversTypes['WebhookDelivery'], ParentType, ContextType, RequireFields<MutationTestWebhookArgs, 'id'>>;
    updateBoard?: Resolver<ResolversTypes['Board'], ParentType, ContextType, RequireFields<MutationUpdateBoardArgs, 'id' | 'input'>>;
    updateLabel?: Resolver<ResolversTypes['Label'], ParentType, ContextType, RequireFields<MutationUpdateLabelArgs, 'id' | 'input'>>;
    updateTask?: Resolver<ResolversTypes['Task'], ParentType, ContextType, RequireFields<MutationUpdateTaskArgs, 'id' | 'input'>>;
    updateTasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<MutationUpdateTasksArgs, 'ids' | 'input'>>;
    updateTemplate?: Resolver<ResolversTypes['Template'], ParentType, ContextType, RequireFields<MutationUpdateTemplateArgs, 'id' | 'input'>>;
    updateWebhook?: Resolver<ResolversTypes['Webhook'], ParentType, ContextType, RequireFields<MutationUpdateWebhookArgs, 'id' | 'input'>>;
};
export type PriorityBreakdownResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['PriorityBreakdown'] = ResolversParentTypes['PriorityBreakdown']> = {
    critical?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    high?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    low?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    medium?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
    aiSuggestedTasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QueryAiSuggestedTasksArgs, 'context'>>;
    board?: Resolver<Maybe<ResolversTypes['Board']>, ParentType, ContextType, RequireFields<QueryBoardArgs, 'id'>>;
    boards?: Resolver<Array<ResolversTypes['Board']>, ParentType, ContextType>;
    currentBoard?: Resolver<Maybe<ResolversTypes['Board']>, ParentType, ContextType>;
    exportBoardAsMarkdown?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<QueryExportBoardAsMarkdownArgs, 'boardId'>>;
    exportTaskAsMarkdown?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<QueryExportTaskAsMarkdownArgs, 'taskId'>>;
    exportTasksAsMarkdown?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<QueryExportTasksAsMarkdownArgs, 'boardId'>>;
    label?: Resolver<Maybe<ResolversTypes['Label']>, ParentType, ContextType, RequireFields<QueryLabelArgs, 'id'>>;
    labels?: Resolver<Array<ResolversTypes['Label']>, ParentType, ContextType, Partial<QueryLabelsArgs>>;
    nextRecommendedTask?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QueryNextRecommendedTaskArgs, 'boardId'>>;
    searchTasksByNaturalLanguage?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QuerySearchTasksByNaturalLanguageArgs, 'query'>>;
    task?: Resolver<Maybe<ResolversTypes['Task']>, ParentType, ContextType, RequireFields<QueryTaskArgs, 'id'>>;
    taskStatistics?: Resolver<ResolversTypes['TaskStatistics'], ParentType, ContextType, Partial<QueryTaskStatisticsArgs>>;
    tasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType, Partial<QueryTasksArgs>>;
    template?: Resolver<Maybe<ResolversTypes['Template']>, ParentType, ContextType, RequireFields<QueryTemplateArgs, 'id'>>;
    templates?: Resolver<Array<ResolversTypes['Template']>, ParentType, ContextType, Partial<QueryTemplatesArgs>>;
    webhook?: Resolver<Maybe<ResolversTypes['Webhook']>, ParentType, ContextType, RequireFields<QueryWebhookArgs, 'id'>>;
    webhookDeliveries?: Resolver<Array<ResolversTypes['WebhookDelivery']>, ParentType, ContextType, RequireFields<QueryWebhookDeliveriesArgs, 'webhookId'>>;
    webhookDelivery?: Resolver<Maybe<ResolversTypes['WebhookDelivery']>, ParentType, ContextType, RequireFields<QueryWebhookDeliveryArgs, 'id'>>;
    webhookStats?: Resolver<ResolversTypes['WebhookStats'], ParentType, ContextType>;
    webhooks?: Resolver<Array<ResolversTypes['Webhook']>, ParentType, ContextType>;
};
export type RecurrenceConfigResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['RecurrenceConfig'] = ResolversParentTypes['RecurrenceConfig']> = {
    dayOfMonth?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    dayOfWeekInMonth?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    daysOfWeek?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
    enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
    interval?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    maxOccurrences?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    pattern?: Resolver<ResolversTypes['RecurrencePattern'], ParentType, ContextType>;
    weekOfMonth?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type ScheduleOptimizationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['ScheduleOptimization'] = ResolversParentTypes['ScheduleOptimization']> = {
    estimatedCompletionDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
    optimizedTasks?: Resolver<Array<ResolversTypes['Task']>, ParentType, ContextType>;
    suggestions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type StatusBreakdownResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['StatusBreakdown'] = ResolversParentTypes['StatusBreakdown']> = {
    completed?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    deleted?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    inProgress?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    todo?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type SubTaskResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SubTask'] = ResolversParentTypes['SubTask']> = {
    completed?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type SubscriptionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
    aiSuggestionAvailable?: SubscriptionResolver<ResolversTypes['AISuggestion'], 'aiSuggestionAvailable', ParentType, ContextType, RequireFields<SubscriptionAiSuggestionAvailableArgs, 'boardId'>>;
    boardUpdated?: SubscriptionResolver<ResolversTypes['Board'], 'boardUpdated', ParentType, ContextType, Partial<SubscriptionBoardUpdatedArgs>>;
    taskCompleted?: SubscriptionResolver<ResolversTypes['Task'], 'taskCompleted', ParentType, ContextType, Partial<SubscriptionTaskCompletedArgs>>;
    taskCreated?: SubscriptionResolver<ResolversTypes['Task'], 'taskCreated', ParentType, ContextType, Partial<SubscriptionTaskCreatedArgs>>;
    taskDeleted?: SubscriptionResolver<ResolversTypes['Task'], 'taskDeleted', ParentType, ContextType, Partial<SubscriptionTaskDeletedArgs>>;
    taskUpdated?: SubscriptionResolver<ResolversTypes['Task'], 'taskUpdated', ParentType, ContextType, Partial<SubscriptionTaskUpdatedArgs>>;
};
export type SuggestedActionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['SuggestedAction'] = ResolversParentTypes['SuggestedAction']> = {
    description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    parameters?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
    type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type TaskResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Task'] = ResolversParentTypes['Task']> = {
    boardId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    columnId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    completedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
    completionPercentage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
    deletedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
    description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    dueDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
    dueTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    estimatedDuration?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    files?: Resolver<Array<ResolversTypes['Attachment']>, ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    isOverdue?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    labels?: Resolver<Array<ResolversTypes['Label']>, ParentType, ContextType>;
    position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    priority?: Resolver<ResolversTypes['Priority'], ParentType, ContextType>;
    recurrence?: Resolver<Maybe<ResolversTypes['RecurrenceConfig']>, ParentType, ContextType>;
    status?: Resolver<ResolversTypes['TaskStatus'], ParentType, ContextType>;
    subtasks?: Resolver<Array<ResolversTypes['SubTask']>, ParentType, ContextType>;
    title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type TaskStatisticsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TaskStatistics'] = ResolversParentTypes['TaskStatistics']> = {
    averageCompletionTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    byPriority?: Resolver<ResolversTypes['PriorityBreakdown'], ParentType, ContextType>;
    byStatus?: Resolver<ResolversTypes['StatusBreakdown'], ParentType, ContextType>;
    completionRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
    overdueCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    total?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type TaskTemplateDataResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['TaskTemplateData'] = ResolversParentTypes['TaskTemplateData']> = {
    description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    dueDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    labels?: Resolver<Array<ResolversTypes['Label']>, ParentType, ContextType>;
    priority?: Resolver<Maybe<ResolversTypes['Priority']>, ParentType, ContextType>;
    recurrence?: Resolver<Maybe<ResolversTypes['RecurrenceConfig']>, ParentType, ContextType>;
    subtasks?: Resolver<Array<ResolversTypes['SubTask']>, ParentType, ContextType>;
    title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type TemplateResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Template'] = ResolversParentTypes['Template']> = {
    category?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    isFavorite?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    taskTemplate?: Resolver<ResolversTypes['TaskTemplateData'], ParentType, ContextType>;
    updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type WebhookResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Webhook'] = ResolversParentTypes['Webhook']> = {
    active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    allowedIPs?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
    createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
    events?: Resolver<Array<ResolversTypes['WebhookEvent']>, ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    rateLimit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    secret?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
    updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
    url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type WebhookDeliveryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WebhookDelivery'] = ResolversParentTypes['WebhookDelivery']> = {
    deliveredAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
    event?: Resolver<ResolversTypes['WebhookEvent'], ParentType, ContextType>;
    id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    payload?: Resolver<ResolversTypes['JSON'], ParentType, ContextType>;
    response?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
    status?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
    success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
    webhookId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type WebhookStatsResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['WebhookStats'] = ResolversParentTypes['WebhookStats']> = {
    activeWebhooks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    failedDeliveries?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    successRate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
    successfulDeliveries?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    totalDeliveries?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    totalWebhooks?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
    __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};
export type Resolvers<ContextType = GraphQLContext> = {
    AISuggestion?: AiSuggestionResolvers<ContextType>;
    Attachment?: AttachmentResolvers<ContextType>;
    Board?: BoardResolvers<ContextType>;
    BoardColumn?: BoardColumnResolvers<ContextType>;
    BoardSettings?: BoardSettingsResolvers<ContextType>;
    DateTime?: GraphQLScalarType;
    JSON?: GraphQLScalarType;
    Label?: LabelResolvers<ContextType>;
    MarkdownMetadata?: MarkdownMetadataResolvers<ContextType>;
    MarkdownReport?: MarkdownReportResolvers<ContextType>;
    Mutation?: MutationResolvers<ContextType>;
    PriorityBreakdown?: PriorityBreakdownResolvers<ContextType>;
    Query?: QueryResolvers<ContextType>;
    RecurrenceConfig?: RecurrenceConfigResolvers<ContextType>;
    ScheduleOptimization?: ScheduleOptimizationResolvers<ContextType>;
    StatusBreakdown?: StatusBreakdownResolvers<ContextType>;
    SubTask?: SubTaskResolvers<ContextType>;
    Subscription?: SubscriptionResolvers<ContextType>;
    SuggestedAction?: SuggestedActionResolvers<ContextType>;
    Task?: TaskResolvers<ContextType>;
    TaskStatistics?: TaskStatisticsResolvers<ContextType>;
    TaskTemplateData?: TaskTemplateDataResolvers<ContextType>;
    Template?: TemplateResolvers<ContextType>;
    Webhook?: WebhookResolvers<ContextType>;
    WebhookDelivery?: WebhookDeliveryResolvers<ContextType>;
    WebhookStats?: WebhookStatsResolvers<ContextType>;
};
//# sourceMappingURL=graphql.d.ts.map