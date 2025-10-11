import React, { useMemo } from 'react';
import { StarFillIcon } from '@primer/octicons-react';
import type { TemplateSelectorProps } from '../types';
import type { TaskTemplate } from '../../../types/template';

/**
 * テンプレート選択コンポーネント
 *
 * お気に入りテンプレートを優先表示し、その後使用回数順でソート表示します。
 * テンプレートカードのクリックでテンプレートを選択できます。
 */
export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  onSelect
}) => {
  // お気に入りテンプレートを優先して、その後使用回数順でソート
  const sortedTemplates = useMemo(() => [...templates].sort((a, b) => {
      // お気に入りを最初に表示
      if (a.isFavorite && !b.isFavorite) {return -1;}
      if (!a.isFavorite && b.isFavorite) {return 1;}
      // その後は使用回数順（多い順）
      return b.usageCount - a.usageCount;
    }), [templates]);

  // お気に入りとその他を分離
  const favoriteTemplates = sortedTemplates.filter(template => template.isFavorite);
  const otherTemplates = sortedTemplates.filter(template => !template.isFavorite);

  if (templates.length === 0) {
    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        color: 'var(--fgColor-muted)',
        fontSize: '14px'
      }}>
        テンプレートが登録されていません。<br />
        設定画面からテンプレートを作成してください。
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* お気に入りテンプレート */}
        {favoriteTemplates.length > 0 && (
          <div>
            <div style={{
              display: 'flex',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px',
              color: 'var(--color-attention-fg)',
              alignItems: 'center'
            }}>
              <span style={{ color: 'var(--fgColor-attention)' }}>
                <StarFillIcon size={16} />
              </span>
              <span>お気に入りテンプレート</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              {favoriteTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={onSelect}
                  isFavorite
                />
              ))}
            </div>
          </div>
        )}

        {/* その他のテンプレート */}
        {otherTemplates.length > 0 && (
          <div>
            {favoriteTemplates.length > 0 && (
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '12px',
                color: 'var(--fgColor-default)'
              }}>
                その他のテンプレート
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              {otherTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={onSelect}
                  isFavorite={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * テンプレートカードコンポーネント
 */
interface TemplateCardProps {
  template: TaskTemplate;
  onSelect: (template: TaskTemplate) => void;
  isFavorite: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, isFavorite }) => (
    <div
      style={{
        border: '1px solid var(--borderColor-default)',
        borderRadius: '6px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: 'var(--bgColor-default)',
      }}
      onClick={() => onSelect(template)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--borderColor-default)';
        e.currentTarget.style.backgroundColor = 'var(--control-transparent-bgColor-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--borderColor-default)';
        e.currentTarget.style.backgroundColor = isFavorite
          ? 'var(--color-accent-subtle)'
          : 'var(--bgColor-default)';
      }}
    >
      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {isFavorite && (
          <span style={{ color: 'var(--fgColor-attention)' }}>
            <StarFillIcon size={16} />
          </span>
        )}
        <span>{template.name}</span>
      </div>
      <div style={{ fontSize: '14px', color: 'var(--fgColor-muted)', marginBottom: '8px' }}>
        {template.description || template.taskDescription.slice(0, 100)}...
      </div>
      <div style={{ fontSize: '12px', color: 'var(--fgColor-muted)' }}>
        カテゴリー: {template.category} | 使用回数: {template.usageCount}回
      </div>
    </div>
  );