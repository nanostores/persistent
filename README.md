# Nano Stores Persistent

<img align="right" width="92" height="92" title="Nano Stores logo"
     src="https://nanostores.github.io/nanostores/logo.svg">

A tiny persistent store for [Nano Stores](https://github.com/nanostores/nanostores)
state manager. It stores data in `localStorage` and synchronize changes between
browser tabs.

* **Small.** from 193 bytes (minified and gzipped).
  Zero dependencies. It uses [Size Limit] to control size.
* It has good **TypeScript**.
* Framework agnostic. It supports SSR.
  `localStorage` can be switched to another storage.

```ts
import { createPersistentStore } from '@nanostores/persistent'

export const locale = createPersistentStore('locale', 'en')
```

<a href="https://evilmartians.com/?utm_source=logux-client">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>

[Size Limit]: https://github.com/ai/size-limit


## Install

```sh
npm install nanostores @nanostores/persistent
```


## Usage

See [Nano Stores docs](https://github.com/nanostores/nanostores#guide)
about using the store and subscribing to store’s changes in UI frameworks.


### Primitive Store

The store with primitive value keep the whole data in the single `localStorage`
key.

```ts
import { createPersistentStore } from '@nanostores/persistent'

export const shoppingCart = createPersistentStore<Product[]>('cart', [])
```

This store will keep it’s value `localStorage` in `cart` key.
`[]` will be initial value on missed key in `localStorage`.

You can change store value by `set` method. You can also use `update` syntax
sugar from Nano Stores.

```ts
import { update } from 'nanostores'

update(shoppingCart, card => [...card, newProduct])
```

You can store object in primitive store too. But Persistent Map store is better,
because map store will update value if you will add new key to initial value.


### Map Store

There is a special key-value map store. It keep each key
in separated `localStorage` key.

```ts
import { createPersistentMap } from '@nanostores/persistent'

export type SettingsValue = {
  sidebar: 'show' | 'hide',
  theme: 'dark' | 'light' | 'auto'
}

export const settings = createPersistentMap('settings:', {
  sidebar: 'show',
  theme: 'auto'
})
```

This store will keep value in `settings:sidebar` and `settings:theme` keys.

You can change the key by `setKey` method:

```ts
settings.setKey('sidebar', 'hide')
```


### Sync between Browser Tabs

By default, store’s changes will be synchronized between browser tabs.

There is a `listen` option to disable synchronization.

```ts
import { createPersistentStore } from '@nanostores/persistent'

export const draft = createPersistentStore('draft', '', { listen: false })
```


### Persistent Engine

You can switch `localStorage` to any other storage for all used stores.

```ts
import { setPersistentEngine } from '@nanostores/persistent'

let listeners = []
function onChange (key, newValue) {
  const event = { key, newValue }
  for (const i of listeners) i(event)
}

// Must implement storage[key] = value, storage[key], and delete storage[key]
const storage = new Proxy({}, {
  set(target, name, value) {
    target[name] = value
    onChange(name, value)
  },
  get(target, name) {
    return target[name]
  },
  deleteProperty(target, name) {
    delete target[name]
    onChange(name, undefined)
  }
})

// Must implement addEventListener and removeEventListener for `storage` event
const events = {
  addEventListener (name, callback) {
    listeners.push(callback)
  },
  removeEventListener (name, callback) {
    listeners = listeners.filter(i => i !== callback)
  }
}

setPersistentEngine(storage, events)
```

You do not need to do anything for server-side rendering. We have build-in
support.

You need to specify bodies of `events.addEventListener`
and `events.removeEventListener` only for environment with browser tabs
or another reasons to storage synchronization.

For TypeScript, we have `PersistentListener` and `PersistentEvent` types
for events object.

```ts
import { PersistentListener, PersistentEvent } from '@nanostores/persistent'

const events = {
  addEventListener (name: 'storage', callback: PersistentListener) {
    …
  },
  removeEventListener (name: 'storage', callback: PersistentListener) {
    …
  }
}

function onChange () {
  const event: PersistentEvent = {
    key: 'locale' // Changed storage key
    newValue: 'ru'
  }
  …
}
```


### Tests

There is a special API to replace `localStorage` to fake storage engine
with helpers to change key and get all values.

```js
import {
  useTestStorageEngine,
  setTestStorageKey,
  cleanTestStorage,
  getTestStorage,
} from '@nanostores/persistent'

import { settings } from './storage.js'

beforeAll(() => {
  useTestStorageEngine()
})

afterEach(() => {
  cleanTestStorage()
})

it('listens for changes', () => {
  setTestStorageKey('settings:locale', 'ru')
  expect(getValue(settings)).toEqual({ locale: 'ru' })
})

it('changes storage', () => {
  settings.setKey('locale')
  expect(getTestStorage()).toEqual({ 'settings:locale': 'ru' })
})
```
