import { Banner } from '@primer/react/experimental'
import React, { useMemo, useCallback } from "react";

import type { Notification } from "../../types";
import { getNotificationIcon } from "../../utils/notificationHelpers";

/**
 * NotificationItemコンポーネントのプロパティ型定義
 */
export interface NotificationItemProps {
  /** 表示する通知データ */
  notification: Notification;
  /** 通知を閉じる際のコールバック関数 */
  onClose: (id: string) => void;
}

/**
 * 個別の通知アイテムを表示するコンポーネント
 *
 * @param props - NotificationItemのプロパティ
 * @returns 通知アイテムのReactエレメント
 */
export const NotificationItem: React.FC<NotificationItemProps> = React.memo(
  ({ notification, onClose }) => {
    /**
     * 通知を閉じるハンドラー
     */
    const handleClose = useCallback(() => {
      onClose(notification.id);
    }, [notification.id, onClose]);

    /**
     * キーボードイベントハンドラー
     * ESCキーで通知を閉じる
     */
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === "Escape") {
          handleClose();
        }
      },
      [handleClose],
    );


    // Banner variantをメモ化
    const variant = useMemo((): "info" | "warning" | "critical" | "success" => {
      // 通知タイプを直接Bannerのvariantにマッピング
      switch (notification.type) {
        case "success":
          return "success";
        case "warning":
          return "warning";
        case "critical":
          return "critical";
        case "info":
        case "upsell":
        default:
          return "info";
      }
    }, [notification.type]);

    // アイコンをメモ化
    const icon = useMemo(() => getNotificationIcon(notification.type), [notification.type]);

    return (
      <Banner
        variant={variant}
        role="alert"
        aria-live="polite"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        icon={icon}
        onDismiss={handleClose}
        title={notification.title || "通知"}
        description={notification.message}
        hideTitle
      />
    );
  },
);

// デバッグ用のdisplayName設定
NotificationItem.displayName = "NotificationItem";