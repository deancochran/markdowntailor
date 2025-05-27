// EditorComponents/EditorSidebar.tsx
"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resume } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import dynamic from "next/dynamic";
import { UseFormSetValue } from "react-hook-form";

// Use Monaco Editor for both Markdown and CSS with autocomplete and syntax highlighting
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false },
);

// Monaco editor options - shared base configuration
const monacoOptions = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 14,
  automaticLayout: true,
  tabSize: 2,
  formatOnPaste: true,
  formatOnType: true,
};

interface EditorSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  markdown: string;
  css: string;
  setValue: UseFormSetValue<InferSelectModel<typeof resume>>;
}

export function EditorSidebar({
  activeTab,
  setActiveTab,
  markdown,
  css,
  setValue,
}: EditorSidebarProps) {
  return (
    <div className="col-span-1 h-full border-r">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col gap-0 h-full"
      >
        <TabsList className="w-full flex justify-start border-b rounded-none px-4">
          <TabsTrigger value="markdown" className="px-4 py-2">
            Markdown
          </TabsTrigger>
          <TabsTrigger value="css" className="px-4 py-2">
            CSS
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="markdown"
          style={{
            display: activeTab === "markdown" ? "block" : "none",
          }}
        >
          <MonacoEditor
            language="markdown"
            value={markdown}
            onChange={(val) => setValue("markdown", val ?? "")}
            options={{
              ...monacoOptions,
              wordWrap: "on",
              lineNumbers: "on",
              quickSuggestions: true,
            }}
            theme="light"
          />
        </TabsContent>

        <TabsContent
          value="css"
          style={{
            display: activeTab === "css" ? "block" : "none",
          }}
        >
          <MonacoEditor
            language="css"
            value={css}
            onChange={(val) => setValue("css", val ?? "")}
            options={monacoOptions}
            theme="light"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
