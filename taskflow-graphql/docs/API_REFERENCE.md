# TaskFlow MCP Server - API Reference

Complete reference for all MCP Tools and Resources available in the TaskFlow MCP Server.

## Table of Contents

- [Task Management Tools](#task-management-tools)
- [Board Management Tools](#board-management-tools)
- [AI-Powered Tools](#ai-powered-tools)
- [Template Management Tools](#template-management-tools)
- [Webhook Integration Tools](#webhook-integration-tools)
- [Export Tools](#export-tools)
- [Resources](#resources)
- [Common Types](#common-types)
- [Error Handling](#error-handling)

---

## Task Management Tools

### create_task

Creates a new task.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Task title"
    },
    "description": {
      "type": "string",
      "description": "Task description (optional)"
    },
    "boardId": {
      "type": "string",
      "description": "Board ID"
    },
    "columnId": {
      "type": "string",
      "description": "Column ID"
    },
    "priority": {
      "type": "string",
      "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      "description": "Task priority (optional, default: MEDIUM)"
    },
    "dueDate": {
      "type": "string",
      "description": "Due date in ISO 8601 format (optional)"
    },
    "labels": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Array of label strings (optional)"
    }
  },
  "required": ["title", "boardId", "columnId"]
}
```

**Example Request**:
```json
{
  "name": "create_task",
  "arguments": {
    "title": "Implement user authentication",
    "description": "Add JWT-based authentication with refresh tokens",
    "boardId": "board-1",
    "columnId": "col-todo",
    "priority": "HIGH",
    "dueDate": "2025-11-15T23:59:59Z",
    "labels": ["backend", "security"]
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "{\"id\":\"task-123\",\"title\":\"Implement user authentication\",\"priority\":\"HIGH\",\"status\":\"TODO\",\"created\":\"2025-11-09T10:00:00Z\"}"
  }]
}
```

---

### list_tasks

Lists all tasks with optional filtering.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "boardId": {
      "type": "string",
      "description": "Filter by board ID (optional)"
    },
    "status": {
      "type": "string",
      "enum": ["TODO", "IN_PROGRESS", "DONE"],
      "description": "Filter by status (optional)"
    },
    "priority": {
      "type": "string",
      "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      "description": "Filter by priority (optional)"
    }
  }
}
```

**Example Request**:
```json
{
  "name": "list_tasks",
  "arguments": {
    "boardId": "board-1",
    "priority": "HIGH"
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "[{\"id\":\"task-123\",\"title\":\"High priority task 1\"},{\"id\":\"task-124\",\"title\":\"High priority task 2\"}]"
  }]
}
```

---

### get_task

Retrieves detailed information about a specific task.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "taskId": {
      "type": "string",
      "description": "Task ID"
    }
  },
  "required": ["taskId"]
}
```

**Example Request**:
```json
{
  "name": "get_task",
  "arguments": {
    "taskId": "task-123"
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "{\"id\":\"task-123\",\"title\":\"Implement user authentication\",\"description\":\"Add JWT-based authentication\",\"priority\":\"HIGH\",\"status\":\"IN_PROGRESS\",\"subtasks\":[],\"labels\":[\"backend\"]}"
  }]
}
```

---

### update_task

Updates an existing task.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "taskId": {
      "type": "string",
      "description": "Task ID"
    },
    "title": {
      "type": "string",
      "description": "New title (optional)"
    },
    "description": {
      "type": "string",
      "description": "New description (optional)"
    },
    "status": {
      "type": "string",
      "enum": ["TODO", "IN_PROGRESS", "DONE"],
      "description": "New status (optional)"
    },
    "priority": {
      "type": "string",
      "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      "description": "New priority (optional)"
    },
    "columnId": {
      "type": "string",
      "description": "New column ID (optional)"
    }
  },
  "required": ["taskId"]
}
```

**Example Request**:
```json
{
  "name": "update_task",
  "arguments": {
    "taskId": "task-123",
    "status": "IN_PROGRESS",
    "priority": "CRITICAL"
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "{\"id\":\"task-123\",\"status\":\"IN_PROGRESS\",\"priority\":\"CRITICAL\",\"updated\":\"2025-11-09T11:00:00Z\"}"
  }]
}
```

---

### delete_task

Deletes a task.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "taskId": {
      "type": "string",
      "description": "Task ID"
    }
  },
  "required": ["taskId"]
}
```

**Example Request**:
```json
{
  "name": "delete_task",
  "arguments": {
    "taskId": "task-123"
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "Task task-123 deleted successfully"
  }]
}
```

---

### complete_task

Marks a task as completed.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "taskId": {
      "type": "string",
      "description": "Task ID"
    }
  },
  "required": ["taskId"]
}
```

**Example Request**:
```json
{
  "name": "complete_task",
  "arguments": {
    "taskId": "task-123"
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "{\"id\":\"task-123\",\"status\":\"DONE\",\"completed\":true,\"completedAt\":\"2025-11-09T12:00:00Z\"}"
  }]
}
```

---

## Board Management Tools

### create_board

Creates a new board.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Board name"
    },
    "description": {
      "type": "string",
      "description": "Board description (optional)"
    },
    "columns": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "title": { "type": "string" }
        }
      },
      "description": "Custom columns (optional, defaults provided)"
    }
  },
  "required": ["name"]
}
```

**Example Request**:
```json
{
  "name": "create_board",
  "arguments": {
    "name": "Q1 2025 Goals",
    "description": "Quarterly planning board",
    "columns": [
      { "id": "col-backlog", "title": "Backlog" },
      { "id": "col-progress", "title": "In Progress" },
      { "id": "col-done", "title": "Done" }
    ]
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "{\"id\":\"board-456\",\"name\":\"Q1 2025 Goals\",\"columns\":[...],\"created\":\"2025-11-09T10:00:00Z\"}"
  }]
}
```

---

### list_boards

Lists all boards.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {}
}
```

**Example Request**:
```json
{
  "name": "list_boards",
  "arguments": {}
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "[{\"id\":\"board-456\",\"name\":\"Q1 2025 Goals\",\"taskCount\":12}]"
  }]
}
```

---

### get_board

Retrieves detailed information about a specific board.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "boardId": {
      "type": "string",
      "description": "Board ID"
    }
  },
  "required": ["boardId"]
}
```

**Example Request**:
```json
{
  "name": "get_board",
  "arguments": {
    "boardId": "board-456"
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "{\"id\":\"board-456\",\"name\":\"Q1 2025 Goals\",\"columns\":[...],\"tasks\":[...]}"
  }]
}
```

---

### delete_board

Deletes a board and all its tasks.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "boardId": {
      "type": "string",
      "description": "Board ID"
    }
  },
  "required": ["boardId"]
}
```

**Example Request**:
```json
{
  "name": "delete_board",
  "arguments": {
    "boardId": "board-456"
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "Board board-456 and all associated tasks deleted successfully"
  }]
}
```

---

## AI-Powered Tools

### ai_breakdown_task

Breaks down a complex task into smaller subtasks using AI.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "taskDescription": {
      "type": "string",
      "description": "Description of the task to break down"
    },
    "strategy": {
      "type": "string",
      "enum": ["simple", "detailed", "sprint"],
      "description": "Breakdown strategy (optional, default: simple)"
    },
    "context": {
      "type": "string",
      "description": "Additional context (optional)"
    }
  },
  "required": ["taskDescription"]
}
```

**Example Request**:
```json
{
  "name": "ai_breakdown_task",
  "arguments": {
    "taskDescription": "Build a user authentication system",
    "strategy": "detailed",
    "context": "Using Node.js, Express, and JWT"
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "{\"subtasks\":[{\"title\":\"Setup authentication endpoints\",\"priority\":\"HIGH\"},{\"title\":\"Implement JWT token generation\",\"priority\":\"HIGH\"},{\"title\":\"Add refresh token logic\",\"priority\":\"MEDIUM\"}],\"strategy\":\"detailed\"}"
  }]
}
```

---

### ai_create_from_natural_language

Creates a task from natural language description.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "input": {
      "type": "string",
      "description": "Natural language task description"
    },
    "boardId": {
      "type": "string",
      "description": "Target board ID (optional)"
    }
  },
  "required": ["input"]
}
```

**Example Request**:
```json
{
  "name": "ai_create_from_natural_language",
  "arguments": {
    "input": "urgent: fix login bug by tomorrow, assign to backend team",
    "boardId": "board-456"
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "{\"id\":\"task-789\",\"title\":\"Fix login bug\",\"priority\":\"CRITICAL\",\"dueDate\":\"2025-11-10T23:59:59Z\",\"labels\":[\"backend\",\"urgent\"]}"
  }]
}
```

---

### ai_optimize_schedule

Optimizes task scheduling for a board.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "boardId": {
      "type": "string",
      "description": "Board ID to optimize"
    },
    "constraints": {
      "type": "object",
      "description": "Scheduling constraints (optional)"
    }
  },
  "required": ["boardId"]
}
```

**Example Request**:
```json
{
  "name": "ai_optimize_schedule",
  "arguments": {
    "boardId": "board-456",
    "constraints": {
      "workHoursPerDay": 8,
      "prioritizeDeadlines": true
    }
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "{\"optimizedSchedule\":[{\"date\":\"2025-11-09\",\"tasks\":[\"task-789\",\"task-790\"]},{\"date\":\"2025-11-10\",\"tasks\":[\"task-791\"]}],\"suggestions\":[\"Move task-792 to next week\"]}"
  }]
}
```

---

### ai_recommend_next_task

Recommends the next task to work on.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "boardId": {
      "type": "string",
      "description": "Board ID for recommendations (optional)"
    },
    "preferences": {
      "type": "object",
      "description": "User preferences (optional)"
    }
  }
}
```

**Example Request**:
```json
{
  "name": "ai_recommend_next_task",
  "arguments": {
    "boardId": "board-456",
    "preferences": {
      "prioritizeUrgent": true,
      "skillLevel": "senior"
    }
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "{\"recommendedTask\":{\"id\":\"task-789\",\"title\":\"Fix login bug\",\"reason\":\"Critical priority with approaching deadline\"},\"alternatives\":[{\"id\":\"task-790\",\"title\":\"Review PR #123\"}]}"
  }]
}
```

---

## Template Management Tools

### create_template

Creates a new task template.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Template name"
    },
    "description": {
      "type": "string",
      "description": "Template description (optional)"
    },
    "category": {
      "type": "string",
      "description": "Template category (optional)"
    },
    "taskTemplate": {
      "type": "object",
      "description": "Task template structure"
    }
  },
  "required": ["name", "taskTemplate"]
}
```

**Example Request**:
```json
{
  "name": "create_template",
  "arguments": {
    "name": "Bug Report",
    "description": "Standard bug report template",
    "category": "development",
    "taskTemplate": {
      "title": "Bug: [Description]",
      "priority": "HIGH",
      "labels": ["bug"],
      "description": "Steps to reproduce:\nExpected behavior:\nActual behavior:"
    }
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "{\"id\":\"template-101\",\"name\":\"Bug Report\",\"category\":\"development\",\"created\":\"2025-11-09T10:00:00Z\"}"
  }]
}
```

---

### list_templates

Lists all templates with optional filtering.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "description": "Filter by category (optional)"
    }
  }
}
```

**Example Request**:
```json
{
  "name": "list_templates",
  "arguments": {
    "category": "development"
  }
}
```

**Response**:
```json
{
  "content": [{
    "type": "text",
    "text": "[{\"id\":\"template-101\",\"name\":\"Bug Report\",\"category\":\"development\"}]"
  }]
}
```

---

### get_template

Retrieves detailed information about a template.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "templateId": {
      "type": "string",
      "description": "Template ID"
    }
  },
  "required": ["templateId"]
}
```

---

### create_task_from_template

Creates a task from a template.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "templateId": {
      "type": "string",
      "description": "Template ID"
    },
    "boardId": {
      "type": "string",
      "description": "Target board ID"
    },
    "columnId": {
      "type": "string",
      "description": "Target column ID"
    },
    "overrides": {
      "type": "object",
      "description": "Override template values (optional)"
    }
  },
  "required": ["templateId", "boardId", "columnId"]
}
```

---

### delete_template

Deletes a template.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "templateId": {
      "type": "string",
      "description": "Template ID"
    }
  },
  "required": ["templateId"]
}
```

---

## Webhook Integration Tools

### create_webhook

Creates a new webhook.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "url": {
      "type": "string",
      "description": "Webhook URL"
    },
    "events": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["TASK_CREATED", "TASK_UPDATED", "TASK_DELETED", "TASK_COMPLETED"]
      },
      "description": "Events to subscribe to"
    },
    "active": {
      "type": "boolean",
      "description": "Active status (optional, default: true)"
    }
  },
  "required": ["url", "events"]
}
```

**Example Request**:
```json
{
  "name": "create_webhook",
  "arguments": {
    "url": "https://example.com/webhook",
    "events": ["TASK_CREATED", "TASK_COMPLETED"],
    "active": true
  }
}
```

---

### list_webhooks

Lists all webhooks.

---

### delete_webhook

Deletes a webhook.

---

### test_webhook

Tests webhook delivery.

---

### get_webhook_stats

Retrieves webhook statistics.

---

### get_webhook_deliveries

Retrieves webhook delivery history.

---

## Export Tools

### export_board_markdown

Exports a board to GitHub-flavored Markdown.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "boardId": {
      "type": "string",
      "description": "Board ID to export"
    },
    "includeCompleted": {
      "type": "boolean",
      "description": "Include completed tasks (optional, default: true)"
    }
  },
  "required": ["boardId"]
}
```

**Example Request**:
```json
{
  "name": "export_board_markdown",
  "arguments": {
    "boardId": "board-456",
    "includeCompleted": false
  }
}
```

**Response**:
```markdown
# Q1 2025 Goals

## Backlog
- [ ] Task 1 (HIGH)
- [ ] Task 2 (MEDIUM)

## In Progress
- [ ] Task 3 (CRITICAL)
```

---

## Resources

### task://list
List all tasks

### task://{taskId}
Get task details

### board://list
List all boards

### board://{boardId}
Get board details

### template://list
List all templates

### template://{templateId}
Get template details

### webhook://list
List all webhooks

### webhook://stats
Get webhook statistics

---

## Common Types

### Task
```typescript
{
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  boardId: string;
  columnId: string;
  labels?: string[];
  dueDate?: string;
  completed: boolean;
  created: string;
  updated: string;
}
```

### Board
```typescript
{
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  created: string;
}
```

---

## Error Handling

All tools return errors in this format:

```json
{
  "content": [{
    "type": "text",
    "text": "Error message describing what went wrong"
  }],
  "isError": true
}
```

Common error codes:
- `TASK_NOT_FOUND` - Task ID not found
- `BOARD_NOT_FOUND` - Board ID not found
- `VALIDATION_ERROR` - Invalid input
- `INTERNAL_ERROR` - Server error

---

**Last Updated**: 2025-11-09
**Version**: 2.0.0
