class Entry {
    constructor() {}
}

const registry = {
    JKIndex: [],
    JKBlock: {},
    JKExtra: {},
    JKSuite: {}
};

browser.runtime.onConnect.addListener(port => {
    var reg = port.name.match(/\w+/g);
    
    if (reg === "JKIndex") {
        
    } else {
        
    }
});