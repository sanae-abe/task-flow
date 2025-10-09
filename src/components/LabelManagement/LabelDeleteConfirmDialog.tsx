import React from 'react';
import { Box, Text } from '@primer/react';
import { AlertIcon, TrashIcon } from '@primer/octicons-react';

import type { Label } from '../../types';
import UnifiedDialog from '../shared/Dialog/UnifiedDialog';
import LabelChip from '../LabelChip';

interface LabelDeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  label: Label | null;
  usageCount?: number;
}

const LabelDeleteConfirmDialog: React.FC<LabelDeleteConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  label,
  usageCount = 0
}) => {
  if (!label) {return null;}

  const isUsed = usageCount > 0;

  const actions = [
    {
      label: 'キャンセル',
      variant: 'default' as const,
      onClick: onClose
    },
    {
      label: '削除',
      variant: 'danger' as const,
      onClick: onConfirm
    }
  ];

  return (
    <UnifiedDialog
      isOpen={isOpen}
      onClose={onClose}
      title="ラベルの削除"
      variant="modal"
      size="medium"
      actions={actions}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 警告アイコンとメッセージ */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 3,
          bg: isUsed ? 'attention.subtle' : 'danger.subtle',
          borderRadius: 2,
          border: '1px solid',
          borderColor: isUsed ? 'attention.muted' : 'danger.muted'
        }}>
          <AlertIcon size={20} />
          <Text sx={{ fontWeight: 'bold' }}>
            {isUsed
              ? 'このラベルは使用中です'
              : '本当にこのラベルを削除しますか？'
            }
          </Text>
        </Box>

        {/* 削除対象のラベル */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          p: 3,
          bg: 'white',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'border.default'
        }}>
          <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
            削除対象のラベル
          </Text>
          <LabelChip label={label} />
        </Box>

        {/* 使用状況の詳細 */}
        {isUsed && (
          <Box sx={{
            p: 3,
            bg: 'attention.subtle',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'attention.muted'
          }}>
            <Text sx={{ fontWeight: 'bold', mb: 2, display: 'block' }}>
              使用状況
            </Text>
            <Text sx={{ fontSize: 1 }}>
              このラベルは現在 <Text sx={{ fontWeight: 'bold' }}>{usageCount}個</Text> のタスクで使用されています。
            </Text>
            <Text sx={{ fontSize: 1, mt: 2, color: 'attention.fg' }}>
              削除すると、これらのタスクからラベルが除去されます。この操作は元に戻せません。
            </Text>
          </Box>
        )}

        {/* 削除後の影響について */}
        <Box sx={{
          p: 3,
          bg: 'danger.subtle',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'danger.muted'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TrashIcon size={16} />
            <Text sx={{ fontWeight: 'bold' }}>削除の影響</Text>
          </Box>
          <Text sx={{ fontSize: 1 }}>
            この操作は元に戻すことができません。削除されたラベルの復元はできません。
          </Text>
        </Box>
      </Box>
    </UnifiedDialog>
  );
};

export default LabelDeleteConfirmDialog;