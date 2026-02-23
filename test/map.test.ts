import './setup.ts'

import { delay } from 'nanodelay'
import { cleanStores, type MapStore, map as nanoMap } from 'nanostores'
import { deepStrictEqual, equal } from 'node:assert'
import { afterEach, describe, test } from 'node:test'

import {
  cleanTestStorage,
  getTestStorage,
  type PersistentListener,
  persistentMap,
  setPersistentEngine,
  setTestStorageKey,
  useTestStorageEngine,
  windowPersistentEvents
} from '../index.js'
import { emitLocalStorage } from './utils.ts'

function clone(data: object): object {
  return JSON.parse(JSON.stringify(data))
}

let map: MapStore<{ one?: string; two?: string }>

afterEach(() => {
  localStorage.clear()
  cleanStores(map)
  setPersistentEngine(localStorage, windowPersistentEvents)
})

describe('persistentMap', () => {
  test('loads data from localStorage', () => {
    localStorage.setItem('a:one', '1')
    map = persistentMap<{ one?: string; two?: string }>('a:', {
      two: '2'
    })
    deepStrictEqual(map.get(), { one: '1', two: '2' })
  })

  test('saves to localStorage', () => {
    map = persistentMap('b:', {})

    let events: object[] = []
    map.listen(value => {
      events.push(clone(value))
    })

    map.setKey('one', '1')
    map.setKey('two', '2')
    deepStrictEqual(localStorage, { 'b:one': '1', 'b:two': '2' })
    deepStrictEqual(events, [{ one: '1' }, { one: '1', two: '2' }])

    map.set({ one: '11' })
    deepStrictEqual(localStorage, { 'b:one': '11' })
    deepStrictEqual(events, [
      { one: '1' },
      { one: '1', two: '2' },
      { one: '11' }
    ])

    map.setKey('one', undefined)
    deepStrictEqual(localStorage, {})
    deepStrictEqual(events, [
      { one: '1' },
      { one: '1', two: '2' },
      { one: '11' },
      {}
    ])
  })

  test('listens for other tabs', () => {
    map = persistentMap('c:', {})

    let events: object[] = []
    map.listen(value => {
      events.push(clone(value))
    })

    emitLocalStorage('c:one', '1')

    deepStrictEqual(events, [{ one: '1' }])
    deepStrictEqual(map.get(), { one: '1' })

    emitLocalStorage('c:one', null)
    deepStrictEqual(map.get(), {})
  })

  test('listens for local storage cleaning', () => {
    map = persistentMap('c:', {})

    let events: object[] = []
    map.listen(value => {
      events.push(clone(value))
    })
    map.setKey('one', '1')
    map.setKey('two', '2')

    localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', {}))

    deepStrictEqual(events, [{ one: '1' }, { one: '1', two: '2' }, {}])
    deepStrictEqual(map.get(), {})
  })

  test('ignores other tabs on request', () => {
    map = persistentMap('c2:', {}, { listen: false })

    let events: object[] = []
    map.listen(value => {
      events.push(clone(value))
    })

    emitLocalStorage('c2:one', '1')

    deepStrictEqual(events, [])
    deepStrictEqual(map.get(), {})
  })

  test('saves to localStorage in disabled state', () => {
    map = persistentMap('d:', {})

    map.setKey('one', '1')
    equal(localStorage['d:one'], '1')

    map.setKey('one', undefined)
    equal(localStorage['d:one'], undefined)
  })

  test('allows to change encoding', () => {
    let settings = persistentMap<{ locale: string[] }>(
      'settings:',
      { locale: ['en', 'US'] },
      {
        decode(str) {
          return str.split(',')
        },
        encode(list) {
          return list.join(',')
        }
      }
    )

    settings.listen(() => {})
    settings.setKey('locale', ['ru', 'RU'])

    equal(localStorage.getItem('settings:locale'), 'ru,RU')

    emitLocalStorage('settings:locale', 'fr,CA')

    deepStrictEqual(settings.get().locale, ['fr', 'CA'])
    equal(localStorage.getItem('settings:locale'), 'fr,CA')
  })

  test('has test API', async () => {
    useTestStorageEngine()
    let settings = persistentMap<{ lang: string }>('settings:', {
      lang: 'en'
    })

    let events: string[] = []
    let unbind = settings.listen(value => {
      events.push(value.lang)
    })

    settings.setKey('lang', 'ru')
    deepStrictEqual(getTestStorage(), { 'settings:lang': 'ru' })

    setTestStorageKey('settings:lang', undefined)
    deepStrictEqual(Object.keys(getTestStorage()), [])

    setTestStorageKey('settings:lang', 'uk')
    deepStrictEqual(getTestStorage(), { 'settings:lang': 'uk' })
    deepStrictEqual(settings.get(), { lang: 'uk' })

    cleanTestStorage()
    deepStrictEqual(Object.keys(getTestStorage()), [])
    deepStrictEqual(settings.get(), {})

    unbind()
    await delay(1001)
    deepStrictEqual(Object.keys(getTestStorage()), [])
  })

  test('changes engine', () => {
    let storage: Record<string, string> = {}
    let listeners: PersistentListener[] = []
    let events = {
      addEventListener(key: string, callback: PersistentListener) {
        listeners.push(callback)
      },
      removeEventListener(key: string, callback: PersistentListener) {
        listeners = listeners.filter(i => i !== callback)
      }
    }
    setPersistentEngine(storage, events)

    map = persistentMap('z:')
    map.listen(() => {})
    map.setKey('one', '2')

    equal(listeners.length, 1)
    deepStrictEqual(storage, { 'z:one': '2' })

    storage['z:one'] = '2b'
    for (let i of listeners) i({ key: 'z:one', newValue: '2b' })

    deepStrictEqual(map.get(), { one: '2b' })

    map.set({})
    deepStrictEqual(storage, {})
  })

  test('supports per key engine', async () => {
    let storage: Record<string, string> = {}
    let listeners: Record<string, PersistentListener> = {}
    setPersistentEngine(storage, {
      addEventListener(key, listener) {
        listeners[key] = listener
      },
      perKey: true,
      removeEventListener(key) {
        delete listeners[key]
      }
    })

    map = persistentMap<{ one?: string; two?: string }>('a:', {
      one: '1'
    })
    let unbind = map.listen(() => {})
    deepStrictEqual(Object.keys(listeners), ['a:one', 'a:'])

    map.setKey('one', undefined)
    map.setKey('two', '2')
    deepStrictEqual(Object.keys(listeners), ['a:', 'a:two'])

    map.set({ one: '1a' })
    deepStrictEqual(Object.keys(listeners), ['a:', 'a:one'])

    storage['a:one'] = '1b'
    listeners['a:one']({ key: 'a:one', newValue: '1b' })
    deepStrictEqual(map.get(), { one: '1b' })

    storage['a:new'] = '1b'
    deepStrictEqual(map.get(), { one: '1b' })

    unbind()
    await delay(1010)
    deepStrictEqual(Object.keys(listeners), [])
  })

  test('emits one event per update', () => {
    map = persistentMap<{ one?: string; two?: string }>('1:', {
      one: '1',
      two: '2'
    })

    let events: object[] = []
    map.listen(value => {
      events.push(clone(value))
    })
    map.set({ one: '2', two: '3' })

    equal(events.length, 1)
    deepStrictEqual(map.get(), { one: '2', two: '3' })
  })

  test('emits equally many events per update compared to non-persistent map', () => {
    map = persistentMap<{ one?: string; two?: string }>('1:', {
      one: '1',
      two: '2'
    })
    let nano = nanoMap({ one: '1', two: '2' })

    let events: object[] = []
    let nanoEvents: object[] = []
    map.listen(value => {
      events.push(clone(value))
    })
    nano.listen(value => {
      nanoEvents.push(clone(value))
    })
    map.set({ one: '2', two: '3' })
    nano.set({ one: '2', two: '3' })

    deepStrictEqual(map.get(), nano.get())
    equal(events.length, nanoEvents.length)
  })
})
