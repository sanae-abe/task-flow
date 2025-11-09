/**
 * AI Task Recommendation Utility
 * Recommends optimal tasks based on context and user patterns
 */
import { getAIClient } from './ai-client.js';
// ============================================================================
// Main Functions
// ============================================================================
/**
 * Get recommended task with enhanced AI reasoning
 */
export async function getRecommendedTaskWithAI(tasks, userContext, options = {}) {
    const { includeReasoning = true, considerTimeOfDay = true, considerHistory = true, } = options;
    const aiClient = getAIClient();
    const recommendedTask = await aiClient.getRecommendedTask(tasks, userContext);
    if (!recommendedTask)
        return null;
    // Calculate detailed scoring
    const scoreBreakdown = calculateDetailedScore(recommendedTask, tasks, userContext, { considerTimeOfDay, considerHistory });
    const reasoning = includeReasoning
        ? generateReasoning(recommendedTask, scoreBreakdown, userContext)
        : [];
    return {
        task: recommendedTask,
        score: scoreBreakdown.totalScore,
        reasoning,
        confidence: scoreBreakdown.confidence,
    };
}
/**
 * Get multiple recommended tasks (top N)
 */
export async function getTopRecommendedTasks(tasks, userContext, options = {}) {
    const { limit = 5 } = options;
    const incompleteTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'DELETED');
    // Score all tasks
    const scoredTasks = incompleteTasks.map(task => {
        const scoreBreakdown = calculateDetailedScore(task, tasks, userContext, options);
        const reasoning = options.includeReasoning
            ? generateReasoning(task, scoreBreakdown, userContext)
            : [];
        return {
            task,
            score: scoreBreakdown.totalScore,
            reasoning,
            confidence: scoreBreakdown.confidence,
        };
    });
    // Sort by score and return top N
    return scoredTasks.sort((a, b) => b.score - a.score).slice(0, limit);
}
/**
 * Calculate detailed score with breakdown
 */
function calculateDetailedScore(task, allTasks, userContext, options) {
    const breakdown = {
        priorityScore: 0,
        urgencyScore: 0,
        timeMatchScore: 0,
        historyMatchScore: 0,
        workloadScore: 0,
        progressScore: 0, // Week 8: Initialize progress score
        totalScore: 0,
        confidence: 0.7,
    };
    // Priority scoring (0-100 points)
    const priorityScores = {
        CRITICAL: 100,
        HIGH: 70,
        MEDIUM: 40,
        LOW: 10,
    };
    breakdown.priorityScore = priorityScores[task.priority];
    // Urgency scoring based on due date (0-50 points)
    if (task.dueDate) {
        const now = userContext.currentTime;
        const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue < 0) {
            breakdown.urgencyScore = 50; // Overdue
        }
        else if (daysUntilDue === 0) {
            breakdown.urgencyScore = 45; // Due today
        }
        else if (daysUntilDue === 1) {
            breakdown.urgencyScore = 35; // Due tomorrow
        }
        else if (daysUntilDue <= 3) {
            breakdown.urgencyScore = 25; // Due soon
        }
        else if (daysUntilDue <= 7) {
            breakdown.urgencyScore = 15; // Due this week
        }
    }
    // Time-of-day matching (0-20 points)
    if (options.considerTimeOfDay) {
        breakdown.timeMatchScore = calculateTimeMatchScore(task, userContext);
    }
    // History matching (0-20 points)
    if (options.considerHistory && userContext.completionHistory) {
        breakdown.historyMatchScore = calculateHistoryMatchScore(task, userContext.completionHistory, userContext.currentTime);
    }
    // Workload balance (0-10 points)
    breakdown.workloadScore = calculateWorkloadScore(allTasks);
    // Progress score (0-15 points) - Week 8: Reward partially completed tasks
    breakdown.progressScore = calculateProgressScore(task);
    // Calculate total score
    breakdown.totalScore =
        breakdown.priorityScore +
            breakdown.urgencyScore +
            breakdown.timeMatchScore +
            breakdown.historyMatchScore +
            breakdown.workloadScore +
            breakdown.progressScore;
    // Adjust confidence based on available data
    if (userContext.completionHistory &&
        userContext.completionHistory.length > 10) {
        breakdown.confidence += 0.1; // More history = higher confidence
    }
    if (task.dueDate) {
        breakdown.confidence += 0.05; // Deadline = clearer priority
    }
    if (task.subtasks && task.subtasks.length > 0) {
        breakdown.confidence += 0.05; // Defined subtasks = clearer scope
    }
    breakdown.confidence = Math.min(0.95, breakdown.confidence);
    return breakdown;
}
/**
 * Calculate time-of-day match score
 */
function calculateTimeMatchScore(task, userContext) {
    const currentHour = userContext.currentTime.getHours();
    let score = 0;
    // Working hours preference
    if (userContext.workingHours) {
        const [startHour] = userContext.workingHours.start.split(':').map(Number);
        const [endHour] = userContext.workingHours.end.split(':').map(Number);
        if (currentHour >= startHour && currentHour <= endHour) {
            score += 10; // In working hours
        }
        else {
            score += 2; // Outside working hours, but could still work
        }
    }
    // Morning tasks (cognitive work)
    if (currentHour >= 8 && currentHour <= 12) {
        if (task.priority === 'CRITICAL' || task.priority === 'HIGH') {
            score += 5; // Morning is good for high-priority tasks
        }
    }
    // Afternoon tasks (collaborative work)
    if (currentHour >= 13 && currentHour <= 17) {
        if (task.subtasks && task.subtasks.length > 0) {
            score += 3; // Afternoon good for detailed/collaborative tasks
        }
    }
    return score;
}
/**
 * Calculate history match score based on past completion patterns
 */
function calculateHistoryMatchScore(_task, history, currentTime) {
    if (history.length === 0)
        return 0;
    const currentHour = currentTime.getHours();
    const currentDayOfWeek = currentTime.getDay();
    // Find similar completions (within 2 hours, same day of week)
    const similarCompletions = history.filter(item => {
        const hourDiff = Math.abs(item.timeOfDay - currentHour);
        const dayMatch = item.dayOfWeek === currentDayOfWeek;
        return hourDiff <= 2 || dayMatch;
    });
    if (similarCompletions.length === 0)
        return 0;
    // Calculate match score
    let score = 0;
    // Time-of-day match
    const timeMatches = similarCompletions.filter(item => Math.abs(item.timeOfDay - currentHour) <= 1);
    if (timeMatches.length > 0) {
        score += 10;
    }
    else if (similarCompletions.length > 0) {
        score += 5;
    }
    // Day-of-week match
    const dayMatches = similarCompletions.filter(item => item.dayOfWeek === currentDayOfWeek);
    if (dayMatches.length > 0) {
        score += 5;
    }
    return score;
}
/**
 * Calculate workload balance score
 * Enhanced Week 8: Smarter workload distribution analysis
 */
function calculateWorkloadScore(allTasks) {
    let score = 0;
    const incompleteTasks = allTasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'DELETED');
    // Count tasks by priority
    const criticalCount = incompleteTasks.filter(t => t.priority === 'CRITICAL').length;
    const highCount = incompleteTasks.filter(t => t.priority === 'HIGH').length;
    const mediumCount = incompleteTasks.filter(t => t.priority === 'MEDIUM').length;
    // Balance score: prefer working on high-priority tasks first
    if (criticalCount > 0) {
        score += 10; // Critical tasks exist, prioritize them
    }
    else if (highCount > 0) {
        score += 7; // High-priority tasks exist
    }
    else if (mediumCount > 0) {
        score += 5; // Medium-priority tasks exist
    }
    else {
        score += 3; // Only low-priority tasks
    }
    // Penalty for overdue tasks (should address them first)
    const now = new Date();
    const overdueCount = incompleteTasks.filter(t => t.dueDate && new Date(t.dueDate) < now).length;
    if (overdueCount > 3) {
        score -= 3; // Too many overdue tasks, reduce score
    }
    return Math.max(0, score); // Ensure non-negative
}
/**
 * Calculate progress score based on subtask completion
 * Week 8: Reward tasks that are partially completed (momentum effect)
 */
function calculateProgressScore(task) {
    if (!task.subtasks || task.subtasks.length === 0) {
        return 0; // No subtasks, no progress bonus
    }
    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    const progressPercent = completedSubtasks / totalSubtasks;
    let score = 0;
    // Reward partially completed tasks (momentum effect)
    if (progressPercent > 0 && progressPercent < 1) {
        // 25-75% completion gets highest bonus (momentum is strong)
        if (progressPercent >= 0.25 && progressPercent <= 0.75) {
            score += 15; // Maximum bonus for mid-progress tasks
        }
        else if (progressPercent < 0.25) {
            score += 8; // Some progress made
        }
        else {
            score += 12; // Almost done, finish it!
        }
    }
    // Bonus for tasks with many subtasks (better defined)
    if (totalSubtasks >= 5) {
        score += 3; // Well-structured task
    }
    return score;
}
// ============================================================================
// Reasoning Generation
// ============================================================================
/**
 * Generate human-readable reasoning for recommendation
 */
function generateReasoning(task, scoreBreakdown, userContext) {
    const reasons = [];
    // Priority reasoning
    if (scoreBreakdown.priorityScore >= 70) {
        reasons.push(`High priority task (${task.priority})`);
    }
    // Urgency reasoning
    if (task.dueDate) {
        const now = userContext.currentTime;
        const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue < 0) {
            reasons.push(`Overdue by ${Math.abs(daysUntilDue)} day(s)`);
        }
        else if (daysUntilDue === 0) {
            reasons.push('Due today');
        }
        else if (daysUntilDue === 1) {
            reasons.push('Due tomorrow');
        }
        else if (daysUntilDue <= 3) {
            reasons.push(`Due in ${daysUntilDue} days`);
        }
    }
    // Time-of-day reasoning
    if (scoreBreakdown.timeMatchScore > 10) {
        const currentHour = userContext.currentTime.getHours();
        if (currentHour >= 8 && currentHour <= 12) {
            reasons.push('Good time for focused work');
        }
        else if (currentHour >= 13 && currentHour <= 17) {
            reasons.push('Good time for collaborative tasks');
        }
    }
    // History reasoning
    if (scoreBreakdown.historyMatchScore > 5) {
        reasons.push('Matches your typical work pattern');
    }
    // Workload reasoning
    if (scoreBreakdown.workloadScore > 5) {
        reasons.push('May unblock other tasks');
    }
    // Progress reasoning - Week 8: Enhanced with momentum insights
    if (task.subtasks && task.subtasks.length > 0) {
        const completed = task.subtasks.filter(st => st.completed).length;
        const total = task.subtasks.length;
        const progressPercent = completed / total;
        if (completed > 0) {
            if (progressPercent >= 0.25 && progressPercent <= 0.75) {
                reasons.push(`Good momentum: ${completed}/${total} subtasks completed`);
            }
            else if (progressPercent > 0.75) {
                reasons.push(`Almost done: ${completed}/${total} subtasks completed`);
            }
            else {
                reasons.push(`Started: ${completed}/${total} subtasks completed`);
            }
        }
    }
    // Workload balance reasoning - Week 8: Added context
    if (scoreBreakdown.workloadScore >= 10) {
        reasons.push('High-priority work available');
    }
    return reasons;
}
/**
 * Analyze user work patterns from history
 */
export function analyzeWorkPatterns(history) {
    if (history.length === 0) {
        return {
            peakHours: [],
            productiveDays: [],
            averageDuration: 0,
        };
    }
    // Find peak hours (most completions)
    const hourCounts = new Map();
    const dayCounts = new Map();
    let totalDuration = 0;
    let durationCount = 0;
    history.forEach(item => {
        hourCounts.set(item.timeOfDay, (hourCounts.get(item.timeOfDay) || 0) + 1);
        dayCounts.set(item.dayOfWeek, (dayCounts.get(item.dayOfWeek) || 0) + 1);
        if (item.duration) {
            totalDuration += item.duration;
            durationCount++;
        }
    });
    // Get top 3 hours
    const peakHours = Array.from(hourCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => hour);
    // Get top 3 days
    const productiveDays = Array.from(dayCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([day]) => day);
    const averageDuration = durationCount > 0 ? totalDuration / durationCount : 0;
    return {
        peakHours,
        productiveDays,
        averageDuration,
    };
}
//# sourceMappingURL=ai-recommendations.js.map