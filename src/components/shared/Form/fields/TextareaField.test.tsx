/**
 * TextareaField component tests
 * テキストエリアフィールドコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextareaField } from './TextareaField';

// Mock Textarea component
vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => (
    <textarea {...props} data-testid='textarea-component' />
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

describe('TextareaField', () => {
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
    it('should render textarea element', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('textarea-component')).toBeInTheDocument();
    });

    it('should render with correct id and name', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      expect(textarea).toHaveAttribute('id', 'test-field');
      expect(textarea).toHaveAttribute('name', 'test');
    });

    it('should render with placeholder', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          placeholder='Enter description'
        />
      );

      expect(
        screen.getByPlaceholderText('Enter description')
      ).toBeInTheDocument();
    });

    it('should render with value', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value='Test value'
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId(
        'textarea-component'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe('Test value');
    });

    it('should handle empty value', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId(
        'textarea-component'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('should convert non-string values to string', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value={123}
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId(
        'textarea-component'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe('123');
    });

    it('should render with default rows', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      expect(textarea).toHaveAttribute('rows', '3');
    });

    it('should render with custom rows', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          rows={5}
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      expect(textarea).toHaveAttribute('rows', '5');
    });
  });

  describe('AutoFocus', () => {
    it('should autofocus when autoFocus is true', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          autoFocus
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      // React 19: autofocus is handled via ref.focus(), not attribute
      expect(textarea).toHaveFocus();
    });

    it('should not autofocus by default', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      expect(textarea).not.toHaveAttribute('autofocus');
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          disabled
        />
      );

      expect(screen.getByTestId('textarea-component')).toBeDisabled();
    });

    it('should not be disabled by default', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
        />
      );

      expect(screen.getByTestId('textarea-component')).not.toBeDisabled();
    });
  });

  describe('Event Handlers', () => {
    it('should call onChange when textarea value changes', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      fireEvent.change(textarea, { target: { value: 'New value' } });

      expect(mockOnChange).toHaveBeenCalledWith('New value');
    });

    it('should call onBlur when textarea loses focus', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          onBlur={mockOnBlur}
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      fireEvent.blur(textarea);

      expect(mockOnBlur).toHaveBeenCalled();
    });

    it('should call onFocus when textarea gains focus', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          onFocus={mockOnFocus}
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      fireEvent.focus(textarea);

      expect(mockOnFocus).toHaveBeenCalled();
    });

    it('should call onKeyDown when key is pressed', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          onKeyDown={mockOnKeyDown}
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      fireEvent.keyDown(textarea, { key: 'Enter' });

      expect(mockOnKeyDown).toHaveBeenCalled();
    });

    it('should not throw when optional handlers are not provided', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId('textarea-component');

      expect(() => {
        fireEvent.blur(textarea);
        fireEvent.focus(textarea);
        fireEvent.keyDown(textarea, { key: 'Enter' });
      }).not.toThrow();
    });
  });

  describe('Error State', () => {
    it('should apply error class when touched and error exists', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          _error='Field is required'
          touched
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      expect(textarea).toHaveClass('border-destructive');
    });

    it('should not apply error class when not touched', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          _error='Field is required'
          touched={false}
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      expect(textarea).not.toHaveClass('border-destructive');
    });

    it('should not apply error class when no error', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          touched
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      expect(textarea).not.toHaveClass('border-destructive');
    });

    it('should apply resize-none class', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      expect(textarea).toHaveClass('resize-none');
    });
  });

  describe('Accessibility', () => {
    it('should set aria-required when validation.required is true', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          validation={{ required: true }}
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    it('should set aria-invalid when touched and error exists', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          _error='Field is required'
          touched
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should set aria-describedby when error exists', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          _error='Field is required'
          touched
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      expect(textarea).toHaveAttribute('aria-describedby', 'test-field-_error');
    });

    it('should not set aria-describedby when no error', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          touched
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      expect(textarea).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom style object', () => {
      const customStyle = { color: 'red', fontSize: '16px' };

      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
          style={customStyle}
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      // Browsers convert color names to rgb format
      expect(textarea).toHaveStyle({
        color: 'rgb(255, 0, 0)',
        fontSize: '16px',
      });
    });

    it('should handle undefined style', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value=''
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId('textarea-component');
      // When no style prop, the style attribute is null, not empty string
      expect(textarea.getAttribute('style')).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null value', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value={null as any}
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId(
        'textarea-component'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('should handle undefined value', () => {
      render(
        <TextareaField
          id='test-field'
          name='test'
          value={undefined as any}
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId(
        'textarea-component'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';

      render(
        <TextareaField
          id='test-field'
          name='test'
          value={multilineText}
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId(
        'textarea-component'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe(multilineText);
    });

    it('should update value when prop changes', () => {
      const { rerender } = render(
        <TextareaField
          id='test-field'
          name='test'
          value='Initial'
          onChange={mockOnChange}
        />
      );

      let textarea = screen.getByTestId(
        'textarea-component'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe('Initial');

      rerender(
        <TextareaField
          id='test-field'
          name='test'
          value='Updated'
          onChange={mockOnChange}
        />
      );

      textarea = screen.getByTestId(
        'textarea-component'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe('Updated');
    });

    it('should handle very long text', () => {
      const longText = 'a'.repeat(10000);

      render(
        <TextareaField
          id='test-field'
          name='test'
          value={longText}
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId(
        'textarea-component'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe(longText);
    });

    it('should handle special characters', () => {
      const specialText = '<script>alert("test")</script>';

      render(
        <TextareaField
          id='test-field'
          name='test'
          value={specialText}
          onChange={mockOnChange}
        />
      );

      const textarea = screen.getByTestId(
        'textarea-component'
      ) as HTMLTextAreaElement;
      expect(textarea.value).toBe(specialText);
    });
  });
});
