"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import vbscript from "highlight.js/lib/languages/vbscript";
import "highlight.js/styles/github-dark.css";

import { Edit3, Eye, Columns, Sparkles } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  isPresentationMode?: boolean;
  onOpenAiModal?: () => void;
}

export function MarkdownEditor({
  value,
  onChange,
  isPresentationMode = false,
  onOpenAiModal,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");

  // Configure rehype-highlight options with VBScript support
  const rehypePlugins = [
    [
      rehypeHighlight,
      {
        languages: {
          vbscript,
          vbs: vbscript,
        },
      },
    ],
  ] as any;

  if (isPresentationMode) {
    return (
      <div className="w-full max-w-4xl mx-auto px-8 py-10 print-page">
        <article className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-semibold prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800">
          <ReactMarkdown rehypePlugins={rehypePlugins}>
            {value || "*No documentation content.*"}
          </ReactMarkdown>
        </article>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--background)] border-b border-[var(--border)]">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-[var(--border)] bg-[var(--sidebar-bg)] text-xs select-none no-print">
        <div className="flex items-center space-x-1">
          <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px] mr-2">
            Markdown Editor
          </span>
          <button
            onClick={() => setViewMode("split")}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              viewMode === "split"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs font-medium"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>
          <button
            onClick={() => setViewMode("edit")}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              viewMode === "edit"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs font-medium"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
              viewMode === "preview"
                ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs font-medium"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>

        {onOpenAiModal && (
          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ AI Auto-Document</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-[350px]">
        {/* Editor Pane */}
        {(viewMode === "split" || viewMode === "edit") && (
          <div
            className={`h-full flex flex-col ${
              viewMode === "split" ? "w-1/2 border-r border-[var(--border)]" : "w-full"
            }`}
          >
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Write Markdown here... Use ```vbscript for code blocks."
              className="w-full h-full p-4 bg-transparent resize-none font-mono text-sm leading-relaxed focus:outline-none select-text"
            />
          </div>
        )}

        {/* Live Preview Pane */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div
            className={`h-full overflow-y-auto p-6 bg-[var(--background)] ${
              viewMode === "split" ? "w-1/2" : "w-full max-w-4xl mx-auto"
            }`}
          >
            <article className="prose prose-zinc dark:prose-invert max-w-none text-sm leading-relaxed prose-headings:font-semibold prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-lg">
              <ReactMarkdown rehypePlugins={rehypePlugins}>
                {value || "*Preview empty. Write markdown to see live output.*"}
              </ReactMarkdown>
            </article>
          </div>
        )}
      </div>
    </div>
  );
}
