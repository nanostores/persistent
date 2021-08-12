import { createPersistentMap, createPersistentStore } from '../index.js'

// THROWS '{ code: string; }' does not satisfy the constraint 'string'
let lang = createPersistentStore<{ code: string }>('locale', { code: 'ru' })

let settings = createPersistentMap<{
  favorite?: string
  theme: 'light' | 'dark'
}>('settings:', {
  theme: 'light'
})

settings.subscribe(value => {
  // THROWS 'light' does not exist on type
  console.log(value.light)
})

// THROWS "1"' is not assignable to parameter of type '"light" | "dark"
settings.setKey('theme', '1')
// THROWS '"option"' is not assignable to parameter of type
settings.setKey('option', '1')
// THROWS 'undefined' is not assignable to parameter of type '"light" | "dark"'
settings.setKey('theme', undefined)
