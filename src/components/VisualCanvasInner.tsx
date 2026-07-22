"use client";

import React, { useEffect, useRef } from "react";
import { Tldraw, Editor, getSnapshot, loadSnapshot } from "tldraw";
import { toast } from "sonner";
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

    // Subscribe to canvas changes & intercept Base64 image asset creation
    const cleanup = editor.store.listen(
      async (change) => {
        if (isInternalChangeRef.current) return;

        // 1. Intercept newly added Base64 image assets to upload locally
        if (change.changes.added) {
          for (const record of Object.values(change.changes.added)) {
            if (
              record.typeName === "asset" &&
              record.type === "image" &&
              typeof record.props?.src === "string" &&
              record.props.src.startsWith("data:image/")
            ) {
              try {
                const base64Data = record.props.src;
                const mimeMatch = base64Data.match(/^data:(image\/[a-zA-Z+]+);base64,/);
                const mimeType = mimeMatch ? mimeMatch[1] : "image/png";

                // Convert Base64 string to Blob & File
                const blobRes = await fetch(base64Data);
                const blob = await blobRes.blob();
                const ext = mimeType.split("/")[1] || "png";
                const file = new File([blob], `canvas_img_${Date.now()}.${ext}`, {
                  type: mimeType,
                });

                // Upload to /api/upload
                const formData = new FormData();
                formData.append("file", file);

                const uploadRes = await fetch("/api/upload", {
                  method: "POST",
                  body: formData,
                });

                if (uploadRes.ok) {
                  const data = await uploadRes.json();
                  isInternalChangeRef.current = true;
                  // Replace Base64 src with local URL in store
                  editor.store.put([
                    {
                      ...record,
                      props: {
                        ...record.props,
                        src: data.url,
                      },
                    },
                  ]);
                  isInternalChangeRef.current = false;
                  toast.success("Canvas image saved locally!");
                }
              } catch (uploadErr) {
                console.error("Failed to upload tldraw canvas image:", uploadErr);
              }
            }
          }
        }

        // 2. Notify parent of canvas state changes
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
