/**
 * 深い比較を行うユーティリティ関数
 * オブジェクト、配列、プリミティブ値を再帰的に比較します
 *
 * @param obj1 比較対象1
 * @param obj2 比較対象2
 * @returns 等しい場合はtrue、異なる場合はfalse
 */
export function deepEqual(obj1: unknown, obj2: unknown): boolean {
  // 同じ参照の場合は等しい
  if (obj1 === obj2) {
    return true;
  }

  // null または undefined の場合
  if (obj1 === null || obj2 === null || obj1 === undefined || obj2 === undefined) {
    return obj1 === obj2;
  }

  // 型が異なる場合は等しくない
  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  // プリミティブ値の場合
  if (typeof obj1 !== 'object') {
    return obj1 === obj2;
  }

  // 配列かどうかの判定が異なる場合は等しくない
  if (Array.isArray(obj1) !== Array.isArray(obj2)) {
    return false;
  }

  // 配列の場合
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      return false;
    }
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) {
        return false;
      }
    }
    return true;
  }

  // オブジェクトの場合
  const objRecord1 = obj1 as Record<string, unknown>;
  const objRecord2 = obj2 as Record<string, unknown>;

  const keys1 = Object.keys(objRecord1);
  const keys2 = Object.keys(objRecord2);

  // キーの数が異なる場合は等しくない
  if (keys1.length !== keys2.length) {
    return false;
  }

  // すべてのキーと値を比較
  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }
    if (!deepEqual(objRecord1[key], objRecord2[key])) {
      return false;
    }
  }

  return true;
}

/**
 * 高速な比較のための最適化版
 * 浅い比較で早期に結果を返す場合がある
 */
export function fastDeepEqual(obj1: unknown, obj2: unknown): boolean {
  // 同じ参照の場合は即座にtrue
  if (obj1 === obj2) {
    return true;
  }

  // 型が異なる場合は即座にfalse
  if (typeof obj1 !== typeof obj2) {
    return false;
  }

  // null/undefinedの場合
  if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined) {
    return obj1 === obj2;
  }

  // プリミティブ値の場合
  if (typeof obj1 !== 'object') {
    return obj1 === obj2;
  }

  // Date オブジェクトの場合の最適化
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime();
  }

  // 通常の深い比較にフォールバック
  return deepEqual(obj1, obj2);
}