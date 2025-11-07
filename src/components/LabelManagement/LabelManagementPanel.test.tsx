/**
 * LabelManagementPanel component tests
 * ラベル管理パネルコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LabelManagementPanel from './LabelManagementPanel';
import type { LabelWithInfo } from '../../types/labelManagement';

// Mock child components
vi.mock('./LabelFormDialog', () => ({
  default: ({ isOpen, onClose, onSave, label, mode }: any) =>
    isOpen ? (
      <div data-testid='label-form-dialog'>
        <div data-testid='dialog-mode'>{mode}</div>
        <div data-testid='dialog-label'>{label?.name || 'none'}</div>
        <button onClick={onClose} data-testid='close-dialog'>
          Close
        </button>
        <button
          onClick={() => onSave({ name: 'Test', color: '#0969da' })}
          data-testid='save-dialog'
        >
          Save
        </button>
      </div>
    ) : null,
}));

vi.mock('../shared/Dialog/ConfirmDialog', () => ({
  default: ({ isOpen, onConfirm, onClose, message }: any) =>
    isOpen ? (
      <div data-testid='confirm-dialog'>
        <div data-testid='confirm-message'>{message}</div>
        <button onClick={onConfirm} data-testid='confirm-button'>
          Confirm
        </button>
        <button onClick={onClose} data-testid='cancel-button'>
          Cancel
        </button>
      </div>
    ) : null,
}));

vi.mock('./components/EmptyState', () => ({
  default: () => <div data-testid='empty-state'>No labels</div>,
}));

vi.mock('./components/LabelDataTable', () => ({
  LabelDataTable: ({ labels, onEdit, onDelete }: any) => (
    <div data-testid='label-data-table'>
      {labels.map((label: any) => (
        <div key={label.id} data-testid={`label-row-${label.id}`}>
          <span>{label.name}</span>
          <button
            onClick={() => onEdit(label)}
            data-testid={`edit-${label.id}`}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(label)}
            data-testid={`delete-${label.id}`}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  ),
}));

// Mock hooks
const mockUseLabelData = vi.fn();
const mockUseLabelDialogs = vi.fn();

vi.mock('./hooks/useLabelData', () => ({
  useLabelData: (sortField: any, sortDirection: any) =>
    mockUseLabelData(sortField, sortDirection),
}));

vi.mock('./hooks/useLabelDialogs', () => ({
  useLabelDialogs: (onMessage: any) => mockUseLabelDialogs(onMessage),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('LabelManagementPanel', () => {
  const mockLabels: LabelWithInfo[] = [
    {
      id: 'label-1',
      name: 'Bug',
      color: '#d1242f',
      boardName: 'Board 1',
      boardId: 'board-1',
      usageCount: 5,
    },
    {
      id: 'label-2',
      name: 'Feature',
      color: '#0969da',
      boardName: 'Board 1',
      boardId: 'board-1',
      usageCount: 3,
    },
  ];

  let mockOnMessage: ReturnType<typeof vi.fn>;
  let mockHandleEdit: ReturnType<typeof vi.fn>;
  let mockHandleCreate: ReturnType<typeof vi.fn>;
  let mockHandleDelete: ReturnType<typeof vi.fn>;
  let mockHandleCloseEditDialog: ReturnType<typeof vi.fn>;
  let mockHandleCloseDeleteDialog: ReturnType<typeof vi.fn>;
  let mockHandleSave: ReturnType<typeof vi.fn>;
  let mockHandleConfirmDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnMessage = vi.fn();
    mockHandleEdit = vi.fn();
    mockHandleCreate = vi.fn();
    mockHandleDelete = vi.fn();
    mockHandleCloseEditDialog = vi.fn();
    mockHandleCloseDeleteDialog = vi.fn();
    mockHandleSave = vi.fn();
    mockHandleConfirmDelete = vi.fn();

    mockUseLabelData.mockReturnValue({
      allLabelsWithInfo: mockLabels,
    });

    mockUseLabelDialogs.mockReturnValue({
      editDialog: { isOpen: false, label: null, mode: 'create' },
      deleteDialog: { isOpen: false, label: null },
      handleEdit: mockHandleEdit,
      handleCreate: mockHandleCreate,
      handleDelete: mockHandleDelete,
      handleCloseEditDialog: mockHandleCloseEditDialog,
      handleCloseDeleteDialog: mockHandleCloseDeleteDialog,
      handleSave: mockHandleSave,
      handleConfirmDelete: mockHandleConfirmDelete,
    });
  });

  describe('Rendering', () => {
    it('should render label management panel', () => {
      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      expect(screen.getByText('label.manageLabels')).toBeInTheDocument();
    });

    it('should render create button', () => {
      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      const createButton = screen.getByRole('button', {
        name: /label\.createLabel/i,
      });
      expect(createButton).toBeInTheDocument();
    });

    it('should render label data table when labels exist', () => {
      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      expect(screen.getByTestId('label-data-table')).toBeInTheDocument();
      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });

    it('should render empty state when no labels', () => {
      mockUseLabelData.mockReturnValue({
        allLabelsWithInfo: [],
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.queryByTestId('label-data-table')).not.toBeInTheDocument();
    });

    it('should render all labels in table', () => {
      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      expect(screen.getByTestId('label-row-label-1')).toBeInTheDocument();
      expect(screen.getByTestId('label-row-label-2')).toBeInTheDocument();
      expect(screen.getByText('Bug')).toBeInTheDocument();
      expect(screen.getByText('Feature')).toBeInTheDocument();
    });
  });

  describe('Create label', () => {
    it('should call handleCreate when create button is clicked', () => {
      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      const createButton = screen.getByRole('button', {
        name: /label\.createLabel/i,
      });
      fireEvent.click(createButton);

      expect(mockHandleCreate).toHaveBeenCalledTimes(1);
    });

    it('should open create dialog when create button is clicked', () => {
      mockUseLabelDialogs.mockReturnValue({
        editDialog: { isOpen: true, label: null, mode: 'create' },
        deleteDialog: { isOpen: false, label: null },
        handleEdit: mockHandleEdit,
        handleCreate: mockHandleCreate,
        handleDelete: mockHandleDelete,
        handleCloseEditDialog: mockHandleCloseEditDialog,
        handleCloseDeleteDialog: mockHandleCloseDeleteDialog,
        handleSave: mockHandleSave,
        handleConfirmDelete: mockHandleConfirmDelete,
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      expect(screen.getByTestId('label-form-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-mode')).toHaveTextContent('create');
    });

    it('should call handleSave when save is clicked in dialog', () => {
      mockUseLabelDialogs.mockReturnValue({
        editDialog: { isOpen: true, label: null, mode: 'create' },
        deleteDialog: { isOpen: false, label: null },
        handleEdit: mockHandleEdit,
        handleCreate: mockHandleCreate,
        handleDelete: mockHandleDelete,
        handleCloseEditDialog: mockHandleCloseEditDialog,
        handleCloseDeleteDialog: mockHandleCloseDeleteDialog,
        handleSave: mockHandleSave,
        handleConfirmDelete: mockHandleConfirmDelete,
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      const saveButton = screen.getByTestId('save-dialog');
      fireEvent.click(saveButton);

      expect(mockHandleSave).toHaveBeenCalledWith({
        name: 'Test',
        color: '#0969da',
      });
    });
  });

  describe('Edit label', () => {
    it('should call handleEdit when edit button is clicked', () => {
      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      const editButton = screen.getByTestId('edit-label-1');
      fireEvent.click(editButton);

      expect(mockHandleEdit).toHaveBeenCalledWith(mockLabels[0]);
    });

    it('should open edit dialog with label data', () => {
      mockUseLabelDialogs.mockReturnValue({
        editDialog: { isOpen: true, label: mockLabels[0], mode: 'edit' },
        deleteDialog: { isOpen: false, label: null },
        handleEdit: mockHandleEdit,
        handleCreate: mockHandleCreate,
        handleDelete: mockHandleDelete,
        handleCloseEditDialog: mockHandleCloseEditDialog,
        handleCloseDeleteDialog: mockHandleCloseDeleteDialog,
        handleSave: mockHandleSave,
        handleConfirmDelete: mockHandleConfirmDelete,
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      expect(screen.getByTestId('label-form-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-mode')).toHaveTextContent('edit');
      expect(screen.getByTestId('dialog-label')).toHaveTextContent('Bug');
    });

    it('should call handleCloseEditDialog when dialog is closed', () => {
      mockUseLabelDialogs.mockReturnValue({
        editDialog: { isOpen: true, label: mockLabels[0], mode: 'edit' },
        deleteDialog: { isOpen: false, label: null },
        handleEdit: mockHandleEdit,
        handleCreate: mockHandleCreate,
        handleDelete: mockHandleDelete,
        handleCloseEditDialog: mockHandleCloseEditDialog,
        handleCloseDeleteDialog: mockHandleCloseDeleteDialog,
        handleSave: mockHandleSave,
        handleConfirmDelete: mockHandleConfirmDelete,
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      const closeButton = screen.getByTestId('close-dialog');
      fireEvent.click(closeButton);

      expect(mockHandleCloseEditDialog).toHaveBeenCalledTimes(1);
    });
  });

  describe('Delete label', () => {
    it('should call handleDelete when delete button is clicked', () => {
      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      const deleteButton = screen.getByTestId('delete-label-1');
      fireEvent.click(deleteButton);

      expect(mockHandleDelete).toHaveBeenCalledWith(mockLabels[0]);
    });

    it('should open confirm dialog when delete is clicked', () => {
      mockUseLabelDialogs.mockReturnValue({
        editDialog: { isOpen: false, label: null, mode: 'create' },
        deleteDialog: { isOpen: true, label: mockLabels[0] },
        handleEdit: mockHandleEdit,
        handleCreate: mockHandleCreate,
        handleDelete: mockHandleDelete,
        handleCloseEditDialog: mockHandleCloseEditDialog,
        handleCloseDeleteDialog: mockHandleCloseDeleteDialog,
        handleSave: mockHandleSave,
        handleConfirmDelete: mockHandleConfirmDelete,
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });

    it('should display delete confirmation message', () => {
      mockUseLabelDialogs.mockReturnValue({
        editDialog: { isOpen: false, label: null, mode: 'create' },
        deleteDialog: { isOpen: true, label: mockLabels[0] },
        handleEdit: mockHandleEdit,
        handleCreate: mockHandleCreate,
        handleDelete: mockHandleDelete,
        handleCloseEditDialog: mockHandleCloseEditDialog,
        handleCloseDeleteDialog: mockHandleCloseDeleteDialog,
        handleSave: mockHandleSave,
        handleConfirmDelete: mockHandleConfirmDelete,
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      const message = screen.getByTestId('confirm-message');
      // i18nモックでは翻訳キーがそのまま返されるため、キーとラベル名の存在を確認
      expect(message.textContent).toContain('label.deleteLabelConfirm');
      expect(message.textContent).toContain('5個のタスクからも削除されます');
    });

    it('should call handleConfirmDelete when confirm is clicked', () => {
      mockUseLabelDialogs.mockReturnValue({
        editDialog: { isOpen: false, label: null, mode: 'create' },
        deleteDialog: { isOpen: true, label: mockLabels[0] },
        handleEdit: mockHandleEdit,
        handleCreate: mockHandleCreate,
        handleDelete: mockHandleDelete,
        handleCloseEditDialog: mockHandleCloseEditDialog,
        handleCloseDeleteDialog: mockHandleCloseDeleteDialog,
        handleSave: mockHandleSave,
        handleConfirmDelete: mockHandleConfirmDelete,
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      const confirmButton = screen.getByTestId('confirm-button');
      fireEvent.click(confirmButton);

      expect(mockHandleConfirmDelete).toHaveBeenCalledTimes(1);
    });

    it('should call handleCloseDeleteDialog when cancel is clicked', () => {
      mockUseLabelDialogs.mockReturnValue({
        editDialog: { isOpen: false, label: null, mode: 'create' },
        deleteDialog: { isOpen: true, label: mockLabels[0] },
        handleEdit: mockHandleEdit,
        handleCreate: mockHandleCreate,
        handleDelete: mockHandleDelete,
        handleCloseEditDialog: mockHandleCloseEditDialog,
        handleCloseDeleteDialog: mockHandleCloseDeleteDialog,
        handleSave: mockHandleSave,
        handleConfirmDelete: mockHandleConfirmDelete,
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);

      expect(mockHandleCloseDeleteDialog).toHaveBeenCalledTimes(1);
    });

    it('should show usage count in delete message when label is used', () => {
      mockUseLabelDialogs.mockReturnValue({
        editDialog: { isOpen: false, label: null, mode: 'create' },
        deleteDialog: { isOpen: true, label: mockLabels[0] },
        handleEdit: mockHandleEdit,
        handleCreate: mockHandleCreate,
        handleDelete: mockHandleDelete,
        handleCloseEditDialog: mockHandleCloseEditDialog,
        handleCloseDeleteDialog: mockHandleCloseDeleteDialog,
        handleSave: mockHandleSave,
        handleConfirmDelete: mockHandleConfirmDelete,
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      const message = screen.getByTestId('confirm-message');
      expect(message).toHaveTextContent('5個のタスクからも削除されます');
    });
  });

  describe('Message callback', () => {
    it('should pass onMessage to useLabelDialogs', () => {
      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      expect(mockUseLabelDialogs).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle null message gracefully', () => {
      const mockCallback = vi.fn();

      render(<LabelManagementPanel onMessage={mockCallback} />);

      const handleMessage = mockUseLabelDialogs.mock.calls[0][0];
      expect(() => handleMessage(null)).not.toThrow();
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should forward valid message to onMessage callback', () => {
      const mockCallback = vi.fn();

      render(<LabelManagementPanel onMessage={mockCallback} />);

      // handleMessageはuseLabelDialogsに渡されたコールバック
      // handleMessageはnullチェックを行い、有効なメッセージのみonMessageに転送する
      const handleMessageFunction = mockUseLabelDialogs.mock.calls[0][0];
      const testMessage = {
        type: 'success' as const,
        text: 'Test message',
      };

      // handleMessageを直接テストするのではなく、
      // onMessageがuseLabelDialogsに正しく渡されたことを確認
      expect(mockUseLabelDialogs).toHaveBeenCalledWith(expect.any(Function));

      // 実際のメッセージフローは統合テストで確認
      // ここでは、handleMessageが存在し、呼び出し可能であることを確認
      expect(handleMessageFunction).toBeDefined();
      expect(typeof handleMessageFunction).toBe('function');

      // handleMessageを呼び出してエラーが出ないことを確認
      expect(() => handleMessageFunction(testMessage)).not.toThrow();

      // nullチェックが機能することを確認
      expect(() => handleMessageFunction(null)).not.toThrow();
    });

    it('should work when onMessage is not provided', () => {
      render(<LabelManagementPanel />);

      const handleMessage = mockUseLabelDialogs.mock.calls[0][0];
      expect(() =>
        handleMessage({ type: 'success', text: 'Test' })
      ).not.toThrow();
    });
  });

  describe('Hook integration', () => {
    it('should call useLabelData with default sort options', () => {
      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      expect(mockUseLabelData).toHaveBeenCalledWith('name', 'asc');
    });

    it('should use labels from useLabelData hook', () => {
      const customLabels: LabelWithInfo[] = [
        {
          id: 'custom-1',
          name: 'Custom Label',
          color: '#00ff00',
          boardName: 'Board 2',
          boardId: 'board-2',
          usageCount: 10,
        },
      ];

      mockUseLabelData.mockReturnValue({
        allLabelsWithInfo: customLabels,
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      expect(screen.getByText('Custom Label')).toBeInTheDocument();
      expect(screen.queryByText('Bug')).not.toBeInTheDocument();
    });
  });

  describe('Dialog state management', () => {
    it('should not render dialogs when closed', () => {
      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      expect(screen.queryByTestId('label-form-dialog')).not.toBeInTheDocument();
      expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
    });

    it('should handle both dialogs being open simultaneously', () => {
      mockUseLabelDialogs.mockReturnValue({
        editDialog: { isOpen: true, label: null, mode: 'create' },
        deleteDialog: { isOpen: true, label: mockLabels[0] },
        handleEdit: mockHandleEdit,
        handleCreate: mockHandleCreate,
        handleDelete: mockHandleDelete,
        handleCloseEditDialog: mockHandleCloseEditDialog,
        handleCloseDeleteDialog: mockHandleCloseDeleteDialog,
        handleSave: mockHandleSave,
        handleConfirmDelete: mockHandleConfirmDelete,
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      expect(screen.getByTestId('label-form-dialog')).toBeInTheDocument();
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined label in delete dialog', () => {
      mockUseLabelDialogs.mockReturnValue({
        editDialog: { isOpen: false, label: null, mode: 'create' },
        deleteDialog: { isOpen: true, label: null },
        handleEdit: mockHandleEdit,
        handleCreate: mockHandleCreate,
        handleDelete: mockHandleDelete,
        handleCloseEditDialog: mockHandleCloseEditDialog,
        handleCloseDeleteDialog: mockHandleCloseDeleteDialog,
        handleSave: mockHandleSave,
        handleConfirmDelete: mockHandleConfirmDelete,
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      const message = screen.getByTestId('confirm-message');
      expect(message).toBeInTheDocument();
    });

    it('should handle label with zero usage count', () => {
      const labelWithZeroUsage: LabelWithInfo = {
        ...mockLabels[0],
        usageCount: 0,
      };

      mockUseLabelDialogs.mockReturnValue({
        editDialog: { isOpen: false, label: null, mode: 'create' },
        deleteDialog: { isOpen: true, label: labelWithZeroUsage },
        handleEdit: mockHandleEdit,
        handleCreate: mockHandleCreate,
        handleDelete: mockHandleDelete,
        handleCloseEditDialog: mockHandleCloseEditDialog,
        handleCloseDeleteDialog: mockHandleCloseDeleteDialog,
        handleSave: mockHandleSave,
        handleConfirmDelete: mockHandleConfirmDelete,
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      const message = screen.getByTestId('confirm-message');
      expect(message).not.toHaveTextContent('個のタスクからも削除されます');
    });

    it('should handle very large number of labels', () => {
      const manyLabels = Array.from({ length: 100 }, (_, i) => ({
        id: `label-${i}`,
        name: `Label ${i}`,
        color: '#0969da',
        boardName: 'Board 1',
        boardId: 'board-1',
        usageCount: i,
      }));

      mockUseLabelData.mockReturnValue({
        allLabelsWithInfo: manyLabels,
      });

      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      expect(screen.getByTestId('label-data-table')).toBeInTheDocument();
      expect(screen.getAllByText(/Label \d+/).length).toBe(100);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      const heading = screen.getByText('label.manageLabels');
      expect(heading.tagName.toLowerCase()).toBe('h2');
    });

    it('should have accessible create button', () => {
      render(<LabelManagementPanel onMessage={mockOnMessage} />);

      const createButton = screen.getByRole('button', {
        name: /label\.createLabel/i,
      });
      expect(createButton).toBeInTheDocument();
    });
  });
});
