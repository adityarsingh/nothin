-- Drop the previous index
DROP INDEX IF EXISTS "Entry_bodyText_idx";

-- Create the new composite GIN index
CREATE INDEX "Entry_search_idx" ON "Entry" USING GIN (to_tsvector('english', coalesce("title", '') || ' ' || coalesce("bodyText", '')));
