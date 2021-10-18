/**
 * @jest-environment node
 */

import { cleanStores, MapStore, WritableAtom } from 'nanostores'

import { persistentAtom, persistentMap } from '../index.js'

describe('map', () => {
  let map: MapStore<{ one?: string; two?: string }>

  afterEach(() => {
    cleanStores(map)
  })

  it('works without localStorage', () => {
    map = persistentMap<{ one?: string; two?: string }>('a:', {
      one: '1'
    })
    map.listen(() => {})
    map.setKey('two', '2')
    expect(map.get()).toEqual({ one: '1', two: '2' })
  })
})

describe('store', () => {
  let store: WritableAtom<string | undefined>

  afterEach(() => {
    cleanStores(store)
  })

  it('works without localStorage', () => {
    store = persistentAtom('a', '1')
    store.listen(() => {})
    store.set('2')
    expect(store.get()).toBe('2')
  })
})
