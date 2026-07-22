"use client";

import React, { useState } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Settings,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Check,
  X
} from "lucide-react";

export interface DocumentItem {
  id: String;
  title: string;
  updatedAt: string;
}

interface SidebarProps {
  documents: DocumentItem[];
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onCreateDocument: () => void;
  onRenameDocument: (id: string, newTitle: string) => void;
  onDeleteDocument: (id: string) => void;
  onOpenSettings: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  documents,
  activeDocumentId,
  onSelectDocument,
  onCreateDocument,
  onRenameDocument,
  onDeleteDocument,
  onOpenSettings,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEditing = (doc: DocumentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(doc.id as string);
    setEditTitle(doc.title);
  };

  const saveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameDocument(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = () => {
    setEditingId(null);
  };

  return (
    <aside
      className={`relative flex flex-col h-full bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] transition-all duration-300 select-none z-20 no-print ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header / Brand */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--sidebar-border)] h-14">
        {!isCollapsed && (
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="p-1.5 bg-blue-600 text-white rounded-md flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight truncate">
              VBS-VibeDoc
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto p-1.5 bg-blue-600 text-white rounded-md">
            <BookOpen className="w-4 h-4" />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Action Button: Create Document */}
      <div className="p-3">
        <button
          onClick={onCreateDocument}
          className={`flex items-center justify-center space-x-2 w-full py-2 px-3 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm ${
            isCollapsed ? "px-0" : ""
          }`}
          title="Create New Document"
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>New Document</span>}
        </button>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {!isCollapsed && (
          <div className="px-2 py-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Documents ({documents.length})
          </div>
        )}
        {documents.map((doc) => {
          const isActive = doc.id === activeDocumentId;
          const isEditing = editingId === doc.id;

          return (
            <div
              key={doc.id as string}
              onClick={() => onSelectDocument(doc.id as string)}
              className={`group flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${
                isActive
                  ? "bg-blue-100/60 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-medium"
                  : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <FileText className="w-4 h-4 flex-shrink-0 text-zinc-400 group-hover:text-blue-500" />
                {!isCollapsed && (
                  <>
                    {isEditing ? (
                      <div className="flex items-center space-x-1 flex-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveRename(doc.id as string);
                            if (e.key === "Escape") cancelRename();
                          }}
                          autoFocus
                          className="w-full px-1.5 py-0.5 text-xs bg-white dark:bg-zinc-900 border border-blue-500 rounded focus:outline-none"
                        />
                        <button
                          onClick={() => saveRename(doc.id as string)}
                          className="p-0.5 text-emerald-600 hover:text-emerald-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelRename}
                          className="p-0.5 text-rose-500 hover:text-rose-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="truncate">{doc.title || "Untitled Document"}</span>
                    )}
                  </>
                )}
              </div>

              {!isCollapsed && !isEditing && (
                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                  <button
                    onClick={(e) => startEditing(doc, e)}
                    className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded"
                    title="Rename"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDocument(doc.id as string);
                    }}
                    className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer / Settings Button */}
      <div className="p-3 border-t border-[var(--sidebar-border)]">
        <button
          onClick={onOpenSettings}
          className={`flex items-center space-x-2 w-full py-2 px-3 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
          title="Settings"
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}
