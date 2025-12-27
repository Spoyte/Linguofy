# Linguofy - Product Roadmap

## Phase 1: Prototype Completion (Current Focus)
Goal: A fully playable demo with a rich content library.
- [ ] **Audio Generation**: Generate and integrate audio for Units 2, 3, 4, 5 (A1 Completion).
- [ ] **Audio Generation**: Generate and integrate audio for Units 6, 7, 8 (A2 Start).
- [ ] **Persistence (MVP)**: Implement `localStorage` to save user progress (Completed lessons/exercises) locally so it survives refresh.
- [ ] **Deployment**: Live URL on Vercel.

## Phase 2: User Accounts & Backend
Goal: Enable multi-device learning and data persistence.
- [ ] **Backend Setup**: Set up Supabase (PostgreSQL + Auth).
- [ ] **Authentication**: Login/Signup (Email or Google).
- [ ] **Database Schema**:
    - `users` (id, email, xp)
    - `progress` (user_id, lesson_id, status, score)
- [ ] **Cloud Storage**: Move MP3s from `public/audio` to AWS S3 or Supabase Storage.

## Phase 3: Content Management (Admin Dashboard)
Goal: Empower admins to manage content without code changes.
- [ ] **Admin UI (`/admin`)**:
    - [ ] Local/Dummy Auth for Phase 1.
    - [ ] Resource Lists: Songs, Exercises, Prompts.
- [ ] **Editors**:
    - [ ] Song Metadata/Lyrics Editor.
    - [ ] Exercise Builder (Add/Edit Question Types).
    - [ ] Prompt Manager (Modify AI generation prompts).
- [ ] **Languages**: Add support for adding new target languages dynamically.

## Phase 4: Enhanced Learning (Gamification)
Goal: Increase retention and daily engagement.
- [ ] **Smart Review**: a "Daily Mix" playlist that interleaves new songs with old ones based on Spaced Repetition (SRS).
- [ ] **Streaks**: Daily activity counter.
- [ ] **XP System**: Earn points for listening and completing exercises.
- [ ] **Leaderboards**: Weekly leagues.

## Phase 4: Social & Expansion
Goal: Network effects and broader content.
- [ ] **Community Playlists**: Users can share their generated songs.
- [ ] **Multi-Language**: Add "English -> Spanish" or "French -> English" tracks.
- [ ] **Karaoke Mode**: Real-time lyric highlighting (needs time-stamped lyrics format like `.lrc`).

## Wishlist / Ideas
- **AI Conversation**: Chat with an AI character from the songs (e.g., the "Food Critic" from Lesson 7.2).
- **Voice Recognition**: Pronunciation exercises (Sing along and get rated).
- **Mobile App**: React Native or Capacitor wrap.
