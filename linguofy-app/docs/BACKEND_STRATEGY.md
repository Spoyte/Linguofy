# Backend Strategy & Database Schema

## Goal
Transition from static JSON files to a relational database (Supabase/PostgreSQL) to enable:
1.  **Admin Dashboard**: Dynamic CRUD operations for content.
2.  **User Progress**: Persistent tracking across devices.
3.  **Scalability**: Easy addition of new languages and modules.

## 1. Database Schema (PostgreSQL)

### A. Content Tables (Managed by Admin)

**1. `languages`**
*   `code` (PK, text): 'es', 'en', 'fr'
*   `name` (text): 'Spanish'
*   `role` (text): 'target' or 'native'

**2. `modules`**
*   `id` (PK, uuid)
*   `order_index` (int): 1, 2, 3...
*   `title` (text): "Unit 1: Introductions"
*   `description` (text)
*   `level` (text): 'A1', 'A2'

**3. `lessons`** (Polymorphic: Songs or Standard)
*   `id` (PK, text): '1-1' (Manual ID for now to match file system)
*   `module_id` (FK -> modules.id)
*   `title` (text)
*   `type` (text): 'song', 'grammar', 'dialogue'
*   `style_genre` (text): 'Reggaeton', 'Classroom'
*   `content` (jsonb): Stores lyrics, dialogue script, or grammar rules.
    *   *Why JSONB?* Flexible schema for different lesson types.
*   `audio_url` (text)

**4. `exercises`**
*   `id` (PK, uuid)
*   `lesson_id` (FK -> lessons.id)
*   `type` (text): 'multiple_choice', 'fill_blank', 'match_pair'
*   `data` (jsonb):
    *   `question` (text)
    *   `options` (array)
    *   `answer` (text)
    *   `media_url` (text, optional for picture/audio questions)

### B. User Tables

**5. `profiles`** (Extends Supabase Auth)
*   `id` (PK, FK -> auth.users)
*   `username` (text)
*   `native_language` (FK -> languages.code)
*   `xp` (int): Total experience points.

**6. `user_progress`**
*   `user_id` (FK -> profiles.id)
*   `lesson_id` (FK -> lessons.id)
*   `status` (text): 'locked', 'started', 'completed'
*   `score` (int): Best score (0-100).
*   `last_played_at` (timestamp)

## 2. Migration Plan

1.  **Setup**: Initialize Supabase project.
2.  **Schema**: Run SQL scripts to create tables.
3.  **Data Import**: Write a node script (`scripts/seed_db.js`) to read existing `public/data/songs/*.json` and insert rows into `modules`, `lessons`, and `exercises`.
4.  **App Update**:
    *   Replace `src/data/courseData.js` with a Supabase hook `usecourseData()`.
    *   Update `SongEditor` to write to DB instead of console.log.

## 3. Auth Strategy
*   **Providers**: Google (easiest), Email/Password.
*   **RLS (Row Level Security)**:
    *   `public` can READ `content` tables.
    *   `admin` role can WRITE `content` tables.
    *   `authenticated` users can READ/WRITE their own `user_progress`.
