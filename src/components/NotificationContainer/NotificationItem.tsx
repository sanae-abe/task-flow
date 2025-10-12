import { XIcon } from "@primer/octicons-react";
import { Text, IconButton, Flash } from "@primer/react";
import React, { useMemo, useCallback } from "react";

import type { Notification } from "../../types";
import { getNotificationIcon, getFlashVariant } from "../../utils/notificationHelpers";
import {
  notificationItemStyles,
  iconContainerStyles,
  messageContainerStyles,
  messageTextStyles,
  closeButtonStyles,
} from "./styles";

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

    /**
     * 閉じるボタンのマウスエンターハンドラー
     */
    const handleCloseButtonMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      (e.target as HTMLElement).style.opacity = "1";
    }, []);

    /**
     * 閉じるボタンのマウスリーブハンドラー
     */
    const handleCloseButtonMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      (e.target as HTMLElement).style.opacity = "0.7";
    }, []);

    // Flash variantをメモ化
    const variant = useMemo(() => getFlashVariant(notification.type), [notification.type]);

    // アイコンをメモ化
    const icon = useMemo(() => getNotificationIcon(notification.type), [notification.type]);

    return (
      <Flash
        variant={variant}
        role="alert"
        aria-live="polite"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={notificationItemStyles}
      >
        {/* アイコンエリア */}
        <div style={iconContainerStyles}>{icon}</div>

        {/* メッセージエリア */}
        <div style={messageContainerStyles}>
          <Text style={messageTextStyles}>{notification.message}</Text>
        </div>

        {/* 閉じるボタン */}
        <IconButton
          variant="invisible"
          size="small"
          onClick={handleClose}
          aria-label="通知を閉じる"
          style={closeButtonStyles}
          onMouseEnter={handleCloseButtonMouseEnter}
          onMouseLeave={handleCloseButtonMouseLeave}
          icon={XIcon}
        />
      </Flash>
    );
  },
);

// デバッグ用のdisplayName設定
NotificationItem.displayName = "NotificationItem";