import { Box } from '@primer/react';
import { memo } from 'react';

import type { FlexDirection, FlexAlign, FlexJustify, FlexWrap } from '../../types/shared';

interface FlexBoxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Flexの方向 */
  direction?: FlexDirection;
  /** align-items */
  align?: FlexAlign;
  /** justify-content */
  justify?: FlexJustify;
  /** gap（Primerのスケール値） */
  gap?: number;
  /** flex-wrap */
  wrap?: FlexWrap;
  /** flex プロパティ */
  flex?: string | number;
  /** flexShrink */
  shrink?: number;
  /** flexGrow */
  grow?: number;
  /** 子要素 */
  children: React.ReactNode;
  /** 追加のCSS */
  sx?: Record<string, unknown>;
}

/**
 * 統一されたFlexboxレイアウトヘルパーコンポーネント
 * 
 * 頻繁に使用されるFlexboxパターンを簡潔に記述でき、
 * 一貫したレイアウトコードを提供します。
 */
const FlexBox = memo<FlexBoxProps>(({
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  gap,
  wrap = 'nowrap',
  flex,
  shrink,
  grow,
  children,
  sx,
  ...restProps
}) => {
  // Flexboxスタイルを構築
  const flexStyles: Record<string, unknown> = {
    display: 'flex',
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    flexWrap: wrap
  };

  if (gap !== undefined) {
    flexStyles['gap'] = gap;
  }

  if (flex !== undefined) {
    flexStyles['flex'] = flex;
  }

  if (shrink !== undefined) {
    flexStyles['flexShrink'] = shrink;
  }

  if (grow !== undefined) {
    flexStyles['flexGrow'] = grow;
  }

  // カスタムプロパティを除外してDOM要素用のpropsを取得
  const {
    direction: _direction,
    align: _align,
    justify: _justify,
    gap: _gap,
    wrap: _wrap,
    flex: _flex,
    shrink: _shrink,
    grow: _grow,
    sx: _sx,
    ...domProps
  } = { direction, align, justify, gap, wrap, flex, shrink, grow, sx, ...restProps };

  return (
    <Box
      {...domProps}
      sx={{
        ...flexStyles,
        ...sx
      }}
    >
      {children}
    </Box>
  );
});

FlexBox.displayName = 'FlexBox';

export default FlexBox;

// 便利なプリセットコンポーネント

/**
 * 水平方向に要素を並べるFlexBox
 */
export const HBox = memo<Omit<FlexBoxProps, 'direction'>>(({ children, ...props }) => (
  <FlexBox direction="row" {...props}>
    {children}
  </FlexBox>
));

/**
 * 垂直方向に要素を並べるFlexBox
 */
export const VBox = memo<Omit<FlexBoxProps, 'direction'>>(({ children, ...props }) => (
  <FlexBox direction="column" {...props}>
    {children}
  </FlexBox>
));

/**
 * 中央揃えのFlexBox
 */
export const CenterBox = memo<Omit<FlexBoxProps, 'align' | 'justify'>>(({ children, ...props }) => (
  <FlexBox align="center" justify="center" {...props}>
    {children}
  </FlexBox>
));

/**
 * 両端揃えのFlexBox
 */
export const SpaceBetweenBox = memo<Omit<FlexBoxProps, 'justify'>>(({ children, ...props }) => (
  <FlexBox justify="space-between" {...props}>
    {children}
  </FlexBox>
));

HBox.displayName = 'HBox';
VBox.displayName = 'VBox';
CenterBox.displayName = 'CenterBox';
SpaceBetweenBox.displayName = 'SpaceBetweenBox';