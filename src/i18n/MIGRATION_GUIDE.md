# i18n Migration Guide

## Overview

This guide helps you integrate the new i18n translation system into existing TaskFlow components.

## Quick Start

### 1. Basic Setup (Standalone)

```typescript
import { translate } from '@/i18n';

// In your component
const MyComponent = () => {
  const saveText = translate('common.save', 'ja'); // "保存"

  return <button>{saveText}</button>;
};
```

### 2. With i18next (Recommended for Production)

First, install i18next:

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

Create i18n configuration:

```typescript
// src/config/i18n.ts
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources, defaultLocale } from '@/i18n';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ja: { translation: resources.ja },
      en: { translation: resources.en },
    },
    lng: defaultLocale,
    fallbackLng: 'ja',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18next;
```

Initialize in your app:

```typescript
// src/index.tsx
import './config/i18n'; // Import before App
import App from './App';
```

Use in components:

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <>
      <button>{t('common.save')}</button>
      <p>{t('task.deleteConfirm', { title: 'My Task' })}</p>
    </>
  );
};
```

## Migration Examples

### Example 1: Hardcoded Strings

**Before:**

```typescript
const Header = () => (
  <header>
    <Button>タスク作成</Button>
    <Button>設定</Button>
    <Button>ヘルプ</Button>
  </header>
);
```

**After:**

```typescript
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();

  return (
    <header>
      <Button>{t('task.create')}</Button>
      <Button>{t('app.settings')}</Button>
      <Button>{t('app.help')}</Button>
    </header>
  );
};
```

### Example 2: Confirmation Dialogs

**Before:**

```typescript
const TaskCard = ({ task }) => {
  const handleDelete = () => {
    if (confirm(`「${task.title}」を削除しますか？`)) {
      deleteTask(task.id);
    }
  };

  // ...
};
```

**After:**

```typescript
import { useTranslation } from 'react-i18next';

const TaskCard = ({ task }) => {
  const { t } = useTranslation();

  const handleDelete = () => {
    if (confirm(t('task.deleteConfirm', { title: task.title }))) {
      deleteTask(task.id);
    }
  };

  // ...
};
```

### Example 3: Priority Selector

**Before:**

```typescript
const PrioritySelector = () => (
  <select>
    <option value="critical">緊急</option>
    <option value="high">高</option>
    <option value="medium">中</option>
    <option value="low">低</option>
  </select>
);
```

**After:**

```typescript
import { useTranslation } from 'react-i18next';

const PrioritySelector = () => {
  const { t } = useTranslation();

  return (
    <select>
      <option value="critical">{t('priority.critical')}</option>
      <option value="high">{t('priority.high')}</option>
      <option value="medium">{t('priority.medium')}</option>
      <option value="low">{t('priority.low')}</option>
    </select>
  );
};
```

### Example 4: Success Messages

**Before:**

```typescript
const DataManagement = () => {
  const handleExport = () => {
    exportData();
    showMessage('データをエクスポートしました');
  };

  const handleImport = () => {
    importData();
    showMessage('データをインポートしました');
  };

  // ...
};
```

**After:**

```typescript
import { useTranslation } from 'react-i18next';

const DataManagement = () => {
  const { t } = useTranslation();

  const handleExport = () => {
    exportData();
    showMessage(t('data.exportSuccess'));
  };

  const handleImport = () => {
    importData();
    showMessage(t('data.importSuccess'));
  };

  // ...
};
```

### Example 5: Accessibility Labels

**Before:**

```typescript
const TaskCard = ({ task }) => (
  <div
    role="button"
    aria-label={`タスク: ${task.title}. キーボードでの移動にはSpaceキーまたはEnterキーを押してください。`}
  >
    {task.title}
  </div>
);
```

**After:**

```typescript
import { useTranslation } from 'react-i18next';

const TaskCard = ({ task }) => {
  const { t } = useTranslation();

  return (
    <div
      role="button"
      aria-label={`${t('task.task')}: ${task.title}. ${t('task.keyboardMoveHint')}`}
    >
      {task.title}
    </div>
  );
};
```

## Language Switching

### Add Language Selector Component

```typescript
import { useTranslation } from 'react-i18next';
import { supportedLocales, localeNames } from '@/i18n';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (locale: string) => {
    i18n.changeLanguage(locale);
  };

  return (
    <select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
    >
      {supportedLocales.map(locale => (
        <option key={locale} value={locale}>
          {localeNames[locale].native}
        </option>
      ))}
    </select>
  );
};
```

## Testing with Translations

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from './config/i18n';

describe('MyComponent', () => {
  it('should display translated text', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MyComponent />
      </I18nextProvider>
    );

    expect(screen.getByText('保存')).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Always use translation keys**: Never hardcode user-facing strings
2. **Use type-safe keys**: Leverage TypeScript types for autocomplete
3. **Interpolation**: Use variables for dynamic content
4. **Namespace organization**: Keep related translations together
5. **Accessibility**: Remember to translate ARIA labels
6. **Test both locales**: Ensure UI works in all supported languages

## Common Patterns

### Pattern 1: Conditional Messages

```typescript
const { t } = useTranslation();

const message = isCompleted ? t('task.completeSuccess') : t('task.updateSuccess');
```

### Pattern 2: Pluralization (Future Enhancement)

```typescript
// Current (manual)
const taskCount = count === 1 ? t('task.task') : t('task.tasks');

// Future (with i18next pluralization)
const taskCount = t('task.taskCount', { count });
```

### Pattern 3: Rich Text Interpolation

```typescript
const message = t('task.deleteConfirm', {
  title: <strong>{task.title}</strong>
});
```

## Troubleshooting

### Issue: Translation not updating

**Solution**: Ensure i18n is initialized before rendering components

### Issue: Type errors with translation keys

**Solution**: Run `npm run typecheck` to verify type definitions

### Issue: Missing translations

**Solution**: Check both `ja.json` and `en.json` have the same keys

## Next Steps

1. Start with high-traffic components (Header, TaskCard, etc.)
2. Gradually migrate all hardcoded strings
3. Add language switcher to UI
4. Test thoroughly in both Japanese and English
5. Consider adding more locales as needed

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [Translation Keys Reference](./README.md)
