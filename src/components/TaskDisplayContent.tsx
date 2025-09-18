import { Text } from '@primer/react';
import React from 'react';

import type { Task } from '../types';

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
}

const TaskDisplayContent = React.memo<TaskDisplayContentProps>(({ task, columnName }) => (
    <>
      <TaskDisplaySection title="説明">
        <ContentBox 
          isEmpty={!task.description}
          emptyText="説明が設定されていません"
        >
          {task.description && (
            <LinkifiedText sx={{ fontSize: 1, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {task.description}
            </LinkifiedText>
          )}
        </ContentBox>
      </TaskDisplaySection>

      {task.dueDate && (
        <TaskDisplaySection title="期限">
          <ContentBox>
            <DueDateDisplay dueDate={new Date(task.dueDate)} showYear />
          </ContentBox>
        </TaskDisplaySection>
      )}

      {task.recurrence && (
        <TaskDisplaySection title="繰り返し設定">
          <ContentBox>
            <Text sx={{ fontSize: 1 }}>
              {getRecurrenceDescription(task.recurrence)}
            </Text>
          </ContentBox>
        </TaskDisplaySection>
      )}

      {columnName && (
        <TaskDisplaySection title="ステータス">
          <ContentBox>
            <Text sx={{ fontSize: 1 }}>{columnName}</Text>
          </ContentBox>
        </TaskDisplaySection>
      )}

      {task.completedAt && (
        <TaskDisplaySection title="完了日時">
          <ContentBox>
            <Text sx={{ fontSize: 1 }}>
              {formatDateTime(task.completedAt)}
            </Text>
          </ContentBox>
        </TaskDisplaySection>
      )}

      {task.labels && task.labels.length > 0 && (
        <TaskDisplaySection title="ラベル">
          <TaskLabels labels={task.labels} />
        </TaskDisplaySection>
      )}

      {task.files && task.files.length > 0 && (
        <TaskDisplaySection title="ファイル添付">
          <FileList attachments={task.files} />
        </TaskDisplaySection>
      )}
    </>
  ));

export default TaskDisplayContent;