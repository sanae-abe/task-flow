/**
 * TextField component tests
 * テキストフィールドコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextField } from './TextField';

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

describe('TextField', () => {
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

  describe('Rendering', () => {
    it('should render input element', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
          value=''
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('input-component')).toBeInTheDocument();
    });

    it('should render with correct id and name', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
          value=''
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('id', 'test-field');
      expect(input).toHaveAttribute('name', 'test');
    });

    it('should render with correct type', () => {
      render(
        <TextField
          id='email-field'
          name='email'
          type='email'
          value=''
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('input-component')).toHaveAttribute(
        'type',
        'email'
      );
    });

    it('should render with placeholder', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
          value=''
          onChange={mockOnChange}
          placeholder='Enter text'
        />
      );

      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should render with value', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
          value='Test value'
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('Test value');
    });

    it('should handle empty value', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
          value=''
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should convert non-string values to string', () => {
      render(
        <TextField
          id='number-field'
          name='number'
          type='number'
          value={123}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('123');
    });
  });

  describe('AutoFocus', () => {
    it('should autofocus when autoFocus is true', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
          value=''
          onChange={mockOnChange}
          autoFocus
        />
      );

      const input = screen.getByTestId('input-component');
      // React 19: autofocus is handled via ref.focus(), not attribute
      expect(input).toHaveFocus();
    });

    it('should not autofocus by default', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
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
        <TextField
          id='test-field'
          name='test'
          type='text'
          value=''
          onChange={mockOnChange}
          disabled
        />
      );

      expect(screen.getByTestId('input-component')).toBeDisabled();
    });

    it('should not be disabled by default', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
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
        <TextField
          id='test-field'
          name='test'
          type='text'
          value=''
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component');
      fireEvent.change(input, { target: { value: 'New value' } });

      expect(mockOnChange).toHaveBeenCalledWith('New value');
    });

    it('should call onBlur when input loses focus', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
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
        <TextField
          id='test-field'
          name='test'
          type='text'
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
        <TextField
          id='test-field'
          name='test'
          type='text'
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
        <TextField
          id='test-field'
          name='test'
          type='text'
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
        <TextField
          id='test-field'
          name='test'
          type='text'
          value=''
          onChange={mockOnChange}
          _error='Field is required'
          touched
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveClass('border-destructive');
    });

    it('should not apply error class when not touched', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
          value=''
          onChange={mockOnChange}
          _error='Field is required'
          touched={false}
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).not.toHaveClass('border-destructive');
    });

    it('should not apply error class when no error', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
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
        <TextField
          id='test-field'
          name='test'
          type='text'
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
        <TextField
          id='test-field'
          name='test'
          type='text'
          value=''
          onChange={mockOnChange}
          _error='Field is required'
          touched
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-describedby when error exists', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
          value=''
          onChange={mockOnChange}
          _error='Field is required'
          touched
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('aria-describedby', 'test-field-_error');
    });

    it('should not set aria-describedby when no error', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
          value=''
          onChange={mockOnChange}
          touched
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Number Input Props', () => {
    it('should apply step attribute for number input', () => {
      render(
        <TextField
          id='number-field'
          name='number'
          type='number'
          value=''
          onChange={mockOnChange}
          step={0.1}
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('step', '0.1');
    });

    it('should apply min attribute for number input', () => {
      render(
        <TextField
          id='number-field'
          name='number'
          type='number'
          value=''
          onChange={mockOnChange}
          min={0}
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('min', '0');
    });

    it('should apply max attribute for number input', () => {
      render(
        <TextField
          id='number-field'
          name='number'
          type='number'
          value=''
          onChange={mockOnChange}
          max={100}
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).toHaveAttribute('max', '100');
    });

    it('should not apply step/min/max when not provided', () => {
      render(
        <TextField
          id='number-field'
          name='number'
          type='number'
          value=''
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component');
      expect(input).not.toHaveAttribute('step');
      expect(input).not.toHaveAttribute('min');
      expect(input).not.toHaveAttribute('max');
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom style object', () => {
      const customStyle = { color: 'red', fontSize: '16px' };

      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
          value=''
          onChange={mockOnChange}
          style={customStyle}
        />
      );

      const input = screen.getByTestId('input-component');
      // Browsers convert color names to rgb format
      expect(input).toHaveStyle({ color: 'rgb(255, 0, 0)', fontSize: '16px' });
    });

    it('should handle undefined style', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
          value=''
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component');
      // When no style prop, the style attribute is null, not empty string
      expect(input.getAttribute('style')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null value', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
          value={null as any}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle undefined value', () => {
      render(
        <TextField
          id='test-field'
          name='test'
          type='text'
          value={undefined as any}
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('should handle all input types', () => {
      const types = ['text', 'email', 'password', 'number'] as const;

      types.forEach(type => {
        const { unmount } = render(
          <TextField
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
        <TextField
          id='test-field'
          name='test'
          type='text'
          value='Initial'
          onChange={mockOnChange}
        />
      );

      let input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('Initial');

      rerender(
        <TextField
          id='test-field'
          name='test'
          type='text'
          value='Updated'
          onChange={mockOnChange}
        />
      );

      input = screen.getByTestId('input-component') as HTMLInputElement;
      expect(input.value).toBe('Updated');
    });
  });
});
