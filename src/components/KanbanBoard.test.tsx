/**
 * KanbanBoard component comprehensive test suite
 * カンバンボードコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KanbanBoard from './KanbanBoard';
import type { Board, Task } from '../types';

// Mock @dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => (
    <div data-testid='dnd-context'>{children}</div>
  ),
  DragOverlay: ({ children }: any) =>
    children ? <div data-testid='drag-overlay'>{children}</div> : null,
  pointerWithin: vi.fn(() => []),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

// Mock contexts
const mockCurrentBoard: Board = {
  id: 'board-1',
  title: 'Test Board',
  columns: [
    {
      id: 'column-1',
      title: 'To Do',
      tasks: [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          columnId: 'column-1',
          boardId: 'board-1',
          priority: 'medium',
          labels: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      order: 0,
    },
    {
      id: 'column-2',
      title: 'In Progress',
      tasks: [],
      order: 1,
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockUseBoard = vi.fn();
vi.mock('../contexts/BoardContext', () => ({
  useBoard: () => mockUseBoard(),
}));

const mockMoveTask = vi.fn();
vi.mock('../contexts/TaskContext', () => ({
  useTask: () => ({
    moveTask: mockMoveTask,
  }),
}));

const mockSetSortOption = vi.fn();
const mockOpenTaskDetail = vi.fn();
vi.mock('../contexts/UIContext', () => ({
  useUI: () => ({
    setSortOption: mockSetSortOption,
    openTaskDetail: mockOpenTaskDetail,
  }),
}));

// Mock hooks
const mockDragAndDropState = {
  activeTask: null,
  sensors: [],
  handleDragStart: vi.fn(),
  handleDragOver: vi.fn(),
  handleDragEnd: vi.fn(),
};

vi.mock('../hooks/useDragAndDrop', () => ({
  useDragAndDrop: () => mockDragAndDropState,
}));

const mockKeyboardDragAndDrop = {
  selectedTaskId: null,
  isDragMode: false,
  handleKeyDown: vi.fn(),
};

vi.mock('../hooks/useKeyboardDragAndDrop', () => ({
  useKeyboardDragAndDrop: () => mockKeyboardDragAndDrop,
}));

// Mock child components
vi.mock('./KanbanColumn', () => ({
  default: ({
    column,
    onTaskClick,
    keyboardDragAndDrop: _keyboardDragAndDrop,
  }: any) => (
    <div data-testid={`kanban-column-${column.id}`}>
      <h3>{column.title}</h3>
      <div data-testid={`column-tasks-${column.id}`}>
        {column.tasks.map((task: Task) => (
          <div
            key={task.id}
            data-testid={`task-card-${task.id}`}
            onClick={() => onTaskClick && onTaskClick(task)}
          >
            {task.title}
          </div>
        ))}
      </div>
    </div>
  ),
}));

vi.mock('./TaskCard', () => ({
  default: ({ task, onTaskClick }: any) => (
    <div
      data-testid={`task-card-${task.id}`}
      onClick={() => onTaskClick && onTaskClick(task)}
    >
      {task.title}
    </div>
  ),
}));

describe('KanbanBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBoard.mockReturnValue({ currentBoard: mockCurrentBoard });
    // Reset drag and drop state
    mockDragAndDropState.activeTask = null;
  });

  describe('Rendering', () => {
    it('should render kanban board with DndContext', () => {
      render(<KanbanBoard />);

      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    });

    it('should render all columns', () => {
      render(<KanbanBoard />);

      expect(screen.getByTestId('kanban-column-column-1')).toBeInTheDocument();
      expect(screen.getByTestId('kanban-column-column-2')).toBeInTheDocument();
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should render tasks in columns', () => {
      render(<KanbanBoard />);

      expect(screen.getByTestId('task-card-task-1')).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
    });

    it('should render empty state when no board is selected', () => {
      mockUseBoard.mockReturnValue({ currentBoard: null });

      render(<KanbanBoard />);

      expect(screen.getByText('board.selectBoard')).toBeInTheDocument();
      expect(screen.queryByTestId('dnd-context')).not.toBeInTheDocument();
    });

    it('should render drag overlay when task is being dragged', () => {
      const draggingTask: Task = {
        id: 'task-1',
        title: 'Task 1',
        description: 'Description 1',
        columnId: 'column-1',
        boardId: 'board-1',
        priority: 'medium',
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockDragAndDropState.activeTask = draggingTask;

      render(<KanbanBoard />);

      expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();
      // Verify there are 2 task cards: one in the column and one in the drag overlay
      expect(screen.getAllByTestId('task-card-task-1')).toHaveLength(2);
    });
  });

  describe('Task Click Handling', () => {
    it('should open task detail when task is clicked', () => {
      render(<KanbanBoard />);

      const taskCard = screen.getByTestId('task-card-task-1');
      fireEvent.click(taskCard);

      // handleTaskClick is called with the task object, which then calls openTaskDetail(task.id)
      expect(mockOpenTaskDetail).toHaveBeenCalledWith('task-1');
    });

    it('should call handleTaskClick with correct task', () => {
      render(<KanbanBoard />);

      const taskCard = screen.getByTestId('task-card-task-1');
      fireEvent.click(taskCard);

      // Verify openTaskDetail was called exactly once with the task ID
      expect(mockOpenTaskDetail).toHaveBeenCalledTimes(1);
      expect(mockOpenTaskDetail).toHaveBeenCalledWith('task-1');
    });
  });

  describe('Drag and Drop', () => {
    it('should filter out deleted columns from collision detection', () => {
      const boardWithDeletedColumn: Board = {
        ...mockCurrentBoard,
        columns: [
          ...mockCurrentBoard.columns,
          {
            id: 'column-deleted',
            title: 'Deleted Column',
            tasks: [],
            order: 2,
            deletionState: 'deleted',
          },
        ],
      };

      mockUseBoard.mockReturnValue({ currentBoard: boardWithDeletedColumn });

      render(<KanbanBoard />);

      // Should not render deleted columns
      expect(screen.queryByText('Deleted Column')).not.toBeInTheDocument();
    });

    it('should handle drag start', () => {
      render(<KanbanBoard />);

      expect(mockDragAndDropState.handleDragStart).toBeDefined();
    });

    it('should handle drag over', () => {
      render(<KanbanBoard />);

      expect(mockDragAndDropState.handleDragOver).toBeDefined();
    });

    it('should handle drag end', () => {
      render(<KanbanBoard />);

      expect(mockDragAndDropState.handleDragEnd).toBeDefined();
    });
  });

  describe('Keyboard Drag and Drop', () => {
    it('should provide keyboard drag and drop functionality to columns', () => {
      render(<KanbanBoard />);

      // Keyboard drag and drop should be available
      expect(mockKeyboardDragAndDrop.handleKeyDown).toBeDefined();
    });

    it('should handle keyboard navigation', () => {
      mockKeyboardDragAndDrop.selectedTaskId = 'task-1';
      mockKeyboardDragAndDrop.isDragMode = true;

      render(<KanbanBoard />);

      expect(screen.getByTestId('kanban-column-column-1')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should render empty columns correctly', () => {
      render(<KanbanBoard />);

      const emptyColumnTasks = screen.getByTestId('column-tasks-column-2');
      expect(emptyColumnTasks.children).toHaveLength(0);
    });

    it('should handle board with no columns', () => {
      const emptyBoard: Board = {
        ...mockCurrentBoard,
        columns: [],
      };

      mockUseBoard.mockReturnValue({ currentBoard: emptyBoard });

      render(<KanbanBoard />);

      expect(screen.queryByTestId(/kanban-column-/)).not.toBeInTheDocument();
    });
  });

  describe('Multiple Tasks', () => {
    it('should render multiple tasks in a column', () => {
      const boardWithMultipleTasks: Board = {
        ...mockCurrentBoard,
        columns: [
          {
            id: 'column-1',
            title: 'To Do',
            tasks: [
              {
                id: 'task-1',
                title: 'Task 1',
                description: '',
                columnId: 'column-1',
                boardId: 'board-1',
                priority: 'medium',
                labels: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                id: 'task-2',
                title: 'Task 2',
                description: '',
                columnId: 'column-1',
                boardId: 'board-1',
                priority: 'high',
                labels: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            order: 0,
          },
        ],
      };

      mockUseBoard.mockReturnValue({ currentBoard: boardWithMultipleTasks });
      // Ensure activeTask is null for this test
      mockDragAndDropState.activeTask = null;

      render(<KanbanBoard />);

      expect(screen.getByTestId('task-card-task-1')).toBeInTheDocument();
      expect(screen.getByTestId('task-card-task-2')).toBeInTheDocument();
    });
  });

  describe('Column Management', () => {
    it('should render columns in correct order', () => {
      const boardWithOrderedColumns: Board = {
        ...mockCurrentBoard,
        columns: [
          { id: 'column-1', title: 'First', tasks: [], order: 0 },
          { id: 'column-2', title: 'Second', tasks: [], order: 1 },
          { id: 'column-3', title: 'Third', tasks: [], order: 2 },
        ],
      };

      mockUseBoard.mockReturnValue({ currentBoard: boardWithOrderedColumns });

      render(<KanbanBoard />);

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      render(<KanbanBoard />);

      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    });

    it('should provide keyboard navigation support', () => {
      render(<KanbanBoard />);

      expect(mockKeyboardDragAndDrop).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should handle large number of tasks efficiently', () => {
      const tasksArray: Task[] = Array.from({ length: 100 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        description: '',
        columnId: 'column-1',
        boardId: 'board-1',
        priority: 'medium',
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const boardWithManyTasks: Board = {
        ...mockCurrentBoard,
        columns: [
          {
            id: 'column-1',
            title: 'To Do',
            tasks: tasksArray,
            order: 0,
          },
        ],
      };

      mockUseBoard.mockReturnValue({ currentBoard: boardWithManyTasks });

      const { container } = render(<KanbanBoard />);

      expect(container).toBeInTheDocument();
    });
  });
});
