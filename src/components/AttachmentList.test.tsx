/**
 * AttachmentList component tests
 * 添付ファイルリストコンポーネントの包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AttachmentList from './AttachmentList';
import type { FileAttachment } from '../types';

// Mock fileUtils
vi.mock('../utils/fileUtils', () => ({
  formatFileSize: (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  },
  getFileIcon: (type: string) => {
    if (type.startsWith('image/'))
      return <span data-testid='image-icon'>🖼️</span>;
    if (type.startsWith('video/'))
      return <span data-testid='video-icon'>🎬</span>;
    if (type === 'application/pdf')
      return <span data-testid='pdf-icon'>📄</span>;
    return <span data-testid='file-icon'>📎</span>;
  },
}));

describe('AttachmentList', () => {
  const mockOnRemoveAttachment = vi.fn();

  const createMockAttachment = (
    overrides?: Partial<FileAttachment>
  ): FileAttachment => ({
    id: 'attachment-1',
    name: 'test-file.pdf',
    type: 'application/pdf',
    size: 1024 * 100, // 100KB
    data: 'base64data',
    uploadedAt: new Date().toISOString(),
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('should render null when attachments array is empty', () => {
      const { container } = render(
        <AttachmentList
          attachments={[]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render attachment list with single attachment', () => {
      const attachment = createMockAttachment();

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByText('添付ファイル (1)')).toBeInTheDocument();
      expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
      expect(screen.getByText('100.0 KB')).toBeInTheDocument();
    });

    it('should render multiple attachments', () => {
      const attachments = [
        createMockAttachment({ id: '1', name: 'file1.pdf' }),
        createMockAttachment({
          id: '2',
          name: 'file2.jpg',
          type: 'image/jpeg',
        }),
        createMockAttachment({ id: '3', name: 'file3.mp4', type: 'video/mp4' }),
      ];

      render(
        <AttachmentList
          attachments={attachments}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByText('添付ファイル (3)')).toBeInTheDocument();
      expect(screen.getByText('file1.pdf')).toBeInTheDocument();
      expect(screen.getByText('file2.jpg')).toBeInTheDocument();
      expect(screen.getByText('file3.mp4')).toBeInTheDocument();
    });

    it('should display correct file count in header', () => {
      const attachments = Array.from({ length: 5 }, (_, i) =>
        createMockAttachment({ id: `${i}`, name: `file${i}.pdf` })
      );

      render(
        <AttachmentList
          attachments={attachments}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByText('添付ファイル (5)')).toBeInTheDocument();
    });
  });

  describe('File type icons', () => {
    it('should render PDF icon for PDF files', () => {
      const attachment = createMockAttachment({
        type: 'application/pdf',
        name: 'document.pdf',
      });

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByTestId('pdf-icon')).toBeInTheDocument();
    });

    it('should render image icon for image files', () => {
      const attachment = createMockAttachment({
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByTestId('image-icon')).toBeInTheDocument();
    });

    it('should render video icon for video files', () => {
      const attachment = createMockAttachment({
        type: 'video/mp4',
        name: 'movie.mp4',
      });

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByTestId('video-icon')).toBeInTheDocument();
    });

    it('should render default file icon for unknown types', () => {
      const attachment = createMockAttachment({
        type: 'application/unknown',
        name: 'file.xyz',
      });

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByTestId('file-icon')).toBeInTheDocument();
    });
  });

  describe('File size formatting', () => {
    it('should format bytes correctly', () => {
      const attachment = createMockAttachment({
        size: 512,
        name: 'small.txt',
      });

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByText('512 B')).toBeInTheDocument();
    });

    it('should format kilobytes correctly', () => {
      const attachment = createMockAttachment({
        size: 1024 * 50, // 50KB
        name: 'medium.pdf',
      });

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByText('50.0 KB')).toBeInTheDocument();
    });

    it('should format megabytes correctly', () => {
      const attachment = createMockAttachment({
        size: 1024 * 1024 * 2.5, // 2.5MB
        name: 'large.zip',
      });

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByText('2.5 MB')).toBeInTheDocument();
    });
  });

  describe('Delete functionality', () => {
    it('should call onRemoveAttachment when delete button is clicked', () => {
      const attachment = createMockAttachment({ id: 'test-id' });

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      const deleteButton = screen.getByLabelText('ファイルを削除');
      fireEvent.click(deleteButton);

      expect(mockOnRemoveAttachment).toHaveBeenCalledTimes(1);
      expect(mockOnRemoveAttachment).toHaveBeenCalledWith('test-id');
    });

    it('should call onRemoveAttachment with correct ID for multiple attachments', () => {
      const attachments = [
        createMockAttachment({ id: 'id-1', name: 'file1.pdf' }),
        createMockAttachment({ id: 'id-2', name: 'file2.jpg' }),
        createMockAttachment({ id: 'id-3', name: 'file3.mp4' }),
      ];

      render(
        <AttachmentList
          attachments={attachments}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      const deleteButtons = screen.getAllByLabelText('ファイルを削除');

      // Click second delete button
      fireEvent.click(deleteButtons[1]);

      expect(mockOnRemoveAttachment).toHaveBeenCalledTimes(1);
      expect(mockOnRemoveAttachment).toHaveBeenCalledWith('id-2');
    });

    it('should handle multiple delete clicks', () => {
      const attachment = createMockAttachment({ id: 'test-id' });

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      const deleteButton = screen.getByLabelText('ファイルを削除');
      fireEvent.click(deleteButton);
      fireEvent.click(deleteButton);

      expect(mockOnRemoveAttachment).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible delete buttons with aria-label', () => {
      const attachment = createMockAttachment();

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      const deleteButton = screen.getByLabelText('ファイルを削除');
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton.tagName.toLowerCase()).toBe('button');
    });

    it('should be keyboard navigable', () => {
      const attachment = createMockAttachment();

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      const deleteButton = screen.getByLabelText('ファイルを削除');
      deleteButton.focus();
      expect(deleteButton).toHaveFocus();
    });

    it('should have proper heading structure', () => {
      const attachment = createMockAttachment();

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      const heading = screen.getByText('添付ファイル (1)');
      expect(heading.tagName.toLowerCase()).toBe('h3');
    });
  });

  describe('File name display', () => {
    it('should display long file names without overflow', () => {
      const attachment = createMockAttachment({
        name: 'this-is-a-very-long-file-name-that-should-break-words-properly.pdf',
      });

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(
        screen.getByText(
          'this-is-a-very-long-file-name-that-should-break-words-properly.pdf'
        )
      ).toBeInTheDocument();
    });

    it('should display special characters in file names', () => {
      const attachment = createMockAttachment({
        name: 'file (1) - [copy].pdf',
      });

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByText('file (1) - [copy].pdf')).toBeInTheDocument();
    });

    it('should display Unicode characters in file names', () => {
      const attachment = createMockAttachment({
        name: '日本語ファイル名.pdf',
      });

      render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByText('日本語ファイル名.pdf')).toBeInTheDocument();
    });
  });

  describe('Component lifecycle', () => {
    it('should render consistently on re-renders', () => {
      const attachment = createMockAttachment();
      const { rerender } = render(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByText('test-file.pdf')).toBeInTheDocument();

      rerender(
        <AttachmentList
          attachments={[attachment]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByText('test-file.pdf')).toBeInTheDocument();
    });

    it('should update when attachments array changes', () => {
      const { rerender } = render(
        <AttachmentList
          attachments={[createMockAttachment({ name: 'file1.pdf' })]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.getByText('file1.pdf')).toBeInTheDocument();

      rerender(
        <AttachmentList
          attachments={[createMockAttachment({ name: 'file2.jpg' })]}
          onRemoveAttachment={mockOnRemoveAttachment}
        />
      );

      expect(screen.queryByText('file1.pdf')).not.toBeInTheDocument();
      expect(screen.getByText('file2.jpg')).toBeInTheDocument();
    });
  });
});
