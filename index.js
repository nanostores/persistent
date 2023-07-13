import { atom, map, onMount } from 'nanostores'

let identity = a => a
let storageEngine = {}
let eventsEngine = { addEventListener() {}, removeEventListener() {} }

function testSupport() {
  try {
    return typeof localStorage !== 'undefined'
  } catch {
    /* c8 ignore next 3 */
    // In Privacy Mode access to localStorage will return error
    return false
  }
}
if (testSupport()) {
  storageEngine = localStorage
}

export let windowPersistentEvents = {
  addEventListener(key, listener, restore) {
    window.addEventListener('storage', listener)
    window.addEventListener('pageshow', restore)
  },
  removeEventListener(key, listener, restore) {
    window.removeEventListener('storage', listener)
    window.removeEventListener('pageshow', restore)
  }
}

if (typeof window !== 'undefined') {
  eventsEngine = windowPersistentEvents
}

export function setPersistentEngine(storage, events) {
  storageEngine = storage
  eventsEngine = events
}

export function persistentAtom(name, initial = undefined, opts = {}) {
  let encode = opts.encode || identity
  let decode = opts.decode || identity

  let store = atom(initial)

  let set = store.set
  store.set = newValue => {
    if (typeof newValue === 'undefined') {
      delete storageEngine[name]
    } else {
      storageEngine[name] = encode(newValue)
    }
    set(newValue)
  }

  function listener(e) {
    if (e.key === name) {
      if (e.newValue === null) {
        set(undefined)
      } else {
        set(decode(e.newValue))
      }
    } else if (!storageEngine[name]) {
      set(undefined)
    }
  }

  function restore() {
    store.set(storageEngine[name] ? decode(storageEngine[name]) : initial)
  }

  onMount(store, () => {
    restore()
    if (opts.listen !== false) {
      eventsEngine.addEventListener(name, listener, restore)
      return () => {
        eventsEngine.removeEventListener(name, listener, restore)
      }
    }
  })

  return store
}

export function persistentMap(prefix, initial = {}, opts = {}) {
  let encode = opts.encode || identity
  let decode = opts.decode || identity

  let store = map()

  let setKey = store.setKey
  store.setKey = (key, newValue) => {
    if (typeof newValue === 'undefined') {
      if (opts.listen !== false && eventsEngine.perKey) {
        eventsEngine.removeEventListener(prefix + key, listener, restore)
      }
      delete storageEngine[prefix + key]
    } else {
      if (
        opts.listen !== false &&
        eventsEngine.perKey &&
        !(key in store.value)
      ) {
        eventsEngine.addEventListener(prefix + key, listener, restore)
      }
      storageEngine[prefix + key] = encode(newValue)
    }
    setKey(key, newValue)
  }

  let set = store.set
  store.set = function (newObject) {
    for (let key in newObject) {
      store.setKey(key, newObject[key])
    }
    for (let key in store.value) {
      if (!(key in newObject)) {
        store.setKey(key)
      }
    }
  }

  function listener(e) {
    if (!e.key) {
      set({})
    } else if (e.key.startsWith(prefix)) {
      if (e.newValue === null) {
        setKey(e.key.slice(prefix.length), undefined)
      } else {
        setKey(e.key.slice(prefix.length), decode(e.newValue))
      }
    }
  }

  function restore() {
    let data = { ...initial }
    for (let key in storageEngine) {
      if (key.startsWith(prefix)) {
        data[key.slice(prefix.length)] = decode(storageEngine[key])
      }
    }
    store.set(data)
  }

  onMount(store, () => {
    restore()
    if (opts.listen !== false) {
      eventsEngine.addEventListener(prefix, listener, restore)
      return () => {
        eventsEngine.removeEventListener(prefix, listener, restore)
        for (let key in store.value) {
          eventsEngine.removeEventListener(prefix + key, listener, restore)
        }
      }
    }
  })

  return store
}

let testStorage = {}
let testListeners = []

export function useTestStorageEngine() {
  setPersistentEngine(testStorage, {
    addEventListener(key, cb) {
      testListeners.push(cb)
    },
    removeEventListener(key, cb) {
      testListeners = testListeners.filter(i => i !== cb)
    }
  })
}

export function setTestStorageKey(key, newValue) {
  if (typeof newValue === 'undefined') {
    delete testStorage[key]
  } else {
    testStorage[key] = newValue
  }
  let event = { key, newValue }
  for (let listener of testListeners) {
    listener(event)
  }
}

export function getTestStorage() {
  return testStorage
}

export function cleanTestStorage() {
  for (let i in testStorage) {
    setTestStorageKey(i, undefined)
  }
}
