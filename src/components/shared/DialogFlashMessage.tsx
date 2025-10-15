import React from 'react';
import { Flash, Text, IconButton } from '@primer/react';
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
 * メッセージタイプをFlashコンポーネントのvariantに変換
 */
export const getFlashVariant = (type: DialogMessageType): "default" | "warning" | "danger" | "success" => {
  switch (type) {
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'critical':
    case 'danger':
      return 'danger';
    case 'info':
    case 'upsell':
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
    <Flash
      variant={getFlashVariant(message.type)}
      style={{
        position: isStatic ? 'static' : 'sticky',
        top: 0,
        ...style
      }}
      className={className}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
          <div style={{ marginRight: '8px' }}>{getMessageIcon(message.type)}</div>
          <div style={{ flex: 1 }}>
            {message.title ?
              <Text sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>{message.title}</Text> : null}
            <Text sx={{ display: 'block' }}>
              {message.text}
            </Text>
          </div>
        </div>
        {showDismiss && onDismiss && (
          <IconButton
            aria-label="閉じる"
            icon={XIcon}
            size="small"
            variant="invisible"
            onClick={onDismiss}
            style={{
              marginLeft: '8px',
              flexShrink: 0,
              alignSelf: 'flex-start'
            }}
          />
        )}
      </div>
    </Flash>
  );
};

export default DialogFlashMessage;