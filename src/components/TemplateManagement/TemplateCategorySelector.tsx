import React, { useMemo } from 'react';
import { FormControl, Select } from '@primer/react';

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
    <FormControl required={required}>
      <FormControl.Label>{label}</FormControl.Label>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as TemplateCategory)}
        disabled={disabled}
        sx={{ width: '100%' }}
      >
        {TEMPLATE_CATEGORIES.map((category) => (
          <Select.Option key={category.id} value={category.id}>
            {category.label}
          </Select.Option>
        ))}
      </Select>
      {showDescription && selectedCategory && (
        <FormControl.Caption>{selectedCategory.description}</FormControl.Caption>
      )}
    </FormControl>
  );
};

export default TemplateCategorySelector;
export { TEMPLATE_CATEGORIES };
export type { TemplateCategoryInfo };
