import { useState, useCallback, useMemo, useRef, useEffect } from "react";

import { useLabel } from "../../contexts/LabelContext";
import type { Label } from "../../types";

interface UseLabelManagementProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

export const useLabelManagement = ({
  selectedLabels,
  onLabelsChange,
}: UseLabelManagementProps) => {
  const {
    getAllLabels,
    createLabel,
    isLabelInCurrentBoard,
    copyLabelToCurrentBoard,
  } = useLabel();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [pendingAutoSelect, setPendingAutoSelect] = useState<{
    name: string;
    color: string;
  } | null>(null);

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
      // LabelContextのcreateLabelでボード状態に保存
      createLabel(labelData.name, labelData.color);

      // ダイアログを閉じる
      setIsAddDialogOpen(false);

      // 自動選択用の状態を設定（useEffectで監視される）
      setPendingAutoSelect(labelData);
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
  };
};