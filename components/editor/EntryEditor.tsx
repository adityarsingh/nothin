"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import { db, LocalDraft } from "../../lib/db";
import EditorHeader from "./EditorHeader";
import FloatingToolbar from "./FloatingToolbar";
import MetadataPanel from "./MetadataPanel";
import ConfirmDialog from "../shared/ConfirmDialog";
import { useToast, ToastContainer } from "../shared/Toast";

import { useRouter } from "next/navigation";

/** Shape of server-fetched entry data passed from edit page */
interface EntryInitialData {
  title: string;
  body: any; // TipTap JSON
  bodyText: string;
  mood: string | null;
  tags: string[];
  journalId: string;
  entryDate: string; // ISO string
  isLocked: boolean;
}

interface EntryEditorProps {
  initialId?: string; // If provided, edit existing. If undefined, new.
  journals: { id: string; name: string }[];
  defaultJournalId?: string; // Used only for new entries (from ?journalId= param)
  initialData?: EntryInitialData; // Used only for edit mode
}

export default function EntryEditor({ initialId, journals, defaultJournalId, initialData }: EntryEditorProps) {
  const isEditMode = !!initialId && !!initialData;
  const [draftId] = useState(initialId || crypto.randomUUID());

  /**
   * Seed the initial draft state. For edit mode, use the server data.
   * For new entries, use defaultJournalId (from ?journalId= param) or the
   * first journal as a fallback.
   */
  const buildInitialDraft = (): LocalDraft => {
    if (initialData) {
      return {
        id: draftId,
        title: initialData.title,
        body: initialData.body,
        bodyText: initialData.bodyText,
        mood: initialData.mood,
        tags: initialData.tags,
        journalId: initialData.journalId,
        entryDate: initialData.entryDate,
        isLocked: initialData.isLocked,
        updatedAt: 0, // sentinel: will be overridden by local draft if one is newer
      };
    }
    return {
      id: draftId,
      title: "",
      body: null,
      bodyText: "",
      mood: null,
      tags: [],
      journalId: defaultJournalId || (journals.length > 0 ? journals[0].id : ""),
      entryDate: new Date().toISOString(),
      isLocked: false,
      updatedAt: Date.now(),
    };
  };

  const [draft, setDraft] = useState<LocalDraft>(buildInitialDraft);
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Unsaved changes">("Saved");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const lastSavedDraftRef = useRef<string>("");
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();

  // Initialize TipTap with empty content — content will be injected once data
  // is resolved (either from local IndexedDB or from initialData) in the effect below.
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
      CharacterCount,
      Underline,
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setDraft(prev => ({
        ...prev,
        body: editor.getJSON(),
        bodyText: editor.getText(),
        updatedAt: Date.now()
      }));
      setSaveStatus("Unsaved changes");
    },
  });

  /**
   * Load content into TipTap once the editor is ready.
   *
   * Strategy:
   * - EDIT mode: server data (initialData) is always authoritative. Any stale
   *   local draft for this entry is deleted to prevent it from clobbering fresh
   *   server content on the next render. The autosave interval will persist
   *   in-progress work within the session.
   * - NEW entry mode: restore from local IndexedDB draft if one exists (the
   *   user may have been mid-composition), otherwise start blank.
   */
  useEffect(() => {
    if (!editor) return;

    const loadDraft = async () => {
      let resolved: LocalDraft;

      if (isEditMode) {
        // Always start from server data. Delete any stale local draft so it
        // cannot win on a subsequent render (e.g. hot-reload, back-navigation).
        await db.drafts.delete(draftId);
        resolved = buildInitialDraft();
      } else {
        // New entry: restore in-progress local draft if present.
        const localDraft = await db.drafts.get(draftId);
        resolved = localDraft ?? buildInitialDraft();
      }

      setDraft(resolved);

      if (!editor.isDestroyed) {
        editor.commands.setContent(resolved.body || "");
      }

      setIsLoaded(true);
      lastSavedDraftRef.current = JSON.stringify(resolved);
    };

    loadDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftId, editor]);

  // Save draft locally (IndexedDB)
  const saveDraft = useCallback(async () => {
    if (!isLoaded) return;
    const currentDraftStr = JSON.stringify(draft);
    if (currentDraftStr === lastSavedDraftRef.current) return; // No changes

    setSaveStatus("Saving...");
    try {
      await db.drafts.put({ ...draft, updatedAt: Date.now() });
      lastSavedDraftRef.current = currentDraftStr;
      setSaveStatus("Saved");
    } catch (error) {
      console.error("Failed to save draft", error);
      setSaveStatus("Unsaved changes");
    }
  }, [draft, isLoaded]);

  // Publish (new) or Save Changes (edit) to server
  const publishEntry = async () => {
    if (!draft.journalId) {
      alert("Please select a journal before publishing.");
      return;
    }

    setIsPublishing(true);
    try {
      const payload = {
        title: draft.title || "Untitled Entry",
        body: draft.body || {},
        mood: draft.mood,
        tags: draft.tags,
        people: [],
        place: null,
        journalId: draft.journalId,
        entryDate: draft.entryDate,
        isLocked: draft.isLocked,
        isPinned: false,
      };

      const response = isEditMode
        ? await fetch(`/api/entries/${initialId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/entries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!response.ok) {
        throw new Error(isEditMode ? "Failed to save entry" : "Failed to publish entry");
      }

      // Clean up local draft
      await db.drafts.delete(draftId);

      router.push("/today");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(isEditMode ? "Something went wrong while saving." : "Something went wrong while publishing.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Delete entry (edit mode only)
  const deleteEntry = async () => {
    if (!initialId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/entries/${initialId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await db.drafts.delete(draftId);
      setConfirmDeleteOpen(false);
      addToast("Entry deleted");
      setTimeout(() => { router.push("/today"); router.refresh(); }, 800);
    } catch {
      addToast("Failed to delete entry. Please try again.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Autosave every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft();
    }, 5000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  // Keyboard shortcut: Cmd/Ctrl + S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveDraft();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveDraft]);

  const updateDraftMetadata = (updates: Partial<LocalDraft>) => {
    setDraft(prev => ({ ...prev, ...updates, updatedAt: Date.now() }));
    setSaveStatus("Unsaved changes");
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-muted">Loading editor...</div>;
  }

  const selectedJournal = journals.find(j => j.id === draft.journalId);

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-screen bg-background text-text">
        {/* Main Content */}
        <main className="flex-1 flex flex-col relative max-w-full">
          <EditorHeader
            journalName={selectedJournal?.name || "No Journal"}
            saveStatus={saveStatus}
            onPublish={publishEntry}
            isPublishing={isPublishing}
            isEditMode={isEditMode}
            onDelete={isEditMode ? () => setConfirmDeleteOpen(true) : undefined}
          />

          <div className="flex-1 max-w-[720px] w-full mx-auto p-6 md:p-12 relative flex flex-col">
            <input
              type="text"
              value={draft.title}
              onChange={(e) => updateDraftMetadata({ title: e.target.value })}
              placeholder="Entry Title (Optional)"
              className="w-full bg-transparent font-display text-4xl mb-8 focus:outline-none placeholder:text-muted/50"
            />

            <div className="flex-1 relative cursor-text min-h-[300px]" onClick={() => editor?.commands.focus()}>
              <FloatingToolbar editor={editor} />
              <EditorContent editor={editor} />
            </div>

            <div className="absolute bottom-4 right-4 text-xs text-muted">
              {editor?.storage.characterCount.words()} words
            </div>
          </div>
        </main>

        {/* Metadata Panel */}
        <aside className="w-full md:w-80 bg-surface border-t md:border-t-0 md:border-l border-border p-6 overflow-y-auto">
          <MetadataPanel
            draft={draft}
            updateDraft={updateDraftMetadata}
            journals={journals}
          />
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete this entry?"
        description="This cannot be undone. The entry will be permanently removed."
        confirmLabel="Delete"
        onConfirm={deleteEntry}
        onCancel={() => setConfirmDeleteOpen(false)}
        isLoading={isDeleting}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </>
  );
}
