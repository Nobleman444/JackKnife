const JKError = function(...x) {
    var ret = Error(...x);
    ret.name = "JKError";
    return ret;
};

const define = new Proxy(function (target, name, desc) {
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
        console.error(JKError(`Failed to define ${target}.${name}:`, {cause: err}));
    } finally {
        return target;
    }
}, {
    has(tar, nam) {return nam == "on" || nam in tar;},
    get(tar, nam) {return nam == "on" ? tar.on ?? globalThis : tar[nam];},
    set(tar, nam, val) {return tar[nam] = nam == "on" ? val ?? globalThis : val;},
    
    apply(tar, thi, arg) {return tar.call(null, tar.on ?? globalThis, ...arg);},
    construct(tar, arg) {return tar.bind(null, ...arg);}
});

define.on = globalThis;

define("Interval", class {
    static {
        get integers() {return new Interval({low: -Infinity, high: Infinity, diff: 1});}
        get naturals() {return new Interval({low: 1, incL: true, high: Infinity, diff: 1});}
        get reals() {return new Interval({low: -Infinity, high: Infinity, diff: 0});}
        get positive() {return new Interval({low: 0, incL: false, high: Infinity, diff: 0});}
        get negative() {return new Interval({low: -Infinity, high: 0, incH: false, diff: 0});}
        
        get lowerCase() {return new Interval({low: "a", incL: true, high: "z", incH: true, diff: 1});}
        get upperCase() {return new Interval({low: "A", incL: true, high: "Z", incH: true, diff: 1});}
        
        digits(n = 10) {return new Interval({low: "0", incL: true, high: (n - 1).toString(n), incH: true, diff: 1});}
        unicode(useChars = true) {
            if (useChars) {
                new Interval({low: 0, incL: true, high: 0x10ffff, incH: true, diff: 1}, true).exclude;
            }
            return new Interval({
                low: 0, incL: true, high: 0x10ffff, incH: true, diff: 1
            }, useChars).exclude({low: 0xd800, incL: true, high: 0xdfff, incH: true, diff: 1});
        }
    }
    
    #glb = 0; #lub = 1; #inc = 1; #step = 0; #string = false;
    
    constructor({low = 0, incL = true, high = 1, incH = false, diff = 0}, useChars = false) {
        var err = (a, b) => JKError(`Interval constructor: ${a} must be ${b}.`);
        var err1 = (a, b) => err(`Property ${a} of argument 0`, b);
        var err2 = a => err1(a, "a number or non-empty string");
        
        if (typeof arguments[0] != "object") throw err("Argument 0", "an object");
        
        if (typeof low == "string") {
            useChars = true;
            low = low.codePointAt();
        }
        if (typeof low != "number" || low != low) throw err2("low");
        
        if (typeof high == "string") {
            useChars = true;
            high = high.codePointAt();
        }
        if (typeof high != "number" || high != high) throw err2("high");
        
        if (low > high) throw err1("low", 'less than or equal to "high"');
        if (low == Infinity) throw err1("low", "less than Infinity");
        if (high == -Infinity) throw err1("high", "greater than -Infinity");
        
        if (isFinite(diff)) {
            diff = Math.abs(+diff);
            
        } else throw err1("diff", "a finite number");
        
        this.#string = useChars;
        
        
    }
    
    get hasMin() {return isFinite(this.#glb) && !!(this.#inc & 1);}
    set hasMin(b) {
        if (b) this.#inc |= 1;
        else this.#inc &= ~1;
    }
    
    get hasMax() {return isFinite(this.#lub) && !!(this.#inc & 2);}
    set hasMax(b) {
        if (b) this.#inc |= 2;
        else this.#inc &= ~2;
    }
    
    get isClosed() {return this.hasMin && this.hasMax;}
    get isOpen() {return !this.hasMin && !this.hasMax;}
    
    get boundary() {return [this.#glb, this.#lub].map(u => isFinite(u) ? u : undefined);}
    
    close() {this.hasMin = this.hasMax = true; return this.isClosed;}
    open() {this.hasMin = this.hasMax = false; return this.isOpen;}
    
    includes(n) {
        var ret = false;
    }
    
    *[Symbol.iterator]() {
        if (!this.#step) return;
    }
});

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

define.on = Number.prototype;

define("toChar", function() {
    var val = Math.round(this.valueOf());
    
    if (val >= 0 && val < 0xd800 || val > 0xdfff && val <= 0xffff) return String.fromCharCode(val);
    if (val > 0xffff && val <= 0x10ffff) return String.fromCodePoint(val);
    return "";
});

define.on = String.prototype;

define("toCharCode", function() {return [...this.toString()].map(u => u.charCodeAt());});

define("toCodePoint", function() {return [...this.toString()].map(u => u.codePointAt());});

define("toFloat", function() {return parseFloat(this.toString());});

define("toInt", function(n) {return parseInt(this.toString(), n);});