"use client";
import { Button } from "@/components/ui/button";
import { EditorTabsProps, MobileTabsProps, PreviewTabsProps } from "../types";

export function EditorTabs({ activeTab, onTabChange }: EditorTabsProps) {
  return (
    <div className="relative flex items-center align-middle justify-center gap-2 p-2 border-b">
      <Button
        className="flex grow"
        variant={activeTab === "markdown" ? "outline" : "ghost"}
        onClick={() => onTabChange("markdown")}
      >
        Markdown
      </Button>
      <Button
        className="flex grow"
        variant={activeTab === "css" ? "outline" : "ghost"}
        onClick={() => onTabChange("css")}
      >
        CSS
      </Button>
    </div>
  );
}

export function PreviewTabs({ activeTab, onTabChange }: PreviewTabsProps) {
  return (
    <div className="relative flex items-center align-middle justify-center gap-2 p-2 border-b">
      <Button
        className="flex grow"
        variant={activeTab === "preview" ? "outline" : "ghost"}
        onClick={() => onTabChange("preview")}
      >
        Preview
      </Button>
      <Button
        className="flex grow"
        variant={activeTab === "chat" ? "outline" : "ghost"}
        onClick={() => onTabChange("chat")}
      >
        AI Chat
      </Button>
    </div>
  );
}

export function MobileTabs({ activeTab, onTabChange }: MobileTabsProps) {
  return (
    <div className="flex lg:hidden items-center justify-center gap-1 p-2 border bg-background rounded">
      <Button
        className="flex grow text-xs"
        variant={activeTab === "markdown" ? "outline" : "ghost"}
        onClick={() => onTabChange("markdown")}
      >
        Markdown
      </Button>
      <Button
        className="flex grow text-xs"
        variant={activeTab === "css" ? "outline" : "ghost"}
        onClick={() => onTabChange("css")}
      >
        CSS
      </Button>
      <Button
        className="flex grow text-xs"
        variant={activeTab === "preview" ? "outline" : "ghost"}
        onClick={() => onTabChange("preview")}
      >
        Preview
      </Button>
      <Button
        className="flex grow text-xs"
        variant={activeTab === "chat" ? "outline" : "ghost"}
        onClick={() => onTabChange("chat")}
      >
        AI Chat
      </Button>
    </div>
  );
}
