# TaskFlow MCP Server

Model Context Protocol (MCP) server for TaskFlow GraphQL API, enabling AI assistants to interact with task management functionality.

## Quick Start

### Development

```bash
# Run MCP server in development mode
npm run mcp

# Run with build
npm run build
npm run mcp:build
```

### Claude Desktop Integration

1. Build the project:
```bash
npm run build
```

2. Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

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

3. Restart Claude Desktop

4. Verify in Claude:
```
User: List all available TaskFlow tools
```

## Available Tools (10)

### Task Management (6 tools)

- **create_task** - Create a new task
- **update_task** - Update an existing task
- **delete_task** - Soft delete a task
- **get_task** - Get a specific task by ID
- **list_tasks** - List tasks with optional filters
- **complete_task** - Mark task as completed

### Board Management (4 tools)

- **create_board** - Create a new board
- **list_boards** - List all boards
- **get_board** - Get a specific board by ID
- **update_board** - Update an existing board

## Available Resources (5 URIs)

### Task Resources

- `task://list` - List all tasks
- `task://{id}` - Get specific task
- `task://board/{boardId}` - Get tasks by board

### Board Resources

- `board://list` - List all boards
- `board://{id}` - Get specific board

## Examples

### Create a Task

```
User: Create a task called "Implement authentication" on board-1 with high priority

Claude will use: create_task
{
  "title": "Implement authentication",
  "boardId": "board-1",
  "columnId": "col-1",
  "priority": "HIGH"
}
```

### List Tasks

```
User: Show me all high priority tasks

Claude will use: list_tasks
{
  "priority": "HIGH"
}
```

### Update Task Status

```
User: Mark task task-123 as completed

Claude will use: complete_task
{
  "id": "task-123"
}
```

### Create a Board

```
User: Create a new board called "Sprint 5"

Claude will use: create_board
{
  "name": "Sprint 5",
  "description": "Sprint 5 planning board"
}
```

## Architecture

```
src/mcp/
├── server.ts              # MCP server initialization
├── types.ts               # Shared type definitions
├── tools/                 # Tool implementations
│   ├── index.ts          # Tool registry
│   ├── task-tools.ts     # Task CRUD operations
│   └── board-tools.ts    # Board management
└── resources/            # Resource implementations
    ├── index.ts          # Resource router
    ├── task-resources.ts # Task data access
    └── board-resources.ts # Board data access
```

## Testing

```bash
# Run all MCP tests
npm test -- src/mcp/__tests__

# Run specific test suite
npm test -- src/mcp/__tests__/task-tools.test.ts
npm test -- src/mcp/__tests__/board-tools.test.ts
npm test -- src/mcp/__tests__/resources.test.ts

# Run with coverage
npm run test:coverage
```

### Test Coverage

- Task Tools: 16 tests ✓
- Board Tools: 13 tests ✓
- Resources: 12 tests ✓
- **Total: 41 tests, 100% pass rate**

## Development

### Adding a New Tool

1. Define the tool schema in `tools/`:

```typescript
export const myTools = [
  {
    name: 'my_tool',
    description: 'Description of what the tool does',
    inputSchema: {
      type: 'object',
      properties: {
        // Define parameters
      },
      required: ['param1'],
    },
  },
];
```

2. Implement the handler:

```typescript
export async function handleMyTool(args: MyToolArgs): Promise<MCPToolResult> {
  try {
    // Implementation
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error: ${error.message}` }],
      isError: true,
    };
  }
}
```

3. Register in `tools/index.ts`:

```typescript
export const allTools = [...existingTools, ...myTools];
export const toolHandlers = {
  ...existingHandlers,
  my_tool: handleMyTool,
};
```

4. Add tests in `__tests__/my-tool.test.ts`

### Adding a New Resource

1. Define the resource schema in `resources/`:

```typescript
export const myResources = [
  {
    uri: 'myresource://list',
    name: 'My Resource List',
    description: 'Description of the resource',
    mimeType: 'application/json',
  },
];
```

2. Implement the reader:

```typescript
export async function readMyResource(uri: string) {
  // Parse URI and fetch data
  return {
    contents: [{
      uri,
      mimeType: 'application/json',
      text: JSON.stringify(data, null, 2),
    }],
  };
}
```

3. Register in `resources/index.ts`:

```typescript
export const allResources = [...existingResources, ...myResources];

export async function readResource(uri: string) {
  if (uri.startsWith('myresource://')) {
    return readMyResource(uri);
  }
  // ... other resources
}
```

## Debugging

The MCP server logs to stderr (visible in Claude Desktop logs):

```
[MCP] TaskFlow MCP Server started successfully
[MCP] Available tools: 10
[MCP] Available resources: 5
[MCP] Calling tool: create_task
[MCP] Tool create_task completed successfully
```

### Viewing Claude Desktop Logs

On macOS:
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

## Troubleshooting

### Server not showing in Claude

1. Check the config file path is correct
2. Verify the absolute path to `dist/mcp/server.js`
3. Ensure the project is built (`npm run build`)
4. Restart Claude Desktop completely
5. Check Claude Desktop logs for errors

### Tool execution errors

1. Verify tool parameters match the schema
2. Check server logs for detailed error messages
3. Ensure the GraphQL server dependencies are available
4. Test the tool directly via the test suite

### Resource not found

1. Verify URI format matches the schema
2. Check that the requested resource exists
3. Verify database/storage has the data
4. Test resource reading via the test suite

## Performance

- **Startup**: < 100ms
- **Tool execution**: < 10ms average
- **Resource reading**: < 5ms average
- **Memory**: < 10MB base

## Security

- ✓ Input validation via JSON schemas
- ✓ Error sanitization (no stack traces exposed)
- ✓ Soft deletes (data preservation)
- ✓ Local-only stdio transport (no network exposure)

## Documentation

- [Full Implementation Report](../../docs/MCP_SERVER_IMPLEMENTATION.md)
- [Test Coverage Report](../../TEST_COVERAGE_REPORT.md)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)

## Version

- **Current**: v1.0.0 (Week 5 Day 29-31 - Core Features)
- **MCP SDK**: v1.21.1
- **Protocol**: stdio transport

## License

MIT
