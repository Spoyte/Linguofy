# Backend Strategy & Database Schema (Supabase)

## Goal
Transition from static JSON files to a relational database to enable dynamic content management and user progress tracking.

## 1. Database Schema

### A. Content Tables (Managed by Admin)

**1. `modules`**
*   `id` (PK, uuid)
*   `order_index` (int): Sort order (1-8).
*   `title` (text): "Unit 1: Introductions"
*   `description` (text)
*   `level` (text): 'A1', 'A2'

**2. `lessons`** (Songs/Lessons)
*   `id` (PK, text): '1-1' (Preserving the readable ID is useful for URL routing).
*   `module_id` (FK -> modules.id)
*   `title` (text)
*   `type` (text): 'song', 'dialogue', 'grammar'
*   `status` (text): 'draft', 'audio_missing', 'published'
*   `content` (jsonb): 
    *   Songs: `{ "lyrics_mixed": "...", "lyrics_pure": "..." }`
    *   Dialogue: `{ "script": [...] }`
*   `audio_url_mixed` (text)
*   `audio_url_pure` (text)

**3. `exercises`** (Polymorphic)
*   `id` (PK, uuid)
*   `lesson_id` (FK -> lessons.id)
*   `order_index` (int): To handle drag-and-drop reordering.
*   `type` (text): 'multiple_choice', 'fill_blank', 'match_pair', 'scramble'
*   `data` (jsonb): Stores the specific fields per type.
    *   **Multiple Choice**: `{ "question": "...", "options": [...], "answer": "..." }`
    *   **Fill Blank**: `{ "text_with_holes": "El {{perro}} ladra.", "hints": [...] }`
    *   **Matching**: `{ "pairs": [["cat", "gato"], ["dog", "perro"]] }`

### B. User Tables

**4. `profiles`**
*   `id` (PK, FK -> auth.users)
*   `username` (text)
*   `xp` (int): Total experience points.
*   `streak` (int): Daily streak.

**5. `user_progress`**
*   `user_id` (FK -> profiles.id)
*   `lesson_id` (FK -> lessons.id)
*   `status` (text): 'completed'
*   `score` (int): 0-100
*   `completed_at` (timestamp)

## 2. Migration Plan (JSON -> DB)

We need a one-time script (`scripts/seed_db.js`) to hydrate the production DB.

1.  **Parse `courseData.js`**: Extract Modules and Lesson Metadata (Title, Status).
    *   Insert into `modules` and `lessons`.
2.  **Parse `public/data/songs/*.json`**: Extract Lyrics and Exercises.
    *   Update `lessons.content` with lyrics.
    *   Loop through `exercises` array and insert into `exercises` table, mapping fields to `data` jsonb.

## 3. Implementation Steps (Phase 2)

- [ ] **Step 1**: Create Supabase Project & Tables (SQL provided).
- [ ] **Step 2**: Run `seed_db.js` to migrate existing 24 lessons.
- [ ] **Step 3**: Update `Linguofy App` to use `supabase-js`.
    -   Create `useSongs()` hook (replaces `courseData` import).
    -   Create `useExercises(lessonId)` hook (replaces fetch JSON).
- [ ] **Step 4**: Switch `Admin Dashboard` to write to DB.

## 4. Security (RLS)
*   **Public**: READ access to `modules`, `lessons`, `exercises`.
*   **Admin**: WRITE access to all Content tables.
*   **User**: READ/WRITE access to own `profiles` and `user_progress`.
