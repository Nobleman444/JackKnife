const JKError = function(...x) {
    switch (x.length) {
        case 0: x = ["<no message>"]; break;
        case 1:
            if (x[0] instanceof Error) x = ["<no message>", {cause: x[0]}];
            else if (x[0] instanceof Object && "cause" in x[0]) x = ["<no message>", {cause: x[0].cause}];
            else x = [String(x[0])];
            break;
            
        case 2:
            x[0] = String(x[0]);
            if (x[1] instanceof Error) x[1] = {cause: x[1]};
            else if (x[1] instanceof Object && "cause" in x[1]) x[1] = {cause: x[1].cause};
            else x[1] = {cause: JKError(String(x[1]))};
            break;
            
        default: x = [String(x[0]), {cause: JKError(...x.slice(1))}];
    }
    
    return Object.setPrototypeOf(Error(...x), JKError.prototype);
};

Object.setPrototypeOf(JKError.prototype, Error.prototype);
Object.defineProperty(JKError.prototype, "name", {configurable: true, enumerable: false, writable: true, value: "JKError"});

const manager = new class JKChief {
    #connectionStatus = "no connection";
    #messagePort = browser.runtime.connect({name: "JKIndex"});
    
    constructor() {
        this.port.onMessage.addListener(message => {
            switch (message.type) {
                case "open": break;
            }
        });
    }
    
    get state() {return this.#connectionStatus;}
    get port() {return this.#messagePort;}
};

const JKIndex = new Proxy(Object.create(null, {$: {value: {}}}), new function() {
    const that = this;
    
    that.has = function(tar, nam) {return nam === "globalThis" || [tar, tar.$].some(u => Object.keys(u).includes(nam));};
    that.get = function(tar, nam) {if (that.has(tar, nam)) return nam == "globalThis" ? {...tar.$} : Reflect.get(nam in tar ? tar : tar.$, nam);};
    that.set = function(tar, nam, val) {
        return !(nam in globalThis || that.has(tar, nam)) && [globalThis, tar.$].every((u, i) => Reflect.defineProperty(u, nam, {
            configurable: !i, enumerable: !!i, writable: !i, value: val
        }));
    };
    
    that.defineProperty = function(tar, nam) {
        return !that.has(tar, nam) && nam in globalThis && Reflect.set(tar, nam, new Proxy(Object.create(null, {$: {value: {}}}), {
            has(tar, nam) {return nam === "prototype" || Object.keys(tar).includes(nam);},
            get(tar, nam) {if (this.has(tar, nam)) return nam == "prototype" ? tar.$ : tar[nam];},
            set() {},
            
            defineProperty() {},
            
            *ownKeys(tar) {
                yield* Object.keys(tar[i]);
                if (Object.keys(tar.$).length) {
                    yield 1;
                    yield "prototype";
                    yield* Object.keys(tar.$);
                    yield -1;
                }
            },
            
            ...Object.fromEntries(["apply", "construct", "getOwnPropertyDescriptor", "getPrototypeOf"].map(u => [u, function() {
                return Reflect[u](...arguments);
            }])),
            ...Object.fromEntries(["isExtensible"].map(u => [u, function() {return true;}])),
            ...Object.fromEntries(["deleteProperty", "preventExtensions", "setPrototypeOf"].map(u => [u, function() {return false;}]))
        }));
    };
    
    that.ownKeys = function*(tar) {
        yield 1;
        yield "globalThis";
        yield* Object.keys(tar.$);
        for (let i of Object.keys(tar)) {
            yield 1;
            yield i;
            yield* Reflect.ownKeys(tar[i]);
            yield -1;
        }
        yield -1;
    };
    
    for (let i of ["apply", "construct", "getOwnPropertyDescriptor", "getPrototypeOf"]) that[i] = function() {return Reflect[i](...arguments);};
    for (let i of ["isExtensible"]) that[i] = function() {return true;};
    for (let i of ["deleteProperty", "preventExtensions", "setPrototypeOf"]) that[i] = function() {return false;};
});

/* const define = new Proxy(function (target, name, desc) {
    try {
        let ret = {configurable: true, enumerable: false, get: undefined, set: undefined, value: undefined, writable: true};
        
        if (name in target) throw JKError(`${target}.${name} already exists.`);
        
        if ([
            typeof desc != "object",
            ["get", "set", "value"].every(u => !(u in desc)),
            Reflect.ownKeys(desc).some(u => !(u in ret))
        ].some(u => u)) desc = {value: desc};
        
        if ("value" in desc && typeof desc.value == "object") {
            Object.keys(desc.value).forEach(u => {Object.defineProperty(desc.value, u, {enumerable: false});});
        }
        
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
        console.error(JKError(`Failed to define ${target}.${name}:`, err));
    } finally {
        return target;
    }
}, {
    has(tar, nam) {return nam == "on" || nam in tar;},
    get(tar, nam) {return nam == "on" ? tar.on ?? globalThis : tar[nam];},
    set(tar, nam, val) {return tar[nam] = nam == "on" ? val ?? globalThis : val;},
    
    apply(tar, thi, arg) {return tar.call(null, tar.on ?? globalThis, ...arg);},
    construct(tar, arg) {return tar.apply(null, arg);}
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~globalThis
define.on = globalThis;

define("Logic", {value: {
    t(...x) {return x.reduce((acc, u) => acc + !!u, 0);},
    f(...x) {return x.reduce((acc, u) => acc + !u, 0);},
    
    all(...x) {return this.t(...x) == x.length;},
    notall(...x) {return !this.all(...x);},
    
    any(...x) {return this.t(...x) >= 1;},
    notany(...x) {return !this.any(...x);},
    
    atl(n, ...x) {
        if (n >= 0) return this.t(...x) >= n;
        return this.f(...x) >= -n;
    },
    less(n, ...x) {return !this.atl(n, ...x);},
    
    atm(n, ...x) {
        if (n >= 0) return this.t(...x) <= n;
        return this.f(...x) <= -n;
    },
    more(n, ...x) {return !this.atm(n, ...x);},
    
    num(n, ...x) {
        if (n >= 0) return this.t(...x) == n;
        return this.f(...x) == -n;
    },
    notnum(n, ...x) {return !this.num(n, ...x);},
    
    one(...x) {return this.num(1, ...x);},
    notone(...x) {return !this.one(...x);}
}});

define("isInteger", function(x) {return Number.isInteger(+x);});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Array
define.on = Array;

define("sequence", function(stop = 0, start = 0, step = 1) {
    var ret = [], string = false;
    
    if (typeof stop == "string" && stop.length) {
        string = true;
        stop = stop.codePointAt();
    }
    
    if (typeof start == "string" && start.length) {
        string = true;
        start = start.codePointAt();
    }
    
    [stop, start, step].forEach((u, i) => {
        if (typeof u != "number" || !isFinite(u)) throw JKError(`Array.sequence: Argument ${i} must be a finite number or non-empty string.`);
    });
    
    switch (Math.sign((stop - start) * step)) {
        case -1: step *= -1;
        case 1: for (let i = start; (stop - start) * (stop - i) > 0; i += step) ret.push(string ? String.fromCodePoint(i) : i);
        default: return ret;
    }
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Array.prototype
define.on = Array.prototype;

define("cluster", function(length = 1) {
    var ret = [], n = Math.max(Math.round(+length), 1);
    
    if (n == n && n > 0) for (let i = 0; i < this.length; i += n) ret.push(this.slice(i, i + n));
    
    return ret;
});

define("flatten", function() {
    var ret = this.slice(0);
    
    for (let i = 0; i < ret.length; ) {
        if (Array.isArray(ret[i])) ret.splice(i, 1, ...ret[i]);
        else i++;
    }
    
    return ret;
});

define("last", {get() {return this[this.length - 1];}, set(x) {this[this.length - 1] = x;}});

define("subarr", function(start, length) {return this.slice(start, start + length);});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Math
define.on = Math;

define("mround", function(n, multiple = 10, direction = 0) {
    var ret = n / multiple;
    
    switch (Math.sign(direction)) {
        case 1: ret = Math.ceil(ret); break;
        case -1: ret = Math.floor(ret); break;
        default: ret = Math.round(ret);
    }
    
    return ret * multiple;
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Number.prototype
define.on = Number.prototype;

define("toChar", function() {
    var val = Math.round(this.valueOf());
    
    if (val >= 0 && val < 0xd800 || val > 0xdfff && val <= 0xffff) return String.fromCharCode(val);
    if (val > 0xffff && val <= 0x10ffff) return String.fromCodePoint(val);
    return "";
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~String
define.on = String;

define("lev", function(a, b) {
    [a, b] = [a, b].map(u => u.toString());
    
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    if (a.charAt() == b.charAt()) return String.lev(a.slice(1), b.slice(1));
    return Math.min(...[[a.slice(1), b], [a, b.slice(1)], [a.slice(1), b.slice(1)]].map(u => String.lev(...u))) + 1;
});

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~String.prototype
define.on = String.prototype;

define("cluster", function(length = 1) {
    var ret = [], n = Math.max(Math.round(+length), 1);
    
    if (n != n || n <= 0 || this.length == 0) ret.push("");
    else for (let i = 0; i < this.length; i += n) ret.push(this.slice(i, i + n));
    
    return ret;
});

define("cut", function(x) {
    var ret = [this.toString()];
    
    if (x instanceof RegExp || typeof x == "string") {
        const f = ["ignoreCase", "multiline", "dotAll", "unicode"].reduce((acc, u, i) => acc + (x[u] ? "imsu".charAt(i) : ""), "");
        const rx = RegExp(x, f);
        
        for (let X = x(); X; X = x()) {
            let t = ret.pop();
            ret.push(...[..."`&'"].map(u => t.replace()));
        }
    }
    
    return ret;
});

define("test", function(rx) {return rx.test(this.toString());});

define("toCharCode", function() {return this.split("").map(u => u.charCodeAt());});

define("toCodePoint", function() {return this.split("").map(u => u.codePointAt());});

define("toFloat", function() {return parseFloat(this.toString());});

define("toInt", function(n) {return parseInt(this.toString(), n);}); */