import { PlusIcon, TagIcon, CheckIcon } from '@primer/octicons-react';
import {
  Button,
  Box,
  ActionMenu,
  ActionList
} from '@primer/react';
import { useState, useCallback, useMemo, memo } from 'react';

import { useKanban } from '../contexts/KanbanContext';
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
  const { getAllLabels } = useKanban();
  const { createLabel } = useLabel();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const allLabels = useMemo(() => getAllLabels(), [getAllLabels]);
  const selectedLabelIds = useMemo(() =>
    new Set(selectedLabels.map(label => label.id)),
    [selectedLabels]
  );

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

    // 新しく作成されたラベルを選択状態に追加するため、少し遅延後に処理
    setTimeout(() => {
      const updatedLabels = getAllLabels();
      const createdLabel = updatedLabels.find(label =>
        label.name === labelData.name && label.color === labelData.color
      );
      if (createdLabel && !selectedLabels.some(selected => selected.id === createdLabel.id)) {
        onLabelsChange([...selectedLabels, createdLabel]);
      }
    }, 100);
  }, [createLabel, getAllLabels, selectedLabels, onLabelsChange]);

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