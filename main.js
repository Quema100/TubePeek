const injectScript = (file) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(file);
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
};

window.onload = () => {
    injectScript('watch.js');
};