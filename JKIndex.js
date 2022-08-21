if (!("JKINDEX" in globalThis)) {
    Object.defineProperty(globalThis, "JKINDEX", {configurable: true, enumerable: false, writable: false});
    
    try {
        const JKError = Object.setPrototypeOf(function JKError(...x) {
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
            
            return Reflect.construct(Error, x, JKError);
        }, Error);
        
        Object.defineProperties(Object.setPrototypeOf(JKError.prototype, Error.prototype), {
            message: {configurable: true, enumerable: false, writable: true, value: ""},
            name: {configurable: true, enumerable: false, writable: true, value: "JKError"}
        });
        
        const define = new Proxy(Object.assign(function (target, name, desc) {
            var tarObj = () => target.reduce((acc, u) => acc[u], globalThis);
            
            try {
                tarObj = tarObj();
            } catch (err) {
                console.error(JKError(target.join(".") + " not found", err));
                return;
            }
            
            try {
                const ret = {configurable: true, enumerable: false, get: undefined, set: undefined, value: undefined, writable: true};
                
                if (name in tarObj) throw JKError([...target, name].join(".") + " already exists");
                
                if (typeof desc != "object" || !desc) desc = {value: desc};
                
                if (typeof desc.value == "function" && !desc.value.name) Object.defineProperty(desc.value, "name", {value: name});
                
                Object.assign(ret, desc);
                
                if ("value" in desc) {
                    delete ret.get;
                    delete ret.set;
                } else {
                    delete ret.value;
                    delete ret.writable;
                    ret.set ??= function(x) {Object.defineProperty(tarObj, name, {value: x, writable: true});};
                }
                
                Object.defineProperty(tarObj, name, ret);
            } catch (err) {
                console.error(JKError("Failed to define " + [...target, name].join("."), err));
            } finally {
                return tarObj;
            }
        }, {on: [], pro() {this.on.push("prototype");}}), {
            apply(tar, thi, arg) {return Reflect.apply(tar, thi, [tar.on, ...arg]);},
            construct(tar, arg) {return Reflect.apply(tar, null, arg);}
        });
        
        const $dat = (value, {c: configurable = true, e: enumerable, w: writable = true} = {}) => ({configurable, enumerable, value, writable});
        const $acc = (get, set, {c: configurable = true, e: enumerable} = {}) => ({configurable, enumerable, get, set});
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~globalThis
        [..."unitfgdar"].forEach((u, i) => {
            define("$" + u, {value: [undefined, NaN, Infinity, true, false, globalThis, document, function() {return arguments;}, x => x][i]});
        });
        
        define("$A", {value: new Proxy(Array, {
            has(tar, nam) {return /^(?:TA|[IUC]8|[IU]16|[IUF](?:32|64))$/.test(nam) || Reflect.has(tar, nam);},
            get(tar, nam) {
                switch (nam) {
                    case "TA": return Object.getPrototypeOf(Int8Array);
                    case "I8": return Int8Array;
                    case "U8": return Uint8Array;
                    case "C8": return Uint8ClampedArray;
                    case "I16": return Int16Array;
                    case "U16": return Uint16Array;
                    case "I32": return Int32Array;
                    case "U32": return Uint32Array;
                    case "F32": return Float32Array;
                    case "I64": return BigInt64Array;
                    case "U64": return BigUint64Array;
                    case "F64": return Float64Array;
                    default: return Reflect.get(tar, nam);
                }
            },
            apply(tar, thi, arg) {return Reflect.apply(tar.isArray, thi, arg);},
            getOwnPropertyDescriptor(tar, nam) {
                return Reflect.has(tar, nam) || !this.has(tar, nam) ? Reflect.getOwnPropertyDescriptor(tar, nam) : undefined
            },
            ...Object.fromEntries(["set", "defineProperty", "deleteProperty"].map(u => function(tar, nam, ...x) {
                return (Reflect.has(tar, nam) || !this.has(tar, nam)) && Reflect[u](tar, nam, ...x);
            }))
        })});
        
        define("$O", {value: new Proxy(Object, (() => {
            const abbr = {
                ...Object.fromEntries([["", "e"], ["f", "fromE"]].map(u => ["e", "ntries"].map((v, i) => u[i] + v))),
                ...Object.fromEntries([["n", "Names"], ["s", "Symbols"]].map(u => ["g", "getOwnProperty"].map((v, i) => v + u[i]))),
                
                a: "assign", k: "keys", v: "values"
            };
            const defer = (t, tar, nam, ...x) => Reflect[t](tar, abbr.hasOwnProperty(nam) ? abbr[nam] : nam, ...x);
            
            return {
                get(...x) {return x[1] === "$" ? abbr : defer("get", ...x);},
                set(...x) {return x[1] !== "$" && defer("set", ...x);},
                ...Object.fromEntries([
                    "has", "defineProperty", "deleteProperty", "getOwnPropertyDescriptor"
                ].map(u => [u, function(...x) {return defer(u, ...x);}]))
            };
        })())});
        
        define("$P", function(...x) {return new Proxy(...x)});
        
        define("$R", {value: new Proxy(Reflect, (() => {
            const abbr = {
                app: "apply", con: "construct", def: "defineProperty", del: "deleteProperty", key: "ownKeys", gpd: "getOwnPropertyDescriptor",
                iex: "isExtensible", pex: "preventExtensions", gpo: "getPrototypeOf", spo: "setPrototypeOf"
            };
            const defer = (t, tar, nam, ...x) => Reflect[t](tar, abbr.hasOwnProperty(nam) ? abbr[nam] : nam, ...x);
            
            return {
                get(...x) {return x[1] === "$" ? abbr : defer("get", ...x);},
                set(...x) {return x[1] !== "$" && defer("set", ...x);},
                ...Object.fromEntries([
                    "has", "defineProperty", "deleteProperty", "getOwnPropertyDescriptor"
                ].map(u => [u, function(...x) {return defer(u, ...x);}]))
            };
        })())});
        
        define("$X", {value: new Proxy(RegExp, {
            apply(tar, _, arg) {
                if (Array.isArray(arg[0]) && arg[0].hasOwnProperty("raw")) {
                    let [{raw: [input, ...a]}, ...b] = arg;
                    
                    for (let i = 0; i < a.length && i < b.length; i++) input += b[i] + a[i];
                    
                    return tar(...input.match(/^\/?(.*?[^\\])(?:\/(\w*))?$/).slice(1));
                }
                
                return tar(...arg);
            },
            construct(tar, arg) {return this.apply(tar, undefined, arg);}
        })});
        
        define("$Y", {value: new Proxy(Symbol, (() => {
            const abbr = {
                ai: "asyncIterator", hi: "hasInstance", i: "iterator", ics: "isConcatSpreadable", m: "match", ma: "matchAll", r: "replace",
                sc: "species", sl: "split", sr: "search", tp: "toPrimitive", tst: "toStringTag", u: "unscopables"
            };
            const defer = (t, tar, nam, ...x) => Reflect[t](tar, abbr.hasOwnProperty(nam) ? abbr[nam] : nam, ...x);
            
            return {
                get(...x) {
                    return x[1] === "$" ? abbr : defer("has", ...x) ? defer("get", ...x) : Symbol[typeof x[1] == "string" ? "for" : "keyFor"](x[1]);
                },
                set(...x) {return x[1] !== "$" && defer("set", ...x);},
                ...Object.fromEntries([
                    "has", "defineProperty", "deleteProperty", "getOwnPropertyDescriptor"
                ].map(u => [u, function(...x) {return defer(u, ...x);}]))
            };
        })())});
        
        define("Logic", {value: Reflect.construct(function() {
            const that = this;
            var d = f => ({configurable: true, enumerable: false, value: f, writable: true});
            
            Object.defineProperties(that, {
                t: d(function(...x) {return x.reduce((acc, u) => acc + !!u, 0);}),
                f: d(function(...x) {return x.reduce((acc, u) => acc + !u, 0);}),
                
                map: d(function(...x) {return x.map(u => !!u);}),
                not: d(function(...x) {return x.map(u => !u);}),
                
                atl: d(function(n, ...x) {return that[n >= 0 ? "t" : "f"](...x) >= Math.abs(n);}),
                atm: d(function(n, ...x) {return that[n >= 0 ? "t" : "f"](...x) <= Math.abs(n);}),
                num: d(function(n, ...x) {return that[n >= 0 ? "t" : "f"](...x) == Math.abs(n);}),
                
                any: d(function(...x) {return that.atl(1, ...x);}),
                one: d(function(...x) {return that.num(1, ...x);}),
                all: d(function(...x) {return that.num(x.length, ...x);}),
                
                [Symbol.toStringTag]: {configurable: true, enumerable: false, value: "Logic", writable: false}
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
                        if (string) {
                            let I = Math.round(i);
                            if (I >= 0 && I <= 0x10ffff) ret.push(String.fromCodePoint(I));
                        } else ret.push(i);
                    };
                default: return ret;
            }
        });
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Array.prototype
        define.pro();
        
        define("cluster", function(length = 1) {
            var ret = [], n = Math.max(Math.round(+length), 1);
            if (n == n) for (let i = 0; i < this.length; i += n) ret.push(this.slice(i, i + n));
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
        
        define("last", {get() {return this[this.length - 1];}, set(x) {if (this.length) this[this.length - 1] = x;}});
        
        define("li", {get() {return this.length - 1;}, set(x) {this.length = x + 1;}});
        
        define("pluck", function(index) {return this.splice(index, 1)[0];});
        
        define("prefix", function(...arr) {return [].concat(...arr, this);});
        
        define("spliceIn", function(start, length) {return this.splice(start, length, this.slice(start, start + length));});
        
        define("subarr", function(start, length) {return this.slice(start, start + length);});
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Date
        define.on = ["Date"];
        
        ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].forEach((u, i) => {define(u, i);});
        
        ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].forEach((u, i) => {define(u, i);});
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Date.prototype
        define.pro();
        
        define("date", {get() {return this.getDate();}, set(x) {this.setDate(x);}});
        
        define("day", {get() {return this.getDay();}, set(x) {this.setDate(x - this.getDay() + this.getDate());}});
        
        define("hours", {get() {return this.getHours();}, set(x) {this.setHours(x);}});
        
        define("milliseconds", {get() {return this.getMilliseconds();}, set(x) {this.setMilliseconds(x);}});
        
        define("minutes", {get() {return this.getMinutes();}, set(x) {this.setMinutes(x);}});
        
        define("month", {get() {return this.getMonth();}, set(x) {this.setMonth(x);}});
        
        define("seconds", {get() {return this.getSeconds();}, set(x) {this.setSeconds(x);}});
        
        define("setDay", function(x) {return this.setDate(x - this.getDay() + this.getDate());});
        
        define("setUTCDay", function(x) {return this.setUTCDate(x - this.getUTCDay() + this.getUTCDate());});
        
        define("time", {get() {return this.getTime();}, set(x) {this.setTime(x);}});
        
        define("utcDate", {get() {return this.getUTCDate();}, set(x) {this.setUTCDate(x);}});
        
        define("utcDay", {get() {return this.getUTCDay();}, set(x) {this.setUTCDate(x - this.getUTCDay() + this.getUTCDate());}});
        
        define("utcHours", {get() {return this.getUTCHours();}, set(x) {this.setUTCHours(x);}});
        
        define("utcMilliseconds", {get() {return this.getUTCMilliseconds();}, set(x) {this.setUTCMilliseconds(x);}});
        
        define("utcMinutes", {get() {return this.getUTCMinutes();}, set(x) {this.setUTCMinutes(x);}});
        
        define("utcMonth", {get() {return this.getUTCMonth();}, set(x) {this.setUTCMonth(x);}});
        
        define("utcSeconds", {get() {return this.getUTCSeconds();}, set(x) {this.setUTCSeconds(x);}});
        
        define("utcYear", {get() {return this.getUTCFullYear();}, set(x) {this.setUTCFullYear(x);}});
        
        define("year", {get() {return this.getFullYear();}, set(x) {this.setFullYear(x);}});
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Document
        define.on = ["Document"];
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Document.prototype
        define.pro();
        
        define("df", {get() {return this.createDocumentFragment;}});
        
        define("elem", function(tag, attr = {}, style = {}) {
            var ret = this.createElement(tag);
            Object.assign(ret, attr);
            Object.assign(ret.style, style);
            return ret;
        });
        
        define("text", {get() {return this.createTextNode;}});
        
        ["Document", "DocumentFragment", "Element"].forEach(u => {
            new define([u, "prototype"], "qa", function(...t) {
                return t.reduce((acc, v) => acc.concat([...this.querySelectorAll(v)].filter(w => !acc.includes(w))), []);
            });
            
            new define([u, "prototype"], "qc", function(...t) {return this.querySelectorAll(t.join()).length;});
            
            new define([u, "prototype"], "qs", function(...t) {return t.map(v => this.querySelector(v)).find(v => v);});
            
            new define([u, "prototype"], "querySelectorCount", function(t) {return this.querySelectorAll(t).length;});
        });
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Math
        define.on = ["Math"];
        
        define("mround", function(n, multiple = 10, direction) {
            return Math[["floor", "trunc", "ceil"][Math.sign(direction) + 1] ?? "round"](n / multiple) * multiple;
        });
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Number
        define.on = ["Number"];
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Number.prototype
        define.pro();
        
        define("toChar", function() {
            var val = Math.round(this.valueOf());
            
            if (val >= 0 && val <= 0x10ffff) return String.fromCodePoint(val);
            return "";
        });
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Object
        define.on = ["Object"];
        
        define("construct", function(f, ...x) {return Reflect.construct(f, x, Object);});
        
        define($O.$.gde = "getOwnDescriptorEntries", function(o) {return Object.entries(Object.getOwnPropertyDescriptors(o));});
        
        define($O.$.gd = "getOwnPropertyDescription", function(...x) {
            if (x.length < 2) return Object.getOwnPropertyDescriptors(...x);
            return Object.getOwnPropertyDescriptor(...x);
        });
        
        define($O.$.ge = "getOwnPropertyEntries", function(o) {
            return Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o)).map(u => [u, o[u]]);
        });
        
        define($O.$.gk = "getOwnPropertyKeys", function(o) {return Object.getOwnPropertyNames(o).concat(Object.getOwnPropertySymbols(o));});
        
        define($O.$.pro = "prototypeOf", function(...x) {
            if (x.length < 2) return Object.getPrototypeOf(...x);
            return Object.setPrototypeOf(...x);
        });
        
        define("rename", function(target, former, latter) {
            const old = Object.getOwnPropertyDescriptor(target, former);
            
            if (old?.configurable) {
                Object.defineProperty(target, latter, old);
                delete target[former];
            }
            
            return target;
        });
        
        define($O.$.dp = "setOwnPropertyDescription", function(...x) {
            if (x.length < 3) return Object.defineProperties(...x);
            return Object.defineProperty(...x);
        });
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Object.prototype
        define.pro();
        
        define("clone", function() {return Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));});
        
        define("copy", function() {
            return Object.fromEntries(Object.getOwnPropertyNames(this).concat(Object.getOwnPropertySymbols(this)).map(u => [u, this[u]]));
        });
        
        define("filter", function(callback, thisArg) {
            const ret = {};
            for (let [k, v] of this[Symbol.iterator]()) if (callback.call(thisArg, v, k, this)) ret[k] = v;
            return ret;
        });
        
        define("forEach", function(callback, thisArg) {for (let [k, v] of this[Symbol.iterator]()) callback.call(thisArg, v, k, this);});
        
        define("length", {get() {return Object.keys(this).length;}});
        
        define("map", function() {});
        
        define("includes", function(x) {return Object.values(this).includes(x);});
        
        define("size", {get() {return Object.getOwnPropertyNames(this).length;}});
        
        define(Symbol.iterator, function*() {yield* Object.entries(this);});
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Reflect
        define.on = ["Reflect"];
        
        define($R.$.bor = "borrow", function(tar, ntr, nam, arg) {return Reflect.apply(Reflect.get(ntr.prototype, nam), tar, arg);});
        
        define($R.$.gra = "grapple", function(tar, nam, arg) {return Reflect.apply(Reflect.get(tar, nam), tar, arg);});
        
        define($R.$.trk = "trek", function(tar, nam) {return nam.reduce((acc, u) => Reflect.get(acc, u), tar);});
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~String
        define.on = ["String"];
        
        define("lev", function(a, b) {
            [a, b] = [a, b].map(String);
            
            if (!a.length) return b.length;
            if (!b.length) return a.length;
            if (a.charAt() == b.charAt()) return String.lev(a.slice(1), b.slice(1));
            return Math.min(...[[a.slice(1), b], [a, b.slice(1)], [a.slice(1), b.slice(1)]].map(u => String.lev(...u))) + 1;
        });
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~String.prototype
        define.pro();
        
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
        
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Symbol
        define.on = ["Symbol"];
        
        define($Y.$.x = "external", {configurable: false, writable: false, value: $Y()});
        
        define($Y.$.jk = "jackKnife", {configurable: false, writable: false, value: $Y()});
        
        Object.defineProperty(globalThis, "JKINDEX", {value: true});
    } catch (err) {
        console.debug(err);
        Object.defineProperty(globalThis, "JKINDEX", {value: false});
    }
}