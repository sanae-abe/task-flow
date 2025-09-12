import { PlusIcon, TagIcon } from '@primer/octicons-react';
import { 
  Button, 
  Box,
  ActionMenu,
  ActionList
} from '@primer/react';
import { useState, useCallback, useMemo } from 'react';

import { useKanban } from '../contexts/KanbanContext';
import type { Label } from '../types';
import { getLabelColors } from '../utils/labelHelpers';

import LabelAddDialog from './LabelAddDialog';
import LabelChip from './LabelChip';

interface ImprovedLabelSelectorProps {
  selectedLabels: Label[];
  onLabelsChange: (labels: Label[]) => void;
}

const ImprovedLabelSelector: React.FC<ImprovedLabelSelectorProps> = ({
  selectedLabels,
  onLabelsChange
}) => {
  const { getAllLabels } = useKanban();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const allLabels = getAllLabels();
  const selectedLabelIds = useMemo(() => 
    new Set(selectedLabels.map(label => label.id)), 
    [selectedLabels]
  );

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
  const handleLabelCreated = useCallback((newLabel: Label) => {
    onLabelsChange([...selectedLabels, newLabel]);
    setIsAddDialogOpen(false);
  }, [selectedLabels, onLabelsChange]);

  return (
    <Box sx={{ mt: 1 }}>
      {/* 選択されたラベルを表示 */}
      {selectedLabels.length > 0 && (
        <Box sx={{
          mb: 2,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
          '& button': {
            height: 'auto',
            padding: 0,
            fontSize: 0
        } }}>
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
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {/* ラベル選択 */}
        <ActionMenu>
          <ActionMenu.Button
            variant="invisible"
            size="small"
            leadingVisual={TagIcon}
            sx={{
              color: 'fg.muted',
              '&:hover': {
                color: 'fg.default',
                bg: 'neutral.subtle'
              }
            }}
          >
            ラベルを選択
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
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          bg: colors.bg,
                          border: '1px solid',
                          borderColor: colors.color
                        }}
                      />
                    </ActionList.LeadingVisual>
                    {label.name}
                    {isSelected && (
                      <ActionList.TrailingVisual>
                        ✓
                      </ActionList.TrailingVisual>
                    )}
                  </ActionList.Item>
                );
              })}
              {allLabels.length === 0 && (
                <ActionList.Item disabled>
                  ラベルがありません
                </ActionList.Item>
              )}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>

        {/* ラベル追加 */}
        <Button
          variant="invisible"
          size="small"
          leadingVisual={PlusIcon}
          onClick={() => setIsAddDialogOpen(true)}
          sx={{
            color: 'fg.muted',
            '&:hover': {
              color: 'fg.default',
              bg: 'neutral.subtle'
            }
          }}
        >
          新しいラベルを追加
        </Button>
      </Box>

      {/* ラベル追加ダイアログ */}
      <LabelAddDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onLabelCreated={handleLabelCreated}
      />
    </Box>
  );
};

export default ImprovedLabelSelector;