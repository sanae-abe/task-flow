import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { deepEqual } from '../utils/deepEqual';

/**
 * フォームの変更を検知するカスタムフック
 *
 * フォームの初期状態と現在の状態を比較して、
 * 変更があったかどうかを判定します。
 * パフォーマンス最適化のためuseCallback/useMemoを活用しています。
 */
export const useFormChangeDetector = <T extends Record<string, unknown>>(
  formData: T,
  isOpen: boolean
) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const initialDataRef = useRef<T | null>(null);
  const onCloseCallbackRef = useRef<(() => void) | null>(null);

  /**
   * 初期データを効率的に複製
   * structuredCloneがサポートされている場合はそれを使用、
   * そうでなければJSON.parse/stringifyを使用
   */
  const cloneFormData = useCallback((data: T): T => {
    try {
      // structuredClone は新しいブラウザでサポート
      if (typeof structuredClone !== 'undefined') {
        return structuredClone(data);
      }
      // フォールバック: JSON parse/stringify
      return JSON.parse(JSON.stringify(data));
    } catch {
      // 最終的なフォールバック: シャローコピー
      return { ...data };
    }
  }, []);

  // ダイアログが開かれた時に初期データを保存
  useEffect(() => {
    if (isOpen && !initialDataRef.current) {
      initialDataRef.current = cloneFormData(formData);
      setHasChanges(false);
    } else if (!isOpen) {
      // ダイアログが閉じられた時に初期化
      initialDataRef.current = null;
      setHasChanges(false);
      setShowCloseConfirm(false);
      onCloseCallbackRef.current = null;
    }
  }, [isOpen, formData, cloneFormData]);

  // フォームデータの変更を監視（メモ化して不要な再計算を防ぐ）
  const hasFormChanges = useMemo(() => {
    if (!isOpen || !initialDataRef.current) {
      return false;
    }
    return !deepEqual(initialDataRef.current, formData);
  }, [formData, isOpen]);

  // hasChanges状態の更新
  useEffect(() => {
    setHasChanges(hasFormChanges);
  }, [hasFormChanges]);

  /**
   * ダイアログを閉じる処理
   * 変更がある場合は確認ダイアログを表示
   */
  const handleClose = useCallback((onClose: () => void) => {
    if (hasChanges) {
      onCloseCallbackRef.current = onClose;
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  }, [hasChanges]);

  /**
   * 確認ダイアログで「はい」を選択した時の処理
   */
  const handleConfirmClose = useCallback(() => {
    setShowCloseConfirm(false);
    if (onCloseCallbackRef.current) {
      onCloseCallbackRef.current();
      onCloseCallbackRef.current = null;
    }
  }, []);

  /**
   * 確認ダイアログで「キャンセル」を選択した時の処理
   */
  const handleCancelClose = useCallback(() => {
    setShowCloseConfirm(false);
    onCloseCallbackRef.current = null;
  }, []);

  return {
    hasChanges,
    showCloseConfirm,
    handleClose,
    handleConfirmClose,
    handleCancelClose,
  };
};