import { MapStore, WritableStore } from 'nanostores'

/**
 * Keep key-value data in localStorage.
 *
 * ```ts
 * import { createPersistentMap } from '@nanostores/persistent'
 *
 * export const settings = createPersistentMap<{
 *   theme: 'dark' | 'light'
 *   favorite: string
 * }>('settings:', { theme: 'light' })
 * ```
 *
 * @param initial Initial value on missed data in localStorage.
 * @param prefix Optional key prefix in localStorage.
 * @return The store.
 */
export function createPersistentMap<
  Value extends Record<string, string | undefined>
>(prefix: string, initial?: Value): MapStore<Value>

/**
 * Store a value in localStorage.
 *
 * For key-value objects use {@link createPersistentMap}.
 *
 * ```ts
 * import { createPersistentStore } from '@nanostores/persistent'
 *
 * export const locale = createPersistentStore<string>('locale', 'en')
 * ```
 *
 * @param name
 * @param initial
 */
export function createPersistentStore<Value>(
  name: string,
  initial?: Value
): WritableStore<Value>
