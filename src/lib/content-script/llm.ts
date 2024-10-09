import { useState, useEffect, useCallback } from "react";
import type { Prompt } from "./prompt-template";

export function useLlmStreaming({ name, onPayloadReceived }: { name: string, onPayloadReceived: (payload: any) => void }): 
(prompt: Prompt) => void {

  const [llmPort, setLlmPort] = useState<chrome.runtime.Port | null>(null);

  // ensure llmPort is always connected and disconnects on component rerender
  useEffect(() => {
    console.log("useLlmStreaming", name);
    setLlmPort((llmPort) => {
      if (llmPort === null) {
        llmPort = chrome.runtime.connect({ name: `${name}-llm-stream` });
      }
      return llmPort;
    });

    return () => {
      setLlmPort((llmPort) => {
        if (llmPort) {
          llmPort.disconnect();
        }
        return null;
      });
    };
  }, [name]);

  const [, setListenerRegistered] = useState<Function|null>(null);

  useEffect(() => {
    
    if (llmPort) {
      setListenerRegistered((listener) => {

        if (typeof listener === "function") {
          console.log("removing previous onPortMessageReceived listener", listener);
          llmPort.onMessage.removeListener(listener as any);
        }
        const newListener = (message: { action: string; payload: any }) => {
          switch (message.action) {
            case "prompt-response": {
              onPayloadReceived(message.payload);
              break;
            }
          }
        };
        console.log("adding new onPortMessageReceived listener", newListener);
        llmPort.onMessage.addListener(newListener);

        return newListener;
      });
    }

    return () => {
      if (llmPort) {
        setListenerRegistered((listenerRegistered) => {

          if (typeof listenerRegistered === "function") {
            console.log("removing onPortMessageReceived listener on destruct", listenerRegistered);
            llmPort.onMessage.removeListener(listenerRegistered as any);
          }
          return null;
        });
      }
    };
  }, [llmPort, onPayloadReceived]);

  const onPrompt = useCallback((prompt: Prompt) => {
    if (llmPort) {
      llmPort.postMessage({ action: "prompt", payload: prompt });
    } else {
      console.error("llmPort is not connected");
    }
  }, [llmPort]);

  return onPrompt;
}
