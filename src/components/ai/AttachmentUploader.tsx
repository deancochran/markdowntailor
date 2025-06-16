import { Button } from "@/components/ui/button";
import type { Attachment } from "ai";
import { Paperclip } from "lucide-react";
import React, { ChangeEvent, useRef } from "react";

interface AttachmentUploaderProps {
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
}

export function AttachmentUploader({
  setAttachments,
}: AttachmentUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Process each file and convert to base64
    const newAttachments = await Promise.all(
      files.map(async (file) => {
        return new Promise<Attachment>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // The result is a base64 data URL like "data:application/pdf;base64,..."
            const base64String = reader.result as string;
            resolve({
              name: file.name,
              contentType: file.type,
              url: base64String, // This contains the full data URL with the base64 content
            });
          };
          reader.readAsDataURL(file);
        });
      }),
    );

    setAttachments((cur) => [...cur, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,image/*"
      />
      <Button
        type="button" // Explicitly set type to button
        variant="ghost"
        onClick={(e) => {
          e.preventDefault(); // Prevent default behavior
          fileInputRef.current?.click();
        }}
        className="p-2 rounded-full"
      >
        <Paperclip />
      </Button>
    </>
  );
}
