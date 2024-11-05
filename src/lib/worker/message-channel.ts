// Declare self as a ServiceWorkerGlobalScope with an additional tunnelPort for handling messages
declare let self: ServiceWorkerGlobalScope & { tunnelPort: MessagePort | null };

// Dictionary to store message listeners by unique keys
const tunnelListeners: Record<string, (e: MessageEvent) => void> = {};

/**
 * Function to set up or retrieve a persistent message channel with a content script.
 * @param onMessageHandler Optional function to handle incoming messages to the service worker.
 * @returns An object with methods to post messages and manage listeners.
 */
export const useMessageChannel = <T>(
  onMessageHandler?: typeof self.onmessage,
) => {
  if (!self.tunnelPort) {
    console.log("Creating new message channel (message-channel.ts, worker)");

    // Initialize the primary message handler for establishing the tunnel port
    self.onmessage = (connEstablishedEvt) => {
      if (connEstablishedEvt.data === "port") {
        self.tunnelPort = connEstablishedEvt.ports[0]; // Assign received port to tunnelPort

        // Define what happens when a message is received through the tunnel
        self.tunnelPort.onmessage = (messageEvent) => {
          console.log("onMessage (message-channel)", messageEvent, 'listeners', tunnelListeners);
          // Notify all registered listeners with the received message
          const listenerCallbacks = Object.values(tunnelListeners);
          listenerCallbacks.forEach((cb) => cb?.(messageEvent));
        };

        // Handle unexpected errors in message transmission
        self.tunnelPort.onmessageerror = () => {
          console.error("Tunnel port encountered an error");
          self.tunnelPort = null; // Reset tunnelPort to allow reinitialization
        };

        // Send an acknowledgment message back to the content script after establishing the port
        self.tunnelPort.postMessage(null);
      }

      // Optionally, handle messages in the service worker if a handler is provided
      if (typeof onMessageHandler === "function") {
        onMessageHandler.call(self, connEstablishedEvt);
      }
    };
  }

  return {
    /**
     * Function to send a message through the tunnel port to the content script.
     * @param message The message payload to send.
     */
    postMessage: (message: T) => {
      if (self.tunnelPort) {
        self.tunnelPort.postMessage(message);
      } else {
        console.error("Tunnel port is not connected");
      }
    },
    /**
     * Adds a listener to handle messages received through the tunnel.
     * @param listener The function to call when a message is received.
     * @returns A unique key for the listener, allowing it to be removed later.
     */
    addListener: (listener: (e: MessageEvent<T>) => void) => {
      const listenerSecret = Math.random().toString(36); // Generate a unique key for the listener
      tunnelListeners[listenerSecret] = listener;
      return listenerSecret;
    },
    /**
     * Removes a previously added listener using its unique key.
     * @param listenerSecret The unique key associated with the listener.
     */
    removeListener: (listenerSecret: string) => {
      delete tunnelListeners[listenerSecret];
    },
  };
};
