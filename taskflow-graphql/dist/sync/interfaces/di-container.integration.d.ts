/**
 * DI Container Integration Examples
 *
 * 実際のSync Infrastructure（FileWatcher、MarkdownParser等）との統合例
 */
import { DIContainer } from './di-container';
/**
 * 本番環境用のDIコンテナセットアップ
 *
 * 実際のアプリケーションで使用するコンテナの設定例
 */
export declare function setupProductionContainer(workspacePath: string): DIContainer;
/**
 * テスト環境用のDIコンテナセットアップ
 *
 * モックを使用したテスト用のコンテナ設定例
 */
export declare function setupTestContainer(): DIContainer;
/**
 * Example 1: Production Usage
 */
export declare function exampleProductionUsage(): Promise<void>;
/**
 * Example 2: Test Usage
 */
export declare function exampleTestUsage(): Promise<void>;
/**
 * Example 3: Custom Container for Specific Feature
 */
export declare function exampleFeatureSpecificContainer(): DIContainer;
/**
 * Example 4: Environment-based Configuration
 */
export declare function setupEnvironmentContainer(workspacePath: string): DIContainer;
/**
 * Example 5: Diagnostics and Monitoring
 */
export declare function exampleDiagnostics(): void;
/**
 * Example 6: Error Handling in Integration
 */
export declare function exampleErrorHandling(): Promise<void>;
/**
 * アプリケーション全体で共有するコンテナを初期化
 */
export declare function initializeAppContainer(workspacePath: string): void;
/**
 * アプリケーションコンテナを取得
 */
export declare function getAppContainer(): DIContainer;
/**
 * アプリケーションコンテナをリセット（主にテスト用）
 */
export declare function resetAppContainer(): void;
//# sourceMappingURL=di-container.integration.d.ts.map