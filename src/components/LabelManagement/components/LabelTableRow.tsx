import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Edit, Trash2 } from 'lucide-react';
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
  <div
    className={cn(
      "grid grid-cols-[1fr_200px_60px_50px] gap-2 p-2 items-center",
      "hover:bg-gray-50 hover:[&_.label-actions]:opacity-100",
      index < totalCount - 1 && "border-b border-border border-gray-200"
    )}
  >
    {/* ラベル表示 */}
    <div className="flex items-center">
      <LabelChip label={label} />
    </div>

    {/* 所属ボード */}
    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
      <span className="text-gray-600">
        {label.boardName}
      </span>
    </div>

    {/* 使用数 */}
    <div className="text-center">
      <CounterLabel count={label.usageCount} />
    </div>

    {/* アクションボタン */}
    <div className="label-actions flex justify-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        aria-label={`ラベル「${label.name}」を編集`}
        onClick={() => onEdit(label)}
        className="p-1 h-auto min-w-0"
      >
        <Edit size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label={`ラベル「${label.name}」を全ボードから削除`}
        onClick={() => onDelete(label)}
        className="p-1 h-auto min-w-0"
      >
        <Trash2 size={16} />
      </Button>
    </div>
  </div>
);

export default LabelTableRow;