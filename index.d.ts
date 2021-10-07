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
  addEventListener(key: string, callback: PersistentListener): void
  removeEventListener(key: string, callback: PersistentListener): void
  requiresListenerPerKey?: boolean
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

interface PersistentEncoder<Origin = any> {
  /**
   * Encoder to convert value to string.
   */
  encode: (value: Origin) => string
  /**
   * Decoder to convert value from string.
   */
  decode: (encoded: string) => Origin
}

interface PersistentSimpleOptions {
  /**
   * Does not synchronize changes from other browser tabs
   */
  listen?: boolean
}

export type PersistentOptions =
  | PersistentSimpleOptions
  | (PersistentSimpleOptions & PersistentEncoder)

interface PersistentMapFactory {
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
   * @param opts Store options.
   * @return The store.
   */
  <Value extends Record<string, string | undefined>>(
    name: string,
    initial?: Value,
    opts?: PersistentSimpleOptions
  ): MapStore<Value>
  <Value extends object>(
    name: string,
    initial: Value,
    opts: PersistentSimpleOptions & PersistentEncoder<Value>
  ): MapStore<Value>
}

export const createPersistentMap: PersistentMapFactory

interface PersistentStoreFactory {
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
   * @param opts Store options.
   * @return The store.
   */
  <Value extends string | undefined>(
    name: string,
    initial?: Value,
    opts?: PersistentSimpleOptions
  ): WritableStore<Value>
  <Value>(
    name: string,
    initial: Value,
    opts: PersistentSimpleOptions & PersistentEncoder<Value>
  ): WritableStore<Value>
}

export const createPersistentStore: PersistentStoreFactory

/**
 * Enable fake storage to test persistent stores.
 *
 * ```js
 * import { useTestStorageEngine } from '@nanostores/persistent'
 *
 * beforeAll(() => {
 *   useTestStorageEngine()
 * })
 * ```
 */
export function useTestStorageEngine(): void

/**
 * Set fake storage key to test persistent store.
 *
 * ```js
 * import {
 *   useTestStorageEngine,
 *   setTestStorageKey,
 *   cleanTestStorage
 * } from '@nanostores/persistent'
 *
 * beforeAll(() => {
 *   useTestStorageEngine()
 * })
 *
 * beforeEach(() => {
 *   cleanTestStorage()
 * })
 *
 * it('listens for changes', () => {
 *   setTestStorageKey('settings:locale', 'ru')
 *   expect(getValue(settings)).toEqual({ locale: 'ru' })
 * })
 * ```
 *
 * @param key Full name of key in localStorage.
 * @param newValue New value of the key.
 */
export function setTestStorageKey(
  key: string,
  newValue: string | undefined
): void

/**
 * Get full content of fake storage to test persistent stores.
 *
 * ```js
 * import {
 *   useTestStorageEngine,
 *   cleanTestStorage,
 *   getTestStorage,
 * } from '@nanostores/persistent'
 *
 * beforeAll(() => {
 *   useTestStorageEngine()
 * })
 *
 * beforeEach(() => {
 *   cleanTestStorage()
 * })
 *
 * it('changes storage', () => {
 *   settings.setKey('locale')
 *   expect(getTestStorage()).toEqual({ 'settings:locale': 'ru' })
 * })
 * ```
 */
export function getTestStorage(): Record<string, string>

/**
 * Clean test storage used to test persistent stores.
 *
 * ```js
 * import { cleanTestStorage } from '@nanostores/persistent'
 *
 * afterEach(() => {
 *   cleanTestStorage()
 * })
 * ```
 */
export function cleanTestStorage(): void

/**
 * Adapts window to PersistentEvents contract
 */
export const windowPersistentEvents: PersistentEvents
