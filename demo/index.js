import { persistentAtom } from "../index.js";

export const anAtom = persistentAtom("test", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

const pre = document.querySelector("#items");

anAtom.subscribe((val) => {
  pre.textContent = JSON.stringify(val, null, 2);
});
