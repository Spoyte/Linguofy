# Linguofy Project Analysis

## 1. Project Overview

**Linguofy** is a music-based language learning web application that teaches Spanish through songs. It combines a Spotify-like listening experience with Duolingo-style interactive exercises.

**Tech Stack:**
- **Frontend**: React 19.2 + Vite 6.4
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM 6.30
- **Backend**: Currently static JSON files (Supabase planned)

## 2. Architecture

```
linguofy-app/
├── src/
│   ├── App.jsx              # Main routing (12 routes)
│   ├── data/                # Static data stores
│   │   ├── courseData.js    # Module/Lesson metadata
│   │   ├── config.js        # Languages & Exercise types
│   │   └── prompts.js       # AI generation templates
│   ├── pages/
│   │   ├── LandingPage.jsx  # Entry point
│   │   ├── CourseMap.jsx    # Learning tree view
│   │   ├── LessonView.jsx   # Song + Exercises
│   │   ├── SongPlayer.jsx   # Audio player
│   │   └── admin/           # 10 admin components
│   └── components/          # Reusable UI
├── public/
│   ├── audio/               # 9 MP3 files (Unit 1 only)
│   └── data/songs/          # 25 lesson JSON files
└── docs/                    # Strategy & Tasks
```

## 3. Content Structure

### Curriculum (8 Units, 24 Lessons)

| Unit | Level | Status | Topic |
|------|-------|--------|-------|
| 1 | A1 | ✅ Published | Introductions |
| 2 | A1 | ⚠️ Audio Missing | Basic Needs |
| 3 | A1 | ⚠️ Audio Missing | Family & Description |
| 4 | A1 | ⚠️ Audio Missing | Routine & Time |
| 5 | A1 | ⚠️ Audio Missing | Likes & Hobbies |
| 6 | A2 | ⚠️ Audio Missing | Travel & Future |
| 7 | A2 | ⚠️ Audio Missing | The Past |
| 8 | A2 | ⚠️ Audio Missing | Health & Feelings |

### Lesson JSON Structure
Each lesson (`public/data/songs/*.json`) contains:
- `id`, `title`, `style` (AI generation prompt)
- `audio`: 3 versions (mixed_fr, mixed_en, pure_es)
- `lyrics`: 3 versions matching audio
- `exercises`: Array of quiz objects

## 4. Admin Dashboard

**Access**: `/admin` (Credentials: admin/admin)

| Component | Purpose |
|-----------|---------|
| `AdminDashboard` | Overview stats |
| `SongManager` | List all songs with status badges |
| `SongEditor` | Edit metadata, lyrics, audio paths |
| `ExerciseManager` | Global exercise overview |
| `ExerciseList` | Per-lesson exercise list |
| `ExerciseEditor` | Polymorphic form (Quiz/Match/Fill) |
| `PromptManager` | AI generation templates |
| `ConfigManager` | Languages & Exercise types |

## 5. Current State Summary

### ✅ Completed
- Full React/Vite/Tailwind setup
- Core navigation (4 public routes)
- Admin dashboard (8 routes, 10 components)
- Curriculum structure (8 modules defined)
- Content generation (24 lesson JSONs)
- Unit 1 fully playable (3 lessons, 9 audio files)
- Exercise Manager with polymorphic editor

### ⚠️ In Progress / Blocked
- Audio files for Units 2-8 (21 lessons × 3 versions = 63 MP3s needed)
- User progress persistence (localStorage implementation pending)

### 📋 Planned (Phase 2)
- Supabase backend migration
- Real authentication (Google/Email)
- User progress tracking across devices
- Production deployment to Vercel

## 6. Key Files Reference

| File | Purpose |
|------|---------|
| [App.jsx](file:///home/zodia-ubuntu/github/hackathon/Linguofy/linguofy-app/src/App.jsx) | Main routing |
| [courseData.js](file:///home/zodia-ubuntu/github/hackathon/Linguofy/linguofy-app/src/data/courseData.js) | Module/Lesson metadata |
| [BACKEND_STRATEGY.md](file:///home/zodia-ubuntu/github/hackathon/Linguofy/linguofy-app/docs/BACKEND_STRATEGY.md) | Database schema plan |
| [TASKS.md](file:///home/zodia-ubuntu/github/hackathon/Linguofy/linguofy-app/docs/TASKS.md) | Current task checklist |

## 7. Next Steps (Prioritized)

1. **Audio Generation**: Generate MP3s for Units 2-8 using Suno AI
2. **User Persistence**: Implement `useProgress` hook with localStorage
3. **UI Polish**: Add locked states and confetti animations
4. **Backend Migration**: Initialize Supabase and run seed script
