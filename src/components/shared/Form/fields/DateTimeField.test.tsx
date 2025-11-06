/**
 * DateTimeField component tests
 * 日時フィールドコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateTimeField } from './DateTimeField';

// Mock Input component
vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} data-testid='input-component' />,
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

// Mock formHelpers
vi.mock('../../../../utils/formHelpers', () => ({
  toStringValue: (value: any) => String(value ?? ''),
}));

describe('DateTimeField', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockOnBlur: ReturnType<typeof vi.fn>;
  let mockOnFocus: ReturnType<typeof vi.fn>;
  let mockOnKeyDown: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnBlur = vi.fn();
    mockOnFocus = vi.fn();
    mockOnKeyDown = vi.fn();
  });

  describe('Rendering - Date Type', () => {
    it('should render input element with date type', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('input-component')).toBeInTheDocument();
      expect(screen.getByTestId('input-component')).toHaveAttribute(
        'type',
        'date'
      );
    });

    it('should render with date value', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value='2025-01-15'
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('2025-01-15');
    });

    it('should handle empty date value', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('');
    });
  });

  describe('Rendering - DateTime Type', () => {
    it('should render input element with datetime-local type', () => {
      render(
        <DateTimeField
          id='datetime-field'
          name='datetime'
          type='datetime-local'
          value=''
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('input-component')).toHaveAttribute(
        'type',
        'datetime-local'
      );
    });

    it('should render with datetime value', () => {
      render(
        <DateTimeField
          id='datetime-field'
          name='datetime'
          type='datetime-local'
          value='2025-01-15T14:30'
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('2025-01-15T14:30');
    });
  });

  describe('Rendering - Time Type', () => {
    it('should render input element with time type', () => {
      render(
        <DateTimeField
          id='time-field'
          name='time'
          type='time'
          value=''
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('input-component')).toHaveAttribute(
        'type',
        'time'
      );
    });

    it('should render with time value', () => {
      render(
        <DateTimeField
          id='time-field'
          name='time'
          type='time'
          value='14:30'
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('14:30');
    });
  });

  describe('Basic Attributes', () => {
    it('should render with correct id and name', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('id', 'date-field');
      expect(input).toHaveAttribute('name', 'date');
    });

    it('should convert non-string values to string', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value={20250115}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('20250115');
    });
  });

  describe('AutoFocus', () => {
    it('should autofocus when autoFocus is true', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          autoFocus
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('autofocus');
    });

    it('should not autofocus by default', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).not.toHaveAttribute('autofocus');
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          disabled
        />
      );

      expect(screen.getByTestId('input-component')).toBeDisabled();
    });

    it('should not be disabled by default', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('input-component')).not.toBeDisabled();
    });
  });

  describe('Event Handlers', () => {
    it('should call onChange when input value changes', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component');
      fireEvent.change(input, { target: { value: '2025-01-15' } });

      expect(mockOnChange).toHaveBeenCalledWith('2025-01-15');
    });

    it('should call onBlur when input loses focus', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          onBlur={mockOnBlur}
        />
      );

      const input = screen.getByTestId('input-component');
      fireEvent.blur(input);

      expect(mockOnBlur).toHaveBeenCalled();
    });

    it('should call onFocus when input gains focus', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          onFocus={mockOnFocus}
        />
      );

      const input = screen.getByTestId('input-component');
      fireEvent.focus(input);

      expect(mockOnFocus).toHaveBeenCalled();
    });

    it('should call onKeyDown when key is pressed', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      const input = screen.getByTestId('input-component');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnKeyDown).toHaveBeenCalled();
    });

    it('should not throw when optional handlers are not provided', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component');

      expect(() => {
        fireEvent.blur(input);
        fireEvent.focus(input);
        fireEvent.keyDown(input, { key: 'Enter' });
      }).not.toThrow();
    });
  });

  describe('Error State', () => {
    it('should apply error class when touched and error exists', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          _error='Date is required'
          touched
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveClass('border-destructive');
    });

    it('should not apply error class when not touched', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          _error='Date is required'
          touched={false}
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).not.toHaveClass('border-destructive');
    });

    it('should not apply error class when no error', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          touched
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).not.toHaveClass('border-destructive');
    });
  });

  describe('Accessibility', () => {
    it('should set aria-required when validation.required is true', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          validation={{ required: true }}
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should set aria-invalid when touched and error exists', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          _error='Date is required'
          touched
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-describedby when error exists', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          _error='Date is required'
          touched
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('aria-describedby', 'date-field-_error');
    });

    it('should not set aria-describedby when no error', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          touched
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Date Input Constraints', () => {
    it('should apply step attribute', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          step={1}
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('step', '1');
    });

    it('should apply min attribute', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          min='2025-01-01'
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('min', '2025-01-01');
    });

    it('should apply max attribute', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          max='2025-12-31'
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('max', '2025-12-31');
    });

    it('should not apply step/min/max when not provided', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).not.toHaveAttribute('step');
      expect(input).not.toHaveAttribute('min');
      expect(input).not.toHaveAttribute('max');
    });

    it('should apply all constraints together', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          step={1}
          min='2025-01-01'
          max='2025-12-31'
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('step', '1');
      expect(input).toHaveAttribute('min', '2025-01-01');
      expect(input).toHaveAttribute('max', '2025-12-31');
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom style object', () => {
      const customStyle = { color: 'red', fontSize: '16px' };

      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
          style={customStyle}
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveStyle({ color: 'red', fontSize: '16px' });
    });

    it('should handle undefined style', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value=''
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('style', '');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null value', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value={null as any}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle undefined value', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value={undefined as any}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle all datetime types', () => {
      const types = ['date', 'datetime-local', 'time'] as const;

      types.forEach(type => {
        const { unmount } = render(
          <DateTimeField
            id={`${type}-field`}
            name={type}
            type={type}
            value=''
            onChange={mockOnChange}
          />
        );

        const input = screen.getByTestId('input-component');
        expect(input).toHaveAttribute('type', type);

        unmount();
      });
    });

    it('should update value when prop changes', () => {
      const { rerender } = render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value='2025-01-01'
          onChange={mockOnChange}
        />
      );

      let input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('2025-01-01');

      rerender(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value='2025-12-31'
          onChange={mockOnChange}
        />
      );

      input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('2025-12-31');
    });

    it('should handle datetime-local with seconds', () => {
      render(
        <DateTimeField
          id='datetime-field'
          name='datetime'
          type='datetime-local'
          value='2025-01-15T14:30:45'
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('2025-01-15T14:30:45');
    });

    it('should handle time with seconds', () => {
      render(
        <DateTimeField
          id='time-field'
          name='time'
          type='time'
          value='14:30:45'
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('14:30:45');
    });

    it('should handle invalid date format gracefully', () => {
      render(
        <DateTimeField
          id='date-field'
          name='date'
          type='date'
          value='invalid-date'
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('invalid-date');
    });
  });
});
