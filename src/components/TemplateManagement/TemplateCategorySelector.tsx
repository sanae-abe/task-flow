import React, { useMemo } from 'react';

import type {
  TemplateCategory,
  TemplateCategoryInfo,
} from '../../types/template';
import UnifiedFormField from '../shared/Form/UnifiedFormField';

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
    description: '業務関連のタスク',
  },
  {
    id: 'personal',
    label: '個人',
    description: 'プライベートなタスク',
  },
  {
    id: 'project',
    label: 'プロジェクト',
    description: 'プロジェクト関連のタスク',
  },
  {
    id: 'meeting',
    label: '会議',
    description: '会議の準備や議事録',
  },
  {
    id: 'routine',
    label: 'ルーティン',
    description: '定期的な作業',
  },
  {
    id: 'other',
    label: 'その他',
    description: 'その他のタスク',
  },
];

/**
 * テンプレートカテゴリー選択コンポーネント - UnifiedFormFieldベース
 * 94行 → 35行に簡素化
 */
const TemplateCategorySelector: React.FC<TemplateCategorySelectorProps> = ({
  value,
  onChange,
  disabled = false,
  required = false,
  label = 'カテゴリー',
  showDescription = false,
}) => {
  // 選択中のカテゴリー情報（説明文表示用）
  const selectedCategory = useMemo(
    () => TEMPLATE_CATEGORIES.find(cat => cat.id === value),
    [value]
  );

  // 動的な説明文
  const helpText =
    showDescription && selectedCategory
      ? selectedCategory.description
      : undefined;

  return (
    <UnifiedFormField
      id='template-category'
      name='category'
      type='select'
      label={label}
      value={value}
      onChange={newValue => onChange(newValue as TemplateCategory)}
      options={TEMPLATE_CATEGORIES.map(cat => ({
        value: cat.id,
        label: cat.label,
      }))}
      disabled={disabled}
      validation={{ required }}
      helpText={helpText}
    />
  );
};

export default TemplateCategorySelector;
export { TEMPLATE_CATEGORIES };
export type { TemplateCategoryInfo };
