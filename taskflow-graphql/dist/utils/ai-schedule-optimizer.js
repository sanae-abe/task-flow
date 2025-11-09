/**
 * AI Schedule Optimization Utility
 * Optimizes task schedules based on constraints and priorities
 */
import { getAIClient } from './ai-client.js';
// ============================================================================
// Main Functions
// ============================================================================
/**
 * Optimize task schedule using AI
 */
export async function optimizeScheduleWithAI(tasks, options = {}) {
    const { constraints = {
        workingHoursPerDay: 8,
        prioritizeBy: 'CRITICAL',
    }, considerDependencies = false, balanceWorkload = true, } = options;
    const aiClient = getAIClient();
    const baseResult = await aiClient.optimizeSchedule(tasks, constraints);
    // Apply additional optimizations if requested
    let optimizedTasks = baseResult.optimizedTasks;
    if (considerDependencies) {
        optimizedTasks = applyDependencyOrdering(optimizedTasks);
    }
    if (balanceWorkload) {
        optimizedTasks = balanceWorkloadDistribution(optimizedTasks, constraints.workingHoursPerDay || 8);
    }
    // Recalculate suggestions
    const enhancedSuggestions = [
        ...baseResult.suggestions,
        ...generateOptimizationSuggestions(optimizedTasks, constraints),
    ];
    return {
        ...baseResult,
        optimizedTasks,
        suggestions: enhancedSuggestions,
    };
}
/**
 * Apply dependency-based ordering to tasks
 */
function applyDependencyOrdering(tasks) {
    // For now, simple implementation without explicit dependency tracking
    // In future, could parse task descriptions for dependency keywords
    // Group by priority, then sort by due date within each priority
    const grouped = groupTasksByPriority(tasks);
    return [
        ...grouped.critical,
        ...grouped.high,
        ...grouped.medium,
        ...grouped.low,
    ];
}
/**
 * Balance workload distribution across time
 */
function balanceWorkloadDistribution(tasks, _workingHoursPerDay) {
    // Estimate effort for each task
    const tasksWithEffort = tasks.map(task => ({
        task,
        effort: estimateTaskEffort(task),
    }));
    // Sort by priority first, then try to balance daily workload
    const priorityOrder = {
        CRITICAL: 0,
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
    };
    tasksWithEffort.sort((a, b) => {
        const priorityDiff = priorityOrder[a.task.priority] - priorityOrder[b.task.priority];
        if (priorityDiff !== 0)
            return priorityDiff;
        // Within same priority, prefer tasks with earlier due dates
        if (a.task.dueDate && b.task.dueDate) {
            return (new Date(a.task.dueDate).getTime() - new Date(b.task.dueDate).getTime());
        }
        if (a.task.dueDate)
            return -1;
        if (b.task.dueDate)
            return 1;
        return 0;
    });
    return tasksWithEffort.map(t => t.task);
}
/**
 * Group tasks by priority
 */
function groupTasksByPriority(tasks) {
    return tasks.reduce((acc, task) => {
        const priority = task.priority.toLowerCase();
        acc[priority].push(task);
        return acc;
    }, {
        critical: [],
        high: [],
        medium: [],
        low: [],
    });
}
/**
 * Estimate effort for a task (in hours)
 */
export function estimateTaskEffort(task) {
    let baseEffort = 4; // Default 4 hours
    // Adjust based on priority
    const priorityMultipliers = {
        CRITICAL: 1.5,
        HIGH: 1.2,
        MEDIUM: 1.0,
        LOW: 0.8,
    };
    baseEffort *= priorityMultipliers[task.priority];
    // Adjust based on subtasks
    if (task.subtasks && task.subtasks.length > 0) {
        baseEffort += task.subtasks.length * 0.5;
    }
    // Adjust based on description length (proxy for complexity)
    if (task.description) {
        if (task.description.length > 200) {
            baseEffort *= 1.3;
        }
        else if (task.description.length > 100) {
            baseEffort *= 1.1;
        }
    }
    return Math.round(baseEffort * 10) / 10;
}
/**
 * Generate optimization suggestions
 */
function generateOptimizationSuggestions(tasks, constraints) {
    const suggestions = [];
    const now = new Date();
    // Check for overdue tasks
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'COMPLETED');
    if (overdueTasks.length > 0) {
        suggestions.push(`${overdueTasks.length} task(s) are overdue. Consider rescheduling or delegating.`);
    }
    // Check for deadline conflicts
    if (constraints.deadline) {
        const totalEffort = tasks.reduce((sum, t) => sum + estimateTaskEffort(t), 0);
        const availableHours = Math.ceil((constraints.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) * (constraints.workingHoursPerDay || 8);
        if (totalEffort > availableHours) {
            suggestions.push(`Estimated ${totalEffort}h exceeds available ${availableHours}h. Consider extending deadline or reducing scope.`);
        }
    }
    // Check for priority imbalance
    const grouped = groupTasksByPriority(tasks);
    if (grouped.critical.length > 10) {
        suggestions.push(`High number of critical tasks (${grouped.critical.length}). Consider re-evaluating priorities.`);
    }
    // Check for missing due dates
    const missingDueDates = tasks.filter(t => !t.dueDate && t.status !== 'COMPLETED');
    if (missingDueDates.length > 5) {
        suggestions.push(`${missingDueDates.length} task(s) without due dates. Adding deadlines can improve planning.`);
    }
    return suggestions;
}
/**
 * Calculate workload distribution over time
 */
export function calculateWorkloadDistribution(tasks, startDate = new Date(), days = 7) {
    const distribution = [];
    for (let i = 0; i < days; i++) {
        const day = new Date(startDate);
        day.setDate(day.getDate() + i);
        day.setHours(0, 0, 0, 0);
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);
        // Find tasks due on this day
        const tasksForDay = tasks.filter(t => {
            if (!t.dueDate || t.status === 'COMPLETED')
                return false;
            const dueDate = new Date(t.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === day.getTime();
        });
        const totalEffort = tasksForDay.reduce((sum, t) => sum + estimateTaskEffort(t), 0);
        distribution.push({
            day,
            taskCount: tasksForDay.length,
            totalEffort,
            tasks: tasksForDay.map(t => t.id),
        });
    }
    return distribution;
}
/**
 * Find optimal task order considering dependencies
 */
export function findOptimalTaskOrder(tasks, dependencies) {
    // Build dependency graph
    const dependencyMap = new Map();
    dependencies.forEach(dep => {
        dependencyMap.set(dep.taskId, dep.dependsOn);
    });
    // Topological sort for dependency ordering
    const visited = new Set();
    const result = [];
    function visit(taskId) {
        if (visited.has(taskId))
            return;
        visited.add(taskId);
        const deps = dependencyMap.get(taskId) || [];
        deps.forEach(depId => visit(depId));
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            result.push(task);
        }
    }
    // Visit all tasks
    tasks.forEach(task => visit(task.id));
    return result;
}
/**
 * Identify scheduling conflicts
 */
export function identifyConflicts(tasks) {
    const conflicts = {
        overlappingDeadlines: [],
        overloadedDays: [],
    };
    // Group tasks by due date
    const tasksByDate = new Map();
    tasks.forEach(task => {
        if (task.dueDate) {
            const dateKey = new Date(task.dueDate).setHours(0, 0, 0, 0);
            const existing = tasksByDate.get(dateKey) || [];
            tasksByDate.set(dateKey, [...existing, task]);
        }
    });
    // Check for overloaded days (more than 8 hours of work)
    tasksByDate.forEach((tasksOnDate, dateKey) => {
        const totalEffort = tasksOnDate.reduce((sum, t) => sum + estimateTaskEffort(t), 0);
        if (totalEffort > 8) {
            conflicts.overloadedDays.push(new Date(dateKey));
        }
        // Check for multiple high-priority tasks on same day
        const highPriorityTasks = tasksOnDate.filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH');
        if (highPriorityTasks.length > 1) {
            conflicts.overlappingDeadlines.push(highPriorityTasks);
        }
    });
    return conflicts;
}
//# sourceMappingURL=ai-schedule-optimizer.js.map