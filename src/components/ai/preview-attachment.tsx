import type { Attachment } from "ai";
import { FileText, Image } from "lucide-react";

export const PreviewAttachment = ({
  attachment,
}: {
  attachment: Attachment;
}) => {
  const { name, contentType } = attachment;
  // Determine icon based on content type
  const getIcon = () => {
    if (!contentType) return <FileText />;
    // eslint-disable-next-line jsx-a11y/alt-text
    if (contentType.startsWith("image")) return <Image />;
    if (contentType === "application/pdf") return <FileText />;
    return <FileText />;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {getIcon()}
      <div className="text-xs max-w-16 truncate" title={name}>
        {name}
      </div>
    </div>
  );
};
