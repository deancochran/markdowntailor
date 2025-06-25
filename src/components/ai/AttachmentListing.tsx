import type { Attachment } from "ai";
import { X } from "lucide-react";
import React from "react";
import { PreviewAttachment } from "./preview-attachment";

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

  return (
    <div className="w-full h-16 mb-4 overflow-x-auto flex items-center gap-3 py-2 px-4 bg-gray-50 dark:bg-zinc-900 rounded-lg">
      {attachments.map((att) => (
        <div key={att.url} className="relative flex-shrink-0">
          <button
            disabled={featureDisabled}
            onClick={() => removeAttachment(att.url)}
            className="absolute -top-2 -right-2 size-5 flex items-center justify-center bg-gray-200 dark:bg-zinc-700 rounded-full hover:bg-gray-300 dark:hover:bg-zinc-600 z-10"
          >
            <X size={12} />
          </button>
          <PreviewAttachment attachment={att} />
        </div>
      ))}
    </div>
  );
}
