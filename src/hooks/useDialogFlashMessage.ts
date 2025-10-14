import { useState, useCallback } from 'react';
import type { DialogFlashMessageData, DialogMessageType } from '../components/shared/DialogFlashMessage';

/**
 * ダイアログFlashメッセージの管理フック
 * メッセージの表示と自動クリア機能を提供します
 */
export const useDialogFlashMessage = (autoClearDelay: number = 3000) => {
  const [message, setMessage] = useState<DialogFlashMessageData | null>(null);

  /**
   * メッセージを表示し、指定時間後に自動クリア
   */
  const showMessage = useCallback((
    type: DialogMessageType,
    text: string,
    title?: string,
    delay?: number
  ) => {
    const newMessage: DialogFlashMessageData = { type, text, title };
    setMessage(newMessage);

    // 自動クリア
    const clearDelay = delay ?? autoClearDelay;
    if (clearDelay > 0) {
      setTimeout(() => {
        setMessage(null);
      }, clearDelay);
    }
  }, [autoClearDelay]);

  /**
   * メッセージオブジェクトから直接表示
   */
  const showMessageFromObject = useCallback((
    messageObj: DialogFlashMessageData,
    delay?: number
  ) => {
    setMessage(messageObj);

    // 自動クリア
    const clearDelay = delay ?? autoClearDelay;
    if (clearDelay > 0) {
      setTimeout(() => {
        setMessage(null);
      }, clearDelay);
    }
  }, [autoClearDelay]);

  /**
   * 従来のonMessageコールバック形式に対応
   */
  const handleMessage = useCallback((
    messageData: { type: DialogMessageType; text: string; title?: string } | null,
    delay?: number
  ) => {
    // nullチェックを追加してランタイムエラーを防ぐ
    if (!messageData) {
      // eslint-disable-next-line no-console
      console.warn('handleMessage called with null messageData');
      return;
    }

    const messageWithTitle: DialogFlashMessageData = {
      type: messageData.type,
      text: messageData.text,
      title: messageData.title
    };
    showMessageFromObject(messageWithTitle, delay);
  }, [showMessageFromObject]);

  /**
   * メッセージを手動でクリア
   */
  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  /**
   * 成功メッセージを表示
   */
  const showSuccess = useCallback((text: string, title?: string, delay?: number) => {
    showMessage('success', text, title, delay);
  }, [showMessage]);

  /**
   * エラーメッセージを表示
   */
  const showError = useCallback((text: string, title?: string, delay?: number) => {
    showMessage('critical', text, title, delay);
  }, [showMessage]);

  /**
   * 警告メッセージを表示
   */
  const showWarning = useCallback((text: string, title?: string, delay?: number) => {
    showMessage('warning', text, title, delay);
  }, [showMessage]);

  /**
   * 情報メッセージを表示
   */
  const showInfo = useCallback((text: string, title?: string, delay?: number) => {
    showMessage('info', text, title, delay);
  }, [showMessage]);

  return {
    message,
    showMessage,
    showMessageFromObject,
    handleMessage,
    clearMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default useDialogFlashMessage;