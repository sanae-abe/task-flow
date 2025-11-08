/**
 * Label Management Data Table Component
 *
 * shadcn/ui data-table ベースのラベル管理テーブル
 */

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { DataTable } from '@/components/ui/data-table';
import type { LabelWithInfo } from '../../../types/labelManagement';
import IconButton from '../../shared/IconButton';
import { getLabelColors } from '../../../utils/labelHelpers';

interface LabelDataTableProps {
  labels: LabelWithInfo[];
  onEdit: (label: LabelWithInfo) => void;
  onDelete: (label: LabelWithInfo) => void;
}

export const LabelDataTable: React.FC<LabelDataTableProps> = ({
  labels,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();

  const columns: ColumnDef<LabelWithInfo>[] = [
    {
      accessorKey: 'name',
      header: t('label.label'),
      cell: ({ row }) => {
        const label = row.original;
        const colors = getLabelColors(label.color);
        return (
          <div className='flex items-center gap-2'>
            <div
              className='w-4 h-4 rounded-full border'
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.color,
              }}
            />
            <span className='font-medium'>{label.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'boardName',
      header: t('label.boardName'),
      cell: ({ row }) => {
        const boardName = row.getValue('boardName') as string;
        return <>{boardName || t('label.unknown')}</>;
      },
    },
    {
      accessorKey: 'usageCount',
      header: t('label.usageCount'),
      cell: ({ row }) => {
        const count = row.getValue('usageCount') as number;
        return (
          <div className='text-center'>
            <span
              className={`text-sm ${count > 0 ? 'font-bold text-foreground' : 'font-normal text-zinc-700'}`}
            >
              {count}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const label = row.original;
        return (
          <div className='flex items-center justify-center gap-1'>
            <IconButton
              icon={Edit}
              size='icon'
              onClick={() => onEdit(label)}
              className='h-8 w-8 p-0'
              ariaLabel={t('common.edit')}
            />
            <IconButton
              icon={Trash2}
              size='icon'
              onClick={() => onDelete(label)}
              className='h-8 w-8 p-0'
              ariaLabel={t('common.delete')}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={labels}
      emptyMessage={t('label.noLabels')}
      className='border-border'
    />
  );
};
