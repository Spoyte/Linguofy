## 1. Admin Dashboard (Feature: Content Management)
**Goal**: Enable non-technical management of Linguofy content.

### Phase 1.1: Foundation & Auth
- [x] **Route & Layout**:
    - [x] Create `/admin` route.
    - [x] Create `AdminLayout` (Sidebar with links: Songs, Prompts, Config).
    - [x] Implement "Dummy Auth" (Login Screen -> `localStorage` check).
    - [x] Protect `/admin` routes (Redirect to login if not authenticated).

### Phase 1.2: Resource Management
- [x] **Song Manager**:
    - [x] View list of all songs (ID, Title, Module, Status).
    - [x] **Edit Song Form**:
        - [x] Fields: Title, ID, Style Prompt, Lyrics (Mixed/Pure).
        - [x] Audio Path selector (Text input for now).
    - [ ] **Add New Song**: Create new JSON entry.
- [x] **Prompt Manager** (New Request):
    - [x] Create `prompts.json` (or similar store) to save generation templates.
    - [x] **UI**: List/Add/Edit styles (e.g., "Reggaeton Style Prompt", "Lesson Structure Prompt").
    - [x] Use these prompts to help user generate new content.

### Phase 1.3: Configuration (Dynamic Types)
- [x] **Language Manager**:
    - [x] UI to add/remove supported languages (e.g., Target: Spanish, Native: French/English).
- [x] **Exercise Type Manager**:
    - [x] View/Edit available exercise types (`multiple_choice`, `fill_blank`).

## 2. Feature Implementation (Core App)
- [ ] **Persistence**:
    - [ ] create `useProgress` hook using `localStorage`.
    - [ ] Update `CourseMap` and `LessonView` to use it.
- [ ] **UI Polish**:
    - [ ] Add "Locked" state for future modules.
    - [ ] Confetti animation.

## 3. Infrastructure & Deployment
- [ ] **Deployment**: Connect to Vercel (User Action).
- [ ] **Backend (Phase 2)**: Supabase integration for real persistence.

## 4. Backlog / Asset Generation (Non-Blocking)
*These tasks are paused while waiting for User/Agent to generate files.*
- [ ] **Audio Generation (A1 & A2)**: Generate MP3s for Modules 2-8.
- [ ] **Integration**: Link generated MP3s in JSON.

## 4. Infrastructure
- [ ] **Deployment**:
    - [ ] Connect GitHub repo to Vercel.
    - [ ] Verify production build.
- [ ] **Backend (Future)**:
    - [ ] Initialize Supabase project.
    - [ ] Migrate JSON data to Database tables.

## 4. Completed Items
- [x] **Project Scaffolding**: React + Vite + Tailwind configured.
- [x] **Core Navigation**: Landing Page, Course Map, Lesson View, Player.
- [x] **Curriculum Design**: Defined A1 (Modules 1-5) and A2 (Modules 6-8).
- [x] **Content Generation**: All JSON metadata/lyrics/exercises created for Units 1-8.
- [x] **Audio Integration**: Unit 1 (Lessons 1.1, 1.2, 1.3) fully functional.
- [x] **Network Access**: Exposed dev server via `--host`.
- [x] **SPA Routing**: `vercel.json` created.
