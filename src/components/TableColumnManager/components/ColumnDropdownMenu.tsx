import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';
import type { TableColumn } from '@/contexts/TableColumnsContext';

interface ColumnDropdownMenuProps {
  columns: TableColumn[];
  onToggleVisibility: (columnId: string) => void;
  onOpenSettings: () => void;
  onResetToDefaults: () => void;
}

/**
 * カラム表示切り替えドロップダウンメニュー
 */
export const ColumnDropdownMenu: React.FC<ColumnDropdownMenuProps> = ({
  columns,
  onToggleVisibility,
  onOpenSettings,
  onResetToDefaults,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant='ghost'
        size='sm'
        aria-label='カラム詳細設定'
        className='p-1 h-auto min-w-0'
      >
        <Settings size={16} />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className='w-64 max-h-80 overflow-y-auto'>
      <DropdownMenuGroup>
        <DropdownMenuLabel>表示カラム</DropdownMenuLabel>
        <div className='max-h-48 overflow-y-auto'>
          {columns.map(column => (
            <DropdownMenuCheckboxItem
              checked={column.visible}
              key={column.id}
              onCheckedChange={() => onToggleVisibility(column.id)}
              className='cursor-pointer hover:bg-gray-50'
            >
              <span className='text-sm truncate'>{column.label}</span>
            </DropdownMenuCheckboxItem>
          ))}
        </div>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onOpenSettings} className='cursor-pointer'>
        <Settings size={16} className='mr-2' />
        詳細設定
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onResetToDefaults} className='cursor-pointer'>
        デフォルトに戻す
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
