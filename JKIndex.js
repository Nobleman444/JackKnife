Object.defineProperty(globalThis, "Definer", {
    configurable: true, enumerable: false, writable: true,
    value: new Proxy({t: globalThis, n: "Definer", get rx() {return this.n in this.t;}}, {
        has(tar, nam) {},
        get(tar, nam) {},
        set(tar, nam, val) {
            if (nam.toLowerCase() == "target") {
                switch (typeof val) {
                    case "function":
                    case "object": tar.t = val; return;
                    default:
                        if (val in tar.t)
                }
            } else if (name.toLowerCase() == "name") {
                
            }
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
