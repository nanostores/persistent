import { $atom, $map } from './index.js'

let preAtom = document.querySelector<HTMLPreElement>('#atom')!
let preMap = document.querySelector<HTMLPreElement>('#map')!

let buttonAtom = document.querySelector<HTMLButtonElement>('#buttonAtom')!
let clearButtonAtom = document.querySelector<HTMLButtonElement>('#clearAtom')!

let buttonMap = document.querySelector<HTMLButtonElement>('#buttonMap')!
let clearButtonMap = document.querySelector<HTMLButtonElement>('#clearMap')!

buttonAtom.addEventListener('click', () => {
  $atom.set([...$atom.get(), Math.random() * Date.now()])
})

clearButtonAtom.addEventListener('click', () => {
  $atom.set([])
})

$atom.subscribe(val => {
  preAtom.textContent = JSON.stringify(val, null, 2)
})

buttonMap.addEventListener('click', () => {
  $map.set({ ...$map.get(), a: String(Math.random() * Date.now()) })
})

clearButtonMap.addEventListener('click', () => {
  $map.set({})
})

$map.subscribe(val => {
  preMap.textContent = JSON.stringify(val, null, 2)
})
