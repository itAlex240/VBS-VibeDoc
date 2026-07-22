"use client";

import React from "react";
import { Eye, EyeOff, Settings, Check, Loader2, Sparkles, Printer } from "lucide-react";

interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  saveStatus: "saved" | "saving" | "unsaved";
  isPresentationMode: boolean;
  onTogglePresentationMode: () => void;
  onOpenSettings: () => void;
  onOpenAiModal?: () => void;
  onPrint?: () => void;
}

export function Header({
  title,
  onTitleChange,
  saveStatus,
  isPresentationMode,
  onTogglePresentationMode,
  onOpenSettings,
  onOpenAiModal,
  onPrint,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 h-14 border-b border-[var(--border)] bg-[var(--background)] z-10 select-none no-print">
      {/* Title Input */}
      <div className="flex items-center space-x-3 flex-1 max-w-xl">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled Document"
          disabled={isPresentationMode}
          className="text-base font-semibold bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-blue-500 focus:outline-none px-1 py-0.5 w-full transition-colors truncate"
        />

        {/* Save Status Indicator */}
        <div className="flex items-center space-x-1.5 text-xs text-zinc-400 flex-shrink-0">
          {saveStatus === "saving" && (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
              <span className="text-amber-500">Saving...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Saved</span>
            </>
          )}
          {saveStatus === "unsaved" && (
            <span className="text-zinc-400 italic">Unsaved</span>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-2">
        {/* AI Magic Button */}
        {onOpenAiModal && !isPresentationMode && (
          <button
            onClick={onOpenAiModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-md transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            <span>✨ Auto-Document VBS / BT</span>
          </button>
        )}

        {/* Presentation Mode Toggle */}
        <button
          onClick={onTogglePresentationMode}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
            isPresentationMode
              ? "bg-purple-600 text-white border-purple-600 shadow-sm"
              : "border-[var(--border)] hover:bg-[var(--accent)] text-zinc-700 dark:text-zinc-300"
          }`}
          title="Toggle Presentation Mode"
        >
          {isPresentationMode ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Exit Presentation</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-purple-500" />
              <span>Presentation</span>
            </>
          )}
        </button>

        {/* Print Button */}
        {onPrint && (
          <button
            onClick={onPrint}
            className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 border border-[var(--border)] rounded-md hover:bg-[var(--accent)] transition-colors"
            title="Print / Save PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 border border-[var(--border)] rounded-md hover:bg-[var(--accent)] transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
