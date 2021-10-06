import { cleanStores, MapStore, getValue, WritableStore } from 'nanostores'
import { delay } from 'nanodelay'

import {
  createPersistentStore,
  useTestStorageEngine,
  createPersistentMap,
  setPersistentEngine,
  PersistentListener,
  setTestStorageKey,
  cleanTestStorage,
  getTestStorage,
  windowPersistentEvents
} from '../index.js'

afterEach(() => {
  localStorage.clear()
})

function clone(data: object): object {
  return JSON.parse(JSON.stringify(data))
}

function changeLocalStorage(key: string, newValue: string): void {
  localStorage[key] = newValue
  window.dispatchEvent(new StorageEvent('storage', { key, newValue }))
}

describe('map', () => {
  let map: MapStore<{ one?: string; two?: string }>

  afterEach(() => {
    cleanStores(map)
  })

  it('loads data from localStorage', () => {
    localStorage.setItem('a:one', '1')
    map = createPersistentMap<{ one?: string; two?: string }>('a:', {
      two: '2'
    })
    expect(getValue(map)).toEqual({ one: '1', two: '2' })
  })

  it('saves to localStorage', () => {
    map = createPersistentMap('b:', {})

    let events: object[] = []
    map.listen(value => {
      events.push(clone(value))
    })

    map.setKey('one', '1')
    map.setKey('two', '2')
    expect(localStorage.__STORE__).toEqual({ 'b:one': '1', 'b:two': '2' })
    expect(events).toEqual([{ one: '1' }, { one: '1', two: '2' }])

    map.set({ one: '11' })
    expect(localStorage.__STORE__).toEqual({ 'b:one': '11' })
    expect(events).toEqual([
      { one: '1' },
      { one: '1', two: '2' },
      { one: '11', two: '2' },
      { one: '11' }
    ])

    map.setKey('one', undefined)
    expect(localStorage.__STORE__).toEqual({})
    expect(events).toEqual([
      { one: '1' },
      { one: '1', two: '2' },
      { one: '11', two: '2' },
      { one: '11' },
      {}
    ])
  })

  it('listens for other tabs', () => {
    map = createPersistentMap('c:', {})

    let events: object[] = []
    map.listen(value => {
      events.push(clone(value))
    })

    changeLocalStorage('c:one', '1')

    expect(events).toEqual([{ one: '1' }])
    expect(getValue(map)).toEqual({ one: '1' })
  })

  it('ignores other tabs on requets', () => {
    map = createPersistentMap('c2:', {}, { listen: false })

    let events: object[] = []
    map.listen(value => {
      events.push(clone(value))
    })

    changeLocalStorage('c2:one', '1')

    expect(events).toEqual([])
    expect(getValue(map)).toEqual({})
  })

  it('saves to localStorage in disabled state', () => {
    map = createPersistentMap('d:', {})

    map.setKey('one', '1')
    expect(localStorage['d:one']).toEqual('1')

    map.setKey('one', undefined)
    expect(localStorage['d:one']).toBeUndefined()
  })
})

describe('store', () => {
  let store: WritableStore<string | undefined>

  afterEach(() => {
    cleanStores(store)
  })

  it('loads data from localStorage', () => {
    localStorage.setItem('a', '1')
    store = createPersistentStore('a', '2')
    expect(getValue(store)).toEqual('1')
  })

  it('saves to localStorage', () => {
    store = createPersistentStore<string | undefined>('b')

    let events: (string | undefined)[] = []
    store.listen(value => {
      events.push(value)
    })
    expect(getValue(store)).toBeUndefined()

    store.set('1')
    expect(localStorage.__STORE__).toEqual({ b: '1' })
    expect(events).toEqual(['1'])

    store.set(undefined)
    expect(localStorage.__STORE__).toEqual({})
    expect(events).toEqual(['1', undefined])
  })

  it('listens for other tabs', () => {
    store = createPersistentStore('c')

    let events: (string | undefined)[] = []
    store.listen(value => {
      events.push(value)
    })

    changeLocalStorage('c', '1')

    expect(events).toEqual(['1'])
    expect(getValue(store)).toEqual('1')
  })

  it('ignores other tabs on requets', () => {
    store = createPersistentStore('c2', undefined, { listen: false })

    let events: (string | undefined)[] = []
    store.listen(value => {
      events.push(value)
    })

    changeLocalStorage('c2', '1')

    expect(events).toEqual([])
    expect(getValue(store)).toBeUndefined()
  })

  it('saves to localStorage in disabled state', () => {
    store = createPersistentStore('d')

    store.set('1')
    expect(localStorage.d).toEqual('1')

    store.set(undefined)
    expect(localStorage.d).toBeUndefined()
  })
})

describe('engine', () => {
  let map: MapStore<{ one?: string; two?: string }>
  let store: WritableStore<string | undefined>

  afterEach(() => {
    cleanStores(map, store)
    setPersistentEngine(localStorage, windowPersistentEvents)
  })

  it('changes engine', () => {
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

    store = createPersistentStore('z')
    store.listen(() => {})
    store.set('1')

    map = createPersistentMap('z:')
    map.listen(() => {})
    map.setKey('one', '2')

    expect(listeners).toHaveLength(2)
    expect(storage).toEqual({
      'z': '1',
      'z:one': '2'
    })

    storage.z = '1a'
    for (let i of listeners) i({ key: 'z', newValue: '1a' })
    storage['z:one'] = '2b'
    for (let i of listeners) i({ key: 'z:one', newValue: '2b' })

    expect(getValue(store)).toEqual('1a')
    expect(getValue(map)).toEqual({ one: '2b' })

    store.set(undefined)
    map.set({})
    expect(storage).toEqual({})
  })
})

describe('custom encoding', () => {
  let map: MapStore<{ locale: string[] }>
  let store: WritableStore<string[]>

  afterEach(() => {
    cleanStores(map, store)
  })

  it('supports by store', () => {
    store = createPersistentStore('locale', ['en', 'US'], {
      encode: JSON.stringify,
      decode: JSON.parse
    })

    store.listen(() => {})
    store.set(['ru', 'RU'])

    expect(localStorage.getItem('locale')).toEqual('["ru","RU"]')

    changeLocalStorage('locale', '["fr","CA"]')

    expect(getValue(store)).toEqual(['fr', 'CA'])
    expect(localStorage.getItem('locale')).toEqual('["fr","CA"]')
  })

  it('supports by map', () => {
    map = createPersistentMap(
      'settings:',
      { locale: ['en', 'US'] },
      { encode: JSON.stringify, decode: JSON.parse }
    )

    map.listen(() => {})
    map.setKey('locale', ['ru', 'RU'])

    expect(localStorage.getItem('settings:locale')).toEqual('["ru","RU"]')

    changeLocalStorage('settings:locale', '["fr","CA"]')

    expect(getValue(map).locale).toEqual(['fr', 'CA'])
    expect(localStorage.getItem('settings:locale')).toEqual('["fr","CA"]')
  })
})

it('has test API', async () => {
  let settings = createPersistentMap<{ lang: string }>('settings:', {
    lang: 'en'
  })
  useTestStorageEngine()

  let events: string[] = []
  let unbind = settings.listen(value => {
    events.push(value.lang)
  })

  settings.setKey('lang', 'ru')
  expect(getTestStorage()).toEqual({ 'settings:lang': 'ru' })

  setTestStorageKey('settings:lang', undefined)
  expect(Object.keys(getTestStorage())).toHaveLength(0)

  setTestStorageKey('settings:lang', 'uk')
  expect(getTestStorage()).toEqual({ 'settings:lang': 'uk' })
  expect(getValue(settings)).toEqual({ lang: 'uk' })

  cleanTestStorage()
  expect(Object.keys(getTestStorage())).toHaveLength(0)
  expect(getValue(settings)).toEqual({})

  unbind()
  await delay(1001)
  expect(Object.keys(getTestStorage())).toHaveLength(0)
})
