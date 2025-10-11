import { FormControl, Select } from '@primer/react';
import React from 'react';

import type { Priority } from '../types';

interface PrioritySelectorProps {
  priority?: Priority;
  onPriorityChange: (priority: Priority | undefined) => void;
  disabled?: boolean;
}

const priorityOptions = [
  { value: '', label: '選択なし' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' }
];

const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  priority,
  onPriorityChange,
  disabled = false
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onPriorityChange(value === '' ? undefined : value as Priority);
  };

  return (
    <FormControl>
      <FormControl.Label>優先度（任意）</FormControl.Label>
      <Select
        value={priority || ''}
        onChange={handleChange}
        disabled={disabled}
        sx={{ width: '100%' }}
      >
        {priorityOptions.map((option) => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    </FormControl>
  );
};

export default PrioritySelector;