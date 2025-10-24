import React, { useMemo } from 'react';

import type { TemplateCategory, TemplateCategoryInfo } from '../../types/template';

interface TemplateCategorySelectorProps {
  value: TemplateCategory;
  onChange: (category: TemplateCategory) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  showDescription?: boolean;
}

/**
 * テンプレートカテゴリー定義
 */
const TEMPLATE_CATEGORIES: TemplateCategoryInfo[] = [
  {
    id: 'work',
    label: '仕事',
    description: '業務関連のタスク'
  },
  {
    id: 'personal',
    label: '個人',
    description: 'プライベートなタスク'
  },
  {
    id: 'project',
    label: 'プロジェクト',
    description: 'プロジェクト関連のタスク'
  },
  {
    id: 'meeting',
    label: '会議',
    description: '会議の準備や議事録'
  },
  {
    id: 'routine',
    label: 'ルーティン',
    description: '定期的な作業'
  },
  {
    id: 'other',
    label: 'その他',
    description: 'その他のタスク'
  }
];

/**
 * テンプレートカテゴリー選択コンポーネント
 */
const TemplateCategorySelector: React.FC<TemplateCategorySelectorProps> = ({
  value,
  onChange,
  disabled = false,
  required = false,
  label = 'カテゴリー',
  showDescription = false
}) => {
  // 選択中のカテゴリー情報
  const selectedCategory = useMemo(
    () => TEMPLATE_CATEGORIES.find((cat) => cat.id === value),
    [value]
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TemplateCategory)}
        disabled={disabled}
        className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {TEMPLATE_CATEGORIES.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </select>
      {showDescription && selectedCategory && (
        <small className="text-xs text-muted-foreground">
          {selectedCategory.description}
        </small>
      )}
    </div>
  );
};

export default TemplateCategorySelector;
export { TEMPLATE_CATEGORIES };
export type { TemplateCategoryInfo };