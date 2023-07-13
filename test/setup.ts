import { Window } from 'happy-dom'

let window = new Window()
global.window = window as any
global.StorageEvent = window.StorageEvent as any

global.localStorage = {} as any
Object.defineProperty(localStorage, 'getItem', {
  enumerable: false,
  value(key: string) {
    return localStorage[key] || null
  }
})
Object.defineProperty(global.localStorage, 'setItem', {
  enumerable: false,
  value(key: string, value: null | string) {
    localStorage[key] = `${value}`
  }
})
Object.defineProperty(localStorage, 'clear', {
  enumerable: false,
  value() {
    Object.keys(localStorage).map(key => delete localStorage[key])
  }
})

Object.defineProperty(global, '_localStorage', {
  value: global.localStorage,
  writable: false
})
