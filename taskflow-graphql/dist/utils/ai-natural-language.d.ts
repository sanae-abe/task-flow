/**
 * AI Natural Language Processing Utility
 * Parses natural language queries into structured task data
 */
import type { AIContext, ParsedTask } from './ai-client.js';
import type { CreateTaskInput } from '../generated/graphql.js';
export interface ParseOptions {
    defaultBoardId?: string;
    defaultColumnId?: string;
    context?: AIContext;
    includeSubtasks?: boolean;
}
export interface ParseResult extends ParsedTask {
    confidence: number;
    extractedEntities: ExtractedEntity[];
}
export interface ExtractedEntity {
    type: 'date' | 'time' | 'priority' | 'label' | 'action' | 'duration';
    value: string;
    position: number;
}
/**
 * Parse natural language query into structured task
 */
export declare function parseNaturalLanguageToTask(query: string, options?: ParseOptions): Promise<ParseResult>;
/**
 * Convert ParsedTask to CreateTaskInput
 */
export declare function convertToCreateTaskInput(parsed: ParsedTask, options: ParseOptions): CreateTaskInput;
/**
 * Extract entities from natural language query
 */
export declare function extractEntities(query: string): ExtractedEntity[];
/**
 * Suggest task labels based on content
 */
export declare function suggestLabels(query: string): string[];
/**
 * Extract action items from description
 */
export declare function extractActionItems(description: string): string[];
/**
 * Normalize date from various formats
 * Week 8: Enhanced with more relative date patterns
 */
export declare function normalizeDate(dateStr: string): Date | null;
/**
 * Extract and estimate task duration in minutes
 * Week 8: New function for duration estimation
 */
export declare function estimateDuration(query: string): number | null;
//# sourceMappingURL=ai-natural-language.d.ts.map