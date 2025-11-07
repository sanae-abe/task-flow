/**
 * UnifiedForm component tests
 * 統合フォームコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UnifiedForm from './UnifiedForm';
import type { FormFieldConfig } from '../../../types/unified-form';

// Mock child components
vi.mock('./UnifiedFormField', () => ({
  default: ({
    id,
    name,
    type,
    label,
    value,
    onChange,
    onBlur,
    onKeyDown,
    _error,
    touched,
    disabled,
  }: any) => (
    <div data-testid={`form-field-${id}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        disabled={disabled}
        data-testid={`input-${id}`}
      />
      {touched && _error && <span data-testid={`error-${id}`}>{_error}</span>}
    </div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, variant, disabled }: any) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-testid={`button-${children}`}
    >
      {children}
    </button>
  ),
}));

// Mock useUnifiedForm hook
const mockUseUnifiedForm = vi.fn();
vi.mock('../../../hooks/useUnifiedForm', () => ({
  useUnifiedForm: (fields: any, initialValues: any) =>
    mockUseUnifiedForm(fields, initialValues),
}));

describe('UnifiedForm', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>;
  let mockOnCancel: ReturnType<typeof vi.fn>;
  let mockFormState: any;
  let mockFields: FormFieldConfig[];

  beforeEach(() => {
    mockOnSubmit = vi.fn();
    mockOnCancel = vi.fn();

    mockFields = [
      {
        id: 'name',
        name: 'name',
        type: 'text',
        label: 'Name',
        value: '',
        onChange: vi.fn(),
      },
      {
        id: 'email',
        name: 'email',
        type: 'email',
        label: 'Email',
        value: '',
        onChange: vi.fn(),
      },
    ];

    mockFormState = {
      state: {
        values: { name: '', email: '' },
        errors: {},
        touched: {},
        isValid: true,
        isSubmitting: false,
      },
      setValue: vi.fn(),
      setTouched: vi.fn(),
      validateField: vi.fn(),
      handleSubmit: vi.fn(fn => (e?: any) => {
        e?.preventDefault?.();
        fn(mockFormState.state.values);
      }),
      getFieldError: vi.fn(() => null),
    };

    mockUseUnifiedForm.mockReturnValue(mockFormState);
  });

  describe('Rendering', () => {
    it('should render form element', () => {
      const { container } = render(
        <UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />
      );

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      expect(screen.getByTestId('form-field-name')).toBeInTheDocument();
      expect(screen.getByTestId('form-field-email')).toBeInTheDocument();
    });

    it('should render submit button with default text', () => {
      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      expect(screen.getByTestId('button-保存')).toBeInTheDocument();
    });

    it('should render submit button with custom text', () => {
      render(
        <UnifiedForm
          fields={mockFields}
          onSubmit={mockOnSubmit}
          submitText='送信'
        />
      );

      expect(screen.getByTestId('button-送信')).toBeInTheDocument();
    });

    it('should render cancel button by default', () => {
      render(
        <UnifiedForm
          fields={mockFields}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByTestId('button-キャンセル')).toBeInTheDocument();
    });

    it('should render cancel button with custom text', () => {
      render(
        <UnifiedForm
          fields={mockFields}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          cancelText='閉じる'
        />
      );

      expect(screen.getByTestId('button-閉じる')).toBeInTheDocument();
    });

    it('should not render cancel button when showCancelButton is false', () => {
      render(
        <UnifiedForm
          fields={mockFields}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          showCancelButton={false}
        />
      );

      expect(screen.queryByTestId('button-キャンセル')).not.toBeInTheDocument();
      // Submit button should still be present
      expect(screen.getByTestId('button-保存')).toBeInTheDocument();
    });

    it('should not render cancel button when onCancel is not provided', () => {
      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      expect(screen.queryByTestId('button-キャンセル')).not.toBeInTheDocument();
      // Submit button should still be present
      expect(screen.getByTestId('button-保存')).toBeInTheDocument();
    });

    it('should render children when provided', () => {
      render(
        <UnifiedForm fields={mockFields} onSubmit={mockOnSubmit}>
          <div data-testid='custom-content'>Custom Content</div>
        </UnifiedForm>
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <UnifiedForm
          fields={mockFields}
          onSubmit={mockOnSubmit}
          className='custom-class'
        />
      );

      const form = container.querySelector('form');
      expect(form).toHaveClass('custom-class');
    });

    it('should set autocomplete to on by default', () => {
      const { container } = render(
        <UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />
      );

      const form = container.querySelector('form');
      expect(form).toHaveAttribute('autocomplete', 'on');
    });

    it('should set autocomplete to off when specified', () => {
      const { container } = render(
        <UnifiedForm
          fields={mockFields}
          onSubmit={mockOnSubmit}
          autoComplete={false}
        />
      );

      const form = container.querySelector('form');
      expect(form).toHaveAttribute('autocomplete', 'off');
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit when form is submitted', () => {
      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByTestId('button-保存');
      fireEvent.click(submitButton);

      expect(mockFormState.handleSubmit).toHaveBeenCalled();
    });

    it('should prevent default form submission', () => {
      const { container } = render(
        <UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />
      );

      const form = container.querySelector('form')!;
      const submitEvent = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

      fireEvent(form, submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should disable submit button when form is invalid', () => {
      mockFormState.state.isValid = false;

      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByTestId('button-保存');
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when form is submitting', () => {
      mockFormState.state.isSubmitting = true;

      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByTestId('button-保存');
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when disabled prop is true', () => {
      render(
        <UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} disabled />
      );

      const submitButton = screen.getByTestId('button-保存');
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Field Change Handling', () => {
    it('should call setValue when field value changes', () => {
      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByTestId('input-name');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      expect(mockFormState.setValue).toHaveBeenCalledWith('name', 'John Doe');
    });

    it('should call field onChange when provided', () => {
      const fieldOnChange = vi.fn();
      const fieldsWithOnChange = [
        {
          ...mockFields[0]!,
          onChange: fieldOnChange,
        },
        mockFields[1]!,
      ];

      render(
        <UnifiedForm fields={fieldsWithOnChange} onSubmit={mockOnSubmit} />
      );

      const nameInput = screen.getByTestId('input-name');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      expect(fieldOnChange).toHaveBeenCalledWith('John Doe');
    });

    it('should handle multiple field changes', () => {
      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByTestId('input-name');
      const emailInput = screen.getByTestId('input-email');

      fireEvent.change(nameInput, { target: { value: 'John' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      expect(mockFormState.setValue).toHaveBeenCalledWith('name', 'John');
      expect(mockFormState.setValue).toHaveBeenCalledWith(
        'email',
        'john@example.com'
      );
    });
  });

  describe('Field Blur Handling', () => {
    it('should set field as touched on blur', () => {
      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByTestId('input-name');
      fireEvent.blur(nameInput);

      expect(mockFormState.setTouched).toHaveBeenCalledWith('name', true);
    });

    it('should validate field on blur by default', () => {
      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByTestId('input-name');
      fireEvent.blur(nameInput);

      expect(mockFormState.validateField).toHaveBeenCalledWith('name');
    });

    it('should not validate field on blur when validateOnBlur is false', () => {
      render(
        <UnifiedForm
          fields={mockFields}
          onSubmit={mockOnSubmit}
          validateOnBlur={false}
        />
      );

      const nameInput = screen.getByTestId('input-name');
      fireEvent.blur(nameInput);

      expect(mockFormState.validateField).not.toHaveBeenCalled();
    });

    it('should handle blur on multiple fields', () => {
      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByTestId('input-name');
      const emailInput = screen.getByTestId('input-email');

      fireEvent.blur(nameInput);
      fireEvent.blur(emailInput);

      expect(mockFormState.setTouched).toHaveBeenCalledWith('name', true);
      expect(mockFormState.setTouched).toHaveBeenCalledWith('email', true);
    });
  });

  describe('Field KeyDown Handling', () => {
    it('should call field onKeyDown when provided', () => {
      const fieldOnKeyDown = vi.fn();
      const fieldsWithKeyDown = [
        {
          ...mockFields[0]!,
          onKeyDown: fieldOnKeyDown,
        },
        mockFields[1]!,
      ];

      render(
        <UnifiedForm fields={fieldsWithKeyDown} onSubmit={mockOnSubmit} />
      );

      const nameInput = screen.getByTestId('input-name');
      fireEvent.keyDown(nameInput, { key: 'Enter' });

      expect(fieldOnKeyDown).toHaveBeenCalled();
    });

    it('should not throw when field onKeyDown is not provided', () => {
      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByTestId('input-name');

      expect(() => {
        fireEvent.keyDown(nameInput, { key: 'Enter' });
      }).not.toThrow();
    });
  });

  describe('Cancel Handling', () => {
    it('should call onCancel when cancel button is clicked', () => {
      render(
        <UnifiedForm
          fields={mockFields}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByTestId('button-キャンセル');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should not render cancel button when onCancel is not provided', () => {
      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      // No cancel button should be rendered
      expect(screen.queryByTestId('button-キャンセル')).not.toBeInTheDocument();
      // Submit button should still be present
      expect(screen.getByTestId('button-保存')).toBeInTheDocument();
    });
  });

  describe('Field State Management', () => {
    it('should pass field values from state', () => {
      mockFormState.state.values = { name: 'John', email: 'john@example.com' };

      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByTestId('input-name') as HTMLInputElement;
      const emailInput = screen.getByTestId('input-email') as HTMLInputElement;

      expect(nameInput.value).toBe('John');
      expect(emailInput.value).toBe('john@example.com');
    });

    it('should pass field errors from state', () => {
      mockFormState.state.touched = { name: true };
      mockFormState.getFieldError.mockImplementation((name: string) =>
        name === 'name' ? 'Name is required' : null
      );

      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      expect(screen.getByTestId('error-name')).toHaveTextContent(
        'Name is required'
      );
    });

    it('should pass touched state to fields', () => {
      mockFormState.state.touched = { name: true, email: false };

      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      // Errors should only show for touched fields
      mockFormState.getFieldError.mockImplementation(() => 'Error');
      expect(screen.queryByTestId('error-email')).not.toBeInTheDocument();
    });

    it('should disable all fields when disabled prop is true', () => {
      render(
        <UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} disabled />
      );

      const nameInput = screen.getByTestId('input-name');
      const emailInput = screen.getByTestId('input-email');

      expect(nameInput).toBeDisabled();
      expect(emailInput).toBeDisabled();
    });

    it('should disable field when field.disabled is true', () => {
      const fieldsWithDisabled = [
        {
          ...mockFields[0]!,
          disabled: true,
        },
        mockFields[1]!,
      ];

      render(
        <UnifiedForm fields={fieldsWithDisabled} onSubmit={mockOnSubmit} />
      );

      const nameInput = screen.getByTestId('input-name');
      const emailInput = screen.getByTestId('input-email');

      expect(nameInput).toBeDisabled();
      expect(emailInput).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty fields array', () => {
      render(<UnifiedForm fields={[]} onSubmit={mockOnSubmit} />);

      expect(screen.getByTestId('button-保存')).toBeInTheDocument();
    });

    it('should handle undefined initialValues', () => {
      render(
        <UnifiedForm
          fields={mockFields}
          onSubmit={mockOnSubmit}
          initialValues={undefined}
        />
      );

      expect(mockUseUnifiedForm).toHaveBeenCalledWith(mockFields, undefined);
    });

    it('should re-render when fields change', () => {
      const { rerender } = render(
        <UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />
      );

      const newFields = [
        ...mockFields,
        {
          id: 'phone',
          name: 'phone',
          type: 'tel',
          label: 'Phone',
          value: '',
          onChange: vi.fn(),
        },
      ];

      rerender(<UnifiedForm fields={newFields} onSubmit={mockOnSubmit} />);

      expect(screen.getByTestId('form-field-phone')).toBeInTheDocument();
    });

    it('should handle form submission with complex field values', () => {
      mockFormState.state.values = {
        name: 'John Doe',
        email: 'john@example.com',
        nested: { value: 'test' },
      };

      render(<UnifiedForm fields={mockFields} onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByTestId('button-保存');
      fireEvent.click(submitButton);

      expect(mockFormState.handleSubmit).toHaveBeenCalled();
    });

    it('should update when initialValues prop changes', () => {
      const initialValues = { name: 'Initial', email: 'initial@example.com' };

      const { rerender } = render(
        <UnifiedForm
          fields={mockFields}
          onSubmit={mockOnSubmit}
          initialValues={initialValues}
        />
      );

      // Verify initial values were passed to useUnifiedForm
      expect(mockUseUnifiedForm).toHaveBeenCalledWith(
        mockFields,
        initialValues
      );

      const updatedValues = { name: 'Updated', email: 'updated@example.com' };

      rerender(
        <UnifiedForm
          fields={mockFields}
          onSubmit={mockOnSubmit}
          initialValues={updatedValues}
        />
      );

      // Verify updated values were passed to useUnifiedForm
      expect(mockUseUnifiedForm).toHaveBeenCalledWith(
        mockFields,
        updatedValues
      );
    });
  });

  describe('Integration', () => {
    it('should integrate with useUnifiedForm hook', () => {
      const initialValues = { name: 'Initial', email: 'initial@example.com' };

      render(
        <UnifiedForm
          fields={mockFields}
          onSubmit={mockOnSubmit}
          initialValues={initialValues}
        />
      );

      expect(mockUseUnifiedForm).toHaveBeenCalledWith(
        mockFields,
        initialValues
      );
    });

    it('should handle complete form lifecycle', () => {
      render(
        <UnifiedForm
          fields={mockFields}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Change field value
      const nameInput = screen.getByTestId('input-name');
      fireEvent.change(nameInput, { target: { value: 'John' } });

      // Blur field
      fireEvent.blur(nameInput);

      // Submit form
      const submitButton = screen.getByTestId('button-保存');
      fireEvent.click(submitButton);

      expect(mockFormState.setValue).toHaveBeenCalled();
      expect(mockFormState.setTouched).toHaveBeenCalled();
      expect(mockFormState.handleSubmit).toHaveBeenCalled();
    });
  });
});
