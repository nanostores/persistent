import {
  persistentAtom,
  type PersistentListener,
  persistentMap,
  setPersistentEngine
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

let settings = persistentMap<{
  favorite?: string
  theme: 'dark' | 'light'
}>('settings:', {
  theme: 'light'
})

settings.subscribe(value => {
  console.log(value.theme)
})

settings.setKey('theme', 'dark')
settings.setKey('favorite', '1')
settings.setKey('favorite', undefined)

let count = persistentAtom<number>('count', 0, {
  decode(encoded) {
    return parseInt(encoded, 10)
  },
  encode(origin) {
    return `${origin}`
  }
})

count.set(1)
