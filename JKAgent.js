(() => {
    var c = document.createElement("script");
    
    c.type = "module";
    c.src = browser.runtime.getURL("JKIndex.js");
    
    document.body.appendChild(c);
})();