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

## Phase 2: Core App Features 🔄 IN PROGRESS

### 2.1 User Persistence ✅
- [x] Create `useProgress` hook (localStorage)
- [x] Track completed lessons in `CourseMap`
- [x] Show progress in `LessonView`

### 2.2 UI Polish ✅
- [x] Add "Locked" state for future modules
- [x] Confetti animation on lesson complete
- [x] Loading states and error handling

---

## Phase 3: Audio Content ⏸️ BLOCKED

> **Requires**: Suno AI or similar tool to generate MP3s

### 3.1 Unit 2 (A1 - Basic Needs)
- [ ] 2-1: Uno, Dos, Tres (3 versions)
- [ ] 2-2: ¿Qué Hay? (3 versions)
- [ ] 2-3: Yo Quiero (3 versions)

### 3.2 Units 3-5 (A1)
- [ ] 9 lessons × 3 versions = 27 MP3s

### 3.3 Units 6-8 (A2)
- [ ] 9 lessons × 3 versions = 27 MP3s

---

## Phase 4: Backend Migration 📋 PLANNED

### 4.1 Supabase Setup
- [ ] Create Supabase project
- [ ] Run SQL schema (modules, lessons, exercises, profiles, user_progress)
- [ ] Configure RLS policies

### 4.2 Data Migration
- [ ] Write `seed_db.js` script
- [ ] Migrate 24 lesson JSONs to database
- [ ] Verify data integrity

### 4.3 App Integration
- [ ] Install `@supabase/supabase-js`
- [ ] Create `useSongs()` hook
- [ ] Create `useExercises(lessonId)` hook
- [ ] Update Admin Dashboard to write to DB

### 4.4 Authentication
- [ ] Enable Google OAuth in Supabase
- [ ] Replace dummy auth with Supabase Auth
- [ ] Implement user profile creation

---

## Phase 5: Production Deployment 📋 PLANNED

- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables
- [ ] Verify production build
- [ ] Set up custom domain (optional)

---

## Summary Stats

| Phase | Status | Items |
|-------|--------|-------|
| Phase 1 | ✅ Complete | 12/12 |
| Phase 2 | 🔄 In Progress | 0/5 |
| Phase 3 | ⏸️ Blocked | 0/63 MP3s |
| Phase 4 | 📋 Planned | 0/10 |
| Phase 5 | 📋 Planned | 0/4 |
