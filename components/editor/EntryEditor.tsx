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

import { useRouter } from "next/navigation";

interface EntryEditorProps {
  initialId?: string; // If provided, edit existing. If undefined, new.
  journals: { id: string; name: string }[];
  defaultJournalId?: string;
}

export default function EntryEditor({ initialId, journals, defaultJournalId }: EntryEditorProps) {
  const [draftId] = useState(initialId || crypto.randomUUID());
  const [draft, setDraft] = useState<LocalDraft>({
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
  });
  
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Unsaved changes">("Saved");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const lastSavedDraftRef = useRef<string>("");
  const router = useRouter();

  // Initialize Editor
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
    content: draft.body || "",
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

  // Load existing draft from local DB
  useEffect(() => {
    const loadDraft = async () => {
      const existing = await db.drafts.get(draftId);
      if (existing) {
        setDraft(existing);
        if (editor && !editor.isDestroyed) {
          editor.commands.setContent(existing.body);
        }
      }
      setIsLoaded(true);
      lastSavedDraftRef.current = JSON.stringify(existing || draft);
    };
    if (editor) {
      loadDraft();
    }
  }, [draftId, editor]);

  // Save Function (Local)
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

  // Publish to Server
  const publishEntry = async () => {
    if (!draft.journalId) {
      alert("Please select a journal before publishing.");
      return;
    }
    
    setIsPublishing(true);
    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title || "Untitled Entry",
          body: draft.body || {},
          mood: draft.mood,
          tags: draft.tags,
          people: [], // Extend if person tagging is added to UI
          place: null, // Extend if location is added to UI
          journalId: draft.journalId,
          entryDate: draft.entryDate,
          isLocked: draft.isLocked,
          isPinned: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish entry");
      }

      // Cleanup draft
      await db.drafts.delete(draftId);
      
      // Redirect
      router.push("/today");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while publishing.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Autosave interval
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft();
    }, 5000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  // Keyboard shortcut Cmd/Ctrl + S
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
    <div className="flex flex-col md:flex-row min-h-screen bg-background text-text">
      {/* Main Content */}
      <main className="flex-1 flex flex-col relative max-w-full">
        <EditorHeader 
          journalName={selectedJournal?.name || "No Journal"} 
          saveStatus={saveStatus} 
          onPublish={publishEntry}
          isPublishing={isPublishing}
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
  );
}
