import { useState, useEffect, useRef } from 'react';

/**
 * フォームの変更を検知するカスタムフック
 *
 * フォームの初期状態と現在の状態を比較して、
 * 変更があったかどうかを判定します。
 */
export const useFormChangeDetector = <T extends Record<string, unknown>>(
  formData: T,
  isOpen: boolean
) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const initialDataRef = useRef<T | null>(null);
  const onCloseCallbackRef = useRef<(() => void) | null>(null);

  // ダイアログが開かれた時に初期データを保存
  useEffect(() => {
    if (isOpen && !initialDataRef.current) {
      initialDataRef.current = JSON.parse(JSON.stringify(formData));
      setHasChanges(false);
    } else if (!isOpen) {
      // ダイアログが閉じられた時に初期化
      initialDataRef.current = null;
      setHasChanges(false);
      setShowCloseConfirm(false);
      onCloseCallbackRef.current = null;
    }
  }, [isOpen, formData]);

  // フォームデータの変更を監視
  useEffect(() => {
    if (isOpen && initialDataRef.current) {
      const hasFormChanges = !deepEqual(initialDataRef.current, formData);
      setHasChanges(hasFormChanges);
    }
  }, [formData, isOpen]);

  /**
   * ダイアログを閉じる処理
   * 変更がある場合は確認ダイアログを表示
   */
  const handleClose = (onClose: () => void) => {
    if (hasChanges) {
      onCloseCallbackRef.current = onClose;
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  /**
   * 確認ダイアログで「はい」を選択した時の処理
   */
  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    if (onCloseCallbackRef.current) {
      onCloseCallbackRef.current();
    }
  };

  /**
   * 確認ダイアログで「キャンセル」を選択した時の処理
   */
  const handleCancelClose = () => {
    setShowCloseConfirm(false);
    onCloseCallbackRef.current = null;
  };

  return {
    hasChanges,
    showCloseConfirm,
    handleClose,
    handleConfirmClose,
    handleCancelClose,
  };
};

/**
 * 深い比較を行うヘルパー関数
 */
function deepEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (obj1 === null || obj2 === null || obj1 === undefined || obj2 === undefined) {
    return obj1 === obj2;
  }

  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  if (typeof obj1 !== 'object') {
    return obj1 === obj2;
  }

  if (Array.isArray(obj1) !== Array.isArray(obj2)) {
    return false;
  }

  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) {
        return false;
      }
    }
    return true;
  }

  // Both are objects
  const objRecord1 = obj1 as Record<string, unknown>;
  const objRecord2 = obj2 as Record<string, unknown>;

  const keys1 = Object.keys(objRecord1);
  const keys2 = Object.keys(objRecord2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }
    if (!deepEqual(objRecord1[key], objRecord2[key])) {
      return false;
    }
  }

  return true;
}