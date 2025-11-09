# TaskFlow MCP Server - Quick Reference

## Installation

```bash
cd taskflow-graphql
npm install  # Installs @modelcontextprotocol/sdk@^1.21.1
```

## Running the Server

```bash
# Development mode
npm run mcp

# Production mode
npm run build
npm run mcp:build
```

## Claude Desktop Setup

**Config file**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "taskflow": {
      "command": "node",
      "args": [
        "/absolute/path/to/taskflow-graphql/dist/mcp/server.js"
      ]
    }
  }
}
```

**Remember to**:
1. Build first: `npm run build`
2. Use absolute path
3. Restart Claude Desktop

## Available Tools (10)

### Task Tools

| Tool | Description | Required Args |
|------|-------------|---------------|
| `create_task` | Create new task | title, boardId, columnId |
| `update_task` | Update task | id |
| `delete_task` | Soft delete task | id |
| `get_task` | Get task by ID | id |
| `list_tasks` | List/filter tasks | - |
| `complete_task` | Mark completed | id |

### Board Tools

| Tool | Description | Required Args |
|------|-------------|---------------|
| `create_board` | Create new board | name |
| `list_boards` | List all boards | - |
| `get_board` | Get board by ID | id |
| `update_board` | Update board | id |

## Available Resources (5)

### Task Resources

- `task://list` - All tasks
- `task://{id}` - Specific task
- `task://board/{boardId}` - Board's tasks

### Board Resources

- `board://list` - All boards
- `board://{id}` - Specific board

## Quick Examples

### Create Task
```
Claude: "Create a task 'Deploy to production' on board-1"
Tool: create_task
Args: { title: "Deploy to production", boardId: "board-1", columnId: "col-1" }
```

### List High Priority Tasks
```
Claude: "Show me all high priority tasks"
Tool: list_tasks
Args: { priority: "HIGH" }
```

### Complete Task
```
Claude: "Mark task task-123 as done"
Tool: complete_task
Args: { id: "task-123" }
```

### Create Board
```
Claude: "Create a board called Sprint 10"
Tool: create_board
Args: { name: "Sprint 10" }
```

## Testing

```bash
# Run all MCP tests
npm test -- src/mcp/__tests__

# Run specific test
npm test -- src/mcp/__tests__/task-tools.test.ts

# Test results: 41/41 tests passing ✓
```

## Files Location

```
taskflow-graphql/
├── src/mcp/
│   ├── server.ts              # Main server
│   ├── types.ts               # Type definitions
│   ├── tools/                 # Tool implementations
│   │   ├── task-tools.ts      # 6 task tools
│   │   └── board-tools.ts     # 4 board tools
│   └── resources/             # Resource implementations
│       ├── task-resources.ts  # 3 task URIs
│       └── board-resources.ts # 2 board URIs
└── docs/
    └── MCP_SERVER_IMPLEMENTATION.md  # Full docs
```

## Troubleshooting

### Server not showing in Claude
1. Check config file path
2. Use absolute path to server.js
3. Build first: `npm run build`
4. Restart Claude Desktop

### Tool errors
1. Check tool arguments match schema
2. View logs: `~/Library/Logs/Claude/mcp*.log`
3. Test directly: `npm test -- src/mcp/__tests__`

## Documentation

- **Full Guide**: `/Users/sanae.abe/workspace/taskflow-app/taskflow-graphql/docs/MCP_SERVER_IMPLEMENTATION.md`
- **MCP README**: `/Users/sanae.abe/workspace/taskflow-app/taskflow-graphql/src/mcp/README.md`
- **Implementation Report**: `/Users/sanae.abe/workspace/taskflow-app/taskflow-graphql/MCP_WEEK5_DAY29-31_REPORT.md`

## Quick Stats

- **Tools**: 10 (6 task + 4 board)
- **Resources**: 5 (3 task + 2 board)
- **Tests**: 41 (100% passing)
- **Lines**: 2,110 (1,223 implementation + 887 tests)
- **Coverage**: 100%

---

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **MCP SDK**: 1.21.1
