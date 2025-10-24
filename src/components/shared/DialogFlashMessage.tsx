import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  X,
} from 'lucide-react';

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
 * DialogMessageTypeをshadcn/ui Alertのvariantにマッピング
 */
const getAlertVariant = (type: DialogMessageType): "default" | "destructive" | "warning" | "success" | "info" => {
  switch (type) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'critical':
    case 'danger':
      return 'destructive';
    case 'info':
    case 'upsell':
      return 'info';
    case 'default':
    default:
      return 'default';
  }
};

/**
 * メッセージタイプに応じたアイコンを返す
 */
export const getMessageIcon = (type: DialogMessageType): React.ReactElement => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4" />;
    case 'info':
    case 'upsell':
      return <Info className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'critical':
      return <XCircle className="h-4 w-4" />;
    case 'danger':
      return <AlertTriangle className="h-4 w-4" />;
    case 'default':
    default:
      return <Info className="h-4 w-4" />;
  }
};

/**
 * ダイアログ内でFlashメッセージを表示するコンポーネント
 * shadcn/ui Alertを使用してメッセージタイプに応じて適切なvariantとアイコンを表示します
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
    <Alert
      variant={getAlertVariant(message.type)}
      className={cn(
        isStatic ? "static" : "sticky top-0",
        "relative",
        className
      )}
      style={style}
    >
      {getMessageIcon(message.type)}
      <div className="flex-1">
        {message.title && (
          <AlertTitle>{message.title}</AlertTitle>
        )}
        <AlertDescription>
          {message.text}
        </AlertDescription>
      </div>
      {showDismiss && onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          aria-label="閉じる"
          onClick={onDismiss}
          className="absolute right-2 top-2 h-auto p-1 min-w-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
};

export default DialogFlashMessage;