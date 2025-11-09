/**
 * TypeScript type definitions for GraphQL schema
 * These types mirror the GraphQL schema definitions
 */
export declare enum TaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    DELETED = "DELETED"
}
export declare enum Priority {
    CRITICAL = "CRITICAL",
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export declare enum RecurrencePattern {
    DAILY = "DAILY",
    WEEKLY = "WEEKLY",
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY"
}
export declare enum BreakdownStrategy {
    BY_FEATURE = "BY_FEATURE",
    BY_PHASE = "BY_PHASE",
    BY_COMPONENT = "BY_COMPONENT",
    BY_COMPLEXITY = "BY_COMPLEXITY",
    SEQUENTIAL = "SEQUENTIAL",
    PARALLEL = "PARALLEL",
    HYBRID = "HYBRID"
}
export type { BreakdownStrategy as AIBreakdownStrategy } from '../utils/ai-client.js';
export declare enum SuggestionType {
    BREAKDOWN_RECOMMENDED = "BREAKDOWN_RECOMMENDED",
    PRIORITY_ADJUSTMENT = "PRIORITY_ADJUSTMENT",
    RELATED_TASKS = "RELATED_TASKS",
    NEXT_TASK = "NEXT_TASK",
    DEADLINE_ALERT = "DEADLINE_ALERT"
}
export interface Task {
    id: string;
    boardId: string;
    columnId: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: Priority;
    dueDate?: Date;
    dueTime?: string;
    labels: Label[];
    subtasks: SubTask[];
    files: Attachment[];
    recurrence?: RecurrenceConfig;
    position: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    deletedAt?: Date;
    isOverdue: boolean;
    completionPercentage: number;
    estimatedDuration?: number;
}
export interface SubTask {
    id: string;
    title: string;
    completed: boolean;
    position: number;
    createdAt: Date;
}
export interface Label {
    id: string;
    name: string;
    color: string;
    boardId?: string;
    taskCount: number;
    createdAt: Date;
}
export interface Attachment {
    id: string;
    name: string;
    type: string;
    size: number;
    data: string;
    storagePath?: string;
    uploadedAt: Date;
}
export interface Board {
    id: string;
    name: string;
    description?: string;
    columns: BoardColumn[];
    settings: BoardSettings;
    isShared: boolean;
    taskCount: number;
    completedTaskCount: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface BoardColumn {
    id: string;
    title: string;
    color?: string;
    position: number;
    taskCount: number;
}
export interface BoardSettings {
    defaultColumnId?: string;
    completedColumnId?: string;
    autoArchiveCompleted: boolean;
    recycleBinRetentionDays: number;
}
export interface RecurrenceConfig {
    enabled: boolean;
    pattern: RecurrencePattern;
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    weekOfMonth?: number;
    dayOfWeekInMonth?: number;
    endDate?: Date;
    maxOccurrences?: number;
}
export interface Template {
    id: string;
    name: string;
    category?: string;
    taskTemplate: TaskTemplateData;
    isFavorite: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface TaskTemplateData {
    title: string;
    description?: string;
    priority?: Priority;
    labels: Label[];
    dueDate?: string;
    recurrence?: RecurrenceConfig;
    subtasks: SubTask[];
}
export type WebhookEvent = 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_DELETED' | 'BOARD_CREATED' | 'BOARD_UPDATED' | 'BOARD_DELETED';
export interface Webhook {
    id: string;
    url: string;
    events: WebhookEvent[];
    active: boolean;
    secret?: string;
    allowedIPs?: string[];
    rateLimit?: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface WebhookDelivery {
    id: string;
    webhookId: string;
    event: WebhookEvent;
    payload: Record<string, unknown>;
    response?: Record<string, unknown>;
    status?: number;
    success: boolean;
    deliveredAt: Date;
}
export interface WebhookDeliveryResult {
    success: boolean;
    timestamp: Date;
    statusCode: number;
    response: Record<string, unknown>;
    responseTime: number;
}
export interface TaskStatistics {
    total: number;
    byStatus: StatusBreakdown;
    byPriority: PriorityBreakdown;
    completionRate: number;
    averageCompletionTime?: number;
    overdueCount: number;
}
export interface StatusBreakdown {
    todo: number;
    inProgress: number;
    completed: number;
    deleted: number;
}
export interface PriorityBreakdown {
    critical: number;
    high: number;
    medium: number;
    low: number;
}
export interface ScheduleOptimization {
    optimizedTasks: Task[];
    estimatedCompletionDate: Date;
    suggestions: string[];
}
export interface OptimizationResult {
    schedule: ScheduledTask[];
    totalHoursRequired: number;
    estimatedCompletionDate: Date;
    suggestions: string[];
}
export interface ScheduledTask {
    task: Task;
    scheduledDate: Date;
    estimatedHours: number;
}
export interface AISuggestion {
    type: SuggestionType;
    task?: Task;
    message: string;
    confidence: number;
    actions: SuggestedAction[];
}
export interface SuggestedAction {
    type: string;
    description: string;
    parameters?: Record<string, unknown>;
}
export interface TaskRecommendation {
    task: Task;
    reason: string;
    priority: Priority;
    estimatedHours?: number;
    dueDate?: Date;
    dependencies?: string[];
}
export interface ExtractedEntity {
    type: string;
    value: string;
    confidence: number;
}
export interface CreateTaskInput {
    boardId: string;
    columnId: string;
    title: string;
    description?: string;
    priority?: Priority;
    dueDate?: Date;
    dueTime?: string;
    labels?: string[];
    subtasks?: CreateSubTaskInput[];
    files?: AttachmentInput[];
    recurrence?: RecurrenceConfigInput;
}
export interface UpdateTaskInput {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: Priority;
    dueDate?: Date;
    dueTime?: string;
    labels?: string[];
    subtasks?: UpdateSubTaskInput[];
    files?: AttachmentInput[];
    recurrence?: RecurrenceConfigInput;
}
export interface CreateSubTaskInput {
    title: string;
    position?: number;
}
export interface UpdateSubTaskInput {
    id: string;
    title?: string;
    completed?: boolean;
    position?: number;
}
export interface AttachmentInput {
    name: string;
    type: string;
    size: number;
    data: string;
}
export interface RecurrenceConfigInput {
    enabled: boolean;
    pattern: RecurrencePattern;
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    weekOfMonth?: number;
    dayOfWeekInMonth?: number;
    endDate?: Date;
    maxOccurrences?: number;
}
export interface CreateBoardInput {
    name: string;
    description?: string;
    columns?: BoardColumnInput[];
}
export interface UpdateBoardInput {
    name?: string;
    description?: string;
    columns?: BoardColumnInput[];
    settings?: BoardSettingsInput;
}
export interface BoardColumnInput {
    id?: string;
    title: string;
    color?: string;
    position: number;
}
export interface BoardSettingsInput {
    defaultColumnId?: string;
    completedColumnId?: string;
    autoArchiveCompleted?: boolean;
    recycleBinRetentionDays?: number;
}
export interface CreateLabelInput {
    name: string;
    color: string;
    boardId?: string;
}
export interface UpdateLabelInput {
    name?: string;
    color?: string;
}
export interface CreateTemplateInput {
    name: string;
    category?: string;
    taskTemplate: TaskTemplateDataInput;
    isFavorite?: boolean;
}
export interface UpdateTemplateInput {
    name?: string;
    category?: string;
    taskTemplate?: TaskTemplateDataInput;
    isFavorite?: boolean;
}
export interface TaskTemplateDataInput {
    title: string;
    description?: string;
    priority?: Priority;
    labels: string[];
    dueDate?: string;
    recurrence?: RecurrenceConfigInput;
    subtasks?: CreateSubTaskInput[];
}
export interface AIContextInput {
    boardId?: string;
    recentActivity?: string[];
    preferences?: UserPreferencesInput;
}
export interface UserPreferencesInput {
    workingHours?: WorkingHoursInput;
    preferredPriority?: Priority;
    autoBreakdownEnabled?: boolean;
}
export interface WorkingHoursInput {
    start: string;
    end: string;
}
export interface ScheduleConstraints {
    workingHoursPerDay?: number;
    deadline?: Date;
    prioritizeBy?: Priority;
}
/**
 * GraphQL Context (re-exported from context.ts)
 */
export { GraphQLContext } from '../context.js';
//# sourceMappingURL=index.d.ts.map