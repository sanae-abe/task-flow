/**
 * Sync Interfaces Module
 *
 * 同期機能の抽象化インターフェースとDIコンテナをエクスポート
 */
export type { FileSystem, FileSystemStats } from './file-system.interface';
export { DIContainer, Lifetime, DIContainerError, CircularDependencyError, DependencyNotFoundError, globalContainer, Injectable, Inject, type Factory, } from './di-container';
export { setupProductionContainer, setupTestContainer, setupEnvironmentContainer, initializeAppContainer, getAppContainer, resetAppContainer, } from './di-container.integration';
//# sourceMappingURL=index.d.ts.map