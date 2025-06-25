import { useMessages } from "@/hooks/use-messages";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { motion } from "motion/react";
import { memo } from "react";
import { PreviewMessage, ThinkingMessage } from "./message";

interface MessagesProps {
  status: UseChatHelpers["status"];
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers["setMessages"];
  reload: UseChatHelpers["reload"];
  featureDisabled: boolean;
}

function PureMessages({
  status,
  messages,
  setMessages,
  reload,
  featureDisabled,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    hasSentMessage,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
  } = useMessages({
    status,
  });

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col gap-6 w-full h-full"
    >
      {messages.length === 0 && (
        <div
          key="overview"
          className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-semibold"
          >
            Hello there!
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.6 }}
            className="text-2xl text-zinc-500"
          >
            How can I help you today?
          </motion.div>
        </div>
      )}

      {messages.map((message, index) => (
        <PreviewMessage
          featureDisabled={featureDisabled}
          key={message.id}
          message={message}
          isLoading={status === "streaming" && messages.length - 1 === index}
          setMessages={setMessages}
          reload={reload}
          requiresScrollPadding={
            hasSentMessage && index === messages.length - 1
          }
        />
      ))}

      {status === "submitted" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && <ThinkingMessage />}

      <motion.div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
        onViewportLeave={onViewportLeave}
        onViewportEnter={onViewportEnter}
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  // if (!equal(prevProps.messages, nextProps.messages)) return false;
  // if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});
