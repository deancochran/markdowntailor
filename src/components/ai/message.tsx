"use client";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, sanitizeText } from "@/lib/utils";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import cx from "classnames";
import { Loader2, Pencil, Sparkles, SparklesIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import { Markdown } from "./markdown";
import { MessageEditor } from "./message-editor";
import { MessageReasoning } from "./message-reasoning";
import { PreviewAttachment } from "./preview-attachment";

const PurePreviewMessage = ({
  message,
  isLoading,
  setMessages,
  reload,
  requiresScrollPadding,
  featureDisabled,
}: {
  message: UIMessage;
  isLoading: boolean;
  setMessages: UseChatHelpers["setMessages"];
  reload: UseChatHelpers["reload"];
  requiresScrollPadding: boolean;
  featureDisabled: boolean;
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [_, _copyToClipboard] = useCopyToClipboard();

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            },
          )}
        >
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div
            className={cn("flex flex-col gap-4 w-full", {
              "min-h-96": message.role === "assistant" && requiresScrollPadding,
            })}
          >
            {message.experimental_attachments &&
              message.experimental_attachments.length > 0 && (
                <div
                  data-testid={`message-attachments`}
                  className="flex flex-row justify-end gap-2"
                >
                  {message.experimental_attachments.map((attachment) => (
                    <PreviewAttachment
                      key={attachment.url}
                      attachment={attachment}
                    />
                  ))}
                </div>
              )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === "reasoning") {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.reasoning}
                  />
                );
              }

              if (type === "text") {
                if (mode === "view") {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      {message.role === "user" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                              onClick={() => {
                                setMode("edit");
                              }}
                            >
                              <Pencil />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn("flex flex-col gap-4", {
                          "bg-primary text-primary-foreground px-3 py-2 rounded-xl":
                            message.role === "user",
                        })}
                      >
                        {isLoading ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">
                                Loading response...
                              </span>
                            </div>
                            <Markdown>{sanitizeText(part.text)}</Markdown>
                          </div>
                        ) : (
                          <Markdown>{sanitizeText(part.text)}</Markdown>
                        )}
                      </div>
                    </div>
                  );
                }

                if (mode === "edit") {
                  return (
                    <div key={key} className="flex flex-row gap-2 items-start">
                      <div className="size-8" />

                      {isLoading ? (
                        <div className="flex items-center gap-2 p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            Loading...
                          </span>
                        </div>
                      ) : (
                        <MessageEditor
                          featureDisabled={featureDisabled}
                          key={message.id}
                          message={message}
                          setMode={setMode}
                          setMessages={setMessages}
                          reload={reload}
                        />
                      )}
                    </div>
                  );
                }
              }

              if (type === "tool-invocation") {
                const { toolInvocation } = part;
                const { toolName, toolCallId, state } = toolInvocation;

                if (state === "call") {
                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: true,
                      })}
                    >
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {toolName === "batch_modify" ? (
                          <p>
                            <span key={index}>Running {toolName}...</span>
                          </p>
                        ) : toolName === "analyze_content" ? (
                          <p>
                            <span key={index}>Running {toolName}...</span>
                          </p>
                        ) : (
                          <p>Processing...</p>
                        )}
                      </div>
                    </div>
                  );
                }

                if (state === "result") {
                  const { result } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === "batch_modify" ? (
                        <p>Analyzed Content</p>
                      ) : toolName === "analyze_content" ? (
                        <p>Analyzed Content</p>
                      ) : (
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                      )}
                    </div>
                  );
                }
              }
            })}
          </div>
        </div>
        {/* <TooltipProvider delayDuration={0}>
          <div
            className={`flex flex-row gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="py-1 px-2 h-fit text-muted-foreground"
                variant="outline"
                onClick={async () => {
                  const textFromParts = message.parts
                    ?.filter((part) => part.type === "text")
                    .map((part) => part.text)
                    .join("\n")
                    .trim();

                  if (!textFromParts) {
                    toast.error("There's no text to copy!");
                    return;
                  }

                  await copyToClipboard(textFromParts);
                  toast.success("Copied to clipboard!");
                }}
                  <Copy />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider> */}
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.requiresScrollPadding !== nextProps.requiresScrollPadding)
      return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = "assistant";

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message min-h-96"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
          {
            "group-data-[role=user]/message:bg-muted": true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <Sparkles size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Thinking...</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
