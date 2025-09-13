import React, { useMemo, useCallback } from 'react';
import { Text, Box, IconButton, ActionMenu, ActionList, Button } from '@primer/react';
import { KebabHorizontalIcon, CheckIcon, PaperclipIcon, TriangleDownIcon } from '@primer/octicons-react';

import { useKanban } from '../contexts/KanbanContext';
import { useTableColumns } from '../contexts/TableColumnsContext';
import type { Task } from '../types';
import type { TaskWithColumn, TableColumn } from '../types/table';
import { sortTasks } from '../utils/taskSort';
import { filterTasks } from '../utils/taskFilter';
import { formatDate, getDateStatus, formatDueDateWithYear } from '../utils/dateHelpers';
import LabelChip from './LabelChip';
import StatusBadge from './shared/StatusBadge';
import SubTaskProgressBar from './SubTaskProgressBar';
import TableColumnManager from './TableColumnManager';

const TableView: React.FC = () => {
  const { state, moveTask, deleteTask, setTaskFilter, openTaskDetail } = useKanban();
  const tableColumnsData = useTableColumns();


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

  const renderCell = useCallback((task: TaskWithColumn, columnId: string) => {
    switch (columnId) {
      case 'actions':
        return (
          <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ActionMenu>
              <ActionMenu.Anchor>
                <IconButton
                  aria-label="タスクを削除"
                  icon={KebabHorizontalIcon}
                  variant="invisible"
                  size="small"
                />
              </ActionMenu.Anchor>
              <ActionMenu.Overlay>
                <ActionList>
                  <ActionList.Item
                    onSelect={() => handleTaskDelete(task)}
                    variant="danger"
                  >
                    削除
                  </ActionList.Item>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </Box>
        );

      case 'title':
        return (
          <Box>
            <Text
              sx={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 'semibold',
                color: task.completedAt ? 'fg.muted' : 'fg.default',
                textDecoration: task.completedAt ? 'line-through' : 'none',
                fontSize: 1,
              }}
            >
              {task.title}
            </Text>
          </Box>
        );

      case 'status':
        return (
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
                  <StatusBadge variant="neutral">
                    {task.status}
                  </StatusBadge>
                </Button>
              </ActionMenu.Anchor>
              <ActionMenu.Overlay>
                <ActionList selectionVariant="single">
                  <ActionList.Group title="ステータス変更" selectionVariant="single">
                    {currentBoard?.columns.map((column) => (
                      <ActionList.Item
                        key={column.id}
                        onSelect={() => handleStatusChange(task, column.id)}
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

      case 'dueDate':
        return (
          <Box>
            {task.dueDate ? (
              (() => {
                const dueDate = new Date(task.dueDate);
                const { isOverdue, isDueToday, isDueTomorrow } = getDateStatus(dueDate);
                const formattedDate = formatDueDateWithYear(dueDate);

                return (
                  <Text
                    sx={{
                      fontSize: 0,
                      color: isOverdue
                        ? 'danger.emphasis'
                        : isDueToday
                        ? 'attention.emphasis'
                        : isDueTomorrow
                        ? 'accent.emphasis'
                        : 'fg.muted'
                    }}
                  >
                    {formattedDate}
                  </Text>
                );
              })()
            ) : (
              <Text sx={{ color: 'fg.muted', fontSize: 0 }}>
                -
              </Text>
            )}
          </Box>
        );

      case 'labels':
        return (
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
        );

      case 'subTasks':
        return (
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
        );

      case 'files':
        return (
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
        );

      case 'progress':
        return (
          <Box>
            {task.subTasks && task.subTasks.length > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SubTaskProgressBar
                  completedCount={task.subTasks.filter(sub => sub.completed).length}
                  totalCount={task.subTasks.length}
                />
                <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                  {getCompletionRate(task)}%
                </Text>
              </Box>
            ) : (
              <Text sx={{ color: 'fg.muted', fontSize: 0 }}>
                -
              </Text>
            )}
          </Box>
        );

      case 'createdAt':
        return (
          <Box>
            <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
              {formatDate(task.createdAt, 'MM/dd HH:mm')}
            </Text>
          </Box>
        );

      case 'updatedAt':
        return (
          <Box>
            <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
              {formatDate(task.updatedAt, 'MM/dd HH:mm')}
            </Text>
          </Box>
        );

      case 'completedAt':
        return (
          <Box>
            {task.completedAt ? (
              <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                {formatDate(task.completedAt, 'MM/dd HH:mm')}
              </Text>
            ) : (
              <Text sx={{ color: 'fg.muted', fontSize: 0 }}>
                -
              </Text>
            )}
          </Box>
        );

      case 'description':
        return (
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
                title={task.description}
              >
                {task.description}
              </Text>
            ) : (
              <Text sx={{ color: 'fg.muted', fontSize: 0 }}>
                -
              </Text>
            )}
          </Box>
        );

      default:
        return (
          <Box>
            <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
              -
            </Text>
          </Box>
        );
    }
  }, [currentBoard, handleStatusChange, handleTaskComplete, handleTaskDelete, getCompletionRate]);

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
      key={`tableview-${tableColumnsData.forceRender}`}
      sx={{
        height: 'calc(100vh - 120px)',
        overflow: 'auto',
        bg: 'canvas.subtle',
        p: '32px',
      }}
    >
      {/* テーブル */}
      <Box
        key={`table-${tableColumnsData.forceRender}`}
        sx={{
          borderRadius: 2,
          overflow: 'auto',
          bg: 'canvas.default',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          minWidth: 'fit-content',
        }}
      >
        {/* ヘッダー行 */}
        <Box
          style={{ gridTemplateColumns: tableColumnsData.gridTemplateColumns }}
          sx={{
            display: 'grid',
            bg: 'canvas.default',
            borderBottom: '2px solid',
            borderColor: 'border.default',
            py: 2,
            px: 3,
            gap: 2,
            minWidth: 'fit-content',
            position: 'relative',
          }}
        >
          {tableColumnsData.visibleColumns.map((column: TableColumn) => (
            <Box key={column.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>
                {column.label}
              </Text>
            </Box>
          ))}
          {/* 設定ボタンを固定位置に配置 */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: 3,
              transform: 'translateY(-50%)',
            }}
          >
            <TableColumnManager />
          </Box>
        </Box>

        {/* データ行 */}
        {filteredAndSortedTasks.map((task, index) => {
          const taskWithColumn = task as TaskWithColumn;
          
          return (
            <Box
              key={task.id}
              style={{ gridTemplateColumns: tableColumnsData.gridTemplateColumns }}
              sx={{
                display: 'grid',
                py: 2,
                px: 3,
                gap: 2,
                alignItems: 'center',
                borderBottom: index < filteredAndSortedTasks.length - 1 ? '1px solid' : 'none',
                borderColor: 'border.default',
                cursor: 'pointer',
                minWidth: 'fit-content',
                '&:hover': {
                  bg: 'canvas.subtle',
                },
              }}
              onClick={() => handleTaskClick(task)}
            >
              {tableColumnsData.visibleColumns.map((column: TableColumn) => (
                <Box key={column.id}>
                  {renderCell(taskWithColumn, column.id)}
                </Box>
              ))}
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