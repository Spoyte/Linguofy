# Linguofy Task List

## Phase 1: Admin Dashboard ✅ COMPLETE

### 1.1 Foundation & Auth
- [x] Create `/admin` route with `AdminLayout`
- [x] Implement dummy auth (admin/admin → localStorage)
- [x] Protect admin routes (redirect if not authenticated)

### 1.2 Resource Management
- [x] **Song Manager**: List, search, status badges
- [x] **Song Editor**: Metadata, lyrics, audio paths
- [x] **Prompt Manager**: AI generation templates

### 1.3 Configuration
- [x] **Language Manager**: Target/Native language config
- [x] **Exercise Type Manager**: Quiz types config

### 1.4 Exercise Manager
- [x] **Global View**: `/admin/exercises` dashboard
- [x] **Exercise List**: Per-lesson exercise management
- [x] **Polymorphic Editor**: Quiz, Fill-blank, Matching forms

---

## Phase 2: Core App Features ✅ COMPLETE

### 2.1 User Persistence ✅
- [x] Create `useProgress` hook (localStorage)
- [x] Track completed lessons in `CourseMap`
- [x] Show progress in `LessonView`

### 2.2 UI Polish ✅
- [x] Add "Locked" state for future modules
- [x] Confetti animation on lesson complete
- [x] Loading states and error handling

### 2.3 Internationalization (i18n) ✅
- [x] Create `LanguageContext` with EN/FR translations
- [x] Add language toggle (🇬🇧/🇫🇷) to all pages
- [x] Translate all exercise questions/options
- [x] LocalStorage persistence for language preference

### 2.4 Exercise Improvements ✅
- [x] **Hints System**: Shows after 2 failed attempts
- [x] **Fuzzy Matching**: Accents ignored (mañana = manana)
- [x] **Typo Tolerance**: 1-2 character errors allowed
- [x] **"Almost Perfect"**: Shows correction when close

---

## Phase 3: Content Generation ✅ COMPLETE

### 3.1 Song Generation System ✅
- [x] Create `song_generation_system.md` framework
- [x] Define progressive ratios (80%→17% native language)
- [x] Style prompts scale +20% per level

### 3.2 All 24 Songs Regenerated ✅
- [x] Units 1-8 with proper progression
- [x] `knownVocab` and `focusVocab` arrays added
- [x] French exercise translations added
- [x] Contextual hints added to all exercises

### 3.3 Audio Files ⏸️ BLOCKED
> **Requires**: Suno AI or similar to generate MP3s

- [x] Unit 1 complete (9 MP3s)
- [ ] Units 2-8 pending (63 MP3s needed)

---

## Phase 4: Backend Infrastructure ✅ READY

### 4.1 Supabase Setup ✅
- [x] Create `schema.sql` with RLS policies
- [x] Tables: modules, lessons, exercises, profiles, user_progress

### 4.2 Integration Hooks ✅
- [x] Create `useCourseData()` hook
- [x] Create `useExercises(lessonId)` hook
- [x] Fallback to static JSON when Supabase not configured

### 4.3 Data Migration ✅
- [x] Write `seed_db.mjs` script
- [ ] Run script (requires user to create Supabase project)

### 4.4 User Setup Required
- [ ] Create Supabase project
- [ ] Run schema.sql in SQL Editor
- [ ] Set `.env.local` with credentials
- [ ] Run seed script

---

## Phase 5: Production Deployment 📋 PLANNED

- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables
- [ ] Verify production build
- [ ] Enable Google OAuth in Supabase

---

## Summary Stats

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1 - Admin Dashboard | ✅ Complete | 12/12 |
| Phase 2 - Core Features | ✅ Complete | 10/10 |
| Phase 3 - Content | ⏸️ Blocked on Audio | 24/24 songs, 9/72 audio |
| Phase 4 - Backend | ✅ Ready | 4/4 (setup needed) |
| Phase 5 - Deployment | 📋 Planned | 0/4 |
