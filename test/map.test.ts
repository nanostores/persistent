import { cleanStores, MapStore } from 'nanostores'
import { equal, is } from 'uvu/assert'
import { delay } from 'nanodelay'
import { test } from 'uvu'

import { emitLocalStorage } from './setup.js'
import {
  windowPersistentEvents,
  useTestStorageEngine,
  setPersistentEngine,
  PersistentListener,
  setTestStorageKey,
  cleanTestStorage,
  getTestStorage,
  persistentMap
} from '../index.js'

function clone(data: object): object {
  return JSON.parse(JSON.stringify(data))
}

let map: MapStore<{ one?: string; two?: string }>

test.after.each(() => {
  localStorage.clear()
  cleanStores(map)
  setPersistentEngine(localStorage, windowPersistentEvents)
})

test('loads data from localStorage', () => {
  localStorage.setItem('a:one', '1')
  map = persistentMap<{ one?: string; two?: string }>('a:', {
    two: '2'
  })
  equal(map.get(), { one: '1', two: '2' })
})

test('saves to localStorage', () => {
  map = persistentMap('b:', {})

  let events: object[] = []
  map.listen(value => {
    events.push(clone(value))
  })

  map.setKey('one', '1')
  map.setKey('two', '2')
  equal(localStorage, { 'b:one': '1', 'b:two': '2' })
  equal(events, [{ one: '1' }, { one: '1', two: '2' }])

  map.set({ one: '11' })
  equal(localStorage, { 'b:one': '11' })
  equal(events, [
    { one: '1' },
    { one: '1', two: '2' },
    { one: '11', two: '2' },
    { one: '11' }
  ])

  map.setKey('one', undefined)
  equal(localStorage, {})
  equal(events, [
    { one: '1' },
    { one: '1', two: '2' },
    { one: '11', two: '2' },
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

  equal(events, [{ one: '1' }])
  equal(map.get(), { one: '1' })

  emitLocalStorage('c:one', null)
  equal(map.get(), {})
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

  equal(events, [{ one: '1' }, { one: '1', two: '2' }, { two: '2' }, {}])
  equal(map.get(), {})
})

test('ignores other tabs on request', () => {
  map = persistentMap('c2:', {}, { listen: false })

  let events: object[] = []
  map.listen(value => {
    events.push(clone(value))
  })

  emitLocalStorage('c2:one', '1')

  equal(events, [])
  equal(map.get(), {})
})

test('saves to localStorage in disabled state', () => {
  map = persistentMap('d:', {})

  map.setKey('one', '1')
  equal(localStorage['d:one'], '1')

  map.setKey('one', undefined)
  is(localStorage['d:one'], undefined)
})

test('allows to change encoding', () => {
  let settings = persistentMap<{ locale: string[] }>(
    'settings:',
    { locale: ['en', 'US'] },
    { encode: JSON.stringify, decode: JSON.parse }
  )

  settings.listen(() => {})
  settings.setKey('locale', ['ru', 'RU'])

  equal(localStorage.getItem('settings:locale'), '["ru","RU"]')

  emitLocalStorage('settings:locale', '["fr","CA"]')

  equal(settings.get().locale, ['fr', 'CA'])
  equal(localStorage.getItem('settings:locale'), '["fr","CA"]')
})

test('has test API', async () => {
  let settings = persistentMap<{ lang: string }>('settings:', {
    lang: 'en'
  })
  useTestStorageEngine()

  let events: string[] = []
  let unbind = settings.listen(value => {
    events.push(value.lang)
  })

  settings.setKey('lang', 'ru')
  equal(getTestStorage(), { 'settings:lang': 'ru' })

  setTestStorageKey('settings:lang', undefined)
  equal(Object.keys(getTestStorage()), [])

  setTestStorageKey('settings:lang', 'uk')
  equal(getTestStorage(), { 'settings:lang': 'uk' })
  equal(settings.get(), { lang: 'uk' })

  cleanTestStorage()
  equal(Object.keys(getTestStorage()), [])
  equal(settings.get(), {})

  unbind()
  await delay(1001)
  equal(Object.keys(getTestStorage()), [])
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
  equal(storage, { 'z:one': '2' })

  storage['z:one'] = '2b'
  for (let i of listeners) i({ key: 'z:one', newValue: '2b' })

  equal(map.get(), { one: '2b' })

  map.set({})
  equal(storage, {})
})

test('supports per key engine', async () => {
  let storage: Record<string, string> = {}
  let listeners: Record<string, PersistentListener> = {}
  setPersistentEngine(storage, {
    addEventListener(key, listener) {
      listeners[key] = listener
    },
    removeEventListener(key) {
      delete listeners[key]
    },
    perKey: true
  })

  map = persistentMap<{ one?: string; two?: string }>('a:', {
    one: '1'
  })
  let unbind = map.listen(() => {})
  equal(Object.keys(listeners), ['a:one', 'a:'])

  map.setKey('one', undefined)
  map.setKey('two', '2')
  equal(Object.keys(listeners), ['a:', 'a:two'])

  map.set({ one: '1a' })
  equal(Object.keys(listeners), ['a:', 'a:one'])

  storage['a:one'] = '1b'
  listeners['a:one']({ key: 'a:one', newValue: '1b' })
  equal(map.get(), { one: '1b' })

  storage['a:new'] = '1b'
  equal(map.get(), { one: '1b' })

  unbind()
  await delay(1010)
  equal(Object.keys(listeners), [])
})

test.run()
