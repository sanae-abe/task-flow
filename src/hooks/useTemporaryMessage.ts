import { useState, useCallback, useRef, useEffect } from 'react';

export interface TemporaryMessage {
  text: string;
  type: 'success' | '_error' | 'warning' | 'info';
}

/**
 * 一時的なメッセージ表示を管理するカスタムフック
 * 自動的にメッセージをクリアし、メモリリークを防ぐ
 */
export interface UseTemporaryMessageResult {
  /** 現在のメッセージ */
  message: TemporaryMessage | null;
  /** メッセージを表示する関数 */
  showMessage: (message: TemporaryMessage, duration?: number) => void;
  /** メッセージをクリアする関数 */
  clearMessage: () => void;
}

export const useTemporaryMessage = (): UseTemporaryMessageResult => {
  const [message, setMessage] = useState<TemporaryMessage | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearMessage = useCallback(() => {
    setMessage(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showMessage = useCallback(
    (newMessage: TemporaryMessage, duration = 3000) => {
      // 既存のタイムアウトをクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setMessage(newMessage);

      // 指定された時間後にメッセージをクリア
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          setMessage(null);
          timeoutRef.current = null;
        }, duration);
      }
    },
    []
  );

  // コンポーネントのアンマウント時にタイムアウトをクリーンアップ
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return {
    message,
    showMessage,
    clearMessage,
  };
};
