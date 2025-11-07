/**
 * SelectField component tests
 * セレクトフィールドコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectField } from './SelectField';

// Mock NativeSelect components
vi.mock('@/components/ui/native-select', () => ({
  NativeSelect: ({ children, ...props }: any) => (
    <select {...props} data-testid='select-component'>
      {children}
    </select>
  ),
  NativeSelectOption: ({ children, ...props }: any) => (
    <option {...props}>{children}</option>
  ),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

// Mock formHelpers
vi.mock('../../../../utils/formHelpers', () => ({
  toStringValue: (value: any) => String(value ?? ''),
}));

describe('SelectField', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockOnBlur: ReturnType<typeof vi.fn>;
  let mockOnFocus: ReturnType<typeof vi.fn>;

  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnBlur = vi.fn();
    mockOnFocus = vi.fn();
  });

  describe('Rendering', () => {
    it('should render select element', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      expect(screen.getByTestId('select-component')).toBeInTheDocument();
    });

    it('should render with correct id and name', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      const select = screen.getByTestId('select-component');
      expect(select).toHaveAttribute('id', 'test-field');
      expect(select).toHaveAttribute('name', 'test');
    });

    it('should render all options', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('should render placeholder option', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
          placeholder='Select an option'
        />
      );

      expect(screen.getByText('Select an option')).toBeInTheDocument();
    });

    it('should set placeholder option value to empty string', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
          placeholder='Select an option'
        />
      );

      const placeholderOption = screen.getByText(
        'Select an option'
      ) as HTMLOptionElement;
      expect(placeholderOption.value).toBe('');
    });

    it('should render with selected value', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value='option2'
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      const select = screen.getByTestId(
        'select-component'
      ) as HTMLSelectElement;
      expect(select.value).toBe('option2');
    });

    it('should handle empty value with placeholder', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
          placeholder='Select option'
        />
      );

      const select = screen.getByTestId(
        'select-component'
      ) as HTMLSelectElement;
      expect(select.value).toBe('');
    });

    it('should handle empty options array', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={[]}
        />
      );

      const select = screen.getByTestId('select-component');
      expect(select).toBeInTheDocument();
    });

    it('should not render placeholder when not provided', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });
  });

  describe('AutoFocus', () => {
    it('should autofocus when autoFocus is true', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
          autoFocus
        />
      );

      const select = screen.getByTestId('select-component');
      // React 19: autofocus is handled via ref.focus(), not attribute
      expect(select).toHaveFocus();
    });

    it('should not autofocus by default', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      const select = screen.getByTestId('select-component');
      expect(select).not.toHaveAttribute('autofocus');
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
          disabled
        />
      );

      expect(screen.getByTestId('select-component')).toBeDisabled();
    });

    it('should not be disabled by default', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      expect(screen.getByTestId('select-component')).not.toBeDisabled();
    });
  });

  describe('Event Handlers', () => {
    it('should call onChange when selection changes', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      const select = screen.getByTestId('select-component');
      fireEvent.change(select, { target: { value: 'option2' } });

      expect(mockOnChange).toHaveBeenCalledWith('option2');
    });

    it('should call onBlur when select loses focus', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
          onBlur={mockOnBlur}
        />
      );

      const select = screen.getByTestId('select-component');
      fireEvent.blur(select);

      expect(mockOnBlur).toHaveBeenCalled();
    });

    it('should call onFocus when select gains focus', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
          onFocus={mockOnFocus}
        />
      );

      const select = screen.getByTestId('select-component');
      fireEvent.focus(select);

      expect(mockOnFocus).toHaveBeenCalled();
    });

    it('should not throw when optional handlers are not provided', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      const select = screen.getByTestId('select-component');

      expect(() => {
        fireEvent.blur(select);
        fireEvent.focus(select);
      }).not.toThrow();
    });
  });

  describe('Error State', () => {
    it('should not show visual error styling (handled by wrapper)', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
          _error='Field is required'
          touched
        />
      );

      // SelectField doesn't apply error styles directly
      const select = screen.getByTestId('select-component');
      expect(select).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should set aria-required when validation.required is true', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
          validation={{ required: true }}
        />
      );

      const select = screen.getByTestId('select-component');
      expect(select).toHaveAttribute('aria-required', 'true');
    });

    it('should set aria-invalid when touched and error exists', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
          _error='Field is required'
          touched
        />
      );

      const select = screen.getByTestId('select-component');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-describedby when error exists', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
          _error='Field is required'
          touched
        />
      );

      const select = screen.getByTestId('select-component');
      expect(select).toHaveAttribute('aria-describedby', 'test-field-_error');
    });

    it('should not set aria-describedby when no error', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
          touched
        />
      );

      const select = screen.getByTestId('select-component');
      expect(select).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom style object', () => {
      const customStyle = { color: 'red', fontSize: '16px' };

      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
          style={customStyle}
        />
      );

      const select = screen.getByTestId('select-component');
      // Browsers convert color names to rgb format
      expect(select).toHaveStyle({ color: 'rgb(255, 0, 0)', fontSize: '16px' });
    });

    it('should handle undefined style', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      const select = screen.getByTestId('select-component');
      // When no style prop, the style attribute is null, not empty string
      expect(select.getAttribute('style')).toBeNull();
    });

    it('should apply w-full class', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      const select = screen.getByTestId('select-component');
      expect(select).toHaveClass('w-full');
    });
  });

  describe('Options Rendering', () => {
    it('should render options with correct values', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      const option1 = screen.getByText('Option 1') as HTMLOptionElement;
      const option2 = screen.getByText('Option 2') as HTMLOptionElement;
      const option3 = screen.getByText('Option 3') as HTMLOptionElement;

      expect(option1.value).toBe('option1');
      expect(option2.value).toBe('option2');
      expect(option3.value).toBe('option3');
    });

    it('should handle options with special characters', () => {
      const specialOptions = [
        { value: 'opt-1', label: 'Option & Special' },
        { value: 'opt-2', label: 'Option < > "' },
      ];

      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={specialOptions}
        />
      );

      expect(screen.getByText('Option & Special')).toBeInTheDocument();
      expect(screen.getByText('Option < > "')).toBeInTheDocument();
    });

    it('should handle large number of options', () => {
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        value: `option-${i}`,
        label: `Option ${i}`,
      }));

      render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={manyOptions}
        />
      );

      const allOptions = screen.getAllByRole('option');
      expect(allOptions).toHaveLength(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null value with placeholder', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value={null as any}
          onChange={mockOnChange}
          options={mockOptions}
          placeholder='Select option'
        />
      );

      const select = screen.getByTestId(
        'select-component'
      ) as HTMLSelectElement;
      expect(select.value).toBe('');
    });

    it('should handle undefined value with placeholder', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value={undefined as any}
          onChange={mockOnChange}
          options={mockOptions}
          placeholder='Select option'
        />
      );

      const select = screen.getByTestId(
        'select-component'
      ) as HTMLSelectElement;
      expect(select.value).toBe('');
    });

    it('should handle value that does not exist in options', () => {
      render(
        <SelectField
          id='test-field'
          name='test'
          value='nonexistent'
          onChange={mockOnChange}
          options={mockOptions}
          placeholder='Select option'
        />
      );

      const select = screen.getByTestId(
        'select-component'
      ) as HTMLSelectElement;
      // When value doesn't exist and placeholder is provided, it defaults to empty string
      expect(select.value).toBe('');
    });

    it('should update value when prop changes', () => {
      const { rerender } = render(
        <SelectField
          id='test-field'
          name='test'
          value='option1'
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      let select = screen.getByTestId('select-component') as HTMLSelectElement;
      expect(select.value).toBe('option1');

      rerender(
        <SelectField
          id='test-field'
          name='test'
          value='option2'
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      select = screen.getByTestId('select-component') as HTMLSelectElement;
      expect(select.value).toBe('option2');
    });

    it('should update options when prop changes', () => {
      const { rerender } = render(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={mockOptions}
        />
      );

      expect(screen.getAllByRole('option')).toHaveLength(3);

      const newOptions = [
        ...mockOptions,
        { value: 'option4', label: 'Option 4' },
      ];

      rerender(
        <SelectField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          options={newOptions}
        />
      );

      expect(screen.getAllByRole('option')).toHaveLength(4);
      expect(screen.getByText('Option 4')).toBeInTheDocument();
    });
  });
});
