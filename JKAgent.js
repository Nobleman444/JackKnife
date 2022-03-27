(() => {
    var c = document.createElement("script");
    
    Object.assign(c, {
        type: "text/javascript",
        src: browser.runtime.getURL("JKIndex.js");
    });
    
    console.log(c);
})();