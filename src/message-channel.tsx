import { createContext, useState, useContext, useEffect } from "react";
import { type MessageChannelFeatures, useMessageChannel } from "./lib/content-script/message-channel";
import { getNextId, type MessageChannelMessage, type MessageChannelPayload, type SupportedActions } from "./shared";

export type MessageChannelContextType = MessageChannelFeatures<MessageChannelMessage> & {
  sendCommand: <T>(action: SupportedActions, payload: MessageChannelPayload) => Promise<T>;
};

export const MessageChannelContext = createContext<MessageChannelContextType|null>(null);

export let messageChannelApi: MessageChannelContextType;

export const MessageChannelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<MessageChannelContextType>(messageChannelApi);
  const { postMessage, addListener, removeListener } = useMessageChannel<MessageChannelMessage>();

  useEffect(() => {
    if (!messageChannelApi) {

      console.log("Making new messagechannel (message-channel.tsx)");
      ;(async () => {

        async function sendCommand<T>(action: SupportedActions, payload: MessageChannelPayload): Promise<T> {

          console.log("sendCommand", action, payload);
          const taskId = getNextId(action);
          return new Promise((resolve, reject) => {
            const listener = addListener((message) => {
              const { data } = message;
            
              if (!data || !data.action || typeof data.id === "undefined" || typeof data.success === "undefined") {
                reject(`Invalid message received for action: ${action} with id: ${taskId}, data: ${JSON.stringify(data)}`);
                removeListener(listener); // a command is responded to once, stop listening immediately
                return;
              }

              if (data.success === false || data.error) {
                reject(data.error || `Error occurred for action: ${action} with id: ${taskId}`);
                removeListener(listener); // a command is responded to once, stop listening immediately
                return;
              }

              if (data.success && data.action === `${action}-result` && data.id === taskId) {
                resolve(data.payload as T);
                removeListener(listener); // a command is responded to once, stop listening immediately
                return;
              }
            });
            postMessage({
              id: taskId,
              action,
              payload,
            } as MessageChannelMessage);
          });
        }

        messageChannelApi = { postMessage, addListener, removeListener, sendCommand };
        setFeatures(messageChannelApi);
      })();
    }
  }, [postMessage, addListener, removeListener]);

  return (
    <MessageChannelContext.Provider value={features}>
      {children}
    </MessageChannelContext.Provider>
  );
};

export const useMessageChannelContext = () => {
  const context = useContext(MessageChannelContext);
  if (!context) {
    throw new Error("useMessageChannelContext must be used within a MessageChannelProvider");
  }
  return context;
};