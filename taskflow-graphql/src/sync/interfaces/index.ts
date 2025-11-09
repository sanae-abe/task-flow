/**
 * Sync Interfaces Module
 *
 * 同期機能の抽象化インターフェースとDIコンテナをエクスポート
 */

// File System Interface
export type { FileSystem, FileSystemStats } from './file-system.interface';

// DI Container
export {
  DIContainer,
  Lifetime,
  DIContainerError,
  CircularDependencyError,
  DependencyNotFoundError,
  globalContainer,
  Injectable,
  Inject,
  type Factory,
} from './di-container';

// DI Container Integration
export {
  setupProductionContainer,
  setupTestContainer,
  setupEnvironmentContainer,
  initializeAppContainer,
  getAppContainer,
  resetAppContainer,
} from './di-container.integration';
