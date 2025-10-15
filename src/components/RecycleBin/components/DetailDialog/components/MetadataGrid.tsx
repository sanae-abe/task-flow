import React from 'react';
import { Text, Box } from '@primer/react';
import { InfoIcon, CalendarIcon, ClockIcon } from '@primer/octicons-react';
import type { RecycleBinItem } from '../../../../../types/recycleBin';
import { useItemMetadata } from '../hooks/useItemTypeInfo';
import { spacing, borderRadius, typography, transitions, responsiveLayout } from '../styles/designTokens';

interface MetadataGridProps {
  item: Pick<RecycleBinItem, 'type' | 'boardTitle' | 'columnTitle' | 'columnsCount' | 'taskCount' | 'deletedAt'>;
}

/**
 * Metadata Grid - アイテムの詳細情報をグリッド形式で表示するコンポーネント
 *
 * 機能:
 * - アイテムタイプに応じた適切なメタデータ表示
 * - レスポンシブグリッドレイアウト
 * - 削除日時の人間が読める形式での表示
 * - アクセシブルな情報構造
 * - 視覚的に区別しやすいデザイン
 */
export const MetadataGrid: React.FC<MetadataGridProps> = ({ item }) => {
  const metadata = useItemMetadata(item);

  // メタデータがない場合は表示しない
  if (metadata.length === 0 && !item.deletedAt) {
    return null;
  }

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
      role="region"
      aria-labelledby="metadata-heading"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm,
        p: spacing.md,
        bg: 'canvas.default',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: borderRadius.medium,
        transition: transitions.default,

        // ホバー効果
        '&:hover': {
          borderColor: 'border.emphasis',
        },

        // レスポンシブ対応
        '@media (max-width: 543px)': {
          p: spacing.sm,
        },
      }}
    >
      {/* セクションヘッダー */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing.xs,
          pb: spacing.xs,
          borderBottom: '1px solid',
          borderColor: 'border.muted',
        }}
      >
        <InfoIcon
          size={16}
          aria-hidden
        />
        <Text
          id="metadata-heading"
          sx={{
            ...typography.sectionHeader,
            margin: 0,
          }}
        >
          詳細情報
        </Text>
      </Box>

      {/* メタデータグリッド */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: responsiveLayout.metadataGrid.md,
          gap: spacing.md,

          // レスポンシブ対応
          '@media (max-width: 767px)': {
            gridTemplateColumns: responsiveLayout.metadataGrid.sm,
            gap: spacing.sm,
          },
        }}
      >
        {/* 削除日時 */}
        {formattedDeletedAt && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.xs,
              p: spacing.sm,
              bg: 'neutral.subtle',
              borderRadius: borderRadius.small,
              border: '1px solid',
              borderColor: 'border.muted',
              transition: transitions.fast,

              '&:hover': {
                bg: 'neutral.muted',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <ClockIcon
                size={14}
                aria-hidden
              />
              <Text
                sx={{
                  ...typography.metaLabel,
                  margin: 0,
                }}
              >
                削除日時
              </Text>
            </Box>
            <Text
              sx={{
                ...typography.metaValue,
                margin: 0,
                pl: spacing.md, // アイコン分のインデント
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
              flexDirection: 'column',
              gap: spacing.xs,
              p: spacing.sm,
              bg: 'canvas.subtle',
              borderRadius: borderRadius.small,
              border: '1px solid',
              borderColor: 'border.muted',
              transition: transitions.fast,

              '&:hover': {
                bg: 'accent.subtle',
                borderColor: 'accent.muted',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <CalendarIcon
                size={14}
                aria-hidden
              />
              <Text
                sx={{
                  ...typography.metaLabel,
                  margin: 0,
                }}
              >
                {meta.label}
              </Text>
            </Box>
            <Text
              sx={{
                ...typography.metaValue,
                margin: 0,
                pl: spacing.md, // アイコン分のインデント
                fontWeight: 'semibold',
              }}
              // スクリーンリーダー用の追加情報
              aria-label={`${meta.label}: ${meta.value}`}
            >
              {meta.value}
            </Text>
          </Box>
        ))}
      </Box>

      {/* メタデータがない場合のフォールバック */}
      {metadata.length === 0 && !formattedDeletedAt && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: spacing.lg,
            color: 'fg.muted',
            fontStyle: 'italic',
          }}
        >
          <Text sx={{ fontSize: 1 }}>
            追加の詳細情報はありません
          </Text>
        </Box>
      )}

      {/* アクセシビリティ用のライブリージョン */}
      <Box
        role="status"
        aria-live="polite"
        aria-atomic="true"
        sx={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {metadata.length > 0 && `${metadata.length}件の詳細情報が表示されています`}
      </Box>
    </Box>
  );
};