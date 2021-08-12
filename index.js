import { createMap, createStore } from 'nanostores'

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
  function listener(e) {
    if (e.key === name) {
      store.set(e.newValue)
    }
  }

  let store = createStore(() => {
    set(storageEngine[name] || initial)
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
      storageEngine[name] = newValue
    }
    set(newValue)
  }

  return store
}

export function createPersistentMap(prefix, initial = {}, opts = {}) {
  function listener(e) {
    if (e.key.startsWith(prefix)) {
      store.setKey(e.key.slice(prefix.length), e.newValue)
    }
  }

  let store = createMap(() => {
    let data = { ...initial }
    for (let key in storageEngine) {
      if (key.startsWith(prefix)) {
        data[key.slice(prefix.length)] = storageEngine[key]
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
      storageEngine[prefix + key] = newValue
    }
    setKey(key, newValue)
  }

  return store
}
