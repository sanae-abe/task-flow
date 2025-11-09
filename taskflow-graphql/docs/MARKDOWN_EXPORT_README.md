# TaskFlow GraphQL Markdown Export Feature

## Overview

This document describes the Markdown Export functionality implemented for the TaskFlow GraphQL API. This feature allows users to export boards, tasks, and filtered task lists as Markdown documents in multiple formats.

## Features

### Export Capabilities

1. **Board Export**: Export entire boards with all tasks organized by columns
2. **Single Task Export**: Export individual tasks with all details
3. **Filtered Task Export**: Export tasks based on custom filters
4. **Markdown Report Generation**: Generate comprehensive reports with metadata

### Supported Markdown Formats

1. **STANDARD**: Basic Markdown format
   - Simple checkboxes and formatting
   - Compatible with most Markdown viewers
   - Ideal for general documentation

2. **GITHUB_FLAVORED**: GitHub-flavored Markdown
   - Enhanced task lists
   - Code-style labels
   - Bold priority indicators
   - Optimized for GitHub repositories

3. **OBSIDIAN**: Obsidian-compatible Markdown
   - YAML frontmatter metadata
   - Tag-based labels (#priority/high)
   - Optimized for Obsidian note-taking app
   - Backlink-friendly format

### Export Options

- **Include/Exclude Completed Tasks**: Filter completed tasks
- **Include/Exclude Subtasks**: Control subtask visibility
- **Include/Exclude Labels**: Toggle label display
- **Include/Exclude Attachments**: Control attachment list visibility
- **Custom Filters**: Filter by status, priority, labels, due date, search query

## Implementation Details

### Files Created

1. **src/schema/schema.graphql** (Extended)
   - Added 60 lines of GraphQL schema definitions
   - New queries: `exportBoardAsMarkdown`, `exportTaskAsMarkdown`, `exportTasksAsMarkdown`
   - New mutation: `generateMarkdownReport`
   - New types: `MarkdownReport`, `MarkdownMetadata`, `MarkdownFormat`, `TaskFilters`

2. **src/utils/markdown-generator.ts** (410 lines)
   - Core Markdown generation logic
   - Format conversion functions
   - Task statistics calculation
   - Frontmatter generation for Obsidian
   - Label, priority, and due date formatting

3. **src/resolvers/markdown-resolvers.ts** (283 lines)
   - GraphQL query resolvers
   - GraphQL mutation resolvers
   - Filter application logic
   - Error handling

4. **src/__tests__/resolvers/markdown-resolvers.test.ts** (603 lines)
   - 25 comprehensive test cases
   - 100% test coverage for resolvers
   - Edge case testing
   - Filter validation tests

5. **docs/MARKDOWN_EXPORT_SAMPLE.md**
   - Sample outputs for all formats
   - Usage examples
   - GraphQL query/mutation examples

### GraphQL Schema

```graphql
# Queries
exportBoardAsMarkdown(boardId: ID!, filters: TaskFilters): String!
exportTaskAsMarkdown(taskId: ID!): String!
exportTasksAsMarkdown(boardId: ID!, filters: TaskFilters): String!

# Mutation
generateMarkdownReport(input: MarkdownReportInput!): MarkdownReport!

# Types
type MarkdownReport {
  content: String!
  generatedAt: DateTime!
  format: MarkdownFormat!
  metadata: MarkdownMetadata!
}

type MarkdownMetadata {
  boardName: String!
  taskCount: Int!
  completedCount: Int!
  includeSubtasks: Boolean!
  includeLabels: Boolean!
  includeAttachments: Boolean!
}

enum MarkdownFormat {
  STANDARD
  GITHUB_FLAVORED
  OBSIDIAN
}

# Input Types
input MarkdownReportInput {
  boardId: ID!
  includeCompleted: Boolean
  includeSubtasks: Boolean
  includeLabels: Boolean
  includeAttachments: Boolean
  format: MarkdownFormat
  filters: TaskFilters
}

input TaskFilters {
  status: TaskStatus
  priority: Priority
  labels: [String!]
  dueBefore: DateTime
  dueAfter: DateTime
  search: String
}
```

## Usage Examples

### 1. Export Entire Board

```graphql
query {
  exportBoardAsMarkdown(boardId: "board-1")
}
```

**Response:**
```
# Board Name

## To Do (3 tasks)
- [ ] Task 1 (🟠 High) #label1
  Task description...

## In Progress (2 tasks)
...

## Statistics
- Total: 10 tasks
- Completed: 3 (30%)
```

### 2. Export Single Task

```graphql
query {
  exportTaskAsMarkdown(taskId: "task-123")
}
```

**Response:**
```
- [ ] Task Title (🟠 High) #label1 #label2
  Task description
  📅 Due: Dec 31, 2025 at 23:59
  - [ ] Subtask 1
  - [x] Subtask 2
  📎 Attachments:
  - file.pdf (2.5 KB)
```

### 3. Export Filtered Tasks

```graphql
query {
  exportTasksAsMarkdown(
    boardId: "board-1"
    filters: {
      priority: HIGH
      status: TODO
      search: "urgent"
    }
  )
}
```

### 4. Generate Markdown Report

```graphql
mutation {
  generateMarkdownReport(
    input: {
      boardId: "board-1"
      format: GITHUB_FLAVORED
      includeCompleted: false
      includeSubtasks: true
      includeLabels: true
      includeAttachments: true
      filters: {
        priority: HIGH
      }
    }
  ) {
    content
    generatedAt
    format
    metadata {
      boardName
      taskCount
      completedCount
    }
  }
}
```

**Response:**
```json
{
  "data": {
    "generateMarkdownReport": {
      "content": "# Board Name\n\n## To Do (2 tasks)\n...",
      "generatedAt": "2025-11-08T22:48:00Z",
      "format": "GITHUB_FLAVORED",
      "metadata": {
        "boardName": "Test Board",
        "taskCount": 5,
        "completedCount": 2
      }
    }
  }
}
```

## Testing

### Test Coverage

- **Total Tests**: 25
- **Test Categories**:
  - Query resolver tests (9 tests)
  - Mutation resolver tests (11 tests)
  - Edge case tests (5 tests)

### Running Tests

```bash
# Run markdown tests only
npm run test:run -- markdown

# Run all tests with coverage
npm run test:coverage
```

### Test Results

```
✓ src/__tests__/resolvers/markdown-resolvers.test.ts  (25 tests) 15ms

Test Files  1 passed (1)
     Tests  25 passed (25)
```

## Features Demonstrated

### 1. Task Formatting

- **Checkboxes**: `[ ]` for incomplete, `[x]` for completed
- **Priority Badges**: Visual indicators (🔴🟠🟡🟢)
- **Labels**: Context-aware formatting per format
- **Due Dates**: Formatted with overdue warnings (⚠️)

### 2. Subtask Support

- Nested checkbox lists
- Position-based ordering
- Completion status tracking

### 3. Attachment Support

- File name and size display
- Organized list format

### 4. Statistics

- Total task count
- Completion rate (percentage)
- Overdue task warnings
- Priority breakdown

### 5. Format-Specific Features

**Standard Format:**
- Clean, simple Markdown
- Compatible with all viewers

**GitHub Flavored:**
- Bold priority labels
- Code-style tags
- Enhanced task lists

**Obsidian Format:**
- YAML frontmatter
- Hashtag-based labels
- Generated metadata

## Code Structure

### markdown-generator.ts

```typescript
// Main export functions
generateTaskMarkdown()       // Single task
generateTasksMarkdown()      // Multiple tasks by column
generateBoardMarkdown()      // Full board export

// Formatting functions
formatPriority()             // Priority badge
formatLabels()               // Label formatting
formatDueDate()              // Date with overdue detection
formatSubtasks()             // Subtask list
formatAttachments()          // Attachment list

// Statistics functions
calculateStats()             // Task statistics
generateStatistics()         // Statistics section
generateObsidianFrontmatter() // YAML frontmatter
generateMetadataFooter()     // Export metadata

// Utility functions
generateMarkdownFilename()   // Export filename
getMarkdownExtension()       // File extension
```

### markdown-resolvers.ts

```typescript
// Query resolvers
exportBoardAsMarkdown()      // Full board export
exportTaskAsMarkdown()       // Single task export
exportTasksAsMarkdown()      // Filtered tasks export

// Mutation resolvers
generateMarkdownReport()     // Comprehensive report generation

// Helper functions
convertMarkdownFormat()      // Format enum conversion
applyTaskFilters()           // Filter application logic
```

## Performance Considerations

1. **Lazy Loading**: Statistics calculated only when needed
2. **Efficient Filtering**: Multiple filters applied in single pass
3. **Memory Efficient**: String concatenation optimized
4. **Date Formatting**: Uses date-fns for consistent formatting

## Error Handling

- Board not found: GraphQLError with NOT_FOUND code
- Task not found: GraphQLError with NOT_FOUND code
- Invalid filters: Graceful degradation
- Null safety: All optional fields handled

## Future Enhancements

Potential features for future development:

1. **Additional Formats**:
   - Notion-compatible Markdown
   - Jira-compatible format
   - Plain text export

2. **Advanced Filtering**:
   - Date range presets (this week, this month)
   - Assignee filtering
   - Custom field filtering

3. **Templating**:
   - Custom Markdown templates
   - User-defined formatting rules
   - Variable substitution

4. **Export Options**:
   - Direct file download
   - Email delivery
   - Cloud storage integration

5. **Batch Operations**:
   - Export multiple boards at once
   - Scheduled exports
   - Automated report generation

## Dependencies

- **date-fns**: Date formatting (already in package.json)
- **GraphQL**: Schema and resolvers
- **TypeScript**: Type safety

## Backward Compatibility

- No breaking changes to existing schema
- All new fields are optional
- Existing queries/mutations unaffected

## Documentation

- GraphQL schema documentation: Auto-generated
- Code documentation: Comprehensive JSDoc comments
- Sample outputs: See MARKDOWN_EXPORT_SAMPLE.md
- Usage examples: Included in this document

## Integration

The Markdown export feature integrates seamlessly with:

- Existing board queries
- Task filtering system
- Label management
- File attachment system

## Security

- Board ID validation
- Task ID validation
- Filter sanitization
- No file system access (returns strings only)

## Conclusion

The Markdown Export feature provides a robust, flexible, and well-tested solution for exporting TaskFlow data to Markdown format. With support for three different Markdown flavors and comprehensive filtering options, it meets a wide range of use cases from simple task exports to complex board reports.
