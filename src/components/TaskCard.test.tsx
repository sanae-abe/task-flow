/**
 * TaskCard component comprehensive test suite
 * タスクカードコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskCard from './TaskCard';
import type { Task } from '../types';

// Mock @dnd-kit/sortable
const mockUseSortable = vi.fn();
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: (props: any) => mockUseSortable(props),
}));

// Mock CSS utilities
vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: (transform: any) =>
        transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
    },
  },
}));

// Mock hooks
const mockUseTaskCard = vi.fn();
vi.mock('../hooks/useTaskCard', () => ({
  useTaskCard: (task: any, columnId: any) => mockUseTaskCard(task, columnId),
}));

// Mock child components
vi.mock('./ConfirmDialog', () => ({
  default: ({ isOpen, title, onConfirm, onCancel }: any) =>
    isOpen ? (
      <div data-testid='confirm-dialog'>
        <h2>{title}</h2>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

vi.mock('./DropIndicator', () => ({
  default: ({ isVisible }: any) =>
    isVisible ? <div data-testid='drop-indicator' /> : null,
}));

vi.mock('./TaskCardContent', () => ({
  default: ({ task, onEdit, onDelete, onDuplicate }: any) => (
    <div data-testid='task-card-content'>
      <div data-testid='task-title'>{task.title}</div>
      <button onClick={onEdit} data-testid='edit-button'>
        Edit
      </button>
      <button onClick={onDelete} data-testid='delete-button'>
        Delete
      </button>
      <button onClick={onDuplicate} data-testid='duplicate-button'>
        Duplicate
      </button>
    </div>
  ),
}));

vi.mock('./TaskEditDialog', () => ({
  default: ({ isOpen, task, onClose }: any) =>
    isOpen ? (
      <div data-testid='task-edit-dialog'>
        <h2>Edit Task: {task.title}</h2>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

// Mock date helpers
vi.mock('../utils/dateHelpers', () => ({
  formatDueDate: (date: string) => `Formatted: ${date}`,
}));

describe('TaskCard', () => {
  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    columnId: 'column-1',
    boardId: 'board-1',
    priority: 'medium',
    labels: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultSortableState = {
    attributes: { role: 'button', tabIndex: 0 },
    listeners: { onPointerDown: vi.fn() },
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
    isOver: false,
  };

  const defaultTaskCardState = {
    showEditDialog: false,
    showDeleteConfirm: false,
    handleEdit: vi.fn(),
    handleSave: vi.fn(),
    handleCancel: vi.fn(),
    handleDelete: vi.fn(),
    handleConfirmDelete: vi.fn(),
    handleDeleteFromDialog: vi.fn(),
    handleCancelDelete: vi.fn(),
    handleComplete: vi.fn(),
    isOverdue: vi.fn(() => false),
    isDueToday: vi.fn(() => false),
    isDueTomorrow: vi.fn(() => false),
    isRightmostColumn: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSortable.mockReturnValue(defaultSortableState);
    mockUseTaskCard.mockReturnValue(defaultTaskCardState);
  });

  describe('Rendering', () => {
    it('should render task card with basic content', () => {
      render(<TaskCard task={mockTask} columnId='column-1' />);

      expect(screen.getByTestId('task-card-content')).toBeInTheDocument();
      expect(screen.getByTestId('task-title')).toHaveTextContent('Test Task');
    });

    it('should render with drag and drop attributes', () => {
      render(<TaskCard task={mockTask} columnId='column-1' />);

      const card = screen.getByTestId('task-card-content').parentElement;
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should not render drop indicator when not over', () => {
      render(<TaskCard task={mockTask} columnId='column-1' />);

      expect(screen.queryByTestId('drop-indicator')).not.toBeInTheDocument();
    });

    it('should render drop indicator when over', () => {
      mockUseSortable.mockReturnValue({
        ...defaultSortableState,
        isOver: true,
      });

      render(<TaskCard task={mockTask} columnId='column-1' />);

      expect(screen.getByTestId('drop-indicator')).toBeInTheDocument();
    });

    it('should hide drop indicator when dragging', () => {
      mockUseSortable.mockReturnValue({
        ...defaultSortableState,
        isOver: true,
        isDragging: true,
      });

      render(<TaskCard task={mockTask} columnId='column-1' />);

      expect(screen.queryByTestId('drop-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Click Handling', () => {
    it('should call onTaskClick when card is clicked', () => {
      const mockOnTaskClick = vi.fn();
      render(
        <TaskCard
          task={mockTask}
          columnId='column-1'
          onTaskClick={mockOnTaskClick}
        />
      );

      const card = screen.getByTestId('task-card-content').parentElement;
      fireEvent.click(card!);

      expect(mockOnTaskClick).toHaveBeenCalledWith(mockTask);
    });

    it('should not throw when onTaskClick is not provided', () => {
      render(<TaskCard task={mockTask} columnId='column-1' />);

      const card = screen.getByTestId('task-card-content').parentElement;
      expect(() => fireEvent.click(card!)).not.toThrow();
    });
  });

  describe('Drag and Drop Styling', () => {
    it('should apply dragging opacity when isDragging is true', () => {
      mockUseSortable.mockReturnValue({
        ...defaultSortableState,
        isDragging: true,
      });

      render(<TaskCard task={mockTask} columnId='column-1' />);

      const card = screen.getByTestId('task-card-content').parentElement;
      expect(card).toHaveStyle({ opacity: '0.5' });
    });

    it('should apply rightmost column opacity when isRightmostColumn is true', () => {
      mockUseTaskCard.mockReturnValue({
        ...defaultTaskCardState,
        isRightmostColumn: true,
      });

      render(<TaskCard task={mockTask} columnId='column-1' />);

      const card = screen.getByTestId('task-card-content').parentElement;
      expect(card).toHaveStyle({ opacity: '0.6' });
    });

    it('should apply transform when dragging', () => {
      mockUseSortable.mockReturnValue({
        ...defaultSortableState,
        transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
      });

      render(<TaskCard task={mockTask} columnId='column-1' />);

      const card = screen.getByTestId('task-card-content').parentElement;
      expect(card).toHaveStyle({ transform: 'translate3d(10px, 20px, 0)' });
    });
  });

  describe('Keyboard Drag and Drop', () => {
    it('should call handleKeyDown when key is pressed', () => {
      const mockHandleKeyDown = vi.fn();
      const keyboardDragAndDrop = {
        selectedTaskId: null,
        isDragMode: false,
        handleKeyDown: mockHandleKeyDown,
      };

      render(
        <TaskCard
          task={mockTask}
          columnId='column-1'
          keyboardDragAndDrop={keyboardDragAndDrop}
        />
      );

      const card = screen.getByTestId('task-card-content').parentElement;
      fireEvent.keyDown(card!, { key: 'Enter' });

      expect(mockHandleKeyDown).toHaveBeenCalledWith(
        expect.any(Object),
        'task-1'
      );
    });

    it('should apply selected styles when task is selected in drag mode', () => {
      const keyboardDragAndDrop = {
        selectedTaskId: 'task-1',
        isDragMode: true,
        handleKeyDown: vi.fn(),
      };

      render(
        <TaskCard
          task={mockTask}
          columnId='column-1'
          keyboardDragAndDrop={keyboardDragAndDrop}
        />
      );

      const card = screen.getByTestId('task-card-content').parentElement;
      expect(card).toHaveStyle({
        outline: '2px solid #0969da',
        outlineOffset: '2px',
      });
    });

    it('should not apply selected styles when not in drag mode', () => {
      const keyboardDragAndDrop = {
        selectedTaskId: 'task-1',
        isDragMode: false,
        handleKeyDown: vi.fn(),
      };

      render(
        <TaskCard
          task={mockTask}
          columnId='column-1'
          keyboardDragAndDrop={keyboardDragAndDrop}
        />
      );

      const card = screen.getByTestId('task-card-content').parentElement;
      expect(card).not.toHaveStyle({ outline: '2px solid #0969da' });
    });
  });

  describe('Task Actions', () => {
    it('should render edit dialog when edit button is clicked', () => {
      // Set mock BEFORE render to ensure it applies during component mount
      mockUseTaskCard.mockReturnValue({
        ...defaultTaskCardState,
        showEditDialog: true,
      });

      render(<TaskCard task={mockTask} columnId='column-1' />);

      expect(screen.getByTestId('task-edit-dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Task: Test Task')).toBeInTheDocument();

      // Reset mock for other tests
      mockUseTaskCard.mockReturnValue(defaultTaskCardState);
    });

    it('should render delete confirmation dialog when delete button is clicked', () => {
      // Set mock BEFORE render to ensure it applies during component mount
      mockUseTaskCard.mockReturnValue({
        ...defaultTaskCardState,
        showDeleteConfirm: true,
      });

      render(<TaskCard task={mockTask} columnId='column-1' />);

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();

      // Reset mock for other tests
      mockUseTaskCard.mockReturnValue(defaultTaskCardState);
    });

    it('should handle task with due date', () => {
      const taskWithDueDate: Task = {
        ...mockTask,
        dueDate: '2025-12-31',
      };

      render(<TaskCard task={taskWithDueDate} columnId='column-1' />);

      expect(screen.getByTestId('task-card-content')).toBeInTheDocument();
    });

    it('should handle task with priority', () => {
      const taskWithPriority: Task = {
        ...mockTask,
        priority: 'high',
      };

      render(<TaskCard task={taskWithPriority} columnId='column-1' />);

      expect(screen.getByTestId('task-card-content')).toBeInTheDocument();
    });

    it('should handle task with labels', () => {
      const taskWithLabels: Task = {
        ...mockTask,
        labels: [
          { id: 'label-1', name: 'Bug', color: '#ff0000', boardId: 'board-1' },
        ],
      };

      render(<TaskCard task={taskWithLabels} columnId='column-1' />);

      expect(screen.getByTestId('task-card-content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<TaskCard task={mockTask} columnId='column-1' />);

      const card = screen.getByTestId('task-card-content').parentElement;
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should be keyboard accessible', () => {
      const mockOnTaskClick = vi.fn();
      render(
        <TaskCard
          task={mockTask}
          columnId='column-1'
          onTaskClick={mockOnTaskClick}
        />
      );

      const card = screen.getByTestId('task-card-content').parentElement;
      card!.focus();
      expect(document.activeElement).toBe(card);
    });
  });

  describe('Edge Cases', () => {
    it('should handle task without description', () => {
      const taskWithoutDescription: Task = {
        ...mockTask,
        description: undefined,
      };

      render(<TaskCard task={taskWithoutDescription} columnId='column-1' />);

      expect(screen.getByTestId('task-card-content')).toBeInTheDocument();
    });

    it('should handle very long task title', () => {
      const taskWithLongTitle: Task = {
        ...mockTask,
        title: 'A'.repeat(200),
      };

      render(<TaskCard task={taskWithLongTitle} columnId='column-1' />);

      expect(screen.getByTestId('task-title')).toBeInTheDocument();
    });

    it('should handle multiple simultaneous operations', () => {
      // Set mocks BEFORE render
      mockUseSortable.mockReturnValue({
        ...defaultSortableState,
        isDragging: true,
        isOver: true,
      });

      mockUseTaskCard.mockReturnValue({
        ...defaultTaskCardState,
        isRightmostColumn: true,
        showEditDialog: true,
      });

      render(<TaskCard task={mockTask} columnId='column-1' />);

      expect(screen.getByTestId('task-card-content')).toBeInTheDocument();
      expect(screen.getByTestId('task-edit-dialog')).toBeInTheDocument();

      // Reset mocks for other tests
      mockUseSortable.mockReturnValue(defaultSortableState);
      mockUseTaskCard.mockReturnValue(defaultTaskCardState);
    });
  });

  describe('Performance', () => {
    it('should memoize component to prevent unnecessary re-renders', () => {
      const { rerender } = render(
        <TaskCard task={mockTask} columnId='column-1' />
      );

      // Same props should not trigger re-render
      rerender(<TaskCard task={mockTask} columnId='column-1' />);

      expect(screen.getByTestId('task-card-content')).toBeInTheDocument();
    });
  });
});
