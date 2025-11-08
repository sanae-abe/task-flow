import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface SubTaskHeaderProps {
  completedCount: number;
  totalCount: number;
  isAdding: boolean;
  onStartAdding: () => void;
}

const SubTaskHeader: React.FC<SubTaskHeaderProps> = ({
  completedCount,
  totalCount,
  isAdding,
  onStartAdding,
}) => {
  const { t } = useTranslation();

  return (
    <div className='flex items-center justify-between mb-2'>
      <h3 className='text-sm font-bold'>
        {t('subtask.subtask')}{' '}
        {totalCount > 0 && `(${completedCount}/${totalCount})`}
      </h3>
      {!isAdding && (
        <Button
          onClick={onStartAdding}
          variant='ghost'
          size='sm'
          aria-label={t('subtask.addSubtask')}
          className='flex items-center gap-1'
        >
          <Plus size={16} />
          {t('common.add')}
        </Button>
      )}
    </div>
  );
};

export default SubTaskHeader;
