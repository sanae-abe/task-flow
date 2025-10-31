import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Copy } from 'lucide-react';
import React from 'react';

import type { Label } from '../../types';
import { LabelColorCircle } from './LabelColorCircle';

interface OtherBoardLabelSectionProps {
  labels: Label[];
  onCopyAndSelectLabel: (label: Label) => void;
}

export const OtherBoardLabelSection: React.FC<OtherBoardLabelSectionProps> = ({
  labels,
  onCopyAndSelectLabel,
}) => {
  if (labels.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>他のボード</DropdownMenuLabel>
      {labels.map(label => (
        <DropdownMenuItem
          key={label.id}
          onClick={() => onCopyAndSelectLabel(label)}
        >
          <Copy size={16} className='mr-2' />
          <LabelColorCircle color={label.color} />
          <span className='ml-2 flex-1'>{label.name}</span>
        </DropdownMenuItem>
      ))}
    </>
  );
};
