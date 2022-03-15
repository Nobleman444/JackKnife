Object.defineProperty(globalThis, "Definer", {
  configurable: true, enumerable: false, writable: true,
  value: new Proxy({t: globalThis}, {
    has(tar, nam) {},
    get(tar, nam) {},
    set(tar, nam, val) {
      
    },
    
    //apply(tar, thi, arg) {},
    //construct(tar, arg) {},
    
    defineProperty(tar, nam, des) {},
    deleteProperty(tar, nam) {},
    
    ownKeys(tar) {},
    getOwnPropertyDescriptor(tar, nam) {},
    
    getPrototypeOf(tar) {},
    setPrototypeOf(tar, pro) {},
    
    isExtensible(tar) {},
    preventExtensions(tar) {}
  })
});
