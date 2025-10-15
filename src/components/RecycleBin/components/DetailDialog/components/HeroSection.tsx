import React from 'react';
import { Text, Box } from '@primer/react';
import type { RecycleBinItem } from '../../../../../types/recycleBin';
import { useItemTypeInfo } from '../hooks/useItemTypeInfo';
import { spacing, borderRadius, transitions } from '../styles/designTokens';

interface HeroSectionProps {
  item: Pick<RecycleBinItem, 'type' | 'title'>;
}

/**
 * Hero Section - アイテムの主要情報を視覚的に強調するコンポーネント
 *
 * 機能:
 * - アイテムタイプに応じたアイコン表示
 * - 大きく読みやすいタイトル表示
 * - 種別バッジの表示
 * - アクセシブルな情報構造
 */
export const HeroSection: React.FC<HeroSectionProps> = ({ item }) => {
  const { typeText, Icon, colors, heroIconProps, badgeProps, ariaLabel } = useItemTypeInfo(item.type);

  return (
    <Box
      as="section"
      role="region"
      aria-label={ariaLabel}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.md,
        p: spacing.lg,
        bg: 'canvas.subtle',
        borderRadius: borderRadius.medium,
        border: '2px solid',
        borderColor: colors.border,
        transition: transitions.default,
        position: 'relative',
        overflow: 'hidden',

        // ホバー効果（アクセシビリティを考慮）
        '&:focus-within': {
          borderColor: colors.icon,
          boxShadow: `0 0 0 3px ${colors.background}`,
        },

        // レスポンシブ対応
        '@media (max-width: 543px)': {
          p: spacing.md,
          gap: spacing.sm,
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'center',
        },
      }}
    >
      {/* 背景装飾 - 微細なブランドカラー */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          bg: colors.icon,
          borderRadius: '0 2px 2px 0',
        }}
      />

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
          transition: transitions.default,

          // アイコンのホバー効果
          '&:hover': {
            transform: 'scale(1.05)',
          },

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
          display: 'flex',
          flexDirection: 'column',
          gap: spacing.xs,

          '@media (max-width: 543px)': {
            width: '100%',
            alignItems: 'center',
          },
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

        {/* サブ情報 - 視覚的に軽く */}
        <Text
          sx={{
            fontSize: 0,
            color: 'fg.muted',
            fontWeight: 'normal',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: 0,
          }}
        >
          アイテムの詳細を表示中
        </Text>
      </Box>

      {/* 種別バッジ */}
      <Box
        sx={{
          ...badgeProps.sx,
          display: 'flex',
          alignItems: 'center',
          gap: spacing.xs,
          cursor: 'default',
          userSelect: 'none',
          transition: transitions.default,

          // バッジのマイクロインタラクション
          '&:hover': {
            transform: 'translateY(-1px)',
          },

          '@media (max-width: 543px)': {
            alignSelf: 'center',
            px: spacing.md,
          },
        }}
        aria-label={`種別: ${typeText}`}
      >
        {/* バッジアイコン（小さめ） */}
        <Icon
          size={16}
          aria-hidden
        />
        <Text
          sx={{
            fontSize: 1,
            fontWeight: 'semibold',
            margin: 0,
          }}
        >
          {typeText}
        </Text>
      </Box>
    </Box>
  );
};