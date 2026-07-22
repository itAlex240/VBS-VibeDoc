"use client";

import React, { useEffect, useRef } from "react";
import { Tldraw, Editor, getSnapshot, loadSnapshot } from "tldraw";
import "tldraw/tldraw.css";

interface VisualCanvasInnerProps {
  canvasState: string;
  onCanvasChange: (state: string) => void;
  isPresentationMode?: boolean;
}

export default function VisualCanvasInner({
  canvasState,
  onCanvasChange,
  isPresentationMode = false,
}: VisualCanvasInnerProps) {
  const editorRef = useRef<Editor | null>(null);
  const isInternalChangeRef = useRef<boolean>(false);
  const lastSavedStateRef = useRef<string>(canvasState);

  const handleMount = (editor: Editor) => {
    editorRef.current = editor;

    if (isPresentationMode) {
      editor.updateInstanceState({ isReadonly: true });
    }

    // Load initial snapshot if present
    if (canvasState && canvasState !== "{}" && canvasState.trim().length > 2) {
      try {
        const snapshot = JSON.parse(canvasState);
        isInternalChangeRef.current = true;
        loadSnapshot(editor.store, snapshot);
        isInternalChangeRef.current = false;
      } catch (err) {
        console.error("Failed to parse initial tldraw canvas state:", err);
      }
    }

    // Subscribe to canvas changes
    const cleanup = editor.store.listen(
      () => {
        if (isInternalChangeRef.current) return;
        try {
          const snapshot = getSnapshot(editor.store);
          const serialized = JSON.stringify(snapshot);
          if (serialized !== lastSavedStateRef.current) {
            lastSavedStateRef.current = serialized;
            onCanvasChange(serialized);
          }
        } catch (err) {
          console.error("Failed to get tldraw snapshot:", err);
        }
      },
      { source: "user", scope: "document" }
    );

    return () => {
      cleanup();
    };
  };

  // Sync presentation mode changes
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateInstanceState({ isReadonly: isPresentationMode });
    }
  }, [isPresentationMode]);

  // Sync external document changes
  useEffect(() => {
    if (
      editorRef.current &&
      canvasState &&
      canvasState !== lastSavedStateRef.current &&
      canvasState !== "{}"
    ) {
      try {
        const snapshot = JSON.parse(canvasState);
        isInternalChangeRef.current = true;
        loadSnapshot(editorRef.current.store, snapshot);
        isInternalChangeRef.current = false;
        lastSavedStateRef.current = canvasState;
      } catch (err) {
        console.error("Failed to sync tldraw state:", err);
      }
    }
  }, [canvasState]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <Tldraw onMount={handleMount} />
    </div>
  );
}
