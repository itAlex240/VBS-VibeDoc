"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Loader2 } from "lucide-react";

interface VisualCanvasProps {
  canvasState: string;
  onCanvasChange: (state: string) => void;
  isPresentationMode?: boolean;
}

// Dynamically import VisualCanvasInner with ssr: false to prevent Next.js hydration errors
const VisualCanvasInner = dynamic(
  () => import("@/components/VisualCanvasInner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center w-full h-full bg-[var(--background)] text-zinc-400 py-12">
        <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-500" />
        <span className="text-xs">Loading Visual Canvas (tldraw)...</span>
      </div>
    ),
  }
);

export function VisualCanvas({
  canvasState,
  onCanvasChange,
  isPresentationMode = false,
}: VisualCanvasProps) {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col bg-[var(--background)] border-t border-[var(--border)] relative">
      {!isPresentationMode && (
        <div className="flex items-center justify-between px-4 h-9 border-b border-[var(--border)] bg-[var(--sidebar-bg)] text-xs text-zinc-500 select-none no-print">
          <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">
            Visual Workspace Canvas (tldraw)
          </span>
          <span className="text-[11px] text-zinc-400">
            Draw flowcharts, workflow arrows, or drop UI screenshots directly.
          </span>
        </div>
      )}
      <div className="flex-1 w-full relative min-h-[350px]">
        <VisualCanvasInner
          canvasState={canvasState}
          onCanvasChange={onCanvasChange}
          isPresentationMode={isPresentationMode}
        />
      </div>
    </div>
  );
}
