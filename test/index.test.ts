import { cleanStores, MapStore, getValue, WritableStore } from 'nanostores'

import { createPersistentMap, createPersistentStore } from '../index.js'

let map: MapStore<{ one?: string; two?: string }>
let store: WritableStore<string | undefined>
afterEach(() => {
  cleanStores(map, store)
  localStorage.clear()
})

function clone(data: object): object {
  return JSON.parse(JSON.stringify(data))
}

describe('map', () => {
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

    localStorage['c:one'] = '1'
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'c:one',
        newValue: '1'
      })
    )

    expect(events).toEqual([{ one: '1' }])
    expect(getValue(map)).toEqual({ one: '1' })
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
  it('loads data from localStorage', () => {
    localStorage.setItem('a', '1')
    store = createPersistentStore('a', '2')
    expect(getValue(store)).toEqual('1')
  })

  it('saves to localStorage', () => {
    store = createPersistentStore<string | undefined>('b')
    expect(getValue(store)).toBeUndefined()

    let events: (string | undefined)[] = []
    store.listen(value => {
      events.push(value)
    })

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

    localStorage.c = '1'
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'c',
        newValue: '1'
      })
    )

    expect(events).toEqual(['1'])
    expect(getValue(store)).toEqual('1')
  })

  it('saves to localStorage in disabled state', () => {
    store = createPersistentStore('d')

    store.set('1')
    expect(localStorage.d).toEqual('1')

    store.set(undefined)
    expect(localStorage.d).toBeUndefined()
  })
})
