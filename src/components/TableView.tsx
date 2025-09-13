import React, { useMemo, useCallback } from 'react';
import { Text, Box, IconButton, ActionMenu, ActionList, Button } from '@primer/react';
import { KebabHorizontalIcon, CheckIcon, PaperclipIcon } from '@primer/octicons-react';

import { useKanban } from '../contexts/KanbanContext';
import type { Task } from '../types';
import { sortTasks } from '../utils/taskSort';
import { filterTasks } from '../utils/taskFilter';
import { formatDate, getDateStatus, formatDueDate } from '../utils/dateHelpers';
import LabelChip from './LabelChip';
import StatusBadge from './shared/StatusBadge';
import SubTaskProgressBar from './SubTaskProgressBar';

interface TaskWithColumn extends Task {
  columnId: string;
  columnTitle: string;
  status: string;
}

const TableView: React.FC = () => {
  const { state, moveTask, deleteTask, setTaskFilter, openTaskDetail } = useKanban();

  const currentBoard = state.currentBoard;

  const allTasks = useMemo(() => {
    if (!currentBoard) {return [];}
    
    return currentBoard.columns.flatMap(column => 
      column.tasks.map(task => ({
        ...task,
        columnId: column.id,
        columnTitle: column.title,
        status: column.title,
      } as TaskWithColumn))
    );
  }, [currentBoard]);

  const filteredAndSortedTasks = useMemo(() => {
    let tasks = filterTasks(allTasks, state.taskFilter);
    tasks = sortTasks(tasks, state.sortOption);
    return tasks;
  }, [allTasks, state.taskFilter, state.sortOption]);

  const handleTaskClick = useCallback((task: Task) => {
    openTaskDetail(task.id);
  }, [openTaskDetail]);

  const handleStatusChange = useCallback((task: TaskWithColumn, newColumnId: string) => {
    if (task.columnId === newColumnId) {return;}
    
    const targetColumn = currentBoard?.columns.find(col => col.id === newColumnId);
    if (targetColumn) {
      moveTask(task.id, task.columnId, newColumnId, targetColumn.tasks.length);
    }
  }, [currentBoard, moveTask]);

  const handleTaskComplete = useCallback((task: TaskWithColumn) => {
    if (!currentBoard) {return;}
    
    const rightmostColumn = currentBoard.columns[currentBoard.columns.length - 1];
    if (rightmostColumn && task.columnId !== rightmostColumn.id) {
      moveTask(task.id, task.columnId, rightmostColumn.id, rightmostColumn.tasks.length);
    }
  }, [currentBoard, moveTask]);

  const handleTaskDelete = useCallback((task: TaskWithColumn) => {
    deleteTask(task.id, task.columnId);
  }, [deleteTask]);

  const getCompletionRate = useCallback((task: Task): number => {
    if (!task.subTasks || task.subTasks.length === 0) {return 0;}
    const completed = task.subTasks.filter(sub => sub.completed).length;
    return Math.round((completed / task.subTasks.length) * 100);
  }, []);

  if (!currentBoard) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 120px)',
          color: 'fg.muted',
        }}
      >
        <Text>ボードを選択してください</Text>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 'calc(100vh - 120px)',
        overflow: 'auto',
        bg: 'canvas.subtle',
        p: '32px',
      }}
    >
      {/* テーブル */}
      <Box
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          bg: 'canvas.default',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        {/* ヘッダー行 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 150px 210px 180px 100px 100px 120px 120px 60px',
            bg: 'canvas.default',
            borderBottom: '2px solid',
            borderColor: 'border.default',
            py: 2,
            px: 3,
            gap: 2,
          }}
        >
          <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>タスク</Text>
          <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>ステータス</Text>
          <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>期限</Text>
          <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>ラベル</Text>
          <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>サブタスク</Text>
          <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>添付</Text>
          <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>進捗</Text>
          <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>作成日</Text>
          <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>操作</Text>
        </Box>

        {/* データ行 */}
        {filteredAndSortedTasks.map((task, index) => {
          const taskWithColumn = task as TaskWithColumn;
          const completionRate = getCompletionRate(task);
          
          return (
            <Box
              key={task.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 150px 210px 180px 100px 100px 120px 120px 60px',
                py: 3,
                px: 3,
                gap: 2,
                borderBottom: index < filteredAndSortedTasks.length - 1 ? '1px solid' : 'none',
                borderColor: 'border.default',
                cursor: 'pointer',
                '&:hover': {
                  bg: 'canvas.subtle',
                },
              }}
              onClick={() => handleTaskClick(task)}
            >
              {/* タスク名と説明 */}
              <Box>
                <Text
                  sx={{
                    fontWeight: 'semibold',
                    color: task.completedAt ? 'fg.muted' : 'fg.default',
                    textDecoration: task.completedAt ? 'line-through' : 'none',
                    fontSize: 1,
                  }}
                >
                  {task.title}
                </Text>
              </Box>
              
              {/* ステータス */}
              <Box>
                <StatusBadge variant="neutral">
                  {taskWithColumn.status}
                </StatusBadge>
              </Box>
              
              {/* 期限 */}
              <Box>
                {task.dueDate ? (
                  (() => {
                    const dueDate = new Date(task.dueDate);
                    const { isOverdue, isDueToday, isDueTomorrow } = getDateStatus(dueDate);
                    const formattedDate = formatDueDate(dueDate);
                    
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Text 
                          sx={{ 
                            fontSize: '12px',
                            color: isOverdue 
                              ? 'danger.emphasis' 
                              : isDueToday 
                              ? 'attention.emphasis'
                              : isDueTomorrow 
                              ? 'accent.emphasis' 
                              : 'fg.default'
                          }}
                        >
                          {formattedDate}
                        </Text>
                        {isOverdue && (
                          <StatusBadge variant="danger" size="small">
                            期限切れ
                          </StatusBadge>
                        )}
                        {isDueToday && (
                          <StatusBadge variant="warning" size="small">
                            本日期限
                          </StatusBadge>
                        )}
                        {isDueTomorrow && (
                          <StatusBadge variant="info" size="small">
                            明日期限
                          </StatusBadge>
                        )}
                      </Box>
                    );
                  })()
                ) : (
                  <Text sx={{ color: 'fg.muted', fontSize: '12px' }}>
                    期限なし
                  </Text>
                )}
              </Box>
              
              {/* ラベル */}
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
                      color: 'fg.muted',
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
              
              {/* サブタスク */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {task.subTasks && task.subTasks.length > 0 ? (
                  <>
                    <CheckIcon size={12} />
                    <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                      {task.subTasks.filter(sub => sub.completed).length}/{task.subTasks.length}
                    </Text>
                  </>
                ) : (
                  <Text sx={{ color: 'fg.muted', fontSize: 0 }}>
                    -
                  </Text>
                )}
              </Box>
              
              {/* 添付ファイル */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {task.files && task.files.length > 0 ? (
                  <>
                    <PaperclipIcon size={12} />
                    <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                      {task.files.length}
                    </Text>
                  </>
                ) : (
                  <Text sx={{ color: 'fg.muted', fontSize: 0 }}>
                    -
                  </Text>
                )}
              </Box>
              
              {/* 進捗 */}
              <Box>
                {task.subTasks && task.subTasks.length > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SubTaskProgressBar
                      completedCount={task.subTasks.filter(sub => sub.completed).length}
                      totalCount={task.subTasks.length}
                    />
                    <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                      {completionRate}%
                    </Text>
                  </Box>
                ) : (
                  <Text sx={{ color: 'fg.muted', fontSize: 0 }}>
                    -
                  </Text>
                )}
              </Box>
              
              {/* 作成日 */}
              <Box>
                <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                  {formatDate(task.createdAt, 'MM/dd')}
                </Text>
              </Box>
              
              {/* 操作 */}
              <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <ActionMenu>
                  <ActionMenu.Anchor>
                    <IconButton
                      aria-label="タスクの操作"
                      icon={KebabHorizontalIcon}
                      variant="invisible"
                      size="small"
                    />
                  </ActionMenu.Anchor>
                  <ActionMenu.Overlay>
                    <ActionList>
                      <ActionList.Group title="ステータス変更">
                        {currentBoard.columns.map((column) => (
                          <ActionList.Item
                            key={column.id}
                            onSelect={() => handleStatusChange(taskWithColumn, column.id)}
                            disabled={taskWithColumn.columnId === column.id}
                          >
                            {column.title}に移動
                          </ActionList.Item>
                        ))}
                      </ActionList.Group>
                      <ActionList.Divider />
                      <ActionList.Item
                        onSelect={() => handleTaskComplete(taskWithColumn)}
                        disabled={taskWithColumn.columnId === currentBoard.columns[currentBoard.columns.length - 1]?.id}
                      >
                        完了にする
                      </ActionList.Item>
                      <ActionList.Divider />
                      <ActionList.Item
                        onSelect={() => handleTaskDelete(taskWithColumn)}
                        variant="danger"
                      >
                        削除
                      </ActionList.Item>
                    </ActionList>
                  </ActionMenu.Overlay>
                </ActionMenu>
              </Box>
            </Box>
          );
        })}
      </Box>
      
      {/* 空状態 */}
      {filteredAndSortedTasks.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            color: 'fg.muted',
          }}
        >
          <Text sx={{ fontSize: 1, mb: 2 }}>
            {state.taskFilter.type === 'all' 
              ? 'タスクがありません' 
              : 'フィルタ条件に一致するタスクがありません'
            }
          </Text>
          {state.taskFilter.type !== 'all' && (
            <Button
              variant="invisible"
              size="small"
              onClick={() => setTaskFilter({ type: 'all', label: 'すべてのタスク' })}
            >
              フィルタをクリア
            </Button>
          )}
        </Box>
      )}

    </Box>
  );
};

export default TableView;