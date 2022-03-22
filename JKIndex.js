function definer(target, name, desc) {
    try {
        let ret = {configurable: true, enumerable: false, get: undefined, set: undefined, value: undefined, writable: true};
        
        if (name in target) throw Error(`${target}.${name} already exists.`);
        
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

var define = definer;
var defineOn = function(target) {define = definer.bind(null, target);};

defineOn(globalThis);

define("Logic", {value: {
    t(...x) {return x.reduce((acc, u) => acc + !!u, 0);}, f(...x) {return x.reduce((acc, u) => acc + !u, 0);},
    
    all(...x) {return this.t(...x) == x.length;}, notall(...x) {return !this.all(...x);},
    
    any(...x) {return this.t(...x) >= 1;}, notany(...x) {return !this.any(...x);},
    
    atl(n, ...x) {
        if (n >= 0) return this.t(...x) >= n;
        return this.f(...x) >= -n;
    }, less(n, ...x) {return !this.atl(n, ...x);},
    
    atm(n, ...x) {
        if (n >= 0) return this.t(...x) <= n;
        return this.f(...x) <= -n;
    }, more(n, ...x) {return !this.atm(n, ...x);},
    
    num(n, ...x) {
        if (n >= 0) return this.t(...x) == n;
        return this.f(...x) == -n;
    }, notnum(n, ...x) {return !this.num(n, ...x);},
    
    one(...x) {return this.num(1, ...x);}, notone(...x) {return !this.one(...x);}
}});