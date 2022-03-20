function definer(target, name, desc) {
    var ret = {configurable: true, enumerable: false, get: undefined, set: undefined, value: undefined, writable: true};
    
    if (typeof desc != "object" || ["get", "set", "value"].every(u => !(u in desc))) desc = {value: desc};
    
    Object.assign(ret, desc);
    
    [["get", "set"], ["value", "writable"]][+["get", "set"].some(u => u in desc)].forEach(u => {delete ret[u];});
    
    try {
        Object.defineProperty(target, name, ret);
    } catch (err) {
        let e = Error(`Failed to define ${target}.${name}:`, {cause: err});
        e.name = "JKError";
        console.error(e);
    } finally {
        return target;
    }
}

["apply", "bind", "call"].forEach(u => {definer[u] = function(...args) {return Function.prototype[u].call(definer, null, ...args);};});