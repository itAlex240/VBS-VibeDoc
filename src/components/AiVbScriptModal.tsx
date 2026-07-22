"use client";

import React, { useState } from "react";
import { Sparkles, X, Loader2, Code, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface AiVbScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppendMarkdown: (generatedMarkdown: string) => void;
}

export function AiVbScriptModal({
  isOpen,
  onClose,
  onAppendMarkdown,
}: AiVbScriptModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!code.trim()) {
      setError("Please paste some VBScript code to analyze.");
      toast.error("Please paste VBScript code first.");
      return;
    }

    setLoading(true);
    setError(null);
    const toastId = toast.loading("Analyzing VBScript & generating documentation...");

    try {
      const res = await fetch("/api/ai/document-vbscript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vbscriptCode: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate documentation");
      }

      const formattedMarkdown = `\n\n## 📜 VBScript Documentation\n\n${data.documentation}\n\n### Original VBScript Code\n\`\`\`vbscript\n${code.trim()}\n\`\`\`\n`;

      onAppendMarkdown(formattedMarkdown);
      setCode("");
      toast.success("VBScript documentation generated successfully!", { id: toastId });
      onClose();
    } catch (err: any) {
      const errorMsg = err.message || "An error occurred during AI generation.";
      setError(errorMsg);
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 no-print">
      <div className="w-full max-w-2xl bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                ✨ Auto-Document VBScript
              </h2>
              <p className="text-xs text-zinc-500">
                Paste legacy VBScript code to generate structured Markdown documentation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center space-x-2 p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Code Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
            <span className="flex items-center space-x-1">
              <Code className="w-3.5 h-3.5" />
              <span>Raw VBScript Code</span>
            </span>
            <span>{code.length} characters</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Dim fso, folder, file\nSet fso = CreateObject("Scripting.FileSystemObject")\nSet folder = fso.GetFolder("C:\\Data")\nFor Each file In folder.Files\n  WScript.Echo file.Name\nNext`}
            rows={10}
            className="w-full p-3 text-xs font-mono bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed resize-y"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <button
            onClick={() => setCode("")}
            disabled={!code || loading}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 disabled:opacity-50"
          >
            Clear Code
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-md border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading || !code.trim()}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-md transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing VBScript...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Generate & Append Docs</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
