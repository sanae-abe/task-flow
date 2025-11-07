/**
 * TypeScript 5.7.3 型推論ヘルパー
 *
 * Zodスキーマと統合した高度な型推論ユーティリティ
 */

import type { z } from 'zod';

/**
 * Zodスキーマから型を推論
 */
export type InferZodType<T extends z.ZodSchema> = z.infer<T>;

/**
 * Partial型を作成（オプショナルフィールド対応）
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Required型を作成（必須フィールド指定）
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

/**
 * Nullable型を作成
 */
export type Nullable<T> = T | null;

/**
 * NonNullable型の拡張版（undefinedも除外）
 */
export type Defined<T> = T extends null | undefined ? never : T;

/**
 * オブジェクトの値の型を取得
 */
export type ValueOf<T> = T[keyof T];

/**
 * 配列の要素型を取得
 */
export type ElementType<T> = T extends ReadonlyArray<infer U> ? U : never;

/**
 * Promise型のunwrap
 */
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

/**
 * 関数の戻り値型を取得
 */
export type ReturnTypeOf<T> = T extends (...args: never[]) => infer R
  ? R
  : never;

/**
 * 関数の引数型を取得
 */
export type ParametersOf<T> = T extends (...args: infer P) => unknown
  ? P
  : never;

/**
 * 型安全なObject.keys
 */
export function typedKeys<T extends object>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * 型安全なObject.entries
 */
export function typedEntries<T extends object>(
  obj: T
): Array<[keyof T, ValueOf<T>]> {
  return Object.entries(obj) as Array<[keyof T, ValueOf<T>]>;
}

/**
 * 型安全なObject.fromEntries
 */
export function typedFromEntries<K extends string, V>(
  entries: Iterable<readonly [K, V]>
): Record<K, V> {
  return Object.fromEntries(entries) as Record<K, V>;
}

/**
 * 型安全なArray.isArray
 */
export function isTypedArray<T>(
  value: unknown,
  predicate: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(predicate);
}

/**
 * 型安全なフィルタリング（nullとundefinedを除外）
 */
export function filterDefined<T>(array: Array<T | null | undefined>): Array<T> {
  return array.filter((item): item is T => item !== null && item !== undefined);
}

/**
 * 型安全なマッピング
 */
export function mapDefined<T, U>(
  array: Array<T | null | undefined>,
  fn: (item: T) => U
): Array<U> {
  return filterDefined(array).map(fn);
}

/**
 * 条件型による型の絞り込み
 */
export type ExtractByType<T, U> = T extends U ? T : never;

/**
 * 条件型による型の除外
 */
export type ExcludeByType<T, U> = T extends U ? never : T;

/**
 * ディープPartial型
 */
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * ディープRequired型
 */
export type DeepRequired<T> = T extends object
  ? {
      [P in keyof T]-?: DeepRequired<T[P]>;
    }
  : T;

/**
 * ディープReadonly型
 */
export type DeepReadonly<T> = T extends object
  ? {
      readonly [P in keyof T]: DeepReadonly<T[P]>;
    }
  : T;

/**
 * Mutable型（Readonlyを解除）
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * ディープMutable型
 */
export type DeepMutable<T> = T extends object
  ? {
      -readonly [P in keyof T]: DeepMutable<T[P]>;
    }
  : T;

/**
 * オプショナルフィールドの抽出
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

/**
 * 必須フィールドの抽出
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

/**
 * 関数型の抽出
 */
export type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never;
}[keyof T];

/**
 * 非関数型の抽出
 */
export type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? never : K;
}[keyof T];

/**
 * 型安全なpick関数
 */
export function typedPick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    result[key] = obj[key];
  });
  return result;
}

/**
 * 型安全なomit関数
 */
export function typedOmit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

/**
 * 型の合成（Intersection Type）
 */
export type Merge<T, U> = Omit<T, keyof U> & U;

/**
 * プロパティの上書き
 */
export type Override<T, U> = Omit<T, keyof U> & U;

/**
 * タプル型からUnion型への変換
 */
export type TupleToUnion<T extends readonly unknown[]> = T[number];

/**
 * Union型からIntersection型への変換
 */
export type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * 型安全なhasOwnProperty
 */
export function hasOwnProperty<T extends object, K extends PropertyKey>(
  obj: T,
  key: K
): key is K & keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * 型安全なアサーション関数
 */
export function assertNonNull<T>(
  value: T | null | undefined,
  errorMessage?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new TypeError(errorMessage || '値がnullまたはundefinedです');
  }
}

/**
 * 型安全なアサーション関数（配列用）
 */
export function assertNonEmpty<T>(
  array: T[],
  errorMessage?: string
): asserts array is [T, ...T[]] {
  if (array.length === 0) {
    throw new TypeError(errorMessage || '配列が空です');
  }
}
