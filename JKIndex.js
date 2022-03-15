if (true) {
    function def(request) {
        var ret = {};
        var tests = (function*() {
            for (let i of "ce") yield RegExp(i, "i");
        })();
        
        configurable: true, enumerable: false, writable: true, value; undefined, get: undefined, set: undefined
    };
    
    function desc(flags, ...vals) {
        var ret = {configurable: !/c/i.test(flags), enumerable: /e/i.test(flags)};
        
        if (/^[cegrsvwx]+$/i.test(flags)) {
            
        }
    }
}