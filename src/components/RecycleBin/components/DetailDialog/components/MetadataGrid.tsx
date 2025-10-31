import React from 'react';
import type { RecycleBinItem } from '../../../../../types/recycleBin';
import { useItemMetadata } from '../hooks/useItemTypeInfo';

interface MetadataGridProps {
  item: Pick<
    RecycleBinItem,
    | 'type'
    | 'boardTitle'
    | 'columnTitle'
    | 'columnsCount'
    | 'taskCount'
    | 'deletedAt'
  >;
}

/**
 * Metadata Grid - アイテムの詳細情報をシンプルに表示するコンポーネント
 *
 * 機能:
 * - アイテムタイプに応じた適切なメタデータ表示
 * - 削除日時の人間が読める形式での表示
 * - シンプルで読みやすいデザイン
 */
export const MetadataGrid: React.FC<MetadataGridProps> = ({ item }) => {
  const metadata = useItemMetadata(item);

  // 削除日時をフォーマット
  const formatDeletedAt = (deletedAt: string | null | undefined) => {
    if (!deletedAt) {
      return null;
    }

    try {
      const date = new Date(deletedAt);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInDays === 0) {
        if (diffInHours === 0) {
          const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
          return diffInMinutes <= 1 ? 'たった今' : `${diffInMinutes}分前`;
        }
        return `${diffInHours}時間前`;
      } else if (diffInDays === 1) {
        return '昨日';
      } else if (diffInDays < 7) {
        return `${diffInDays}日前`;
      }
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '不明';
    }
  };

  const formattedDeletedAt = formatDeletedAt(item.deletedAt);

  // 表示するメタデータがない場合
  if (metadata.length === 0 && !formattedDeletedAt) {
    return null;
  }

  return (
    <section className='p-4 max-[543px]:p-3 bg-background border border-border rounded-md'>
      {/* セクションヘッダー */}
      <span className='block text-sm font-bold text-foreground m-0 mb-4'>
        詳細情報
      </span>

      {/* メタデータリスト */}
      <div className='flex flex-col gap-3'>
        {/* 削除日時 */}
        {formattedDeletedAt && (
          <div className='flex justify-between items-center py-3 border-b border-border border-border'>
            <span className='text-sm text-zinc-700 m-0'>削除日時</span>
            <span className='text-sm text-foreground m-0 font-semibold'>
              {formattedDeletedAt}
            </span>
          </div>
        )}

        {/* 動的メタデータ */}
        {metadata.map((meta, index) => (
          <div
            key={meta.key}
            className={`flex justify-between items-center py-3 ${
              index === metadata.length - 1
                ? ''
                : 'border-b border-border border-border'
            } ${index === metadata.length - 1 ? 'pb-0' : ''}`}
          >
            <span className='text-sm text-zinc-700 m-0'>{meta.label}</span>
            <span className='text-sm text-foreground m-0 font-semibold'>
              {meta.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
