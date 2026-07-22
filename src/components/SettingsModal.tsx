"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Key, Moon, Sun, Monitor, Eye, EyeOff, X, Save, Check, Loader2, Sparkles, Cpu } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [openAiKey, setOpenAiKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [aiProvider, setAiProvider] = useState<"openai" | "gemini">("openai");

  const [showOpenAiKey, setShowOpenAiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.openAiKey) setOpenAiKey(data.openAiKey);
          if (data.geminiKey) setGeminiKey(data.geminiKey);
          if (data.aiProvider) setAiProvider(data.aiProvider);
          if (data.theme) setTheme(data.theme);
        })
        .catch((err) => console.error("Failed to load settings:", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, setTheme]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          openAiKey,
          geminiKey,
          aiProvider,
          theme,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 no-print">
      <div className="w-full max-w-lg bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold tracking-tight">App Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading settings...</span>
          </div>
        ) : (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            {/* Active AI Provider Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>Active AI Provider</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAiProvider("openai")}
                  className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                    aiProvider === "openai"
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <span className="text-xs font-semibold">OpenAI (GPT-4o)</span>
                  <span className="text-[11px] opacity-75 mt-0.5">Use OpenAI API Key</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAiProvider("gemini")}
                  className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                    aiProvider === "gemini"
                      ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 shadow-xs"
                      : "border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <span className="text-xs font-semibold flex items-center">
                    <Sparkles className="w-3 h-3 mr-1 text-purple-400" />
                    Google Gemini
                  </span>
                  <span className="text-[11px] opacity-75 mt-0.5">Use Gemini API Key</span>
                </button>
              </div>
            </div>

            {/* OpenAI API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type={showOpenAiKey ? "text" : "password"}
                  value={openAiKey}
                  onChange={(e) => setOpenAiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showOpenAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Google Gemini API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Google Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showGeminiKey ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500">
                Keys are saved securely in your local SQLite database.
              </p>
            </div>

            {/* Theme Selector Section */}
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Interface Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                        isActive
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-xs"
                          : "border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : savedSuccess ? (
              <Check className="w-4 h-4 text-emerald-300" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{savedSuccess ? "Saved!" : "Save Settings"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
