# Change Log
This project adheres to [Semantic Versioning](http://semver.org/).

## 1.2.1
* Fixed keeping user’s value after changes default (by @d8corp).
* Initialize store as soon as possible  (by @d8corp).

## 1.2.0
* Added `persistentBoolean()` helper.

## 1.1.0
* Added ability to delete key from storage in `encode`.
* Fixed reaction on atom’s key removal.

## 1.0.0
* Added Nano Stores 1.0 support.
* Removed Node.js 18 support.

## 0.10.2
* Added Nano Stores 0.11 support.

## 0.10.1
* Fixed multiple update events on single `persistentMap.set` call (by @kaytwo).

## 0.10.0
* Moved to Nano Stores 0.10.
* Removed Node.js 16 support.

## 0.9.1
* Fixed bfcache support (by @GoldStrikeArch).

## 0.9
* Moved to Nano Stores 0.9.

## 0.8
* Moved to Nano Stores 0.8.
* Removed Node.js 14 support.

## 0.7
* Moved to Nano Stores 0.7.

## 0.6.2
* Fixed `Block all cookies` mode support (by @Mitsunee).

## 0.6.1
* Fixed `store.set` changes support (by Vance Tan).

## 0.6
* Moved to Nano Stores 0.6.
* Dropped Node.js 12 support.
* Added `PersistentEncoder` type export.

## 0.5.3
* Fixed `encode`/`decode` types for `persistentMap()`.

## 0.5.2
* Fixed data deletion on opening new tab (by Mohammad Babazadeh).

## 0.5.1
* Fixed going to `undefined` in another tab after loading.

## 0.5
* Rename `createPersistentStore()` to `persistentAtom()`.
* Rename `createPersistentMap()` to `persistentMap()`.
* Moved to Nano Stores 0.5.

## 0.4.1
* Fixed `localStorage.removeItem()` support (by Nikolay Govorov).
* Fixed `localStorage.clear()` support.

## 0.4
* Added support for per-key listeners in custom engine (by Michael Brunner).

## 0.3.3
* Fixed types (by @davidmz).

## 0.3.2
* Fixed custom encoding.

## 0.3.1
* Fixed `encode` and `decode` option types.

## 0.3
* Added `encode` and `decode` options (by Ivan Vasilyev).

## 0.2.1
* Fixed test storage cleaning.

## 0.2
* Added test API.

## 0.1.2
* Fixed non-string types error for `createPersistentStore`.

## 0.1.1
* Fixed server-side rendering support.

## 0.1
* Initial release.
