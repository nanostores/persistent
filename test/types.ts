import {
  createPersistentStore,
  createPersistentMap,
  setPersistentEngine,
  windowPersistentEvents
} from '../index.js'

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
