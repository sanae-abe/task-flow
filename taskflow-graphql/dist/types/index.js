/**
 * TypeScript type definitions for GraphQL schema
 * These types mirror the GraphQL schema definitions
 */
// ============================================================================
// Enums
// ============================================================================
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "TODO";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["DELETED"] = "DELETED";
})(TaskStatus || (TaskStatus = {}));
export var Priority;
(function (Priority) {
    Priority["CRITICAL"] = "CRITICAL";
    Priority["HIGH"] = "HIGH";
    Priority["MEDIUM"] = "MEDIUM";
    Priority["LOW"] = "LOW";
})(Priority || (Priority = {}));
export var RecurrencePattern;
(function (RecurrencePattern) {
    RecurrencePattern["DAILY"] = "DAILY";
    RecurrencePattern["WEEKLY"] = "WEEKLY";
    RecurrencePattern["MONTHLY"] = "MONTHLY";
    RecurrencePattern["YEARLY"] = "YEARLY";
})(RecurrencePattern || (RecurrencePattern = {}));
export var BreakdownStrategy;
(function (BreakdownStrategy) {
    BreakdownStrategy["BY_FEATURE"] = "BY_FEATURE";
    BreakdownStrategy["BY_PHASE"] = "BY_PHASE";
    BreakdownStrategy["BY_COMPONENT"] = "BY_COMPONENT";
    BreakdownStrategy["BY_COMPLEXITY"] = "BY_COMPLEXITY";
    BreakdownStrategy["SEQUENTIAL"] = "SEQUENTIAL";
    BreakdownStrategy["PARALLEL"] = "PARALLEL";
    BreakdownStrategy["HYBRID"] = "HYBRID";
})(BreakdownStrategy || (BreakdownStrategy = {}));
export var SuggestionType;
(function (SuggestionType) {
    SuggestionType["BREAKDOWN_RECOMMENDED"] = "BREAKDOWN_RECOMMENDED";
    SuggestionType["PRIORITY_ADJUSTMENT"] = "PRIORITY_ADJUSTMENT";
    SuggestionType["RELATED_TASKS"] = "RELATED_TASKS";
    SuggestionType["NEXT_TASK"] = "NEXT_TASK";
    SuggestionType["DEADLINE_ALERT"] = "DEADLINE_ALERT";
})(SuggestionType || (SuggestionType = {}));
//# sourceMappingURL=index.js.map