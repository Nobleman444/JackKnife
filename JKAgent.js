(() => {
    var c = document.createElement("script");
    
    c.type = "text/javascript" && "module";
    c.src = browser.runtime.getURL("JKIndex.js");
    
    document.body.appendChild(c);
})();