import { Messages } from "@/components/ai/messages";
import { MultimodalInput } from "@/components/ai/multimodal-input";
import { Separator } from "@/components/ui/separator";
import { cx } from "class-variance-authority";
import Decimal from "decimal.js";
import { Loader2 } from "lucide-react";
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
  featureDisabled,
  userCredits,
  isVisible,
}: ChatPanelProps) {
  const handleDisabledSubmit = () => {
    toast.error(
      "Insufficient credits. Please add more credits to continue.",
    );
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
            featureDisabled={featureDisabled}
            status={status}
            messages={messages}
            setMessages={setMessages}
            reload={reload}
          />
        </div>
      </div>

      <form className="flex flex-col mx-auto gap-2 w-full md:max-w-3xl p-2">
        <div className="w-full h-fit flex items-center justify-end">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {featureDisabled ? (
              "Feature Disabled: Insufficient Credits"
            ) : (
              <>
                Your Credit Amount: ${" "}
                {userCredits !== null ? (
                  new Decimal(userCredits)
                    .div(100)
                    .toDecimalPlaces(2, Decimal.ROUND_DOWN)
                    .toFixed(2)
                ) : (
                  <Loader2 className="animate-spin inline" />
                )}
              </>
            )}
          </span>
        </div>
        <Separator />
        <MultimodalInput
          featureDisabled={featureDisabled}
          input={input}
          setInput={setInput}
          handleSubmit={featureDisabled ? handleDisabledSubmit : handleSubmit}
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
