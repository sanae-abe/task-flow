import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { EmptyStateProps } from '../types';

/**
 * 空状態コンポーネント
 *
 * テーブルにタスクが存在しない時の表示を担当します。
 * フィルタが適用されている場合はクリアボタンも表示します。
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  taskFilter,
  onClearFilter,
}) => {
  const { t } = useTranslation();
  const isFiltered = taskFilter.type !== 'all';
  const message = isFiltered ? t('task.noFilteredTasks') : t('task.noTasks');

  return (
    <div className='flex flex-col items-center justify-center py-8 text-foreground'>
      <p className='text-sm mb-2'>{message}</p>
      {isFiltered && (
        <Button variant='ghost' size='sm' onClick={onClearFilter}>
          {t('common.clearFilter')}
        </Button>
      )}
    </div>
  );
};
