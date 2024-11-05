import { useState, useEffect, useCallback } from "react";
import type { Prompt } from "./prompt-template";

/**
 * React hook for handling streaming LLM prompts over a persistent connection with the background script.
 * @param name A unique name for the connection, identifying the port.
 * @param onPayloadReceived Callback function that processes incoming payloads.
 * @returns A function to send prompts to the background script.
 */
export function useLlmStreaming({
  name,
  onPayloadReceived,
}: {
  name: string;
  onPayloadReceived: (payload: any) => void;
}): (prompt: Prompt) => void {
  const [llmPort, setLlmPort] = useState<chrome.runtime.Port | null>(null);

  // Ensures llmPort is always connected and reconnects on component re-render or disconnect
  useEffect(() => {
    const connectPort = () => {
      console.log("Establishing new port connection:", name);
      const port = chrome.runtime.connect({ name: `${name}-llm-stream` });

      // Detect when the port is disconnected and attempt to reconnect
      port.onDisconnect.addListener(() => {
        console.log("Port disconnected, attempting to reconnect...");
        setLlmPort(null); // Reset the port state to trigger reconnection
        connectPort(); // Reconnect if disconnected
      });

      setLlmPort(port); // Set the new port
    };

    connectPort(); // Establish the initial connection

    return () => {
      // Clean up the port on component unmount
      setLlmPort((port) => {
        if (port) {
          port.disconnect();
          console.log("Port manually disconnected");
        }
        return null;
      });
    };
  }, [name]);

  // State to store the currently registered listener function for cleanup
  const [, setListenerRegistered] = useState<Function | null>(null);

  useEffect(() => {
    if (llmPort) {
      setListenerRegistered((listener) => {
        // Remove any existing listener before adding a new one
        if (typeof listener === "function") {
          console.log("Removing previous onPortMessageReceived listener", listener);
          llmPort.onMessage.removeListener(listener as any);
        }

        // Define the new listener for handling incoming messages
        const newListener = (message: { action: string; payload: any }) => {
          switch (message.action) {
            case "prompt-response": {
              onPayloadReceived(message.payload); // Pass the payload to the callback
              break;
            }
          }
        };

        console.log("Adding new onPortMessageReceived listener", newListener);
        llmPort.onMessage.addListener(newListener); // Register the new listener
        return newListener;
      });
    }

    return () => {
      // Clean up listener on component re-render or unmount
      if (llmPort) {
        setListenerRegistered((listenerRegistered) => {
          if (typeof listenerRegistered === "function") {
            console.log("Removing onPortMessageReceived listener on cleanup", listenerRegistered);
            llmPort.onMessage.removeListener(listenerRegistered as any);
          }
          return null;
        });
      }
    };
  }, [llmPort, onPayloadReceived]);

  /**
   * Function to send a prompt message through the persistent connection.
   * @param prompt The prompt to send to the background script.
   */
  const onPrompt = useCallback(
    (prompt: Prompt) => {
      if (llmPort) {
        llmPort.postMessage({ action: "prompt", payload: prompt });
      } else {
        console.error("llmPort is not connected");
      }
    },
    [llmPort]
  );

  return onPrompt;
}
