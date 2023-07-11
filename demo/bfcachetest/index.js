import { anAtom } from "../index.js";

const pre = document.querySelector("#items");

const button = document.querySelector("#button");
const clearButton = document.querySelector("#clear");

button.addEventListener("click", () => {
  anAtom.set([...anAtom.get(), Math.random() * Date.now()]);
});

clearButton.addEventListener("click", () => {
  anAtom.set([]);
});

anAtom.subscribe((val) => {
  pre.textContent = JSON.stringify(val, null, 2);
});
