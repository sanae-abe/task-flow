import React from 'react';
import { Text, Box } from '@primer/react';
import type { RecycleBinItem } from '../../../../../types/recycleBin';
import { spacing, borderRadius } from '../styles/designTokens';

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
    <Box
      as="section"
      sx={{
        p: spacing.md,
        bg: 'canvas.subtle',
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
          display: 'block',
          fontSize: 1,
          fontWeight: 'bold',
          color: 'fg.default',
          margin: 0,
          mb: spacing.sm,
        }}
      >
        説明
      </Text>

      {/* 説明文本文 */}
      <Text
        sx={{
          fontSize: 1,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: 'default',
          color: 'fg.default',
          margin: 0,

          // 長文の場合のスクロール対応
          maxHeight: '200px',
          overflow: 'auto',

          // レスポンシブフォントサイズ
          '@media (max-width: 543px)': {
            fontSize: 0,
            maxHeight: '150px',
          },
        }}
      >
        {item.description}
      </Text>
    </Box>
  );
};