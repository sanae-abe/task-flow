import React, { useMemo } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
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
      <div className="p-8 text-center text-gray-500 text-sm">
        テンプレートが登録されていません。<br />
        設定画面からテンプレートを作成してください。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-6">
        {/* お気に入りテンプレート */}
        {favoriteTemplates.length > 0 && (
          <div>
            <div className="flex gap-1.5 text-sm font-semibold mb-3 text-yellow-600 items-center">
              <span className="text-yellow-500">
                <Star size={16} fill="currentColor" />
              </span>
              <span>お気に入りテンプレート</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3">
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
              <div className="text-sm font-semibold mb-3 text-foreground">
                その他のテンプレート
              </div>
            )}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3">
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
      className={cn(
        "border border-border border-gray-200 rounded-md p-4 cursor-pointer transition-all duration-200 ease-in-out bg-white",
        "hover:border-gray-300 hover:bg-gray-50",
        isFavorite && "bg-yellow-50"
      )}
      onClick={() => onSelect(template)}
    >
      <div className="text-base font-semibold mb-2 flex items-center gap-1.5">
        {isFavorite && (
          <span className="text-yellow-500">
            <Star size={16} fill="currentColor" />
          </span>
        )}
        <span>{template.name}</span>
      </div>
      <div className="text-sm text-gray-600 mb-2">
        {template.description || template.taskDescription.slice(0, 100)}...
      </div>
      <div className="text-xs text-gray-500">
        カテゴリー: {template.category} | 使用回数: {template.usageCount}回
      </div>
    </div>
  );