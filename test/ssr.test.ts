/**
 * @jest-environment node
 */

import { cleanStores, MapStore, getValue, WritableStore } from 'nanostores'

import { createPersistentStore, createPersistentMap } from '../index.js'

describe('map', () => {
  let map: MapStore<{ one?: string; two?: string }>

  afterEach(() => {
    cleanStores(map)
  })

  it('works without localStorage', () => {
    map = createPersistentMap<{ one?: string; two?: string }>('a:', {
      one: '1'
    })
    map.listen(() => {})
    map.setKey('two', '2')
    expect(getValue(map)).toEqual({ one: '1', two: '2' })
  })
})

describe('store', () => {
  let store: WritableStore<string | undefined>

  afterEach(() => {
    cleanStores(store)
  })

  it('works without localStorage', () => {
    store = createPersistentStore('a', '1')
    store.listen(() => {})
    store.set('2')
    expect(getValue(store)).toEqual('2')
  })
})
