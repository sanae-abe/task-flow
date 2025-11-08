import React from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

import type { Priority } from '../types';
import { buildPrioritySelectorOptions } from '../utils/priorityConfig';

interface PrioritySelectorProps {
  priority?: Priority;
  onPriorityChange: (priority: Priority | undefined) => void;
  disabled?: boolean;
  variant?: 'compact' | 'full';
}

const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  priority,
  onPriorityChange,
  disabled = false,
  variant = 'full',
}) => {
  const { t } = useTranslation();
  const prioritySelectorOptions = buildPrioritySelectorOptions(t);

  const handleChange = (value: Priority | undefined) => {
    if (disabled) {
      return;
    }
    onPriorityChange(value);
  };

  return (
    <div className='space-y-3'>
      {variant === 'full' && (
        <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
          {t('priority.priority')}
        </label>
      )}
      <div
        role='radiogroup'
        aria-labelledby='priority-label'
        className={cn('flex flex-row space-y-0 space-x-3 mt-2')}
      >
        {prioritySelectorOptions.map(option => (
          <div
            key={option.value || 'none'}
            className='flex items-center space-x-2'
          >
            <input
              type='radio'
              id={`priority-${option.value || 'none'}`}
              name='priority'
              value={option.value || ''}
              checked={priority === option.value}
              onChange={() => handleChange(option.value)}
              disabled={disabled}
              className={cn(
                'h-4 w-4 text-primary focus:ring-primary border-gray-300',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            />
            <label
              htmlFor={`priority-${option.value || 'none'}`}
              className={cn(
                'text-sm font-medium text-foreground cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrioritySelector;
