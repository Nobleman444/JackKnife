if (true) {
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
    
    Object.defineProperties(Object.setPrototypeOf(JKError.prototype, Error.prototype), {
        message: {configurable: true, enumerable: false, writable: true, value: ""},
        name: {configurable: true, enumerable: false, writable: true, value: "JKError"}
    });
    
    const define = new Proxy(Object.assign(function (target, name, desc) {
        const tarObj = target.reduce((acc, u) => acc[u], globalThis);
        
        try {
            const ret = {configurable: true, enumerable: false, get: undefined, set: undefined, value: undefined, writable: true};
            
            if (name in tarObj) throw JKError([...target, name].join(".") + " already exists");
            
            if (typeof desc != "object" || !desc) desc = {value: desc};
            
            if ("value" in desc && desc.value && Object.getPrototypeOf(desc.value) == Object.prototype) {
                Object.keys(desc.value).forEach(u => {Object.defineProperty(desc.value, u, {enumerable: false});});
            }
            
            Object.assign(ret, desc);
            
            if ("value" in desc) {
                delete ret.get;
                delete ret.set;
            } else {
                delete ret.value;
                delete ret.writable;
                ret.set ??= function(x) {Object.defineProperty(tarObj, name, {value: x});};
            }
            
            Object.defineProperty(tarObj, name, ret);
        } catch (err) {
            console.error(JKError("Failed to define " + [...target, name].join("."), err));
        } finally {
            return tarObj;
        }
    }, {on: []}), {
        apply(tar, thi, arg) {return Reflect.apply(tar, null, [tar.on, ...arg]);},
        construct(tar, arg) {return Reflect.apply(tar, null, arg);}
    });
    
    const prox = {
        Object: {
            
        },
        Reflect: {
            app: "apply", con: "construct", def: "defineProperty", del: "deleteProperty", key: "ownKeys", gpd: "getOwnPropertyDescriptor",
            iex: "isExtensible", pex: "preventExtensions", gpo: "getPrototypeOf", spo: "setPrototypeOf"
        },
        Symbol: {
            ai: "asyncIterator", hi: "hasInstance", i: "iterator", ics: "isConcatSpreadable", m: "match", ma: "matchAll", r: "replace", sc: "species",
            sl: "split", sr: "search", tp: "toPrimitive", tst: "toStringTag", u: "unscopables"
        }
    };
    
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~globalThis
    [].forEach.call("unItf", u => {define("$" + u, {u: undefined, n: NaN, I: Infinity, t: true, f: false}[u]);});
    
    define("$A", {value: new Proxy(Array, {apply(tar, thi, arg) {return tar.isArray(arg[0]);}})});
    
    define("$doc", {value: document});
    
    define("$O", Object);
    
    define("$P", function(target, handler = {}, nothing = []) {return new Proxy(target, new function() {
        var ret = Object.fromEntries(Object.getOwnPropertyNames(Reflect).map(u => [u, Reflect[u]]));
    });});
    
    define("$R", {value: new Proxy(prox.Reflect, {
        has(tar, nam) {return [tar, Reflect].some(u => Reflect.has(u, nam));}
    })});
    
    define("$Y", {value: new Proxy(Symbol, {
        get(tar, nam) {
            if (Reflect.has(tar, nam)) return Reflect.get(tar, nam);
            return Reflect.apply(typeof nam == "string" ? tar.for : typeof nam == "symbol" ? tar.keyFor : tar, $u, [nam]);
        }
    })});
    
    define("Logic", {value: Reflect.construct(function() {
        var d = f => ({configurable: true, enumerable: false, writable: true, value: f});
        
        Object.defineProperties(this, {
            t: d(function (...x) {return x.reduce((acc, u) => acc + !!u, 0);}),
            f: d(function (...x) {return x.reduce((acc, u) => acc + !u, 0);}),
            all: d(function (...x) {return this.t(...x) == x.length;}),
            any: d(function (...x) {return this.t(...x) >= 1;}),
            atl: d(function (n, ...x) {return n >= 0 ? this.t(...x) >= n : this.f(...x) >= -n;}),
            atm: d(function (n, ...x) {return n >= 0 ? this.t(...x) <= n : this.f(...x) <= -n;}),
            num: d(function (n, ...x) {return n >= 0 ? this.t(...x) == n : this.f(...x) == -n;}),
            one: d(function (...x) {return this.num(1, ...x);}),
            [Symbol.toStringTag]: Object.assign(d("Logic"), {writable: false})
        });
    }, [], Object)});
    
    define("ifFinite", function(x) {return isFinite(x) ? +x : x;});
    
    define("isInteger", function(x) {return Number.isInteger(+x);});
    
    define("toFinite", function(...x) {for (let i of x) if (isFinite(i)) return +i;});
    
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Array
    define.on = ["Array"];
    
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
            case 1:
                for (let i = start; (stop - start) * (stop - i) > 0; i += step) {
                    if (string && (i >= 0 && i < 0xd800 || i >= 0xe000 && i <= 0x10ffff)) ret.push(String.fromCodePoint(i));
                    else if (!string) ret.push(i);
                };
            default: return ret;
        }
    });
    
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Array.prototype
    define.on = ["Array", "prototype"];
    
    define("cluster", function(length = 1) {
        var ret = this.slice(0), n = Math.max(Math.round(+length), 1);
        if (n == n) for (let i = 0; i < ret.length; i++) ret.spliceIn(i, n);
        return ret;
    });
    
    define("flatten", function() {
        var ret = this.slice(0);
        for (let i = 0; i < ret.length; ) {
            if ($A(ret[i])) ret.splice(i, 1, ...ret[i]);
            else i++;
        }
        return ret;
    });
    
    define("last", {get() {return this[this.length - 1];}, set(x) {this[this.length - 1] = x;}});
    
    define("li", {get() {return this.length - 1;}, set(x) {this.length = x + 1;}});
    
    define("pluck", function(index) {return this.splice(index, 1)[0];});
    
    define("spliceIn", function(start, length) {return this.splice(start, length, this.slice(start, start + length));});
    
    define("subarr", function(start, length) {return this.slice(start, start + length);});
    
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Date
    define.on = ["Date"];
    
    ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].forEach((u, i) => {
        define(u, {configurable: false, enumerable: true, writable: false, value: i});
    });
    
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Date.prototype
    define.on = ["Date", "prototype"];
    
    define("date", {get() {return this.getDate;}, set(x) {this.setDate(x);}});
    
    define("day", {get() {return this.getDay;}, set(x) {
        
    }});
    
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Math
    define.on = ["Math"];
    
    define("mround", function(n, multiple = 10, direction) {
        var ret = n / multiple;
        switch (Math.sign(direction)) {
            case 1: ret = Math.ceil(ret); break;
            case -1: ret = Math.floor(ret); break;
            case 0: ret = Math.trunc(ret); break;
            default: ret = Math.round(ret);
        }
        return ret * multiple;
    });
    
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Number.prototype
    define.on = ["Number", "prototype"];
    
    define("toChar", function() {
        var val = Math.round(this.valueOf());
        
        if (val >= 0 && val < 0xd800 || val > 0xdfff && val <= 0xffff) return String.fromCharCode(val);
        if (val > 0xffff && val <= 0x10ffff) return String.fromCodePoint(val);
        return "";
    });
    
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~String
    define.on = ["String"];
    
    define("lev", function(a, b) {
        [a, b] = [a, b].map(u => String(u));
        
        if (!a.length) return b.length;
        if (!b.length) return a.length;
        if (a.charAt() == b.charAt()) return String.lev(a.slice(1), b.slice(1));
        return Math.min(...[[a.slice(1), b], [a, b.slice(1)], [a.slice(1), b.slice(1)]].map(u => String.lev(...u))) + 1;
    });
    
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~String.prototype
    define.on = ["String", "prototype"];
    
    define("cluster", function(length = 1) {
        var ret = [], n = Math.max(Math.round(+length), 1);
        
        if (n != n || this.length == 0) ret.push("");
        else for (let i = 0; i < this.length; i += n) ret.push(this.slice(i, i + n));
        
        return ret;
    });
    
    define("test", function(rx) {return rx.test(this.valueOf());});
    
    define("toCharCode", function() {return this.split("").map(u => u.charCodeAt());});
    
    define("toCodePoint", function() {return this.split("").map(u => u.codePointAt());});
    
    define("toFloat", function() {return parseFloat(this.valueOf());});
    
    define("toInt", function(n) {return parseInt(this.valueOf(), n);});
}