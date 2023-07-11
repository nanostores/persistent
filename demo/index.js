import { persistentAtom, persistentMap } from "../index.js";

export const anAtom = persistentAtom("test", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const aMap = persistentMap("testMap", {});

const atomPre = document.querySelector("#atom");
const mapPre = document.querySelector("#map");

anAtom.subscribe((val) => {
  atomPre.textContent = JSON.stringify(val, null, 2);
});

aMap.subscribe((val) => {
  mapPre.textContent = JSON.stringify(val, null, 2);
});

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    console.log("This page was restored from the bfcache.");
  } else {
    console.log("This page was loaded normally.");
  }
});
