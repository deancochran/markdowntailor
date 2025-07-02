"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { Attachment } from "ai";
import { cx } from "class-variance-authority";
import { SendHorizontal, Square } from "lucide-react";
import { memo, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocalStorage, useWindowSize } from "usehooks-ts";
import { AttachmentListing } from "./AttachmentListing";
import { AttachmentUploader } from "./AttachmentUploader";
function PureMultimodalInput({
  featureDisabled,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  handleSubmit,
}: {
  featureDisabled: boolean;
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
  const { isAtBottom: _isAtBottom, scrollToBottom } = useScrollToBottom();
  const [_localInput, setLocalInput] = useLocalStorage("input", "");

  const submitForm = useCallback(() => {
    if (featureDisabled) {
      toast.error("You don't have enough credits to use this feature", {
        description: "Please add more credits to continue using AI features.",
      });
      return;
    }

    handleSubmit(undefined, { experimental_attachments: attachments });
    setAttachments([]);
    setLocalInput("");
    if (width! > 768) scrollToBottom();
  }, [
    attachments,
    featureDisabled,
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
      <AttachmentListing
        attachments={attachments}
        setAttachments={setAttachments}
        featureDisabled={featureDisabled}
      />
      <Textarea
        data-testid="multimodal-input"
        placeholder={
          featureDisabled
            ? "Insufficient credits to use AI chat"
            : "Send a message..."
        }
        className={cx(
          "!bg-transparent !outline-none overflow-hidden resize-none !text-base rounded-xl w-full border-none focus-visible:ring-0 shadow-none",
          featureDisabled && "opacity-60 cursor-not-allowed",
        )}
        rows={2}
        autoFocus
        value={input}
        ref={textareaRef}
        disabled={featureDisabled}
        onChange={handleInput}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();

            if (featureDisabled) {
              toast.error("You don't have enough credits to use this feature", {
                description:
                  "Please add more credits to continue using AI features.",
              });
            } else if (status !== "ready") {
              toast.error("Please wait for the model to finish its response!");
            } else {
              submitForm();
            }
          }
        }}
      />

      {/* Input area with attachment uploader and chat controls */}
      <div className="flex flex-row gap-2 justify-end">
        <AttachmentUploader
          featureDisabled={featureDisabled}
          setAttachments={setAttachments}
        />
        {status === "submitted" ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      stop();
                    }}
                    disabled={featureDisabled}
                    className={
                      featureDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }
                  >
                    <Square />
                  </Button>
                </span>
              </TooltipTrigger>
              {featureDisabled && (
                <TooltipContent>
                  <p>Insufficient credits to use AI features</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      submitForm();
                    }}
                    disabled={input.length === 0 || featureDisabled}
                    className={
                      featureDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : input.length === 0
                          ? "opacity-70 cursor-not-allowed"
                          : ""
                    }
                  >
                    <SendHorizontal />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {featureDisabled ? (
                  <p>Please add more credits to use AI features</p>
                ) : input.length === 0 ? (
                  <p>Type a message to send</p>
                ) : (
                  <p>Send message</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

export const MultimodalInput = memo(PureMultimodalInput);
