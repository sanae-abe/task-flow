import React from 'react';
import { Zap, ChevronDown, ChevronUp, Minus } from 'react-feather';

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
  icon: React.ComponentType<{ size?: number; fill?: string; 'aria-hidden'?: boolean }>;
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
        bg: '#d1242f',
        text: '#ffffff',
        border: '#cf222e',
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
        bg: '#fb8500',
        text: '#ffffff',
        border: '#9a6700',
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
        bg: '#2da44e',
        text: '#ffffff',
        border: '#1a7f37',
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
        bg: '#0969da',
        text: '#ffffff',
        border: '#0550ae',
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
  icon: React.ComponentType<{ size?: number; fill?: string; 'aria-hidden'?: boolean }> | null;
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
  const order: Record<Priority, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  };
  return order[priority];
};

/**
 * 優先度の重み値を取得（ソート用）
 */
export const getPriorityWeight = (priority: Priority | undefined): number => {
  if (!priority) {return 999;} // 未設定は最後
  return getPriorityOrder(priority);
};

/**
 * 優先度をラベルに変換
 */
export const getPriorityLabel = (priority: Priority): string => priorityConfig[priority].label;

/**
 * 優先度の説明を取得
 */
export const getPriorityDescription = (priority: Priority): string => priorityConfig[priority].description;

/**
 * アクセシビリティ用のaria-label生成
 */
export const getPriorityAriaLabel = (priority: Priority): string => {
  const config = priorityConfig[priority];
  return `優先度: ${config.label} - ${config.description}`;
};
