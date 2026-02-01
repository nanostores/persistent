# Nano Stores Persistent

<img align="right" width="92" height="92" title="Nano Stores logo"
     src="https://nanostores.github.io/nanostores/logo.svg">

A smart store for [Nano Stores] state manager to keep data in `localStorage`
and synchronize changes between browser tabs.

* **Small.** from 289 bytes (minified and brotlied).
  Zero dependencies. It uses [Size Limit] to control size.
* It has good **TypeScript**.
* Framework agnostic. It supports SSR.
  `localStorage` can be switched to another storage.

```ts
import { persistentAtom } from '@nanostores/persistent'

export const $locale = persistentAtom('locale', 'en')
```

[Nano Stores]: https://github.com/nanostores/nanostores
[Size Limit]: https://github.com/ai/size-limit

---

<img src="https://cdn.evilmartians.com/badges/logo-no-label.svg" alt="" width="22" height="16" />  Made at <b><a href="https://evilmartians.com/devtools?utm_source=nanostores-persistent&utm_campaign=devtools-button&utm_medium=github">Evil Martians</a></b>, product consulting for <b>developer tools</b>.

---


## Install

```sh
npm install nanostores @nanostores/persistent
```


## Usage

See [Nano Stores docs](https://github.com/nanostores/nanostores#guide)
about using the store and subscribing to store’s changes in UI frameworks.


### Primitive Store

The store with primitive value keeps the whole data in the single `localStorage`
key.

```ts
import { persistentAtom } from '@nanostores/persistent'

export const $shoppingCart = persistentAtom<Product[]>('cart', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
})
```

This store will keep its value in `cart` key of`localStorage`.
An empty array `[]` will be initial value on missed key in `localStorage`.

You can change store value by `set` method.

```ts
$shoppingCart.set([...$shoppingCart.get(), newProduct])
```

You can store the object in a primitive store too. But Persistent Map store
is better, because map store will update value if you add a new key to
the initial value.

There is simple wrapper to store boolean:

```ts
import { persistentBoolean } from '@nanostores/persistent'

export const $reduceMotion = persistentBoolean('reduce-motion')
```


### JSON Store

`persistentJSON` is a handy shortcut for `persistentAtom` that takes care of JSON serialization for you.

It works with any valid JSON type: objects, arrays, primitives (`string`, `number`, `boolean`, `null`).

```ts
import { persistentJSON } from '@nanostores/persistent'

const $cart = persistentJSON<Product[]>('cart', [])
const $theme = persistentJSON<'dark' | 'light' | 'auto'>('theme', 'auto')

$cart.set([...$cart.get(), newProduct])
$theme.set('dark')
```

You can omit initial value argument. In this case, we will add `null` to store type.

```ts
const $comments = persistentJSON<Comment[]>('comments')

console.log($comments.get()?.map(i => i.userId)) // Safe access
```


### Map Store

There is a special key-value map store. It will keep each key
in separated `localStorage` key.

```ts
import { persistentMap } from '@nanostores/persistent'

export type SettingsValue = {
  sidebar: 'show' | 'hide',
  theme: 'dark' | 'light' | 'auto'
}

export const $settings = persistentMap<SettingsValue>('settings:', {
  sidebar: 'show',
  theme: 'auto'
})
```

This store will keep value in `settings:sidebar` and `settings:theme` keys.

You can change the key by `setKey` method:

```ts
$settings.setKey('sidebar', 'hide')
```


### Sync between Browser Tabs

By default, the store changes will be synchronized between browser tabs.

There is a `listen` option to disable synchronization.

```ts
import { persistentAtom } from '@nanostores/persistent'

export const $draft = persistentAtom('draft', '', { listen: false })
```


### Value Encoding

`encode` and `decode` options can be set to process a value before setting
or after getting it from the persistent storage.

```ts
import { persistentAtom } from '@nanostores/persistent'

export const $draft = persistentAtom('draft', [], {
  encode(value) {
    return JSON.stringify(value)
  },
  decode(value) {
    try {
      return JSON.parse(value)
    } catch() {
      return value
    }
  }
})
```

### Server-Side Rendering

The store has built-in SSR support. On the server, they will use
empty objects instead of `localStorage`.

You can manually initialize stores with specific data:

```js
if (isServer) {
  $locale.set(user.locale)
}
```


### Persistent Engines

You can switch `localStorage` to any other storage for all used stores.

```ts
import { setPersistentEngine } from '@nanostores/persistent'

let listeners = []
function onChange(key, newValue) {
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

// Must implement addEventListener and removeEventListener
const events = {
  addEventListener(key, callback) {
    listeners.push(callback)
  },
  removeEventListener(key, callback) {
    listeners = listeners.filter(i => i !== callback)
  },
  // window dispatches "storage" events for any key change
  // => One listener for all map keys is enough
  perKey: false
}

setPersistentEngine(storage, events)
```

You do not need to do anything for server-side rendering. It's supported by default.

You need to specify bodies of `events.addEventListener`
and `events.removeEventListener` only for environments with browser tabs
or another reasons for storage synchronization.

`perKey` makes `PersistentMap` add one listener for each of its keys
in addition to the one for all keys. This is relevant when events for key
changes are only dispatched for keys that were specifically subscribed too.

For TypeScript, we have `PersistentListener` and `PersistentEvent` types
for events object.

```ts
import { PersistentListener, PersistentEvent } from '@nanostores/persistent'

const events = {
  addEventListener(key: string, callback: PersistentListener) {
    …
  },
  removeEventListener(key: string, callback: PersistentListener) {
    …
  }
}

function onChange() {
  const event: PersistentEvent = {
    key: 'locale' // Changed storage key
    newValue: 'ru'
  }
  …
}
```


### Tests

There is a special API to replace `localStorage` to a fake storage engine
with helpers to change key and get all values.

```js
import {
  useTestStorageEngine,
  setTestStorageKey,
  cleanTestStorage,
  getTestStorage,
} from '@nanostores/persistent'

import { $settings } from './storage.js'

beforeAll(() => {
  useTestStorageEngine()
})

afterEach(() => {
  cleanTestStorage()
})

it('listens for changes', () => {
  setTestStorageKey('settings:locale', 'ru')
  expect($settings.get()).toEqual({ locale: 'ru' })
})

it('changes storage', () => {
  $settings.setKey('locale')
  expect(getTestStorage()).toEqual({ 'settings:locale': 'ru' })
})
```
