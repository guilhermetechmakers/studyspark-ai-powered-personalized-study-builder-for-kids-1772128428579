/**
 * DataGuard - Runtime safety utilities for arrays and API responses.
 * Ensures safe defaults and guards against null/undefined in all map/filter/reduce usage.
 */

/**
 * Returns a safe array from potentially null/undefined data.
 * Use for: (items ?? []).map(...) or dataGuard(items).map(...)
 */
export function dataGuard<T>(data: T[] | null | undefined): T[] {
  return data ?? []
}

/**
 * Validates that response data is an array before use.
 * Use for API responses: const list = asArray(response?.data)
 */
export function asArray<T>(data: unknown): T[] {
  return Array.isArray(data) ? (data as T[]) : []
}

/**
 * Safe array map with null guard.
 */
export function safeMap<T, U>(
  items: T[] | null | undefined,
  fn: (item: T, index: number) => U
): U[] {
  return (items ?? []).map(fn)
}

/**
 * Safe array filter with null guard.
 */
export function safeFilter<T>(
  items: T[] | null | undefined,
  predicate: (item: T, index: number) => boolean
): T[] {
  return (items ?? []).filter(predicate)
}

/**
 * Safe array reduce with null guard.
 */
export function safeReduce<T, U>(
  items: T[] | null | undefined,
  fn: (acc: U, item: T, index: number) => U,
  initial: U
): U {
  return (items ?? []).reduce(fn, initial)
}
