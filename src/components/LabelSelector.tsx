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

  // selectedLabelsの最新値を追跡するref
  const selectedLabelsRef = useRef<Label[]>(selectedLabels);
  const onLabelsChangeRef = useRef<(labels: Label[]) => void>(onLabelsChange);

  const allLabels = useMemo(() => {
    console.log('🏷️ [LabelSelector] useMemo getAllLabels実行');
    const result = getAllLabels();
    console.log('🏷️ [LabelSelector] useMemo結果:', result.length, 'labels');
    return result;
  }, [getAllLabels]);
  const selectedLabelIds = useMemo(() =>
    new Set(selectedLabels.map(label => label.id)),
    [selectedLabels]
  );

  // refを常に最新の値で更新
  useEffect(() => {
    console.log('🔄 LabelSelector ref更新:', {
      selectedLabels,
      onLabelsChange: onLabelsChange.name || 'anonymous function',
      onLabelsChangeRef: onLabelsChangeRef.current?.name || 'anonymous function'
    });
    selectedLabelsRef.current = selectedLabels;
    onLabelsChangeRef.current = onLabelsChange;
  });

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
    console.log('🏷️ handleLabelCreated開始:', labelData);
    console.log('🏷️ 現在の選択されたラベル:', selectedLabelsRef.current);

    // 作成前のラベル数を保存
    const beforeLabels = getAllLabels();
    const beforeCount = beforeLabels.length;
    console.log('🏷️ 作成前のラベル数:', beforeCount);

    // LabelContextのcreateLabelでボード状態に保存
    createLabel(labelData.name, labelData.color);

    // ダイアログを閉じる
    setIsAddDialogOpen(false);

    // 非同期でラベルが作成されるのを待って自動選択
    setTimeout(() => {
      console.log('🏷️ setTimeout実行開始');
      console.log('🏷️ setTimeout内でgetAllLabels()を直接呼び出し');
      const allCurrentLabels = getAllLabels();
      console.log('🏷️ 全ラベル取得:', allCurrentLabels);
      console.log('🏷️ 作成後のラベル数:', allCurrentLabels.length);
      console.log('🏷️ ラベル名一覧:', allCurrentLabels.map(l => l.name));

      // ラベルが実際に増加したかチェック
      if (allCurrentLabels.length > beforeCount) {
        // 最新のラベル（配列の最後の要素）を取得
        const createdLabel = allCurrentLabels[allCurrentLabels.length - 1];
        console.log('🏷️ 最新のラベル（自動選択対象）:', createdLabel);

        // createdLabelが存在するかチェック
        if (createdLabel) {
          const currentSelectedLabels = selectedLabelsRef.current;
          console.log('🏷️ ref経由で取得した現在の選択ラベル:', currentSelectedLabels);

          const isAlreadySelected = currentSelectedLabels.some((selected: Label) => selected.id === createdLabel.id);
          console.log('🏷️ 既に選択済みかチェック:', isAlreadySelected);

          if (!isAlreadySelected) {
            const newSelectedLabels = [...currentSelectedLabels, createdLabel];
            console.log('🏷️ 新しい選択ラベル配列:', newSelectedLabels);

            onLabelsChangeRef.current(newSelectedLabels);
            console.log('🏷️ ✅ 最新ラベルの自動選択完了');
          } else {
            console.log('🏷️ ⚠️ 最新ラベルは既に選択済み');
          }
        } else {
          console.log('🏷️ ❌ 最新ラベルが見つかりません');
        }
      } else {
        console.log('🏷️ ❌ ラベル数が増加していません - 作成に失敗した可能性');
      }
    }, 100); // 100ms後に実行
  }, [createLabel, getAllLabels]);

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