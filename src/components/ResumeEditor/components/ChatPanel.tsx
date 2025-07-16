"use client";
import { Messages } from "@/components/ai/messages";
import { MultimodalInput } from "@/components/ai/multimodal-input";
import { cx } from "class-variance-authority";
import { toast } from "sonner";
import { ChatPanelProps } from "../types";

export function ChatPanel({
  messages,
  setMessages,
  input,
  setInput,
  handleSubmit,
  status,
  stop,
  reload,
  attachments,
  setAttachments,
  isVisible,
}: ChatPanelProps) {
  const handleDisabledSubmit = () => {
    toast.error("Insufficient credits. Please add more credits to continue.");
    return false;
  };

  return (
    <div
      className={cx(
        "absolute inset-0 flex flex-col justify-between",
        isVisible ? "block" : "hidden",
      )}
    >
      <div className="flex-1 w-full overflow-y-auto">
        <div className="w-full md:max-w-3xl mx-auto p-2">
          <Messages
            status={status}
            messages={messages}
            setMessages={setMessages}
            reload={reload}
          />
        </div>
      </div>

      <form className="flex flex-col mx-auto gap-2 w-full md:max-w-3xl p-2">
        <MultimodalInput
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          status={status}
          stop={stop}
          attachments={attachments}
          setAttachments={setAttachments}
          setMessages={setMessages}
        />
      </form>
    </div>
  );
}
