// A: content script
// B: injected iframe and script
// C: background script/worker

// A (content script) cannot pass transferrables (e.g. Blobs with GB of data) to C (background script/worker) directly
// So we create a tunnel by passing a MessageChannel to B (injected iframe/script) that passes it to C (background script)
// via the navigator.serviceWorker.messageChannel API which isn't available in content scripts
// the injected iframe/script dissolves itself after the first message is received
// once the tunnel is established, A can talk to C directly using transferabbles by using the standard MessageChannel API

const tunnelListeners: Record<string, (e: MessageEvent) => void> = {};

let messageChannel: MessageChannel;

export interface MessageChannelFeatures<T> {
  postMessage: (message: T) => void;
  addListener: (listener: (e: MessageEvent<T>) => void) => string;
  removeListener: (listenerSecret: string) => void;
}
export async function useMessageChannel<T>() {
  if (!messageChannel) {
    // we need a new secret for each tunnel to become unique, non-cached
    const secret = Math.random().toString(36);
    const url = new URL(chrome.runtime.getURL("/message-channel.html"));
    // this is why we need to set use_dynamic_url in manifest.json's web_accessible_resources entry
    url.searchParams.set("secret", secret);

    const el = document.createElement("div");
    // we attach the element to the shadow DOM to prevent it from bleeding
    const root = el.attachShadow({ mode: "closed" });
    const iframe = document.createElement("iframe");
    iframe.hidden = true;
    root.appendChild(iframe);
    (document.body || document.documentElement).appendChild(el);

    // wait for the iframe to be loaded
    await new Promise((resolve, reject) => {
      iframe.onload = resolve;
      iframe.onerror = reject;
      iframe.contentWindow!.location.href = url.toString();
    });

    // once the iframe is loaded, we send the MessageChannel object to the iframe
    // by reference (transferable); this only happens once
    messageChannel = new MessageChannel();
    iframe.contentWindow!.postMessage(secret, "*", [messageChannel.port2]);

    // we need to wait for the iframe to respond with its port
    // and assign onMessage to the port first so that addEventListener
    // would be called (new behavior in Chrome)
    await new Promise((portEstablishedCb) => {
      messageChannel.port1.onmessage = (messageEvent) => {
        const listenerCallbacks = Object.values(tunnelListeners);
        if (listenerCallbacks.length) {
          listenerCallbacks
            .filter((cb) => !!cb)
            .forEach((cb) => cb(messageEvent));
        }
      };
      // fulfill the promise after the first message (port is ready, bi-directionally)
      messageChannel.port1.addEventListener("message", portEstablishedCb, {
        once: true,
      });
    });

    // we can safely remove the injected element and it's iframe now
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  }

  // we return the port to the caller as well,
  // so the MessagePort API to listen to worker messages is exposed
  // but usually, once would simply use the onMessage callback
  return {
    postMessage: (message: T) => messageChannel.port1.postMessage(message),
    addListener: (listener: (e: MessageEvent<T>) => void) => {
      const listenerSecret = Math.random().toString(36);
      tunnelListeners[listenerSecret] = listener;
      return listenerSecret;
    },
    removeListener: (listenerSecret: string) => {
      delete tunnelListeners[listenerSecret];
    },
  } as MessageChannelFeatures<T>;
}
