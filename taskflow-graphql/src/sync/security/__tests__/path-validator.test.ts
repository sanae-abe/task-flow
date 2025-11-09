import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PathValidator } from '../path-validator';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';

describe('PathValidator', () => {
  let validator: PathValidator;
  let testDir: string;

  beforeEach(async () => {
    // テスト用一時ディレクトリを作成
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'path-validator-test-'));
    validator = new PathValidator(testDir);
  });

  afterEach(async () => {
    // テスト用一時ディレクトリを削除
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // 削除失敗は無視
    }
  });

  describe('validate() - 同期版', () => {
    it('should validate a normal file path', () => {
      const result = validator.validate('test.md');
      expect(result).toBe(path.join(testDir, 'test.md'));
    });

    it('should validate a nested file path', () => {
      const result = validator.validate('subdir/test.md');
      expect(result).toBe(path.join(testDir, 'subdir', 'test.md'));
    });

    it('should reject path traversal with ../', () => {
      expect(() => {
        validator.validate('../../../etc/passwd');
      }).toThrow('Path traversal detected');
    });

    it('should reject path traversal with absolute path outside base', () => {
      expect(() => {
        validator.validate('/etc/passwd');
      }).toThrow('Path traversal detected');
    });

    it('should reject null byte attack', () => {
      expect(() => {
        validator.validate('test\0.md');
      }).toThrow('null byte detected');
    });

    it('should reject empty path', () => {
      expect(() => {
        validator.validate('');
      }).toThrow('path must be a non-empty string');
    });

    it('should reject non-string path', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        validator.validate(null);
      }).toThrow('path must be a non-empty string');
    });
  });

  describe('validate() - Windows代替データストリーム対策', () => {
    it('should allow normal Windows path with drive letter', () => {
      if (process.platform === 'win32') {
        const validator = new PathValidator('C:\\Users\\test');
        const result = validator.validate('test.md');
        expect(result).toContain('test.md');
      } else {
        // Non-Windows環境ではスキップ
        expect(true).toBe(true);
      }
    });

    it('should reject Windows alternate data streams', () => {
      if (process.platform === 'win32') {
        const validator = new PathValidator('C:\\Users\\test');
        expect(() => {
          validator.validate('test.md:hidden.txt');
        }).toThrow('alternate data streams not allowed');
      } else {
        // Non-Windows環境ではスキップ
        expect(true).toBe(true);
      }
    });
  });

  describe('validateAsync() - シンボリックリンク対策', () => {
    it('should validate a normal file path (async)', async () => {
      // 実ファイルを作成
      const testFile = path.join(testDir, 'test.md');
      await fs.writeFile(testFile, 'test content');

      const result = await validator.validateAsync('test.md');
      // validateAsyncは実パス（シンボリックリンク解決済み）を返す
      const expectedRealPath = await fs.realpath(testFile);
      expect(result).toBe(expectedRealPath);
    });

    it('should allow non-existent file (for new file creation)', async () => {
      const result = await validator.validateAsync('new-file.md');
      expect(result).toBe(path.join(testDir, 'new-file.md'));
    });

    it('should reject symlink pointing outside base path', async () => {
      // 外部ファイルを作成
      const outsideDir = await fs.mkdtemp(
        path.join(os.tmpdir(), 'outside-test-')
      );
      const outsideFile = path.join(outsideDir, 'secret.txt');
      await fs.writeFile(outsideFile, 'secret content');

      // シンボリックリンクを作成
      const symlinkPath = path.join(testDir, 'evil-link.txt');
      await fs.symlink(outsideFile, symlinkPath);

      // シンボリックリンク経由のアクセスを拒否
      await expect(async () => {
        await validator.validateAsync('evil-link.txt');
      }).rejects.toThrow('Symbolic link traversal detected');

      // クリーンアップ
      await fs.rm(outsideDir, { recursive: true, force: true });
    });

    it('should allow symlink within base path', async () => {
      // ベースパス内にファイルとシンボリックリンクを作成
      const targetFile = path.join(testDir, 'target.md');
      await fs.writeFile(targetFile, 'target content');

      const symlinkPath = path.join(testDir, 'link.md');
      await fs.symlink(targetFile, symlinkPath);

      // ベースパス内のシンボリックリンクは許可
      const result = await validator.validateAsync('link.md');
      // シンボリックリンク解決後の実パスを期待
      const expectedRealPath = await fs.realpath(targetFile);
      expect(result).toBe(expectedRealPath);
    });

    it('should reject nested symlink pointing outside base path', async () => {
      // 外部ディレクトリを作成
      const outsideDir = await fs.mkdtemp(
        path.join(os.tmpdir(), 'outside-nested-')
      );
      const outsideFile = path.join(outsideDir, 'secret.txt');
      await fs.writeFile(outsideFile, 'secret content');

      // ベースパス内にディレクトリを作成
      const subDir = path.join(testDir, 'subdir');
      await fs.mkdir(subDir);

      // サブディレクトリ内にシンボリックリンクを作成
      const symlinkPath = path.join(subDir, 'evil-link.txt');
      await fs.symlink(outsideFile, symlinkPath);

      // ネストされたシンボリックリンク経由のアクセスを拒否
      await expect(async () => {
        await validator.validateAsync('subdir/evil-link.txt');
      }).rejects.toThrow('Symbolic link traversal detected');

      // クリーンアップ
      await fs.rm(outsideDir, { recursive: true, force: true });
    });
  });

  describe('validateFileSize()', () => {
    it('should pass for file within size limit', async () => {
      const testFile = path.join(testDir, 'small.md');
      await fs.writeFile(testFile, 'small content'); // < 5MB

      await expect(
        validator.validateFileSize(testFile, 5)
      ).resolves.toBeUndefined();
    });

    it('should reject file exceeding size limit', async () => {
      const testFile = path.join(testDir, 'large.md');
      // 6MB のファイルを作成
      const largeContent = 'x'.repeat(6 * 1024 * 1024);
      await fs.writeFile(testFile, largeContent);

      await expect(validator.validateFileSize(testFile, 5)).rejects.toThrow(
        'File size exceeds 5MB limit'
      );
    });
  });

  describe('exists()', () => {
    it('should return true for existing file', async () => {
      const testFile = path.join(testDir, 'exists.md');
      await fs.writeFile(testFile, 'content');

      const result = await validator.exists(testFile);
      expect(result).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      const testFile = path.join(testDir, 'not-exists.md');

      const result = await validator.exists(testFile);
      expect(result).toBe(false);
    });
  });

  describe('isReadable()', () => {
    it('should return true for readable file', async () => {
      const testFile = path.join(testDir, 'readable.md');
      await fs.writeFile(testFile, 'content');

      const result = await validator.isReadable(testFile);
      expect(result).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      const testFile = path.join(testDir, 'not-readable.md');

      const result = await validator.isReadable(testFile);
      expect(result).toBe(false);
    });
  });

  describe('isWritable()', () => {
    it('should return true for writable file', async () => {
      const testFile = path.join(testDir, 'writable.md');
      await fs.writeFile(testFile, 'content');

      const result = await validator.isWritable(testFile);
      expect(result).toBe(true);
    });

    it('should return false for non-existent file', async () => {
      const testFile = path.join(testDir, 'not-writable.md');

      const result = await validator.isWritable(testFile);
      expect(result).toBe(false);
    });
  });

  describe('getAllowedBasePath()', () => {
    it('should return the allowed base path', () => {
      const result = validator.getAllowedBasePath();
      expect(result).toBe(testDir);
    });
  });
});
