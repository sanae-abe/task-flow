/**
 * AI Client Abstraction Layer
 * Provides unified interface for AI operations with fallback implementations
 */
import OpenAI from 'openai';
// ============================================================================
// Environment Configuration
// ============================================================================
const AI_ENABLED = process.env.AI_API_ENABLED === 'true';
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini';
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // openai, anthropic, etc.
// ============================================================================
// Fallback AI Client (Rule-based)
// ============================================================================
class FallbackAIClient {
    /**
     * Simple rule-based task breakdown
     */
    async breakdownTask(task, strategy) {
        const subtasks = [];
        const title = task.title.toLowerCase();
        // Strategy-based breakdown patterns
        if (strategy === 'SEQUENTIAL' || strategy === 'BY_PHASE') {
            // Phase-based breakdown
            if (title.includes('develop') ||
                title.includes('build') ||
                title.includes('create')) {
                subtasks.push(`Plan and design ${task.title}`);
                subtasks.push(`Implement core functionality`);
                subtasks.push(`Add tests and documentation`);
                subtasks.push(`Review and refine`);
            }
            else if (title.includes('research') || title.includes('investigate')) {
                subtasks.push(`Gather requirements and resources`);
                subtasks.push(`Conduct research and analysis`);
                subtasks.push(`Document findings`);
            }
            else {
                // Generic breakdown
                subtasks.push(`Prepare for: ${task.title}`);
                subtasks.push(`Execute main work`);
                subtasks.push(`Review and finalize`);
            }
        }
        else if (strategy === 'PARALLEL' || strategy === 'BY_COMPONENT') {
            // Component-based breakdown
            if (title.includes('ui') || title.includes('interface')) {
                subtasks.push('Design UI components');
                subtasks.push('Implement layout');
                subtasks.push('Add interactivity');
            }
            else if (title.includes('api') || title.includes('backend')) {
                subtasks.push('Design API endpoints');
                subtasks.push('Implement database layer');
                subtasks.push('Add validation and security');
            }
            else {
                subtasks.push(`Component A: ${task.title}`);
                subtasks.push(`Component B: ${task.title}`);
                subtasks.push(`Integration and testing`);
            }
        }
        else if (strategy === 'BY_COMPLEXITY') {
            // Complexity-based breakdown
            const estimatedComplexity = this.estimateComplexity(task);
            if (estimatedComplexity > 7) {
                subtasks.push('Break down requirements');
                subtasks.push('Implement simple parts first');
                subtasks.push('Tackle complex parts');
                subtasks.push('Integration and testing');
            }
            else {
                subtasks.push(`Quick implementation`);
                subtasks.push(`Basic testing`);
            }
        }
        else {
            // Default hybrid approach
            subtasks.push(`Analysis: ${task.title}`);
            subtasks.push(`Implementation`);
            subtasks.push(`Testing and validation`);
        }
        return subtasks;
    }
    /**
     * Parse natural language using keyword matching
     */
    async parseNaturalLanguage(query, context) {
        const queryLower = query.toLowerCase();
        const result = {
            title: query,
        };
        // Extract priority
        if (queryLower.includes('urgent') ||
            queryLower.includes('critical') ||
            queryLower.includes('asap')) {
            result.priority = 'CRITICAL';
        }
        else if (queryLower.includes('important') ||
            queryLower.includes('high priority')) {
            result.priority = 'HIGH';
        }
        else if (queryLower.includes('low priority') ||
            queryLower.includes('whenever')) {
            result.priority = 'LOW';
        }
        else {
            result.priority = context?.preferences?.preferredPriority || 'MEDIUM';
        }
        // Extract time references
        const now = new Date();
        if (queryLower.includes('today')) {
            result.dueDate = now;
            result.dueTime = '23:59';
        }
        else if (queryLower.includes('tomorrow')) {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            result.dueDate = tomorrow;
            result.dueTime = '23:59';
        }
        else if (queryLower.includes('next week')) {
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            result.dueDate = nextWeek;
        }
        else if (queryLower.includes('end of month')) {
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            result.dueDate = endOfMonth;
        }
        // Extract keywords as potential subtasks or description
        const actionKeywords = [
            'create',
            'build',
            'develop',
            'design',
            'implement',
            'write',
            'review',
        ];
        const foundActions = actionKeywords.filter(keyword => queryLower.includes(keyword));
        if (foundActions.length > 1) {
            result.subtasks = foundActions.map(action => `${action.charAt(0).toUpperCase() + action.slice(1)} related work`);
        }
        // Clean up title (remove time references)
        result.title = query
            .replace(/\b(today|tomorrow|next week|end of month|urgent|critical|asap|important|high priority|low priority|whenever)\b/gi, '')
            .trim();
        return result;
    }
    /**
     * Simple priority and deadline-based optimization
     */
    async optimizeSchedule(tasks, constraints) {
        const workingHoursPerDay = constraints.workingHoursPerDay || 8;
        const priorityOrder = {
            CRITICAL: 0,
            HIGH: 1,
            MEDIUM: 2,
            LOW: 3,
        };
        // Sort by priority first, then by due date
        const optimizedTasks = [...tasks]
            .filter(t => t.status !== 'COMPLETED' && t.status !== 'DELETED')
            .sort((a, b) => {
            // Priority comparison
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0)
                return priorityDiff;
            // Due date comparison
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            if (a.dueDate)
                return -1;
            if (b.dueDate)
                return 1;
            return 0;
        });
        // Estimate completion date (rough calculation)
        const estimatedDays = Math.ceil(optimizedTasks.length / workingHoursPerDay);
        const estimatedCompletionDate = new Date();
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + estimatedDays);
        // Generate suggestions
        const suggestions = [];
        const criticalTasks = optimizedTasks.filter(t => t.priority === 'CRITICAL');
        const overdueTasks = optimizedTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date());
        if (criticalTasks.length > 0) {
            suggestions.push(`Focus on ${criticalTasks.length} critical task(s) first`);
        }
        if (overdueTasks.length > 0) {
            suggestions.push(`Address ${overdueTasks.length} overdue task(s) immediately`);
        }
        if (constraints.deadline &&
            estimatedCompletionDate > constraints.deadline) {
            suggestions.push('Consider increasing team size or working hours to meet deadline');
        }
        return {
            optimizedTasks,
            estimatedCompletionDate,
            suggestions,
        };
    }
    /**
     * Recommend next task based on time, priority, and history
     */
    async getRecommendedTask(tasks, userContext) {
        const incompleteTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'DELETED');
        if (incompleteTasks.length === 0)
            return null;
        const now = userContext.currentTime;
        const currentHour = now.getHours();
        // const currentDayOfWeek = now.getDay();
        // Score each task
        const scoredTasks = incompleteTasks.map(task => {
            let score = 0;
            // Priority scoring (highest weight)
            const priorityScores = { CRITICAL: 100, HIGH: 70, MEDIUM: 40, LOW: 10 };
            score += priorityScores[task.priority];
            // Due date urgency
            if (task.dueDate) {
                const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24));
                if (daysUntilDue < 0) {
                    score += 50; // Overdue - high boost
                }
                else if (daysUntilDue === 0) {
                    score += 40; // Due today
                }
                else if (daysUntilDue <= 2) {
                    score += 30; // Due soon
                }
            }
            // Time-of-day and completion history matching
            if (userContext.completionHistory &&
                userContext.completionHistory.length > 0) {
                const similarCompletions = userContext.completionHistory.filter(h => Math.abs(h.timeOfDay - currentHour) <= 2 // Within 2 hours
                );
                if (similarCompletions.length > 0) {
                    score += 10; // Small boost for time-matching
                }
            }
            // Working hours preference
            if (userContext.workingHours) {
                const [startHour] = userContext.workingHours.start
                    .split(':')
                    .map(Number);
                const [endHour] = userContext.workingHours.end.split(':').map(Number);
                if (currentHour >= startHour && currentHour <= endHour) {
                    score += 5; // Small boost for being in working hours
                }
            }
            return { task, score };
        });
        // Return highest scored task
        scoredTasks.sort((a, b) => b.score - a.score);
        return scoredTasks[0]?.task || null;
    }
    /**
     * Estimate task complexity (1-10 scale)
     */
    estimateComplexity(task) {
        let complexity = 5; // Base complexity
        // More subtasks = higher complexity
        if (task.subtasks.length > 5)
            complexity += 2;
        else if (task.subtasks.length > 2)
            complexity += 1;
        // Priority suggests complexity
        if (task.priority === 'CRITICAL')
            complexity += 1;
        // Description length suggests detail/complexity
        if (task.description && task.description.length > 200)
            complexity += 1;
        return Math.min(complexity, 10);
    }
}
// ============================================================================
// OpenAI Client (Production Implementation - Week 8)
// ============================================================================
class OpenAIClient {
    openai;
    model;
    constructor(apiKey, model = 'gpt-4o-mini') {
        this.openai = new OpenAI({ apiKey });
        this.model = model;
    }
    /**
     * Break down a task using OpenAI
     */
    async breakdownTask(task, strategy) {
        try {
            const prompt = `You are a task breakdown expert. Break down the following task into actionable subtasks using the ${strategy} strategy.

Task Title: ${task.title}
Description: ${task.description || 'No description provided'}
Priority: ${task.priority}
Strategy: ${strategy}

Strategy Guidelines:
- SEQUENTIAL/BY_PHASE: Break into sequential phases (plan → implement → test → review)
- PARALLEL/BY_COMPONENT: Break into independent components that can be done simultaneously
- BY_FEATURE: Break into distinct features or user stories
- BY_COMPLEXITY: Break from simple to complex tasks
- HYBRID: Mix of sequential and parallel approaches

Return ONLY a JSON array of subtask titles (strings), nothing else.
Example: ["Subtask 1", "Subtask 2", "Subtask 3"]`;
            const completion = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 500,
            });
            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from OpenAI');
            }
            // Parse JSON response
            const subtasks = JSON.parse(content);
            return Array.isArray(subtasks) ? subtasks : [];
        }
        catch (error) {
            console.error('OpenAI breakdownTask error:', error);
            // Fallback to rule-based approach
            const fallback = new FallbackAIClient();
            return fallback.breakdownTask(task, strategy);
        }
    }
    /**
     * Parse natural language using OpenAI
     */
    async parseNaturalLanguage(query, context) {
        try {
            const prompt = `You are a task parser. Parse the following natural language query into structured task data.

Query: "${query}"

Extract:
1. Task title (clean, concise)
2. Priority (CRITICAL, HIGH, MEDIUM, or LOW)
3. Due date (if mentioned - return ISO format date)
4. Due time (if mentioned - HH:mm format)
5. Description (if additional context provided)
6. Subtasks (if multiple actions mentioned)
7. Labels (if categories/tags mentioned)

Return ONLY a JSON object with this structure:
{
  "title": "string",
  "description": "string" (optional),
  "priority": "CRITICAL|HIGH|MEDIUM|LOW",
  "dueDate": "ISO date string" (optional),
  "dueTime": "HH:mm" (optional),
  "labels": ["string"] (optional),
  "subtasks": ["string"] (optional)
}`;
            const completion = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
                max_tokens: 400,
            });
            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from OpenAI');
            }
            // Parse JSON response
            const parsed = JSON.parse(content);
            // Convert dueDate string to Date if present
            if (parsed.dueDate && typeof parsed.dueDate === 'string') {
                parsed.dueDate = new Date(parsed.dueDate);
            }
            return parsed;
        }
        catch (error) {
            console.error('OpenAI parseNaturalLanguage error:', error);
            // Fallback to rule-based approach
            const fallback = new FallbackAIClient();
            return fallback.parseNaturalLanguage(query, context);
        }
    }
    /**
     * Optimize schedule using OpenAI
     */
    async optimizeSchedule(tasks, constraints) {
        try {
            const taskSummaries = tasks
                .filter(t => t.status !== 'COMPLETED' && t.status !== 'DELETED')
                .map(t => ({
                id: t.id,
                title: t.title,
                priority: t.priority,
                dueDate: t.dueDate,
                subtasks: t.subtasks.length,
            }));
            const prompt = `You are a task scheduling optimizer. Optimize the following task schedule.

Tasks: ${JSON.stringify(taskSummaries, null, 2)}

Constraints:
- Working hours per day: ${constraints.workingHoursPerDay || 8}
- Team size: ${constraints.teamSize || 1}
- Deadline: ${constraints.deadline?.toISOString() || 'Not specified'}
- Prioritize by: ${constraints.prioritizeBy || 'Priority and due date'}

Provide:
1. Optimized task order (IDs)
2. Estimated completion date
3. Optimization suggestions (3-5 actionable tips)

Return ONLY a JSON object:
{
  "optimizedTaskIds": ["id1", "id2", ...],
  "estimatedCompletionDate": "ISO date string",
  "suggestions": ["suggestion 1", "suggestion 2", ...]
}`;
            const completion = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.6,
                max_tokens: 600,
            });
            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from OpenAI');
            }
            const result = JSON.parse(content);
            // Reorder tasks based on AI recommendations
            const taskMap = new Map(tasks.map(t => [t.id, t]));
            const optimizedTasks = result.optimizedTaskIds
                .map(id => taskMap.get(id))
                .filter((t) => t !== undefined);
            // Add any tasks that weren't included in AI response
            const includedIds = new Set(result.optimizedTaskIds);
            const remainingTasks = tasks.filter(t => !includedIds.has(t.id));
            optimizedTasks.push(...remainingTasks);
            return {
                optimizedTasks,
                estimatedCompletionDate: new Date(result.estimatedCompletionDate),
                suggestions: result.suggestions,
            };
        }
        catch (error) {
            console.error('OpenAI optimizeSchedule error:', error);
            // Fallback to rule-based approach
            const fallback = new FallbackAIClient();
            return fallback.optimizeSchedule(tasks, constraints);
        }
    }
    /**
     * Get recommended task using OpenAI
     */
    async getRecommendedTask(tasks, userContext) {
        try {
            const incompleteTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'DELETED');
            if (incompleteTasks.length === 0)
                return null;
            const taskSummaries = incompleteTasks.map(t => ({
                id: t.id,
                title: t.title,
                priority: t.priority,
                dueDate: t.dueDate,
                subtasks: t.subtasks.length,
            }));
            const currentHour = userContext.currentTime.getHours();
            const workingHours = userContext.workingHours
                ? `${userContext.workingHours.start} - ${userContext.workingHours.end}`
                : 'Not specified';
            const prompt = `You are a task recommendation expert. Based on current context, recommend the BEST NEXT task.

Available Tasks: ${JSON.stringify(taskSummaries, null, 2)}

Context:
- Current time: ${userContext.currentTime.toISOString()} (Hour: ${currentHour})
- Working hours: ${workingHours}
- Preferred priority: ${userContext.preferredPriority || 'Not specified'}

Consider:
1. Task priority (CRITICAL > HIGH > MEDIUM > LOW)
2. Due date urgency (overdue and soon-due tasks)
3. Current time vs working hours
4. Number of subtasks (prefer smaller tasks during off-hours)

Return ONLY a JSON object:
{
  "taskId": "recommended task ID",
  "reasoning": "brief explanation (1-2 sentences)"
}`;
            const completion = await this.openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.5,
                max_tokens: 300,
            });
            const content = completion.choices[0]?.message?.content;
            if (!content) {
                throw new Error('No response from OpenAI');
            }
            const result = JSON.parse(content);
            const recommendedTask = incompleteTasks.find(t => t.id === result.taskId);
            if (recommendedTask) {
                console.log(`AI Recommendation: ${result.reasoning}`);
            }
            return recommendedTask || null;
        }
        catch (error) {
            console.error('OpenAI getRecommendedTask error:', error);
            // Fallback to rule-based approach
            const fallback = new FallbackAIClient();
            return fallback.getRecommendedTask(tasks, userContext);
        }
    }
}
// ============================================================================
// Factory Function
// ============================================================================
/**
 * Create AI client instance based on environment configuration
 */
export function createAIClient() {
    if (AI_ENABLED && AI_API_KEY) {
        if (AI_PROVIDER === 'openai') {
            try {
                console.log(`Initializing OpenAI client with model: ${AI_MODEL}`);
                return new OpenAIClient(AI_API_KEY, AI_MODEL);
            }
            catch (error) {
                console.error('Failed to create OpenAI client, falling back to rule-based:', error);
                return new FallbackAIClient();
            }
        }
        // Add more providers here (Anthropic, etc.)
        console.warn(`Unknown AI provider: ${AI_PROVIDER}, using fallback implementation`);
    }
    // Default to fallback (rule-based) implementation
    console.log('AI not enabled or API key missing, using fallback implementation');
    return new FallbackAIClient();
}
// ============================================================================
// Singleton Instance
// ============================================================================
let clientInstance = null;
/**
 * Get singleton AI client instance
 */
export function getAIClient() {
    if (!clientInstance) {
        clientInstance = createAIClient();
    }
    return clientInstance;
}
/**
 * Reset client instance (useful for testing)
 */
export function resetAIClient() {
    clientInstance = null;
}
//# sourceMappingURL=ai-client.js.map