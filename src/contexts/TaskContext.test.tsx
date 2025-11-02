/**
 * TaskContext comprehensive tests
 * タスクコンテキストの包括的テスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TaskProvider, useTask } from './TaskContext';
import { BoardProvider, useBoard } from './BoardContext';
import type {
  Task,
  SubTask,
  Label,
  FileAttachment,
  Priority,
  RecurrenceConfig,
} from '../types';

// Mock external dependencies
vi.mock('../utils/storage', () => ({
  saveBoards: vi.fn(),
  loadBoards: vi.fn(() => []),
  protectDemoBoard: vi.fn(board => board),
}));

vi.mock('../utils/settingsStorage', () => ({
  loadSettings: vi.fn(() => ({
    defaultColumns: [
      { name: 'Todo' },
      { name: 'In Progress' },
      { name: 'Done' },
    ],
  })),
}));

vi.mock('../hooks/useSonnerNotify', () => ({
  useSonnerNotify: vi.fn(() => ({
    success: vi.fn(),
    _error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    toast: {
      success: vi.fn(),
      _error: vi.fn(),
      loading: vi.fn(),
    },
    persistent: {
      success: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
      _error: vi.fn(),
    },
  })),
}));

vi.mock('../utils/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('../utils/recycleBin', () => ({
  moveBoardToRecycleBin: vi.fn(),
  restoreBoardFromRecycleBin: vi.fn(),
  moveColumnToRecycleBin: vi.fn(),
  restoreColumnFromRecycleBin: vi.fn(),
  permanentlyDeleteColumn: vi.fn(),
}));

// Mock UUID
vi.mock('uuid', () => ({
  v4: () => `test-task-${Math.random().toString(36).substr(2, 9)}`,
}));

// Test component to access TaskContext
const TestTaskComponent = () => {
  const boardContext = useBoard();
  const taskContext = useTask();

  const currentBoard = boardContext.currentBoard;
  const firstColumn = currentBoard?.columns[0];
  const firstTask = firstColumn?.tasks.find(t => t.deletionState !== 'deleted');

  return (
    <div>
      <div data-testid='current-board-id'>{currentBoard?.id || 'none'}</div>
      <div data-testid='first-column-id'>{firstColumn?.id || 'none'}</div>
      <div data-testid='first-column-tasks-count'>
        {firstColumn?.tasks.filter(t => t.deletionState !== 'deleted').length ||
          0}
      </div>
      <div data-testid='first-task-id'>{firstTask?.id || 'none'}</div>
      <div data-testid='first-task-title'>{firstTask?.title || 'none'}</div>

      <button
        data-testid='create-task'
        onClick={() => {
          if (firstColumn) {
            taskContext.createTask(
              firstColumn.id,
              'Test Task',
              'Test Description'
            );
          }
        }}
      >
        Create Task
      </button>

      <button
        data-testid='update-task'
        onClick={() => {
          if (firstTask) {
            taskContext.updateTask(firstTask.id, { title: 'Updated Task' });
          }
        }}
      >
        Update Task
      </button>

      <button
        data-testid='delete-task'
        onClick={() => {
          if (firstTask && firstColumn) {
            taskContext.deleteTask(firstTask.id, firstColumn.id);
          }
        }}
      >
        Delete Task
      </button>

      <button
        data-testid='duplicate-task'
        onClick={() => {
          if (firstTask) {
            taskContext.duplicateTask(firstTask.id);
          }
        }}
      >
        Duplicate Task
      </button>

      <button
        data-testid='add-subtask'
        onClick={() => {
          if (firstTask) {
            taskContext.addSubTask(firstTask.id, 'Test SubTask');
          }
        }}
      >
        Add SubTask
      </button>

      {firstTask && (
        <div>
          <div data-testid='first-task-subtasks-count'>
            {firstTask.subTasks?.length || 0}
          </div>
          <div data-testid='first-task-priority'>
            {firstTask.priority || 'none'}
          </div>
          <div data-testid='first-task-completed'>
            {firstTask.completedAt ? 'true' : 'false'}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions to create mock data
const createMockTask = (id = 'task-1', title = 'Test Task'): Task => ({
  id,
  title,
  description: 'Test Description',
  status: 'todo',
  priority: 'medium',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  labels: [],
  subTasks: [],
});

const createMockSubTask = (
  id = 'subtask-1',
  title = 'Test SubTask'
): SubTask => ({
  id,
  title,
  completed: false,
});

const createMockLabel = (id = 'label-1', name = 'Test Label'): Label => ({
  id,
  name,
  color: '#ef4444',
  createdAt: new Date().toISOString(),
});

const createMockBoard = () => ({
  id: 'board-1',
  title: 'Test Board',
  columns: [
    {
      id: 'col-1',
      title: 'Todo',
      tasks: [],
      color: '#6b7280',
    },
    {
      id: 'col-2',
      title: 'In Progress',
      tasks: [],
      color: '#3b82f6',
    },
    {
      id: 'col-3',
      title: 'Done',
      tasks: [],
      color: '#10b981',
    },
  ],
  labels: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('TaskContext', () => {
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(key => mockLocalStorage[key] || null),
        setItem: vi.fn((key, value) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn(key => {
          delete mockLocalStorage[key];
        }),
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockLocalStorage = {};
  });

  describe('Provider initialization', () => {
    it('should provide TaskContext within BoardProvider', async () => {
      const initialBoard = createMockBoard();
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestTaskComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-board-id')).toHaveTextContent(
          'board-1'
        );
        expect(screen.getByTestId('first-column-id')).toHaveTextContent(
          'col-1'
        );
      });
    });

    it('should throw error when useTask is used outside provider', () => {
      const TestTaskOnlyComponent = () => {
        const taskContext = useTask();
        return <div>{taskContext ? 'loaded' : 'none'}</div>;
      };

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<TestTaskOnlyComponent />);
      }).toThrow('useTask must be used within a TaskProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Task CRUD operations', () => {
    it('should create a new task', async () => {
      const initialBoard = createMockBoard();
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestTaskComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByTestId('first-column-tasks-count')
        ).toHaveTextContent('0');
      });

      await act(async () => {
        screen.getByTestId('create-task').click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('first-column-tasks-count')
        ).toHaveTextContent('1');
        expect(screen.getByTestId('first-task-title')).toHaveTextContent(
          'Test Task'
        );
      });
    });

    it('should update task properties', async () => {
      const initialBoard = createMockBoard();
      initialBoard.columns[0].tasks = [createMockTask()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestTaskComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('first-task-title')).toHaveTextContent(
          'Test Task'
        );
      });

      await act(async () => {
        screen.getByTestId('update-task').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('first-task-title')).toHaveTextContent(
          'Updated Task'
        );
      });
    });

    it('should delete a task', async () => {
      const initialBoard = createMockBoard();
      initialBoard.columns[0].tasks = [createMockTask()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestTaskComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByTestId('first-column-tasks-count')
        ).toHaveTextContent('1');
      });

      await act(async () => {
        screen.getByTestId('delete-task').click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('first-column-tasks-count')
        ).toHaveTextContent('0');
        expect(screen.getByTestId('first-task-id')).toHaveTextContent('none');
      });
    });

    it('should duplicate a task', async () => {
      const initialBoard = createMockBoard();
      initialBoard.columns[0].tasks = [createMockTask()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestTaskComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByTestId('first-column-tasks-count')
        ).toHaveTextContent('1');
      });

      await act(async () => {
        screen.getByTestId('duplicate-task').click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('first-column-tasks-count')
        ).toHaveTextContent('2');
      });
    });
  });

  describe('Task movement', () => {
    it('should move task between columns', async () => {
      const TestMoveTaskComponent = () => {
        const boardContext = useBoard();
        const taskContext = useTask();

        const currentBoard = boardContext.currentBoard;
        const sourceColumn = currentBoard?.columns[0];
        const targetColumn = currentBoard?.columns[1];
        const sourceTask = sourceColumn?.tasks[0];

        return (
          <div>
            <div data-testid='source-tasks-count'>
              {sourceColumn?.tasks.length || 0}
            </div>
            <div data-testid='target-tasks-count'>
              {targetColumn?.tasks.length || 0}
            </div>
            <button
              data-testid='move-task'
              onClick={() => {
                if (sourceTask && sourceColumn && targetColumn) {
                  taskContext.moveTask(
                    sourceTask.id,
                    sourceColumn.id,
                    targetColumn.id,
                    0
                  );
                }
              }}
            >
              Move Task
            </button>
          </div>
        );
      };

      const initialBoard = createMockBoard();
      initialBoard.columns[0].tasks = [createMockTask()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestMoveTaskComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('source-tasks-count')).toHaveTextContent('1');
        expect(screen.getByTestId('target-tasks-count')).toHaveTextContent('0');
      });

      await act(async () => {
        screen.getByTestId('move-task').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('source-tasks-count')).toHaveTextContent('0');
        expect(screen.getByTestId('target-tasks-count')).toHaveTextContent('1');
      });
    });
  });

  describe('SubTask management', () => {
    it('should add a subtask to a task', async () => {
      const initialBoard = createMockBoard();
      initialBoard.columns[0].tasks = [createMockTask()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestTaskComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByTestId('first-task-subtasks-count')
        ).toHaveTextContent('0');
      });

      await act(async () => {
        screen.getByTestId('add-subtask').click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('first-task-subtasks-count')
        ).toHaveTextContent('1');
      });
    });

    it('should toggle subtask completion', async () => {
      const TestSubTaskToggleComponent = () => {
        const boardContext = useBoard();
        const taskContext = useTask();

        const currentBoard = boardContext.currentBoard;
        const firstTask = currentBoard?.columns[0]?.tasks[0];
        const firstSubTask = firstTask?.subTasks?.[0];

        return (
          <div>
            <div data-testid='subtask-completed'>
              {firstSubTask?.completed ? 'true' : 'false'}
            </div>
            <button
              data-testid='toggle-subtask'
              onClick={() => {
                if (firstTask && firstSubTask) {
                  taskContext.toggleSubTask(firstTask.id, firstSubTask.id);
                }
              }}
            >
              Toggle SubTask
            </button>
          </div>
        );
      };

      const initialBoard = createMockBoard();
      const taskWithSubTask = createMockTask();
      taskWithSubTask.subTasks = [createMockSubTask()];
      initialBoard.columns[0].tasks = [taskWithSubTask];

      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestSubTaskToggleComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('subtask-completed')).toHaveTextContent(
          'false'
        );
      });

      await act(async () => {
        screen.getByTestId('toggle-subtask').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('subtask-completed')).toHaveTextContent(
          'true'
        );
      });
    });

    it('should reorder subtasks', async () => {
      const TestSubTaskReorderComponent = () => {
        const boardContext = useBoard();
        const taskContext = useTask();

        const currentBoard = boardContext.currentBoard;
        const firstTask = currentBoard?.columns[0]?.tasks[0];
        const subTasks = firstTask?.subTasks || [];

        return (
          <div>
            <div data-testid='first-subtask-title'>
              {subTasks[0]?.title || 'none'}
            </div>
            <div data-testid='second-subtask-title'>
              {subTasks[1]?.title || 'none'}
            </div>
            <button
              data-testid='reorder-subtasks'
              onClick={() => {
                if (firstTask && subTasks.length >= 2) {
                  taskContext.reorderSubTasks(firstTask.id, 0, 1);
                }
              }}
            >
              Reorder SubTasks
            </button>
          </div>
        );
      };

      const initialBoard = createMockBoard();
      const taskWithSubTasks = createMockTask();
      taskWithSubTasks.subTasks = [
        createMockSubTask('sub-1', 'First SubTask'),
        createMockSubTask('sub-2', 'Second SubTask'),
      ];
      initialBoard.columns[0].tasks = [taskWithSubTasks];

      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestSubTaskReorderComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('first-subtask-title')).toHaveTextContent(
          'First SubTask'
        );
        expect(screen.getByTestId('second-subtask-title')).toHaveTextContent(
          'Second SubTask'
        );
      });

      await act(async () => {
        screen.getByTestId('reorder-subtasks').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('first-subtask-title')).toHaveTextContent(
          'Second SubTask'
        );
        expect(screen.getByTestId('second-subtask-title')).toHaveTextContent(
          'First SubTask'
        );
      });
    });
  });

  describe('Task creation with various properties', () => {
    it('should create task with due date and priority', async () => {
      const TestCreateWithPropsComponent = () => {
        const boardContext = useBoard();
        const taskContext = useTask();

        const currentBoard = boardContext.currentBoard;
        const firstColumn = currentBoard?.columns[0];
        const createdTask = firstColumn?.tasks[0];

        return (
          <div>
            <div data-testid='task-due-date'>
              {createdTask?.dueDate || 'none'}
            </div>
            <div data-testid='task-priority'>
              {createdTask?.priority || 'none'}
            </div>
            <div data-testid='tasks-count'>
              {firstColumn?.tasks.length || 0}
            </div>
            <button
              data-testid='create-task-with-props'
              onClick={() => {
                if (firstColumn) {
                  const dueDate = new Date('2025-12-31');
                  taskContext.createTask(
                    firstColumn.id,
                    'Priority Task',
                    'High priority task',
                    dueDate,
                    [],
                    [],
                    undefined,
                    'high'
                  );
                }
              }}
            >
              Create Task with Props
            </button>
          </div>
        );
      };

      const initialBoard = createMockBoard();
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestCreateWithPropsComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('0');
      });

      await act(async () => {
        screen.getByTestId('create-task-with-props').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
        expect(screen.getByTestId('task-priority')).toHaveTextContent('high');
        expect(screen.getByTestId('task-due-date')).toHaveTextContent(
          '2025-12-31T00:00:00.000Z'
        );
      });
    });

    it('should create task with labels', async () => {
      const TestCreateWithLabelsComponent = () => {
        const boardContext = useBoard();
        const taskContext = useTask();

        const currentBoard = boardContext.currentBoard;
        const firstColumn = currentBoard?.columns[0];
        const createdTask = firstColumn?.tasks[0];

        return (
          <div>
            <div data-testid='task-labels-count'>
              {createdTask?.labels.length || 0}
            </div>
            <div data-testid='tasks-count'>
              {firstColumn?.tasks.length || 0}
            </div>
            <button
              data-testid='create-task-with-labels'
              onClick={() => {
                if (firstColumn) {
                  const labels = [createMockLabel('label-1', 'Important')];
                  taskContext.createTask(
                    firstColumn.id,
                    'Labeled Task',
                    'Task with labels',
                    undefined,
                    labels
                  );
                }
              }}
            >
              Create Task with Labels
            </button>
          </div>
        );
      };

      const initialBoard = createMockBoard();
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestCreateWithLabelsComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('0');
      });

      await act(async () => {
        screen.getByTestId('create-task-with-labels').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('tasks-count')).toHaveTextContent('1');
        expect(screen.getByTestId('task-labels-count')).toHaveTextContent('1');
      });
    });
  });

  describe('Utility functions', () => {
    it('should find task by ID', async () => {
      const TestFindTaskComponent = () => {
        const taskContext = useTask();
        const foundTask = taskContext.findTaskById('task-1');

        return (
          <div>
            <div data-testid='found-task-title'>
              {foundTask?.title || 'none'}
            </div>
            <div data-testid='found-task-id'>{foundTask?.id || 'none'}</div>
          </div>
        );
      };

      const initialBoard = createMockBoard();
      initialBoard.columns[0].tasks = [
        createMockTask('task-1', 'Findable Task'),
      ];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestFindTaskComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('found-task-title')).toHaveTextContent(
          'Findable Task'
        );
        expect(screen.getByTestId('found-task-id')).toHaveTextContent('task-1');
      });
    });

    it('should find task column ID', async () => {
      const TestFindColumnComponent = () => {
        const taskContext = useTask();
        const columnId = taskContext.findTaskColumnId('task-1');

        return (
          <div>
            <div data-testid='task-column-id'>{columnId || 'none'}</div>
          </div>
        );
      };

      const initialBoard = createMockBoard();
      initialBoard.columns[1].tasks = [createMockTask('task-1')]; // Put in second column
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestFindColumnComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('task-column-id')).toHaveTextContent('col-2');
      });
    });
  });

  describe('Clear completed tasks', () => {
    it('should clear all completed tasks', async () => {
      const TestClearCompletedComponent = () => {
        const boardContext = useBoard();
        const taskContext = useTask();

        const currentBoard = boardContext.currentBoard;
        const lastColumn =
          currentBoard?.columns[currentBoard.columns.length - 1];

        return (
          <div>
            <div data-testid='column-tasks-count'>
              {lastColumn?.tasks.filter(t => t.deletionState !== 'deleted')
                .length || 0}
            </div>
            <button
              data-testid='clear-completed'
              onClick={() => taskContext.clearCompletedTasks()}
            >
              Clear Completed
            </button>
          </div>
        );
      };

      const initialBoard = createMockBoard();
      const completedTask = createMockTask('task-1', 'Completed Task');
      completedTask.completedAt = new Date().toISOString();
      const activeTask = createMockTask('task-2', 'Active Task');

      initialBoard.columns[2].tasks = [completedTask, activeTask]; // Put in last column (Done)
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestClearCompletedComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('column-tasks-count')).toHaveTextContent('2');
      });

      await act(async () => {
        screen.getByTestId('clear-completed').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('column-tasks-count')).toHaveTextContent('0');
      });
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle operations with non-existent tasks gracefully', async () => {
      const TestErrorHandlingComponent = () => {
        const taskContext = useTask();

        return (
          <div>
            <div data-testid='error-test'>ready</div>
            <button
              data-testid='update-nonexistent-task'
              onClick={() => {
                taskContext.updateTask('nonexistent-id', { title: 'Updated' });
              }}
            >
              Update Nonexistent Task
            </button>
            <button
              data-testid='delete-nonexistent-task'
              onClick={() => {
                taskContext.deleteTask('nonexistent-id', 'col-1');
              }}
            >
              Delete Nonexistent Task
            </button>
            <button
              data-testid='add-subtask-to-nonexistent'
              onClick={() => {
                taskContext.addSubTask('nonexistent-id', 'SubTask');
              }}
            >
              Add SubTask to Nonexistent
            </button>
          </div>
        );
      };

      const initialBoard = createMockBoard();
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestErrorHandlingComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error-test')).toHaveTextContent('ready');
      });

      // Should not crash when operating on non-existent tasks
      await act(async () => {
        screen.getByTestId('update-nonexistent-task').click();
        screen.getByTestId('delete-nonexistent-task').click();
        screen.getByTestId('add-subtask-to-nonexistent').click();
      });

      // Should still be responsive
      await waitFor(() => {
        expect(screen.getByTestId('error-test')).toHaveTextContent('ready');
      });
    });

    it('should handle null/undefined inputs gracefully', async () => {
      const TestNullInputsComponent = () => {
        const taskContext = useTask();
        const foundTask = taskContext.findTaskById('');
        const foundColumn = taskContext.findTaskColumnId('');

        return (
          <div>
            <div data-testid='null-task-result'>
              {foundTask ? 'found' : 'null'}
            </div>
            <div data-testid='null-column-result'>{foundColumn || 'null'}</div>
          </div>
        );
      };

      const initialBoard = createMockBoard();
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TaskProvider>
            <TestNullInputsComponent />
          </TaskProvider>
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('null-task-result')).toHaveTextContent(
          'null'
        );
        expect(screen.getByTestId('null-column-result')).toHaveTextContent(
          'null'
        );
      });
    });
  });
});
