# Claude Code Verification Guide

## TaskFlow MCP Server - Usage Scenarios & Testing

This guide provides comprehensive verification scenarios for testing the TaskFlow MCP Server with Claude Code and Claude Desktop.

## Table of Contents

- [Basic Scenarios](#basic-scenarios)
- [Advanced Scenarios](#advanced-scenarios)
- [AI Feature Scenarios](#ai-feature-scenarios)
- [Template Scenarios](#template-scenarios)
- [Webhook Scenarios](#webhook-scenarios)
- [Export Scenarios](#export-scenarios)
- [Error Handling](#error-handling)

---

## Basic Scenarios

### Scenario 1: Task Management Workflow

**Objective**: Create, update, and complete tasks

```bash
# Step 1: Create a task
"Create a task titled 'Write documentation' with high priority"

Expected Response:
- Task created with ID
- Title: "Write documentation"
- Priority: HIGH
- Status: TODO

# Step 2: List all tasks
"Show me all tasks"

Expected Response:
- Array of all tasks
- Includes newly created task

# Step 3: Update task status
"Mark the 'Write documentation' task as in progress"

Expected Response:
- Task status updated to IN_PROGRESS
- Confirmation message

# Step 4: Complete the task
"Complete the 'Write documentation' task"

Expected Response:
- Task status updated to DONE
- Task marked as completed
```

### Scenario 2: Board Management

**Objective**: Create and manage boards

```bash
# Step 1: Create a board
"Create a new board called 'Q1 2025 Goals'"

Expected Response:
- Board created with ID
- Name: "Q1 2025 Goals"
- Default columns created

# Step 2: List all boards
"List all my boards"

Expected Response:
- Array of all boards
- Includes newly created board

# Step 3: Get board details
"Show me the 'Q1 2025 Goals' board"

Expected Response:
- Board details
- Column information
- Associated tasks

# Step 4: Delete board
"Delete the 'Q1 2025 Goals' board"

Expected Response:
- Board deleted confirmation
- Associated tasks archived
```

### Scenario 3: Task Details and Updates

**Objective**: Manage detailed task information

```bash
# Create a detailed task
"Create a task titled 'Implement user authentication' with description 'Add JWT-based auth with refresh tokens', high priority, due tomorrow"

Expected Response:
- Task with full details
- Due date set to tomorrow
- Priority: HIGH

# Update task details
"Update the authentication task: add label 'backend', set priority to critical"

Expected Response:
- Task updated
- New label added
- Priority changed to CRITICAL

# Add subtasks
"Add subtasks to the authentication task: 'Setup JWT library', 'Create auth middleware', 'Add refresh token logic'"

Expected Response:
- Subtasks created
- Linked to parent task
```

---

## Advanced Scenarios

### Scenario 4: Complex Task Organization

**Objective**: Organize tasks across multiple boards with labels

```bash
# Step 1: Create project board
"Create a board called 'Project Alpha' with columns: Backlog, In Progress, Review, Done"

# Step 2: Create multiple tasks
"Create 5 tasks for Project Alpha:
1. Design database schema
2. Setup API endpoints
3. Create frontend components
4. Write unit tests
5. Deploy to staging"

# Step 3: Organize tasks
"Move 'Design database schema' to In Progress"
"Set 'Setup API endpoints' priority to high"
"Add label 'backend' to database and API tasks"
"Add label 'frontend' to components task"

# Step 4: Get filtered view
"Show me all high priority backend tasks in Project Alpha"

Expected Response:
- Filtered task list
- Only high priority tasks
- Only backend labeled tasks
```

### Scenario 5: Task Dependencies

**Objective**: Manage task dependencies and blocking tasks

```bash
# Create dependent tasks
"Create a task 'Deploy to production' that depends on 'Complete testing'"
"Create a task 'Complete testing' that depends on 'Fix bugs'"

# Check blocking tasks
"What tasks are blocking 'Deploy to production'?"

Expected Response:
- Shows dependency chain
- Lists all blocking tasks

# Complete dependency
"Complete the 'Fix bugs' task"
"What can I work on now?"

Expected Response:
- Suggests 'Complete testing' as now available
```

---

## AI Feature Scenarios

### Scenario 6: AI Task Breakdown

**Objective**: Break complex tasks into manageable subtasks

```bash
# Simple breakdown
"Break down the task 'Launch new feature' into subtasks"

Expected Response:
- 5-10 subtasks generated
- Logical sequence
- Actionable items

# Detailed breakdown
"Break down 'Implement user authentication' using the detailed strategy"

Expected Response:
- Comprehensive subtask list
- Technical implementation steps
- Testing and deployment steps

# Sprint planning breakdown
"Break down 'Build dashboard' for a 2-week sprint"

Expected Response:
- Sprint-sized tasks
- Time estimates included
- Prioritized by dependencies
```

### Scenario 7: Natural Language Task Creation

**Objective**: Create tasks from natural language descriptions

```bash
# Urgent task
"Create an urgent task: fix login bug by tomorrow, assign to dev team"

Expected Response:
- Task created
- Priority: CRITICAL
- Due date: tomorrow
- Label: dev-team

# Meeting task
"Schedule a meeting: weekly standup every Monday at 10am"

Expected Response:
- Recurring task created
- Scheduled for Mondays
- Time: 10:00

# Complex task
"Create a task for reviewing code for the authentication PR, high priority, needs to be done by end of week, requires security review"

Expected Response:
- Task created with all details
- Priority: HIGH
- Due date: Friday
- Labels: code-review, security
```

### Scenario 8: Schedule Optimization

**Objective**: Optimize task scheduling for maximum efficiency

```bash
# Optimize a board
"Optimize my task schedule for the 'Project Alpha' board"

Expected Response:
- Reordered tasks by priority and dependencies
- Suggested daily schedule
- Identified conflicts

# Personal optimization
"What should I work on next?"

Expected Response:
- Recommended task based on:
  - Priority
  - Due dates
  - Dependencies
  - Current progress
```

### Scenario 9: AI Task Recommendations

**Objective**: Get intelligent task recommendations

```bash
# Get next task
"What should I work on next?"

Expected Response:
- Recommended task
- Reasoning provided
- Alternative suggestions

# Board-specific recommendations
"Recommend tasks for the 'Project Alpha' board"

Expected Response:
- Multiple task recommendations
- Prioritized list
- Context-aware suggestions

# Time-based recommendations
"What tasks should I complete today?"

Expected Response:
- Tasks due today
- High priority tasks
- Quick wins
```

---

## Template Scenarios

### Scenario 10: Template Management

**Objective**: Create and use task templates

```bash
# Step 1: Create a template
"Create a template for weekly reports with subtasks: 'Summarize achievements', 'List blockers', 'Plan next week'"

Expected Response:
- Template created
- Category: work
- Includes all subtasks

# Step 2: List templates
"Show me all templates in the 'work' category"

Expected Response:
- Array of work templates
- Includes weekly reports template

# Step 3: Create task from template
"Create a task from the 'weekly reports' template"

Expected Response:
- Task created with template structure
- All subtasks included
- Ready for customization

# Step 4: Update template
"Add a subtask 'Review metrics' to the weekly reports template"

Expected Response:
- Template updated
- New subtask added
```

### Scenario 11: Team Templates

**Objective**: Manage templates for team workflows

```bash
# Create bug report template
"Create a template for bug reports: Steps to reproduce, Expected behavior, Actual behavior, Screenshots, Environment details"

# Create feature request template
"Create a template for feature requests: Problem statement, Proposed solution, Alternatives considered, Success metrics"

# Create onboarding template
"Create a template for new developer onboarding: Setup dev environment, Review codebase, Complete hello-world PR, Shadow team member"

# Use template
"Create a bug report for the login issue"

Expected Response:
- Task created from bug report template
- All sections included
```

---

## Webhook Scenarios

### Scenario 12: Webhook Integration

**Objective**: Set up and manage webhooks

```bash
# Step 1: Create a webhook
"Create a webhook for https://example.com/notify for task creation events"

Expected Response:
- Webhook created with ID
- URL: https://example.com/notify
- Events: TASK_CREATED
- Status: ACTIVE

# Step 2: List webhooks
"Show me all active webhooks"

Expected Response:
- Array of active webhooks
- Includes newly created webhook

# Step 3: Test webhook
"Test the webhook I just created"

Expected Response:
- Test delivery initiated
- Delivery status
- Response from endpoint

# Step 4: View webhook stats
"Show me webhook statistics"

Expected Response:
- Total deliveries
- Success rate
- Failed deliveries
- Average response time

# Step 5: Delete webhook
"Delete the webhook for example.com"

Expected Response:
- Webhook deleted
- Confirmation message
```

### Scenario 13: Webhook Monitoring

**Objective**: Monitor webhook deliveries

```bash
# View delivery history
"Show me the last 10 webhook deliveries"

Expected Response:
- List of recent deliveries
- Status for each
- Response codes
- Timestamps

# Get failed deliveries
"Show me failed webhook deliveries"

Expected Response:
- Failed deliveries only
- Error messages
- Retry information

# Webhook statistics
"Get statistics for the Slack webhook"

Expected Response:
- Specific webhook stats
- Delivery metrics
- Performance data
```

---

## Export Scenarios

### Scenario 14: Markdown Export

**Objective**: Export boards and tasks to Markdown

```bash
# Export a board
"Export the 'Project Alpha' board as GitHub-flavored markdown"

Expected Response:
- Markdown formatted output
- Board name as H1
- Columns as H2
- Tasks as checkboxes
- Full task details

# Export with filters
"Export only high priority tasks from 'Project Alpha' as markdown"

Expected Response:
- Filtered markdown output
- Only high priority tasks
- Maintains structure

# Export for documentation
"Export the 'Q1 Goals' board as markdown for our wiki"

Expected Response:
- Clean markdown format
- Suitable for wiki
- Includes all relevant details
```

### Scenario 15: Backup and Archive

**Objective**: Use export for backup purposes

```bash
# Full backup
"Export all boards as markdown"

Expected Response:
- Multiple markdown sections
- One per board
- Complete data

# Archive completed tasks
"Export all completed tasks from last month as markdown"

Expected Response:
- Completed tasks only
- Filtered by date
- Archive format
```

---

## Error Handling

### Scenario 16: Error Scenarios

**Objective**: Verify proper error handling

```bash
# Test 1: Invalid task ID
"Get task with ID 'invalid-id'"

Expected Response:
- Error message
- Task not found
- Helpful suggestion

# Test 2: Missing required fields
"Create a task without a title"

Expected Response:
- Validation error
- Required fields listed
- Clear error message

# Test 3: Invalid board
"Add task to non-existent board"

Expected Response:
- Board not found error
- List of available boards

# Test 4: Invalid webhook URL
"Create a webhook for 'not-a-url'"

Expected Response:
- URL validation error
- Format requirements

# Test 5: Duplicate template
"Create a template with an existing name"

Expected Response:
- Duplicate name error
- Suggestion to use different name
```

---

## Performance Testing

### Scenario 17: Load Testing

**Objective**: Verify performance with large datasets

```bash
# Create many tasks
"Create 100 tasks for stress testing"

Expected Response:
- All tasks created successfully
- Reasonable response time

# List large dataset
"Show me all tasks"

Expected Response:
- Paginated results
- Fast response
- No timeout

# Complex query
"Show me all high priority tasks due this week with backend label across all boards"

Expected Response:
- Efficient filtering
- Quick response
- Accurate results
```

---

## Integration Testing

### Scenario 18: End-to-End Workflow

**Objective**: Complete project workflow from start to finish

```bash
# 1. Project setup
"Create a new board called 'Mobile App Redesign'"
"Create a template for UI tasks: Design, Implement, Review, Test"

# 2. Planning
"Break down 'Redesign login screen' into subtasks"
"Create tasks from the UI template for: Login, Dashboard, Profile, Settings"

# 3. Execution
"Move 'Design login screen' to In Progress"
"Complete 'Design login screen'"
"Create a webhook for Slack notifications"

# 4. Monitoring
"What should I work on next?"
"Show me webhook statistics"

# 5. Review
"Export 'Mobile App Redesign' board as markdown"
"Show me all completed tasks"

Expected Flow:
- Smooth execution
- No errors
- All features working together
```

---

## Automated Test Checklist

Use this checklist to verify all features:

### Basic Features
- [ ] Create task
- [ ] List tasks
- [ ] Get task
- [ ] Update task
- [ ] Delete task
- [ ] Complete task
- [ ] Create board
- [ ] List boards
- [ ] Get board
- [ ] Delete board

### AI Features
- [ ] AI task breakdown (simple)
- [ ] AI task breakdown (detailed)
- [ ] AI task breakdown (sprint)
- [ ] Natural language task creation
- [ ] Schedule optimization
- [ ] Task recommendations

### Templates
- [ ] Create template
- [ ] List templates
- [ ] Get template
- [ ] Create task from template
- [ ] Delete template

### Webhooks
- [ ] Create webhook
- [ ] List webhooks
- [ ] Test webhook
- [ ] Get webhook stats
- [ ] Get webhook deliveries
- [ ] Delete webhook

### Export
- [ ] Export board as markdown
- [ ] Export with filters
- [ ] Verify markdown format

### Resources
- [ ] Read task list resource
- [ ] Read task detail resource
- [ ] Read board list resource
- [ ] Read board detail resource
- [ ] Read template list resource
- [ ] Read webhook list resource
- [ ] Read webhook stats resource

### Error Handling
- [ ] Invalid IDs
- [ ] Missing required fields
- [ ] Validation errors
- [ ] Not found errors
- [ ] Duplicate errors

---

## Best Practices

### 1. Start Simple
Begin with basic task creation and gradually add complexity.

### 2. Test Incrementally
Test each feature before combining them.

### 3. Use Natural Language
Claude excels at understanding natural language instructions.

### 4. Verify Results
Always check the response to ensure expected behavior.

### 5. Clean Up
Delete test data after testing to avoid clutter.

### 6. Document Issues
Keep track of any unexpected behavior for bug reports.

---

## Troubleshooting Tips

### Issue: Tool Not Found
- Verify MCP server is running
- Check Claude Desktop configuration
- Restart Claude Desktop

### Issue: Unexpected Results
- Check input parameters
- Verify data exists
- Review error messages

### Issue: Performance Issues
- Reduce dataset size
- Use filters effectively
- Check system resources

---

## Next Steps

After verifying all scenarios:

1. Review [API Reference](./API_REFERENCE.md) for detailed tool documentation
2. Check [Troubleshooting Guide](./TROUBLESHOOTING.md) for common issues
3. Explore [MCP Server Guide](./MCP_SERVER_GUIDE.md) for advanced features
4. Read [Claude Desktop Setup](./CLAUDE_DESKTOP_SETUP.md) for configuration details

---

**Last Updated**: 2025-11-09
**Version**: 2.0.0
**Author**: TaskFlow Team
