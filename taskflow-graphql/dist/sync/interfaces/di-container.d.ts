/**
 * Dependency Injection Container
 *
 * 型安全なDIコンテナで、シングルトン、トランジェント、ファクトリーをサポート。
 * 循環依存の検出とエラーハンドリングを提供します。
 *
 * @example
 * ```typescript
 * const container = new DIContainer();
 *
 * // シングルトン登録
 * container.registerSingleton('logger', () => Logger.getInstance());
 *
 * // トランジェント登録
 * container.registerTransient('parser', () => new MarkdownParser());
 *
 * // ファクトリー登録
 * container.registerFactory('fileWatcher', (path: string) => new FileWatcher(path));
 *
 * // 依存性解決
 * const logger = container.resolve<Logger>('logger');
 * const parser = container.resolve<MarkdownParser>('parser');
 * const watcher = container.resolveFactory<FileWatcher, [string]>('fileWatcher', '/path');
 * ```
 */
/**
 * 依存性のライフタイム
 */
export declare enum Lifetime {
    /** シングルトン: コンテナ内で1つのインスタンスのみ */
    Singleton = "singleton",
    /** トランジェント: 解決のたびに新しいインスタンス */
    Transient = "transient",
    /** ファクトリー: パラメータを受け取って新しいインスタンスを生成 */
    Factory = "factory"
}
/**
 * ファクトリー関数の型
 */
export type Factory<T, TArgs extends any[] = []> = (...args: TArgs) => T;
/**
 * DIコンテナエラー
 */
export declare class DIContainerError extends Error {
    readonly key?: string | undefined;
    constructor(message: string, key?: string | undefined);
}
/**
 * 循環依存エラー
 */
export declare class CircularDependencyError extends DIContainerError {
    readonly cycle: string[];
    constructor(message: string, cycle: string[], key?: string);
}
/**
 * 依存性未登録エラー
 */
export declare class DependencyNotFoundError extends DIContainerError {
    constructor(key: string);
}
/**
 * Dependency Injection Container
 *
 * 型安全な依存性注入コンテナ。
 * シングルトン、トランジェント、ファクトリーのライフタイムをサポートし、
 * 循環依存の検出と自動解決を提供します。
 */
export declare class DIContainer {
    /** 登録された依存性 */
    private registrations;
    /** 解決中のキー（循環依存検出用） */
    private resolvingKeys;
    /** 親コンテナ（階層的なDI用） */
    private parent?;
    /**
     * DIContainerを作成します
     *
     * @param parent 親コンテナ（オプション）
     */
    constructor(parent?: DIContainer);
    /**
     * 依存性を登録します
     *
     * @param key 依存性のキー
     * @param factory ファクトリー関数
     * @param lifetime ライフタイム
     * @param dependencies 依存するキー（循環依存検出用）
     * @returns このコンテナ（メソッドチェーン用）
     */
    register<T>(key: string, factory: Factory<T>, lifetime?: Lifetime, dependencies?: string[]): this;
    /**
     * シングルトンとして依存性を登録します
     *
     * コンテナ内で1つのインスタンスのみが作成され、再利用されます。
     *
     * @param key 依存性のキー
     * @param factory ファクトリー関数
     * @param dependencies 依存するキー（循環依存検出用）
     * @returns このコンテナ（メソッドチェーン用）
     */
    registerSingleton<T>(key: string, factory: Factory<T>, dependencies?: string[]): this;
    /**
     * トランジェントとして依存性を登録します
     *
     * 解決のたびに新しいインスタンスが作成されます。
     *
     * @param key 依存性のキー
     * @param factory ファクトリー関数
     * @param dependencies 依存するキー（循環依存検出用）
     * @returns このコンテナ（メソッドチェーン用）
     */
    registerTransient<T>(key: string, factory: Factory<T>, dependencies?: string[]): this;
    /**
     * ファクトリーとして依存性を登録します
     *
     * パラメータを受け取って新しいインスタンスを生成します。
     *
     * @param key 依存性のキー
     * @param factory ファクトリー関数
     * @param dependencies 依存するキー（循環依存検出用）
     * @returns このコンテナ（メソッドチェーン用）
     */
    registerFactory<T, TArgs extends any[] = []>(key: string, factory: Factory<T, TArgs>, dependencies?: string[]): this;
    /**
     * インスタンスを直接登録します（シングルトン）
     *
     * @param key 依存性のキー
     * @param instance インスタンス
     * @returns このコンテナ（メソッドチェーン用）
     */
    registerInstance<T>(key: string, instance: T): this;
    /**
     * 依存性を解決します
     *
     * @param key 依存性のキー
     * @returns 解決されたインスタンス
     * @throws {DependencyNotFoundError} 依存性が見つからない場合
     * @throws {CircularDependencyError} 循環依存が検出された場合
     */
    resolve<T>(key: string): T;
    /**
     * ファクトリー依存性を解決します
     *
     * @param key 依存性のキー
     * @param args ファクトリー関数に渡す引数
     * @returns 解決されたインスタンス
     * @throws {DependencyNotFoundError} 依存性が見つからない場合
     * @throws {DIContainerError} ファクトリーでない場合
     */
    resolveFactory<T, TArgs extends any[] = []>(key: string, ...args: TArgs): T;
    /**
     * 依存性が登録されているか確認します
     *
     * @param key 依存性のキー
     * @returns 登録されている場合true
     */
    has(key: string): boolean;
    /**
     * 依存性の登録を削除します
     *
     * @param key 依存性のキー
     * @returns 削除された場合true
     */
    unregister(key: string): boolean;
    /**
     * すべての登録をクリアします
     */
    clear(): void;
    /**
     * 登録されているすべてのキーを取得します
     *
     * @param includeParent 親コンテナのキーも含める場合true
     * @returns 登録キーの配列
     */
    getKeys(includeParent?: boolean): string[];
    /**
     * 依存性の情報を取得します
     *
     * @param key 依存性のキー
     * @returns 依存性の情報（見つからない場合undefined）
     */
    getInfo(key: string): {
        lifetime: Lifetime;
        dependencies: string[];
        hasCachedInstance: boolean;
    } | undefined;
    /**
     * 子コンテナを作成します
     *
     * 子コンテナは親コンテナの依存性を継承します。
     *
     * @returns 子コンテナ
     */
    createChild(): DIContainer;
    /**
     * コンテナの状態を診断します
     *
     * @returns 診断情報
     */
    diagnose(): {
        totalRegistrations: number;
        singletons: number;
        transients: number;
        factories: number;
        cachedInstances: number;
        registrations: Array<{
            key: string;
            lifetime: Lifetime;
            dependencies: string[];
            hasCachedInstance: boolean;
        }>;
    };
    /**
     * 登録を取得します（親コンテナも検索）
     *
     * @param key 依存性のキー
     * @returns 登録情報（見つからない場合undefined）
     */
    private getRegistration;
    /**
     * キーのバリデーション
     *
     * @param key 依存性のキー
     * @throws {DIContainerError} キーが不正な場合
     */
    private validateKey;
    /**
     * ファクトリー関数のバリデーション
     *
     * @param factory ファクトリー関数
     * @throws {DIContainerError} ファクトリーが関数でない場合
     */
    private validateFactory;
}
/**
 * グローバルDIコンテナ（オプション）
 *
 * アプリケーション全体で共有するシングルトンコンテナ
 */
export declare const globalContainer: DIContainer;
/**
 * デコレーター: Injectable（将来の拡張用）
 *
 * クラスを依存性注入可能にマークします。
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyService {
 *   constructor(private logger: Logger) {}
 * }
 * ```
 */
export declare function Injectable(): <T extends {
    new (...args: any[]): {};
}>(constructor: T) => T;
/**
 * デコレーター: Inject（将来の拡張用）
 *
 * コンストラクタパラメータに注入する依存性を指定します。
 *
 * @param key 依存性のキー
 *
 * @example
 * ```typescript
 * class MyService {
 *   constructor(@Inject('logger') private logger: Logger) {}
 * }
 * ```
 */
export declare function Inject(key: string): (target: any, propertyKey: string | symbol, parameterIndex: number) => void;
//# sourceMappingURL=di-container.d.ts.map