import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AlertIcon,
  CheckCircleIcon,
  InfoIcon,
  StopIcon,
  XIcon,
} from '@primer/octicons-react';

/**
 * ダイアログ内でFlashメッセージを表示するためのメッセージタイプ
 */
export type DialogMessageType = 'success' | 'danger' | 'warning' | 'critical' | 'default' | 'info' | 'upsell';

/**
 * ダイアログFlashメッセージのプロパティ
 */
export interface DialogFlashMessageData {
  type: DialogMessageType;
  title?: string;
  text: string;
}

/**
 * DialogFlashMessageコンポーネントのプロパティ
 */
interface DialogFlashMessageProps {
  /** 表示するメッセージ（nullの場合は非表示） */
  message: DialogFlashMessageData | null;
  /** 追加のスタイル */
  style?: React.CSSProperties;
  /** 追加のクラス名 */
  className?: string;
  /** xボタンを表示するかどうか（デフォルト: true） */
  showDismiss?: boolean;
  /** 固定位置表示するかどうか（デフォルト: false） */
  isStatic?: boolean;
  /** xボタンがクリックされたときのコールバック */
  onDismiss?: () => void;
}

/**
 * メッセージタイプに応じたアラートスタイルクラスを返す
 */
export const getAlertStyles = (type: DialogMessageType): string => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'critical':
    case 'danger':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'info':
    case 'upsell':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'default':
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

/**
 * メッセージタイプに応じたアイコンを返す
 */
export const getMessageIcon = (type: DialogMessageType): React.ReactElement => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon size={16} />;
    case 'info':
    case 'upsell':
      return <InfoIcon size={16} />;
    case 'warning':
      return <AlertIcon size={16} />;
    case 'critical':
      return <StopIcon size={16} />;
    case 'danger':
      return <AlertIcon size={16} />;
    case 'default':
    default:
      return <InfoIcon size={16} />;
  }
};

/**
 * ダイアログ内でFlashメッセージを表示するコンポーネント
 * メッセージタイプに応じて適切なvariantとアイコンを表示します
 */
export const DialogFlashMessage: React.FC<DialogFlashMessageProps> = ({
  message,
  style,
  className,
  showDismiss = true,
  isStatic = false,
  onDismiss
}) => {
  if (!message) {
    return null;
  }

  return (
    <div
      className={cn(
        "border rounded-md p-4",
        getAlertStyles(message.type),
        isStatic ? "static" : "sticky top-0",
        className
      )}
      style={style}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start flex-1">
          <div className="mr-2">{getMessageIcon(message.type)}</div>
          <div className="flex-1">
            {message.title && (
              <div className="font-bold block mb-1">{message.title}</div>
            )}
            <div className="block">
              {message.text}
            </div>
          </div>
        </div>
        {showDismiss && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            aria-label="閉じる"
            onClick={onDismiss}
            className="ml-2 flex-shrink-0 self-start p-1 h-auto min-w-0"
          >
            <XIcon size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default DialogFlashMessage;