import { memo } from 'react';
import { cn } from '@/lib/utils';

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
  className,
  style,
  ...restProps
}) => {
  // Flexbox Tailwind クラスをマッピング
  const getDirectionClass = (dir: FlexDirection): string => {
    switch (dir) {
      case 'column': return 'flex-col';
      case 'column-reverse': return 'flex-col-reverse';
      case 'row-reverse': return 'flex-row-reverse';
      default: return 'flex-row';
    }
  };

  const getAlignClass = (alignValue: FlexAlign): string => {
    switch (alignValue) {
      case 'start': return 'items-start';
      case 'end': return 'items-end';
      case 'center': return 'items-center';
      case 'baseline': return 'items-baseline';
      case 'stretch': return 'items-stretch';
      default: return 'items-stretch';
    }
  };

  const getJustifyClass = (justifyValue: FlexJustify): string => {
    switch (justifyValue) {
      case 'start': return 'justify-start';
      case 'end': return 'justify-end';
      case 'center': return 'justify-center';
      case 'space-between': return 'justify-between';
      case 'space-around': return 'justify-around';
      case 'space-evenly': return 'justify-evenly';
      default: return 'justify-start';
    }
  };

  const getWrapClass = (wrapValue: FlexWrap): string => {
    switch (wrapValue) {
      case 'wrap': return 'flex-wrap';
      case 'wrap-reverse': return 'flex-wrap-reverse';
      default: return 'flex-nowrap';
    }
  };

  // 動的スタイルを構築
  const dynamicStyles: React.CSSProperties = {
    ...style,
    ...sx as React.CSSProperties
  };

  if (gap !== undefined) {
    dynamicStyles.gap = `${gap * 4}px`; // Primerのスケール値をpxに変換（4px単位）
  }

  if (flex !== undefined) {
    dynamicStyles.flex = flex;
  }

  if (shrink !== undefined) {
    dynamicStyles.flexShrink = shrink;
  }

  if (grow !== undefined) {
    dynamicStyles.flexGrow = grow;
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
    <div
      {...domProps}
      className={cn(
        'flex',
        getDirectionClass(direction),
        getAlignClass(align),
        getJustifyClass(justify),
        getWrapClass(wrap),
        className
      )}
      style={dynamicStyles}
    >
      {children}
    </div>
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