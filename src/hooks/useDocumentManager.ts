"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { DocumentItem } from "@/components/Sidebar";
import { toast } from "sonner";

export interface FullDocument {
  id: string;
  title: string;
  markdownContent: string;
  canvasState: string;
  createdAt: string;
  updatedAt: string;
}

export function useDocumentManager() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [currentDocument, setCurrentDocument] = useState<FullDocument | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [docLoading, setDocLoading] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch document list
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data: DocumentItem[] = await res.json();
      setDocuments(data);

      if (data.length > 0 && !activeDocumentId) {
        setActiveDocumentId(data[0].id as string);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      toast.error("Failed to load documents list.");
    } finally {
      setLoading(false);
    }
  }, [activeDocumentId]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 2. Fetch full document content when active ID changes
  const fetchDocumentDetail = useCallback(async (id: string) => {
    try {
      setDocLoading(true);
      const res = await fetch(`/api/documents/${id}`);
      if (!res.ok) throw new Error("Failed to fetch document detail");
      const data: FullDocument = await res.json();
      setCurrentDocument(data);
      setSaveStatus("saved");
    } catch (err) {
      console.error("Error fetching document detail:", err);
      toast.error("Failed to load document content.");
    } finally {
      setDocLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeDocumentId && (!currentDocument || currentDocument.id !== activeDocumentId)) {
      fetchDocumentDetail(activeDocumentId);
    }
  }, [activeDocumentId, currentDocument, fetchDocumentDetail]);

  // 3. Save document function
  const saveCurrentDocument = useCallback(
    async (docToSave: FullDocument) => {
      if (!docToSave || !docToSave.id) return;
      try {
        setSaveStatus("saving");
        const res = await fetch(`/api/documents/${docToSave.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: docToSave.title,
            markdownContent: docToSave.markdownContent,
            canvasState: docToSave.canvasState,
          }),
        });

        if (res.ok) {
          setSaveStatus("saved");
          setDocuments((prev) =>
            prev.map((d) =>
              d.id === docToSave.id ? { ...d, title: docToSave.title } : d
            )
          );
          toast.success("Document saved", { duration: 1500 });
        } else {
          setSaveStatus("unsaved");
          toast.error("Failed to save changes.");
        }
      } catch (err) {
        console.error("Error saving document:", err);
        setSaveStatus("unsaved");
        toast.error("Network error while saving.");
      }
    },
    []
  );

  // 4. Trigger auto-save debounce on changes
  const updateDocumentField = useCallback(
    (field: "title" | "markdownContent" | "canvasState", value: string) => {
      setCurrentDocument((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, [field]: value };

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

        setSaveStatus("unsaved");
        saveTimerRef.current = setTimeout(() => {
          saveCurrentDocument(updated);
        }, 2000);

        return updated;
      });
    },
    [saveCurrentDocument]
  );

  // 5. Create new document
  const createDocument = async () => {
    try {
      const res = await fetch("/api/documents", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create document");
      const newDoc: FullDocument = await res.json();

      setDocuments((prev) => [
        { id: newDoc.id, title: newDoc.title, updatedAt: newDoc.updatedAt },
        ...prev.filter((d) => d.id !== newDoc.id),
      ]);
      setCurrentDocument(newDoc);
      setActiveDocumentId(newDoc.id);
      setSaveStatus("saved");
      toast.success("New document created!");
    } catch (err) {
      console.error("Error creating document:", err);
      toast.error("Failed to create new document.");
    }
  };

  // 6. Rename document
  const renameDocument = async (id: string, newTitle: string) => {
    if (currentDocument && currentDocument.id === id) {
      updateDocumentField("title", newTitle);
    } else {
      try {
        await fetch(`/api/documents/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });
        setDocuments((prev) =>
          prev.map((d) => (d.id === id ? { ...d, title: newTitle } : d))
        );
        toast.success("Document renamed");
      } catch (err) {
        console.error("Error renaming document:", err);
        toast.error("Failed to rename document.");
      }
    }
  };

  // 7. Delete document
  const deleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        const remaining = documents.filter((d) => d.id !== id);
        setDocuments(remaining);
        if (activeDocumentId === id) {
          if (remaining.length > 0) {
            setActiveDocumentId(remaining[0].id as string);
          } else {
            setActiveDocumentId(null);
            setCurrentDocument(null);
          }
        }
        toast.info("Document deleted");
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Failed to delete document.");
    }
  };

  return {
    documents,
    activeDocumentId,
    setActiveDocumentId,
    currentDocument,
    loading,
    docLoading,
    saveStatus,
    updateDocumentField,
    createDocument,
    renameDocument,
    deleteDocument,
  };
}
