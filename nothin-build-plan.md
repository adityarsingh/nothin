# Nothin — Full Build Plan + Antigravity Prompts
### Step-by-step webapp construction guide · May 2026

---

## How to Use This Document

This is a sequenced, sprint-by-sprint build plan for Nothin, the privacy-first journaling webapp. Each phase contains:

1. **What to build** — the deliverable
2. **Why this order** — architectural reasoning
3. **Antigravity prompt** — the exact prompt to run (copy-paste ready)
4. **What to verify** before moving to the next step

Use this document as your engineering brief inside Antigravity. Paste the PRD (`nothin-prd.md`) as context first, then run each prompt in sequence. **Never run more than one phase at a time** — Antigravity performs best with focused, scoped tasks.[cite:48][cite:52]

---

## Before You Start — Context Setup

### Step 0: Feed the PRD as context

In Antigravity, before any prompt, paste the full contents of `nothin-prd.md` as a file or context block and run this primer:

```
I am building a webapp called Nothin — a privacy-first journaling app. 
I have attached the PRD as context. Read it fully before we begin.
Do not generate any code yet. Confirm you understand the product, 
tech stack, and phased feature plan. Then wait for my instructions.
```

This primes the agent without letting it run ahead. Always review the Artifact before letting it execute.[cite:52]

---

## Recommended Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR, PWA support, easy auth integration, great ecosystem |
| Styling | Tailwind CSS v4 | Fast UI, consistent design tokens |
| Editor | TipTap | Headless rich text, Markdown-compatible, extensible |
| Auth | Clerk or Lucia Auth | Passkey support, session management, social login |
| Database | PostgreSQL (via Supabase) | Relational, full-text search, hosted, generous free tier |
| ORM | Prisma | Type-safe, migration support |
| Local drafts | Dexie.js (IndexedDB) | Offline-first drafts before server sync |
| File uploads | Supabase Storage or Cloudflare R2 | S3-compatible, privacy-friendly |
| Search | PostgreSQL tsvector | No extra infra needed for V1 |
| Deployment | Vercel | Zero-config, great for Next.js |
| Payments | Razorpay | India-first, INR billing |

---

## Full Build Plan — 8 Phases

---

### Phase 1 — Project Scaffold + Design System
**Duration:** 1–2 days  
**Goal:** Get a running Next.js app with design tokens, fonts, light/dark mode, and base layout ready. No features yet — just the shell.

**Why first:** Every component you build after this depends on the design system. Getting this right early prevents inconsistency later.[cite:47][cite:53]

#### Antigravity Prompt 1A — Project Setup

```
Create a new Next.js 15 app (App Router) called "nothin" with the following setup:

Tech stack:
- Next.js 15 with TypeScript
- Tailwind CSS v4
- ESLint + Prettier configured

Folder structure:
/app         → Next.js App Router pages
/components  → Reusable UI components
/lib         → Utility functions, DB client, auth helpers
/styles      → Global CSS and Tailwind config
/prisma      → Database schema
/public      → Static assets

Environment files:
- Create .env.local with placeholders for: DATABASE_URL, NEXT_PUBLIC_APP_URL, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- Create .env.example with the same keys but empty values

Deliverable:
- Running app at localhost:3000 with a blank white page that renders "Nothin is loading"
- All config files in place
- README.md with setup instructions
```

#### Antigravity Prompt 1B — Design System

```
Build the Nothin design system in Tailwind CSS v4 + global CSS.

Brand personality: calm, private, minimal. Like a well-made notebook — not a productivity dashboard.

Design tokens to define:
- Font: 'Instrument Serif' (Google Fonts) for display headings, 'Geist' (Vercel) for body
- Colors:
  Light mode: background #F7F6F2, surface #F9F8F5, text #28251D, muted text #6F6D67, 
  primary accent #01696F, border #D4D1CA
  Dark mode: background #171614, surface #1C1B19, text #CDCCCA, muted text #97958F,
  primary accent #4F98A3, border #393836
- Spacing scale: 4px base unit, tokens for 4/8/12/16/20/24/32/40/48/64px
- Border radius: sm 6px, md 8px, lg 12px, xl 16px, full 9999px
- Shadow: sm, md, lg — warm-tinted, not pure black

Global CSS requirements:
- Light/dark mode using data-theme="light/dark" on <html>
- CSS custom properties for all tokens
- Base styles: box-sizing, font smoothing, selection color, focus ring

Deliverable:
- globals.css with all tokens and base styles
- tailwind.config.ts referencing all tokens
- A design-test page at /design-test showing: all surface layers, type specimen, color palette, button variants (primary, secondary, ghost), a sample card, a form input
- Theme toggle working on /design-test
```

**Verify before moving on:** Design test page looks polished. Light and dark mode both work. Fonts load correctly. All tokens are visible and distinct.

---

### Phase 2 — Auth + Database Schema
**Duration:** 2–3 days  
**Goal:** User signup, login, and a complete Prisma database schema that covers all V1 and V2 features.

**Why second:** Every other feature depends on the user model and auth state. Getting the schema right now avoids painful migrations later.[cite:53]

#### Antigravity Prompt 2A — Database Schema

```
Design and create the complete Prisma schema for Nothin journaling app.

Models required:

User
- id, email, name, createdAt, updatedAt
- hashedPassword (nullable — for passkey users)
- plan (enum: FREE, PRO, PRO_PLUS)
- settings (relation to UserSettings)

UserSettings
- userId, theme (light/dark/system), reminderEnabled, reminderTime, defaultJournalId

Journal
- id, userId, name, description, color, icon, isArchived, createdAt, updatedAt
- entries (relation)

Entry
- id, journalId, userId, title, body (rich text JSON), bodyText (plain text for search)
- mood (enum: VERY_LOW, LOW, NEUTRAL, HIGH, VERY_HIGH, nullable)
- tags (relation to Tag through EntryTag)
- people (relation to Person through EntryPerson)
- place (string, nullable)
- mediaAttachments (relation)
- isLocked, isPinned, isFavorite
- entryDate (the actual date — supports backdating)
- createdAt, updatedAt

Tag
- id, userId, name, color, entryCount

EntryTag (join table)
- entryId, tagId

Person
- id, userId, name
- entries (relation through EntryPerson)

EntryPerson (join table)
- entryId, personId

MediaAttachment
- id, entryId, userId, type (IMAGE, VOICE, FILE), url, filename, size, mimeType, createdAt

ExportLog
- id, userId, exportType, createdAt

Requirements:
- Add full-text search index on Entry.bodyText using PostgreSQL tsvector
- All foreign keys with proper cascade deletes
- Add a default "Personal" journal seeded on user creation

Deliverable:
- Complete prisma/schema.prisma file
- Initial migration SQL
- Seed script that creates a test user with one journal and two sample entries
```

#### Antigravity Prompt 2B — Auth Setup

```
Implement authentication in Nothin using Clerk.

Requirements:
- Install and configure @clerk/nextjs
- Protect all /app/* routes (require login)
- Public routes: /, /login, /signup, /privacy, /design-test
- After signup: redirect to /onboarding
- After login: redirect to /today (the home view)

Middleware:
- Create middleware.ts using Clerk's clerkMiddleware with route matchers

Onboarding flow (/onboarding):
- Step 1: "What's your name?" — pre-filled from Clerk
- Step 2: "Name your first journal" — default suggestion "Personal"  
- Step 3: "Want a daily reminder?" — optional time picker
- After completing: create User + Journal records in DB, redirect to /today

Deliverable:
- Working login, signup, and onboarding pages
- Middleware protecting app routes
- API route POST /api/user/create that creates DB records on first login
- User profile stored in both Clerk and local PostgreSQL
```

**Verify before moving on:** Can sign up, complete onboarding, and arrive at /today. User and Journal rows exist in DB. Logout and login again works.

---

### Phase 3 — Core Editor + Entry Creation
**Duration:** 3–4 days  
**Goal:** The heart of the product — a beautiful, fast, keyboard-friendly journal editor.

**Why third:** This is the #1 job of the product. Everything else (search, review, tags) depends on good entries existing in the database.[cite:43][cite:48]

#### Antigravity Prompt 3A — Editor Component

```
Build the Nothin journal entry editor using TipTap.

Install: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-placeholder, @tiptap/extension-character-count

Editor requirements:
- Rich text: bold, italic, underline, bullet list, numbered list, blockquote, heading (H2/H3 only)
- Minimal floating toolbar — appears on text selection only (not a fixed top bar)
- Markdown shortcuts: **bold**, *italic*, ## heading, - bullet, > blockquote
- Placeholder text: "What's on your mind?" (disappears on focus)
- Word count shown in bottom-right corner (subtle, muted color)
- Autosave: save draft to IndexedDB every 5 seconds using Dexie.js
- Keyboard shortcut Cmd/Ctrl+S to force-save

Entry metadata panel (right side on desktop, below editor on mobile):
- Entry date picker with calendar (supports backdating — default today)
- Mood picker: 5 options with emoji icons (😞 😔 😐 😊 😄) and optional text label
- Tags input: type to add tag, autocomplete from existing user tags, press Enter to add
- Journal selector: dropdown showing user's journals
- "Lock this entry" toggle with lock icon

Layout:
- Centered content column, max-width 720px
- Generous padding, distraction-free
- Entry title input above editor (large, display font, optional)
- Clean header: back button (left), journal name (center), save status (right)

Deliverable:
- /app/entry/new — new entry page
- /app/entry/[id]/edit — edit existing entry
- EntryEditor component (reusable)
- Autosave badge: "Saved", "Saving…", "Unsaved changes"
```

#### Antigravity Prompt 3B — Save Entry API

```
Create the API layer for saving and updating journal entries in Nothin.

API routes needed:

POST /api/entries
- Accepts: title, body (TipTap JSON), bodyText (extracted plain text), mood, tags[], people[], place, journalId, entryDate, isLocked, isPinned
- Creates Entry in DB
- Creates or connects Tags (upsert by name per user)
- Returns created entry with id

PATCH /api/entries/[id]
- Same fields as POST, updates existing entry
- Only allows update if entry belongs to authenticated user

GET /api/entries/[id]
- Returns full entry with tags, people, journal name
- Blocks response if isLocked=true and no unlock code provided (locked entries = front-end UX only for V1)

DELETE /api/entries/[id]
- Soft-deletes (add deletedAt field to schema) — not permanent
- Returns 204

Requirements:
- All routes protected by Clerk auth
- Input validation using Zod
- Error handling with appropriate HTTP status codes
- Extract plain text from TipTap JSON for bodyText field (write a utility function)

Deliverable:
- All 4 API routes working
- Zod schemas for all inputs
- Utility: extractPlainText(tipTapJSON) → string
- Manual test script (curl or .http file) for each route
```

**Verify before moving on:** Can create an entry, add mood and tags, save it, and retrieve it from the database.

---

### Phase 4 — Timeline, Calendar, and Entry List
**Duration:** 2–3 days  
**Goal:** Users can browse their entries chronologically and feel the passage of time in their journaling.

#### Antigravity Prompt 4

```
Build the timeline and calendar views for Nothin.

Pages to build:

1. /today — Home view
   - Greeting with user's name and current date
   - "Write today" button → /app/entry/new
   - Today's entries list (if any exist)
   - "On this day" module: show entries from same date in previous years (if any)
   - Last 5 recent entries with title/preview snippet, mood emoji, date

2. /timeline — Full entry timeline
   - Grouped by: Day, Week, Month (toggle at top)
   - Each entry card shows: title or first 100 chars, mood icon, tags (max 3), date, journal name
   - Infinite scroll or paginated (20 entries per page)
   - Empty state: "No entries yet — start writing"

3. /calendar — Calendar view
   - Full month calendar grid
   - Days with entries show a subtle dot and the mood color
   - Click a day → shows all entries from that day in a side panel
   - Previous/next month navigation

Shared components:
- EntryCard — used in both timeline and today
- MoodDot — small colored circle representing mood
- TagPill — small rounded tag chip

API routes needed:
GET /api/entries?journalId=&page=&limit=&groupBy=
GET /api/entries/calendar?month=&year=  (returns {date: string, count: number, moods: string[]}[])
GET /api/entries/today  (returns today's entries + "on this day" entries)

Requirements:
- All views respect selected journal filter (stored in URL param or context)
- Mobile responsive: timeline becomes single column, calendar compacts
- Skeleton loaders while data loads (shimmer effect)
```

**Verify before moving on:** Timeline shows entries grouped by day. Calendar shows dots on days with entries. Today view shows greeting and recent entries.

---

### Phase 5 — Search and Filters
**Duration:** 2 days  
**Goal:** Users can find any entry fast. This is critical for long-term retention.

#### Antigravity Prompt 5

```
Build full-text search and filtering for Nothin entries.

Search page: /search

Search input:
- Auto-focus on page load
- Real-time search as user types (debounced 300ms)
- Keyboard shortcut Cmd/Ctrl+K opens search from anywhere (command palette style)

Search results:
- Show matching entries with highlighted keyword in snippet
- Show entry date, journal, mood, tags
- Click → opens entry reader

Filter panel (collapsible sidebar on desktop, bottom sheet on mobile):
- Journal: multi-select checkboxes
- Mood: multi-select (Very Low / Low / Neutral / High / Very High)
- Tags: multi-select with search
- Date range: from / to date pickers
- Sort: newest first, oldest first, most words, most recently edited
- Has media: toggle
- Pinned only: toggle

API route:
GET /api/search?q=&journalId=&mood=&tags=&from=&to=&sort=&hasMedia=&pinnedOnly=&page=

Implementation:
- Use PostgreSQL full-text search on bodyText and title columns
- Use tsvector for ranking
- Support AND, OR, phrase matching for the query string
- Return results with highlighted snippet (use ts_headline)
- Pagination: 20 results per page

Requirements:
- Empty search state: show recent entries + suggested tags
- No results state: "Nothing found for '[query]'" with suggestion to broaden filters
- Search works across all journals or filtered to selected journal
```

**Verify before moving on:** Searching for a word that exists in an entry returns that entry. Filters narrow down results correctly.

---

### Phase 6 — Privacy Center + Settings
**Duration:** 1–2 days  
**Goal:** Make privacy visible and trustworthy. This is a key brand differentiator for Nothin.

#### Antigravity Prompt 6

```
Build the Privacy Center and Settings pages for Nothin.

/settings/privacy — Privacy Center page

Sections to build:
1. Storage overview
   - "Your entries are stored encrypted on our servers"
   - Show: total entries, total words, storage used (KB/MB)
   - Visual: simple bar showing storage used vs limit (free tier cap)

2. Active sessions
   - List of devices with: device name, browser, last active time, IP (masked)
   - "Revoke" button on each session (except current)
   - "Sign out all devices" button

3. Export your data
   - Export options: 
     a. Export all entries as Markdown ZIP
     b. Export all entries as JSON
     c. Export single journal (dropdown to select journal)
   - "Request export" button → triggers background job → sends download link to email
   - For V1, generate the ZIP on demand and return as download

4. Delete your data
   - "Delete a journal" — dropdown, confirm dialog, soft-delete
   - "Delete all entries" — confirm dialog with typing "DELETE" to confirm
   - "Delete my account" — full account deletion, confirm by typing email address
   - All deletions: 30-day grace period, user notified by email

/settings/general — General settings
- Display name
- Email (read-only, managed by Clerk)
- Default journal selector
- Theme: light / dark / system
- Accent color: 5 options (teal, sage, sand, slate, rose)

/settings/reminders — Reminder settings
- Enable/disable daily reminder
- Time picker (12h or 24h based on locale)
- Reminder channel: browser notification / email
- "Test reminder" button

API routes needed:
GET /api/user/storage-stats
GET /api/sessions
DELETE /api/sessions/[id]
POST /api/export (generates and returns ZIP download)
DELETE /api/user/entries (delete all)
DELETE /api/user/account

Requirements:
- All destructive actions require explicit confirmation
- Export generates a proper ZIP with one .md file per entry
- Settings changes save immediately (no save button — use optimistic updates)
```

**Verify before moving on:** Export downloads a real ZIP with Markdown files. Session list shows current session. Deleting a test journal works.

---

### Phase 7 — Reflection Layer (Weekly + Monthly Review)
**Duration:** 3–4 days  
**Goal:** Turn Nothin from storage into insight. This is the primary V2 differentiator.

#### Antigravity Prompt 7

```
Build the weekly and monthly reflection features for Nothin.

/reflections — Reflection hub

Weekly Review component (auto-generated each Sunday):
- Mood trend: line chart showing mood score (1–5) across the 7 days
- Most-used tags this week: shown as tag pills with count
- Most active writing day: highlighted day of the week
- Entry count and total words written
- 3 reflection prompts based on the week's content:
  - If mood trended down: "What felt heavy this week?"
  - If mood trended up: "What lifted your spirits?"
  - If a tag appeared 3+ times: "You kept writing about [tag]. What does that mean to you?"
- Each prompt has a "Write response" button → opens new entry with prompt pre-filled

Monthly Review (generated on 1st of each month):
- Month title: "Your [Month] in Nothin"
- Stats: entries written, total words, journaling days, longest streak
- Mood distribution: donut chart (5 mood segments)
- Top 5 tags cloud
- Top person mentioned (if any)
- One highlighted entry: user picks from 3 auto-suggested "meaningful" entries (longest + most-tagged)
- Option to write a monthly summary entry

Memory Resurfacing (shown on /today):
- "On this day" — entries from same date last year, 2 years ago
- "You kept writing about…" — tag appearing 5+ times in last 30 days
- Show one resurfaced entry per session (not every load — use sessionStorage flag)

API routes:
GET /api/reflections/weekly?weekStart= (ISO date)
GET /api/reflections/monthly?month=&year=
GET /api/reflections/memory-resurface

Charts:
- Use Recharts for mood trend line chart and monthly donut chart
- Match chart colors to the Nothin design system tokens
- All charts responsive and work in dark mode

Requirements:
- If no entries exist for a period: show empty state "No entries for this week yet"
- Weekly review is dismissible (stored in UserSettings.dismissedWeeklyReviews array)
- All prompts feel warm and non-judgmental — never preachy
```

**Verify before moving on:** Weekly review shows correct mood trend and tags. Monthly review stats are accurate. Memory resurfacing shows real past entries.

---

### Phase 8 — Landing Page + Deployment
**Duration:** 1–2 days  
**Goal:** Public-facing homepage and the app live on a real URL.

#### Antigravity Prompt 8A — Landing Page

```
Build the Nothin public landing page at /.

Design direction: calm, minimal, premium. Like a well-made notebook brand, not a SaaS template.
No gradient blobs, no icons in colored circles, no centered-everything layout.

Sections:

1. Hero
   - Left-aligned headline: "Nothing to hide. Everything to remember."
   - Subheading (max 2 lines): "A private journaling space that helps you write clearly, find anything, and understand yourself over time."
   - CTA button: "Start writing free"
   - Secondary link: "See how it works"
   - Right side: a clean mockup of the editor interface (screenshot or illustrated)

2. Three key promises (asymmetric layout, not identical 3-column grid)
   - Private by design: "Your entries belong to you. No ads, no AI reading your thoughts without permission."
   - Write and find: "Full-text search, tags, moods, and a calendar — so your archive never becomes a black hole."
   - Reflect over time: "Weekly reviews and memory resurfacing turn your journal into a window into your own patterns."

3. Feature highlight — the editor
   - Split layout: left is description, right is an animated mockup of the editor
   - Focus on: blank page mode, guided prompts, autosave

4. Pricing
   - Three tiers: Free, Pro (₹299/mo), Pro+ (₹599/mo)
   - Feature list for each tier
   - Annual plan toggle showing discounted price

5. Privacy section
   - "Built around your trust"
   - Short explainer: what is stored, how it's encrypted, how to delete everything
   - Link to full Privacy Center

6. Footer
   - Logo + tagline
   - Links: Changelog, Privacy Policy, Terms, GitHub (if open source)

Requirements:
- Mobile responsive
- Light/dark mode
- Performance: lazy-load images, no blocking scripts
- No stock photos — use illustrated UI mockups or abstract minimal visuals
- CTA buttons link to /signup
```

#### Antigravity Prompt 8B — Deployment Setup

```
Prepare Nothin for deployment to Vercel.

Tasks:
1. Vercel configuration
   - Create vercel.json with correct build settings for Next.js 15
   - Set up environment variable documentation

2. Database
   - Confirm Prisma is configured for Supabase PostgreSQL connection pooling
   - Run production migration command
   - Verify seed data works against production DB

3. PWA setup
   - Add next-pwa or equivalent
   - Create manifest.json with: name "Nothin", short_name "Nothin", icons at 192px and 512px, theme_color matching primary teal, display "standalone"
   - Add offline fallback page (/offline.html) with minimal message

4. Performance checklist
   - Ensure all images have width, height, loading="lazy"
   - Add font preconnect tags in layout.tsx
   - Enable Next.js image optimization

5. SEO
   - Add metadata to layout.tsx: title, description, OG image
   - Add robots.txt
   - Add sitemap.xml (public pages only — / and /pricing)

Deliverable:
- App deployable to Vercel with one click
- All env vars documented in .env.example
- PWA installable on Chrome desktop and mobile
```

---

## Full Phase Summary

| Phase | What ships | Estimated time |
|---|---|---|
| 1 | Project scaffold + design system | 1–2 days |
| 2 | Auth + database schema + onboarding | 2–3 days |
| 3 | Editor + entry save API | 3–4 days |
| 4 | Timeline, calendar, today view | 2–3 days |
| 5 | Search and filters | 2 days |
| 6 | Privacy center + settings | 1–2 days |
| 7 | Weekly/monthly reflections | 3–4 days |
| 8 | Landing page + Vercel deployment | 1–2 days |
| **Total** | **Full V1 + V2 core** | **~4 weeks** |

---

## Antigravity Prompting Rules

Follow these principles for every Antigravity session to get consistent, high-quality output.[cite:52][cite:43][cite:48]

1. **Always review the Artifact before executing.** Antigravity creates a plan before touching code. Read it, trim scope if needed, then approve.

2. **One phase at a time.** Never combine Prompt 3 and Prompt 4 into one session. Focused scope = better code.

3. **Feed context, not commands.** Start sessions with: "Here is what already exists: [summary]. Now build [specific thing]."

4. **Ask for test scripts.** After every API route, prompt: "Write a curl test script for each endpoint you just created."

5. **Name the files explicitly.** Say "create this in /components/editor/EntryEditor.tsx" — don't let Antigravity choose arbitrary names.

6. **Commit after each phase.** Before starting the next prompt, commit working code. Never build phase 4 on uncommitted phase 3 code.

7. **Design-then-code for UI.** For all UI prompts, add: "Show me the component structure and CSS plan as an Artifact before writing code."

8. **Ask for error handling.** Explicitly request: "Add proper loading, empty, and error states to every view."

---

## Post-Launch V2 Prompts (Reference)

Once V1 ships, the next Antigravity sessions for V2 features:

- **Media uploads:** "Add image and voice note upload to the EntryEditor. Use Supabase Storage. Show a media tray at the bottom of the editor."
- **Local-first mode:** "Implement a zero-knowledge encrypted mode using CryptoJS client-side encryption before entries are sent to the server."
- **AI insights:** "Build an opt-in AI Insights page that calls OpenAI API to summarize the last 30 days of entries. Never send locked entries to the API."
- **Importer:** "Build a Day One JSON importer that reads exported Day One journals and creates Nothin entries preserving date, mood, and tags."
