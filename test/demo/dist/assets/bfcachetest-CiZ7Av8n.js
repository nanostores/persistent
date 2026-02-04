import { $ as $atom, a as $map } from "./index-456yjtIU.js";
let preAtom = document.querySelector("#atom");
let preMap = document.querySelector("#map");
let buttonAtom = document.querySelector("#buttonAtom");
let clearButtonAtom = document.querySelector("#clearAtom");
let buttonMap = document.querySelector("#buttonMap");
let clearButtonMap = document.querySelector("#clearMap");
buttonAtom.addEventListener("click", () => {
  $atom.set([...$atom.get(), Math.random() * Date.now()]);
});
clearButtonAtom.addEventListener("click", () => {
  $atom.set([]);
});
$atom.subscribe((val) => {
  preAtom.textContent = JSON.stringify(val, null, 2);
});
buttonMap.addEventListener("click", () => {
  $map.set({ ...$map.get(), a: String(Math.random() * Date.now()) });
});
clearButtonMap.addEventListener("click", () => {
  $map.set({});
});
$map.subscribe((val) => {
  preMap.textContent = JSON.stringify(val, null, 2);
});
