import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { RealFileSystem, realFileSystem } from '../real-file-system.js';
import type { FileSystem } from '../../interfaces/file-system.interface.js';

describe('RealFileSystem', () => {
  let fileSystem: FileSystem;
  let testDir: string;
  let testFilePath: string;

  beforeEach(async () => {
    fileSystem = new RealFileSystem();
    // 一時ディレクトリに専用のテストディレクトリを作成
    testDir = join(tmpdir(), `real-fs-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    testFilePath = join(testDir, 'test.txt');
  });

  afterEach(async () => {
    // テストディレクトリをクリーンアップ
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // クリーンアップ失敗は無視
    }
  });

  describe('readFile', () => {
    it('実ファイルを読み込める', async () => {
      await fs.writeFile(testFilePath, 'Test content', 'utf-8');

      const content = await fileSystem.readFile(testFilePath);
      expect(content).toBe('Test content');
    });

    it('存在しないファイルはエラー', async () => {
      const nonexistentPath = join(testDir, 'nonexistent.txt');
      await expect(fileSystem.readFile(nonexistentPath)).rejects.toThrow(
        `Failed to read file at ${nonexistentPath}`
      );
    });

    it('UTF-8エンコーディングを指定できる', async () => {
      await fs.writeFile(testFilePath, 'こんにちは', 'utf-8');

      const content = await fileSystem.readFile(testFilePath, 'utf-8');
      expect(content).toBe('こんにちは');
    });
  });

  describe('writeFile', () => {
    it('実ファイルに書き込める', async () => {
      await fileSystem.writeFile(testFilePath, 'Write test');

      const content = await fs.readFile(testFilePath, 'utf-8');
      expect(content).toBe('Write test');
    });

    it('既存ファイルを上書きできる', async () => {
      await fs.writeFile(testFilePath, 'Original', 'utf-8');
      await fileSystem.writeFile(testFilePath, 'Overwritten');

      const content = await fs.readFile(testFilePath, 'utf-8');
      expect(content).toBe('Overwritten');
    });

    it('書き込みエラーは適切にスロー', async () => {
      const invalidPath = join(testDir, 'invalid', 'deep', 'path', 'file.txt');
      await expect(
        fileSystem.writeFile(invalidPath, 'content')
      ).rejects.toThrow(`Failed to write file at ${invalidPath}`);
    });
  });

  describe('stat', () => {
    it('ファイル情報を取得できる', async () => {
      const content = 'Test content';
      const beforeWrite = Date.now();
      await fs.writeFile(testFilePath, content, 'utf-8');

      const stats = await fileSystem.stat(testFilePath);

      expect(stats.size).toBe(Buffer.byteLength(content, 'utf-8'));
      expect(stats.mtime).toBeInstanceOf(Date);
      expect(stats.mtime.getTime()).toBeGreaterThanOrEqual(beforeWrite - 1000);
      expect(stats.mtime.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
    });

    it('存在しないファイルはエラー', async () => {
      const nonexistentPath = join(testDir, 'nonexistent.txt');
      await expect(fileSystem.stat(nonexistentPath)).rejects.toThrow(
        `Failed to stat file at ${nonexistentPath}`
      );
    });

    it('マルチバイト文字のサイズを正確に計算', async () => {
      const content = 'こんにちは世界';
      await fs.writeFile(testFilePath, content, 'utf-8');

      const stats = await fileSystem.stat(testFilePath);
      expect(stats.size).toBe(Buffer.byteLength(content, 'utf-8'));
    });
  });

  describe('exists', () => {
    it('存在するファイルはtrueを返す', async () => {
      await fs.writeFile(testFilePath, 'content', 'utf-8');

      const exists = await fileSystem.exists(testFilePath);
      expect(exists).toBe(true);
    });

    it('存在しないファイルはfalseを返す', async () => {
      const nonexistentPath = join(testDir, 'nonexistent.txt');
      const exists = await fileSystem.exists(nonexistentPath);
      expect(exists).toBe(false);
    });

    it('ディレクトリもtrueを返す', async () => {
      const exists = await fileSystem.exists(testDir);
      expect(exists).toBe(true);
    });
  });

  describe('シングルトンインスタンス', () => {
    it('realFileSystemは正常に動作', async () => {
      await realFileSystem.writeFile(testFilePath, 'Singleton test');

      const content = await realFileSystem.readFile(testFilePath);
      expect(content).toBe('Singleton test');
    });

    it('FileSystemインターフェースに準拠', () => {
      // TypeScriptコンパイル時に型チェック
      const instance: FileSystem = realFileSystem;
      expect(instance).toBeDefined();
    });
  });

  describe('エラーハンドリング', () => {
    it('readFile: 権限エラーを適切に処理', async () => {
      if (process.platform === 'win32') {
        // Windows環境ではスキップ
        return;
      }

      await fs.writeFile(testFilePath, 'content', 'utf-8');
      await fs.chmod(testFilePath, 0o000); // 読み取り不可

      await expect(fileSystem.readFile(testFilePath)).rejects.toThrow(
        `Failed to read file at ${testFilePath}`
      );

      // クリーンアップのために権限を戻す
      await fs.chmod(testFilePath, 0o644);
    });

    it('writeFile: 存在しないディレクトリへの書き込みはエラー', async () => {
      const deepPath = join(testDir, 'nonexistent', 'dir', 'file.txt');
      await expect(fileSystem.writeFile(deepPath, 'content')).rejects.toThrow(
        `Failed to write file at ${deepPath}`
      );
    });
  });
});
