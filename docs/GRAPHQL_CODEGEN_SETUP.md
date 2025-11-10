# GraphQL Code Generator Setup Guide

**Phase**: FE-2 - Type-Safe GraphQL Integration
**Status**: Configuration Complete (awaiting BE-1 backend completion)
**Last Updated**: 2025-11-09

## Overview

GraphQL Code Generator automatically generates TypeScript types from our GraphQL schema and operations, ensuring 100% type safety for all GraphQL queries, mutations, and subscriptions.

## Installation

### Required Packages

All core packages are already installed:

```bash
# Already installed in package.json
@apollo/client: ^4.0.9
graphql: ^16.12.0
@graphql-codegen/cli: ^6.0.1
@graphql-codegen/typescript: ^5.0.2
@graphql-codegen/typescript-operations: ^5.0.2
```

### Missing Plugin (to install when running codegen)

```bash
# Install React Apollo plugin for hooks generation
npm install --save-dev @graphql-codegen/typescript-react-apollo@^5.0.0
```

**Important**: DO NOT install until backend BE-1 is complete and GraphQL server is running.

## Configuration

### codegen.yml

Location: `/Users/sanae.abe/workspace/taskflow-app/codegen.yml`

```yaml
schema: 'http://localhost:4000/graphql'
documents: 'src/graphql/**/*.graphql'
generates:
  src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
```

### GraphQL Operations

Created example operation files in `src/graphql/`:

1. **ai-features.graphql** - AI-powered task management
   - `CreateTaskFromNaturalLanguage` mutation
   - `GetAISuggestedTasks` query
   - `GetNextRecommendedTask` query
   - `GetAITaskInsights` query

2. **subscriptions.graphql** - Real-time features
   - `OnTaskCreated` subscription
   - `OnTaskUpdated` subscription
   - `OnTaskDeleted` subscription
   - `OnBoardUpdated` subscription
   - `OnUserPresence` subscription

### NPM Scripts

Added to `package.json`:

```json
{
  "scripts": {
    "codegen": "graphql-codegen --config codegen.yml",
    "codegen:watch": "graphql-codegen --config codegen.yml --watch"
  }
}
```

## Usage

### When Backend is Ready (Post BE-1)

1. **Ensure backend is running**:
   ```bash
   cd ~/workspace/taskflow-app/taskflow-graphql
   npm start
   # Server running at http://localhost:4000/graphql
   ```

2. **Install missing plugin**:
   ```bash
   cd ~/workspace/taskflow-app
   npm install --save-dev @graphql-codegen/typescript-react-apollo
   ```

3. **Generate types**:
   ```bash
   npm run codegen
   ```

4. **Verify output**:
   ```bash
   cat src/generated/graphql.ts | head -50
   ```

### Development Workflow

**Watch Mode** (recommended during development):
```bash
npm run codegen:watch
```

This will:
- Monitor changes to `src/graphql/**/*.graphql`
- Auto-regenerate types on save
- Provide instant TypeScript feedback

**One-Time Generation**:
```bash
npm run codegen
```

## Generated Output

### Location
`src/generated/graphql.ts` (~1000-2000 lines)

### Contents
1. **Type Definitions** - GraphQL schema types
2. **Operation Types** - Query/Mutation/Subscription types
3. **React Hooks** - Type-safe Apollo hooks:
   - `useCreateTaskFromNaturalLanguageMutation()`
   - `useGetAISuggestedTasksQuery()`
   - `useOnTaskCreatedSubscription()`
   - etc.

### Example Usage

```typescript
// Before: Manual types, error-prone
const [createTask] = useMutation(CREATE_TASK_FROM_NL, {
  variables: { query: '明日までにレポート' } // No type safety
});

// After: Auto-generated types, fully type-safe
const [createTask] = useCreateTaskFromNaturalLanguageMutation({
  variables: { query: '明日までにレポート' } // TypeScript validated
});
```

## Type Safety Benefits

### 1. Compile-Time Validation
- GraphQL schema mismatches caught at build time
- Invalid field selections prevented
- Required variables enforced

### 2. IntelliSense Support
- Auto-complete for fields, arguments
- Inline documentation from GraphQL schema
- Type inference for query results

### 3. Refactoring Safety
- Schema changes auto-detected
- Breaking changes flagged immediately
- Safe renames across codebase

## Integration with Apollo Client

### Apollo Client Configuration
Already configured in `src/lib/apollo-client.ts`:

```typescript
import { ApolloClient, InMemoryCache } from '@apollo/client';

export const apolloClient = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  // ... auth, error handling, etc.
});
```

### Data Access Policy Compliance

All GraphQL operations MUST sync results to IndexedDB:

```typescript
// ✅ Correct: GraphQL → IndexedDB sync
const [createTask] = useCreateTaskFromNaturalLanguageMutation();
const result = await createTask({ variables: { query } });
await addTask(result.data.createTaskFromNaturalLanguage);

// ❌ Wrong: GraphQL-only, no IndexedDB sync
const { data } = useGetAISuggestedTasksQuery();
// Missing: await addTasks(data.aiSuggestedTasks);
```

**See**: `/Users/sanae.abe/workspace/taskflow-app/src/lib/data-access-policy.ts`

## Troubleshooting

### Error: "Cannot fetch schema from http://localhost:4000/graphql"

**Cause**: Backend server not running
**Solution**: Wait for BE-1 completion, then start backend:
```bash
cd ~/workspace/taskflow-app/taskflow-graphql
npm start
```

### Error: "Plugin typescript-react-apollo not found"

**Cause**: Missing plugin dependency
**Solution**: Install missing plugin:
```bash
npm install --save-dev @graphql-codegen/typescript-react-apollo
```

### Error: "GraphQL syntax error in .graphql file"

**Cause**: Invalid GraphQL operation syntax
**Solution**: Validate query at http://localhost:4000/graphql (GraphQL Playground)

### Generated types show 'any'

**Cause**: Missing type mapping in codegen.yml
**Solution**: Add scalar mapping:
```yaml
config:
  scalars:
    DateTime: string
    Date: string
```

## Next Steps (Phase FE-3)

After successful codegen execution:

1. **Error Handling Setup** - GraphQL error handlers with IndexedDB fallback
2. **Custom Hooks Implementation**:
   - `useAITaskCreation.ts`
   - `useAIRecommendations.ts`
   - `useTaskSubscriptions.ts`
3. **UI Components**:
   - AI natural language input component
   - Recommended tasks display
   - Real-time notification system

## References

- **Apollo Client Config**: `src/lib/apollo-client.ts`
- **Data Access Policy**: `src/lib/data-access-policy.ts`
- **GraphQL Operations**: `src/graphql/*.graphql`
- **TODO.md**: Phase FE-2 checklist
- **GraphQL Code Generator Docs**: https://the-guild.dev/graphql/codegen

## Checklist

Phase FE-2 Completion Status:

- [x] Create `codegen.yml` configuration
- [x] Create example `.graphql` files (ai-features, subscriptions)
- [x] Add npm scripts (`codegen`, `codegen:watch`)
- [x] Update `.gitignore` (with notes on generated files)
- [x] Create setup documentation
- [ ] Install `typescript-react-apollo` plugin (when backend ready)
- [ ] Run `npm run codegen` (when BE-1 complete)
- [ ] Verify TypeScript errors: 0
- [ ] Commit generated types

**Ready for**: Phase FE-3 (Error Handling Strategy) after BE-1 completion
