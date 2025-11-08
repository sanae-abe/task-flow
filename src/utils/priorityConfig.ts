import { Zap, ChevronUp, Minus, ChevronDown, type LucideIcon } from 'lucide-react';
import type { TFunction } from 'i18next';

import type { Priority } from '../types';

/**
 * 優先度のビジュアル設定
 * GitHub Primer Design Systemに準拠
 */

export interface PriorityColorScheme {
  bg: string;
  text: string;
  border: string;
}

export interface PriorityColors {
  filled: PriorityColorScheme;
  outlined: PriorityColorScheme;
  subtle: PriorityColorScheme;
}

export interface PriorityConfig {
  label: string;
  labelEn: string;
  description: string;
  icon: LucideIcon;
  variant: 'danger' | 'attention' | 'accent' | 'secondary';
  colors: PriorityColors;
}

/**
 * 優先度設定マップ
 * 全コンポーネントで共通利用
 */
export const priorityConfig: Record<Priority, PriorityConfig> = {
  critical: {
    label: '緊急',
    labelEn: 'Critical',
    description: '今すぐ対応が必要',
    icon: Zap,
    variant: 'danger',
    colors: {
      filled: {
        bg: '#cf222e',
        text: '#ffffff',
        border: 'transparent',
      },
      outlined: {
        bg: 'transparent',
        text: '#d1242f',
        border: '#cf222e',
      },
      subtle: {
        bg: '#ffebe9',
        text: '#cf222e',
        border: 'transparent',
      },
    },
  },
  high: {
    label: '高',
    labelEn: 'High',
    description: '近日中に対応が必要',
    icon: ChevronUp,
    variant: 'attention',
    colors: {
      filled: {
        bg: '#9a6700',
        text: '#ffffff',
        border: 'transparent',
      },
      outlined: {
        bg: 'transparent',
        text: '#fb8500',
        border: '#9a6700',
      },
      subtle: {
        bg: '#fff8c5',
        text: '#9a6700',
        border: 'transparent',
      },
    },
  },
  medium: {
    label: '中',
    labelEn: 'Medium',
    description: '通常の優先度',
    icon: Minus,
    variant: 'accent',
    colors: {
      filled: {
        bg: '#1a7f37',
        text: '#ffffff',
        border: 'transparent',
      },
      outlined: {
        bg: 'transparent',
        text: '#2da44e',
        border: '#1a7f37',
      },
      subtle: {
        bg: '#dcfce7',
        text: '#1a7f37',
        border: 'transparent',
      },
    },
  },
  low: {
    label: '低',
    labelEn: 'Low',
    description: '時間があるときに対応',
    icon: ChevronDown,
    variant: 'secondary',
    colors: {
      filled: {
        bg: '#0550ae',
        text: '#ffffff',
        border: 'transparent',
      },
      outlined: {
        bg: 'transparent',
        text: '#0969da',
        border: '#0550ae',
      },
      subtle: {
        bg: '#ddf4ff',
        text: '#0550ae',
        border: 'transparent',
      },
    },
  },
};

/**
 * セレクター用の優先度オプション（選択なしを含む）
 */
export interface PrioritySelectorOption {
  value: Priority | undefined;
  label: string;
  description: string;
  icon: LucideIcon | null;
  color: string;
}

export const prioritySelectorOptions: PrioritySelectorOption[] = [
  {
    value: undefined,
    label: '選択なし',
    description: '優先度を設定しない',
    icon: null,
    color: '#656d76',
  },
  {
    value: 'critical',
    label: priorityConfig.critical.label,
    description: priorityConfig.critical.description,
    icon: priorityConfig.critical.icon,
    color: priorityConfig.critical.colors.filled.bg,
  },
  {
    value: 'high',
    label: priorityConfig.high.label,
    description: priorityConfig.high.description,
    icon: priorityConfig.high.icon,
    color: priorityConfig.high.colors.filled.bg,
  },
  {
    value: 'medium',
    label: priorityConfig.medium.label,
    description: priorityConfig.medium.description,
    icon: priorityConfig.medium.icon,
    color: priorityConfig.medium.colors.filled.bg,
  },
  {
    value: 'low',
    label: priorityConfig.low.label,
    description: priorityConfig.low.description,
    icon: priorityConfig.low.icon,
    color: priorityConfig.low.colors.filled.bg,
  },
];

/**
 * 優先度の並び順を取得（緊急→高→中→低）
 */
export const getPriorityOrder = (priority: Priority): number => {
  switch (priority) {
    case 'critical':
      return 1;
    case 'high':
      return 2;
    case 'medium':
      return 3;
    case 'low':
      return 4;
    default:
      return 5;
  }
};

/**
 * 優先度の重み値を取得（ソート用）
 */
export const getPriorityWeight = (priority: Priority | undefined): number => {
  if (!priority) {
    return 999;
  } // 未設定は最後
  return getPriorityOrder(priority);
};

/**
 * 優先度をラベルに変換
 */
export const getPriorityLabel = (priority: Priority | undefined): string => {
  if (!priority) {
    return '未設定';
  }
  return priorityConfig[priority].label;
};

/**
 * 優先度の説明を取得
 */
export const getPriorityDescription = (
  priority: Priority | undefined
): string => {
  if (!priority) {
    return '優先度を設定しない';
  }
  return priorityConfig[priority].description;
};

/**
 * アクセシビリティ用のaria-label生成
 */
export const getPriorityAriaLabel = (
  priority: Priority | undefined
): string => {
  if (!priority) {
    return '優先度: 未設定';
  }
  const config = priorityConfig[priority];
  return `優先度: ${config.label} - ${config.description}`;
};

/**
 * i18n対応の優先度設定を生成
 * @param t - i18next翻訳関数
 * @returns 翻訳された優先度設定マップ
 */
export const buildPriorityConfig = (t: TFunction): Record<Priority, PriorityConfig> => ({
  critical: {
    label: t('priority.critical'),
    labelEn: 'Critical',
    description: t('priority.criticalDesc'),
    icon: Zap,
    variant: 'danger',
    colors: priorityConfig.critical.colors,
  },
  high: {
    label: t('priority.high'),
    labelEn: 'High',
    description: t('priority.highDesc'),
    icon: ChevronUp,
    variant: 'attention',
    colors: priorityConfig.high.colors,
  },
  medium: {
    label: t('priority.medium'),
    labelEn: 'Medium',
    description: t('priority.mediumDesc'),
    icon: Minus,
    variant: 'accent',
    colors: priorityConfig.medium.colors,
  },
  low: {
    label: t('priority.low'),
    labelEn: 'Low',
    description: t('priority.lowDesc'),
    icon: ChevronDown,
    variant: 'secondary',
    colors: priorityConfig.low.colors,
  },
});

/**
 * i18n対応のセレクター用優先度オプションを生成
 * @param t - i18next翻訳関数
 * @returns 翻訳された優先度オプション配列
 */
export const buildPrioritySelectorOptions = (t: TFunction): PrioritySelectorOption[] => {
  const config = buildPriorityConfig(t);
  return [
    {
      value: undefined,
      label: t('priority.noPriority'),
      description: t('priority.noPriorityDesc'),
      icon: null,
      color: '#656d76',
    },
    {
      value: 'critical',
      label: config.critical.label,
      description: config.critical.description,
      icon: config.critical.icon,
      color: config.critical.colors.filled.bg,
    },
    {
      value: 'high',
      label: config.high.label,
      description: config.high.description,
      icon: config.high.icon,
      color: config.high.colors.filled.bg,
    },
    {
      value: 'medium',
      label: config.medium.label,
      description: config.medium.description,
      icon: config.medium.icon,
      color: config.medium.colors.filled.bg,
    },
    {
      value: 'low',
      label: config.low.label,
      description: config.low.description,
      icon: config.low.icon,
      color: config.low.colors.filled.bg,
    },
  ];
};

/**
 * i18n対応のaria-label生成
 * @param priority - 優先度
 * @param t - i18next翻訳関数
 * @returns aria-label文字列
 */
export const buildPriorityAriaLabel = (
  priority: Priority | undefined,
  t: TFunction
): string => {
  if (!priority) {
    return `${t('priority.ariaLabel')}: ${t('priority.unset')}`;
  }
  const config = buildPriorityConfig(t)[priority];
  return `${t('priority.ariaLabel')}: ${config.label} - ${config.description}`;
};
