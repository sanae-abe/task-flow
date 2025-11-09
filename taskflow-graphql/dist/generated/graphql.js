export var BreakdownStrategy;
(function (BreakdownStrategy) {
    BreakdownStrategy["ByComplexity"] = "BY_COMPLEXITY";
    BreakdownStrategy["ByComponent"] = "BY_COMPONENT";
    BreakdownStrategy["ByFeature"] = "BY_FEATURE";
    BreakdownStrategy["ByPhase"] = "BY_PHASE";
})(BreakdownStrategy || (BreakdownStrategy = {}));
export var MarkdownFormat;
(function (MarkdownFormat) {
    MarkdownFormat["GithubFlavored"] = "GITHUB_FLAVORED";
    MarkdownFormat["Obsidian"] = "OBSIDIAN";
    MarkdownFormat["Standard"] = "STANDARD";
})(MarkdownFormat || (MarkdownFormat = {}));
export var Priority;
(function (Priority) {
    Priority["Critical"] = "CRITICAL";
    Priority["High"] = "HIGH";
    Priority["Low"] = "LOW";
    Priority["Medium"] = "MEDIUM";
})(Priority || (Priority = {}));
export var RecurrencePattern;
(function (RecurrencePattern) {
    RecurrencePattern["Daily"] = "DAILY";
    RecurrencePattern["Monthly"] = "MONTHLY";
    RecurrencePattern["Weekly"] = "WEEKLY";
    RecurrencePattern["Yearly"] = "YEARLY";
})(RecurrencePattern || (RecurrencePattern = {}));
export var SuggestionType;
(function (SuggestionType) {
    SuggestionType["BreakdownRecommended"] = "BREAKDOWN_RECOMMENDED";
    SuggestionType["DeadlineAlert"] = "DEADLINE_ALERT";
    SuggestionType["NextTask"] = "NEXT_TASK";
    SuggestionType["PriorityAdjustment"] = "PRIORITY_ADJUSTMENT";
    SuggestionType["RelatedTasks"] = "RELATED_TASKS";
})(SuggestionType || (SuggestionType = {}));
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["Completed"] = "COMPLETED";
    TaskStatus["Deleted"] = "DELETED";
    TaskStatus["InProgress"] = "IN_PROGRESS";
    TaskStatus["Todo"] = "TODO";
})(TaskStatus || (TaskStatus = {}));
export var WebhookEvent;
(function (WebhookEvent) {
    WebhookEvent["BoardCreated"] = "BOARD_CREATED";
    WebhookEvent["BoardDeleted"] = "BOARD_DELETED";
    WebhookEvent["BoardUpdated"] = "BOARD_UPDATED";
    WebhookEvent["TaskCompleted"] = "TASK_COMPLETED";
    WebhookEvent["TaskCreated"] = "TASK_CREATED";
    WebhookEvent["TaskDeleted"] = "TASK_DELETED";
    WebhookEvent["TaskUpdated"] = "TASK_UPDATED";
})(WebhookEvent || (WebhookEvent = {}));
//# sourceMappingURL=graphql.js.map