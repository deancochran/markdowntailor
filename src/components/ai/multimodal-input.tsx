"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { Attachment } from "ai";
import { cx } from "class-variance-authority";
import { SendHorizontal, Square } from "lucide-react";
import { memo, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
function PureMultimodalInput({
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  handleSubmit,
}: {
  input: UseChatHelpers["input"];
  setInput: UseChatHelpers["setInput"];
  status: UseChatHelpers["status"];
  stop: () => void;
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  setMessages: UseChatHelpers["setMessages"];
  handleSubmit: UseChatHelpers["handleSubmit"];
}) {
  const { width } = useWindowSize();
  const { isAtBottom, scrollToBottom } = useScrollToBottom();
  const [localInput, setLocalInput] = useLocalStorage("input", "");

  const submitForm = useCallback(() => {
    handleSubmit(undefined, { experimental_attachments: attachments });
    setAttachments([]);
    setLocalInput("");
    if (width! > 768) scrollToBottom();
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalInput,
    width,
    scrollToBottom,
  ]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  return (
    <div className="flex flex-col w-full">
      {/* Attachment scroll container sits above the input area */}
      {/* <AttachmentListing
        attachments={attachments}
        setAttachments={setAttachments}
      /> */}
      <Textarea
        data-testid="multimodal-input"
        placeholder="Send a message..."
        className={cx(
          "!bg-transparent !outline-none overflow-hidden resize-none !text-base rounded-xl w-full border-none focus-visible:ring-0 shadow-none",
        )}
        rows={2}
        autoFocus
        value={input}
        ref={textareaRef}
        onChange={handleInput}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();

            if (status !== "ready") {
              toast.error("Please wait for the model to finish its response!");
            } else {
              submitForm();
            }
          }
        }}
      />

      {/* Input area with attachment uploader and chat controls */}
      <div className="flex flex-row gap-2 justify-end">
        {/* <AttachmentUploader setAttachments={setAttachments} /> */}
        {status === "submitted" ? (
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              stop();
            }}
          >
            <Square />
          </Button>
        ) : (
          <Button
            onClick={(e) => {
              e.preventDefault();
              submitForm();
            }}
            disabled={input.length === 0}
          >
            <SendHorizontal />
          </Button>
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(PureMultimodalInput);
