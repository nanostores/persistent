import { createMap, createStore } from 'nanostores'

let identity = a => a
let storageEngine = {}
let eventsEngine = { addEventListener() {}, removeEventListener() {} }
if (typeof localStorage !== 'undefined') {
  storageEngine = localStorage
}
if (typeof window !== 'undefined') {
  eventsEngine = window
}

export function setPersistentEngine(storage, events) {
  storageEngine = storage
  eventsEngine = events
}

export function createPersistentStore(name, initial = undefined, opts = {}) {
  let encode = opts.encode || identity
  let decode = opts.decode || identity
  function listener(e) {
    if (e.key === name) {
      store.set(e.newValue)
    }
  }

  let store = createStore(() => {
    set(decode(storageEngine[name]) || initial)
    if (opts.listen !== false) {
      eventsEngine.addEventListener('storage', listener)
      return () => {
        eventsEngine.removeEventListener('storage', listener)
      }
    }
  })

  let set = store.set
  store.set = newValue => {
    if (typeof newValue === 'undefined') {
      delete storageEngine[name]
    } else {
      storageEngine[name] = encode(newValue)
    }
    set(newValue)
  }

  return store
}

export function createPersistentMap(prefix, initial = {}, opts = {}) {
  let encode = opts.encode || identity
  let decode = opts.decode || identity
  function listener(e) {
    if (e.key.startsWith(prefix)) {
      store.setKey(e.key.slice(prefix.length), e.newValue)
    }
  }

  let store = createMap(() => {
    let data = { ...initial }
    for (let key in storageEngine) {
      if (key.startsWith(prefix)) {
        data[key.slice(prefix.length)] = decode(storageEngine[key])
      }
    }
    store.set(data)
    if (opts.listen !== false) {
      eventsEngine.addEventListener('storage', listener)
      return () => {
        eventsEngine.removeEventListener('storage', listener)
      }
    }
  })

  let setKey = store.setKey
  store.setKey = (key, newValue) => {
    if (typeof newValue === 'undefined') {
      delete storageEngine[prefix + key]
    } else {
      storageEngine[prefix + key] = encode(newValue)
    }
    setKey(key, newValue)
  }

  return store
}

let testStorage = {}
let testListeners = []

export function useTestStorageEngine() {
  setPersistentEngine(testStorage, {
    addEventListener(event, cb) {
      testListeners.push(cb)
    },
    removeEventListener(event, cb) {
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
