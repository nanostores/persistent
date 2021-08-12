import { MapStore, WritableStore } from 'nanostores'

export type PersistentStore = Record<string, string>

export interface PersistentEvent {
  key: string
  newValue: string
}

export interface PersistentListener {
  (e: PersistentEvent): void
}

export interface PersistentEvents {
  addEventListener(event: string, callback: PersistentListener): void
  removeEventListener(event: string, callback: PersistentListener): void
}

/**
 * Replace localStorage to keep persistent data.
 *
 * @param storage An object with localStorage API.
 * @param events An object with `addEventListener` and `removeEventListener`.
 */
export function setPersistentEngine(
  storage: PersistentStore,
  events: PersistentEvents
): void

export interface PersistentOptions {
  /**
   * Does not synchronize changes from other browser tabs.
   */
  listen?: boolean
}

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
 * @param prefix Key prefix in localStorage.
 * @param initial Initial value on missed data in localStorage.
 * @return The store.
 */
export function createPersistentMap<
  Value extends Record<string, string | undefined>
>(prefix: string, initial?: Value, opts?: PersistentOptions): MapStore<Value>

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
 * @param name Key name in localStorage.
 * @param initial Initial value on missed data in localStorage.
 */
export function createPersistentStore<Value extends string | undefined>(
  name: string,
  initial?: Value,
  opts?: PersistentOptions
): WritableStore<Value>
