import './setup.ts'

import { delay } from 'nanodelay'
import { cleanStores } from 'nanostores'
import type { WritableAtom } from 'nanostores'
import { deepStrictEqual, equal } from 'node:assert'
import { afterEach, describe, test } from 'node:test'

import {
  persistentAtom,
  type PersistentListener,
  setPersistentEngine,
  windowPersistentEvents
} from '../index.js'
import { persistentBoolean } from '../index.js'
import { emitLocalStorage } from './utils.ts'

let atom: WritableAtom<string | undefined>

afterEach(() => {
  localStorage.clear()
  cleanStores(atom)
  setPersistentEngine(localStorage, windowPersistentEvents)
})

describe('persistentAtom', () => {
  test('loads data from localStorage', () => {
    localStorage.a = '1'
    atom = persistentAtom('a', '2')
    equal(atom.get(), '1')
  })

  test('saves to localStorage', () => {
    atom = persistentAtom<string | undefined>('b')

    let events: (string | undefined)[] = []
    atom.listen(value => {
      events.push(value)
    })
    equal(atom.get(), undefined)

    atom.set('1')
    deepStrictEqual(localStorage, { b: '1' })
    deepStrictEqual(events, ['1'])

    atom.set(undefined)
    deepStrictEqual(localStorage, {})
    deepStrictEqual(events, ['1', undefined])
  })

  test('listens for other tabs', () => {
    atom = persistentAtom('c')

    let events: (string | undefined)[] = []
    atom.listen(value => {
      events.push(value)
    })

    emitLocalStorage('c', '1')

    deepStrictEqual(events, ['1'])
    equal(atom.get(), '1')

    emitLocalStorage('c', null)
    equal(atom.get(), undefined)
  })

  test('listens for key cleaning', () => {
    atom = persistentAtom('c')

    let events: (string | undefined)[] = []
    atom.listen(value => {
      events.push(value)
    })
    atom.set('init')

    localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', {}))

    deepStrictEqual(events, ['init', undefined])
    equal(atom.get(), undefined)
  })

  test('ignores other tabs on request', () => {
    atom = persistentAtom('c2', undefined, { listen: false })

    let events: (string | undefined)[] = []
    atom.listen(value => {
      events.push(value)
    })

    emitLocalStorage('c2', '1')

    deepStrictEqual(events, [])
    equal(atom.get(), undefined)
  })

  test('saves to localStorage in disabled state', () => {
    atom = persistentAtom('d')

    atom.set('1')
    equal(localStorage.d, '1')

    atom.set(undefined)
    equal(localStorage.d, undefined)
  })

  test('allows to change encoding', () => {
    let locale = persistentAtom('locale', ['en', 'US'], {
      decode: JSON.parse,
      encode: JSON.stringify
    })

    locale.listen(() => {})
    locale.set(['ru', 'RU'])

    deepStrictEqual(localStorage.getItem('locale'), '["ru","RU"]')

    emitLocalStorage('locale', '["fr","CA"]')

    deepStrictEqual(locale.get(), ['fr', 'CA'])
    deepStrictEqual(localStorage.getItem('locale'), '["fr","CA"]')
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

    atom = persistentAtom('z')
    atom.listen(() => {})
    atom.set('1')

    equal(listeners.length, 1)
    deepStrictEqual(storage, { z: '1' })

    storage.z = '1a'
    for (let i of listeners) i({ key: 'z', newValue: '1a' })

    equal(atom.get(), '1a')

    atom.set(undefined)
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

    atom = persistentAtom('lang')
    let unbind = atom.listen(() => {})
    deepStrictEqual(Object.keys(listeners), ['lang'])

    atom.set('fr')
    deepStrictEqual(Object.keys(listeners), ['lang'])

    storage.lang = 'es'
    listeners.lang({ key: 'lang', newValue: 'es' })
    equal(atom.get(), 'es')

    unbind()
    await delay(1010)
    deepStrictEqual(Object.keys(listeners), [])
  })

  test('goes back to initial on key removal', () => {
    atom = persistentAtom('key', 'initial')
    atom.set('1')

    let events: (string | undefined)[] = []
    atom.listen(value => {
      events.push(value)
    })

    emitLocalStorage('key', null)
    deepStrictEqual(events, ['initial'])
    equal(atom.get(), 'initial')
  })

  test('stores boolean', () => {
    let store1 = persistentBoolean('false')
    equal(store1.get(), false)

    store1.set(true)
    equal(store1.get(), true)
    equal(localStorage.false, 'yes')

    store1.set(false)
    equal(store1.get(), false)
    equal(localStorage.false, '')

    emitLocalStorage('false', 'yes')
    equal(store1.get(), true)

    emitLocalStorage('false', null)
    equal(store1.get(), false)

    let store2 = persistentBoolean('true', true)
    equal(store2.get(), true)

    store2.set(false)
    equal(store2.get(), false)

    store2.set(true)
    equal(store2.get(), true)
  })

  test('init flow', async () => {
    let count = 0
    localStorage.a = '1'

    atom = persistentAtom<string>('a', '2', {
      decode: value => {
        count++
        return value
      },
      encode: value => value,
    })

    equal(count, 1)

    atom.subscribe(() => {})()

    equal(count, 2)

    await new Promise(resolve => setTimeout(resolve, 1000))

    equal(count, 2)

    atom.subscribe(() => {})()

    equal(count, 3)
  })
})
