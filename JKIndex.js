function definer(target, name, desc) {
    var ret = {configurable: true, enumerable: false, get: undefined, set: undefined, value: undefined, writable: true};
    
    function test(rx, remove = true) {
        var ret = rx.test(flags);
        if (ret && remove) flags = flags.replaceAll(rx, "");
        return ret;
    }
    
    ret.configurable = !test(/c/gi);
    ret.enumerable = test(/e/gi);
    
    if (test(/a/gi) || test(/gs/gi, false)) {
        let [g, s] = ["g", "s"].map(u => flags.search(RegExp(u, "gi")));
        
        if (g == -1) {
            ret.get = undefined;
            ret.set = s == -1 ? undefined : specs[0];
        } else if (s == -1) {
            ret.get = specs[0];
            ret.set = undefined;
        } else {
            [ret.get, ret.set] = (g < s ? [0, 1] : [1, 0]).map(u => specs[u]);
        }
    }
}