"use client";

import React, { useRef } from "react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { toast } from "sonner";
import rehypeHighlight from "rehype-highlight";
import vbscript from "highlight.js/lib/languages/vbscript";
import lua from "highlight.js/lib/languages/lua";
import "highlight.js/styles/github-dark.css";
import { Sparkles, Image as ImageIcon } from "lucide-react";

interface MarkdownEditorInnerProps {
  value: string;
  onChange: (value: string) => void;
  isPresentationMode?: boolean;
  onOpenAiModal?: () => void;
}

export default function MarkdownEditorInner({
  value,
  onChange,
  isPresentationMode = false,
  onOpenAiModal,
}: MarkdownEditorInnerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Configure VBScript and Lua highlighting for rehype-highlight
  const rehypePlugins = [
    [
      rehypeHighlight,
      {
        languages: {
          vbscript,
          vbs: vbscript,
          lua,
        },
      },
    ],
  ] as any;

  // Upload image handler
  const handleUploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const toastId = toast.loading("Uploading image...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const imageMarkdown = `\n![${file.name || "Uploaded Image"}](${data.url})\n`;
      onChange((value || "") + imageMarkdown);
      toast.success("Image uploaded successfully!", { id: toastId });
    } catch (err: any) {
      console.error("Failed to upload image:", err);
      toast.error(err?.message || "Failed to upload image.", { id: toastId });
    }
  };

  // Intercept Paste events
  const handlePaste = async (e: React.ClipboardEvent) => {
    const files = e.clipboardData?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith("image/")) {
          e.preventDefault();
          await handleUploadImage(files[i]);
        }
      }
    }
  };

  // Intercept Drop events
  const handleDrop = async (e: React.DragEvent) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith("image/")) {
          e.preventDefault();
          await handleUploadImage(files[i]);
        }
      }
    }
  };

  // Presentation Mode View
  if (isPresentationMode) {
    return (
      <div className="w-full max-w-4xl mx-auto px-8 py-10 print-page">
        <MDEditor.Markdown
          source={value || "*No documentation content.*"}
          rehypePlugins={rehypePlugins}
          className="bg-transparent text-zinc-900 dark:text-zinc-100"
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full w-full bg-[var(--background)]"
      onPaste={handlePaste}
      onDrop={handleDrop}
    >
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-[var(--border)] bg-[var(--sidebar-bg)] text-xs select-none no-print">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">
            Markdown Editor
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded transition-colors"
            title="Upload Image"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadImage(file);
            }}
          />
        </div>

        {onOpenAiModal && (
          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ AI Auto-Document VBS / BT</span>
          </button>
        )}
      </div>

      {/* MDEditor Container */}
      <div className="flex-1 w-full overflow-hidden" data-color-mode="auto">
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || "")}
          height="100%"
          preview="live"
          hideToolbar={false}
          enableScroll={true}
          tabSize={2}
          previewOptions={{
            rehypePlugins: rehypePlugins,
          }}
          className="w-full h-full border-none shadow-none rounded-none font-mono"
        />
      </div>
    </div>
  );
}
