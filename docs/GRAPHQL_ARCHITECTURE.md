# GraphQL Architecture - TaskFlow Application

**Last Updated**: 2025-11-09
**Status**: Phase FE-2 Complete (Awaiting BE-1)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    TaskFlow Frontend (React)                     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  UI Components                              │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │ │
│  │  │ AI Task      │  │ Recommended  │  │ Real-time    │     │ │
│  │  │ Input        │  │ Tasks Panel  │  │ Notifications│     │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │ │
│  └─────────┼──────────────────┼──────────────────┼────────────┘ │
│            │                  │                  │              │
│  ┌─────────▼──────────────────▼──────────────────▼────────────┐ │
│  │              Custom React Hooks Layer                      │ │
│  │  ┌──────────────────┐  ┌──────────────────────────────┐   │ │
│  │  │useAITaskCreation │  │ useAIRecommendations         │   │ │
│  │  │                  │  │                              │   │ │
│  │  │ - XSS sanitize   │  │ - Network-only fetch         │   │ │
│  │  │ - IndexedDB sync │  │ - IndexedDB sync             │   │ │
│  │  │ - Error fallback │  │ - Error fallback             │   │ │
│  │  └──────────────────┘  └──────────────────────────────┘   │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │useTaskSubscriptions                                  │ │ │
│  │  │                                                      │ │ │
│  │  │ - WebSocket reconnect                               │ │ │
│  │  │ - Real-time IndexedDB sync                          │ │ │
│  │  │ - Connection error handling                         │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └─────────┬────────────────────────────────────────────────┘ │
│            │                                                   │
│  ┌─────────▼────────────────────────────────────────────────┐ │
│  │         Generated GraphQL Hooks (Auto-generated)         │ │
│  │                                                           │ │
│  │  useCreateTaskFromNaturalLanguageMutation()              │ │
│  │  useGetAISuggestedTasksQuery()                           │ │
│  │  useGetNextRecommendedTaskQuery()                        │ │
│  │  useOnTaskCreatedSubscription()                          │ │
│  │  useOnTaskUpdatedSubscription()                          │ │
│  │                                                           │ │
│  │  Source: src/generated/graphql.ts (1000-2000 lines)      │ │
│  └─────────┬─────────────────────────────────────────────────┘ │
│            │                                                   │
│  ┌─────────▼─────────────────────────────────────────────────┐ │
│  │              Apollo Client (FE-1)                         │ │
│  │                                                           │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │ │
│  │  │ Auth Link   │  │ Error Link   │  │ HTTP/WS Links  │  │ │
│  │  │             │  │              │  │                │  │ │
│  │  │ x-user-plan │  │ Fallback to  │  │ GraphQL API    │  │ │
│  │  │ x-user-id   │  │ IndexedDB    │  │ WebSocket      │  │ │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │ │
│  │                                                           │ │
│  │  InMemoryCache: Task/Board typePolicies                  │ │
│  └─────────┬─────────────────────────────────────────────────┘ │
│            │                                                   │
└────────────┼───────────────────────────────────────────────────┘
             │
             │ HTTP/WebSocket
             │
┌────────────▼───────────────────────────────────────────────────┐
│              Backend GraphQL Server (BE-1)                     │
│                                                                 │
│  Apollo Server 4.x @ http://localhost:4000/graphql             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ AI Resolvers │  │ Task         │  │ Subscription         │ │
│  │              │  │ Resolvers    │  │ Resolvers            │ │
│  │ - NLP        │  │              │  │                      │ │
│  │ - ML model   │  │ - CRUD       │  │ - PubSub             │ │
│  │ - Context AI │  │ - Filters    │  │ - Real-time events   │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                                 │
│  Schema: 667 lines (types, queries, mutations, subscriptions)  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   Data Persistence Layer                        │
│                                                                  │
│  IndexedDB (Primary)                                            │
│  - Offline-first storage                                        │
│  - Task/Board/Label CRUD                                        │
│  - Synced from GraphQL results                                  │
│                                                                  │
│  Future: Supabase (Phase 8+)                                    │
│  - Multi-device sync                                            │
│  - Team collaboration                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow: AI Task Creation

```
1. User Input
   ↓
   "明日までにレポート"
   ↓

2. Custom Hook (useAITaskCreation)
   ↓
   - Validation
   - Prepare variables
   ↓

3. Generated Hook (useCreateTaskFromNaturalLanguageMutation)
   ↓
   - Type-safe GraphQL mutation
   - Apollo Client execution
   ↓

4. Apollo Client
   ┌─────────────────────────────┐
   │ Auth Link                   │
   │ - Add x-user-plan header    │
   │ - Add x-user-id header      │
   ├─────────────────────────────┤
   │ Error Link                  │
   │ - Catch network errors      │
   │ - Fallback to IndexedDB     │
   ├─────────────────────────────┤
   │ HTTP Link                   │
   │ - POST to GraphQL API       │
   └─────────────────────────────┘
   ↓

5. Backend GraphQL API
   ↓
   mutation CreateTaskFromNaturalLanguage {
     query: "明日までにレポート"
   }
   ↓
   - NLP parsing
   - AI model inference
   - Task object generation
   ↓
   Response: {
     id: "task-123",
     title: "レポート作成",
     dueDate: "2025-11-10T23:59:59Z",
     priority: "high",
     ...
   }
   ↓

6. Custom Hook (useAITaskCreation)
   ┌─────────────────────────────┐
   │ XSS Sanitization            │
   │ - DOMPurify.sanitize(title) │
   │ - DOMPurify.sanitize(desc)  │
   ├─────────────────────────────┤
   │ IndexedDB Sync (Required)   │
   │ - await addTask(sanitized)  │
   ├─────────────────────────────┤
   │ UI Update                   │
   │ - Toast notification        │
   │ - Kanban board refresh      │
   └─────────────────────────────┘
   ↓

7. User sees new task in UI
```

## Code Generator Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. GraphQL Operations (Developer writes)                        │
│                                                                  │
│    src/graphql/ai-features.graphql                              │
│    ┌────────────────────────────────────────────────────────┐   │
│    │ mutation CreateTaskFromNaturalLanguage(                │   │
│    │   $query: String!                                      │   │
│    │ ) {                                                    │   │
│    │   createTaskFromNaturalLanguage(query: $query) {       │   │
│    │     id title description priority dueDate ...          │   │
│    │   }                                                    │   │
│    │ }                                                      │   │
│    └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ npm run codegen
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. GraphQL Code Generator (codegen.yml)                         │
│                                                                  │
│    Fetches schema from: http://localhost:4000/graphql           │
│    Reads operations: src/graphql/**/*.graphql                   │
│                                                                  │
│    Plugins:                                                      │
│    - typescript              → Type definitions                 │
│    - typescript-operations   → Operation types                  │
│    - typescript-react-apollo → React hooks                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Generates
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Generated Types (Auto-generated, DO NOT EDIT)                │
│                                                                  │
│    src/generated/graphql.ts (~1000-2000 lines)                  │
│    ┌────────────────────────────────────────────────────────┐   │
│    │ // Type definitions                                    │   │
│    │ export type Task = {                                   │   │
│    │   id: string;                                          │   │
│    │   title: string;                                       │   │
│    │   description?: string | null;                         │   │
│    │   priority: Priority;                                  │   │
│    │   dueDate?: string | null;                             │   │
│    │   ...                                                  │   │
│    │ }                                                      │   │
│    │                                                        │   │
│    │ // Mutation types                                     │   │
│    │ export type CreateTaskFromNaturalLanguageMutation = {  │   │
│    │   createTaskFromNaturalLanguage: Task;                 │   │
│    │ }                                                      │   │
│    │                                                        │   │
│    │ // React hooks                                        │   │
│    │ export function useCreateTaskFromNaturalLanguage      │   │
│    │   Mutation(options?) {                                │   │
│    │   return useMutation<                                 │   │
│    │     CreateTaskFromNaturalLanguageMutation,            │   │
│    │     CreateTaskFromNaturalLanguageMutationVariables    │   │
│    │   >(CREATE_TASK_FROM_NL_DOCUMENT, options);           │   │
│    │ }                                                      │   │
│    └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Import
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Custom Hooks (Developer implements)                          │
│                                                                  │
│    src/hooks/useAITaskCreation.ts                               │
│    ┌────────────────────────────────────────────────────────┐   │
│    │ import {                                               │   │
│    │   useCreateTaskFromNaturalLanguageMutation             │   │
│    │ } from '@/generated/graphql';                          │   │
│    │                                                        │   │
│    │ export const useAITaskCreation = () => {               │   │
│    │   const [mutate] = useCreateTaskFromNaturalLanguage... │   │
│    │                                                        │   │
│    │   return {                                             │   │
│    │     createTask: async (query: string) => {             │   │
│    │       const result = await mutate({ variables });      │   │
│    │       const sanitized = DOMPurify.sanitize(...);       │   │
│    │       await addTask(sanitized); // IndexedDB sync      │   │
│    │     }                                                  │   │
│    │   };                                                   │   │
│    │ }                                                      │   │
│    └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Layers                              │
│                                                                  │
│  Layer 1: Input Validation                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ - GraphQL schema validation (backend)                    │   │
│  │ - Required fields enforcement                            │   │
│  │ - Type checking (string, number, etc.)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Layer 2: Authentication                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ - Header-based auth (x-user-plan, x-user-id)             │   │
│  │ - LocalStorage → Apollo authLink                         │   │
│  │ - Future: JWT tokens (Phase 2)                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Layer 3: XSS Protection                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ - DOMPurify sanitization (all AI content)                │   │
│  │ - React automatic escaping                               │   │
│  │ - No dangerouslySetInnerHTML without sanitization        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Layer 4: Network Security                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ - CORS configuration (backend)                           │   │
│  │ - Error message sanitization (no stack traces)           │   │
│  │ - Rate limiting (future)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Layer 5: Data Access Policy                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ - GraphQL → IndexedDB sync (mandatory)                   │   │
│  │ - No direct IndexedDB access from GraphQL resolvers      │   │
│  │ - Clear separation of concerns                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Performance Considerations

### Bundle Size Impact
```
Current Bundle: 476KB (gzip)
+ Apollo Client: ~150KB (already installed)
+ GraphQL operations: ~5-10KB
+ Generated types: 0KB (TypeScript only)
─────────────────────────────────
Total: ~486KB (still under 500KB goal)
```

### Code Splitting Strategy
```
Main chunk: React + UI components (300KB)
Apollo chunk: @apollo/client + graphql (150KB)
Vendor chunk: Other dependencies (remaining)
```

### Fetch Policies
```
AI Features:
- fetchPolicy: 'network-only'
- Reason: Always get fresh AI recommendations

Regular Tasks:
- fetchPolicy: 'cache-and-network'
- Reason: Fast UI + background sync

Subscriptions:
- Automatic reconnect on disconnect
- Fallback to polling if WebSocket fails
```

## File Structure

```
taskflow-app/
├── codegen.yml                          # GraphQL Code Generator config
├── src/
│   ├── graphql/                         # GraphQL operations (hand-written)
│   │   ├── ai-features.graphql          # AI mutations & queries
│   │   ├── subscriptions.graphql        # Real-time subscriptions
│   │   ├── README.md                    # Operations documentation
│   │   └── QUICK_START.md               # Quick reference
│   │
│   ├── generated/                       # Auto-generated (DO NOT EDIT)
│   │   ├── .gitkeep                     # Placeholder
│   │   └── graphql.ts                   # Generated types & hooks
│   │
│   ├── lib/
│   │   ├── apollo-client.ts             # Apollo Client setup (FE-1)
│   │   └── data-access-policy.ts        # Data access rules
│   │
│   └── hooks/                           # Custom hooks (future FE-4)
│       ├── useAITaskCreation.ts
│       ├── useAIRecommendations.ts
│       └── useTaskSubscriptions.ts
│
└── docs/
    ├── GRAPHQL_CODEGEN_SETUP.md         # Setup guide
    ├── FE-2_COMPLETION_SUMMARY.md       # Phase completion
    └── GRAPHQL_ARCHITECTURE.md          # This file
```

## Development Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│ Development Mode                                                 │
│                                                                  │
│  Terminal 1: Backend Server                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ cd taskflow-graphql                                      │   │
│  │ npm start                                                │   │
│  │ → GraphQL server @ http://localhost:4000/graphql         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Terminal 2: Frontend Server                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ cd taskflow-app                                          │   │
│  │ npm start                                                │   │
│  │ → Vite dev server @ http://localhost:5173                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Terminal 3: Code Generator (Watch Mode)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ cd taskflow-app                                          │   │
│  │ npm run codegen:watch                                    │   │
│  │ → Watches src/graphql/*.graphql for changes              │   │
│  │ → Auto-regenerates src/generated/graphql.ts              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Change GraphQL Operation                                       │
│         ↓                                                        │
│  Codegen detects change                                         │
│         ↓                                                        │
│  Regenerates types (1-2 seconds)                                │
│         ↓                                                        │
│  TypeScript errors show up in IDE                               │
│         ↓                                                        │
│  Fix code → Save                                                │
│         ↓                                                        │
│  Vite HMR updates browser                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Testing Strategy

```
Unit Tests (Vitest + MockedProvider)
├── Custom hooks tests
│   └── Mock GraphQL responses
│
Integration Tests (Vitest)
├── Apollo Client integration
│   └── Real GraphQL calls (test server)
│
E2E Tests (Playwright)
└── Full user flows with backend
    └── AI task creation → UI update → IndexedDB sync
```

## Monitoring & Debugging

```
Development Tools:
├── GraphQL Playground: http://localhost:4000/graphql
│   └── Test queries/mutations manually
│
├── Apollo Client DevTools (Chrome Extension)
│   ├── View cache state
│   ├── Inspect queries
│   └── Track mutations
│
├── React DevTools
│   └── Component hierarchy + hooks state
│
└── Network Tab (Browser DevTools)
    ├── GraphQL requests
    ├── WebSocket connections
    └── Response payloads
```

## Migration Path (Future)

```
Phase 1 (Current): IndexedDB + GraphQL (AI only)
├── Primary: IndexedDB CRUD
├── GraphQL: AI features, TODO.md sync (MCP)
└── Status: ✅ FE-2 Complete

Phase 2 (1-2 months): Enhanced GraphQL
├── Add: JWT authentication
├── Add: More AI features
└── Keep: IndexedDB as primary

Phase 3 (3-6 months): Supabase Migration
├── GraphQL resolvers → Supabase backend
├── Gradual IndexedDB → Supabase migration
└── Keep: Offline-first with IndexedDB cache

Phase 4 (6+ months): Full Cloud Sync
├── Multi-device sync
├── Team collaboration
└── IndexedDB as offline cache only
```

## References

- **TODO.md**: GraphQL Integration Roadmap (Phase 0-8)
- **Data Access Policy**: `src/lib/data-access-policy.ts`
- **Apollo Client Config**: `src/lib/apollo-client.ts`
- **Backend Coordination**: `docs/BACKEND_COORDINATION_RESPONSE.md`

---

**Status**: ✅ Architecture documented, FE-2 complete
**Next**: FE-3 - Error Handling Strategy (2-3 days)
