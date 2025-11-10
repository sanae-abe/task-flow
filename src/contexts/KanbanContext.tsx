import React, { createContext, useContext, useMemo } from 'react';

import { useBoard } from './BoardContext';
import { useTask } from './TaskContext';
import { useLabel } from './LabelContext';
import { useUI } from './UIContext';
import type {
  KanbanBoard,
  Task,
  Column,
  Label,
  FileAttachment,
  RecurrenceConfig,
  ViewMode,
  SortOption,
  TaskFilter,
  Priority,
} from '../types';

// Task操作用のアクション型定義
type TaskAction =
  | {
      type: 'ADD_TASK';
      payload: { boardId: string; columnId: string; task: Task };
    }
  | { type: 'UPDATE_TASK'; payload: { taskId: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: { taskId: string } };

// KanbanContextのレガシー互換性を保つためのブリッジ
interface KanbanContextType {
  state: {
    boards: KanbanBoard[];
    currentBoard: KanbanBoard | null;
    labels: Label[];
    isLoading: boolean;
    viewMode: ViewMode;
    taskFilter: TaskFilter;
    sortOption: SortOption;
    isTaskDetailOpen: boolean;
    selectedTaskId: string | null;
    isTaskFormOpen: boolean;
    taskFormDefaultDate: Date | null;
    taskFormDefaultStatus?: string;
  };
  // GraphQL統合用のdispatchメソッド（BoardContext互換）
  dispatch: (action: TaskAction) => void;
  // Board関連のメソッド
  createBoard: (title: string) => void;
  updateBoard: (boardId: string, updates: Partial<KanbanBoard>) => void;
  deleteBoard: (boardId: string) => void;
  setCurrentBoard: (boardId: string) => void;
  importBoards: (boards: KanbanBoard[], replaceAll?: boolean) => void;
  // Task関連のメソッド
  createTask: (
    columnId: string,
    title: string,
    description: string,
    dueDate?: Date,
    labels?: Label[],
    attachments?: FileAttachment[],
    recurrence?: RecurrenceConfig,
    priority?: Priority
  ) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string, columnId: string) => void;
  duplicateTask: (taskId: string) => void;
  moveTask: (
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    targetIndex: number
  ) => void;
  clearCompletedTasks: () => void;
  addSubTask: (taskId: string, title: string) => void;
  toggleSubTask: (taskId: string, subTaskId: string) => void;
  updateSubTask: (taskId: string, subTaskId: string, title: string) => void;
  deleteSubTask: (taskId: string, subTaskId: string) => void;
  reorderSubTasks: (taskId: string, oldIndex: number, newIndex: number) => void;
  // Column関連のメソッド
  createColumn: (title: string, insertIndex?: number) => void;
  updateColumn: (columnId: string, updates: Partial<Column>) => void;
  deleteColumn: (columnId: string) => void;
  // Label関連のメソッド
  createLabel: (label: Omit<Label, 'id'>) => void;
  updateLabel: (labelId: string, updates: Partial<Label>) => void;
  deleteLabel: (labelId: string) => void;
  getAllLabels: () => Label[];
  // UI関連のメソッド
  setViewMode: (mode: ViewMode) => void;
  setSortOption: (option: SortOption) => void;
  setTaskFilter: (filter: TaskFilter) => void;
  openTaskDetail: (taskId: string) => void;
  closeTaskDetail: () => void;
  openTaskForm: (defaultDate?: Date) => void;
  closeTaskForm: () => void;
}

const KanbanContext = createContext<KanbanContextType | null>(null);

interface KanbanProviderProps {
  children: React.ReactNode;
}

export const KanbanProvider: React.FC<KanbanProviderProps> = ({ children }) => {
  const board = useBoard();
  const task = useTask();
  const label = useLabel();
  const ui = useUI();

  /**
   * GraphQL統合用のdispatchメソッド
   * BoardContext/TaskContextの既存メソッドにアクションをブリッジ
   */
  const dispatch = React.useCallback(
    (action: TaskAction) => {
      switch (action.type) {
        case 'ADD_TASK': {
          const { boardId, columnId, task: newTask } = action.payload;
          // BoardContextのupdateBoardを使ってタスクを追加
          const targetBoard = board.state.boards.find(b => b.id === boardId);
          if (targetBoard) {
            const updatedColumns = targetBoard.columns.map(col =>
              col.id === columnId
                ? { ...col, tasks: [...col.tasks, newTask] }
                : col
            );
            board.updateBoard(boardId, { columns: updatedColumns });
          }
          break;
        }
        case 'UPDATE_TASK': {
          const { taskId, updates } = action.payload;
          task.updateTask(taskId, updates);
          break;
        }
        case 'DELETE_TASK': {
          const { taskId } = action.payload;
          const columnId = task.findTaskColumnId(taskId);
          if (columnId) {
            task.deleteTask(taskId, columnId);
          }
          break;
        }
      }
    },
    [board, task]
  );

  const value = useMemo<KanbanContextType>(
    () => ({
      state: {
        boards: board.state.boards,
        currentBoard: board.currentBoard,
        labels: label.labels,
        isLoading: false,
        viewMode: ui.state.viewMode || 'kanban',
        taskFilter: ui.taskFilter,
        sortOption: ui.sortOption,
        isTaskDetailOpen: ui.state.isTaskDetailOpen || false,
        selectedTaskId: ui.state.selectedTaskId || null,
        isTaskFormOpen: ui.state.isTaskFormOpen || false,
        taskFormDefaultDate: ui.state.taskFormDefaultDate || null,
        taskFormDefaultStatus: ui.state.taskFormDefaultStatus,
      },
      // GraphQL統合用のdispatchメソッド（BoardContext互換）
      dispatch,
      // Board関連のメソッド
      createBoard: board.createBoard,
      updateBoard: board.updateBoard,
      deleteBoard: board.deleteBoard,
      setCurrentBoard: board.setCurrentBoard,
      importBoards: board.importBoards,
      // Task関連のメソッド
      createTask: task.createTask,
      updateTask: task.updateTask,
      deleteTask: task.deleteTask,
      duplicateTask: task.duplicateTask,
      moveTask: task.moveTask,
      clearCompletedTasks: task.clearCompletedTasks,
      addSubTask: task.addSubTask,
      toggleSubTask: task.toggleSubTask,
      updateSubTask: task.updateSubTask,
      deleteSubTask: task.deleteSubTask,
      reorderSubTasks: task.reorderSubTasks,
      // Column関連のメソッド
      createColumn: board.createColumn,
      updateColumn: board.updateColumn,
      deleteColumn: board.deleteColumn,
      // Label関連のメソッド
      createLabel: (labelData: Omit<Label, 'id'>) =>
        label.createLabel(labelData.name, labelData.color),
      updateLabel: label.updateLabel,
      deleteLabel: label.deleteLabel,
      getAllLabels: label.getAllLabels,
      // UI関連のメソッド
      setViewMode: ui.setViewMode,
      setSortOption: ui.setSortOption,
      setTaskFilter: ui.setTaskFilter,
      openTaskDetail: ui.openTaskDetail,
      closeTaskDetail: ui.closeTaskDetail,
      openTaskForm: ui.openTaskForm,
      closeTaskForm: ui.closeTaskForm,
    }),
    [board, task, label, ui, dispatch]
  );

  return (
    <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>
  );
};

export const useKanban = (): KanbanContextType => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return context;
};

export default KanbanProvider;
