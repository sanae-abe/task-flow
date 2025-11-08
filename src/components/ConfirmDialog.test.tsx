/**
 * ConfirmDialog component tests
 * 確認ダイアログコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    isOpen: true,
    title: 'Test Confirmation',
    message: 'Do you want to proceed with this operation?',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render dialog when isOpen is true', () => {
      render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByText('Test Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Do you want to proceed with this operation?')).toBeInTheDocument();
    });

    it('should not render dialog when isOpen is false', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Test Confirmation')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Do you want to proceed with this operation?')
      ).not.toBeInTheDocument();
    });

    it('should render title and message correctly', () => {
      const customTitle = 'Custom Title';
      const customMessage = 'This is a custom message.';

      render(
        <ConfirmDialog
          {...defaultProps}
          title={customTitle}
          message={customMessage}
        />
      );

      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });
  });

  describe('Button text', () => {
    it('should show default button texts', () => {
      render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByText('common.delete')).toBeInTheDocument();
      expect(screen.getByText('common.cancel')).toBeInTheDocument();
    });

    it('should show custom confirm button text', () => {
      render(<ConfirmDialog {...defaultProps} confirmText='Execute' />);

      expect(screen.getByText('Execute')).toBeInTheDocument();
      expect(screen.getByText('common.cancel')).toBeInTheDocument();
    });

    it('should show custom cancel button text', () => {
      render(<ConfirmDialog {...defaultProps} cancelText='Back' />);

      expect(screen.getByText('common.delete')).toBeInTheDocument();
      expect(screen.getByText('Back')).toBeInTheDocument();
    });

    it('should show custom texts for both buttons', () => {
      render(
        <ConfirmDialog {...defaultProps} confirmText='Save' cancelText='Discard' />
      );

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Discard')).toBeInTheDocument();
    });
  });

  describe('Button interactions', () => {
    it('should call onConfirm when confirm button is clicked', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByText('common.delete');
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const cancelButton = screen.getByText('common.cancel');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm with custom button text', () => {
      render(<ConfirmDialog {...defaultProps} confirmText='Save' />);

      const confirmButton = screen.getByText('Save');
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel with custom button text', () => {
      render(<ConfirmDialog {...defaultProps} cancelText='Back' />);

      const cancelButton = screen.getByText('Back');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call handlers when dialog is closed', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />);

      // ダイアログが表示されていないため、ボタンも存在しない
      expect(screen.queryByText('common.delete')).not.toBeInTheDocument();
      expect(screen.queryByText('common.cancel')).not.toBeInTheDocument();
      expect(mockOnConfirm).not.toHaveBeenCalled();
      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe('Multiple clicks', () => {
    it('should handle multiple confirm clicks', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByText('common.delete');
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple cancel clicks', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const cancelButton = screen.getByText('common.cancel');
      fireEvent.click(cancelButton);
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should render buttons as interactive elements', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByText('common.delete');
      const cancelButton = screen.getByText('common.cancel');

      // ボタンとして機能することを確認
      expect(confirmButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
      expect(confirmButton.tagName.toLowerCase()).toBe('button');
      expect(cancelButton.tagName.toLowerCase()).toBe('button');
    });

    it('should be keyboard navigable', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByText('common.delete');
      const cancelButton = screen.getByText('common.cancel');

      confirmButton.focus();
      expect(confirmButton).toHaveFocus();

      cancelButton.focus();
      expect(cancelButton).toHaveFocus();
    });
  });

  describe('Component lifecycle', () => {
    it('should render consistently on re-renders', () => {
      const { rerender } = render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByText('Test Confirmation')).toBeInTheDocument();

      rerender(<ConfirmDialog {...defaultProps} title='New Title' />);

      expect(screen.getByText('New Title')).toBeInTheDocument();
      expect(screen.queryByText('Test Confirmation')).not.toBeInTheDocument();
    });

    it('should toggle visibility correctly', () => {
      const { rerender } = render(
        <ConfirmDialog {...defaultProps} isOpen={false} />
      );

      expect(screen.queryByText('Test Confirmation')).not.toBeInTheDocument();

      rerender(<ConfirmDialog {...defaultProps} isOpen />);

      expect(screen.getByText('Test Confirmation')).toBeInTheDocument();
    });
  });
});
