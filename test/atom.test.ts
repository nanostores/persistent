import { cleanStores, WritableAtom } from 'nanostores'
import { equal, is } from 'uvu/assert'
import { delay } from 'nanodelay'
import { test } from 'uvu'

import { emitLocalStorage } from './setup.js'
import {
  windowPersistentEvents,
  setPersistentEngine,
  PersistentListener,
  persistentAtom
} from '../index.js'

let atom: WritableAtom<string | undefined>

test.after.each(() => {
  localStorage.clear()
  cleanStores(atom)
  setPersistentEngine(localStorage, windowPersistentEvents)
})

test('loads data from localStorage', () => {
  localStorage.setItem('a', '1')
  atom = persistentAtom('a', '2')
  equal(atom.get(), '1')
})

test('saves to localStorage', () => {
  atom = persistentAtom<string | undefined>('b')

  let events: (string | undefined)[] = []
  atom.listen(value => {
    events.push(value)
  })
  is(atom.get(), undefined)

  atom.set('1')
  equal(localStorage, { b: '1' })
  equal(events, ['1'])

  atom.set(undefined)
  equal(localStorage, {})
  equal(events, ['1', undefined])
})

test('listens for other tabs', () => {
  atom = persistentAtom('c')

  let events: (string | undefined)[] = []
  atom.listen(value => {
    events.push(value)
  })

  emitLocalStorage('c', '1')

  equal(events, ['1'])
  equal(atom.get(), '1')

  emitLocalStorage('c', null)
  is(atom.get(), undefined)
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

  equal(events, ['init', undefined])
  is(atom.get(), undefined)
})

test('ignores other tabs on request', () => {
  atom = persistentAtom('c2', undefined, { listen: false })

  let events: (string | undefined)[] = []
  atom.listen(value => {
    events.push(value)
  })

  emitLocalStorage('c2', '1')

  equal(events, [])
  is(atom.get(), undefined)
})

test('saves to localStorage in disabled state', () => {
  atom = persistentAtom('d')

  atom.set('1')
  equal(localStorage.d, '1')

  atom.set(undefined)
  is(localStorage.d, undefined)
})

test('allows to change encoding', () => {
  let locale = persistentAtom('locale', ['en', 'US'], {
    encode: JSON.stringify,
    decode: JSON.parse
  })

  locale.listen(() => {})
  locale.set(['ru', 'RU'])

  equal(localStorage.getItem('locale'), '["ru","RU"]')

  emitLocalStorage('locale', '["fr","CA"]')

  equal(locale.get(), ['fr', 'CA'])
  equal(localStorage.getItem('locale'), '["fr","CA"]')
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
  equal(storage, { z: '1' })

  storage.z = '1a'
  for (let i of listeners) i({ key: 'z', newValue: '1a' })

  equal(atom.get(), '1a')

  atom.set(undefined)
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

  atom = persistentAtom('lang')
  let unbind = atom.listen(() => {})
  equal(Object.keys(listeners), ['lang'])

  atom.set('fr')
  equal(Object.keys(listeners), ['lang'])

  storage.lang = 'es'
  listeners.lang({ key: 'lang', newValue: 'es' })
  equal(atom.get(), 'es')

  unbind()
  await delay(1010)
  equal(Object.keys(listeners), [])
})

test.run()
