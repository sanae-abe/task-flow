import { PlusIcon, TagIcon, CheckIcon } from '@primer/octicons-react';
import {
  Button,
  Box,
  ActionMenu,
  ActionList
} from '@primer/react';
import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';

import { useLabel } from '../contexts/LabelContext';
import type { Label } from '../types';
import { getLabelColors } from '../utils/labelHelpers';

import { LabelFormDialog } from './LabelManagement';
import LabelChip from './LabelChip';

/**
 * LabelSelector コンポーネントの定数
 */
const LABEL_CIRCLE_SIZE = 12;
const EMPTY_LABELS_MESSAGE = 'ラベルがありません';
const SELECT_LABEL_TEXT = 'ラベルを選択';
const ADD_LABEL_TEXT = '新しいラベルを追加';

interface LabelSelectorProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

const LabelSelector = memo<LabelSelectorProps>(({
  selectedLabels,
  onLabelsChange
}) => {
  const { getAllLabels, createLabel } = useLabel();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [pendingAutoSelect, setPendingAutoSelect] = useState<{ name: string; color: string } | null>(null);

  // selectedLabelsの最新値を追跡するref
  const selectedLabelsRef = useRef<Label[]>(selectedLabels);
  const onLabelsChangeRef = useRef<(labels: Label[]) => void>(onLabelsChange);

  const allLabels = useMemo(() => getAllLabels(), [getAllLabels]);
  const selectedLabelIds = useMemo(() =>
    new Set(selectedLabels.map(label => label.id)),
    [selectedLabels]
  );

  // refを常に最新の値で更新
  useEffect(() => {
    selectedLabelsRef.current = selectedLabels;
    onLabelsChangeRef.current = onLabelsChange;
  }, [selectedLabels, onLabelsChange]);

  // allLabelsの変化を監視して自動選択を実行
  useEffect(() => {
    if (pendingAutoSelect) {
      // 作成されたラベルを名前と色で検索
      const createdLabel = allLabels.find(label =>
        label.name === pendingAutoSelect.name && label.color === pendingAutoSelect.color
      );

      if (createdLabel) {
        const currentSelectedLabels = selectedLabelsRef.current;
        const isAlreadySelected = currentSelectedLabels.some(selected => selected.id === createdLabel.id);

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
  const toggleLabel = useCallback((label: Label) => {
    if (selectedLabelIds.has(label.id)) {
      // 削除
      onLabelsChange(selectedLabels.filter(l => l.id !== label.id));
    } else {
      // 追加
      onLabelsChange([...selectedLabels, label]);
    }
  }, [selectedLabels, selectedLabelIds, onLabelsChange]);

  // ラベル削除
  const removeLabel = useCallback((labelId: string) => {
    onLabelsChange(selectedLabels.filter(label => label.id !== labelId));
  }, [selectedLabels, onLabelsChange]);

  // 新しいラベル作成後の処理
  const handleLabelCreated = useCallback((labelData: { name: string; color: string }) => {
    // LabelContextのcreateLabelでボード状態に保存
    createLabel(labelData.name, labelData.color);

    // ダイアログを閉じる
    setIsAddDialogOpen(false);

    // 自動選択用の状態を設定（useEffectで監視される）
    setPendingAutoSelect(labelData);
  }, [createLabel]);

  // スタイルオブジェクトをメモ化
  const selectedLabelsContainerStyles = useMemo(() => ({
    mb: 2,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 1,
    '& button': {
      height: 'auto',
      padding: 0,
      fontSize: 0
    }
  }), []);

  const menuContainerStyles = useMemo(() => ({
    display: 'flex',
    gap: 2,
    alignItems: 'center'
  }), []);

  const buttonStyles = useMemo(() => ({
    '&:hover': {
      color: 'fg.default',
      bg: 'neutral.subtle'
    }
  }), []);

  return (
    <Box sx={{ mt: 2 }}>
      {/* 選択されたラベルを表示 */}
      {selectedLabels.length > 0 && (
        <Box sx={selectedLabelsContainerStyles}>
          {selectedLabels.map(label => (
            <LabelChip
              key={label.id}
              label={label}
              showRemove
              onRemove={removeLabel}
            />
          ))}
        </Box>
      )}

      {/* ラベル選択・追加のアクションメニュー */}
      <Box sx={menuContainerStyles}>
        {/* ラベル選択 */}
        <ActionMenu>
          <ActionMenu.Button
            leadingVisual={TagIcon}
            sx={buttonStyles}
            aria-label="ラベル選択メニューを開く"
          >
            {SELECT_LABEL_TEXT}
          </ActionMenu.Button>
          <ActionMenu.Overlay>
            <ActionList>
              {allLabels.map(label => {
                const colors = getLabelColors(label.color);
                const isSelected = selectedLabelIds.has(label.id);
                return (
                  <ActionList.Item
                    key={label.id}
                    onSelect={() => toggleLabel(label)}
                  >
                    <ActionList.LeadingVisual>
                      <Box
                        sx={{
                          width: `${LABEL_CIRCLE_SIZE}px`,
                          height: `${LABEL_CIRCLE_SIZE}px`,
                          borderRadius: '50%',
                          bg: colors.bg,
                          border: '1px solid',
                          borderColor: colors.color
                        }}
                        aria-label={`ラベル色: ${label.color}`}
                      />
                    </ActionList.LeadingVisual>
                    {label.name}
                    {isSelected && (
                      <ActionList.TrailingVisual>
                        <CheckIcon size={16} />
                      </ActionList.TrailingVisual>
                    )}
                  </ActionList.Item>
                );
              })}

              {allLabels.length === 0 && (
                <ActionList.Item disabled>
                  {EMPTY_LABELS_MESSAGE}
                </ActionList.Item>
              )}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>

        {/* ラベル追加 */}
        <Button
          leadingVisual={PlusIcon}
          onClick={handleAddDialogOpen}
          sx={buttonStyles}
          aria-label="新しいラベルを作成"
        >
          {ADD_LABEL_TEXT}
        </Button>
      </Box>

      {/* ラベル追加ダイアログ */}
      <LabelFormDialog
        mode="create"
        isOpen={isAddDialogOpen}
        onClose={handleAddDialogClose}
        onSave={handleLabelCreated}
      />
    </Box>
  );
});

export default LabelSelector;