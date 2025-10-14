import { useState, useCallback, useMemo, useRef, useEffect } from "react";

import { useLabel } from "../../contexts/LabelContext";
import { useNotify } from "../../contexts/NotificationContext";
import type { Label } from "../../types";

interface UseLabelManagementProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

export const useLabelManagement = ({
  selectedLabels,
  onLabelsChange,
}: UseLabelManagementProps) => {
  console.log('🚀 useLabelManagement: Hook initialized');

  const {
    getAllLabels,
    createLabel,
    isLabelInCurrentBoard,
    copyLabelToCurrentBoard,
    setMessageCallback,
  } = useLabel();

  const notify = useNotify();

  console.log('🚀 useLabelManagement: LabelContext methods obtained:', {
    getAllLabels: !!getAllLabels,
    createLabel: !!createLabel,
    isLabelInCurrentBoard: !!isLabelInCurrentBoard,
    copyLabelToCurrentBoard: !!copyLabelToCurrentBoard,
    setMessageCallback: !!setMessageCallback,
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [pendingAutoSelect, setPendingAutoSelect] = useState<{
    name: string;
    color: string;
  } | null>(null);

  // Toast通知用のメッセージ処理関数
  const showToastMessage = useCallback((message: {
    type: 'success' | 'danger' | 'warning' | 'critical' | 'default' | 'info' | 'upsell';
    text: string;
    title?: string;
  }) => {
    console.log('🎯 LabelSelector showToastMessage called with:', message);

    // メッセージタイプに応じてtoast通知
    switch (message.type) {
      case 'success':
        notify.success(message.text);
        break;
      case 'danger':
      case 'critical':
        notify.error(message.text);
        break;
      case 'warning':
        notify.warning(message.text);
        break;
      case 'info':
      case 'default':
      case 'upsell':
      default:
        notify.info(message.text);
        break;
    }

    console.log('🎯 LabelSelector toast notification sent');
  }, [notify]);

  // selectedLabelsの最新値を追跡するref
  const selectedLabelsRef = useRef<Label[]>(selectedLabels);
  const onLabelsChangeRef = useRef<(labels: Label[]) => void>(onLabelsChange);

  const allLabels = useMemo(() => getAllLabels(), [getAllLabels]);
  const selectedLabelIds = useMemo(
    () => new Set(selectedLabels.map((label) => label.id)),
    [selectedLabels],
  );

  // ラベルを現在のボードとその他に分類
  const { currentBoardLabels, otherBoardLabels } = useMemo(() => {
    const current: Label[] = [];
    const other: Label[] = [];

    allLabels.forEach((label) => {
      if (isLabelInCurrentBoard(label.id)) {
        current.push(label);
      } else {
        other.push(label);
      }
    });

    return {
      currentBoardLabels: current,
      otherBoardLabels: other,
    };
  }, [allLabels, isLabelInCurrentBoard]);

  // LabelContextからのメッセージを受信する設定
  useEffect(() => {
    console.log('🔄 LabelSelector: Setting up message callback');

    const messageCallback = (message: {
      type: 'success' | 'danger' | 'warning' | 'critical' | 'default' | 'info' | 'upsell';
      text: string;
      title?: string;
    }) => {
      console.log('📥 LabelSelector: Message received from LabelContext:', message);
      // Toast通知で表示
      showToastMessage(message);
    };

    // LabelContextにコールバックを設定
    console.log('🔌 LabelSelector: Calling setMessageCallback');
    setMessageCallback(messageCallback);
    console.log('✅ LabelSelector: Message callback registered');

    // クリーンアップ
    return () => {
      console.log('🧹 LabelSelector: Cleaning up message callback');
      setMessageCallback(null);
    };
  }, [setMessageCallback, showToastMessage]);

  // refを常に最新の値で更新
  useEffect(() => {
    selectedLabelsRef.current = selectedLabels;
    onLabelsChangeRef.current = onLabelsChange;
  }, [selectedLabels, onLabelsChange]);

  // allLabelsの変化を監視して自動選択を実行
  useEffect(() => {
    if (pendingAutoSelect) {
      // 作成されたラベルを名前と色で検索
      const createdLabel = allLabels.find(
        (label) =>
          label.name === pendingAutoSelect.name &&
          label.color === pendingAutoSelect.color,
      );

      if (createdLabel) {
        const currentSelectedLabels = selectedLabelsRef.current;
        const isAlreadySelected = currentSelectedLabels.some(
          (selected) => selected.id === createdLabel.id,
        );

        if (!isAlreadySelected) {
          const newSelectedLabels = [...currentSelectedLabels, createdLabel];
          onLabelsChangeRef.current(newSelectedLabels);
        }

        // pendingAutoSelectをクリア
        setPendingAutoSelect(null);
      }
    }
  }, [allLabels, pendingAutoSelect]);

  // ダイアログ操作
  const handleAddDialogClose = useCallback(() => {
    setIsAddDialogOpen(false);
  }, []);

  const handleAddDialogOpen = useCallback(() => {
    setIsAddDialogOpen(true);
  }, []);

  // ラベルを追加/削除
  const toggleLabel = useCallback(
    (label: Label) => {
      if (selectedLabelIds.has(label.id)) {
        // 削除
        onLabelsChange(selectedLabels.filter((l) => l.id !== label.id));
      } else {
        // 追加
        onLabelsChange([...selectedLabels, label]);
      }
    },
    [selectedLabels, selectedLabelIds, onLabelsChange],
  );

  // ラベル削除
  const removeLabel = useCallback(
    (labelId: string) => {
      onLabelsChange(selectedLabels.filter((label) => label.id !== labelId));
    },
    [selectedLabels, onLabelsChange],
  );

  // 新しいラベル作成後の処理
  const handleLabelCreated = useCallback(
    (labelData: { name: string; color: string }) => {
      console.log('🆕 LabelSelector: handleLabelCreated called with:', labelData);

      // LabelContextのcreateLabelでボード状態に保存
      console.log('🆕 LabelSelector: Calling createLabel from LabelContext');
      createLabel(labelData.name, labelData.color);
      console.log('🆕 LabelSelector: createLabel completed');

      // ダイアログを閉じる
      setIsAddDialogOpen(false);

      // 自動選択用の状態を設定（useEffectで監視される）
      setPendingAutoSelect(labelData);
      console.log('🆕 LabelSelector: Pending auto-select set');
    },
    [createLabel],
  );

  // 他のボードのラベルをコピーして選択
  const handleCopyAndSelectLabel = useCallback(
    (label: Label) => {
      copyLabelToCurrentBoard(label);

      // コピー後に自動選択（少し遅延させて新しいラベルが作成されるのを待つ）
      setPendingAutoSelect({ name: label.name, color: label.color });
    },
    [copyLabelToCurrentBoard],
  );

  return {
    allLabels,
    currentBoardLabels,
    otherBoardLabels,
    selectedLabelIds,
    isAddDialogOpen,
    handleAddDialogClose,
    handleAddDialogOpen,
    toggleLabel,
    removeLabel,
    handleLabelCreated,
    handleCopyAndSelectLabel,
  } as const;
};