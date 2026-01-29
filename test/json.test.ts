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

describe('persistentJSON tests', () => {
  test('Should set null as default', () => {
    let store1 = persistentJSON<boolean>('defaultJSON')
    equal(store1.get(), null)

    store1.set(true)
    equal(store1.get(), true)

    store1.set(false)
    equal(store1.get(), false)

    store1.set(null)
    equal(store1.get(), null)
  })

  test('Should work with boolean', () => {
    let store1 = persistentJSON('booleanJSON', false)
    equal(store1.get(), false)

    store1.set(true)
    equal(store1.get(), true)
    equal(localStorage.booleanJSON, 'true')

    store1.set(false)
    equal(store1.get(), false)
    equal(localStorage.booleanJSON, 'false')

    emitLocalStorage('booleanJSON', 'true')
    equal(store1.get(), true)

    emitLocalStorage('booleanJSON', 'false')
    equal(store1.get(), false)
  })

  test('Should work as array', () => {
    let store2 = persistentJSON<string[]>('arrayJSON', [])
    deepEqual(store2.get(), [])

    store2.set(['foo'])
    deepEqual(store2.get(), ['foo'])

    store2.set([])
    deepEqual(store2.get(), [])
  })
})
