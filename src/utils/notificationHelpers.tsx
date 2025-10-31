import React from 'react';
import { CircleCheck, Info, AlertTriangle, XCircle } from 'lucide-react';
import type { NotificationType } from '../types';

/**
 * 通知タイプに応じたアイコンを返す
 *
 * @param type - 通知のタイプ
 * @returns 対応するLucide Reactアイコンコンポーネント
 */
export const getNotificationIcon = (
  type: NotificationType
): React.ReactElement => {
  switch (type) {
    case 'success':
      return <CircleCheck size={16} aria-hidden='true' />;
    case 'info':
      return <Info size={16} aria-hidden='true' />;
    case 'warning':
      return <AlertTriangle size={16} aria-hidden='true' />;
    case 'critical':
      return <XCircle size={16} aria-hidden='true' />;
    case 'upsell':
      return <Info size={16} aria-hidden='true' />;
    default:
      return <Info size={16} aria-hidden='true' />;
  }
};

/**
 * 通知タイプに応じたPrimer Flash variantを返す
 *
 * @param type - 通知のタイプ
 * @returns Primer Flash componentに対応するvariant文字列
 */
export const getFlashVariant = (
  type: NotificationType
): 'default' | 'warning' | 'danger' | 'success' => {
  switch (type) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'danger';
    case 'info':
    case 'upsell':
    default:
      return 'default';
  }
};

/**
 * 通知タイプに応じたPrimer Banner variantを返す
 *
 * @param type - 通知のタイプ
 * @returns Primer Banner componentに対応するvariant文字列
 */
export const getBannerVariant = (
  type: NotificationType
): 'info' | 'warning' | 'critical' | 'success' => {
  switch (type) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'critical':
      return 'critical';
    case 'info':
    case 'upsell':
    default:
      return 'info';
  }
};
