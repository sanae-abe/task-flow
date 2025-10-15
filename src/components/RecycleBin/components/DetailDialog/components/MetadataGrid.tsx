import React from 'react';
import { Text, Box } from '@primer/react';
import type { RecycleBinItem } from '../../../../../types/recycleBin';
import { useItemMetadata } from '../hooks/useItemTypeInfo';
import { spacing, borderRadius } from '../styles/designTokens';

interface MetadataGridProps {
  item: Pick<RecycleBinItem, 'type' | 'boardTitle' | 'columnTitle' | 'columnsCount' | 'taskCount' | 'deletedAt'>;
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
    if (!deletedAt) {return null;}

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
    <Box
      as="section"
      sx={{
        p: spacing.md,
        bg: 'canvas.default',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: borderRadius.medium,

        // レスポンシブ対応
        '@media (max-width: 543px)': {
          p: spacing.sm,
        },
      }}
    >
      {/* セクションヘッダー */}
      <Text
        sx={{
          fontSize: 2,
          fontWeight: 'semibold',
          color: 'fg.default',
          margin: 0,
          mb: spacing.md,
        }}
      >
        詳細情報
      </Text>

      {/* メタデータリスト */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.sm,
        }}
      >
        {/* 削除日時 */}
        {formattedDeletedAt && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: spacing.sm,
              borderBottom: '1px solid',
              borderColor: 'border.muted',
            }}
          >
            <Text
              sx={{
                fontSize: 1,
                color: 'fg.muted',
                margin: 0,
              }}
            >
              削除日時
            </Text>
            <Text
              sx={{
                fontSize: 1,
                color: 'fg.default',
                margin: 0,
                fontWeight: 'semibold',
              }}
            >
              {formattedDeletedAt}
            </Text>
          </Box>
        )}

        {/* 動的メタデータ */}
        {metadata.map((meta) => (
          <Box
            key={meta.key}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: spacing.sm,
              borderBottom: '1px solid',
              borderColor: 'border.muted',

              '&:last-child': {
                borderBottom: 'none',
              },
            }}
          >
            <Text
              sx={{
                fontSize: 1,
                color: 'fg.muted',
                margin: 0,
              }}
            >
              {meta.label}
            </Text>
            <Text
              sx={{
                fontSize: 1,
                color: 'fg.default',
                margin: 0,
                fontWeight: 'semibold',
              }}
            >
              {meta.value}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};