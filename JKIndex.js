Object.defineProperty(globalThis, "Definer", {
  configurable: true, enumerable: false, writable: true,
  value: new Proxy({t: globalThis}, {
    has(tar, nam) {},
    get(tar, nam) {},
    set(tar, nam, val) {}
  })
});
