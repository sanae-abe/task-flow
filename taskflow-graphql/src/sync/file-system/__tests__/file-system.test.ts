import { describe, it, expect, beforeEach } from 'vitest';
import { MockFileSystem } from '../mock-file-system.js';
import type { FileSystem } from '../../interfaces/file-system.interface.js';

describe('MockFileSystem', () => {
  let fs: FileSystem;

  beforeEach(() => {
    fs = new MockFileSystem();
  });

  describe('readFile', () => {
    it('存在するファイルを読み込める', async () => {
      const mockFs = fs as MockFileSystem;
      mockFs.setFile('/test.txt', 'Hello World');

      const content = await fs.readFile('/test.txt');
      expect(content).toBe('Hello World');
    });

    it('存在しないファイルはエラー', async () => {
      await expect(fs.readFile('/nonexistent.txt')).rejects.toThrow(
        "ENOENT: no such file or directory, open '/nonexistent.txt'"
      );
    });
  });

  describe('writeFile', () => {
    it('ファイルを書き込める', async () => {
      await fs.writeFile('/test.txt', 'Test content');

      const content = await fs.readFile('/test.txt');
      expect(content).toBe('Test content');
    });

    it('既存ファイルを上書きできる', async () => {
      await fs.writeFile('/test.txt', 'First');
      await fs.writeFile('/test.txt', 'Second');

      const content = await fs.readFile('/test.txt');
      expect(content).toBe('Second');
    });
  });

  describe('stat', () => {
    it('ファイル情報を取得できる', async () => {
      const mockFs = fs as MockFileSystem;
      const mtime = new Date('2025-01-01T00:00:00Z');
      mockFs.setFile('/test.txt', 'Hello', mtime);

      const stats = await fs.stat('/test.txt');
      expect(stats.size).toBe(5); // "Hello" = 5 bytes
      expect(stats.mtime).toEqual(mtime);
    });

    it('存在しないファイルはエラー', async () => {
      await expect(fs.stat('/nonexistent.txt')).rejects.toThrow(
        "ENOENT: no such file or directory, stat '/nonexistent.txt'"
      );
    });

    it('マルチバイト文字のサイズを正確に計算', async () => {
      await fs.writeFile('/japanese.txt', 'こんにちは');
      const stats = await fs.stat('/japanese.txt');
      expect(stats.size).toBe(15); // UTF-8で5文字×3バイト
    });
  });

  describe('exists', () => {
    it('存在するファイルはtrueを返す', async () => {
      const mockFs = fs as MockFileSystem;
      mockFs.setFile('/test.txt', 'content');

      const exists = await fs.exists('/test.txt');
      expect(exists).toBe(true);
    });

    it('存在しないファイルはfalseを返す', async () => {
      const exists = await fs.exists('/nonexistent.txt');
      expect(exists).toBe(false);
    });
  });

  describe('テストヘルパーメソッド', () => {
    it('clearで全ファイルを削除', async () => {
      const mockFs = fs as MockFileSystem;
      mockFs.setFile('/file1.txt', 'content1');
      mockFs.setFile('/file2.txt', 'content2');

      expect(mockFs.getFileCount()).toBe(2);

      mockFs.clear();

      expect(mockFs.getFileCount()).toBe(0);
      expect(await fs.exists('/file1.txt')).toBe(false);
      expect(await fs.exists('/file2.txt')).toBe(false);
    });

    it('deleteFileで特定ファイルを削除', async () => {
      const mockFs = fs as MockFileSystem;
      mockFs.setFile('/file1.txt', 'content1');
      mockFs.setFile('/file2.txt', 'content2');

      const deleted = mockFs.deleteFile('/file1.txt');

      expect(deleted).toBe(true);
      expect(await fs.exists('/file1.txt')).toBe(false);
      expect(await fs.exists('/file2.txt')).toBe(true);
    });

    it('getAllPathsで全パスを取得', async () => {
      const mockFs = fs as MockFileSystem;
      mockFs.setFile('/dir1/file1.txt', 'content1');
      mockFs.setFile('/dir2/file2.txt', 'content2');

      const paths = mockFs.getAllPaths();

      expect(paths).toHaveLength(2);
      expect(paths).toContain('/dir1/file1.txt');
      expect(paths).toContain('/dir2/file2.txt');
    });
  });

  describe('型安全性', () => {
    it('BufferEncodingパラメータを受け付ける', async () => {
      await fs.writeFile('/test.txt', 'Hello', 'utf-8');
      const content = await fs.readFile('/test.txt', 'utf-8');
      expect(content).toBe('Hello');
    });

    it('FileSystemインターフェースに準拠', () => {
      // TypeScriptコンパイル時に型チェック
      const instance: FileSystem = new MockFileSystem();
      expect(instance).toBeDefined();
    });
  });
});
