import React from 'react';
import { Text, Box } from '@primer/react';
import type { RecycleBinItem } from '../../../../../types/recycleBin';
import { useItemTypeInfo } from '../hooks/useItemTypeInfo';
import { spacing, borderRadius } from '../styles/designTokens';

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
    <Box
      as="section"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        p: spacing.lg,
        bg: 'canvas.subtle',
        borderRadius: borderRadius.medium,
        border: '1px solid',
        borderColor: 'border.default',

        // レスポンシブ対応
        '@media (max-width: 543px)': {
          p: spacing.md,
          gap: spacing.sm,
        },
      }}
    >
      {/* アイコン */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          bg: colors.background,
          borderRadius: borderRadius.medium,
          flexShrink: 0,

          '@media (max-width: 543px)': {
            width: '40px',
            height: '40px',
          },
        }}
      >
        <Icon
          {...heroIconProps}
        />
      </Box>

      {/* タイトル部分 */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0, // flexで縮小可能にする
        }}
      >
        {/* メインタイトル */}
        <Text
          as="h2"
          sx={{
            fontSize: [2, 3, 3], // レスポンシブフォントサイズ
            fontWeight: 'bold',
            lineHeight: 'condensed',
            color: 'fg.default',
            wordBreak: 'break-word',
            margin: 0,

            // 長いタイトルの場合のトランケート
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
          title={item.title} // ツールチップで全文表示
        >
          {item.title}
        </Text>

        {/* タイプ表示 */}
        <Text
          sx={{
            fontSize: 1,
            color: 'fg.muted',
            fontWeight: 'normal',
            margin: 0,
            mt: spacing.xs,
          }}
        >
          {typeText}
        </Text>
      </Box>
    </Box>
  );
};