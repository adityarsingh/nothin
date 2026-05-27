CREATE INDEX "Entry_bodyText_idx" ON "Entry" USING GIN (to_tsvector('english', "bodyText"));
