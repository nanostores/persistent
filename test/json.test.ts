import './setup.ts'

import { deepEqual, equal } from 'node:assert'
import { afterEach, describe, test } from 'node:test'

import {
  persistentJSON,
  setPersistentEngine,
  windowPersistentEvents
} from '../index.js'
import { emitLocalStorage } from './utils.ts'

afterEach(() => {
  localStorage.clear()
  setPersistentEngine(localStorage, windowPersistentEvents)
})

describe('persistentJSON', () => {
  test('Should set null as default', () => {
    let store = persistentJSON<boolean>('defaultJSON')
    equal(store.get(), null)

    store.set(true)
    equal(store.get(), true)

    store.set(false)
    equal(store.get(), false)

    store.set(null)
    equal(store.get(), null)
  })

  test('Should work with boolean', () => {
    let store = persistentJSON('booleanJSON', false)
    equal(store.get(), false)

    store.set(true)
    equal(store.get(), true)
    equal(localStorage.booleanJSON, 'true')

    store.set(false)
    equal(store.get(), false)
    equal(localStorage.booleanJSON, 'false')

    emitLocalStorage('booleanJSON', 'true')
    equal(store.get(), true)

    emitLocalStorage('booleanJSON', 'false')
    equal(store.get(), false)
  })

  test('Should work as array', () => {
    let store = persistentJSON<string[]>('arrayJSON', [])
    deepEqual(store.get(), [])

    store.set(['foo'])
    deepEqual(store.get(), ['foo'])

    store.set([])
    deepEqual(store.get(), [])
  })

  test('Should handle bad storage', () => {
    localStorage.json = 'yes'

    let init: string[] = []
    let store = persistentJSON('json', init)

    equal(store.get(), init)
  })
})
