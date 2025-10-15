import React from 'react';
import { Text, Box } from '@primer/react';
import { NoteIcon } from '@primer/octicons-react';
import type { RecycleBinItem } from '../../../../../types/recycleBin';
import { spacing, borderRadius, typography, transitions } from '../styles/designTokens';

interface DescriptionCardProps {
  item: Pick<RecycleBinItem, 'description' | 'type'>;
}

/**
 * Description Card - アイテムの説明文を表示するカードコンポーネント
 *
 * 機能:
 * - リッチテキスト形式の説明文表示
 * - 長文の場合の適切な折り返し
 * - 説明文がない場合の適切なフォールバック
 * - アクセシブルな情報構造
 * - レスポンシブ対応
 */
export const DescriptionCard: React.FC<DescriptionCardProps> = ({ item }) => {
  // 説明文が存在しない場合は何も表示しない
  if (!item.description || item.description.trim() === '') {
    return null;
  }

  return (
    <Box
      as="section"
      role="region"
      aria-labelledby="description-heading"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm,
        p: spacing.md,
        bg: 'canvas.subtle',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: borderRadius.medium,
        transition: transitions.default,
        position: 'relative',

        // ホバー効果（フォーカス管理時）
        '&:focus-within': {
          borderColor: 'accent.fg',
          boxShadow: '0 0 0 2px var(--focus-outlineColor)',
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
        <NoteIcon
          size={16}
          aria-hidden
        />
        <Text
          id="description-heading"
          sx={{
            ...typography.sectionHeader,
            margin: 0,
          }}
        >
          説明
        </Text>
      </Box>

      {/* 説明文本文 */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '1.5em',
        }}
      >
        <Text
          sx={{
            ...typography.description,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 'default',
            margin: 0,

            // 長文の場合のスクロール対応
            maxHeight: '200px',
            overflow: 'auto',

            // カスタムスクロールバー（WebKit）
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'var(--bgColor-muted)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--borderColor-default)',
              borderRadius: '3px',
              '&:hover': {
                background: 'var(--borderColor-emphasis)',
              },
            },

            // レスポンシブフォントサイズ
            '@media (max-width: 543px)': {
              fontSize: 0,
              maxHeight: '150px',
            },
          }}
          // 完全なアクセシビリティのため、説明文をaria-labelでも提供
          role="article"
          aria-label={`説明: ${item.description}`}
        >
          {item.description}
        </Text>
      </Box>

      {/* 文字数インジケーター（長文の場合） */}
      {item.description.length > 100 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            pt: spacing.xs,
            borderTop: '1px solid',
            borderColor: 'border.muted',
          }}
        >
          <Text
            sx={{
              fontSize: 0,
              color: 'fg.muted',
              fontStyle: 'italic',
            }}
            aria-label={`文字数: ${item.description.length}文字`}
          >
            {item.description.length.toLocaleString()}文字
          </Text>
        </Box>
      )}

      {/* アクセシビリティ用の視覚的フォーカスインジケーター */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '3px',
          height: '100%',
          bg: 'accent.muted',
          borderRadius: '2px 0 0 2px',
          opacity: 0,
          transition: transitions.fast,

          // フォーカス時に表示
          '.focus-visible &': {
            opacity: 1,
          },
        }}
      />
    </Box>
  );
};