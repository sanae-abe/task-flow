import React from 'react';
import { Flash, Text } from '@primer/react';
import {
  AlertIcon,
  CheckCircleIcon,
  InfoIcon,
  StopIcon,
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
  className
}) => {
  if (!message) {
    return null;
  }

  return (
    <Flash
      variant={getFlashVariant(message.type)}
      style={style}
      className={className}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div>{getMessageIcon(message.type)}</div>
        <div>
          {message.title ?
            <Text sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>{message.title}</Text> : null}
          <Text sx={{ display: 'block' }}>
            {message.text}
          </Text>
        </div>
      </div>
    </Flash>
  );
};

export default DialogFlashMessage;