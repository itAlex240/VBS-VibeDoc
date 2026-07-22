"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Loader2 } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  isPresentationMode?: boolean;
  onOpenAiModal?: () => void;
}

// Dynamically import MarkdownEditorInner with ssr: false to prevent SSR hydration mismatches
const MarkdownEditorInner = dynamic(
  () => import("@/components/MarkdownEditorInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center w-full h-full bg-[var(--background)] text-zinc-400 py-12">
        <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-500" />
        <span className="text-xs">Loading Markdown Editor...</span>
      </div>
    ),
  }
);

export function MarkdownEditor({
  value,
  onChange,
  isPresentationMode = false,
  onOpenAiModal,
}: MarkdownEditorProps) {
  return (
    <div className="w-full h-full min-h-[350px] flex flex-col bg-[var(--background)]">
      <MarkdownEditorInner
        value={value}
        onChange={onChange}
        isPresentationMode={isPresentationMode}
        onOpenAiModal={onOpenAiModal}
      />
    </div>
  );
}
