declare let self: ServiceWorkerGlobalScope & { tunnelPort: MessagePort };

const tunnelListeners: Record<string, (e: MessageEvent) => void> = {};

export const useMessageChannel = <T>(
  onMessageHandler?: typeof self.onmessage,
) => {
  if (!self.tunnelPort) {
    console.log("Making new messagechannel (message-channel.ts, worker)");
    self.onmessage = (connEstablishedEvt) => {
      if (connEstablishedEvt.data === "port") {
        self.tunnelPort = connEstablishedEvt.ports[0];

        // as we use the reference to the MessagePort here
        // the callback assignment will last as long as the MessagePort
        // so we can use it to communicate with the content script
        self.tunnelPort.onmessage = (messageEvent) => {
          const listenerCallbacks = Object.values(tunnelListeners);
          if (listenerCallbacks.length) {
            listenerCallbacks
              .filter((cb) => !!cb)
              .forEach((cb) => cb(messageEvent));
          }
        };

        // initial ack/resolve, as we were receiving the port via the tunnel script
        // and it needs to be passed back to the content script, for the last step's
        // Promise to resolve
        self.tunnelPort.postMessage(null);
      }

      // in case the caller needs to handle the message event as well (optional)
      if (typeof onMessageHandler === "function") {
        return onMessageHandler.call(self, connEstablishedEvt);
      }
    };
  }

  return {
    postMessage: (message: T) => self.tunnelPort.postMessage(message),
    addListener: (listener: (e: MessageEvent<T>) => void) => {
      const listenerSecret = Math.random().toString(36);
      tunnelListeners[listenerSecret] = listener;
      return listenerSecret;
    },
    removeListener: (listenerSecret: string) => {
      delete tunnelListeners[listenerSecret];
    },
  };
};
