import React, { useCallback, useEffect, useMemo } from "react";

import { useNotifications } from "../../contexts/NotificationContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { NotificationItem } from "./NotificationItem";
import {
  getResponsiveContainerStyles,
  getResponsiveWrapperStyles,
  notificationAnimationCSS,
} from "./styles";

/**
 * 通知を画面上部に表示するコンテナコンポーネント
 *
 * 機能:
 * - 複数の通知をスタック表示
 * - レスポンシブ対応（モバイル・デスクトップ）
 * - ESCキーによる通知クローズ
 * - アニメーション付きの表示・非表示
 * - アクセシビリティ対応
 */
export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();
  const isMobile = useMediaQuery("(max-width: 768px)");

  /**
   * 通知を削除するハンドラー
   * useCallbackでメモ化して不要な再レンダリングを防ぐ
   */
  const handleRemoveNotification = useCallback(
    (id: string) => {
      removeNotification(id);
    },
    [removeNotification],
  );

  /**
   * グローバルESCキーハンドラー
   * 最新の通知（配列の先頭）を閉じる
   */
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && notifications.length > 0) {
        const latestNotification = notifications[0];
        if (latestNotification) {
          removeNotification(latestNotification.id);
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [notifications, removeNotification]);

  /**
   * レスポンシブコンテナスタイルをメモ化
   */
  const responsiveContainerStyles = useMemo(
    () => getResponsiveContainerStyles(isMobile),
    [isMobile],
  );

  /**
   * レスポンシブラッパースタイルをメモ化
   */
  const responsiveWrapperStyles = useMemo(
    () => getResponsiveWrapperStyles(isMobile),
    [isMobile],
  );

  // 通知がない場合は何も表示しない
  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* アニメーション用CSS */}
      <style>{notificationAnimationCSS}</style>

      {/* 通知コンテナ */}
      <div
        style={responsiveContainerStyles}
        role="region"
        aria-label="通知"
        aria-live="polite"
      >
        {notifications.map((notification) => (
          <div key={notification.id} style={responsiveWrapperStyles}>
            <NotificationItem
              notification={notification}
              onClose={handleRemoveNotification}
            />
          </div>
        ))}
      </div>
    </>
  );
};

// デバッグ用のdisplayName設定
NotificationContainer.displayName = "NotificationContainer";