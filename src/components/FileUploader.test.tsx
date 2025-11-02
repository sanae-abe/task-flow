/**
 * FileUploader component tests
 * ファイルアップロードコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FileUploader from './FileUploader';
import type { FileAttachment } from '../types';

// Mock child components
vi.mock('./AttachmentList', () => ({
  default: ({ attachments, onRemoveAttachment }: any) => (
    <div data-testid="attachment-list">
      {attachments.map((att: FileAttachment) => (
        <div key={att.id} data-testid={`attachment-${att.id}`}>
          {att.name}
          <button onClick={() => onRemoveAttachment(att.id)}>Remove</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('./UniversalDropZone', () => ({
  default: ({
    isDragOver,
    maxFileSize,
    allowedTypes,
    multiple,
    onDragOver,
    onDragLeave,
    onDrop,
    onClick,
    fileInputRef,
    onFileInputChange,
    importMode,
  }: any) => (
    <div
      data-testid="universal-drop-zone"
      data-is-drag-over={isDragOver}
      data-max-file-size={maxFileSize}
      data-allowed-types={JSON.stringify(allowedTypes)}
      data-multiple={multiple}
      data-import-mode={importMode}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        onChange={onFileInputChange}
        data-testid="file-input"
      />
      Drop files here
    </div>
  ),
}));

vi.mock('./ImportModeSelector', () => ({
  default: ({ selectedMode, onModeChange, showModeIndicator }: any) => (
    <div data-testid="import-mode-selector">
      <select
        value={selectedMode}
        onChange={(e) => onModeChange(e.target.value)}
        data-testid="mode-select"
      >
        <option value="both">Both</option>
        <option value="text">Text Only</option>
        <option value="files">Files Only</option>
      </select>
      {showModeIndicator && <span>Indicator</span>}
    </div>
  ),
}));

vi.mock('./shared/InlineMessage', () => ({
  default: ({ variant, message, size }: any) =>
    message ? (
      <div
        data-testid="inline-message"
        data-variant={variant}
        data-size={size}
      >
        {message}
      </div>
    ) : null,
}));

// Mock useFileUpload hook
const mockUseFileUpload = vi.fn();
vi.mock('../hooks/useFileUpload', () => ({
  useFileUpload: (attachments: any, onChange: any, options: any) =>
    mockUseFileUpload(attachments, onChange, options),
  DEFAULT_MAX_FILE_SIZE: 5 * 1024 * 1024,
  DEFAULT_ALLOWED_TYPES: [
    'image/*',
    'text/*',
    'application/pdf',
    '.doc',
    '.docx',
    '.xlsx',
    '.xls',
  ],
}));

describe('FileUploader', () => {
  let mockAttachments: FileAttachment[];
  let mockOnAttachmentsChange: ReturnType<typeof vi.fn>;
  let mockFileInputRef: { current: HTMLInputElement | null };
  let mockHandlers: {
    handleDragOver: ReturnType<typeof vi.fn>;
    handleDragLeave: ReturnType<typeof vi.fn>;
    handleDrop: ReturnType<typeof vi.fn>;
    handleFileSelect: ReturnType<typeof vi.fn>;
    handleFileInputChange: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockAttachments = [];
    mockOnAttachmentsChange = vi.fn();
    mockFileInputRef = { current: null };
    mockHandlers = {
      handleDragOver: vi.fn(),
      handleDragLeave: vi.fn(),
      handleDrop: vi.fn(),
      handleFileSelect: vi.fn(),
      handleFileInputChange: vi.fn(),
    };

    mockUseFileUpload.mockReturnValue({
      isDragOver: false,
      _error: null,
      fileInputRef: mockFileInputRef,
      ...mockHandlers,
    });
  });

  describe('Rendering', () => {
    it('should render all components with default props', () => {
      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      expect(screen.getByTestId('import-mode-selector')).toBeInTheDocument();
      expect(screen.getByTestId('universal-drop-zone')).toBeInTheDocument();
      expect(screen.getByTestId('attachment-list')).toBeInTheDocument();
    });

    it('should not render ImportModeSelector when showModeSelector is false', () => {
      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
          showModeSelector={false}
        />
      );

      expect(
        screen.queryByTestId('import-mode-selector')
      ).not.toBeInTheDocument();
    });

    it('should render ImportModeSelector with default mode', () => {
      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      const modeSelect = screen.getByTestId('mode-select') as HTMLSelectElement;
      expect(modeSelect.value).toBe('both');
    });

    it('should render ImportModeSelector with custom default mode', () => {
      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
          defaultImportMode="text"
        />
      );

      const modeSelect = screen.getByTestId('mode-select') as HTMLSelectElement;
      expect(modeSelect.value).toBe('text');
    });

    it('should render UniversalDropZone with default props', () => {
      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      const dropZone = screen.getByTestId('universal-drop-zone');
      expect(dropZone).toHaveAttribute('data-is-drag-over', 'false');
      expect(dropZone).toHaveAttribute('data-max-file-size', '5242880');
      expect(dropZone).toHaveAttribute('data-multiple', 'true');
      expect(dropZone).toHaveAttribute('data-import-mode', 'both');
    });

    it('should render UniversalDropZone with custom maxFileSize', () => {
      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
          maxFileSize={1024 * 1024}
        />
      );

      const dropZone = screen.getByTestId('universal-drop-zone');
      expect(dropZone).toHaveAttribute('data-max-file-size', '1048576');
    });

    it('should render UniversalDropZone with custom allowedTypes', () => {
      const customTypes = ['image/*', '.pdf'];

      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
          allowedTypes={customTypes}
        />
      );

      const dropZone = screen.getByTestId('universal-drop-zone');
      expect(dropZone).toHaveAttribute(
        'data-allowed-types',
        JSON.stringify(customTypes)
      );
    });

    it('should render AttachmentList with attachments', () => {
      const attachments: FileAttachment[] = [
        {
          id: 'att-1',
          name: 'file1.txt',
          type: 'text/plain',
          size: 100,
          data: 'base64data',
          uploadedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'att-2',
          name: 'file2.pdf',
          type: 'application/pdf',
          size: 200,
          data: 'base64data',
          uploadedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      render(
        <FileUploader
          attachments={attachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      expect(screen.getByTestId('attachment-att-1')).toBeInTheDocument();
      expect(screen.getByTestId('attachment-att-2')).toBeInTheDocument();
      expect(screen.getByText('file1.txt')).toBeInTheDocument();
      expect(screen.getByText('file2.pdf')).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should not render error message when no error', () => {
      mockUseFileUpload.mockReturnValue({
        isDragOver: false,
        _error: null,
        fileInputRef: mockFileInputRef,
        ...mockHandlers,
      });

      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      expect(screen.queryByTestId('inline-message')).not.toBeInTheDocument();
    });

    it('should render error message when error exists', () => {
      const errorMessage = 'File size exceeds limit';
      mockUseFileUpload.mockReturnValue({
        isDragOver: false,
        _error: errorMessage,
        fileInputRef: mockFileInputRef,
        ...mockHandlers,
      });

      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      const errorElement = screen.getByTestId('inline-message');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(errorMessage);
      expect(errorElement).toHaveAttribute('data-variant', 'critical');
      expect(errorElement).toHaveAttribute('data-size', 'small');
    });
  });

  describe('Drag Over State', () => {
    it('should pass isDragOver state to UniversalDropZone', () => {
      mockUseFileUpload.mockReturnValue({
        isDragOver: true,
        _error: null,
        fileInputRef: mockFileInputRef,
        ...mockHandlers,
      });

      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      const dropZone = screen.getByTestId('universal-drop-zone');
      expect(dropZone).toHaveAttribute('data-is-drag-over', 'true');
    });
  });

  describe('Event Handlers', () => {
    it('should pass drag handlers to UniversalDropZone', () => {
      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      const dropZone = screen.getByTestId('universal-drop-zone');

      fireEvent.dragOver(dropZone);
      expect(mockHandlers.handleDragOver).toHaveBeenCalled();

      fireEvent.dragLeave(dropZone);
      expect(mockHandlers.handleDragLeave).toHaveBeenCalled();

      fireEvent.drop(dropZone);
      expect(mockHandlers.handleDrop).toHaveBeenCalled();
    });

    it('should pass click handler to UniversalDropZone', () => {
      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      const dropZone = screen.getByTestId('universal-drop-zone');
      fireEvent.click(dropZone);

      expect(mockHandlers.handleFileSelect).toHaveBeenCalled();
    });

    it('should pass file input change handler', () => {
      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      const fileInput = screen.getByTestId('file-input');
      fireEvent.change(fileInput);

      expect(mockHandlers.handleFileInputChange).toHaveBeenCalled();
    });
  });

  describe('Attachment Removal', () => {
    it('should remove attachment on remove button click', () => {
      const attachments: FileAttachment[] = [
        {
          id: 'att-1',
          name: 'file1.txt',
          type: 'text/plain',
          size: 100,
          data: 'base64data',
          uploadedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'att-2',
          name: 'file2.pdf',
          type: 'application/pdf',
          size: 200,
          data: 'base64data',
          uploadedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      render(
        <FileUploader
          attachments={attachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      const removeButton = screen.getAllByText('Remove')[0];
      fireEvent.click(removeButton!);

      expect(mockOnAttachmentsChange).toHaveBeenCalledWith([attachments[1]]);
    });

    it('should remove correct attachment by id', () => {
      const attachments: FileAttachment[] = [
        {
          id: 'att-1',
          name: 'file1.txt',
          type: 'text/plain',
          size: 100,
          data: 'base64data',
          uploadedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'att-2',
          name: 'file2.pdf',
          type: 'application/pdf',
          size: 200,
          data: 'base64data',
          uploadedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      render(
        <FileUploader
          attachments={attachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      const removeButtons = screen.getAllByText('Remove');
      fireEvent.click(removeButtons[1]!);

      expect(mockOnAttachmentsChange).toHaveBeenCalledWith([attachments[0]]);
    });

    it('should handle removing last attachment', () => {
      const attachments: FileAttachment[] = [
        {
          id: 'att-1',
          name: 'file1.txt',
          type: 'text/plain',
          size: 100,
          data: 'base64data',
          uploadedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      render(
        <FileUploader
          attachments={attachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      const removeButton = screen.getByText('Remove');
      fireEvent.click(removeButton);

      expect(mockOnAttachmentsChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Import Mode', () => {
    it('should initialize with default import mode', () => {
      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      const dropZone = screen.getByTestId('universal-drop-zone');
      expect(dropZone).toHaveAttribute('data-import-mode', 'both');
    });

    it('should update import mode when selector changes', () => {
      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      const modeSelect = screen.getByTestId('mode-select');
      fireEvent.change(modeSelect, { target: { value: 'text' } });

      const dropZone = screen.getByTestId('universal-drop-zone');
      expect(dropZone).toHaveAttribute('data-import-mode', 'text');
    });

    it('should pass import mode to UniversalDropZone', () => {
      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
          defaultImportMode="files"
        />
      );

      const dropZone = screen.getByTestId('universal-drop-zone');
      expect(dropZone).toHaveAttribute('data-import-mode', 'files');
    });
  });

  describe('useFileUpload Hook Integration', () => {
    it('should call useFileUpload with correct parameters', () => {
      const maxFileSize = 1024 * 1024;
      const allowedTypes = ['image/*'];

      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
          maxFileSize={maxFileSize}
          allowedTypes={allowedTypes}
        />
      );

      expect(mockUseFileUpload).toHaveBeenCalledWith(
        mockAttachments,
        mockOnAttachmentsChange,
        {
          maxFileSize,
          allowedTypes,
        }
      );
    });

    it('should call useFileUpload with default values', () => {
      render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      expect(mockUseFileUpload).toHaveBeenCalledWith(
        mockAttachments,
        mockOnAttachmentsChange,
        {
          maxFileSize: 5 * 1024 * 1024,
          allowedTypes: [
            'image/*',
            'text/*',
            'application/pdf',
            '.doc',
            '.docx',
            '.xlsx',
            '.xls',
          ],
        }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty attachments array', () => {
      render(
        <FileUploader
          attachments={[]}
          onAttachmentsChange={mockOnAttachmentsChange}
        />
      );

      const attachmentList = screen.getByTestId('attachment-list');
      expect(attachmentList).toBeInTheDocument();
      expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    });

    it('should handle showModeSelector and mode changes together', () => {
      const { rerender } = render(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
          showModeSelector={true}
          defaultImportMode="both"
        />
      );

      expect(screen.getByTestId('import-mode-selector')).toBeInTheDocument();

      rerender(
        <FileUploader
          attachments={mockAttachments}
          onAttachmentsChange={mockOnAttachmentsChange}
          showModeSelector={false}
          defaultImportMode="text"
        />
      );

      expect(
        screen.queryByTestId('import-mode-selector')
      ).not.toBeInTheDocument();
      // Import mode is still passed to UniversalDropZone even when selector is hidden
      const dropZone = screen.getByTestId('universal-drop-zone');
      expect(dropZone).toHaveAttribute('data-import-mode', 'both'); // State persists
    });

    it('should handle all props together', () => {
      const attachments: FileAttachment[] = [
        {
          id: 'att-1',
          name: 'file1.txt',
          type: 'text/plain',
          size: 100,
          data: 'base64data',
          uploadedAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      mockUseFileUpload.mockReturnValue({
        isDragOver: true,
        _error: 'Error occurred',
        fileInputRef: mockFileInputRef,
        ...mockHandlers,
      });

      render(
        <FileUploader
          attachments={attachments}
          onAttachmentsChange={mockOnAttachmentsChange}
          maxFileSize={1024}
          allowedTypes={['.txt']}
          showModeSelector={true}
          defaultImportMode="text"
        />
      );

      expect(screen.getByTestId('import-mode-selector')).toBeInTheDocument();
      expect(screen.getByTestId('universal-drop-zone')).toHaveAttribute(
        'data-is-drag-over',
        'true'
      );
      expect(screen.getByTestId('attachment-att-1')).toBeInTheDocument();
      expect(screen.getByTestId('inline-message')).toHaveTextContent(
        'Error occurred'
      );
    });
  });
});
