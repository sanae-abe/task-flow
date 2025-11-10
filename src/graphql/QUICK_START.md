# GraphQL Code Generator - Quick Start

**Status**: ⏳ Awaiting Backend BE-1
**When Ready**: Install plugin → Run codegen → Use generated hooks

## Quick Commands

```bash
# When backend is ready (BE-1 complete):

# 1. Install missing plugin
npm install --save-dev @graphql-codegen/typescript-react-apollo

# 2. Start backend (separate terminal)
cd ~/workspace/taskflow-app/taskflow-graphql
npm start  # http://localhost:4000/graphql

# 3. Generate types (one-time)
npm run codegen

# 4. Or use watch mode (recommended)
npm run codegen:watch
```

## Generated Hooks Usage

### AI Task Creation
```typescript
import { useCreateTaskFromNaturalLanguageMutation } from '@/generated/graphql';
import { addTask } from '@/lib/idb-helpers';
import DOMPurify from 'dompurify';

const [createTask, { loading, error }] = useCreateTaskFromNaturalLanguageMutation();

const handleCreate = async () => {
  const result = await createTask({
    variables: { query: '明日までにレポート' }
  });

  // ✅ Required: Sync to IndexedDB
  const task = result.data.createTaskFromNaturalLanguage;

  // ✅ Required: XSS protection
  const sanitizedTask = {
    ...task,
    title: DOMPurify.sanitize(task.title),
    description: DOMPurify.sanitize(task.description)
  };

  await addTask(sanitizedTask);
};
```

### AI Recommendations
```typescript
import { useGetAISuggestedTasksQuery } from '@/generated/graphql';

const { data, loading, error } = useGetAISuggestedTasksQuery({
  variables: {
    context: { boardId: currentBoardId }
  },
  fetchPolicy: 'network-only' // Always fresh AI data
});

if (data) {
  const suggestions = data.aiSuggestedTasks;
  // ✅ Required: Sync to IndexedDB
  await addTasks(suggestions);
}
```

### Real-time Subscriptions
```typescript
import { useOnTaskCreatedSubscription } from '@/generated/graphql';

useOnTaskCreatedSubscription({
  variables: { boardId: 'board-1' },
  onData: ({ data }) => {
    // ✅ Required: Sync to IndexedDB
    addTask(data.data.taskCreated);
  }
});
```

## File Locations

```
taskflow-app/
├── codegen.yml                    # Config
├── src/
│   ├── graphql/
│   │   ├── ai-features.graphql    # AI operations
│   │   ├── subscriptions.graphql  # Real-time
│   │   └── README.md              # Full docs
│   ├── generated/
│   │   └── graphql.ts            # Auto-generated (after codegen)
│   └── lib/
│       └── apollo-client.ts       # Apollo setup (FE-1)
└── docs/
    ├── GRAPHQL_CODEGEN_SETUP.md   # Full guide
    └── FE-2_COMPLETION_SUMMARY.md # Summary
```

## Common Issues

### "Cannot fetch schema"
**Solution**: Start backend server first
```bash
cd ~/workspace/taskflow-app/taskflow-graphql
npm start
```

### "Plugin typescript-react-apollo not found"
**Solution**: Install plugin
```bash
npm install --save-dev @graphql-codegen/typescript-react-apollo
```

### TypeScript errors after generation
**Solution**: Restart TypeScript server
- VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"

## Must Remember

1. ✅ **Always sync GraphQL results to IndexedDB**
2. ✅ **Sanitize AI content with DOMPurify**
3. ✅ **Use network-only for AI queries**
4. ✅ **Handle errors with IndexedDB fallback**

## Next Steps (Phase FE-3)

After successful codegen:
- Implement error handlers
- Create custom hooks (useAITaskCreation, etc.)
- Build UI components

## Documentation

- **Full Setup**: `docs/GRAPHQL_CODEGEN_SETUP.md`
- **Operations**: `src/graphql/README.md`
- **Data Policy**: `src/lib/data-access-policy.ts`
