import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormDialog } from './useFormDialog';

describe('useFormDialog', () => {
  describe('Basic functionality', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: false,
          onSave: vi.fn(),
          onCancel: vi.fn(),
        })
      );

      expect(result.current.value).toBe('');
      expect(result.current.isValid).toBe(false);
    });

    it('should initialize with initial value', () => {
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          initialValue: 'Initial text',
          onSave: vi.fn(),
          onCancel: vi.fn(),
        })
      );

      expect(result.current.value).toBe('Initial text');
      expect(result.current.isValid).toBe(true);
    });

    it('should update value when setValue is called', () => {
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          onSave: vi.fn(),
          onCancel: vi.fn(),
        })
      );

      act(() => {
        result.current.setValue('New value');
      });

      expect(result.current.value).toBe('New value');
      expect(result.current.isValid).toBe(true);
    });
  });

  describe('Dialog open/close behavior', () => {
    it('should reset value when dialog opens', () => {
      const { result, rerender } = renderHook(
        ({ isOpen, initialValue }) =>
          useFormDialog({
            isOpen,
            initialValue,
            onSave: vi.fn(),
            onCancel: vi.fn(),
          }),
        {
          initialProps: { isOpen: false, initialValue: 'Initial' },
        }
      );

      act(() => {
        result.current.setValue('Modified');
      });

      expect(result.current.value).toBe('Modified');

      // Open dialog
      rerender({ isOpen: true, initialValue: 'Initial' });

      expect(result.current.value).toBe('Initial');
    });

    it('should update value when initialValue changes and dialog is open', () => {
      const { result, rerender } = renderHook(
        ({ isOpen, initialValue }) =>
          useFormDialog({
            isOpen,
            initialValue,
            onSave: vi.fn(),
            onCancel: vi.fn(),
          }),
        {
          initialProps: { isOpen: true, initialValue: 'First' },
        }
      );

      expect(result.current.value).toBe('First');

      rerender({ isOpen: true, initialValue: 'Second' });

      expect(result.current.value).toBe('Second');
    });
  });

  describe('Validation', () => {
    it('should be valid when required is false', () => {
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          onSave: vi.fn(),
          onCancel: vi.fn(),
          required: false,
        })
      );

      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.setValue('   ');
      });

      expect(result.current.isValid).toBe(true);
    });

    it('should validate based on minLength requirement', () => {
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          onSave: vi.fn(),
          onCancel: vi.fn(),
          required: true,
          minLength: 3,
        })
      );

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setValue('ab');
      });

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setValue('abc');
      });

      expect(result.current.isValid).toBe(true);
    });

    it('should trim whitespace when validating', () => {
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          onSave: vi.fn(),
          onCancel: vi.fn(),
          required: true,
          minLength: 3,
        })
      );

      act(() => {
        result.current.setValue('  ab  ');
      });

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setValue('  abc  ');
      });

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('Save functionality', () => {
    it('should call onSave with trimmed value when valid', () => {
      const onSave = vi.fn();
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          onSave,
          onCancel: vi.fn(),
          required: true,
        })
      );

      act(() => {
        result.current.setValue('  Valid text  ');
      });

      act(() => {
        result.current.handleSave();
      });

      expect(onSave).toHaveBeenCalledWith('Valid text');
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('should not call onSave when value is invalid', () => {
      const onSave = vi.fn();
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          onSave,
          onCancel: vi.fn(),
          required: true,
          minLength: 3,
        })
      );

      act(() => {
        result.current.setValue('ab');
      });

      act(() => {
        result.current.handleSave();
      });

      expect(onSave).not.toHaveBeenCalled();
    });

    it('should call onSave when required is false even with empty value', () => {
      const onSave = vi.fn();
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          onSave,
          onCancel: vi.fn(),
          required: false,
        })
      );

      act(() => {
        result.current.setValue('   ');
      });

      act(() => {
        result.current.handleSave();
      });

      expect(onSave).toHaveBeenCalledWith('');
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during save gracefully', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const onSave = vi.fn(() => {
        throw new Error('Save failed');
      });
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          onSave,
          onCancel: vi.fn(),
          required: true,
        })
      );

      act(() => {
        result.current.setValue('Valid text');
      });

      act(() => {
        result.current.handleSave();
      });

      expect(onSave).toHaveBeenCalledWith('Valid text');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Keyboard handling', () => {
    it('should prevent default behavior on Enter key', () => {
      const onCancel = vi.fn();
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          onSave: vi.fn(),
          onCancel,
        })
      );

      const event = {
        key: 'Enter',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>;

      act(() => {
        result.current.handleKeyPress(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('should call onCancel on Escape key', () => {
      const onCancel = vi.fn();
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          onSave: vi.fn(),
          onCancel,
        })
      );

      const event = {
        key: 'Escape',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>;

      act(() => {
        result.current.handleKeyPress(event);
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should not handle other keys', () => {
      const onCancel = vi.fn();
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          onSave: vi.fn(),
          onCancel,
        })
      );

      const event = {
        key: 'a',
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>;

      act(() => {
        result.current.handleKeyPress(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Reset functionality', () => {
    it('should reset value to initial value', () => {
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          initialValue: 'Initial',
          onSave: vi.fn(),
          onCancel: vi.fn(),
        })
      );

      act(() => {
        result.current.setValue('Modified');
      });

      expect(result.current.value).toBe('Modified');

      act(() => {
        result.current.reset();
      });

      expect(result.current.value).toBe('Initial');
    });

    it('should reset to updated initial value', () => {
      const { result, rerender } = renderHook(
        ({ initialValue }) =>
          useFormDialog({
            isOpen: true,
            initialValue,
            onSave: vi.fn(),
            onCancel: vi.fn(),
          }),
        {
          initialProps: { initialValue: 'First' },
        }
      );

      act(() => {
        result.current.setValue('Modified');
      });

      rerender({ initialValue: 'Updated' });

      act(() => {
        result.current.reset();
      });

      expect(result.current.value).toBe('Updated');
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined initial value', () => {
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          initialValue: undefined,
          onSave: vi.fn(),
          onCancel: vi.fn(),
        })
      );

      expect(result.current.value).toBe('');
    });

    it('should handle minLength of 0', () => {
      const onSave = vi.fn();
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          onSave,
          onCancel: vi.fn(),
          required: true,
          minLength: 0,
        })
      );

      act(() => {
        result.current.setValue('   ');
      });

      expect(result.current.isValid).toBe(true);

      act(() => {
        result.current.handleSave();
      });

      expect(onSave).toHaveBeenCalledWith('');
    });

    it('should handle large minLength values', () => {
      const { result } = renderHook(() =>
        useFormDialog({
          isOpen: true,
          onSave: vi.fn(),
          onCancel: vi.fn(),
          required: true,
          minLength: 100,
        })
      );

      act(() => {
        result.current.setValue('a'.repeat(99));
      });

      expect(result.current.isValid).toBe(false);

      act(() => {
        result.current.setValue('a'.repeat(100));
      });

      expect(result.current.isValid).toBe(true);
    });
  });
});
