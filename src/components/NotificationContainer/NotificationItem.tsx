import React, { useMemo, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

import type { Notification } from "../../types";
import { getNotificationIcon } from "../../utils/notificationHelpers";

/**
 * Toast風スタイルのバリアント定義
 */
const toastVariantClasses = {
  success: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100",
  warning: "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-100",
  critical: "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100",
  info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100",
  upsell: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100",
} as const;

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


    // Toast variantクラスをメモ化
    const variantClasses = useMemo(() =>
      toastVariantClasses[notification.type] || toastVariantClasses.info,
      [notification.type]
    );

    // アイコンをメモ化
    const icon = useMemo(() => getNotificationIcon(notification.type), [notification.type]);

    return (
      <div
        className={cn(
          // ベーススタイル
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
          // Toast animation styles
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
          // バリアント別カラー
          variantClasses
        )}
        role="alert"
        aria-live="polite"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        data-state="open"
      >
        {/* アイコンとメッセージ */}
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            {notification.title && (
              <div className="text-sm font-semibold mb-1">
                {notification.title}
              </div>
            )}
            <div className="text-sm opacity-90 break-words">
              {notification.message}
            </div>
          </div>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={handleClose}
          className={cn(
            "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
            "group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
          )}
          aria-label="通知を閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  },
);

// デバッグ用のdisplayName設定
NotificationItem.displayName = "NotificationItem";