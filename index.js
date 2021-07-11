import { createMap, createStore } from 'nanostores'

export function createPersistentStore(name, initial = {}) {
  function listener(e) {
    if (e.key === name) {
      store.set(e.newValue)
    }
  }

  let store = createStore(() => {
    let data = initial
    if (localStorage) {
      data = localStorage[name]
    }
    set(data)
    window.addEventListener('storage', listener)
    return () => {
      window.removeEventListener('storage', listener)
    }
  })

  let set = store.set
  store.set = newValue => {
    if (typeof newValue === 'undefined') {
      localStorage.removeItem(name)
    } else {
      localStorage.setItem(name, newValue)
    }
    set(newValue)
  }

  return store
}

export function createPersistentMap(prefix, initial = {}) {
  function listener(e) {
    if (e.key.startsWith(prefix)) {
      store.setKey(e.key.slice(prefix.length), e.newValue)
    }
  }

  let store = createMap(() => {
    let data = { ...initial }
    if (localStorage) {
      for (let key in localStorage) {
        if (key.startsWith(prefix)) {
          data[key.slice(prefix.length)] = localStorage[key]
        }
      }
    }
    store.set(data)
    window.addEventListener('storage', listener)
    return () => {
      window.removeEventListener('storage', listener)
    }
  })

  let setKey = store.setKey
  store.setKey = (key, newValue) => {
    if (typeof newValue === 'undefined') {
      localStorage.removeItem(prefix + key)
    } else {
      localStorage.setItem(prefix + key, newValue)
    }
    setKey(key, newValue)
  }

  return store
}
