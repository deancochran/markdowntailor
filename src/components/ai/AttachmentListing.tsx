import type { Attachment } from "ai";
import { FileText, Image, X } from "lucide-react";
import React from "react";
import { Button } from "../ui/button";

interface AttachmentListingProps {
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  featureDisabled: boolean;
}

export function AttachmentListing({
  attachments,
  setAttachments,
  featureDisabled,
}: AttachmentListingProps) {
  if (attachments.length === 0) return null;

  const removeAttachment = (url: string) => {
    setAttachments((prev) => prev.filter((att) => att.url !== url));
  };
  // Determine icon based on content type
  const getIcon = (att: Attachment) => {
    if (!att.contentType) return <FileText />;
    // eslint-disable-next-line jsx-a11y/alt-text
    if (att.contentType.startsWith("image")) return <Image />;
    if (att.contentType === "application/pdf") return <FileText />;
    return <FileText />;
  };

  return (
    <div className="w-full h-fit overflow-x-auto overflow-y-hidden flex items-center gap-4 py-2 rounded-lg">
      {attachments.map((att) => (
        <div
          key={att.url}
          className="relative flex-shrink-0 outline-1 outline-border p-2 rounded-md w-16"
        >
          <Button
            variant="ghost"
            disabled={featureDisabled}
            onClick={() => removeAttachment(att.url)}
            className="w-fit absolute top-1 right-0.5 size-4 hover:bg-transparent"
          >
            <X />
          </Button>
          <div className="flex flex-col items-center justify-center gap-1">
            {getIcon(att)}
            <div
              className="text-xs w-12 truncate text-ellipsis line-clamp-1"
              title={att.name}
            >
              {att.name}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
