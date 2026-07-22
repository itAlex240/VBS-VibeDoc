"use client";

import React, { useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { VisualCanvas } from "@/components/VisualCanvas";
import { SettingsModal } from "@/components/SettingsModal";
import { AiVbScriptModal } from "@/components/AiVbScriptModal";
import { useDocumentManager } from "@/hooks/useDocumentManager";
import { FileText, Loader2, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function AppShell() {
  const {
    documents,
    activeDocumentId,
    setActiveDocumentId,
    currentDocument,
    loading,
    saveStatus,
    updateDocumentField,
    createDocument,
    renameDocument,
    deleteDocument,
  } = useDocumentManager();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  const handleAppendMarkdown = (generatedDocs: string) => {
    if (!currentDocument) return;
    const newMarkdown = (currentDocument.markdownContent || "") + generatedDocs;
    updateDocumentField("markdownContent", newMarkdown);
    toast.success("AI documentation appended!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* Sidebar - hidden in Presentation Mode */}
      {!isPresentationMode && (
        <Sidebar
          documents={documents}
          activeDocumentId={activeDocumentId}
          onSelectDocument={(id) => setActiveDocumentId(id)}
          onCreateDocument={createDocument}
          onRenameDocument={renameDocument}
          onDeleteDocument={deleteDocument}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        {/* Header Bar - hidden in Presentation Mode */}
        {!isPresentationMode && currentDocument && (
          <Header
            title={currentDocument.title}
            onTitleChange={(title) => updateDocumentField("title", title)}
            saveStatus={saveStatus}
            isPresentationMode={isPresentationMode}
            onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onPrint={handlePrint}
          />
        )}

        {/* Floating Exit Button for Presentation Mode */}
        {isPresentationMode && (
          <div className="fixed top-4 right-4 z-50 no-print">
            <button
              onClick={() => setIsPresentationMode(false)}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-medium bg-zinc-900/90 text-white hover:bg-black border border-zinc-700 rounded-full shadow-lg backdrop-blur-md transition-all hover:scale-105"
            >
              <EyeOff className="w-4 h-4 text-purple-400" />
              <span>Exit Presentation</span>
            </button>
          </div>
        )}

        {/* Workspace Area */}
        <main className="flex-1 flex flex-col overflow-hidden min-h-0 bg-[var(--background)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center flex-1 text-zinc-400 py-12">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
              <span className="text-sm font-medium">Loading VBS-VibeDoc workspace...</span>
            </div>
          ) : !currentDocument ? (
            <div className="flex flex-col items-center justify-center flex-1 text-zinc-400 p-8 text-center">
              <FileText className="w-12 h-12 mb-3 text-zinc-300 dark:text-zinc-700" />
              <h3 className="text-base font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                No Document Selected
              </h3>
              <p className="text-xs text-zinc-400 mb-4 max-w-sm">
                Select an existing document from the left sidebar or create a new one to start writing.
              </p>
              <button
                onClick={createDocument}
                className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
              >
                + Create First Document
              </button>
            </div>
          ) : isPresentationMode ? (
            /* Presentation Mode Layout: Scrollable Centered View */
            <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-5xl mx-auto w-full">
              <div className="w-full">
                <MarkdownEditor
                  value={currentDocument.markdownContent}
                  onChange={(val) => updateDocumentField("markdownContent", val)}
                  isPresentationMode={true}
                  onOpenAiModal={() => setIsAiModalOpen(true)}
                />
              </div>

              <div className="w-full min-h-[600px] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <VisualCanvas
                  canvasState={currentDocument.canvasState}
                  onCanvasChange={(state) => updateDocumentField("canvasState", state)}
                  isPresentationMode={true}
                />
              </div>
            </div>
          ) : (
            /* Normal Workspace Layout: Horizontal Resizable Panels */
            <Group orientation="horizontal" className="flex-1 w-full h-full min-h-0">
              {/* Left Panel: Markdown Editor */}
              <Panel defaultSize={50} minSize={20} className="flex flex-col h-full overflow-hidden">
                <MarkdownEditor
                  value={currentDocument.markdownContent}
                  onChange={(val) => updateDocumentField("markdownContent", val)}
                  isPresentationMode={false}
                  onOpenAiModal={() => setIsAiModalOpen(true)}
                />
              </Panel>

              {/* Resizable Divider Separator */}
              <Separator className="w-2 bg-[var(--border)] hover:bg-blue-500/80 active:bg-blue-600 transition-colors cursor-col-resize flex items-center justify-center group z-30 select-none">
                <div className="w-1 h-8 bg-zinc-400 dark:bg-zinc-600 group-hover:bg-white rounded-full transition-colors" />
              </Separator>

              {/* Right Panel: tldraw Visual Workspace Canvas */}
              <Panel defaultSize={50} minSize={20} className="flex flex-col h-full overflow-hidden">
                <VisualCanvas
                  canvasState={currentDocument.canvasState}
                  onCanvasChange={(state) => updateDocumentField("canvasState", state)}
                  isPresentationMode={false}
                />
              </Panel>
            </Group>
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* AI VBScript Auto-Documenter Modal */}
      <AiVbScriptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onAppendMarkdown={handleAppendMarkdown}
      />
    </div>
  );
}
