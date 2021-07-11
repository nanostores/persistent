# Nano Stores Persistent

<img align="right" width="95" height="148" title="Logux logotype"
     src="https://logux.io/branding/logotype.svg">

A tiny persistent store for [Nano Stores](https://github.com/nanostores/nanostores)
state manager. It stores data in `localStorage` and synchronize changes between
browser tabs.

* **Small.** 221 bytes (minified and gzipped).
  Zero dependencies. It uses [Size Limit] to control size.
* It has good **TypeScript** support.
* Framework agnostic. Can be used for **React**, **Preact**, **Vue**,
  **Svelte**, and vanilla JS.

```ts
import { createPersistentMap } from 'nanostores'

export interface CartValue {
  list: string[]
}

export const shoppingCart = createPersistentMap<CartValue>({ list: [] }, 'cart')
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
