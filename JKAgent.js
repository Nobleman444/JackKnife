try {
    new MutationObserver((mutList, mutObs) => {
        mutList.forEach(u => {
            u.addedNodes.forEach(v => {
                if (v instanceof HTMLHeadElement) {
                    v.appendChild(Object.assign(document.createElement("script"), {
                        type: "text/javascript",
                        src: browser.runtime.getURL("JKIndex.js")
                    }));
                    
                    mutObs.disconnect();
                }
            });
        });
    }).observe(document.documentElement, {childList: true});
} catch (err) {
    console.error(err);
}