/**
 * UniversalDropZone component tests
 * ユニバーサルドロップゾーンコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UniversalDropZone from './UniversalDropZone';
import type { ImportMode } from '../types';

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, size, variant, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-size={size}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock Upload icon
vi.mock('lucide-react', () => ({
  Upload: () => <div data-testid='upload-icon'>Upload Icon</div>,
}));

describe('UniversalDropZone', () => {
  let mockFileInputRef: { current: HTMLInputElement | null };
  let mockOnDragOver: ReturnType<typeof vi.fn>;
  let mockOnDragEnter: ReturnType<typeof vi.fn>;
  let mockOnDragLeave: ReturnType<typeof vi.fn>;
  let mockOnDrop: ReturnType<typeof vi.fn>;
  let mockOnClick: ReturnType<typeof vi.fn>;
  let mockOnFileInputChange: ReturnType<typeof vi.fn>;
  let defaultProps: any;

  beforeEach(() => {
    mockFileInputRef = { current: null };
    mockOnDragOver = vi.fn();
    mockOnDragEnter = vi.fn();
    mockOnDragLeave = vi.fn();
    mockOnDrop = vi.fn();
    mockOnClick = vi.fn();
    mockOnFileInputChange = vi.fn();

    defaultProps = {
      isDragOver: false,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/*', 'text/*', 'application/pdf'],
      multiple: true,
      onDragOver: mockOnDragOver,
      onDragLeave: mockOnDragLeave,
      onDrop: mockOnDrop,
      onClick: mockOnClick,
      fileInputRef: mockFileInputRef,
      onFileInputChange: mockOnFileInputChange,
    };
  });

  describe('Rendering', () => {
    it('should render drop zone with default title', () => {
      render(<UniversalDropZone {...defaultProps} />);

      expect(
        screen.getByText(
          'ファイルをここにドラッグ＆ドロップするか、クリックして選択'
        )
      ).toBeInTheDocument();
    });

    it('should render upload icon', () => {
      render(<UniversalDropZone {...defaultProps} />);

      expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    });

    it('should render default subtitle with file size and types', () => {
      render(<UniversalDropZone {...defaultProps} />);

      expect(screen.getByText(/最大5MB/)).toBeInTheDocument();
    });

    it('should render custom title when provided', () => {
      render(<UniversalDropZone {...defaultProps} title='カスタムタイトル' />);

      expect(screen.getByText('カスタムタイトル')).toBeInTheDocument();
    });

    it('should render custom subtitle when provided', () => {
      render(
        <UniversalDropZone {...defaultProps} subtitle='カスタムサブタイトル' />
      );

      expect(screen.getByText('カスタムサブタイトル')).toBeInTheDocument();
    });

    it('should render hidden file input', () => {
      render(<UniversalDropZone {...defaultProps} />);

      const fileInput = screen
        .getByRole('button')
        .querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveClass('hidden');
    });

    it('should apply multiple attribute to file input', () => {
      render(<UniversalDropZone {...defaultProps} multiple />);

      const fileInput = screen
        .getByRole('button')
        .querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput.multiple).toBe(true);
    });

    it('should not apply multiple attribute when multiple is false', () => {
      render(<UniversalDropZone {...defaultProps} multiple={false} />);

      const fileInput = screen
        .getByRole('button')
        .querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput.multiple).toBe(false);
    });

    it('should set accept attribute with allowed types', () => {
      const allowedTypes = ['image/*', '.pdf', '.doc'];
      render(
        <UniversalDropZone {...defaultProps} allowedTypes={allowedTypes} />
      );

      const fileInput = screen
        .getByRole('button')
        .querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput.accept).toBe('image/*,.pdf,.doc');
    });

    it('should render with custom min height', () => {
      const { container } = render(
        <UniversalDropZone {...defaultProps} minHeight='200px' />
      );

      const dropZone = container.firstChild as HTMLElement;
      expect(dropZone.style.minHeight).toBe('200px');
    });
  });

  describe('Import Mode', () => {
    it('should render default title for "both" mode', () => {
      render(<UniversalDropZone {...defaultProps} importMode='both' />);

      expect(
        screen.getByText(
          'ファイルをここにドラッグ＆ドロップするか、クリックして選択'
        )
      ).toBeInTheDocument();
    });

    it('should render title for "drag-drop" mode', () => {
      render(<UniversalDropZone {...defaultProps} importMode='drag-drop' />);

      expect(
        screen.getByText('ファイルをここにドラッグ＆ドロップ')
      ).toBeInTheDocument();
    });

    it('should render title for "file-select" mode', () => {
      render(<UniversalDropZone {...defaultProps} importMode='file-select' />);

      expect(
        screen.getByText('クリックしてファイルを選択')
      ).toBeInTheDocument();
    });

    it('should show dashed border for "both" mode', () => {
      const { container } = render(
        <UniversalDropZone {...defaultProps} importMode='both' />
      );

      const dropZone = container.firstChild as HTMLElement;
      expect(dropZone).toHaveClass('border-dashed');
    });

    it('should show dashed border for "drag-drop" mode', () => {
      const { container } = render(
        <UniversalDropZone {...defaultProps} importMode='drag-drop' />
      );

      const dropZone = container.firstChild as HTMLElement;
      expect(dropZone).toHaveClass('border-dashed');
    });

    it('should show solid border for "file-select" mode', () => {
      const { container } = render(
        <UniversalDropZone {...defaultProps} importMode='file-select' />
      );

      const dropZone = container.firstChild as HTMLElement;
      expect(dropZone).toHaveClass('border-solid');
    });
  });

  describe('Drag Over State', () => {
    it('should show drag title when isDragOver is true and dragTitle is provided', () => {
      render(
        <UniversalDropZone
          {...defaultProps}
          isDragOver
          dragTitle='ここにドロップ'
        />
      );

      expect(screen.getByText('ここにドロップ')).toBeInTheDocument();
    });

    it('should apply drag over styles when isDragOver is true', () => {
      const { container } = render(
        <UniversalDropZone {...defaultProps} isDragOver />
      );

      const dropZone = container.firstChild as HTMLElement;
      expect(dropZone).toHaveClass('border-primary', 'bg-blue-50');
    });

    it('should apply default styles when isDragOver is false', () => {
      const { container } = render(
        <UniversalDropZone {...defaultProps} isDragOver={false} />
      );

      const dropZone = container.firstChild as HTMLElement;
      expect(dropZone).toHaveClass('border-gray-300', 'bg-gray-50');
    });

    it('should change icon color when isDragOver is true', () => {
      const { container, rerender } = render(
        <UniversalDropZone {...defaultProps} isDragOver={false} />
      );

      let iconContainer = container.querySelector('.text-zinc-500');
      expect(iconContainer).toBeInTheDocument();

      rerender(<UniversalDropZone {...defaultProps} isDragOver />);

      iconContainer = container.querySelector('.text-primary');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Drag and Drop Events', () => {
    it('should call onDragOver when drag over event occurs', () => {
      render(<UniversalDropZone {...defaultProps} />);

      const dropZone = screen.getByRole('button');
      fireEvent.dragOver(dropZone);

      expect(mockOnDragOver).toHaveBeenCalled();
    });

    it('should call onDragEnter when provided', () => {
      render(
        <UniversalDropZone {...defaultProps} onDragEnter={mockOnDragEnter} />
      );

      const dropZone = screen.getByRole('button');
      fireEvent.dragEnter(dropZone);

      expect(mockOnDragEnter).toHaveBeenCalled();
    });

    it('should call onDragLeave when drag leave event occurs', () => {
      render(<UniversalDropZone {...defaultProps} />);

      const dropZone = screen.getByRole('button');
      fireEvent.dragLeave(dropZone);

      expect(mockOnDragLeave).toHaveBeenCalled();
    });

    it('should call onDrop when drop event occurs', () => {
      render(<UniversalDropZone {...defaultProps} />);

      const dropZone = screen.getByRole('button');
      fireEvent.drop(dropZone);

      expect(mockOnDrop).toHaveBeenCalled();
    });

    it('should not call drag events when isLoading is true', () => {
      render(<UniversalDropZone {...defaultProps} isLoading />);

      const dropZone = screen.getByRole('button');
      fireEvent.dragOver(dropZone);
      fireEvent.dragLeave(dropZone);
      fireEvent.drop(dropZone);

      expect(mockOnDragOver).not.toHaveBeenCalled();
      expect(mockOnDragLeave).not.toHaveBeenCalled();
      expect(mockOnDrop).not.toHaveBeenCalled();
    });

    it('should not call drag events in "file-select" mode', () => {
      render(<UniversalDropZone {...defaultProps} importMode='file-select' />);

      const dropZone = screen.getByRole('button');
      fireEvent.dragOver(dropZone);
      fireEvent.dragLeave(dropZone);
      fireEvent.drop(dropZone);

      expect(mockOnDragOver).not.toHaveBeenCalled();
      expect(mockOnDragLeave).not.toHaveBeenCalled();
      expect(mockOnDrop).not.toHaveBeenCalled();
    });
  });

  describe('Click Events', () => {
    it('should call onClick when clicked', () => {
      render(<UniversalDropZone {...defaultProps} />);

      const dropZone = screen.getByRole('button');
      fireEvent.click(dropZone);

      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should not call onClick when isLoading is true', () => {
      render(<UniversalDropZone {...defaultProps} isLoading />);

      const dropZone = screen.getByRole('button');
      fireEvent.click(dropZone);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should not call onClick in "drag-drop" mode', () => {
      render(<UniversalDropZone {...defaultProps} importMode='drag-drop' />);

      const dropZone = screen.getByRole('button');
      fireEvent.click(dropZone);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should apply cursor-pointer class when click is allowed', () => {
      const { container } = render(
        <UniversalDropZone {...defaultProps} importMode='both' />
      );

      const dropZone = container.firstChild as HTMLElement;
      expect(dropZone).toHaveClass('cursor-pointer');
    });

    it('should not apply cursor-pointer class in "drag-drop" mode', () => {
      const { container } = render(
        <UniversalDropZone {...defaultProps} importMode='drag-drop' />
      );

      const dropZone = container.firstChild as HTMLElement;
      expect(dropZone).not.toHaveClass('cursor-pointer');
    });
  });

  describe('Loading State', () => {
    it('should apply loading styles when isLoading is true', () => {
      const { container } = render(
        <UniversalDropZone {...defaultProps} isLoading />
      );

      const dropZone = container.firstChild as HTMLElement;
      expect(dropZone).toHaveClass('opacity-70', 'cursor-not-allowed');
    });

    it('should disable file input when isLoading is true', () => {
      render(<UniversalDropZone {...defaultProps} isLoading />);

      const fileInput = screen
        .getByRole('button')
        .querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput.disabled).toBe(true);
    });

    it('should set tabIndex to -1 when isLoading is true', () => {
      render(<UniversalDropZone {...defaultProps} isLoading />);

      const dropZone = screen.getByRole('button');
      expect(dropZone).toHaveAttribute('tabindex', '-1');
    });

    it('should set tabIndex to 0 when isLoading is false', () => {
      render(<UniversalDropZone {...defaultProps} isLoading={false} />);

      const dropZone = screen.getByRole('button');
      expect(dropZone).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Button Display', () => {
    it('should not render button by default', () => {
      render(<UniversalDropZone {...defaultProps} />);

      // The Button component text should not be present
      expect(
        screen.queryByText('ファイルを選択', {
          exact: false,
          selector: 'button',
        })
      ).not.toBeInTheDocument();
    });

    it('should render button when showButton is true', () => {
      render(<UniversalDropZone {...defaultProps} showButton />);

      expect(screen.getByText('ファイルを選択')).toBeInTheDocument();
    });

    it('should not render button when isDragOver is true', () => {
      render(<UniversalDropZone {...defaultProps} showButton isDragOver />);

      // The Button component text should not be present when dragging over
      expect(
        screen.queryByText('ファイルを選択', {
          exact: false,
          selector: 'button',
        })
      ).not.toBeInTheDocument();
    });

    it('should render custom button text', () => {
      render(
        <UniversalDropZone
          {...defaultProps}
          showButton
          buttonText='カスタムボタン'
        />
      );

      expect(screen.getByText('カスタムボタン')).toBeInTheDocument();
    });

    it('should render loading text when isLoading is true', () => {
      render(<UniversalDropZone {...defaultProps} showButton isLoading />);

      expect(screen.getByText('アップロード中...')).toBeInTheDocument();
    });

    it('should render custom loading text', () => {
      render(
        <UniversalDropZone
          {...defaultProps}
          showButton
          isLoading
          loadingText='処理中...'
        />
      );

      expect(screen.getByText('処理中...')).toBeInTheDocument();
    });

    it('should disable button when isLoading is true', () => {
      render(<UniversalDropZone {...defaultProps} showButton isLoading />);

      // Find the actual Button component by its text content
      const uploadButton = screen.getByText('アップロード中...');
      // Check if the button's parent or the button itself has disabled attribute
      expect(uploadButton.closest('button')).toBeDisabled();
    });

    it('should call onClick and stop propagation when button is clicked', () => {
      render(<UniversalDropZone {...defaultProps} showButton />);

      const button = screen.getByText('ファイルを選択');
      fireEvent.click(button);

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('File Input Change', () => {
    it('should call onFileInputChange when file input changes', () => {
      render(<UniversalDropZone {...defaultProps} />);

      const fileInput = screen
        .getByRole('button')
        .querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const event = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      fireEvent.change(fileInput, event);

      expect(mockOnFileInputChange).toHaveBeenCalled();
    });
  });

  describe('Aria Labels', () => {
    it('should have default aria-label for multiple files', () => {
      render(<UniversalDropZone {...defaultProps} multiple />);

      const dropZone = screen.getByRole('button');
      expect(dropZone).toHaveAttribute('aria-label', 'ファイルを選択');
    });

    it('should have default aria-label for single file', () => {
      render(<UniversalDropZone {...defaultProps} multiple={false} />);

      const dropZone = screen.getByRole('button');
      expect(dropZone).toHaveAttribute('aria-label', 'ファイルを選択');
    });

    it('should have JSON-specific aria-label when JSON is allowed', () => {
      render(
        <UniversalDropZone
          {...defaultProps}
          allowedTypes={['application/json']}
        />
      );

      const dropZone = screen.getByRole('button');
      expect(dropZone).toHaveAttribute('aria-label', 'JSONファイルを選択');
    });

    it('should have JSON-specific aria-label when .json extension is allowed', () => {
      render(<UniversalDropZone {...defaultProps} allowedTypes={['.json']} />);

      const dropZone = screen.getByRole('button');
      expect(dropZone).toHaveAttribute('aria-label', 'JSONファイルを選択');
    });

    it('should use custom aria-label when provided', () => {
      render(
        <UniversalDropZone
          {...defaultProps}
          ariaLabel='カスタムアクセシビリティラベル'
        />
      );

      const dropZone = screen.getByRole('button');
      expect(dropZone).toHaveAttribute(
        'aria-label',
        'カスタムアクセシビリティラベル'
      );
    });

    it('should have aria-hidden on file input', () => {
      render(<UniversalDropZone {...defaultProps} />);

      const fileInput = screen
        .getByRole('button')
        .querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Subtitle Generation', () => {
    it('should show file size in subtitle', () => {
      render(
        <UniversalDropZone {...defaultProps} maxFileSize={10 * 1024 * 1024} />
      );

      expect(screen.getByText(/最大10MB/)).toBeInTheDocument();
    });

    it('should show extensions when specific types are allowed', () => {
      render(
        <UniversalDropZone
          {...defaultProps}
          allowedTypes={['.pdf', '.doc', '.docx']}
        />
      );

      // The component formats it as ".pdf, .doc, .docx" (with dots)
      expect(screen.getByText(/\.pdf, \.doc, \.docx/)).toBeInTheDocument();
    });

    it('should extract extensions from MIME types', () => {
      render(
        <UniversalDropZone
          {...defaultProps}
          allowedTypes={['image/png', 'image/jpeg']}
        />
      );

      expect(screen.getByText(/png, jpeg/)).toBeInTheDocument();
    });

    it('should not show extensions for wildcard MIME types', () => {
      render(<UniversalDropZone {...defaultProps} allowedTypes={['*/*']} />);

      const subtitle = screen.getByText(/最大5MB/);
      expect(subtitle.textContent).not.toContain('(');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty allowedTypes array', () => {
      render(<UniversalDropZone {...defaultProps} allowedTypes={[]} />);

      expect(screen.getByText(/最大5MB/)).toBeInTheDocument();
    });

    it('should handle very large file size', () => {
      render(
        <UniversalDropZone {...defaultProps} maxFileSize={100 * 1024 * 1024} />
      );

      expect(screen.getByText(/最大100MB/)).toBeInTheDocument();
    });

    it('should handle very small file size', () => {
      render(<UniversalDropZone {...defaultProps} maxFileSize={100 * 1024} />);

      expect(screen.getByText(/最大0MB/)).toBeInTheDocument();
    });

    it('should handle undefined importMode', () => {
      render(<UniversalDropZone {...defaultProps} importMode={undefined} />);

      expect(
        screen.getByText(
          'ファイルをここにドラッグ＆ドロップするか、クリックして選択'
        )
      ).toBeInTheDocument();
    });

    it('should handle all import modes', () => {
      const modes: ImportMode[] = ['both', 'drag-drop', 'file-select'];

      modes.forEach(mode => {
        const { unmount } = render(
          <UniversalDropZone {...defaultProps} importMode={mode} />
        );
        expect(screen.getByRole('button')).toBeInTheDocument();
        unmount();
      });
    });
  });
});
