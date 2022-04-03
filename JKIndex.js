class JKError {
    static [Symbol.hasInstance](x) {return x instanceof Error && x.name == "JKError";}
    
    constructor(...x) {
        var ret = [...x];
        
        switch (ret.length) {
            case 0: ret = ["<no message>"]; break;
            case 1:
                if (ret[0] instanceof Error) ret = ["<no message>", {cause: ret[0]}];
                else if ("cause" in ret[0]) ret = ["<no message>", {cause: ret[0].cause}];
                else ret = [ret[0].toString()];
                break;
                
            case 2:
                ret[0] = ret[0].toString();
                if (ret[1] instanceof Error) ret[1] = {cause: ret[1]};
                else if ("cause" in ret[1]) ret[1] = {cause: ret[1].cause};
                else ret[1] = {cause: JKError(ret[1].toString())};
                break;
                
            default: ret = [ret[0].toString(), {cause: JKError(...ret.slice(1))}];
        }
        
        ret = Error(...ret);
        ret.name = "JKError";
        
        return ret;
    }
}

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

define.on = globalThis;

define("Interval", class {
    static get Z() {return Interval.Zxy(-Infinity, Infinity);}
    static get Zp() {return Interval.Zx(1);}
    static get Z0() {return Interval.Zx(0);}
    static get Zn() {return Interval.Zy(-1);}
    static get Zn0() {return Interval.Zy(0);}
    static Zx(x) {return Interval.Zxy(x, Infinity);}
    static Zy(y) {return Interval.Zxy(-Infinity, y);}
    static Zxy(x, y) {return new Interval({low: x, incL: true, high: y, incH: true, diff: 1});}
    
    static get N() {return Interval.Zp;}
    static get N0() {return Interval.Z0;}
    static Nx(x) {return Interval.Zx(x);}
    
    static get R() {return Interval.RXY(-Infinity, Infinity);}
    static get Rp() {return Interval.RX(0);}
    static get R0() {return Interval.Rx(0);}
    static get Rn() {return Interval.RY(0);}
    static get Rn0() {return Interval.Ry(0);}
    static Rx(x) {return Interval.RxY(x, Infinity);}
    static RX(x) {return Interval.RXY(x, Infinity);}
    static Ry(y) {return Interval.RXy(-Infinity, y);}
    static RY(y) {return Interval.RXY(-Infinity, y);}
    static Rxy(x, y) {return new Interval({low: x, incL: true, high: y, incH: true, diff: 0});}
    static RxY(x, y) {return new Interval({low: x, incL: true, high: y, incH: false, diff: 0});}
    static RXy(x, y) {return new Interval({low: x, incL: false, high: y, incH: true, diff: 0});}
    static RXY(x, y) {return new Interval({low: x, incL: false, high: y, incH: false, diff: 0});}
    
    static get uc() {return new Interval({low: "A", incL: true, high: "Z", incH: true, diff: 1});}
    static get lc() {return new Interval({low: "a", incL: true, high: "z", incH: true, diff: 1});}
    static get letter() {return Interval.lc.union(Interval.uc);}
    static get alphanumLC() {return Interval.lc.union(Interval.digits());}
    
    static digits(n = 10) {
        var ret = new Interval({low: "0", incL: true, high: Math.min(n - 1, 9).toString(10), incH: true, diff: 1});
        
        n -= 10;
        
        if (n > 0) ret = ret.union({});
    }
    static unicode(useChars = true) {
        return new Interval({
            low: 0, incL: true, high: 0x10ffff, incH: true, diff: 1
        }, useChars).exclude({low: 0xd800, incL: true, high: 0xdfff, incH: true, diff: 1});
    }
    static unicodeBMP(useChars = true) {
        return new Interval({
            low: 0, incL: true, high: 0xffff, incH: true, diff: 1
        }, useChars).exclude({low: 0xd800, incL: true, high: 0xdfff, incH: true, diff: 1});
    }
    
    #bound = [-Infinity, Infinity]; #inc = 3; #step = 0; #string = false; #core = 0;
    
    #o(n) {return this.isChars ? String.fromCodePoint(n) : n;}
    #i(x) {
        switch (this.isChars && typeof x) {
            case false: x = +x; return x == x ? x : undefined;
            case "string": return x.codePointAt();
            case "number":
                if (x != x) return;
                x = Math.round(x);
                if (x < 0) return 0;
                if (x >= 0xd800 && x < 0xe000) return x < 0xdc00 ? 0xd800 - 1 : 0xe000;
                if (x > 0x10ffff) return 0x10ffff;
                return x;
        }
    }
    
    constructor(spec, useChars) {
        if (Array.isArray(spec)) {
            this.isChars = useChars ?? spec.some(u => typeof u == "string");
            
            spec = spec.map(this.#i);
            spec = spec.filter(u => u != undefined);
            spec.sort((a, b) => a > b);
            
            switch (spec.length) {
                case 2: this.#bound[1] = spec[1];
                case 1: this.#bound[0] = spec[0];
                case 0: this.#step = 1; break;
                
                default:
                    this.#step = spec[1] - spec[0];
                    this.#bound = [...spec];
            }
        }
        
        if (spec instanceof Interval) {
            this.spec = spec.spec;
            this.isChars = spec.isChars;
        } else if (typeof spec == "string") {
            let rx = ["^([nruz])", String.raw`([\[\]\(\)])`, String.raw`(-?infinity|[\+-]?(?:\d*\.)?\d+)`, ","];
            rx.push(String.raw`(+?infinity|[\+-]?(?:\d*\.)?\d+)`, rx[1]);
            rx = RegExp(rx.join(""), "i");
            
            spec = spec.replaceAll(/\s/g, "").toLowerCase();
        } else {
            this.spec = spec;
        }
        
        if (useChars != undefined) this.isChars = useChars;
    }
    
    get spec() {
        var [low, high] = this.#bound;
        var [incL, incH] = this.#inc.toString(2).padStart(2, 0).split("");
        var diff = this.#step;
        
        return {low, incL, high, incH, diff};
    }
    set spec({low, incL, high, incH, diff}) {
        var err = (a, b) => JKError(`Interval constructor: ${a} must be ${b}.`);
        var err1 = (a, b) => err(`Property "${a}" of argument 0`, b);
        var err2 = a => err1(a, "a number or non-empty string");
        
        if (typeof arguments[0] != "object") throw err("Argument 0", "an object");
        
        if (low != undefined) {
            if (typeof low == "string") this.#string = true;
        }
        if (low != undefined && typeof low == "string") {
            this.#string = true;
            low = this.#i(low);
        }
        if (typeof low != "number" || low != low) throw err2("low");
        
        if (typeof high == "string") {
            this.#string = true;
            high = this.#i(high);
        }
        if (typeof high != "number" || high != high) throw err2("high");
        
        if (low > high) throw err1("low", 'less than or equal to "high"');
        if (low == Infinity) throw err1("low", "less than Infinity");
        if (high == -Infinity) throw err1("high", "greater than -Infinity");
        
        this.#string ||= !!useChars;
        
        if (isFinite(diff)) {
            if (this.#string) diff = Math.max(Math.round(diff), 1);
            else diff = Math.abs(+diff);
        } else throw err1("diff", "a finite number");
        
        this.#bound = [low, high];
        this.#inc = incL + 2 * incH;
        this.#step = diff;
    }
    
    get isChars() {return this.#string;}
    set isChars(b) {this.#string = !!b;}
    
    get hasMin() {return isFinite(this.#bound[0]) && !!(this.#inc & 1);}
    set hasMin(b) {
        if (b) this.#inc |= 1;
        else this.#inc &= ~1;
    }
    
    get glb() {return this.#o(this.#bound[0]);}
    set glb(x) {
        x = this.#i(x);
        if (x != x) return;
        if (this.#string ) 
        this.#bound.shift();
        this.#bound.splice(+(x > this.#bound[0]), 0, x);
    }
    
    get min() {return this.#o(this.#bound[0]);}
    set min(x) {
        if (x != x) return;
        
        x = Math.min(x, this.max);
    }
    
    get hasMax() {return isFinite(this.#bound[1]) && !!(this.#inc & 2);}
    set hasMax(b) {
        if (b) this.#inc |= 2;
        else this.#inc &= ~2;
    }
    
    get max() {return this.#o(this.#bound[1] - (this.hasMax ? 0 : this.#step));}
    set max(x) {
        x = this.#i(x);
        if (x != x) return;
        x += this.hasMax ? 0 : this.#step;
        this.#bound.pop();
        this.#bound.splice(+(x < this.#bound[0]), 0, x);
    }
    
    get isClosed() {return this.#inc == 3;}
    get isOpen() {return this.#inc == 0;}
    get isEmpty() {return this.#bound[0] == this.#bound[1] && !this.isClosed || this.max - this.min < this.#step;}
    
    get interior() {}
    get closure() {}
    get upper() {}
    get lower() {}
    get boundary() {return [...this.#bound];}
    
    get gap() {return this.#step;}
    get isContinuous() {return this.#step == 0;}
    
    close() {this.#inc = 3; return this.isClosed;}
    open() {this.#inc = 0; return this.isOpen;}
    
    includes(x) {
        var ret = false;
    }
    
    *[Symbol.iterator]() {
        if (!this.#step || this.isEmpty) return;
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

define.on = String;

define("lev", function(a, b) {
    [a, b] = [a, b].map(u => u.toString());
    
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    if (a.charAt() == b.charAt()) return String.lev(a.slice(1), b.slice(1));
    return Math.min(...[[a.slice(1), b], [a, b.slice(1)], [a.slice(1), b.slice(1)]].map(u => String.lev(...u))) + 1;
});

define.on = String.prototype;

define("cluster", function(n = 1) {
    var ret = [];
    
    n = Math.abs(Math.round(+n));
    
    if (n != n || n == 0) ret.push("");
    else for (let i = 0; i < this.length; i += n) ret.push(this.slice(i, i + n));
    
    return ret;
});

define("cut", function(rx) {
    var ret = [], breaks = [0], ex = rx.exec(this.toString());
    new define(breaks, "last", {get() {return this.slice(-1)[0];}});
    
    if (ex?.index > breaks.last) breaks.push(ex.index);
    if (ex?.lastIndex > breaks.last) breaks.push(ex.lastIndex);
    if (breaks.last < this.length) breaks.push(this.length);
    
    while (breaks.length > 1) ret.push(this.slice(breaks.shift(), breaks[0]));
    
    return ret;
});

define("head", function(n = -1) {return this.slice(0, n);});

define("splice", function(...x) {
    var ret = this.split("");
    ret.splice(...x);
    return ret.join("");
});

define("tail", function(n = 1) {return this.slice(n);});

define("toCharCode", function() {return [...this.toString()].map(u => u.charCodeAt());});

define("toCodePoint", function() {return [...this.toString()].map(u => u.codePointAt());});

define("toFloat", function() {return parseFloat(this.toString());});

define("toInt", function(n) {return parseInt(this.toString(), n);});