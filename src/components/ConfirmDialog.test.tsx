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
    title: 'テスト確認',
    message: 'この操作を実行しますか？',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render dialog when isOpen is true', () => {
      render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByText('テスト確認')).toBeInTheDocument();
      expect(screen.getByText('この操作を実行しますか？')).toBeInTheDocument();
    });

    it('should not render dialog when isOpen is false', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('テスト確認')).not.toBeInTheDocument();
      expect(
        screen.queryByText('この操作を実行しますか？')
      ).not.toBeInTheDocument();
    });

    it('should render title and message correctly', () => {
      const customTitle = 'カスタムタイトル';
      const customMessage = 'カスタムメッセージです。';

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

      expect(screen.getByText('削除')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();
    });

    it('should show custom confirm button text', () => {
      render(<ConfirmDialog {...defaultProps} confirmText='実行' />);

      expect(screen.getByText('実行')).toBeInTheDocument();
      expect(screen.getByText('キャンセル')).toBeInTheDocument();
    });

    it('should show custom cancel button text', () => {
      render(<ConfirmDialog {...defaultProps} cancelText='戻る' />);

      expect(screen.getByText('削除')).toBeInTheDocument();
      expect(screen.getByText('戻る')).toBeInTheDocument();
    });

    it('should show custom texts for both buttons', () => {
      render(
        <ConfirmDialog {...defaultProps} confirmText='保存' cancelText='破棄' />
      );

      expect(screen.getByText('保存')).toBeInTheDocument();
      expect(screen.getByText('破棄')).toBeInTheDocument();
    });
  });

  describe('Button interactions', () => {
    it('should call onConfirm when confirm button is clicked', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByText('削除');
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const cancelButton = screen.getByText('キャンセル');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm with custom button text', () => {
      render(<ConfirmDialog {...defaultProps} confirmText='保存' />);

      const confirmButton = screen.getByText('保存');
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel with custom button text', () => {
      render(<ConfirmDialog {...defaultProps} cancelText='戻る' />);

      const cancelButton = screen.getByText('戻る');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call handlers when dialog is closed', () => {
      render(<ConfirmDialog {...defaultProps} isOpen={false} />);

      // ダイアログが表示されていないため、ボタンも存在しない
      expect(screen.queryByText('削除')).not.toBeInTheDocument();
      expect(screen.queryByText('キャンセル')).not.toBeInTheDocument();
      expect(mockOnConfirm).not.toHaveBeenCalled();
      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe('Multiple clicks', () => {
    it('should handle multiple confirm clicks', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByText('削除');
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple cancel clicks', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const cancelButton = screen.getByText('キャンセル');
      fireEvent.click(cancelButton);
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should render buttons as interactive elements', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByText('削除');
      const cancelButton = screen.getByText('キャンセル');

      // ボタンとして機能することを確認
      expect(confirmButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
      expect(confirmButton.tagName.toLowerCase()).toBe('button');
      expect(cancelButton.tagName.toLowerCase()).toBe('button');
    });

    it('should be keyboard navigable', () => {
      render(<ConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByText('削除');
      const cancelButton = screen.getByText('キャンセル');

      confirmButton.focus();
      expect(confirmButton).toHaveFocus();

      cancelButton.focus();
      expect(cancelButton).toHaveFocus();
    });
  });

  describe('Component lifecycle', () => {
    it('should render consistently on re-renders', () => {
      const { rerender } = render(<ConfirmDialog {...defaultProps} />);

      expect(screen.getByText('テスト確認')).toBeInTheDocument();

      rerender(<ConfirmDialog {...defaultProps} title='新しいタイトル' />);

      expect(screen.getByText('新しいタイトル')).toBeInTheDocument();
      expect(screen.queryByText('テスト確認')).not.toBeInTheDocument();
    });

    it('should toggle visibility correctly', () => {
      const { rerender } = render(
        <ConfirmDialog {...defaultProps} isOpen={false} />
      );

      expect(screen.queryByText('テスト確認')).not.toBeInTheDocument();

      rerender(<ConfirmDialog {...defaultProps} isOpen />);

      expect(screen.getByText('テスト確認')).toBeInTheDocument();
    });
  });
});
