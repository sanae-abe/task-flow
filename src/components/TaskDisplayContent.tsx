import React from 'react';
import { useTranslation } from 'react-i18next';

import type { Task } from '../types';
import type { VirtualRecurringTask } from '../utils/calendarRecurrence';

import { formatDateTime } from '../utils/dateHelpers';
import { getRecurrenceDescription } from '../utils/recurrence';
import ContentBox from './ContentBox';
import DueDateDisplay from './DueDateDisplay';
import FileList from './FileList';
import LinkifiedText from './LinkifiedText';
import TaskDisplaySection from './TaskDisplaySection';
import TaskLabels from './TaskLabels';

interface TaskDisplayContentProps {
  task: Task;
  columnName?: string;
  virtualTaskInfo?: VirtualRecurringTask | null;
}

const TaskDisplayContent = React.memo<TaskDisplayContentProps>(
  ({ task, columnName, virtualTaskInfo }) => {
    const { t } = useTranslation();
    // 仮想タスクの場合は仮想タスクの期限を使用、そうでなければ元のタスクの期限を使用
    const displayDueDate = virtualTaskInfo?.dueDate || task.dueDate;

    return (
      <>
        <TaskDisplaySection title={t('task.description')}>
          <ContentBox
            isEmpty={!task.description}
            emptyText={t('task.descriptionNotSet')}
          >
            {task.description && (
              <LinkifiedText className='text-sm whitespace-pre-wrap break-anywhere'>
                {task.description}
              </LinkifiedText>
            )}
          </ContentBox>
        </TaskDisplaySection>

        {displayDueDate && (
          <TaskDisplaySection title={t('task.dueDate')}>
            <ContentBox>
              <DueDateDisplay dueDate={new Date(displayDueDate)} showYear />
            </ContentBox>
          </TaskDisplaySection>
        )}

        {task.recurrence && (
          <TaskDisplaySection title={t('task.recurrenceSettings')}>
            <ContentBox>
              <span className='text-sm'>
                {getRecurrenceDescription(task.recurrence)}
              </span>
            </ContentBox>
          </TaskDisplaySection>
        )}

        {columnName && (
          <TaskDisplaySection title={t('task.status')}>
            <ContentBox>
              <span className='text-sm'>{columnName}</span>
            </ContentBox>
          </TaskDisplaySection>
        )}

        {task.priority && (
          <TaskDisplaySection title={t('task.priority')}>
            <ContentBox>
              <span className='text-sm'>{t(`priority.${task.priority}`)}</span>
            </ContentBox>
          </TaskDisplaySection>
        )}

        {task.completedAt && (
          <TaskDisplaySection title={t('task.completedDateTime')}>
            <ContentBox>
              <span className='text-sm'>
                {formatDateTime(task.completedAt)}
              </span>
            </ContentBox>
          </TaskDisplaySection>
        )}

        {task.labels && task.labels.length > 0 && (
          <TaskDisplaySection title={t('task.labels')}>
            <TaskLabels labels={task.labels} />
          </TaskDisplaySection>
        )}

        {task.files && task.files.length > 0 && (
          <TaskDisplaySection title={t('task.fileAttachments')}>
            <FileList attachments={task.files} />
          </TaskDisplaySection>
        )}
      </>
    );
  }
);

export default TaskDisplayContent;
