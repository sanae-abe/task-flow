# TaskFlow MCP Server - Troubleshooting Guide

Common issues, solutions, and debugging tips for the TaskFlow MCP Server.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Configuration Issues](#configuration-issues)
- [Runtime Issues](#runtime-issues)
- [Performance Issues](#performance-issues)
- [AI Feature Issues](#ai-feature-issues)
- [Webhook Issues](#webhook-issues)
- [Debugging Tips](#debugging-tips)
- [FAQ](#faq)

---

## Installation Issues

### Issue: npm install fails

**Symptoms**:
```
npm ERR! code ENOENT
npm ERR! syscall open
npm ERR! path package.json
```

**Solution**:
```bash
# Ensure you're in the correct directory
cd /Users/sanae.abe/workspace/taskflow-app/taskflow-graphql

# Verify package.json exists
ls -la package.json

# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

### Issue: TypeScript build errors

**Symptoms**:
```
error TS2305: Module has no exported member
error TS7006: Parameter implicitly has an 'any' type
```

**Solution**:
```bash
# Clean build
rm -rf dist
npm run build

# Check TypeScript version
npx tsc --version

# Update TypeScript if needed
npm install typescript@latest --save-dev
```

---

### Issue: Missing dependencies

**Symptoms**:
```
Error: Cannot find module '@modelcontextprotocol/sdk'
```

**Solution**:
```bash
# Install all dependencies
npm install

# Verify MCP SDK is installed
npm list @modelcontextprotocol/sdk

# Reinstall if missing
npm install @modelcontextprotocol/sdk@latest
```

---

## Configuration Issues

### Issue: Claude Desktop not detecting MCP server

**Symptoms**:
- MCP server doesn't appear in Claude Desktop
- No tools available in Claude

**Solution**:

1. **Verify configuration file location**:
```bash
# macOS
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Linux
cat ~/.config/Claude/claude_desktop_config.json

# Windows
type %APPDATA%\Claude\claude_desktop_config.json
```

2. **Verify JSON syntax**:
```bash
# Use jq to validate JSON
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .

# Should output formatted JSON without errors
```

3. **Check absolute path**:
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

4. **Verify file exists**:
```bash
# Check if server.js exists
ls -la /absolute/path/to/taskflow-graphql/dist/mcp/server.js

# Should show the file with execute permissions
```

5. **Restart Claude Desktop**:
- Quit Claude Desktop completely (Cmd+Q on macOS)
- Relaunch Claude Desktop
- Wait for MCP server to initialize (check logs)

---

### Issue: Invalid JSON configuration

**Symptoms**:
```
SyntaxError: Unexpected token in JSON
```

**Solution**:

1. **Validate JSON**:
```bash
# Online validator: https://jsonlint.com
# Or use jq:
jq . claude_desktop_config.json
```

2. **Common mistakes**:
```json
// ❌ Bad: Trailing comma
{
  "mcpServers": {
    "taskflow": { ... },  // ← Remove this comma
  }
}

// ❌ Bad: Missing quotes
{
  mcpServers: {  // ← Add quotes
    taskflow: { ... }
  }
}

// ✅ Good
{
  "mcpServers": {
    "taskflow": { ... }
  }
}
```

---

### Issue: Environment variables not working

**Symptoms**:
- AI features not working despite `AI_API_ENABLED=true`
- Server using wrong environment

**Solution**:

1. **Check environment variables in config**:
```json
{
  "mcpServers": {
    "taskflow": {
      "command": "node",
      "args": ["/path/to/server.js"],
      "env": {
        "NODE_ENV": "production",
        "AI_API_ENABLED": "true",
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

2. **Verify environment variables are set**:
```bash
# Add logging to server.ts
console.error('AI_API_ENABLED:', process.env.AI_API_ENABLED);
console.error('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');
```

3. **Check Claude Desktop logs** (see Debugging Tips section)

---

## Runtime Issues

### Issue: MCP server crashes on startup

**Symptoms**:
```
[MCP] Error: Cannot start server
Process exited with code 1
```

**Solution**:

1. **Check Node.js version**:
```bash
node --version
# Should be >= 18.0.0

# Update if needed
nvm install 20
nvm use 20
```

2. **Run server standalone**:
```bash
cd /path/to/taskflow-graphql
npm run mcp:build

# Check for errors in output
```

3. **Check for port conflicts**:
```bash
# If running GraphQL server
lsof -i :4000

# Kill if needed
kill -9 <PID>
```

4. **Verify dependencies**:
```bash
npm list --depth=0
# Check for missing or incompatible packages
```

---

### Issue: Tools not appearing

**Symptoms**:
- `tools/list` returns empty array
- No tools available in Claude

**Solution**:

1. **Verify build output**:
```bash
# Check if tool files exist
ls -la dist/mcp/tools/

# Should show all tool files
```

2. **Check tool registration**:
```typescript
// In src/mcp/tools/index.ts
export const allTools = [
  ...taskTools,
  ...boardTools,
  ...aiTools,
  ...templateTools,
  ...webhookTools,
  ...exportTools,
];
```

3. **Test tool listing**:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | npm run mcp:build
```

---

### Issue: Tool execution fails

**Symptoms**:
```
Error executing tool: <tool_name>
```

**Solution**:

1. **Check input parameters**:
```json
{
  "name": "create_task",
  "arguments": {
    "title": "Test",  // ✅ Required
    "boardId": "board-1",  // ✅ Required
    "columnId": "col-1"  // ✅ Required
    // Missing parameters will cause errors
  }
}
```

2. **Check error logs**:
```bash
# View Claude Desktop logs
tail -f ~/Library/Logs/Claude/mcp*.log
```

3. **Test tool standalone**:
```bash
# Create test script
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"create_task","arguments":{"title":"Test","boardId":"board-1","columnId":"col-1"}}}' | npm run mcp:build
```

---

### Issue: Resource reading fails

**Symptoms**:
```
Error reading resource: <uri>
Resource not found
```

**Solution**:

1. **Verify resource URI format**:
```
✅ task://list
✅ task://task-123
✅ board://list
✅ board://board-456
❌ task/list  (missing ://)
❌ task-123   (missing protocol)
```

2. **Check resource registration**:
```typescript
// In src/mcp/resources/index.ts
export const allResources = [
  ...taskResources,
  ...boardResources,
  ...templateResources,
  ...webhookResources,
];
```

3. **Test resource reading**:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"resources/read","params":{"uri":"task://list"}}' | npm run mcp:build
```

---

## Performance Issues

### Issue: Slow response times

**Symptoms**:
- Tools take > 3 seconds to respond
- Claude Desktop feels sluggish

**Solution**:

1. **Check system resources**:
```bash
# CPU usage
top -l 1 | grep "CPU usage"

# Memory usage
top -l 1 | grep "PhysMem"

# Node.js process
ps aux | grep node
```

2. **Optimize Node.js memory**:
```json
{
  "mcpServers": {
    "taskflow": {
      "command": "node",
      "args": [
        "--max-old-space-size=512",
        "/path/to/server.js"
      ]
    }
  }
}
```

3. **Reduce data size**:
- Delete old tasks
- Archive completed boards
- Clean up webhook deliveries

4. **Enable performance logging**:
```typescript
// Add to tool handlers
const start = Date.now();
// ... tool execution ...
console.error(`Tool ${toolName} took ${Date.now() - start}ms`);
```

---

### Issue: Memory leaks

**Symptoms**:
- Memory usage grows over time
- Server becomes unresponsive
- System swap increases

**Solution**:

1. **Monitor memory**:
```bash
# Check Node.js heap
node --expose-gc dist/mcp/server.js

# In another terminal
watch -n 1 "ps aux | grep 'dist/mcp/server.js'"
```

2. **Enable garbage collection logging**:
```json
{
  "mcpServers": {
    "taskflow": {
      "command": "node",
      "args": [
        "--trace-gc",
        "/path/to/server.js"
      ]
    }
  }
}
```

3. **Restart MCP server periodically**:
- Quit and restart Claude Desktop daily
- Clear task data regularly

---

## AI Feature Issues

### Issue: AI features not working

**Symptoms**:
- `ai_breakdown_task` returns errors
- "AI API not enabled" messages

**Solution**:

1. **Verify AI is enabled**:
```json
{
  "env": {
    "AI_API_ENABLED": "true",  // ← Must be string "true"
    "OPENAI_API_KEY": "sk-..."
  }
}
```

2. **Check OpenAI API key**:
```bash
# Test OpenAI API
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-..."

# Should return list of models
```

3. **Verify API quota**:
- Check OpenAI dashboard
- Ensure billing is active
- Check rate limits

4. **Check error messages**:
```typescript
// Look for specific errors
Error: AI API not enabled
Error: Invalid API key
Error: Rate limit exceeded
Error: Insufficient quota
```

---

### Issue: Poor AI recommendations

**Symptoms**:
- AI breakdown creates irrelevant subtasks
- Recommendations don't match context

**Solution**:

1. **Provide more context**:
```json
{
  "name": "ai_breakdown_task",
  "arguments": {
    "taskDescription": "Build authentication",
    "context": "Using Node.js, Express, JWT, PostgreSQL, with existing user model",
    "strategy": "detailed"
  }
}
```

2. **Use appropriate strategy**:
- `simple`: Quick breakdown (5-7 subtasks)
- `detailed`: Comprehensive breakdown (10-15 subtasks)
- `sprint`: Sprint-sized tasks with estimates

3. **Improve task descriptions**:
```
❌ "Fix bug"
✅ "Fix login bug where users get 401 error after password reset"

❌ "Add feature"
✅ "Add email verification feature with confirmation links and expiry"
```

---

## Webhook Issues

### Issue: Webhooks not firing

**Symptoms**:
- No webhook deliveries
- Events not triggering

**Solution**:

1. **Verify webhook is active**:
```bash
# List webhooks
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_webhooks"}}' | npm run mcp:build

# Check "active": true
```

2. **Check webhook URL**:
```bash
# Test webhook endpoint
curl -X POST https://your-webhook-url.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Should return 200 OK
```

3. **Check event subscriptions**:
```json
{
  "events": ["TASK_CREATED", "TASK_UPDATED"]  // Ensure events are subscribed
}
```

4. **View webhook logs**:
```bash
# Check delivery history
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_webhook_deliveries","arguments":{"webhookId":"webhook-123"}}}' | npm run mcp:build
```

---

### Issue: Webhook delivery failures

**Symptoms**:
- Webhooks created but deliveries fail
- 4xx/5xx errors in delivery log

**Solution**:

1. **Check webhook stats**:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_webhook_stats"}}' | npm run mcp:build
```

2. **Verify endpoint accessibility**:
```bash
# Test from command line
curl -v https://your-webhook-url.com/webhook

# Check for:
# - SSL certificate errors
# - Network timeouts
# - Authentication requirements
```

3. **Check webhook payload**:
```json
{
  "event": "TASK_CREATED",
  "data": { ... },
  "timestamp": "2025-11-09T10:00:00Z"
}
```

4. **Test webhook**:
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"test_webhook","arguments":{"webhookId":"webhook-123"}}}' | npm run mcp:build
```

---

## Debugging Tips

### Enable Debug Logging

**1. Add logging to MCP server**:
```typescript
// In src/mcp/server.ts
console.error('[DEBUG] Request:', request);
console.error('[DEBUG] Response:', response);
```

**2. View Claude Desktop logs**:
```bash
# macOS
tail -f ~/Library/Logs/Claude/mcp*.log

# Linux
tail -f ~/.config/Claude/logs/mcp*.log

# Windows
Get-Content $env:APPDATA\Claude\Logs\mcp*.log -Wait
```

**3. Enable verbose Node.js logging**:
```json
{
  "mcpServers": {
    "taskflow": {
      "command": "node",
      "args": [
        "--trace-warnings",
        "/path/to/server.js"
      ]
    }
  }
}
```

---

### Test MCP Server Standalone

**1. Run server in test mode**:
```bash
cd taskflow-graphql
npm run mcp:build
```

**2. Send test requests**:
```bash
# List tools
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | npm run mcp:build

# Create task
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"create_task","arguments":{"title":"Test","boardId":"board-1","columnId":"col-1"}}}' | npm run mcp:build
```

**3. Check for errors**:
- TypeScript compilation errors
- Runtime errors
- JSON-RPC format errors

---

### Use Integration Tests

**1. Run integration tests**:
```bash
npm run test:run src/mcp/__tests__/integration.test.ts
```

**2. Check test output**:
- All tests should pass
- Check for warnings or deprecations

**3. Add custom tests**:
```typescript
it('should handle my specific case', async () => {
  // Your test here
});
```

---

## FAQ

### Q: How do I know if the MCP server is running?

**A**: Check Claude Desktop logs:
```bash
tail -f ~/Library/Logs/Claude/mcp*.log

# Look for:
# [MCP] TaskFlow MCP Server v2.0.0 started
```

---

### Q: Can I run multiple MCP servers?

**A**: Yes, add multiple entries to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "taskflow": { ... },
    "another-server": { ... }
  }
}
```

---

### Q: How do I update the MCP server?

**A**:
```bash
cd taskflow-graphql
git pull
npm install
npm run build
# Restart Claude Desktop
```

---

### Q: Can I use the MCP server without Claude Desktop?

**A**: Yes, use the standalone mode:
```bash
npm run mcp:build
# Then send JSON-RPC requests via stdin
```

---

### Q: How do I backup my tasks?

**A**: Use the export feature:
```bash
# Export all boards
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"export_board_markdown","arguments":{"boardId":"board-1"}}}' | npm run mcp:build > backup.md
```

---

### Q: Where is task data stored?

**A**: In-memory by default. Data persists during the MCP server session but is lost on restart. For permanent storage, integrate with a database.

---

### Q: Can I customize the tool schemas?

**A**: Yes, edit the tool definitions in `src/mcp/tools/*.ts` and rebuild.

---

## Getting Help

### Report an Issue

1. **Gather information**:
   - MCP server version
   - Node.js version
   - Claude Desktop version
   - Error messages
   - Logs

2. **Create GitHub issue**:
   - Include reproduction steps
   - Attach relevant logs
   - Provide configuration (sanitized)

3. **Check existing issues**:
   - Search for similar problems
   - Check closed issues for solutions

---

### Community Support

- **GitHub Discussions**: Ask questions
- **Documentation**: https://docs.taskflow.dev
- **MCP Protocol**: https://modelcontextprotocol.io

---

**Last Updated**: 2025-11-09
**Version**: 2.0.0
**Author**: TaskFlow Team
