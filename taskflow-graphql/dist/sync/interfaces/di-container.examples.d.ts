/**
 * DI Container Usage Examples
 *
 * DIコンテナの実用的な使用例とベストプラクティス
 */
import { DIContainer } from './di-container';
/**
 * シングルトンの基本的な登録と解決
 */
export declare function example1_BasicSingleton(): void;
/**
 * トランジェントの登録（毎回新しいインスタンス）
 */
export declare function example2_Transient(): void;
/**
 * ファクトリー登録（パラメータ付き生成）
 */
export declare function example3_Factory(): void;
/**
 * インスタンスの直接登録
 */
export declare function example4_Instance(): void;
/**
 * 依存関係のチェーン
 */
export declare function example5_DependencyChain(): void;
/**
 * 循環依存の検出
 */
export declare function example6_CircularDependency(): void;
/**
 * 子コンテナ（階層的なDI）
 */
export declare function example7_ChildContainer(): void;
/**
 * コンテナの診断情報
 */
export declare function example8_Diagnostics(): void;
/**
 * 実際のアプリケーションセットアップ
 */
export declare function example9_RealWorldSetup(): DIContainer;
/**
 * グローバルコンテナの使用
 */
export declare function example10_GlobalContainer(): void;
/**
 * メソッドチェーン
 */
export declare function example11_MethodChaining(): void;
/**
 * エラーハンドリング
 */
export declare function example12_ErrorHandling(): void;
/**
 * テストでのモック使用
 */
export declare function example13_TestingWithMock(): void;
/**
 * 条件付き登録
 */
export declare function example14_ConditionalRegistration(): void;
/**
 * 遅延ロード（必要になるまでインスタンス化しない）
 */
export declare function example15_LazyLoading(): void;
//# sourceMappingURL=di-container.examples.d.ts.map