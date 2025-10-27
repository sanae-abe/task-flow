import React from 'react';
import type { RecycleBinItem } from '../../../../../types/recycleBin';
import { useItemTypeInfo } from '../hooks/useItemTypeInfo';

interface HeroSectionProps {
  item: Pick<RecycleBinItem, 'type' | 'title'>;
}

/**
 * Hero Section - アイテムの主要情報をシンプルに表示するコンポーネント
 *
 * 機能:
 * - アイテムタイプに応じたアイコン表示
 * - 大きく読みやすいタイトル表示
 * - シンプルで美しいデザイン
 */
export const HeroSection: React.FC<HeroSectionProps> = ({ item }) => {
  const { typeText, Icon, colors, heroIconProps } = useItemTypeInfo(item.type);

  return (
    <section className="flex items-center gap-4 max-[543px]:p-4 max-[543px]:gap-3">
      {/* アイコン */}
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-md flex-shrink-0 ${colors.backgroundClass}`}
      >
        <Icon
          {...heroIconProps}
        />
      </div>

      {/* タイトル部分 */}
      <div className="flex-1 min-w-0">
        {/* メインタイトル */}
        <h2
          className="text-base font-bold leading-tight text-foreground break-words m-0 overflow-hidden line-clamp-2"
          title={item.title}
        >
          {item.title}
        </h2>

        {/* タイプ表示 */}
        <span className="text-xs text-muted-foreground font-normal m-0 mt-1 block">
          {typeText}
        </span>
      </div>
    </section>
  );
};