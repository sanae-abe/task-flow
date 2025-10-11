import React from 'react';
import { Box, Text, IconButton } from '@primer/react';
import { PencilIcon, TrashIcon } from '@primer/octicons-react';
import type { LabelWithInfo } from '../../../types/labelManagement';
import LabelChip from '../../LabelChip';
import CounterLabel from './CounterLabel';

interface LabelTableRowProps {
  label: LabelWithInfo;
  index: number;
  totalCount: number;
  onEdit: (label: LabelWithInfo) => void;
  onDelete: (label: LabelWithInfo) => void;
}

const LabelTableRow: React.FC<LabelTableRowProps> = ({
  label,
  index,
  totalCount,
  onEdit,
  onDelete
}) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: '1fr 200px 60px 50px',
      gap: 2,
      p: 2,
      alignItems: 'center',
      borderBottom: index < totalCount - 1 ? '1px solid' : 'none',
      borderColor: 'border.muted',
      '&:hover': {
        bg: 'canvas.subtle',
        '& .label-actions': {
          opacity: 1
        }
      }
    }}
  >
    {/* ラベル表示 */}
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <LabelChip label={label} />
    </Box>

    {/* 所属ボード */}
    <Box sx={{
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }}>
      <Text sx={{
        color: 'fg.muted',
      }}>
        {label.boardName}
      </Text>
    </Box>

    {/* 使用数 */}
    <Box sx={{ textAlign: 'center' }}>
      <CounterLabel count={label.usageCount} />
    </Box>

    {/* アクションボタン */}
    <Box
      className="label-actions"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 1
      }}
    >
      <IconButton
        icon={PencilIcon}
        aria-label={`ラベル「${label.name}」を編集`}
        size="small"
        variant="invisible"
        onClick={() => onEdit(label)}
      />
      <IconButton
        icon={TrashIcon}
        aria-label={`ラベル「${label.name}」を全ボードから削除`}
        size="small"
        variant="invisible"
        onClick={() => onDelete(label)}
      />
    </Box>
  </Box>
);

export default LabelTableRow;