# GraphQL Operations

This directory contains all GraphQL operations (queries, mutations, subscriptions) for the TaskFlow application.

## Structure

```
src/graphql/
├── ai-features.graphql     # AI-powered task management operations
├── subscriptions.graphql   # Real-time WebSocket subscriptions
└── README.md              # This file
```

## Operations Overview

### AI Features (`ai-features.graphql`)

**Mutations:**
- `CreateTaskFromNaturalLanguage` - Convert natural language to structured task
  - Input: "明日までにレポート"
  - Output: Task with dueDate, priority, auto-generated fields

**Queries:**
- `GetAISuggestedTasks` - AI-recommended tasks based on context
- `GetNextRecommendedTask` - Next highest-priority task to work on
- `GetAITaskInsights` - Batch analysis of multiple tasks

### Subscriptions (`subscriptions.graphql`)

**Task Events:**
- `OnTaskCreated` - Real-time task creation notifications
- `OnTaskUpdated` - Task modification events
- `OnTaskDeleted` - Task deletion/recycle bin events

**Board Events:**
- `OnBoardUpdated` - Board settings changes

**Collaboration:**
- `OnUserPresence` - Active users on board (cursors, editing)

## Usage with Code Generator

### Type Generation
```bash
npm run codegen        # Generate once
npm run codegen:watch  # Watch mode
```

### Generated Hooks
```typescript
// Mutation hooks
useCreateTaskFromNaturalLanguageMutation()

// Query hooks
useGetAISuggestedTasksQuery()
useGetNextRecommendedTaskQuery()

// Subscription hooks
useOnTaskCreatedSubscription()
useOnTaskUpdatedSubscription()
```

## Security & Data Access

### XSS Protection
All AI-generated content MUST be sanitized with DOMPurify:

```typescript
import DOMPurify from 'dompurify';

const [createTask] = useCreateTaskFromNaturalLanguageMutation();
const result = await createTask({ variables: { query } });

// Sanitize before rendering
const sanitizedTitle = DOMPurify.sanitize(result.data.title);
```

### IndexedDB Sync (Required)
GraphQL operations MUST sync results to IndexedDB per Data Access Policy:

```typescript
// ✅ Correct
const { data } = useGetAISuggestedTasksQuery();
await addTasks(data.aiSuggestedTasks); // Sync to IndexedDB

// ❌ Wrong - Missing IndexedDB sync
const { data } = useGetAISuggestedTasksQuery();
// Render data directly without persisting
```

**Policy Document**: `/Users/sanae.abe/workspace/taskflow-app/src/lib/data-access-policy.ts`

## Fetch Policies

### AI Features (network-only)
AI recommendations always fetch fresh data:

```typescript
const { data } = useGetAISuggestedTasksQuery({
  fetchPolicy: 'network-only' // Default in apollo-client.ts
});
```

### Offline Fallback
Network errors automatically fall back to IndexedDB:

```typescript
const { data, error } = useGetNextRecommendedTaskQuery({
  onError: (error) => {
    // Fallback to IndexedDB
    const cachedTask = await getTasksFromIndexedDB();
  }
});
```

## Adding New Operations

### 1. Create Operation File
```graphql
# src/graphql/my-feature.graphql
query GetMyData($id: ID!) {
  myData(id: $id) {
    id
    name
  }
}
```

### 2. Generate Types
```bash
npm run codegen
```

### 3. Use Generated Hook
```typescript
import { useGetMyDataQuery } from '@/generated/graphql';

const { data, loading, error } = useGetMyDataQuery({
  variables: { id: '123' }
});
```

## Testing

### Apollo MockedProvider
```typescript
import { MockedProvider } from '@apollo/client/testing';
import { GetAISuggestedTasksDocument } from '@/generated/graphql';

const mocks = [
  {
    request: {
      query: GetAISuggestedTasksDocument,
      variables: { context: { boardId: 'board-1' } }
    },
    result: {
      data: {
        aiSuggestedTasks: [/* mock data */]
      }
    }
  }
];

<MockedProvider mocks={mocks}>
  <MyComponent />
</MockedProvider>
```

## GraphQL Schema Source

**Development**: http://localhost:4000/graphql
**Backend Repository**: `~/workspace/taskflow-app/taskflow-graphql`

## Related Documentation

- **Setup Guide**: `/Users/sanae.abe/workspace/taskflow-app/docs/GRAPHQL_CODEGEN_SETUP.md`
- **Apollo Client Config**: `/Users/sanae.abe/workspace/taskflow-app/src/lib/apollo-client.ts`
- **Data Access Policy**: `/Users/sanae.abe/workspace/taskflow-app/src/lib/data-access-policy.ts`
- **TODO.md**: Phase FE-2 - GraphQL Code Generator Setup

## Notes

- TODO.md sync is MCP-only feature, excluded from GraphQL operations
- All operations follow strict TypeScript types (no `any`)
- WebSocket subscriptions require backend WebSocket support (BE-1)
- Generated types are committed to version control for team type safety
