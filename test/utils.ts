export function emitLocalStorage(key: string, newValue: null | string): void {
  if (newValue === null) {
    delete localStorage[key]
  } else {
    localStorage[key] = newValue
  }
  global.window.dispatchEvent(
    new global.StorageEvent('storage', { key, newValue })
  )
}
