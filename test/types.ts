import { createPersistentMap, setPersistentEngine } from '../index.js'

setPersistentEngine(localStorage, window)

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
