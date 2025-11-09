# Claude Desktop Setup Guide

## TaskFlow MCP Server Integration

This guide walks you through setting up the TaskFlow MCP Server with Claude Desktop for seamless AI-powered task management.

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **Claude Desktop**: Latest version installed
- **TaskFlow GraphQL Server**: Built and ready

## Quick Start

### Step 1: Build the MCP Server

```bash
cd /Users/sanae.abe/workspace/taskflow-app/taskflow-graphql
npm install
npm run build
```

This compiles the TypeScript code to JavaScript in the `dist/` directory.

### Step 2: Verify Build

```bash
# Test the MCP server standalone
npm run mcp:build

# You should see:
# [MCP] TaskFlow MCP Server v2.0.0 started
# [MCP] Available tools: 26
# [MCP] Available resources: 10
```

### Step 3: Locate Claude Desktop Config

Claude Desktop configuration file locations by OS:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Step 4: Configure Claude Desktop

Add the TaskFlow MCP Server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "taskflow": {
      "command": "node",
      "args": [
        "/Users/sanae.abe/workspace/taskflow-app/taskflow-graphql/dist/mcp/server.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "AI_API_ENABLED": "false"
      }
    }
  }
}
```

**Important**: Update the absolute path in `args` to match your installation directory.

#### Multiple MCP Servers

If you already have other MCP servers configured, add TaskFlow to the existing configuration:

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "...",
      "args": ["..."]
    },
    "taskflow": {
      "command": "node",
      "args": [
        "/absolute/path/to/taskflow-graphql/dist/mcp/server.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "AI_API_ENABLED": "false"
      }
    }
  }
}
```

### Step 5: Restart Claude Desktop

1. Quit Claude Desktop completely
2. Relaunch Claude Desktop
3. The MCP Server will be automatically loaded

### Step 6: Verify Integration

In Claude Desktop, try these commands:

```
"List all available tools"
"Create a new task titled 'Test Integration'"
"Show me all tasks"
```

You should see Claude successfully interacting with the TaskFlow MCP Server.

## Configuration Options

### Environment Variables

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `NODE_ENV` | Runtime environment | `development` | `development`, `production` |
| `AI_API_ENABLED` | Enable AI features (OpenAI API) | `false` | `true`, `false` |
| `OPENAI_API_KEY` | OpenAI API key (if AI enabled) | - | Your API key |

### Advanced Configuration

#### Enable AI Features

To use AI-powered task breakdown and recommendations:

```json
{
  "mcpServers": {
    "taskflow": {
      "command": "node",
      "args": [
        "/absolute/path/to/taskflow-graphql/dist/mcp/server.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "AI_API_ENABLED": "true",
        "OPENAI_API_KEY": "sk-your-openai-api-key"
      }
    }
  }
}
```

#### Custom Port (for GraphQL server)

If you need to run the GraphQL server on a custom port:

```json
{
  "mcpServers": {
    "taskflow": {
      "command": "node",
      "args": [
        "/absolute/path/to/taskflow-graphql/dist/mcp/server.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "PORT": "4001"
      }
    }
  }
}
```

## Available Features

Once configured, you have access to:

### Task Management (6 tools)
- `create_task` - Create new tasks
- `list_tasks` - View all tasks
- `get_task` - Get task details
- `update_task` - Update existing tasks
- `delete_task` - Delete tasks
- `complete_task` - Mark tasks as complete

### Board Management (4 tools)
- `create_board` - Create new boards
- `list_boards` - View all boards
- `get_board` - Get board details
- `delete_board` - Delete boards

### AI-Powered Features (4 tools)
- `ai_breakdown_task` - Break tasks into subtasks
- `ai_create_from_natural_language` - Create tasks from natural language
- `ai_optimize_schedule` - Optimize task scheduling
- `ai_recommend_next_task` - Get task recommendations

### Template Management (5 tools)
- `create_template` - Create task templates
- `list_templates` - View all templates
- `get_template` - Get template details
- `create_task_from_template` - Create tasks from templates
- `delete_template` - Delete templates

### Webhook Integration (6 tools)
- `create_webhook` - Create webhooks
- `list_webhooks` - View all webhooks
- `delete_webhook` - Delete webhooks
- `test_webhook` - Test webhook delivery
- `get_webhook_stats` - View webhook statistics
- `get_webhook_deliveries` - View delivery history

### Export & Backup (1 tool)
- `export_board_markdown` - Export boards to Markdown

### Resources (10 resources)
- Task lists and details
- Board lists and details
- Template lists and details
- Webhook lists and statistics

## Troubleshooting

### Issue: MCP Server Not Appearing

**Solution**:
1. Check the config file path is correct
2. Ensure the absolute path to `server.js` is correct
3. Verify Node.js is in your PATH
4. Check Claude Desktop logs

### Issue: Build Errors

**Solution**:
```bash
# Clean and rebuild
cd taskflow-graphql
rm -rf dist node_modules
npm install
npm run build
```

### Issue: Permission Denied

**Solution**:
```bash
# Ensure the server.js file is executable
chmod +x dist/mcp/server.js
```

### Issue: AI Features Not Working

**Solution**:
1. Verify `AI_API_ENABLED=true` in config
2. Ensure `OPENAI_API_KEY` is set correctly
3. Check OpenAI API quota and limits

### Issue: Tasks Not Persisting

**Solution**:
- MCP Server uses in-memory storage by default
- Data persists during the session
- For permanent storage, consider integrating with a database

### Viewing Logs

MCP Server logs are written to `stderr`:

**macOS/Linux**:
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Windows**:
```powershell
Get-Content $env:APPDATA\Claude\Logs\mcp*.log -Wait
```

## Testing Your Setup

### Basic Test Sequence

```bash
# 1. Create a board
"Create a new board called 'Test Board'"

# 2. Create a task
"Create a task titled 'Test Task' in the Test Board"

# 3. List tasks
"Show me all tasks"

# 4. Update task
"Mark the Test Task as in progress"

# 5. AI breakdown
"Break down the Test Task into subtasks"

# 6. Export
"Export the Test Board as markdown"
```

### Advanced Test Sequence

```bash
# 1. Natural language task creation
"Create an urgent task: fix login bug by tomorrow, assign to dev team"

# 2. Template creation
"Create a template for weekly standup meetings"

# 3. Task from template
"Create a task from the weekly standup template"

# 4. Schedule optimization
"Optimize the schedule for my Test Board"

# 5. Webhook setup
"Create a webhook for https://example.com/notify for task creation events"

# 6. Get recommendations
"What should I work on next?"
```

## Performance Optimization

### Recommended Settings

For optimal performance:

```json
{
  "mcpServers": {
    "taskflow": {
      "command": "node",
      "args": [
        "--max-old-space-size=512",
        "/absolute/path/to/taskflow-graphql/dist/mcp/server.js"
      ],
      "env": {
        "NODE_ENV": "production",
        "UV_THREADPOOL_SIZE": "4"
      }
    }
  }
}
```

### Memory Limits

Adjust Node.js memory limits based on your usage:

- **Light usage** (< 100 tasks): 256MB
- **Medium usage** (100-1000 tasks): 512MB
- **Heavy usage** (> 1000 tasks): 1024MB

## Security Considerations

### API Keys

- Never commit API keys to version control
- Use environment variables for sensitive data
- Rotate API keys regularly

### Network Access

- MCP Server communicates via stdio (secure)
- GraphQL endpoints should use HTTPS in production
- Consider webhook signature verification

### Data Privacy

- Task data is stored in memory (volatile)
- No external data transmission except webhooks
- AI features send task data to OpenAI (if enabled)

## Next Steps

1. Read the [API Reference](./API_REFERENCE.md) for complete tool documentation
2. Check [Claude Code Verification](./CLAUDE_CODE_VERIFICATION.md) for usage examples
3. Review [Troubleshooting Guide](./TROUBLESHOOTING.md) for common issues
4. Explore [MCP Server Implementation](./MCP_SERVER_IMPLEMENTATION.md) for technical details

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-repo/taskflow-graphql
- Documentation: https://docs.taskflow.dev
- MCP Protocol: https://modelcontextprotocol.io

## Version History

- **v2.0.0** (Week 6): Claude Desktop integration, comprehensive documentation
- **v1.5.0** (Week 5): AI features, templates, webhooks, markdown export
- **v1.0.0** (Week 4): Initial MCP Server implementation

---

**Last Updated**: 2025-11-09
**Author**: TaskFlow Team
