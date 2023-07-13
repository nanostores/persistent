import { persistentAtom, persistentMap } from '../index.js'

export let $atom = persistentAtom('test', [], {
  encode: JSON.stringify,
  decode: JSON.parse
})

export let $map = persistentMap('testMap', {})

let preAtom = document.querySelector<HTMLPreElement>('#atom')!
let preMap = document.querySelector<HTMLPreElement>('#map')!

$atom.subscribe(val => {
  preAtom.textContent = JSON.stringify(val, null, 2)
})

$map.subscribe(val => {
  preMap.textContent = JSON.stringify(val, null, 2)
})

window.addEventListener('pageshow', event => {
  if (event.persisted) {
    console.log('The page was restored from the bfcache')
  } else {
    console.log('The page was loaded normally')
  }
})
