/**
 * useFileUpload hook tests
 * ファイルアップロード機能の包括的テスト
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useFileUpload,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_ALLOWED_TYPES,
} from './useFileUpload';
import type { FileAttachment } from '../types';

describe('useFileUpload', () => {
  let mockAttachments: FileAttachment[];
  let mockOnAttachmentsChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAttachments = [];
    mockOnAttachmentsChange = vi.fn();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      expect(result.current.isDragOver).toBe(false);
      expect(result.current._error).toBeNull();
      expect(result.current.fileInputRef.current).toBeNull();
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      expect(typeof result.current.handleDragOver).toBe('function');
      expect(typeof result.current.handleDragLeave).toBe('function');
      expect(typeof result.current.handleDrop).toBe('function');
      expect(typeof result.current.handleFileSelect).toBe('function');
      expect(typeof result.current.handleFileInputChange).toBe('function');
      expect(typeof result.current.handleFiles).toBe('function');
      expect(typeof result.current.setError).toBe('function');
    });
  });

  describe('Drag and Drop', () => {
    it('should set isDragOver to true on drag over', () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDragOver(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.isDragOver).toBe(true);
    });

    it('should set isDragOver to false on drag leave', () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      const mockEvent = {
        preventDefault: vi.fn(),
      } as unknown as React.DragEvent;

      // First set to true
      act(() => {
        result.current.handleDragOver(mockEvent);
      });

      expect(result.current.isDragOver).toBe(true);

      // Then drag leave
      act(() => {
        result.current.handleDragLeave(mockEvent);
      });

      expect(result.current.isDragOver).toBe(false);
    });

    it('should handle drop event', async () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      const mockFile = new File(['content'], 'test.txt', {
        type: 'text/plain',
      });

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          files: [mockFile] as unknown as FileList,
        },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDrop(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(result.current.isDragOver).toBe(false);

      await waitFor(() => {
        expect(mockOnAttachmentsChange).toHaveBeenCalled();
      });
    });
  });

  describe('File Validation', () => {
    it('should reject files exceeding max size', async () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange, {
          maxFileSize: 100, // 100 bytes
        })
      );

      const largeFile = new File(['a'.repeat(200)], 'large.txt', {
        type: 'text/plain',
      });

      const fileList = [largeFile] as unknown as FileList;

      await act(async () => {
        await result.current.handleFiles(fileList);
      });

      expect(result.current._error).toContain('ファイルサイズが制限を超えています');
      expect(mockOnAttachmentsChange).not.toHaveBeenCalled();
    });

    it('should reject unsupported file types', async () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange, {
          allowedTypes: ['image/*'],
        })
      );

      const textFile = new File(['content'], 'test.txt', {
        type: 'text/plain',
      });

      const fileList = [textFile] as unknown as FileList;

      await act(async () => {
        await result.current.handleFiles(fileList);
      });

      expect(result.current._error).toContain('サポートされていないファイル形式です');
      expect(mockOnAttachmentsChange).not.toHaveBeenCalled();
    });

    it('should accept valid files', async () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      const validFile = new File(['content'], 'test.txt', {
        type: 'text/plain',
      });

      const fileList = [validFile] as unknown as FileList;

      await act(async () => {
        await result.current.handleFiles(fileList);
      });

      await waitFor(() => {
        expect(mockOnAttachmentsChange).toHaveBeenCalledTimes(1);
      });

      expect(result.current._error).toBeNull();
    });

    it('should validate wildcard MIME types', async () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange, {
          allowedTypes: ['image/*'],
        })
      );

      const imageFile = new File(['content'], 'test.png', {
        type: 'image/png',
      });

      const fileList = [imageFile] as unknown as FileList;

      await act(async () => {
        await result.current.handleFiles(fileList);
      });

      await waitFor(() => {
        expect(mockOnAttachmentsChange).toHaveBeenCalled();
      });

      expect(result.current._error).toBeNull();
    });

    it('should validate file extensions', async () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange, {
          allowedTypes: ['.pdf', '.doc'],
        })
      );

      const pdfFile = new File(['content'], 'document.pdf', {
        type: 'application/pdf',
      });

      const fileList = [pdfFile] as unknown as FileList;

      await act(async () => {
        await result.current.handleFiles(fileList);
      });

      await waitFor(() => {
        expect(mockOnAttachmentsChange).toHaveBeenCalled();
      });

      expect(result.current._error).toBeNull();
    });
  });

  describe('File Processing', () => {
    it('should process single file correctly', async () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      const testFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });

      const fileList = [testFile] as unknown as FileList;

      await act(async () => {
        await result.current.handleFiles(fileList);
      });

      await waitFor(() => {
        expect(mockOnAttachmentsChange).toHaveBeenCalledTimes(1);
      });

      const callArg = mockOnAttachmentsChange.mock.calls[0][0];
      expect(callArg).toHaveLength(1);
      expect(callArg[0]).toMatchObject({
        name: 'test.txt',
        type: 'text/plain',
        size: testFile.size,
      });
      expect(callArg[0].id).toBeDefined();
      expect(callArg[0].data).toBeDefined();
      expect(callArg[0].uploadedAt).toBeDefined();
    });

    it('should process multiple files', async () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });

      const fileList = [file1, file2] as unknown as FileList;

      await act(async () => {
        await result.current.handleFiles(fileList);
      });

      await waitFor(() => {
        expect(mockOnAttachmentsChange).toHaveBeenCalledTimes(1);
      });

      const callArg = mockOnAttachmentsChange.mock.calls[0][0];
      expect(callArg).toHaveLength(2);
    });

    it('should append to existing attachments', async () => {
      const existingAttachment: FileAttachment = {
        id: 'existing-1',
        name: 'existing.txt',
        type: 'text/plain',
        size: 100,
        data: 'base64data',
        uploadedAt: new Date().toISOString(),
      };

      const { result } = renderHook(() =>
        useFileUpload([existingAttachment], mockOnAttachmentsChange)
      );

      const newFile = new File(['new content'], 'new.txt', {
        type: 'text/plain',
      });

      const fileList = [newFile] as unknown as FileList;

      await act(async () => {
        await result.current.handleFiles(fileList);
      });

      await waitFor(() => {
        expect(mockOnAttachmentsChange).toHaveBeenCalled();
      });

      const callArg = mockOnAttachmentsChange.mock.calls[0][0];
      expect(callArg).toHaveLength(2);
      expect(callArg[0]).toBe(existingAttachment);
    });
  });

  describe('Error Handling', () => {
    it('should set error when file reading fails', async () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      // Create invalid file that will fail reading
      const invalidFile = new File([''], 'invalid.txt', { type: 'text/plain' });

      // Mock FileReader to simulate error
      const originalFileReader = global.FileReader;
      global.FileReader = class {
        readAsDataURL() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Read error') as any);
            }
          }, 0);
        }
      } as any;

      const fileList = [invalidFile] as unknown as FileList;

      await act(async () => {
        await result.current.handleFiles(fileList);
      });

      await waitFor(() => {
        expect(result.current._error).toBeTruthy();
      });

      // Restore original FileReader
      global.FileReader = originalFileReader;
    });

    it('should clear error on setError', () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current._error).toBe('Test error');

      act(() => {
        result.current.setError(null);
      });

      expect(result.current._error).toBeNull();
    });

    it('should clear error when processing new files', async () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      // Set initial error
      act(() => {
        result.current.setError('Previous error');
      });

      expect(result.current._error).toBe('Previous error');

      // Process valid file
      const validFile = new File(['content'], 'test.txt', {
        type: 'text/plain',
      });

      const fileList = [validFile] as unknown as FileList;

      await act(async () => {
        await result.current.handleFiles(fileList);
      });

      await waitFor(() => {
        expect(result.current._error).toBeNull();
      });
    });
  });

  describe('File Input', () => {
    it('should trigger file input click on handleFileSelect', () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      const mockClick = vi.fn();
      result.current.fileInputRef.current = {
        click: mockClick,
      } as any;

      act(() => {
        result.current.handleFileSelect();
      });

      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle file input change event', async () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      const testFile = new File(['content'], 'test.txt', {
        type: 'text/plain',
      });

      const mockEvent = {
        target: {
          files: [testFile] as unknown as FileList,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        result.current.handleFileInputChange(mockEvent);
      });

      await waitFor(() => {
        expect(mockOnAttachmentsChange).toHaveBeenCalled();
      });
    });
  });

  describe('Constants', () => {
    it('should export DEFAULT_MAX_FILE_SIZE', () => {
      expect(DEFAULT_MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
    });

    it('should export DEFAULT_ALLOWED_TYPES', () => {
      expect(DEFAULT_ALLOWED_TYPES).toEqual([
        'image/*',
        'text/*',
        'application/pdf',
        '.doc',
        '.docx',
        '.xlsx',
        '.xls',
      ]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty file list', async () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      const emptyFileList = [] as unknown as FileList;

      await act(async () => {
        await result.current.handleFiles(emptyFileList);
      });

      expect(mockOnAttachmentsChange).toHaveBeenCalledWith([]);
    });

    it('should handle drop without files', () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      const mockEvent = {
        preventDefault: vi.fn(),
        dataTransfer: {
          files: null,
        },
      } as unknown as React.DragEvent;

      act(() => {
        result.current.handleDrop(mockEvent);
      });

      expect(result.current.isDragOver).toBe(false);
      expect(mockOnAttachmentsChange).not.toHaveBeenCalled();
    });

    it('should handle file input change without files', () => {
      const { result } = renderHook(() =>
        useFileUpload(mockAttachments, mockOnAttachmentsChange)
      );

      const mockEvent = {
        target: {
          files: null,
        },
      } as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleFileInputChange(mockEvent);
      });

      expect(mockOnAttachmentsChange).not.toHaveBeenCalled();
    });
  });
});
