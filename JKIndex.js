function definer(target, name, desc) {
    try {
        var ret = {configurable: true, enumerable: false, get: undefined, set: undefined, value: undefined, writable: true};
        
        if (typeof desc != "object" || ["get", "set", "value"].every(u => !(u in desc))) desc = {value: desc};
        
        for (let i of Object.keys(desc)) if (!(i in ret)) delete desc[i];
        
        Object.assign(ret, desc);
        
        if ("get" in desc || "set" in desc) {
            delete ret.value;
            delete ret.writable;
        } else {
            delete ret.get;
            delete ret.set;
        }
        
        Object.defineProperty(target, name, ret);
    } catch (err) {
        let e = Error(`Failed to define ${target}.${name}:`, {cause: err});
        e.name = "JKError";
        console.error(e);
    } finally {
        return target;
    }
}

definer(definer, "bind", function(...args) {return Function.prototype.bind.call(definer, null, ...args);});