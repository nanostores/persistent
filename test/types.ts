import {
  createPersistentStore,
  createPersistentMap,
  setPersistentEngine,
  PersistentListener
} from '../index.js'

const windowPersistentEvents = {
  addEventListener(key: string, listener: PersistentListener) {
    window.addEventListener('storage', listener as unknown as EventListener)
  },
  removeEventListener(key: string, listener: PersistentListener) {
    window.removeEventListener('storage', listener as unknown as EventListener)
  }
}

setPersistentEngine(localStorage, windowPersistentEvents)

let settings = createPersistentMap<{
  favorite?: string
  theme: 'light' | 'dark'
}>('settings:', {
  theme: 'light'
})

settings.subscribe(value => {
  console.log(value.theme)
})

settings.setKey('theme', 'dark')
settings.setKey('favorite', '1')
settings.setKey('favorite', undefined)

let count = createPersistentStore<number>('count', 0, {
  encode(origin) {
    return `${origin}`
  },
  decode(encoded) {
    return parseInt(encoded, 10)
  }
})

count.set(1)
