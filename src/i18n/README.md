# TaskFlow i18n (Internationalization)

## Overview

This directory contains internationalization resources for the TaskFlow application, providing comprehensive translation support for Japanese (ja) and English (en) locales.

## Directory Structure

```
src/i18n/
├── locales/
│   ├── ja.json    # Japanese translations
│   └── en.json    # English translations
├── types.ts       # TypeScript type definitions
├── index.ts       # Module entry point
└── README.md      # This file
```

## Translation Categories

### 1. common (27 keys)
Common UI elements used throughout the application:
- Actions: save, cancel, delete, edit, create, close, confirm
- Navigation: back, next
- Selection: select, unselect, selectAll, unselectAll
- States: loading, none, notSet, required, optional
- Data states: noData, noResults

### 2. app (7 keys)
Application-level strings:
- title, description
- offline, online
- settings, help, about

### 3. task (34 keys)
Task-related translations:
- Fields: title, description, status, priority, dueDate, labels, attachments, subtasks
- Actions: create, edit, delete, complete, uncomplete, duplicate, move, archive, restore
- Success messages: deleteSuccess, createSuccess, updateSuccess, etc.
- States: overdue, dueToday, dueTomorrow, noDueDate

### 4. priority (10 keys)
Priority levels and descriptions:
- Levels: critical, high, medium, low, none
- Descriptions for each priority level

### 5. subtask (10 keys)
Subtask management:
- Actions: add, edit, delete, complete
- Display: progress, completed count
- States: noSubtasks

### 6. label (16 keys)
Label management:
- Fields: name, color
- Actions: create, edit, delete, manage
- Selection: selectLabel, selectedLabels
- Categories: currentBoard, otherBoards

### 7. board (14 keys)
Board management:
- Fields: name, description
- Actions: create, edit, delete, select
- Settings: defaultColumn, defaultColumnDescription

### 8. column (13 keys)
Column management:
- Actions: create, edit, delete, moveLeft, moveRight
- Display: taskCount
- Settings: settings

### 9. view (5 keys)
View types and switching:
- kanban, table, calendar, list
- switchView

### 10. tableView (6 keys)
Table view specific:
- columns, showColumns, hideColumns
- customizeColumns
- taskCount, noTasks

### 11. calendarView (5 keys)
Calendar view specific:
- Navigation: today, month, week, day
- noEvents

### 12. template (18 keys)
Template management:
- Fields: name, category
- Actions: create, edit, delete, manage, use
- Favorites: favorite, addToFavorites, removeFromFavorites
- Categories: work, personal, shopping, health, study, other

### 13. recycleBin (15 keys)
Recycle bin functionality:
- Actions: manage, empty, restore, permanentDelete
- Settings: retentionPeriod, autoDelete
- Display: deletedAt, noItems

### 14. data (13 keys)
Data management:
- Actions: export, import, exportAll, exportCurrent
- Statistics: totalTasks, completedTasks, totalBoards, totalLabels

### 15. settings (10 keys)
Application settings:
- Categories: general, appearance, notifications
- Options: language, theme, lightMode, darkMode, autoMode

### 16. filter (9 keys)
Filtering options:
- States: all, completed, incomplete, overdue, dueToday, noDueDate
- Types: priority, label
- Actions: clearFilters

### 17. sort (7 keys)
Sorting options:
- Fields: priority, dueDate, createdAt, updatedAt, title
- Directions: ascending, descending

### 18. recurrence (15 keys)
Task recurrence settings:
- Types: none, daily, weekly, monthly, yearly, custom
- Settings: interval, endDate, endAfter, noEnd, occurrences
- Weekdays: monday through sunday

### 19. form (8 keys)
Form validation and file upload:
- Validation: required, invalidEmail, invalidUrl, tooLong, tooShort
- File upload: uploadFile, dragDropFile, maxFileSize

### 20. message (8 keys)
User feedback messages:
- Types: success, error, warning, info
- Confirmations: confirmAction, unsavedChanges
- Errors: networkError, sessionExpired

### 21. error (8 keys)
Error messages:
- Types: unknown, notFound, unauthorized, forbidden
- Server: serverError, validationError
- Network: networkError, timeout

### 22. attachment (11 keys)
File attachment management:
- Actions: add, delete, download, preview
- States: uploading, uploadSuccess, uploadError

### 23. time (15 keys)
Time-related strings:
- Selection: selectTime, hour, minute, am, pm
- Relative: now, today, tomorrow, yesterday
- Periods: thisWeek, nextWeek, lastWeek, thisMonth, nextMonth, lastMonth

### 24. accessibility (8 keys)
Accessibility labels:
- States: loading
- Actions: closeDialog, openMenu, closeMenu, selectOption, clearSelection
- Features: dragHandle, sortable

## Usage Examples

### Basic Usage

```typescript
import { translate, buildKey } from '@/i18n';

// Simple translation
const saveText = translate('common.save'); // "保存" (ja) or "Save" (en)

// Translation with variables
const deleteConfirm = translate(
  'task.deleteConfirm',
  'ja',
  { title: 'My Task' }
); // "「My Task」を削除しますか？"

// Type-safe key building
const taskCreateKey = buildKey('task', 'create'); // "task.create"
```

### Type-Safe Translation

```typescript
import type { TranslateFn, NestedTranslationKey } from '@/i18n';

const t: TranslateFn = (key, variables) => {
  return translate(key, currentLocale, variables);
};

// Type-safe usage
const text = t('task.create'); // ✓ Valid
const invalid = t('task.invalid'); // ✗ Type error
```

### Integration with i18next (Recommended)

For production use, integrate with i18next:

```typescript
import i18next from 'i18next';
import { resources, defaultLocale } from '@/i18n';

i18next.init({
  lng: defaultLocale,
  resources: {
    ja: { translation: resources.ja },
    en: { translation: resources.en },
  },
});

// Usage
const { t } = useTranslation();
t('task.create'); // "タスク作成" or "Create Task"
t('task.deleteConfirm', { title: 'Task 1' }); // With interpolation
```

## Statistics

- **Total Translation Keys**: ~300
- **Categories**: 24
- **Supported Languages**: 2 (Japanese, English)
- **Coverage**: 100% for all UI strings

## Adding New Translations

1. Add the key to both `ja.json` and `en.json` in the same category
2. Follow the existing naming conventions (camelCase)
3. Use interpolation variables with `{{variableName}}` syntax
4. Ensure type safety by referencing the TypeScript types

### Example: Adding a new key

```json
// ja.json
{
  "task": {
    // ... existing keys
    "newFeature": "新機能"
  }
}

// en.json
{
  "task": {
    // ... existing keys
    "newFeature": "New Feature"
  }
}
```

## Best Practices

1. **Use Nested Keys**: Organize translations by feature/component
2. **Interpolation**: Use variables for dynamic content
3. **Consistency**: Follow existing naming patterns
4. **Type Safety**: Leverage TypeScript types for compile-time checking
5. **Testing**: Test translations in both locales

## Translation Guidelines

### Japanese (ja)
- Use polite form (です・ます調)
- Keep professional tone
- Use appropriate kanji/hiragana balance
- Consistent terminology across all strings

### English (en)
- Use clear, concise language
- Maintain consistent terminology
- Follow UI/UX writing best practices
- Use title case for headings, sentence case for messages

## Future Enhancements

- [ ] Add more locales (zh-CN, ko, etc.)
- [ ] Implement pluralization support
- [ ] Add context-specific translations
- [ ] Create translation management tool
- [ ] Add automated translation validation

## License

Same as the main project.
