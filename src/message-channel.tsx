import { createContext, useState, useContext } from "react";
import { type MessageChannelFeatures, useMessageChannel } from "./lib/content-script/message-channel";
import { getNextId, type MessageChannelMessage, type MessageChannelPayload, type SupportedActions } from "./shared";


export type MessageChannelContextType = MessageChannelFeatures<MessageChannelMessage> & {
  sendCommand: <T>(action: SupportedActions, payload: MessageChannelPayload) => Promise<T>;
} | null;

export const MessageChannelContext = createContext<MessageChannelContextType>(null);

export const MessageChannelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [features, setFeatures] = useState<MessageChannelContextType>(null);

  (async() => {
    const { postMessage, addListener, removeListener } = await useMessageChannel<MessageChannelMessage>();

    async function sendCommand<T>(action: SupportedActions, payload: MessageChannelPayload): Promise<T> {
      return new Promise((resolve) => {
        const taskId = getNextId()
        const listener = addListener((message) => {
          const { data } = message;
          if (data.action === `${action}-result` && data.id === taskId) {
            removeListener(listener); // once
            resolve(data.payload as T);
          }
        })
        postMessage({
          id: taskId,
          action,
          payload,
        } as MessageChannelMessage);
      });
    }
    setFeatures({ postMessage, addListener, removeListener, sendCommand });
  })()

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