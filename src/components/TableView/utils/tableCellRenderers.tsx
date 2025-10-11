import React from 'react';
import { Text, Box, IconButton, ActionMenu, ActionList, Button } from '@primer/react';
import { XIcon, CheckIcon, PaperclipIcon, TriangleDownIcon, SyncIcon } from '@primer/octicons-react';

import type { TaskWithColumn } from '../../../types/table';
import type { KanbanBoard } from '../../../types';
import { formatDate, getDateStatus } from '../../../utils/dateHelpers';
import { stripHtml } from '../../../utils/textHelpers';
import LabelChip from '../../LabelChip';
import StatusBadge from '../../shared/StatusBadge';
import SubTaskProgressBar from '../../SubTaskProgressBar';
import { getPriorityText, getCompletionRate, getDateColor } from './tableHelpers';

/**
 * アクションセル（削除ボタン）の描画
 */
export const renderActionsCell = (
  task: TaskWithColumn,
  onDeleteClick: (task: TaskWithColumn) => void
) => (
  <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
    <IconButton
      aria-label="タスクを削除"
      variant="invisible"
      icon={XIcon}
      size="small"
      onClick={() => onDeleteClick(task)}
      sx={{
        '&:hover': {
          bg: 'transparent',
          color: 'danger.fg'
        }
      }}
    />
  </Box>
);

/**
 * タイトルセルの描画
 */
export const renderTitleCell = (task: TaskWithColumn) => (
  <Text
    sx={{
      display: 'block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      fontWeight: 'semibold',
      color: task.completedAt ? 'fg.default' : 'fg.default',
      textDecoration: task.completedAt ? 'line-through' : 'none',
      fontSize: 1,
    }}
  >
    {task.title}
  </Text>
);

/**
 * ステータスセル（ドロップダウン）の描画
 */
export const renderStatusCell = (
  task: TaskWithColumn,
  currentBoard: KanbanBoard | null,
  onStatusChange: (task: TaskWithColumn, newColumnId: string) => void
) => (
  <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
    <ActionMenu>
      <ActionMenu.Anchor>
        <Button
          variant="invisible"
          size="small"
          trailingVisual={TriangleDownIcon}
          sx={{
            padding: 0,
            minHeight: 'auto',
            border: 'none',
            '&:hover': {
              bg: 'transparent',
            },
          }}
        >
          <StatusBadge size="medium" variant="default" fontWeight="400">
            {task.status}
          </StatusBadge>
        </Button>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay>
        <ActionList selectionVariant="single">
          <ActionList.Group title="ステータス変更" selectionVariant="single">
            {currentBoard?.columns.map(column => (
              <ActionList.Item
                key={column.id}
                onSelect={() => onStatusChange(task, column.id)}
                selected={task.columnId === column.id}
              >
                {column.title}
              </ActionList.Item>
            ))}
          </ActionList.Group>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  </Box>
);

/**
 * 優先度セルの描画
 */
export const renderPriorityCell = (task: TaskWithColumn) => (
  <Box>
    {task.priority ? (
      <Text sx={{ color: 'fg.default', fontSize: 1 }}>
        {getPriorityText(task.priority)}
      </Text>
    ) : (
      <Text sx={{ color: 'fg.default', fontSize: 1 }}>
        -
      </Text>
    )}
  </Box>
);

/**
 * 期限セルの描画
 */
export const renderDueDateCell = (task: TaskWithColumn) => {
  if (!task.dueDate) {
    return (
      <Box>
        <Text sx={{ color: 'fg.default', fontSize: 1 }}>
          -
        </Text>
      </Box>
    );
  }

  const dueDate = new Date(task.dueDate);
  const { isOverdue, isDueToday, isDueTomorrow } = getDateStatus(dueDate);
  const formattedDate = formatDate(task.dueDate, 'MM/dd HH:mm');
  const dateColor = getDateColor(isOverdue, isDueToday, isDueTomorrow);

  return (
    <Text sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 1, color: dateColor }}>
      {formattedDate}
      {task.recurrence?.enabled && (
        <SyncIcon size={12} />
      )}
    </Text>
  );
};

/**
 * ラベルセルの描画
 */
export const renderLabelsCell = (task: TaskWithColumn) => (
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
    {task.labels?.slice(0, 2).map((label) => (
      <LabelChip
        key={label.id}
        label={label}
      />
    ))}
    {task.labels && task.labels.length > 2 && (
      <Text
        sx={{
          fontSize: 0,
          color: 'fg.default',
          px: 2,
          py: 1,
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2,
        }}
      >
        +{task.labels.length - 2}
      </Text>
    )}
  </Box>
);

/**
 * サブタスクセルの描画
 */
export const renderSubTasksCell = (task: TaskWithColumn) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    {task.subTasks && task.subTasks.length > 0 ? (
      <>
        <CheckIcon size={12} />
        <Text sx={{ fontSize: 1, color: 'fg.default' }}>
          {task.subTasks.filter(sub => sub.completed).length}/{task.subTasks.length}
        </Text>
      </>
    ) : (
      <Text sx={{ color: 'fg.default', fontSize: 1 }}>
        -
      </Text>
    )}
  </Box>
);

/**
 * ファイルセルの描画
 */
export const renderFilesCell = (task: TaskWithColumn) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    {task.files && task.files.length > 0 ? (
      <>
        <PaperclipIcon size={12} />
        <Text sx={{ fontSize: 1, color: 'fg.default' }}>
          {task.files.length}
        </Text>
      </>
    ) : (
      <Text sx={{ color: 'fg.default', fontSize: 1 }}>
        -
      </Text>
    )}
  </Box>
);

/**
 * 進捗セルの描画
 */
export const renderProgressCell = (task: TaskWithColumn) => (
  <Box>
    {task.subTasks && task.subTasks.length > 0 ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SubTaskProgressBar
          completedCount={task.subTasks.filter(sub => sub.completed).length}
          totalCount={task.subTasks.length}
        />
        <Text sx={{ fontSize: 1, color: 'fg.default' }}>
          {getCompletionRate(task)}%
        </Text>
      </Box>
    ) : (
      <Text sx={{ color: 'fg.default', fontSize: 1 }}>
        -
      </Text>
    )}
  </Box>
);

/**
 * 作成日セルの描画
 */
export const renderCreatedAtCell = (task: TaskWithColumn) => (
  <Text sx={{ fontSize: 1, color: 'fg.default' }}>
    {formatDate(task.createdAt, 'MM/dd HH:mm')}
  </Text>
);

/**
 * 更新日セルの描画
 */
export const renderUpdatedAtCell = (task: TaskWithColumn) => (
  <Text sx={{ fontSize: 1, color: 'fg.default' }}>
    {formatDate(task.updatedAt, 'MM/dd HH:mm')}
  </Text>
);

/**
 * 完了日セルの描画
 */
export const renderCompletedAtCell = (task: TaskWithColumn) => (
  <Box>
    {task.completedAt ? (
      <Text sx={{ fontSize: 1, color: 'fg.default' }}>
        {formatDate(task.completedAt, 'MM/dd HH:mm')}
      </Text>
    ) : (
      <Text sx={{ color: 'fg.default', fontSize: 1 }}>
        -
      </Text>
    )}
  </Box>
);

/**
 * 説明セルの描画
 */
export const renderDescriptionCell = (task: TaskWithColumn) => (
  <Box>
    {task.description ? (
      <Text
        sx={{
          display: 'block',
          fontSize: 0,
          color: 'fg.default',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '580px'
        }}
        title={stripHtml(task.description)}
      >
        {stripHtml(task.description)}
      </Text>
    ) : (
      <Text sx={{ color: 'fg.default', fontSize: 0 }}>
        -
      </Text>
    )}
  </Box>
);

/**
 * 繰り返しセルの描画
 */
export const renderRecurrenceCell = (task: TaskWithColumn) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'fg.default' }}>
    {task.recurrence?.enabled ? (
      <>
        <SyncIcon size={12} />
        <Text sx={{ fontSize: 1 }}>
          {task.recurrence.pattern === 'daily' && '毎日'}
          {task.recurrence.pattern === 'weekly' && '毎週'}
          {task.recurrence.pattern === 'monthly' && '毎月'}
          {task.recurrence.pattern === 'yearly' && '毎年'}
        </Text>
      </>
    ) : (
      <Text sx={{ color: 'fg.default', fontSize: 1 }}>
        -
      </Text>
    )}
  </Box>
);

/**
 * デフォルトセルの描画
 */
export const renderDefaultCell = () => (
  <Text sx={{ fontSize: 1, color: 'fg.default' }}>
    -
  </Text>
);