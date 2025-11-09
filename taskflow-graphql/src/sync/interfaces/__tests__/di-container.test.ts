/**
 * DI Container Unit Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  DIContainer,
  Lifetime,
  DIContainerError,
  CircularDependencyError,
  DependencyNotFoundError,
  globalContainer,
} from '../di-container';

describe('DIContainer', () => {
  let container: DIContainer;

  beforeEach(() => {
    container = new DIContainer();
  });

  describe('基本的な登録と解決', () => {
    it('シングルトンを登録・解決できる', () => {
      // Arrange
      let instanceCount = 0;
      container.registerSingleton('service', () => {
        instanceCount++;
        return { id: instanceCount };
      });

      // Act
      const instance1 = container.resolve('service');
      const instance2 = container.resolve('service');

      // Assert
      expect(instance1).toBe(instance2);
      expect(instanceCount).toBe(1);
    });

    it('トランジェントを登録・解決できる', () => {
      // Arrange
      let instanceCount = 0;
      container.registerTransient('service', () => {
        instanceCount++;
        return { id: instanceCount };
      });

      // Act
      const instance1 = container.resolve('service');
      const instance2 = container.resolve('service');

      // Assert
      expect(instance1).not.toBe(instance2);
      expect(instanceCount).toBe(2);
    });

    it('ファクトリーを登録・解決できる', () => {
      // Arrange
      container.registerFactory('service', (name: string, age: number) => ({
        name,
        age,
      }));

      // Act
      const instance1 = container.resolveFactory('service', 'Alice', 30);
      const instance2 = container.resolveFactory('service', 'Bob', 25);

      // Assert
      expect(instance1).toEqual({ name: 'Alice', age: 30 });
      expect(instance2).toEqual({ name: 'Bob', age: 25 });
      expect(instance1).not.toBe(instance2);
    });

    it('インスタンスを直接登録・解決できる', () => {
      // Arrange
      const instance = { name: 'Test' };
      container.registerInstance('service', instance);

      // Act
      const resolved = container.resolve('service');

      // Assert
      expect(resolved).toBe(instance);
    });
  });

  describe('エラーハンドリング', () => {
    it('未登録の依存性を解決するとエラーをスローする', () => {
      // Act & Assert
      expect(() => container.resolve('nonExistent')).toThrow(
        DependencyNotFoundError
      );
      expect(() => container.resolve('nonExistent')).toThrow(
        "Dependency not found: 'nonExistent'"
      );
    });

    it('ファクトリーをresolveで解決するとエラーをスローする', () => {
      // Arrange
      container.registerFactory('factory', () => ({}));

      // Act & Assert
      expect(() => container.resolve('factory')).toThrow(DIContainerError);
      expect(() => container.resolve('factory')).toThrow(
        /Cannot resolve factory.*Use resolveFactory/
      );
    });

    it('シングルトンをresolveFactoryで解決するとエラーをスローする', () => {
      // Arrange
      container.registerSingleton('singleton', () => ({}));

      // Act & Assert
      expect(() => container.resolveFactory('singleton')).toThrow(
        DIContainerError
      );
      expect(() => container.resolveFactory('singleton')).toThrow(
        /not a factory.*Use resolve/
      );
    });

    it('無効なキーでエラーをスローする', () => {
      // Act & Assert
      expect(() => container.register('', () => ({}))).toThrow(
        DIContainerError
      );
      expect(() => container.register(null as any, () => ({}))).toThrow(
        DIContainerError
      );
    });

    it('無効なファクトリーでエラーをスローする', () => {
      // Act & Assert
      expect(() => container.register('key', null as any)).toThrow(
        DIContainerError
      );
      expect(() => container.register('key', 'not a function' as any)).toThrow(
        DIContainerError
      );
    });
  });

  describe('循環依存の検出', () => {
    it('直接的な循環依存を検出する', () => {
      // Arrange
      container.registerSingleton(
        'serviceA',
        () => {
          return { b: container.resolve('serviceB') };
        },
        ['serviceB']
      );

      container.registerSingleton(
        'serviceB',
        () => {
          return { a: container.resolve('serviceA') };
        },
        ['serviceA']
      );

      // Act & Assert
      expect(() => container.resolve('serviceA')).toThrow(
        CircularDependencyError
      );
    });

    it('間接的な循環依存を検出する', () => {
      // Arrange
      container.registerSingleton(
        'serviceA',
        () => {
          return { b: container.resolve('serviceB') };
        },
        ['serviceB']
      );

      container.registerSingleton(
        'serviceB',
        () => {
          return { c: container.resolve('serviceC') };
        },
        ['serviceC']
      );

      container.registerSingleton(
        'serviceC',
        () => {
          return { a: container.resolve('serviceA') };
        },
        ['serviceA']
      );

      // Act & Assert
      expect(() => container.resolve('serviceA')).toThrow(
        CircularDependencyError
      );

      try {
        container.resolve('serviceA');
      } catch (error: any) {
        expect(error.cycle).toEqual([
          'serviceA',
          'serviceB',
          'serviceC',
          'serviceA',
        ]);
      }
    });
  });

  describe('依存関係の解決', () => {
    it('依存関係のチェーンを解決できる', () => {
      // Arrange
      const executionOrder: string[] = [];

      container.registerSingleton('serviceA', () => {
        executionOrder.push('A');
        return { name: 'A' };
      });

      container.registerSingleton(
        'serviceB',
        () => {
          executionOrder.push('B');
          const a = container.resolve('serviceA');
          return { name: 'B', dependency: a };
        },
        ['serviceA']
      );

      container.registerSingleton(
        'serviceC',
        () => {
          executionOrder.push('C');
          const b = container.resolve('serviceB');
          return { name: 'C', dependency: b };
        },
        ['serviceB']
      );

      // Act
      const serviceC = container.resolve('serviceC');

      // Assert
      expect(executionOrder).toEqual(['A', 'B', 'C']);
      expect(serviceC.name).toBe('C');
      expect(serviceC.dependency.name).toBe('B');
      expect(serviceC.dependency.dependency.name).toBe('A');
    });

    it('複数の依存関係を解決できる', () => {
      // Arrange
      container.registerSingleton('logger', () => ({ log: vi.fn() }));
      container.registerSingleton('config', () => ({ env: 'test' }));

      container.registerSingleton(
        'service',
        () => {
          const logger = container.resolve('logger');
          const config = container.resolve('config');
          return { logger, config };
        },
        ['logger', 'config']
      );

      // Act
      const service = container.resolve('service');

      // Assert
      expect(service.logger).toBeDefined();
      expect(service.config).toBeDefined();
      expect(service.config.env).toBe('test');
    });
  });

  describe('コンテナ管理', () => {
    it('依存性の存在を確認できる', () => {
      // Arrange
      container.registerSingleton('service', () => ({}));

      // Act & Assert
      expect(container.has('service')).toBe(true);
      expect(container.has('nonExistent')).toBe(false);
    });

    it('依存性を削除できる', () => {
      // Arrange
      container.registerSingleton('service', () => ({}));

      // Act
      const deleted = container.unregister('service');

      // Assert
      expect(deleted).toBe(true);
      expect(container.has('service')).toBe(false);
    });

    it('すべての依存性をクリアできる', () => {
      // Arrange
      container.registerSingleton('service1', () => ({}));
      container.registerSingleton('service2', () => ({}));

      // Act
      container.clear();

      // Assert
      expect(container.has('service1')).toBe(false);
      expect(container.has('service2')).toBe(false);
    });

    it('登録されているキーを取得できる', () => {
      // Arrange
      container.registerSingleton('service1', () => ({}));
      container.registerTransient('service2', () => ({}));
      container.registerFactory('service3', () => ({}));

      // Act
      const keys = container.getKeys();

      // Assert
      expect(keys).toEqual(['service1', 'service2', 'service3']);
    });

    it('依存性の情報を取得できる', () => {
      // Arrange
      container.registerSingleton('service', () => ({}), ['dep1', 'dep2']);
      container.resolve('service'); // キャッシュを作成

      // Act
      const info = container.getInfo('service');

      // Assert
      expect(info).toEqual({
        lifetime: Lifetime.Singleton,
        dependencies: ['dep1', 'dep2'],
        hasCachedInstance: true,
      });
    });
  });

  describe('子コンテナ', () => {
    it('子コンテナを作成できる', () => {
      // Arrange
      const parent = new DIContainer();
      parent.registerSingleton('parentService', () => ({ name: 'parent' }));

      // Act
      const child = parent.createChild();
      child.registerSingleton('childService', () => ({ name: 'child' }));

      // Assert
      expect(child.has('parentService')).toBe(true);
      expect(child.has('childService')).toBe(true);
      expect(parent.has('childService')).toBe(false);
    });

    it('子コンテナは親の依存性を解決できる', () => {
      // Arrange
      const parent = new DIContainer();
      parent.registerSingleton('parentService', () => ({ name: 'parent' }));

      const child = parent.createChild();

      // Act
      const service = child.resolve('parentService');

      // Assert
      expect(service.name).toBe('parent');
    });

    it('子コンテナのキー取得で親を含めることができる', () => {
      // Arrange
      const parent = new DIContainer();
      parent.registerSingleton('parentService', () => ({}));

      const child = parent.createChild();
      child.registerSingleton('childService', () => ({}));

      // Act
      const childKeysOnly = child.getKeys(false);
      const allKeys = child.getKeys(true);

      // Assert
      expect(childKeysOnly).toEqual(['childService']);
      expect(allKeys).toContain('parentService');
      expect(allKeys).toContain('childService');
    });
  });

  describe('診断機能', () => {
    it('コンテナの状態を診断できる', () => {
      // Arrange
      container.registerSingleton('singleton', () => ({}));
      container.registerTransient('transient', () => ({}));
      container.registerFactory('factory', () => ({}));
      container.resolve('singleton'); // キャッシュを作成

      // Act
      const diagnostics = container.diagnose();

      // Assert
      expect(diagnostics.totalRegistrations).toBe(3);
      expect(diagnostics.singletons).toBe(1);
      expect(diagnostics.transients).toBe(1);
      expect(diagnostics.factories).toBe(1);
      expect(diagnostics.cachedInstances).toBe(1);
      expect(diagnostics.registrations).toHaveLength(3);
    });

    it('診断情報に正しい詳細が含まれる', () => {
      // Arrange
      container.registerSingleton('service', () => ({}), ['dep1']);

      // Act
      const diagnostics = container.diagnose();
      const registration = diagnostics.registrations[0];

      // Assert
      expect(registration.key).toBe('service');
      expect(registration.lifetime).toBe(Lifetime.Singleton);
      expect(registration.dependencies).toEqual(['dep1']);
      expect(registration.hasCachedInstance).toBe(false);
    });
  });

  describe('メソッドチェーン', () => {
    it('メソッドチェーンで複数の登録ができる', () => {
      // Act
      const result = container
        .registerSingleton('service1', () => ({}))
        .registerTransient('service2', () => ({}))
        .registerFactory('service3', () => ({}));

      // Assert
      expect(result).toBe(container);
      expect(container.getKeys()).toEqual(['service1', 'service2', 'service3']);
    });
  });

  describe('型安全性', () => {
    it('ジェネリック型で型安全に解決できる', () => {
      // Arrange
      interface ILogger {
        log(message: string): void;
      }

      const mockLogger: ILogger = {
        log: vi.fn(),
      };

      container.registerInstance<ILogger>('logger', mockLogger);

      // Act
      const logger = container.resolve<ILogger>('logger');

      // Assert
      logger.log('test'); // 型安全にメソッドを呼び出せる
      expect(mockLogger.log).toHaveBeenCalledWith('test');
    });

    it('ファクトリーでパラメータ型を指定できる', () => {
      // Arrange
      interface IService {
        name: string;
        age: number;
      }

      container.registerFactory<IService, [string, number]>(
        'service',
        (name: string, age: number) => ({ name, age })
      );

      // Act
      const service = container.resolveFactory<IService, [string, number]>(
        'service',
        'Alice',
        30
      );

      // Assert
      expect(service.name).toBe('Alice');
      expect(service.age).toBe(30);
    });
  });

  describe('グローバルコンテナ', () => {
    beforeEach(() => {
      globalContainer.clear();
    });

    it('グローバルコンテナが利用できる', () => {
      // Arrange
      globalContainer.registerSingleton('service', () => ({ name: 'global' }));

      // Act
      const service = globalContainer.resolve('service');

      // Assert
      expect(service.name).toBe('global');
    });
  });

  describe('エッジケース', () => {
    it('空のファクトリーでもインスタンスを作成できる', () => {
      // Arrange
      container.registerFactory('service', () => ({}));

      // Act
      const instance = container.resolveFactory('service');

      // Assert
      expect(instance).toEqual({});
    });

    it('undefined を返すファクトリーも登録できる', () => {
      // Arrange
      container.registerSingleton('service', () => undefined);

      // Act
      const instance = container.resolve('service');

      // Assert
      expect(instance).toBeUndefined();
    });

    it('同じキーで再登録すると上書きされる', () => {
      // Arrange
      container.registerSingleton('service', () => ({ version: 1 }));
      container.registerSingleton('service', () => ({ version: 2 }));

      // Act
      const instance = container.resolve('service');

      // Assert
      expect(instance.version).toBe(2);
    });

    it('解決後に依存性を削除してもキャッシュは残る', () => {
      // Arrange
      container.registerSingleton('service', () => ({ name: 'test' }));
      const instance1 = container.resolve('service');

      // Act
      container.unregister('service');

      // Assert
      expect(() => container.resolve('service')).toThrow(
        DependencyNotFoundError
      );
      expect(instance1.name).toBe('test'); // 既存のインスタンスは影響を受けない
    });
  });
});
