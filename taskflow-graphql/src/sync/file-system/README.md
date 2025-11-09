# FileSystem Abstraction

ファイルシステム操作の抽象化レイヤー。実環境とテスト環境で同じインターフェースを使用可能。

## Overview

- **FileSystem Interface**: 統一されたファイル操作インターフェース
- **RealFileSystem**: Node.js `fs.promises` をラップした実装
- **MockFileSystem**: テスト用のインメモリ実装

## Installation

```typescript
import {
  RealFileSystem,
  MockFileSystem,
  realFileSystem
} from './file-system/index.js';
import type { FileSystem } from './interfaces/file-system.interface.js';
```

## Usage

### 実環境での使用 (RealFileSystem)

```typescript
import { realFileSystem } from './file-system/index.js';

// ファイル読み込み
const content = await realFileSystem.readFile('/path/to/file.txt');

// ファイル書き込み
await realFileSystem.writeFile('/path/to/file.txt', 'Hello World');

// ファイル情報取得
const stats = await realFileSystem.stat('/path/to/file.txt');
console.log(`Size: ${stats.size}, Modified: ${stats.mtime}`);

// 存在確認
const exists = await realFileSystem.exists('/path/to/file.txt');
```

### テスト環境での使用 (MockFileSystem)

```typescript
import { MockFileSystem } from './file-system/index.js';

const mockFs = new MockFileSystem();

// テストデータのセットアップ
mockFs.setFile('/test/data.json', JSON.stringify({ id: 1, name: 'Test' }));

// テスト対象コードで使用
const data = await mockFs.readFile('/test/data.json');

// クリーンアップ
mockFs.clear();
```

### Dependency Injection

```typescript
import type { FileSystem } from './interfaces/file-system.interface.js';
import { realFileSystem } from './file-system/index.js';

class DataRepository {
  constructor(private fs: FileSystem) {}

  async loadData(path: string): Promise<string> {
    return await this.fs.readFile(path);
  }

  async saveData(path: string, data: string): Promise<void> {
    await this.fs.writeFile(path, data);
  }
}

// 実環境
const prodRepo = new DataRepository(realFileSystem);

// テスト環境
const mockFs = new MockFileSystem();
mockFs.setFile('/test/data.txt', 'Test data');
const testRepo = new DataRepository(mockFs);
```

## API Reference

### FileSystem Interface

```typescript
interface FileSystem {
  readFile(path: string, encoding?: BufferEncoding): Promise<string>;
  writeFile(path: string, content: string, encoding?: BufferEncoding): Promise<void>;
  stat(path: string): Promise<FileSystemStats>;
  exists(path: string): Promise<boolean>;
}

interface FileSystemStats {
  size: number;
  mtime: Date;
}
```

### RealFileSystem

Node.js `fs.promises` をラップした実装。

**特徴:**
- 実際のファイルシステムを操作
- エラーメッセージを強化
- シングルトンインスタンス `realFileSystem` 提供

**エラーハンドリング:**
```typescript
try {
  const content = await realFileSystem.readFile('/path/to/file.txt');
} catch (error) {
  // Error: Failed to read file at /path/to/file.txt: ENOENT: no such file or directory
}
```

### MockFileSystem

テスト用のインメモリ実装。

**テストヘルパーメソッド:**

```typescript
const mockFs = new MockFileSystem();

// ファイルを直接セット（mtimeも指定可能）
mockFs.setFile('/test.txt', 'content', new Date('2025-01-01'));

// 全ファイルクリア
mockFs.clear();

// ファイル削除
mockFs.deleteFile('/test.txt');

// 全パス取得
const paths = mockFs.getAllPaths();

// ファイル数取得
const count = mockFs.getFileCount();
```

**テスト例:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MockFileSystem } from './file-system/mock-file-system.js';

describe('MyService', () => {
  let mockFs: MockFileSystem;

  beforeEach(() => {
    mockFs = new MockFileSystem();
  });

  it('ファイルからデータを読み込む', async () => {
    mockFs.setFile('/data.json', '{"key":"value"}');

    const service = new MyService(mockFs);
    const data = await service.loadData();

    expect(data).toEqual({ key: 'value' });
  });
});
```

## Design Principles

### 1. 型安全性
- TypeScript strict mode 完全対応
- `BufferEncoding` 型による安全なエンコーディング指定
- 明確な戻り値型定義

### 2. テスタビリティ
- インターフェースベースの設計
- 簡単なDependency Injection
- Mock実装のテストヘルパーメソッド

### 3. エラーハンドリング
- 一貫したエラーメッセージ形式
- パスを含む詳細なエラー情報
- ENOENT等の標準エラーコード互換

### 4. パフォーマンス
- RealFileSystem: ゼロオーバーヘッド（直接fs.promisesを使用）
- MockFileSystem: Map ベースの高速アクセス
- 不要なメモリコピーを最小化

## Testing

```bash
# MockFileSystemのテスト
npx vitest run src/sync/file-system/__tests__/file-system.test.ts

# RealFileSystemのテスト
npx vitest run src/sync/file-system/__tests__/real-file-system.test.ts

# 全テスト実行
npx vitest run src/sync/file-system/__tests__/
```

## Integration Example

実際のプロジェクトでの統合例：

```typescript
// src/services/sync-service.ts
import type { FileSystem } from '../interfaces/file-system.interface.js';
import { realFileSystem } from '../file-system/index.js';

export class SyncService {
  constructor(
    private fs: FileSystem = realFileSystem
  ) {}

  async syncFile(sourcePath: string, targetPath: string): Promise<void> {
    const exists = await this.fs.exists(sourcePath);
    if (!exists) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }

    const content = await this.fs.readFile(sourcePath);
    await this.fs.writeFile(targetPath, content);

    const sourceStats = await this.fs.stat(sourcePath);
    const targetStats = await this.fs.stat(targetPath);

    console.log(`Synced: ${sourceStats.size} bytes`);
  }
}

// テスト
import { MockFileSystem } from '../file-system/index.js';

const mockFs = new MockFileSystem();
mockFs.setFile('/source.txt', 'Test content');

const service = new SyncService(mockFs);
await service.syncFile('/source.txt', '/target.txt');

expect(await mockFs.readFile('/target.txt')).toBe('Test content');
```

## Security Considerations

### Path Traversal Protection

FileSystemインターフェース自体はパストラバーサル対策を含みません。
使用時は適切なパス検証を実施してください：

```typescript
import { realFileSystem } from './file-system/index.js';
import { resolve, normalize } from 'node:path';

function securePath(basePath: string, userPath: string): string {
  const normalizedPath = normalize(userPath);
  const resolvedPath = resolve(basePath, normalizedPath);

  if (!resolvedPath.startsWith(basePath)) {
    throw new Error('Path traversal detected');
  }

  return resolvedPath;
}

const safePath = securePath('/allowed/dir', userInput);
await realFileSystem.readFile(safePath);
```

## License

MIT
