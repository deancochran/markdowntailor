"use client";

import { useChat } from "@ai-sdk/react";
import type { Attachment } from "ai";
import { useState } from "react";
import { v4 } from "uuid";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";
export default function Chat({
  markdown,
  css,
}: {
  markdown: string;
  css: string;
}) {
  const {
    append,
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    status,
    stop,
    reload,
  } = useChat({
    body: {
      resume: { markdown, css },
    },
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: v4,
  });
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="flex flex-col h-full w-full p-4">
      <Messages
        status={status}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
      />
      <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
        <MultimodalInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          status={status}
          stop={stop}
          attachments={attachments}
          setAttachments={setAttachments}
          messages={messages}
          setMessages={setMessages}
          append={append}
        />
      </form>
    </div>
  );
}
