import React from 'react';
import type { RecycleBinItem } from '../../../../../types/recycleBin';
import LinkifiedText from '../../../../LinkifiedText';

interface DescriptionCardProps {
  item: Pick<RecycleBinItem, 'description' | 'type'>;
}

/**
 * Description Card - アイテムの説明文をシンプルに表示するカードコンポーネント
 *
 * 機能:
 * - リッチテキスト形式の説明文表示
 * - 長文の場合の適切な折り返し
 * - シンプルで読みやすいデザイン
 */
export const DescriptionCard: React.FC<DescriptionCardProps> = ({ item }) => {
  // 説明文が存在しない場合は何も表示しない
  if (!item.description || item.description.trim() === '') {
    return null;
  }

  return (
    <section className="p-4 max-[543px]:p-2 bg-background border border-border rounded-md">
      {/* セクションヘッダー */}
      <span className="block text-sm font-bold text-foreground m-0 mb-2">
        説明
      </span>

      {/* 説明文本文 */}
      <LinkifiedText
        className="text-sm sm:text-base whitespace-pre-wrap break-words leading-normal text-foreground m-0 max-h-[200px] sm:max-h-[200px] overflow-auto max-[543px]:text-xs max-[543px]:max-h-[150px]"
      >
        {item.description}
      </LinkifiedText>
    </section>
  );
};