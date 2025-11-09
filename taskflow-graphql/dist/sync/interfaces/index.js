/**
 * Sync Interfaces Module
 *
 * 同期機能の抽象化インターフェースとDIコンテナをエクスポート
 */
// DI Container
export { DIContainer, Lifetime, DIContainerError, CircularDependencyError, DependencyNotFoundError, globalContainer, Injectable, Inject, } from './di-container';
// DI Container Integration
export { setupProductionContainer, setupTestContainer, setupEnvironmentContainer, initializeAppContainer, getAppContainer, resetAppContainer, } from './di-container.integration';
//# sourceMappingURL=index.js.map