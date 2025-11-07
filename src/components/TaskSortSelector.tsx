import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { SortOption, SortConfig } from '../types';

interface TaskSortSelectorProps {
  readonly currentSort: SortOption;
  readonly onSortChange: (option: SortOption) => void;
}

const TaskSortSelector: React.FC<TaskSortSelectorProps> = ({
  currentSort,
  onSortChange,
}) => {
  const { t } = useTranslation();

  const SORT_OPTIONS: SortConfig[] = useMemo(
    () => [
      { option: 'manual', label: t('filter.manual') },
      { option: 'priority', label: t('filter.priority') },
      { option: 'createdAt', label: t('filter.createdAt') },
      { option: 'updatedAt', label: t('filter.updatedAt') },
      { option: 'dueDate', label: t('filter.dueDate') },
      { option: 'title', label: t('filter.title') },
    ],
    [t]
  );

  const currentSortConfig = SORT_OPTIONS.find(
    option => option.option === currentSort
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          aria-label={t('filter.currentSort', {
            sort: currentSortConfig?.label ?? t('filter.manual'),
          })}
          className='flex items-center gap-1 text-zinc-700 text-xs'
        >
          <ArrowUpDown size={16} />
          {currentSortConfig?.label ?? t('filter.manual')}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end'>
        <DropdownMenuRadioGroup
          value={currentSort}
          onValueChange={value => onSortChange(value as SortOption)}
        >
          {SORT_OPTIONS.map(option => (
            <DropdownMenuRadioItem
              key={option.option}
              value={option.option}
              className={currentSort === option.option ? 'bg-gray-100' : ''}
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskSortSelector;
