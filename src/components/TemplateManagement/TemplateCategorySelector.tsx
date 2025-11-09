import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

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
 * テンプレートカテゴリー定義を取得する関数
 * 翻訳関数を受け取り、国際化されたカテゴリー情報を返す
 */
export const getTemplateCategories = (t: TFunction): TemplateCategoryInfo[] => [
  {
    id: 'work',
    label: t('template.categories.work'),
    description: t('template.categories.workDesc'),
  },
  {
    id: 'personal',
    label: t('template.categories.personal'),
    description: t('template.categories.personalDesc'),
  },
  {
    id: 'project',
    label: t('template.categories.project'),
    description: t('template.categories.projectDesc'),
  },
  {
    id: 'meeting',
    label: t('template.categories.meeting'),
    description: t('template.categories.meetingDesc'),
  },
  {
    id: 'routine',
    label: t('template.categories.routine'),
    description: t('template.categories.routineDesc'),
  },
  {
    id: 'other',
    label: t('template.categories.other'),
    description: t('template.categories.otherDesc'),
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
  label,
  showDescription = false,
}) => {
  const { t } = useTranslation();
  const templateCategories = useMemo(() => getTemplateCategories(t), [t]);

  // 選択中のカテゴリー情報（説明文表示用）
  const selectedCategory = useMemo(
    () => templateCategories.find(cat => cat.id === value),
    [value, templateCategories]
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
      label={label || t('template.category')}
      value={value}
      onChange={newValue => onChange(newValue as TemplateCategory)}
      options={templateCategories.map(cat => ({
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
export type { TemplateCategoryInfo };
