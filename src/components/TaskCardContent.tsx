import { CircleCheck } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import CircleCheck2Icon from './shared/icons/CircleCheck2Icon';

import type { TaskDisplayProps } from '../types/task';
import IconButton from './shared/IconButton';

import DueDateBadge from './DueDateBadge';
import PriorityBadge from './PriorityBadge';
import TaskIndicators from './TaskIndicators';
import TaskLabels from './TaskLabels';

const TaskCardContent: React.FC<TaskDisplayProps> = ({
  task,
  isOverdue,
  isDueToday,
  isDueTomorrow,
  formatDueDate,
  onComplete,
  isRightmostColumn: _isRightmostColumn = false,
  useInvertedIcon = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className='flex-1 flex flex-col min-h-0 gap-2'>
      {/* タイトル行 */}
      <div className='flex items-start my-1 gap-1'>
        {onComplete && (
          <IconButton
            icon={
              useInvertedIcon
                ? CircleCheck2Icon
                : task.completedAt
                  ? CircleCheck2Icon
                  : CircleCheck // 完了状態に応じてアイコンを切り替え
            }
            onClick={onComplete}
            ariaLabel={
              task.completedAt ? t('task.reopenTask') : t('task.completeTask')
            }
            variant='success'
            size='icon'
            style={{
              pl: 0,
              pt: 0,
              width: '26px',
              height: '20px',
              flexShrink: 0,
              '&:hover': {
                bg: 'transparent',
                color: 'success.fg',
              },
            }}
          />
        )}
        <h2 className='text-sm m-0 font-medium text-foreground leading-snug flex-1 break-words'>
          {task.title}
        </h2>
      </div>

      {/* 優先度とラベル行 */}
      {(task.priority || (task.labels && task.labels.length > 0)) && (
        <div className='flex items-center gap-2 flex-wrap'>
          <PriorityBadge priority={task.priority} showIcon showLabel />
          <TaskLabels labels={task.labels} />
        </div>
      )}

      {/* 下部情報行 */}
      {(task.dueDate ||
        (task.subTasks && task.subTasks.length > 0) ||
        (task.files && task.files.length > 0)) && (
        <div className='flex justify-between items-center gap-2 flex-wrap'>
          <div className='flex-1 min-w-0'>
            {task.dueDate && (
              <DueDateBadge
                dueDate={new Date(task.dueDate)}
                isOverdue={isOverdue}
                isDueToday={isDueToday}
                isDueTomorrow={isDueTomorrow}
                formatDueDate={formatDueDate}
                isRecurrence={task.recurrence?.enabled}
              />
            )}
          </div>
          <TaskIndicators subTasks={task.subTasks} attachments={task.files} />
        </div>
      )}
    </div>
  );
};

export default TaskCardContent;
