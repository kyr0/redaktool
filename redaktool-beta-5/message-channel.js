// one-time postMessage to the service worker
// this callback is executed once; the MessageChannel object
// passed down from the content script is passed to the service worker
// to establish a DIRECT two-way communication channel between the content script and the service worker
window.onmessage = e => {
  if (e.data === new URLSearchParams(location.search).get('secret')) {
    // and that's why we free the event listener instantly
    window.onmessage = null;
    // once the self.onmessage event listener is set up in the service worker
    // we pass it the MessagePort object from the content script
    navigator.serviceWorker.ready.then(swr => {
      swr.active.postMessage('port', [e.ports[0]]);
    });
  }
};