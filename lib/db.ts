import Dexie, { type EntityTable } from 'dexie';

export interface LocalDraft {
  id: string; // The entry UUID
  title: string;
  body: any; // TipTap JSON
  bodyText: string;
  mood: string | null;
  tags: string[];
  journalId: string;
  entryDate: string; // ISO string
  isLocked: boolean;
  updatedAt: number; // Timestamp for latest save
}

const db = new Dexie('NothinLocalDrafts') as Dexie & {
  drafts: EntityTable<
    LocalDraft,
    'id' // primary key "id" (for the uuid)
  >;
};

db.version(1).stores({
  drafts: 'id, journalId, updatedAt' // Primary key and indexed props
});

export { db };
