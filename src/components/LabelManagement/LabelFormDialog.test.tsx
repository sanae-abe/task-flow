/**
 * LabelFormDialog component tests
 * ラベルフォームダイアログコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LabelFormDialog from './LabelFormDialog';
import type { Label } from '../../types';

// Mock child components
vi.mock('../shared/Dialog/UnifiedDialog', () => ({
  default: ({ isOpen, _onClose, title, children, actions }: any) =>
    isOpen ? (
      <div data-testid='unified-dialog'>
        <h2>{title}</h2>
        <div data-testid='dialog-content'>{children}</div>
        <div data-testid='dialog-actions'>
          {actions.map((action: any, index: number) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              data-variant={action.variant}
              data-testid={`action-${action.label}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    ) : null,
}));

vi.mock('../shared/Form/UnifiedFormField', () => ({
  default: ({
    id,
    name,
    type,
    label,
    value,
    onChange,
    onBlur,
    _error,
    touched,
    disabled,
    customComponent,
  }: any) => (
    <div data-testid={`form-field-${id}`}>
      <label htmlFor={id}>{label}</label>
      {customComponent || (
        <input
          id={id}
          name={name}
          type={type}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          data-testid={`input-${id}`}
        />
      )}
      {touched && _error && <span data-testid={`error-${id}`}>{_error}</span>}
    </div>
  ),
}));

vi.mock('../LabelChip', () => ({
  default: ({ label }: any) => (
    <div data-testid='label-chip' data-label-name={label.name}>
      {label.name}
    </div>
  ),
}));

// Mock contexts
const mockGetAllLabels = vi.fn();
vi.mock('../../contexts/LabelContext', () => ({
  useLabel: () => ({
    getAllLabels: mockGetAllLabels,
  }),
}));

const mockBoardState = {
  boards: [
    { id: 'board-1', title: 'Board 1' },
    { id: 'board-2', title: 'Board 2' },
  ],
};

vi.mock('../../contexts/BoardContext', () => ({
  useBoard: () => ({
    state: mockBoardState,
  }),
}));

// Mock hooks
const mockUseUnifiedForm = vi.fn();
vi.mock('../../hooks/useUnifiedForm', () => ({
  useUnifiedForm: (fields: any, initialValues: any) =>
    mockUseUnifiedForm(fields, initialValues),
}));

describe('LabelFormDialog', () => {
  let mockOnClose: ReturnType<typeof vi.fn>;
  let mockOnSave: ReturnType<typeof vi.fn>;
  let mockFormState: any;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockOnSave = vi.fn();
    mockGetAllLabels.mockReturnValue([]);

    mockFormState = {
      state: {
        values: { name: '', color: '#0969da' },
        errors: {},
        touched: {},
        isValid: true,
        isSubmitting: false,
      },
      setValue: vi.fn(),
      setTouched: vi.fn(),
      setError: vi.fn(),
      handleSubmit: vi.fn(fn => () => fn(mockFormState.state.values)),
      getFieldError: vi.fn(() => null),
    };

    mockUseUnifiedForm.mockReturnValue(mockFormState);
  });

  describe('Rendering - Create Mode', () => {
    it('should render create dialog when open', () => {
      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      expect(screen.getByText('ラベルを作成')).toBeInTheDocument();
      expect(screen.getByTestId('unified-dialog')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(
        <LabelFormDialog isOpen={false} onClose={mockOnClose} mode='create' />
      );

      expect(screen.queryByTestId('unified-dialog')).not.toBeInTheDocument();
    });

    it('should render all form fields in create mode', () => {
      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      expect(screen.getByTestId('form-field-preview')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-name')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-color')).toBeInTheDocument();
    });

    it('should render preview field with label chip', () => {
      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      expect(screen.getByText('プレビュー')).toBeInTheDocument();
      expect(screen.getByTestId('label-chip')).toBeInTheDocument();
    });

    it('should render with default color value', () => {
      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      expect(mockFormState.state.values.color).toBe('#0969da');
    });

    it('should render create button', () => {
      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      expect(screen.getByTestId('action-作成')).toBeInTheDocument();
    });

    it('should render cancel button', () => {
      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      expect(screen.getByTestId('action-キャンセル')).toBeInTheDocument();
    });

    it('should render board selection field when enableBoardSelection is true', () => {
      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          mode='create'
          enableBoardSelection
        />
      );

      // Check if boardId field is included in the form fields
      const formFields = mockUseUnifiedForm.mock.calls[0][0];
      const hasBoardField = formFields.some(
        (field: any) => field.id === 'boardId'
      );
      expect(hasBoardField).toBe(true);
    });

    it('should not render board selection field when enableBoardSelection is false', () => {
      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          mode='create'
          enableBoardSelection={false}
        />
      );

      const formFields = mockUseUnifiedForm.mock.calls[0][0];
      const hasBoardField = formFields.some(
        (field: any) => field.id === 'boardId'
      );
      expect(hasBoardField).toBe(false);
    });
  });

  describe('Rendering - Edit Mode', () => {
    const mockLabel: Label = {
      id: 'label-1',
      name: 'Bug',
      color: '#d1242f',
    };

    it('should render edit dialog when open', () => {
      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          mode='edit'
          label={mockLabel}
        />
      );

      expect(screen.getByText('ラベルを編集')).toBeInTheDocument();
    });

    it('should render with label values in edit mode', () => {
      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          mode='edit'
          label={mockLabel}
        />
      );

      const initialValues = mockUseUnifiedForm.mock.calls[0][1];
      expect(initialValues.name).toBe('Bug');
      expect(initialValues.color).toBe('#d1242f');
    });

    it('should render update button in edit mode', () => {
      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          mode='edit'
          label={mockLabel}
        />
      );

      expect(screen.getByTestId('action-更新')).toBeInTheDocument();
    });

    it('should not render board selection field in edit mode', () => {
      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          mode='edit'
          label={mockLabel}
          enableBoardSelection
        />
      );

      const formFields = mockUseUnifiedForm.mock.calls[0][0];
      const hasBoardField = formFields.some(
        (field: any) => field.id === 'boardId'
      );
      expect(hasBoardField).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should validate required name field', () => {
      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      const formFields = mockUseUnifiedForm.mock.calls[0][0];
      const nameField = formFields.find((field: any) => field.id === 'name');
      expect(nameField.validation.required).toBe(true);
    });

    it('should validate name min length', () => {
      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      const formFields = mockUseUnifiedForm.mock.calls[0][0];
      const nameField = formFields.find((field: any) => field.id === 'name');
      expect(nameField.validation.minLength).toBe(2);
    });

    it('should validate name max length', () => {
      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      const formFields = mockUseUnifiedForm.mock.calls[0][0];
      const nameField = formFields.find((field: any) => field.id === 'name');
      expect(nameField.validation.maxLength).toBe(50);
    });

    it('should check for duplicate label names in create mode', () => {
      mockGetAllLabels.mockReturnValue([
        { id: 'label-1', name: 'Existing Label', color: '#0969da' },
      ]);

      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      const formFields = mockUseUnifiedForm.mock.calls[0][0];
      const nameField = formFields.find((field: any) => field.id === 'name');
      const validationResult = nameField.validation.custom('Existing Label');

      expect(validationResult).toBe('同じ名前のラベルが既に存在します');
    });

    it('should allow same name in edit mode for the same label', () => {
      const mockLabel: Label = {
        id: 'label-1',
        name: 'Bug',
        color: '#d1242f',
      };

      mockGetAllLabels.mockReturnValue([mockLabel]);

      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          mode='edit'
          label={mockLabel}
        />
      );

      const formFields = mockUseUnifiedForm.mock.calls[0][0];
      const nameField = formFields.find((field: any) => field.id === 'name');
      const validationResult = nameField.validation.custom('Bug');

      expect(validationResult).toBeNull();
    });

    it('should trim whitespace when checking duplicates', () => {
      mockGetAllLabels.mockReturnValue([
        { id: 'label-1', name: 'Existing Label', color: '#0969da' },
      ]);

      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      const formFields = mockUseUnifiedForm.mock.calls[0][0];
      const nameField = formFields.find((field: any) => field.id === 'name');
      const validationResult =
        nameField.validation.custom('  Existing Label  ');

      expect(validationResult).toBe('同じ名前のラベルが既に存在します');
    });

    it('should perform case-insensitive duplicate check', () => {
      mockGetAllLabels.mockReturnValue([
        { id: 'label-1', name: 'Existing Label', color: '#0969da' },
      ]);

      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      const formFields = mockUseUnifiedForm.mock.calls[0][0];
      const nameField = formFields.find((field: any) => field.id === 'name');
      const validationResult = nameField.validation.custom('EXISTING LABEL');

      expect(validationResult).toBe('同じ名前のラベルが既に存在します');
    });
  });

  describe('Form Submission', () => {
    it('should call onSave with form data on submit', async () => {
      mockFormState.state.values = {
        name: 'New Label',
        color: '#0969da',
      };

      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
          mode='create'
        />
      );

      const createButton = screen.getByTestId('action-作成');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          name: 'New Label',
          color: '#0969da',
          boardId: undefined,
        });
      });
    });

    it('should close dialog after successful save', async () => {
      mockFormState.state.values = {
        name: 'New Label',
        color: '#0969da',
      };

      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
          mode='create'
        />
      );

      const createButton = screen.getByTestId('action-作成');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should trim label name before saving', async () => {
      mockFormState.state.values = {
        name: '  Trimmed Label  ',
        color: '#0969da',
      };

      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
          mode='create'
        />
      );

      const createButton = screen.getByTestId('action-作成');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          name: 'Trimmed Label',
          color: '#0969da',
          boardId: undefined,
        });
      });
    });

    it('should include boardId when board selection is enabled', async () => {
      mockFormState.state.values = {
        name: 'New Label',
        color: '#0969da',
        boardId: 'board-1',
      };

      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
          mode='create'
          enableBoardSelection
        />
      );

      const createButton = screen.getByTestId('action-作成');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          name: 'New Label',
          color: '#0969da',
          boardId: 'board-1',
        });
      });
    });

    it('should handle save errors gracefully', async () => {
      mockOnSave.mockImplementation(() => {
        throw new Error('Save failed');
      });

      mockFormState.state.values = {
        name: 'New Label',
        color: '#0969da',
      };

      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
          mode='create'
        />
      );

      const createButton = screen.getByTestId('action-作成');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(mockFormState.setError).toHaveBeenCalledWith(
          'name',
          'ラベルの保存に失敗しました'
        );
      });
    });

    it('should disable submit button when name is empty', () => {
      mockFormState.state.values = {
        name: '',
        color: '#0969da',
      };

      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      const createButton = screen.getByTestId('action-作成');
      expect(createButton).toBeDisabled();
    });

    it('should disable submit button when submitting', () => {
      mockFormState.state.isSubmitting = true;

      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      const createButton = screen.getByTestId('action-作成');
      expect(createButton).toBeDisabled();
    });
  });

  describe('Cancel Behavior', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      const cancelButton = screen.getByTestId('action-キャンセル');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should submit form on Ctrl+Enter', () => {
      mockFormState.state.values = {
        name: 'New Label',
        color: '#0969da',
      };
      mockFormState.state.isValid = true;

      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
          mode='create'
        />
      );

      const dialogContent = screen.getByTestId('dialog-content');
      fireEvent.keyDown(dialogContent, { key: 'Enter', ctrlKey: true });

      expect(mockFormState.handleSubmit).toHaveBeenCalled();
    });

    it('should submit form on Cmd+Enter (Mac)', () => {
      mockFormState.state.values = {
        name: 'New Label',
        color: '#0969da',
      };
      mockFormState.state.isValid = true;

      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
          mode='create'
        />
      );

      const dialogContent = screen.getByTestId('dialog-content');
      fireEvent.keyDown(dialogContent, { key: 'Enter', metaKey: true });

      expect(mockFormState.handleSubmit).toHaveBeenCalled();
    });

    it('should not submit on Enter without Ctrl/Cmd', () => {
      mockFormState.state.values = {
        name: 'New Label',
        color: '#0969da',
      };

      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
          mode='create'
        />
      );

      const dialogContent = screen.getByTestId('dialog-content');
      fireEvent.keyDown(dialogContent, { key: 'Enter' });

      expect(mockFormState.handleSubmit).not.toHaveBeenCalled();
    });

    it('should not submit when form is invalid', () => {
      mockFormState.state.isValid = false;

      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
          mode='create'
        />
      );

      const dialogContent = screen.getByTestId('dialog-content');
      fireEvent.keyDown(dialogContent, { key: 'Enter', ctrlKey: true });

      expect(mockFormState.handleSubmit).not.toHaveBeenCalled();
    });

    it('should not submit when already submitting', () => {
      mockFormState.state.isSubmitting = true;

      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          onSave={mockOnSave}
          mode='create'
        />
      );

      const dialogContent = screen.getByTestId('dialog-content');
      fireEvent.keyDown(dialogContent, { key: 'Enter', ctrlKey: true });

      expect(mockFormState.handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Preview Updates', () => {
    it('should update preview when form values change', () => {
      const { rerender } = render(
        <LabelFormDialog isOpen onClose={mockOnClose} mode='create' />
      );

      mockFormState.state.values = {
        name: 'Updated Label',
        color: '#ff0000',
      };

      rerender(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      const labelChip = screen.getByTestId('label-chip');
      expect(labelChip).toHaveAttribute('data-label-name', 'Updated Label');
    });

    it('should show default preview text when name is empty', () => {
      mockFormState.state.values = {
        name: '',
        color: '#0969da',
      };

      render(<LabelFormDialog isOpen onClose={mockOnClose} mode='create' />);

      const labelChip = screen.getByTestId('label-chip');
      expect(labelChip).toHaveAttribute('data-label-name', 'ラベル名');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined label in edit mode', () => {
      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          mode='edit'
          label={undefined}
        />
      );

      expect(screen.getByText('ラベルを編集')).toBeInTheDocument();
    });

    it('should handle empty boards array', () => {
      mockBoardState.boards = [];

      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          mode='create'
          enableBoardSelection
        />
      );

      const initialValues = mockUseUnifiedForm.mock.calls[0][1];
      expect(initialValues.boardId).toBeUndefined();
    });

    it('should use first board as default when board selection is enabled', () => {
      mockBoardState.boards = [
        { id: 'board-1', title: 'Board 1' },
        { id: 'board-2', title: 'Board 2' },
      ];

      render(
        <LabelFormDialog
          isOpen
          onClose={mockOnClose}
          mode='create'
          enableBoardSelection
        />
      );

      const initialValues = mockUseUnifiedForm.mock.calls[0][1];
      expect(initialValues.boardId).toBe('board-1');
    });
  });
});
