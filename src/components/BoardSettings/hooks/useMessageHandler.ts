import { useState, useCallback, useRef, useEffect } from 'react';

type MessageType = 'success' | '_error';

interface UseMessageHandlerReturn {
  message: string | null;
  messageType: MessageType | null;
  showMessage: (message: string, type: MessageType) => void;
  clearMessage: () => void;
}

/**
 * メッセージ表示管理用のカスタムフック
 *
 * @description
 * メッセージの表示、自動消去、タイマー管理を一元化
 *
 * @param options - オプション設定
 * @param options.successDelay - 成功メッセージの表示時間（ミリ秒）デフォルト: 3000ms
 * @param options.errorDelay - エラーメッセージの表示時間（ミリ秒）デフォルト: 5000ms
 */
export const useMessageHandler = (options?: {
  successDelay?: number;
  errorDelay?: number;
}): UseMessageHandlerReturn => {
  const { successDelay = 3000, errorDelay = 5000 } = options || {};

  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<MessageType | null>(null);
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearMessage = useCallback(() => {
    setMessage(null);
    setMessageType(null);
  }, []);

  const showMessage = useCallback(
    (msg: string, type: MessageType) => {
      // 既存のタイマーをクリア
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }

      setMessage(msg);
      setMessageType(type);

      // メッセージを自動消去
      const delay = type === 'success' ? successDelay : errorDelay;
      messageTimerRef.current = setTimeout(clearMessage, delay);
    },
    [successDelay, errorDelay, clearMessage]
  );

  // コンポーネントアンマウント時のクリーンアップ
  useEffect(
    () => () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    },
    []
  );

  return {
    message,
    messageType,
    showMessage,
    clearMessage,
  };
};
