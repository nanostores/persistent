(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
let listenerQueue = [];
let atom = (initialValue, level) => {
  let listeners = [];
  let $atom2 = {
    get() {
      if (!$atom2.lc) {
        $atom2.listen(() => {
        })();
      }
      return $atom2.value;
    },
    l: level || 0,
    lc: 0,
    listen(listener, listenerLevel) {
      $atom2.lc = listeners.push(listener, listenerLevel || $atom2.l) / 2;
      return () => {
        let index = listeners.indexOf(listener);
        if (~index) {
          listeners.splice(index, 2);
          if (!--$atom2.lc)
            $atom2.off();
        }
      };
    },
    notify(oldValue, changedKey) {
      let runListenerQueue = !listenerQueue.length;
      for (let i = 0; i < listeners.length; i += 2) {
        listenerQueue.push(
          listeners[i],
          listeners[i + 1],
          $atom2.value,
          oldValue,
          changedKey
        );
      }
      if (runListenerQueue) {
        for (let i = 0; i < listenerQueue.length; i += 5) {
          let skip;
          for (let j = i + 1; !skip && (j += 5) < listenerQueue.length; ) {
            if (listenerQueue[j] < listenerQueue[i + 1]) {
              skip = listenerQueue.push(
                listenerQueue[i],
                listenerQueue[i + 1],
                listenerQueue[i + 2],
                listenerQueue[i + 3],
                listenerQueue[i + 4]
              );
            }
          }
          if (!skip) {
            listenerQueue[i](
              listenerQueue[i + 2],
              listenerQueue[i + 3],
              listenerQueue[i + 4]
            );
          }
        }
        listenerQueue.length = 0;
      }
    },
    /* It will be called on last listener unsubscribing.
       We will redefine it in onMount and onStop. */
    off() {
    },
    set(newValue) {
      let oldValue = $atom2.value;
      if (oldValue !== newValue) {
        $atom2.value = newValue;
        $atom2.notify(oldValue);
      }
    },
    subscribe(listener, listenerLevel) {
      let unbind = $atom2.listen(listener, listenerLevel);
      listener($atom2.value);
      return unbind;
    },
    value: initialValue
  };
  return $atom2;
};
const MOUNT = 5;
const UNMOUNT = 6;
const REVERT_MUTATION = 10;
let on = (object, listener, eventKey, mutateStore) => {
  object.events = object.events || {};
  if (!object.events[eventKey + REVERT_MUTATION]) {
    object.events[eventKey + REVERT_MUTATION] = mutateStore((eventProps) => {
      object.events[eventKey].reduceRight((event, l) => (l(event), event), {
        shared: {},
        ...eventProps
      });
    });
  }
  object.events[eventKey] = object.events[eventKey] || [];
  object.events[eventKey].push(listener);
  return () => {
    let currentListeners = object.events[eventKey];
    let index = currentListeners.indexOf(listener);
    currentListeners.splice(index, 1);
    if (!currentListeners.length) {
      delete object.events[eventKey];
      object.events[eventKey + REVERT_MUTATION]();
      delete object.events[eventKey + REVERT_MUTATION];
    }
  };
};
let STORE_UNMOUNT_DELAY = 1e3;
let onMount = ($store, initialize) => {
  let listener = (payload) => {
    let destroy = initialize(payload);
    if (destroy)
      $store.events[UNMOUNT].push(destroy);
  };
  return on($store, listener, MOUNT, (runListeners) => {
    let originListen = $store.listen;
    $store.listen = (...args) => {
      if (!$store.lc && !$store.active) {
        $store.active = true;
        runListeners();
      }
      return originListen(...args);
    };
    let originOff = $store.off;
    $store.events[UNMOUNT] = [];
    $store.off = () => {
      originOff();
      setTimeout(() => {
        if ($store.active && !$store.lc) {
          $store.active = false;
          for (let destroy of $store.events[UNMOUNT])
            destroy();
          $store.events[UNMOUNT] = [];
        }
      }, STORE_UNMOUNT_DELAY);
    };
    return () => {
      $store.listen = originListen;
      $store.off = originOff;
    };
  });
};
let map = (initial = {}) => {
  let $map2 = atom(initial);
  $map2.setKey = function(key, value) {
    let oldMap = $map2.value;
    if (typeof value === "undefined" && key in $map2.value) {
      $map2.value = { ...$map2.value };
      delete $map2.value[key];
      $map2.notify(oldMap, key);
    } else if ($map2.value[key] !== value) {
      $map2.value = {
        ...$map2.value,
        [key]: value
      };
      $map2.notify(oldMap, key);
    }
  };
  return $map2;
};
let identity = (a) => a;
let storageEngine = {};
let eventsEngine = { addEventListener() {
}, removeEventListener() {
} };
function testSupport() {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}
if (testSupport()) {
  storageEngine = localStorage;
}
let windowPersistentEvents = {
  addEventListener(key, listener, restore) {
    window.addEventListener("storage", listener);
    window.addEventListener("pageshow", restore);
  },
  removeEventListener(key, listener, restore) {
    window.removeEventListener("storage", listener);
    window.removeEventListener("pageshow", restore);
  }
};
if (typeof window !== "undefined") {
  eventsEngine = windowPersistentEvents;
}
function persistentAtom(name, initial = void 0, opts = {}) {
  let encode = opts.encode || identity;
  let decode = opts.decode || identity;
  let store = atom(initial);
  let set = store.set;
  store.set = (newValue) => {
    if (typeof newValue === "undefined") {
      delete storageEngine[name];
    } else {
      storageEngine[name] = encode(newValue);
    }
    set(newValue);
  };
  function listener(e) {
    if (e.key === name) {
      if (e.newValue === null) {
        set(void 0);
      } else {
        set(decode(e.newValue));
      }
    } else if (!storageEngine[name]) {
      set(void 0);
    }
  }
  function restore() {
    store.set(storageEngine[name] ? decode(storageEngine[name]) : initial);
  }
  onMount(store, () => {
    restore();
    if (opts.listen !== false) {
      eventsEngine.addEventListener(name, listener, restore);
      return () => {
        eventsEngine.removeEventListener(name, listener, restore);
      };
    }
  });
  return store;
}
function persistentMap(prefix, initial = {}, opts = {}) {
  let encode = opts.encode || identity;
  let decode = opts.decode || identity;
  let store = map();
  let setKey = store.setKey;
  store.setKey = (key, newValue) => {
    if (typeof newValue === "undefined") {
      if (opts.listen !== false && eventsEngine.perKey) {
        eventsEngine.removeEventListener(prefix + key, listener, restore);
      }
      delete storageEngine[prefix + key];
    } else {
      if (opts.listen !== false && eventsEngine.perKey && !(key in store.value)) {
        eventsEngine.addEventListener(prefix + key, listener, restore);
      }
      storageEngine[prefix + key] = encode(newValue);
    }
    setKey(key, newValue);
  };
  let set = store.set;
  store.set = function(newObject) {
    for (let key in newObject) {
      store.setKey(key, newObject[key]);
    }
    for (let key in store.value) {
      if (!(key in newObject)) {
        store.setKey(key);
      }
    }
  };
  function listener(e) {
    if (!e.key) {
      set({});
    } else if (e.key.startsWith(prefix)) {
      if (e.newValue === null) {
        setKey(e.key.slice(prefix.length), void 0);
      } else {
        setKey(e.key.slice(prefix.length), decode(e.newValue));
      }
    }
  }
  function restore() {
    let data = { ...initial };
    for (let key in storageEngine) {
      if (key.startsWith(prefix)) {
        data[key.slice(prefix.length)] = decode(storageEngine[key]);
      }
    }
    store.set(data);
  }
  onMount(store, () => {
    restore();
    if (opts.listen !== false) {
      eventsEngine.addEventListener(prefix, listener, restore);
      return () => {
        eventsEngine.removeEventListener(prefix, listener, restore);
        for (let key in store.value) {
          eventsEngine.removeEventListener(prefix + key, listener, restore);
        }
      };
    }
  });
  return store;
}
let $atom = persistentAtom("test", [], {
  decode: JSON.parse,
  encode: JSON.stringify
});
let $map = persistentMap("testMap", {});
let preAtom = document.querySelector("#atom");
let preMap = document.querySelector("#map");
$atom.subscribe((val) => {
  preAtom.textContent = JSON.stringify(val, null, 2);
});
$map.subscribe((val) => {
  preMap.textContent = JSON.stringify(val, null, 2);
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    console.log("The page was restored from the bfcache");
  } else {
    console.log("The page was loaded normally");
  }
});
export {
  $atom as $,
  $map as a
};
