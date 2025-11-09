/**
 * AI Task Breakdown Utility
 * Breaks down complex tasks into manageable subtasks
 */
import { getAIClient } from './ai-client.js';
// ============================================================================
// Main Functions
// ============================================================================
/**
 * Break down a task into subtasks using AI
 */
export async function breakdownTaskWithAI(task, options = {}) {
    const { strategy = determineOptimalStrategy(task), maxSubtasks = 7, minSubtasks = 2, } = options;
    const aiClient = getAIClient();
    const subtasks = await aiClient.breakdownTask(task, strategy);
    // Ensure subtask count is within bounds
    let filteredSubtasks = subtasks;
    if (subtasks.length > maxSubtasks) {
        filteredSubtasks = subtasks.slice(0, maxSubtasks);
    }
    else if (subtasks.length < minSubtasks && subtasks.length > 0) {
        // If too few, add generic planning/review tasks
        filteredSubtasks = [
            `Plan: ${task.title}`,
            ...subtasks,
            `Review and finalize`,
        ].slice(0, maxSubtasks);
    }
    // Calculate confidence based on strategy match and task complexity
    const confidence = calculateConfidence(task, strategy, filteredSubtasks.length);
    return {
        subtasks: filteredSubtasks,
        strategy,
        confidence,
        reasoning: generateReasoning(task, strategy, filteredSubtasks.length),
    };
}
/**
 * Determine optimal breakdown strategy for a task
 */
export function determineOptimalStrategy(task) {
    const title = task.title.toLowerCase();
    const description = (task.description || '').toLowerCase();
    const combined = `${title} ${description}`;
    // Feature-based keywords
    if (combined.includes('feature') ||
        combined.includes('functionality') ||
        combined.includes('capability')) {
        return 'BY_FEATURE';
    }
    // Phase-based keywords
    if (combined.includes('project') ||
        combined.includes('release') ||
        combined.includes('milestone') ||
        combined.includes('campaign')) {
        return 'BY_PHASE';
    }
    // Component-based keywords
    if (combined.includes('component') ||
        combined.includes('module') ||
        combined.includes('service') ||
        combined.includes('api')) {
        return 'BY_COMPONENT';
    }
    // Complexity-based (default for complex tasks)
    if (task.priority === 'CRITICAL' || task.priority === 'HIGH') {
        return 'BY_COMPLEXITY';
    }
    // Default to sequential for simple tasks
    return 'SEQUENTIAL';
}
/**
 * Calculate confidence score for the breakdown
 */
function calculateConfidence(task, strategy, subtaskCount) {
    let confidence = 0.7; // Base confidence
    // Adjust based on task detail
    if (task.description && task.description.length > 100) {
        confidence += 0.1; // More detail = higher confidence
    }
    // Adjust based on subtask count (sweet spot: 3-5)
    if (subtaskCount >= 3 && subtaskCount <= 5) {
        confidence += 0.1;
    }
    else if (subtaskCount < 2 || subtaskCount > 7) {
        confidence -= 0.1;
    }
    // Adjust based on strategy match
    const optimalStrategy = determineOptimalStrategy(task);
    if (strategy === optimalStrategy) {
        confidence += 0.1;
    }
    return Math.max(0, Math.min(1, confidence));
}
/**
 * Generate human-readable reasoning for the breakdown
 */
function generateReasoning(task, strategy, subtaskCount) {
    const strategyReasons = {
        SEQUENTIAL: 'Tasks are broken down in sequential order for step-by-step execution',
        PARALLEL: 'Tasks can be executed in parallel by multiple team members',
        HYBRID: 'Combines sequential and parallel approaches for flexibility',
        BY_FEATURE: 'Organized by distinct features or capabilities',
        BY_PHASE: 'Structured by project phases or milestones',
        BY_COMPONENT: 'Divided by system components or modules',
        BY_COMPLEXITY: 'Prioritized by complexity, tackling simple tasks first',
    };
    return `${strategyReasons[strategy]}. Generated ${subtaskCount} subtask(s) based on task priority (${task.priority}) and content analysis.`;
}
/**
 * Validate breakdown result
 */
export function validateBreakdown(result) {
    if (!result.subtasks || result.subtasks.length === 0) {
        return false;
    }
    // Check for duplicate subtasks
    const uniqueSubtasks = new Set(result.subtasks);
    if (uniqueSubtasks.size !== result.subtasks.length) {
        return false;
    }
    // Check for empty subtasks
    if (result.subtasks.some(st => !st || st.trim().length === 0)) {
        return false;
    }
    return true;
}
/**
 * Estimate effort for each subtask (in hours)
 */
export function estimateSubtaskEffort(subtask, parentTask) {
    // Base estimate: 2 hours per subtask
    let effort = 2;
    // Adjust based on parent priority
    const priorityMultipliers = {
        CRITICAL: 1.5,
        HIGH: 1.2,
        MEDIUM: 1.0,
        LOW: 0.8,
    };
    effort *= priorityMultipliers[parentTask.priority];
    // Adjust based on subtask keywords
    const subtaskLower = subtask.toLowerCase();
    if (subtaskLower.includes('research') || subtaskLower.includes('analysis')) {
        effort *= 1.3;
    }
    if (subtaskLower.includes('implement') || subtaskLower.includes('develop')) {
        effort *= 1.4;
    }
    if (subtaskLower.includes('test') || subtaskLower.includes('review')) {
        effort *= 0.8;
    }
    return Math.round(effort * 10) / 10; // Round to 1 decimal
}
//# sourceMappingURL=ai-task-breakdown.js.map