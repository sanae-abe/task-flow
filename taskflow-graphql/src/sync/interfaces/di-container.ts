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
export enum Lifetime {
  /** シングルトン: コンテナ内で1つのインスタンスのみ */
  Singleton = 'singleton',
  /** トランジェント: 解決のたびに新しいインスタンス */
  Transient = 'transient',
  /** ファクトリー: パラメータを受け取って新しいインスタンスを生成 */
  Factory = 'factory',
}

/**
 * 依存性の登録情報
 */
interface Registration<T = any> {
  /** ライフタイム */
  lifetime: Lifetime;
  /** ファクトリー関数 */
  factory: (...args: any[]) => T;
  /** シングルトンのキャッシュされたインスタンス */
  instance?: T;
  /** 依存するキー（循環依存検出用） */
  dependencies?: string[];
}

/**
 * ファクトリー関数の型
 */
export type Factory<T, TArgs extends any[] = []> = (...args: TArgs) => T;

/**
 * DIコンテナエラー
 */
export class DIContainerError extends Error {
  constructor(
    message: string,
    public readonly key?: string
  ) {
    super(message);
    this.name = 'DIContainerError';
  }
}

/**
 * 循環依存エラー
 */
export class CircularDependencyError extends DIContainerError {
  constructor(
    message: string,
    public readonly cycle: string[],
    key?: string
  ) {
    super(message, key);
    this.name = 'CircularDependencyError';
  }
}

/**
 * 依存性未登録エラー
 */
export class DependencyNotFoundError extends DIContainerError {
  constructor(key: string) {
    super(`Dependency not found: '${key}'`, key);
    this.name = 'DependencyNotFoundError';
  }
}

/**
 * Dependency Injection Container
 *
 * 型安全な依存性注入コンテナ。
 * シングルトン、トランジェント、ファクトリーのライフタイムをサポートし、
 * 循環依存の検出と自動解決を提供します。
 */
export class DIContainer {
  /** 登録された依存性 */
  private registrations: Map<string, Registration> = new Map();

  /** 解決中のキー（循環依存検出用） */
  private resolvingKeys: Set<string> = new Set();

  /** 親コンテナ（階層的なDI用） */
  private parent?: DIContainer;

  /**
   * DIContainerを作成します
   *
   * @param parent 親コンテナ（オプション）
   */
  constructor(parent?: DIContainer) {
    this.parent = parent;
  }

  /**
   * 依存性を登録します
   *
   * @param key 依存性のキー
   * @param factory ファクトリー関数
   * @param lifetime ライフタイム
   * @param dependencies 依存するキー（循環依存検出用）
   * @returns このコンテナ（メソッドチェーン用）
   */
  register<T>(
    key: string,
    factory: Factory<T>,
    lifetime: Lifetime = Lifetime.Transient,
    dependencies: string[] = []
  ): this {
    this.validateKey(key);
    this.validateFactory(factory);

    this.registrations.set(key, {
      lifetime,
      factory,
      dependencies,
    });

    return this;
  }

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
  registerSingleton<T>(
    key: string,
    factory: Factory<T>,
    dependencies: string[] = []
  ): this {
    return this.register(key, factory, Lifetime.Singleton, dependencies);
  }

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
  registerTransient<T>(
    key: string,
    factory: Factory<T>,
    dependencies: string[] = []
  ): this {
    return this.register(key, factory, Lifetime.Transient, dependencies);
  }

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
  registerFactory<T, TArgs extends any[] = []>(
    key: string,
    factory: Factory<T, TArgs>,
    dependencies: string[] = []
  ): this {
    return this.register(key, factory, Lifetime.Factory, dependencies);
  }

  /**
   * インスタンスを直接登録します（シングルトン）
   *
   * @param key 依存性のキー
   * @param instance インスタンス
   * @returns このコンテナ（メソッドチェーン用）
   */
  registerInstance<T>(key: string, instance: T): this {
    this.validateKey(key);

    this.registrations.set(key, {
      lifetime: Lifetime.Singleton,
      factory: () => instance,
      instance,
    });

    return this;
  }

  /**
   * 依存性を解決します
   *
   * @param key 依存性のキー
   * @returns 解決されたインスタンス
   * @throws {DependencyNotFoundError} 依存性が見つからない場合
   * @throws {CircularDependencyError} 循環依存が検出された場合
   */
  resolve<T>(key: string): T {
    // 循環依存チェック
    if (this.resolvingKeys.has(key)) {
      const cycle = Array.from(this.resolvingKeys);
      cycle.push(key);
      throw new CircularDependencyError(
        `Circular dependency detected: ${cycle.join(' -> ')}`,
        cycle,
        key
      );
    }

    // 登録確認
    const registration = this.getRegistration(key);
    if (!registration) {
      throw new DependencyNotFoundError(key);
    }

    // ファクトリーライフタイムの場合はエラー
    if (registration.lifetime === Lifetime.Factory) {
      throw new DIContainerError(
        `Cannot resolve factory '${key}' without arguments. Use resolveFactory() instead.`,
        key
      );
    }

    // シングルトンのキャッシュチェック
    if (
      registration.lifetime === Lifetime.Singleton &&
      registration.instance !== undefined
    ) {
      return registration.instance as T;
    }

    // 解決開始
    this.resolvingKeys.add(key);

    try {
      // 依存性を先に解決
      if (registration.dependencies && registration.dependencies.length > 0) {
        for (const depKey of registration.dependencies) {
          this.resolve(depKey);
        }
      }

      // インスタンス作成
      const instance = registration.factory();

      // シングルトンの場合はキャッシュ
      if (registration.lifetime === Lifetime.Singleton) {
        registration.instance = instance;
      }

      return instance as T;
    } finally {
      // 解決完了
      this.resolvingKeys.delete(key);
    }
  }

  /**
   * ファクトリー依存性を解決します
   *
   * @param key 依存性のキー
   * @param args ファクトリー関数に渡す引数
   * @returns 解決されたインスタンス
   * @throws {DependencyNotFoundError} 依存性が見つからない場合
   * @throws {DIContainerError} ファクトリーでない場合
   */
  resolveFactory<T, TArgs extends any[] = []>(key: string, ...args: TArgs): T {
    const registration = this.getRegistration(key);
    if (!registration) {
      throw new DependencyNotFoundError(key);
    }

    if (registration.lifetime !== Lifetime.Factory) {
      throw new DIContainerError(
        `Dependency '${key}' is not a factory. Use resolve() instead.`,
        key
      );
    }

    return registration.factory(...args) as T;
  }

  /**
   * 依存性が登録されているか確認します
   *
   * @param key 依存性のキー
   * @returns 登録されている場合true
   */
  has(key: string): boolean {
    return this.registrations.has(key) || (this.parent?.has(key) ?? false);
  }

  /**
   * 依存性の登録を削除します
   *
   * @param key 依存性のキー
   * @returns 削除された場合true
   */
  unregister(key: string): boolean {
    return this.registrations.delete(key);
  }

  /**
   * すべての登録をクリアします
   */
  clear(): void {
    this.registrations.clear();
    this.resolvingKeys.clear();
  }

  /**
   * 登録されているすべてのキーを取得します
   *
   * @param includeParent 親コンテナのキーも含める場合true
   * @returns 登録キーの配列
   */
  getKeys(includeParent: boolean = false): string[] {
    const keys = Array.from(this.registrations.keys());

    if (includeParent && this.parent) {
      const parentKeys = this.parent.getKeys(true);
      const combined = keys.concat(parentKeys);
      // Remove duplicates
      return combined.filter((key, index) => combined.indexOf(key) === index);
    }

    return keys;
  }

  /**
   * 依存性の情報を取得します
   *
   * @param key 依存性のキー
   * @returns 依存性の情報（見つからない場合undefined）
   */
  getInfo(key: string):
    | {
        lifetime: Lifetime;
        dependencies: string[];
        hasCachedInstance: boolean;
      }
    | undefined {
    const registration = this.getRegistration(key);
    if (!registration) {
      return undefined;
    }

    return {
      lifetime: registration.lifetime,
      dependencies: registration.dependencies || [],
      hasCachedInstance:
        registration.lifetime === Lifetime.Singleton &&
        registration.instance !== undefined,
    };
  }

  /**
   * 子コンテナを作成します
   *
   * 子コンテナは親コンテナの依存性を継承します。
   *
   * @returns 子コンテナ
   */
  createChild(): DIContainer {
    return new DIContainer(this);
  }

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
  } {
    let singletons = 0;
    let transients = 0;
    let factories = 0;
    let cachedInstances = 0;

    const registrations: Array<{
      key: string;
      lifetime: Lifetime;
      dependencies: string[];
      hasCachedInstance: boolean;
    }> = [];

    this.registrations.forEach((reg, key) => {
      const hasCachedInstance =
        reg.lifetime === Lifetime.Singleton && reg.instance !== undefined;

      if (reg.lifetime === Lifetime.Singleton) singletons++;
      if (reg.lifetime === Lifetime.Transient) transients++;
      if (reg.lifetime === Lifetime.Factory) factories++;
      if (hasCachedInstance) cachedInstances++;

      registrations.push({
        key,
        lifetime: reg.lifetime,
        dependencies: reg.dependencies || [],
        hasCachedInstance,
      });
    });

    return {
      totalRegistrations: this.registrations.size,
      singletons,
      transients,
      factories,
      cachedInstances,
      registrations,
    };
  }

  /**
   * 登録を取得します（親コンテナも検索）
   *
   * @param key 依存性のキー
   * @returns 登録情報（見つからない場合undefined）
   */
  private getRegistration(key: string): Registration | undefined {
    const registration = this.registrations.get(key);
    if (registration) {
      return registration;
    }

    // 親コンテナを検索
    if (this.parent) {
      return (this.parent as any).getRegistration(key);
    }

    return undefined;
  }

  /**
   * キーのバリデーション
   *
   * @param key 依存性のキー
   * @throws {DIContainerError} キーが不正な場合
   */
  private validateKey(key: string): void {
    if (!key || typeof key !== 'string') {
      throw new DIContainerError('Dependency key must be a non-empty string');
    }
  }

  /**
   * ファクトリー関数のバリデーション
   *
   * @param factory ファクトリー関数
   * @throws {DIContainerError} ファクトリーが関数でない場合
   */
  private validateFactory(factory: any): void {
    if (typeof factory !== 'function') {
      throw new DIContainerError('Factory must be a function');
    }
  }
}

/**
 * グローバルDIコンテナ（オプション）
 *
 * アプリケーション全体で共有するシングルトンコンテナ
 */
export const globalContainer = new DIContainer();

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
export function Injectable() {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return constructor;
  };
}

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
export function Inject(key: string) {
  return function (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number
  ) {
    // メタデータに注入情報を保存（将来の実装用）
    // Note: Requires 'reflect-metadata' package and decorator support
    if (typeof Reflect !== 'undefined' && (Reflect as any).getMetadata) {
      const existingInjections =
        (Reflect as any).getMetadata('design:paramtypes', target) || [];
      existingInjections[parameterIndex] = key;
      (Reflect as any).defineMetadata('design:paramtypes', existingInjections, target);
    }
  };
}
