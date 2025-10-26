import type { RecycleBinItem } from '../../../../../types/recycleBin';

/**
 * ゴミ箱詳細ダイアログ用デザイントークン
 * GitHub Primer Reactのデザインシステムに準拠
 */

// アイテム種別別のカラーパレット
export const itemTypeColors = {
  task: {
    icon: 'hsl(var(--primary))', // primary blue
    border: 'hsl(var(--accent))', // accent blue
    background: 'hsl(var(--accent) / 0.5)', // light accent blue
    badge: {
      bg: 'hsl(var(--accent))', // accent blue
      fg: 'hsl(var(--primary))', // primary blue
    },
  },
  board: {
    icon: 'rgb(245 158 11)', // amber-500
    border: 'rgb(254 243 199)', // amber-100
    background: 'rgb(255 251 235)', // amber-50
    badge: {
      bg: 'rgb(254 243 199)', // amber-100
      fg: 'rgb(245 158 11)', // amber-500
    },
  },
  column: {
    icon: 'rgb(34 197 94)', // green-500
    border: 'rgb(220 252 231)', // green-100
    background: 'rgb(240 253 244)', // green-50
    badge: {
      bg: 'rgb(220 252 231)', // green-100
      fg: 'rgb(34 197 94)', // green-500
    },
  },
} as const;;

// スペーシングトークン（Primer準拠）
export const spacing = {
  xs: 1,    // 4px
  sm: 2,    // 8px
  md: 3,    // 16px
  lg: 4,    // 24px
  xl: 5,    // 32px
} as const;

// ボーダー半径トークン
export const borderRadius = {
  small: 1,   // 6px
  medium: 2,  // 12px
  large: 3,   // 16px
} as const;

// タイポグラフィトークン
export const typography = {
  sectionHeader: {
    fontSize: 1,
    fontWeight: 'semibold',
    color: 'fg.muted',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  itemTitle: {
    fontSize: 3,
    fontWeight: 'bold',
    lineHeight: 'default',
  },
  metaLabel: {
    fontSize: 0,
    fontWeight: 'semibold',
    color: 'fg.muted',
  },
  metaValue: {
    fontSize: 1,
    fontWeight: 'normal',
    color: 'fg.default',
  },
  description: {
    fontSize: 1,
    lineHeight: 'default',
    color: 'fg.default',
  },
} as const;

// レスポンシブブレークポイント（Primer準拠）
export const breakpoints = {
  xs: '@media (max-width: 543px)',      // ~544px
  sm: '@media (min-width: 544px)',      // 544px~
  md: '@media (min-width: 768px)',      // 768px~
  lg: '@media (min-width: 1012px)',     // 1012px~
  xl: '@media (min-width: 1280px)',     // 1280px~
} as const;

// レスポンシブレイアウト設定
export const responsiveLayout = {
  metadataGrid: {
    xs: '1fr',                // 1カラム
    sm: '1fr',                // 1カラム
    md: '1fr 1fr',            // 2カラム
  },
  actionButtons: {
    xs: {
      flexDirection: 'column-reverse' as const,
      width: '100%',
    },
    sm: {
      flexDirection: 'row' as const,
      width: 'auto',
    },
  },
  padding: {
    xs: spacing.sm,           // 8px
    sm: spacing.md,           // 16px
    md: spacing.md,           // 16px
  },
} as const;

// インタラクション用のトランジション
export const transitions = {
  default: 'all 0.2s ease',
  fast: 'all 0.15s ease',
  slow: 'all 0.3s ease',
  focus: 'outline 0.15s ease',
} as const;

// シャドウ設定
export const shadows = {
  small: '0 1px 3px rgba(0, 0, 0, 0.12)',
  medium: '0 3px 6px rgba(0, 0, 0, 0.15)',
  large: '0 10px 25px rgba(0, 0, 0, 0.15)',
} as const;

/**
 * アイテム種別に応じたカラー情報を取得
 */
export const getItemTypeColors = (type: RecycleBinItem['type']) => itemTypeColors[type];

/**
 * レスポンシブ値を取得するヘルパー
 */
export const getResponsiveValue = <T>(
  values: { xs?: T; sm?: T; md?: T; lg?: T; xl?: T },
  defaultValue: T
): T => 
  // 簡易実装: 実際のブレークポイント判定は CSS-in-JS で行う
   values.md || values.sm || values.xs || defaultValue
;