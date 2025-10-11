import { SortAscIcon } from '@primer/octicons-react';
import { ActionMenu, ActionList, Button } from '@primer/react';
import React from 'react';

import type { SortOption, SortConfig } from '../types';

const SORT_OPTIONS: SortConfig[] = [
  { option: 'manual', label: '手動' },
  { option: 'priority', label: '優先度順' },
  { option: 'createdAt', label: '作成日順' },
  { option: 'updatedAt', label: '更新日順' },
  { option: 'dueDate', label: '期限順' },
  { option: 'title', label: '名前順' },
];

interface TaskSortSelectorProps {
  readonly currentSort: SortOption;
  readonly onSortChange: (option: SortOption) => void;
}

const TaskSortSelector: React.FC<TaskSortSelectorProps> = ({
  currentSort,
  onSortChange,
}) => {
  const currentSortConfig = SORT_OPTIONS.find(
    option => option.option === currentSort
  );

  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <Button
          variant="invisible"
          size="small"
          leadingVisual={SortAscIcon}
          aria-label={`現在のソート: ${currentSortConfig?.label ?? '手動'}`}
        >
          {currentSortConfig?.label ?? '手動'}
        </Button>
      </ActionMenu.Anchor>
      
      <ActionMenu.Overlay>
        <ActionList selectionVariant="single">
          {SORT_OPTIONS.map((option) => (
            <ActionList.Item
              key={option.option}
              selected={currentSort === option.option}
              onSelect={() => onSortChange(option.option)}
            >
              {option.label}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
};

export default TaskSortSelector;