import { Text } from '@primer/react';
import React from 'react';

import type { Task } from '../types';

import ContentBox from './ContentBox';
import DueDateDisplay from './DueDateDisplay';
import FileList from './FileList';
import TaskDisplaySection from './TaskDisplaySection';
import TaskLabels from './TaskLabels';

interface TaskDisplayContentProps {
  task: Task;
  columnName?: string;
}

const TaskDisplayContent: React.FC<TaskDisplayContentProps> = ({ task, columnName }) => (
    <>

      {task.labels && task.labels.length > 0 && (
        <TaskDisplaySection title="ラベル">
          <TaskLabels labels={task.labels} />
        </TaskDisplaySection>
      )}
      
      <TaskDisplaySection title="説明">
        <ContentBox 
          isEmpty={!task.description}
          emptyText="説明が設定されていません"
        >
          {task.description && (
            <Text sx={{ fontSize: 1, whiteSpace: 'pre-wrap' }}>
              {task.description}
            </Text>
          )}
        </ContentBox>
      </TaskDisplaySection>

      {task.dueDate && (
        <TaskDisplaySection title="期限">
          <DueDateDisplay dueDate={task.dueDate} showYear />
        </TaskDisplaySection>
      )}

      {columnName && (
        <TaskDisplaySection title="ステータス">
          <ContentBox>
            <Text sx={{ fontSize: 1 }}>{columnName}</Text>
          </ContentBox>
        </TaskDisplaySection>
      )}

      {task.attachments && task.attachments.length > 0 && (
        <TaskDisplaySection title="ファイル添付">
          <FileList attachments={task.attachments} />
        </TaskDisplaySection>
      )}
    </>
  );

export default TaskDisplayContent;