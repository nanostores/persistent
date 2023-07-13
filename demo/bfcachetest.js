import { anAtom, aMap } from './index.js'

const preAtom = document.querySelector('#atom')
const preMap = document.querySelector('#map')

const buttonAtom = document.querySelector('#buttonAtom')
const clearButtonAtom = document.querySelector('#clearAtom')

const buttonMap = document.querySelector('#buttonMap')
const clearButtonMap = document.querySelector('#clearMap')

buttonAtom.addEventListener('click', () => {
  anAtom.set([...anAtom.get(), Math.random() * Date.now()])
})

clearButtonAtom.addEventListener('click', () => {
  anAtom.set([])
})

anAtom.subscribe(val => {
  preAtom.textContent = JSON.stringify(val, null, 2)
})

buttonMap.addEventListener('click', () => {
  aMap.set({ ...aMap.get(), a: String(Math.random() * Date.now()) })
})

clearButtonMap.addEventListener('click', () => {
  aMap.set({})
})

aMap.subscribe(val => {
  preMap.textContent = JSON.stringify(val, null, 2)
})
