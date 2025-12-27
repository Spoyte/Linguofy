# Task List

## 1. Immediate Content Tasks (Audio Generation)
The JSON content exists, but audio files currently missing. User needs to generate MP3s via Suno and link them.
- [ ] **Module 2: Basic Needs**
    - [ ] 2.1 Numbers (Generate & Integrate)
    - [ ] 2.2 Is there...? (Generate & Integrate)
    - [ ] 2.3 I want (Generate & Integrate)
- [ ] **Module 3: Family**
    - [ ] 3.1 Family (Generate & Integrate)
    - [ ] 3.2 Description (Generate & Integrate)
    - [ ] 3.3 House (Generate & Integrate)
- [ ] **Module 4: Routine**
    - [ ] 4.1 Time (Generate & Integrate)
    - [ ] 4.2 Routine (Generate & Integrate)
    - [ ] 4.3 Days (Generate & Integrate)
- [ ] **Module 5: Hobbies**
    - [ ] 5.1 Gustar (Generate & Integrate)
    - [ ] 5.2 Sports (Generate & Integrate)
    - [ ] 5.3 Clothes (Generate & Integrate)
- [ ] **Module 6, 7, 8 (A2)**
    - [ ] Generate Audio for all 9 A2 lessons.

## 2. Feature Implementation (Code)
- [ ] **Persistence**:
    - [ ] create `useProgress` hook using `localStorage`.
    - [ ] Update `CourseMap.jsx` to read from this hook instead of hardcoded `completed: false`.
    - [ ] Update `LessonView.jsx` to call `markComplete()` upon finishing exercises.
    - [ ] Add "Confetti" animation on lesson completion.

## 3. Admin Dashboard (New Major Feature)
- [ ] **Phase 1: Local Admin (Mock/Client-Side)**
    - [ ] Create `/admin` route with dummy login (User: `admin`, Pass: `admin`).
    - [ ] **Dashboard Layout**: Sidebar navigation (Songs, Exercises, Prompts, Config).
    - [ ] **Resource Management Views**:
        - [ ] List all Songs (Data Grid).
        - [ ] Add/Edit Song Metadata (Form).
        - [ ] Add/Edit Exercises (Dynamic Form Builder).
    - [ ] **Configuration Views**:
        - [ ] Manage Prompts (Song Generation, Lesson Creation).
        - [ ] Manage Languages (Add/Remove supported languages).
- [ ] **Phase 2: Connected Admin (Supabase)**
    - [ ] Connect Dashboard to real Database.
    - [ ] Implement Row Level Security (RLS) so only Admins can write.

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
