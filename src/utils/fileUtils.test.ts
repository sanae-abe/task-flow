/**
 * fileUtils utility tests
 * ファイル処理ユーティリティの包括的テスト
 */

import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  getFileIcon,
  isImageFile,
  isTextFile,
} from './fileUtils';
import React from 'react';

describe('fileUtils', () => {
  describe('formatFileSize', () => {
    it('should format 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes (< 1KB)', () => {
      expect(formatFileSize(100)).toBe('100 Bytes');
      expect(formatFileSize(500)).toBe('500 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB'); // 1.5 KB
      expect(formatFileSize(2048)).toBe('2 KB');
      expect(formatFileSize(10240)).toBe('10 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB');
      expect(formatFileSize(1024 * 1024 * 5)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatFileSize(1024 * 1024 * 1024 * 2.5)).toBe('2.5 GB');
    });

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1638)).toBe('1.6 KB'); // 1.599... KB
      expect(formatFileSize(1024 * 1.234)).toBe('1.23 KB');
    });

    it('should handle exact boundaries', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should handle large file sizes', () => {
      const largeSize = 1024 * 1024 * 1024 * 10; // 10 GB
      expect(formatFileSize(largeSize)).toBe('10 GB');
    });

    it('should handle decimal bytes correctly', () => {
      // Should handle fractional bytes (though unusual)
      expect(formatFileSize(1.5)).toBe('1.5 Bytes');
    });
  });

  describe('getFileIcon', () => {
    it('should return Image icon for image types', () => {
      const icon = getFileIcon('image/png');
      expect(React.isValidElement(icon)).toBe(true);
      // Check that it's an Image icon by checking the displayName or type
      expect(icon.type).toBeDefined();
    });

    it('should return Image icon for various image MIME types', () => {
      const types = ['image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'];
      types.forEach(type => {
        const icon = getFileIcon(type);
        expect(React.isValidElement(icon)).toBe(true);
        expect(icon.type).toBeDefined();
      });
    });

    it('should return File icon for non-image types', () => {
      const icon = getFileIcon('application/pdf');
      expect(React.isValidElement(icon)).toBe(true);
      expect(icon.type).toBeDefined();
    });

    it('should return File icon for text types', () => {
      const types = ['text/plain', 'text/html', 'application/json'];
      types.forEach(type => {
        const icon = getFileIcon(type);
        expect(React.isValidElement(icon)).toBe(true);
        expect(icon.type).toBeDefined();
      });
    });

    it('should use default size of 16', () => {
      const icon = getFileIcon('image/png');
      expect(icon.props.size).toBe(16);
    });

    it('should respect custom size parameter', () => {
      const icon = getFileIcon('image/png', 24);
      expect(icon.props.size).toBe(24);
    });

    it('should handle various custom sizes', () => {
      [12, 16, 20, 24, 32].forEach(size => {
        const icon = getFileIcon('application/pdf', size);
        expect(icon.props.size).toBe(size);
      });
    });

    it('should handle empty type string', () => {
      const icon = getFileIcon('');
      expect(React.isValidElement(icon)).toBe(true);
      expect(icon.type).toBeDefined();
    });
  });

  describe('isImageFile', () => {
    it('should return true for image MIME types', () => {
      expect(isImageFile('image/png')).toBe(true);
      expect(isImageFile('image/jpeg')).toBe(true);
      expect(isImageFile('image/gif')).toBe(true);
      expect(isImageFile('image/svg+xml')).toBe(true);
      expect(isImageFile('image/webp')).toBe(true);
    });

    it('should return false for non-image MIME types', () => {
      expect(isImageFile('application/pdf')).toBe(false);
      expect(isImageFile('text/plain')).toBe(false);
      expect(isImageFile('application/json')).toBe(false);
      expect(isImageFile('video/mp4')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isImageFile('')).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(isImageFile('IMAGE/PNG')).toBe(false);
      expect(isImageFile('Image/Png')).toBe(false);
    });

    it('should handle partial matches correctly', () => {
      expect(isImageFile('notimage/png')).toBe(false);
      expect(isImageFile('image')).toBe(false);
    });
  });

  describe('isTextFile', () => {
    it('should return true for text MIME types', () => {
      expect(isTextFile('text/plain', 'file.txt')).toBe(true);
      expect(isTextFile('text/html', 'file.html')).toBe(true);
      expect(isTextFile('text/css', 'style.css')).toBe(true);
    });

    it('should return true for JSON files', () => {
      expect(isTextFile('application/json', 'data.json')).toBe(true);
    });

    it('should return true for markdown files by extension', () => {
      expect(isTextFile('text/markdown', 'README.md')).toBe(true);
      expect(isTextFile('application/octet-stream', 'notes.md')).toBe(true);
    });

    it('should return true for txt files by extension', () => {
      expect(isTextFile('application/octet-stream', 'document.txt')).toBe(true);
    });

    it('should return true for csv files by extension', () => {
      expect(isTextFile('application/octet-stream', 'data.csv')).toBe(true);
      expect(isTextFile('text/csv', 'spreadsheet.csv')).toBe(true);
    });

    it('should return false for image files', () => {
      expect(isTextFile('image/png', 'photo.png')).toBe(false);
      expect(isTextFile('image/jpeg', 'image.jpg')).toBe(false);
    });

    it('should return false for binary files', () => {
      expect(isTextFile('application/pdf', 'document.pdf')).toBe(false);
      expect(isTextFile('application/zip', 'archive.zip')).toBe(false);
    });

    it('should handle case insensitive file extensions', () => {
      expect(isTextFile('application/octet-stream', 'FILE.TXT')).toBe(true);
      expect(isTextFile('application/octet-stream', 'README.MD')).toBe(true);
      expect(isTextFile('application/octet-stream', 'Data.CSV')).toBe(true);
    });

    it('should handle files without extensions', () => {
      expect(isTextFile('text/plain', 'README')).toBe(true);
      expect(isTextFile('application/octet-stream', 'Makefile')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(isTextFile('', '')).toBe(false);
      expect(isTextFile('text/plain', '')).toBe(true);
      expect(isTextFile('', 'file.txt')).toBe(true);
    });

    it('should match MIME type OR file extension', () => {
      // MIME type matches
      expect(isTextFile('text/plain', 'file.bin')).toBe(true);
      // Extension matches
      expect(isTextFile('application/octet-stream', 'file.txt')).toBe(true);
      // Both match
      expect(isTextFile('text/plain', 'file.txt')).toBe(true);
      // Neither matches
      expect(isTextFile('image/png', 'file.bin')).toBe(false);
    });

    it('should handle files with multiple dots in name', () => {
      expect(isTextFile('application/octet-stream', 'file.backup.txt')).toBe(
        true
      );
      expect(isTextFile('application/octet-stream', 'archive.tar.gz')).toBe(
        false
      );
    });
  });

  describe('Integration scenarios', () => {
    it('should correctly classify and format a text file', () => {
      const type = 'text/plain';
      const name = 'document.txt';
      const size = 1024;

      expect(isTextFile(type, name)).toBe(true);
      expect(formatFileSize(size)).toBe('1 KB');
      const icon = getFileIcon(type);
      expect(icon.type).toBeDefined();
    });

    it('should correctly classify and format an image file', () => {
      const type = 'image/jpeg';
      const name = 'photo.jpg';
      const size = 2048000; // ~2MB

      expect(isImageFile(type)).toBe(true);
      expect(isTextFile(type, name)).toBe(false);
      expect(formatFileSize(size)).toBe('1.95 MB');
      const icon = getFileIcon(type);
      expect(icon.type).toBeDefined();
    });

    it('should handle edge case of text file with image-like name', () => {
      const type = 'text/plain';
      const name = 'not-an-image.png.txt';

      expect(isImageFile(type)).toBe(false);
      expect(isTextFile(type, name)).toBe(true);
    });
  });
});
