import { setPersistentEngine, persistentAtom, persistentMap } from '../index.js'

// THROWS '{ code: string; }' does not satisfy the constraint 'string'
let lang = persistentAtom<{ code: string }>('locale', { code: 'ru' })

let settings = persistentMap<{
  favorite?: string
  theme: 'light' | 'dark'
}>('settings:', {
  theme: 'light'
})

settings.subscribe(value => {
  // THROWS 'light' does not exist on type
  console.log(value.light)
})

// THROWS "1"' is not assignable to parameter of type '"dark" | "light"'
settings.setKey('theme', '1')
// THROWS '"option"' is not assignable to parameter of type
settings.setKey('option', '1')
// THROWS 'undefined' is not assignable to parameter of type '"dark" | "light"'
settings.setKey('theme', undefined)

let count = persistentAtom<number>('count', 0, {
  encode(origin) {
    return `${origin}`
  },
  // THROWS => string' is not assignable to type '(encoded: string) => number
  decode(encoded) {
    return encoded
  }
})

count.set(1)
