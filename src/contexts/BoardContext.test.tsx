/**
 * BoardContext comprehensive tests
 * ボードコンテキストの包括的テスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BoardProvider, useBoard } from './BoardContext';
import type { KanbanBoard, Column, Task, Label } from '../types';

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

vi.mock('../utils/recycleBin', () => ({
  moveBoardToRecycleBin: vi.fn((boards, boardId) =>
    boards.map(board =>
      board.id === boardId
        ? {
            ...board,
            deletionState: 'deleted',
            deletedAt: new Date().toISOString(),
          }
        : board
    )
  ),
  restoreBoardFromRecycleBin: vi.fn((boards, boardId) =>
    boards.map(board =>
      board.id === boardId
        ? { ...board, deletionState: undefined, deletedAt: undefined }
        : board
    )
  ),
  moveColumnToRecycleBin: vi.fn((boards, columnId) =>
    boards.map(board => ({
      ...board,
      columns: board.columns.map(col =>
        col.id === columnId
          ? {
              ...col,
              deletionState: 'deleted',
              deletedAt: new Date().toISOString(),
            }
          : col
      ),
    }))
  ),
  restoreColumnFromRecycleBin: vi.fn((boards, columnId) =>
    boards.map(board => ({
      ...board,
      columns: board.columns.map(col =>
        col.id === columnId
          ? { ...col, deletionState: undefined, deletedAt: undefined }
          : col
      ),
    }))
  ),
  permanentlyDeleteColumn: vi.fn((boards, columnId) => ({
    updatedBoards: boards.map(board => ({
      ...board,
      columns: board.columns.filter(col => col.id !== columnId),
    })),
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
  },
}));

// Mock UUID
vi.mock('uuid', () => ({
  v4: () => `test-uuid-${Math.random().toString(36).substr(2, 9)}`,
}));

// Test component to access context
const TestComponent = () => {
  const context = useBoard();
  return (
    <div>
      <div data-testid='boards-count'>{context.state.boards.length}</div>
      <div data-testid='current-board-id'>
        {context.currentBoard?.id || 'none'}
      </div>
      <button
        data-testid='create-board'
        onClick={() => context.createBoard('Test Board')}
      >
        Create Board
      </button>
      <button
        data-testid='create-column'
        onClick={() => context.createColumn('Test Column')}
      >
        Create Column
      </button>
      {context.currentBoard && (
        <div data-testid='columns-count'>
          {context.currentBoard.columns.length}
        </div>
      )}
    </div>
  );
};

// Helper function to create mock board
const createMockBoard = (
  id = 'board-1',
  title = 'Test Board'
): KanbanBoard => ({
  id,
  title,
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
  ],
  labels: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Helper function to create mock task
const createMockTask = (id = 'task-1', title = 'Test Task'): Task => ({
  id,
  title,
  description: '',
  status: 'todo',
  priority: 'medium',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  labels: [],
  subTasks: [],
});

// Helper function to create mock label
const createMockLabel = (id = 'label-1', name = 'Test Label'): Label => ({
  id,
  name,
  color: '#ef4444',
  createdAt: new Date().toISOString(),
});

describe('BoardContext', () => {
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
    it('should provide BoardContext with initial state', () => {
      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      expect(screen.getByTestId('boards-count')).toHaveTextContent('0');
      expect(screen.getByTestId('current-board-id')).toHaveTextContent('none');
    });

    it('should throw error when useBoard is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useBoard must be used within a BoardProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Board management', () => {
    it('should create a new board', async () => {
      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      await act(async () => {
        screen.getByTestId('create-board').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('boards-count')).toHaveTextContent('1');
      });
    });

    it('should set current board', async () => {
      const initialBoards = [createMockBoard()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue(initialBoards);

      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-board-id')).toHaveTextContent(
          'board-1'
        );
      });
    });

    it('should update board properties', async () => {
      const TestUpdateComponent = () => {
        const context = useBoard();
        return (
          <div>
            <div data-testid='board-title'>
              {context.currentBoard?.title || 'none'}
            </div>
            <button
              data-testid='update-board'
              onClick={() =>
                context.updateBoard('board-1', { title: 'Updated Board' })
              }
            >
              Update Board
            </button>
          </div>
        );
      };

      const initialBoards = [createMockBoard()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue(initialBoards);

      render(
        <BoardProvider>
          <TestUpdateComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('board-title')).toHaveTextContent(
          'Test Board'
        );
      });

      await act(async () => {
        screen.getByTestId('update-board').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('board-title')).toHaveTextContent(
          'Updated Board'
        );
      });
    });

    it('should delete board (soft delete)', async () => {
      const TestDeleteComponent = () => {
        const context = useBoard();
        return (
          <div>
            <div data-testid='active-boards-count'>
              {
                context.state.boards.filter(b => b.deletionState !== 'deleted')
                  .length
              }
            </div>
            <button
              data-testid='delete-board'
              onClick={() => context.deleteBoard('board-1')}
            >
              Delete Board
            </button>
          </div>
        );
      };

      const initialBoards = [createMockBoard()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue(initialBoards);

      render(
        <BoardProvider>
          <TestDeleteComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('active-boards-count')).toHaveTextContent(
          '1'
        );
      });

      await act(async () => {
        screen.getByTestId('delete-board').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('active-boards-count')).toHaveTextContent(
          '0'
        );
      });
    });

    it('should restore deleted board', async () => {
      const TestRestoreComponent = () => {
        const context = useBoard();
        return (
          <div>
            <div data-testid='active-boards-count'>
              {
                context.state.boards.filter(b => b.deletionState !== 'deleted')
                  .length
              }
            </div>
            <button
              data-testid='restore-board'
              onClick={() => context.restoreBoard('board-1')}
            >
              Restore Board
            </button>
          </div>
        );
      };

      const deletedBoard = {
        ...createMockBoard(),
        deletionState: 'deleted' as const,
        deletedAt: new Date().toISOString(),
      };
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([deletedBoard]);

      render(
        <BoardProvider>
          <TestRestoreComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('active-boards-count')).toHaveTextContent(
          '0'
        );
      });

      await act(async () => {
        screen.getByTestId('restore-board').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('active-boards-count')).toHaveTextContent(
          '1'
        );
      });
    });
  });

  describe('Column management', () => {
    it('should create a new column', async () => {
      const initialBoards = [createMockBoard()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue(initialBoards);

      render(
        <BoardProvider>
          <TestComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('columns-count')).toHaveTextContent('2');
      });

      await act(async () => {
        screen.getByTestId('create-column').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('columns-count')).toHaveTextContent('3');
      });
    });

    it('should update column properties', async () => {
      const TestColumnUpdateComponent = () => {
        const context = useBoard();
        const firstColumn = context.currentBoard?.columns[0];
        return (
          <div>
            <div data-testid='column-title'>{firstColumn?.title || 'none'}</div>
            <button
              data-testid='update-column'
              onClick={() =>
                firstColumn &&
                context.updateColumn(firstColumn.id, {
                  title: 'Updated Column',
                })
              }
            >
              Update Column
            </button>
          </div>
        );
      };

      const initialBoards = [createMockBoard()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue(initialBoards);

      render(
        <BoardProvider>
          <TestColumnUpdateComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('column-title')).toHaveTextContent('Todo');
      });

      await act(async () => {
        screen.getByTestId('update-column').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('column-title')).toHaveTextContent(
          'Updated Column'
        );
      });
    });

    it('should move column left and right', async () => {
      const TestColumnMoveComponent = () => {
        const context = useBoard();
        const columns = context.currentBoard?.columns || [];
        return (
          <div>
            <div data-testid='first-column-title'>
              {columns[0]?.title || 'none'}
            </div>
            <div data-testid='second-column-title'>
              {columns[1]?.title || 'none'}
            </div>
            <button
              data-testid='move-column-right'
              onClick={() =>
                columns[0] && context.moveColumn(columns[0].id, 'right')
              }
            >
              Move First Column Right
            </button>
          </div>
        );
      };

      const initialBoards = [createMockBoard()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue(initialBoards);

      render(
        <BoardProvider>
          <TestColumnMoveComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('first-column-title')).toHaveTextContent(
          'Todo'
        );
        expect(screen.getByTestId('second-column-title')).toHaveTextContent(
          'In Progress'
        );
      });

      await act(async () => {
        screen.getByTestId('move-column-right').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('first-column-title')).toHaveTextContent(
          'In Progress'
        );
        expect(screen.getByTestId('second-column-title')).toHaveTextContent(
          'Todo'
        );
      });
    });
  });

  describe('Label management', () => {
    it('should add label to current board', async () => {
      const TestLabelComponent = () => {
        const context = useBoard();
        const currentBoardLabelsCount =
          context.currentBoard?.labels.length || 0;
        return (
          <div>
            <div data-testid='current-board-labels-count'>
              {currentBoardLabelsCount}
            </div>
            <button
              data-testid='add-label'
              onClick={() => {
                const newLabel = createMockLabel('label-1', 'Test Label');
                context.dispatch({
                  type: 'ADD_LABEL',
                  payload: { label: newLabel },
                });
              }}
            >
              Add Label
            </button>
          </div>
        );
      };

      const initialBoards = [
        createMockBoard('board-1'),
        createMockBoard('board-2'),
      ];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue(initialBoards);

      render(
        <BoardProvider>
          <TestLabelComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByTestId('current-board-labels-count')
        ).toHaveTextContent('0');
      });

      await act(async () => {
        screen.getByTestId('add-label').click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('current-board-labels-count')
        ).toHaveTextContent('1');
      });
    });

    it('should update label across all boards', async () => {
      const TestLabelUpdateComponent = () => {
        const context = useBoard();
        const firstLabel = context.currentBoard?.labels[0];
        return (
          <div>
            <div data-testid='label-name'>{firstLabel?.name || 'none'}</div>
            <button
              data-testid='update-label'
              onClick={() =>
                firstLabel &&
                context.dispatch({
                  type: 'UPDATE_LABEL',
                  payload: {
                    labelId: firstLabel.id,
                    updates: { name: 'Updated Label' },
                  },
                })
              }
            >
              Update Label
            </button>
          </div>
        );
      };

      const initialBoard = createMockBoard();
      initialBoard.labels = [createMockLabel()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([initialBoard]);

      render(
        <BoardProvider>
          <TestLabelUpdateComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('label-name')).toHaveTextContent(
          'Test Label'
        );
      });

      await act(async () => {
        screen.getByTestId('update-label').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('label-name')).toHaveTextContent(
          'Updated Label'
        );
      });
    });
  });

  describe('Task movement between boards', () => {
    it('should move task from one board to another', async () => {
      const TestTaskMoveComponent = () => {
        const context = useBoard();
        const sourceBoard = context.state.boards.find(b => b.id === 'board-1');
        const targetBoard = context.state.boards.find(b => b.id === 'board-2');
        const sourceTasks = sourceBoard?.columns[0]?.tasks.length || 0;
        const targetTasks = targetBoard?.columns[0]?.tasks.length || 0;

        return (
          <div>
            <div data-testid='source-tasks-count'>{sourceTasks}</div>
            <div data-testid='target-tasks-count'>{targetTasks}</div>
            <button
              data-testid='move-task'
              onClick={() =>
                context.moveTaskToBoard(
                  'task-1',
                  'board-1',
                  'col-1',
                  'board-2',
                  'col-1'
                )
              }
            >
              Move Task
            </button>
          </div>
        );
      };

      const board1 = createMockBoard('board-1');
      const board2 = createMockBoard('board-2');
      board1.columns[0].tasks = [createMockTask('task-1')];
      board2.columns[0].tasks = [];

      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([board1, board2]);

      render(
        <BoardProvider>
          <TestTaskMoveComponent />
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

    it('should reset completed task when moved to different board', async () => {
      const TestCompletedTaskMoveComponent = () => {
        const context = useBoard();
        const targetBoard = context.state.boards.find(b => b.id === 'board-2');
        const targetTask = targetBoard?.columns[0]?.tasks[0];

        return (
          <div>
            <div data-testid='task-completed'>
              {targetTask?.completedAt ? 'true' : 'false'}
            </div>
            <button
              data-testid='move-completed-task'
              onClick={() =>
                context.moveTaskToBoard(
                  'task-1',
                  'board-1',
                  'col-1',
                  'board-2',
                  'col-1'
                )
              }
            >
              Move Completed Task
            </button>
          </div>
        );
      };

      const board1 = createMockBoard('board-1');
      const board2 = createMockBoard('board-2');
      const completedTask = {
        ...createMockTask('task-1'),
        completedAt: new Date().toISOString(),
        subTasks: [{ id: 'sub-1', title: 'Sub Task', completed: true }],
      };
      board1.columns[0].tasks = [completedTask];
      board2.columns[0].tasks = [];

      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([board1, board2]);

      render(
        <BoardProvider>
          <TestCompletedTaskMoveComponent />
        </BoardProvider>
      );

      await act(async () => {
        screen.getByTestId('move-completed-task').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('task-completed')).toHaveTextContent('false');
      });
    });
  });

  describe('Import and export functionality', () => {
    it('should import boards with replaceAll option', async () => {
      const TestImportComponent = () => {
        const context = useBoard();
        return (
          <div>
            <div data-testid='boards-count'>{context.state.boards.length}</div>
            <button
              data-testid='import-boards'
              onClick={() => {
                const newBoards = [
                  createMockBoard('imported-1'),
                  createMockBoard('imported-2'),
                ];
                context.importBoards(newBoards, true);
              }}
            >
              Import Boards (Replace)
            </button>
          </div>
        );
      };

      const initialBoards = [createMockBoard()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue(initialBoards);

      render(
        <BoardProvider>
          <TestImportComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('boards-count')).toHaveTextContent('1');
      });

      await act(async () => {
        screen.getByTestId('import-boards').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('boards-count')).toHaveTextContent('2');
      });
    });

    it('should import boards without replacing existing ones', async () => {
      const TestImportAddComponent = () => {
        const context = useBoard();
        return (
          <div>
            <div data-testid='boards-count'>{context.state.boards.length}</div>
            <button
              data-testid='import-boards-add'
              onClick={() => {
                const newBoards = [createMockBoard('imported-1')];
                context.importBoards(newBoards, false);
              }}
            >
              Import Boards (Add)
            </button>
          </div>
        );
      };

      const initialBoards = [createMockBoard()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue(initialBoards);

      render(
        <BoardProvider>
          <TestImportAddComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('boards-count')).toHaveTextContent('1');
      });

      await act(async () => {
        screen.getByTestId('import-boards-add').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('boards-count')).toHaveTextContent('2');
      });
    });
  });

  describe('Board reordering', () => {
    it('should reorder boards', async () => {
      const TestReorderComponent = () => {
        const context = useBoard();
        const firstBoard = context.state.boards[0];
        const secondBoard = context.state.boards[1];

        return (
          <div>
            <div data-testid='first-board-id'>{firstBoard?.id || 'none'}</div>
            <div data-testid='second-board-id'>{secondBoard?.id || 'none'}</div>
            <button
              data-testid='reorder-boards'
              onClick={() => {
                const reorderedBoards = [secondBoard, firstBoard];
                context.reorderBoards(reorderedBoards);
              }}
            >
              Reorder Boards
            </button>
          </div>
        );
      };

      const initialBoards = [
        createMockBoard('board-1'),
        createMockBoard('board-2'),
      ];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue(initialBoards);

      render(
        <BoardProvider>
          <TestReorderComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('first-board-id')).toHaveTextContent(
          'board-1'
        );
        expect(screen.getByTestId('second-board-id')).toHaveTextContent(
          'board-2'
        );
      });

      await act(async () => {
        screen.getByTestId('reorder-boards').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('first-board-id')).toHaveTextContent(
          'board-2'
        );
        expect(screen.getByTestId('second-board-id')).toHaveTextContent(
          'board-1'
        );
      });
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle operations when no current board is set', async () => {
      const TestNoCurrentBoardComponent = () => {
        const context = useBoard();
        return (
          <div>
            <div data-testid='current-board-id'>
              {context.currentBoard?.id || 'none'}
            </div>
            <div data-testid='columns-count'>
              {context.currentBoard?.columns.length || 0}
            </div>
            <button
              data-testid='set-no-board'
              onClick={() =>
                context.dispatch({
                  type: 'SET_CURRENT_BOARD',
                  payload: 'nonexistent-id',
                })
              }
            >
              Set No Board
            </button>
            <button
              data-testid='create-column-no-board'
              onClick={() => context.createColumn('Test Column')}
            >
              Create Column (No Board)
            </button>
          </div>
        );
      };

      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([]);

      render(
        <BoardProvider>
          <TestNoCurrentBoardComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('current-board-id')).toHaveTextContent(
          'none'
        );
      });

      const initialColumnsCount =
        screen.getByTestId('columns-count').textContent;

      // Should not crash when trying to create column without current board
      await act(async () => {
        screen.getByTestId('create-column-no-board').click();
      });

      // Should remain unchanged because no current board
      expect(screen.getByTestId('current-board-id')).toHaveTextContent('none');
      expect(screen.getByTestId('columns-count')).toHaveTextContent(
        initialColumnsCount || '0'
      );
    });

    it('should handle invalid board operations gracefully', async () => {
      const TestInvalidOperationsComponent = () => {
        const context = useBoard();
        return (
          <div>
            <div data-testid='boards-count'>{context.state.boards.length}</div>
            <button
              data-testid='update-nonexistent-board'
              onClick={() =>
                context.updateBoard('nonexistent-id', { title: 'Updated' })
              }
            >
              Update Nonexistent Board
            </button>
            <button
              data-testid='move-nonexistent-task'
              onClick={() =>
                context.moveTaskToBoard(
                  'nonexistent-task',
                  'nonexistent-source',
                  'nonexistent-column',
                  'nonexistent-target'
                )
              }
            >
              Move Nonexistent Task
            </button>
          </div>
        );
      };

      const initialBoards = [createMockBoard()];
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue(initialBoards);

      render(
        <BoardProvider>
          <TestInvalidOperationsComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('boards-count')).toHaveTextContent('1');
      });

      // Should not crash or cause unexpected state changes
      await act(async () => {
        screen.getByTestId('update-nonexistent-board').click();
        screen.getByTestId('move-nonexistent-task').click();
      });

      // State should remain unchanged
      await waitFor(() => {
        expect(screen.getByTestId('boards-count')).toHaveTextContent('1');
      });
    });
  });

  describe('Recycle bin operations', () => {
    it('should empty board recycle bin', async () => {
      const TestRecycleBinComponent = () => {
        const context = useBoard();
        const deletedBoardsCount = context.state.boards.filter(
          b => b.deletionState === 'deleted'
        ).length;
        return (
          <div>
            <div data-testid='deleted-boards-count'>{deletedBoardsCount}</div>
            <button
              data-testid='empty-recycle-bin'
              onClick={() => context.emptyBoardRecycleBin()}
            >
              Empty Recycle Bin
            </button>
          </div>
        );
      };

      const deletedBoard = {
        ...createMockBoard(),
        deletionState: 'deleted' as const,
        deletedAt: new Date().toISOString(),
      };
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([deletedBoard]);

      render(
        <BoardProvider>
          <TestRecycleBinComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('deleted-boards-count')).toHaveTextContent(
          '1'
        );
      });

      await act(async () => {
        screen.getByTestId('empty-recycle-bin').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('deleted-boards-count')).toHaveTextContent(
          '0'
        );
      });
    });

    it('should permanently delete board', async () => {
      const TestPermanentDeleteComponent = () => {
        const context = useBoard();
        return (
          <div>
            <div data-testid='total-boards-count'>
              {context.state.boards.length}
            </div>
            <button
              data-testid='permanent-delete'
              onClick={() => context.permanentlyDeleteBoard('board-1')}
            >
              Permanently Delete Board
            </button>
          </div>
        );
      };

      const deletedBoard = {
        ...createMockBoard(),
        deletionState: 'deleted' as const,
        deletedAt: new Date().toISOString(),
      };
      const { loadBoards } = await import('../utils/storage');
      vi.mocked(loadBoards).mockReturnValue([deletedBoard]);

      render(
        <BoardProvider>
          <TestPermanentDeleteComponent />
        </BoardProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('total-boards-count')).toHaveTextContent('1');
      });

      await act(async () => {
        screen.getByTestId('permanent-delete').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('total-boards-count')).toHaveTextContent('0');
      });
    });
  });
});
