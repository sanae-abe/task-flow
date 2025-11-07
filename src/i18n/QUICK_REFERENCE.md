# i18n Quick Reference Card

## Common Translations

### Actions (common)
| Key | Japanese | English |
|-----|----------|---------|
| `common.save` | 保存 | Save |
| `common.cancel` | キャンセル | Cancel |
| `common.delete` | 削除 | Delete |
| `common.edit` | 編集 | Edit |
| `common.create` | 作成 | Create |
| `common.close` | 閉じる | Close |
| `common.confirm` | 確認 | Confirm |

### Task Actions (task)
| Key | Japanese | English |
|-----|----------|---------|
| `task.create` | タスク作成 | Create Task |
| `task.edit` | タスク編集 | Edit Task |
| `task.delete` | タスクを削除 | Delete Task |
| `task.complete` | 完了 | Complete |
| `task.duplicate` | 複製 | Duplicate |

### Priority Levels (priority)
| Key | Japanese | English |
|-----|----------|---------|
| `priority.critical` | 緊急 | Critical |
| `priority.high` | 高 | High |
| `priority.medium` | 中 | Medium |
| `priority.low` | 低 | Low |
| `priority.none` | 選択なし | None |

### Views (view)
| Key | Japanese | English |
|-----|----------|---------|
| `view.kanban` | カンバン | Kanban |
| `view.table` | テーブル | Table |
| `view.calendar` | カレンダー | Calendar |

### Messages (message)
| Key | Japanese | English |
|-----|----------|---------|
| `message.success` | 成功しました | Success |
| `message.error` | エラーが発生しました | An error occurred |
| `message.warning` | 警告 | Warning |
| `message.info` | 情報 | Information |

### Errors (error)
| Key | Japanese | English |
|-----|----------|---------|
| `error.unknown` | 不明なエラーが発生しました | An unknown error occurred |
| `error.notFound` | 見つかりませんでした | Not found |
| `error.networkError` | ネットワークに接続できません | Cannot connect to network |

## Usage Patterns

### Basic Translation
```typescript
import { translate } from '@/i18n';

const text = translate('common.save', 'ja'); // "保存"
```

### With Variables
```typescript
const message = translate('task.deleteConfirm', 'ja', {
  title: 'My Task'
});
// Output: 「My Task」を削除しますか？
```

### With React i18next
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return <button>{t('common.save')}</button>;
};
```

## Most Used Categories

1. **common** (29 keys) - Buttons, actions, common UI
2. **task** (40 keys) - Task management
3. **priority** (10 keys) - Priority levels
4. **view** (5 keys) - View switching
5. **message** (8 keys) - User feedback
6. **error** (8 keys) - Error messages

## Key Naming Conventions

- **Verbs**: Use action verbs (create, edit, delete)
- **Nouns**: Use descriptive nouns (task, board, label)
- **States**: Use clear state names (completed, overdue, dueToday)
- **Messages**: Use complete phrases (deleteSuccess, createSuccess)

## Interpolation Variables

Common variable names:
- `{{title}}` - Task/item title
- `{{name}}` - Name of entity
- `{{count}}` - Number count
- `{{completed}}` - Completed count
- `{{total}}` - Total count
- `{{days}}` - Number of days
- `{{max}}` - Maximum value
- `{{min}}` - Minimum value
- `{{size}}` - File size

## File Locations

```
src/i18n/
├── locales/
│   ├── ja.json          ← Japanese translations
│   └── en.json          ← English translations
├── types.ts             ← TypeScript types
├── index.ts             ← Main API
└── __tests__/
    └── translate.test.ts ← Tests
```

## Testing

```bash
# Run tests
npm test -- src/i18n/__tests__/translate.test.ts

# Validate JSON
node -e "require('./src/i18n/locales/ja.json')"
```

## Adding New Translations

1. Add to `ja.json`:
```json
{
  "category": {
    "newKey": "新しい値"
  }
}
```

2. Add to `en.json`:
```json
{
  "category": {
    "newKey": "New Value"
  }
}
```

3. Use in code:
```typescript
translate('category.newKey', 'ja')
```

## Tips

- Always add keys to both `ja.json` and `en.json`
- Use consistent naming across related keys
- Group related translations in the same category
- Test in both languages
- Use TypeScript for type safety
- Leverage autocomplete in modern editors

## Complete Documentation

- Full API: [README.md](./README.md)
- Migration Guide: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- Implementation Details: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
