# Linguofy Project Analysis

## 1. Project Overview

**Linguofy** is a music-based language learning web application that teaches Spanish through songs. It combines a Spotify-like listening experience with Duolingo-style interactive exercises.

**Tech Stack:**
- **Frontend**: React 19.2 + Vite 6.4
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM 6.30
- **i18n**: Custom React Context with EN/FR support
- **Backend**: Static JSON (Supabase ready)

## 2. Architecture

```
linguofy-app/
├── src/
│   ├── App.jsx              # Main routing (12 routes)
│   ├── i18n/                # Internationalization
│   │   ├── LanguageContext.jsx
│   │   └── translations.js  # EN/FR strings
│   ├── hooks/
│   │   ├── useProgress.js   # LocalStorage progress
│   │   ├── useCourseData.js # Supabase-ready data hook
│   │   └── useExercises.js
│   ├── data/                # Static data stores
│   ├── pages/
│   │   ├── LandingPage.jsx  # Entry + language toggle
│   │   ├── CourseMap.jsx    # Learning tree + locked modules
│   │   ├── LessonView.jsx   # Song + Exercises + confetti
│   │   └── admin/           # 10 admin components
│   └── components/
│       ├── ExerciseEngine.jsx  # Hints + fuzzy matching
│       └── LanguageToggle.jsx  # 🇬🇧/🇫🇷 switcher
├── public/data/songs/       # 24 lesson JSON files
├── supabase/schema.sql      # Database schema
└── scripts/
    ├── seed_db.mjs          # Supabase data migration
    ├── add_french_exercises.mjs
    └── add_exercise_hints.mjs
```

## 3. Content Structure

### Curriculum (8 Units, 24 Lessons)

| Unit | Level | Audio | Topic | Native Language % |
|------|-------|-------|-------|-------------------|
| 1 | A1 | ✅ Ready | Introductions | 80% |
| 2 | A1 | ⚠️ Pending | Basic Needs | 64% |
| 3 | A1 | ⚠️ Pending | Family & Description | 51% |
| 4 | A1 | ⚠️ Pending | Routine & Time | 41% |
| 5 | A1 | ⚠️ Pending | Likes & Hobbies | 33% |
| 6 | A2 | ⚠️ Pending | Travel & Future | 26% |
| 7 | A2 | ⚠️ Pending | The Past | 21% |
| 8 | A2 | ⚠️ Pending | Health & Feelings | 17% |

### Lesson JSON Structure
```json
{
  "id": "1-1",
  "title": "¡Hola!",
  "style": "Suno v4.5 generation prompt (~400-1000 chars)",
  "audio": { "mixed_fr", "mixed_en", "pure_es" },
  "lyrics": { "mixed_fr", "mixed_en", "pure_es" },
  "knownVocab": ["previously learned words"],
  "focusVocab": ["new words this lesson"],
  "exercises": [
    {
      "type": "multiple_choice|fill_blank|translation",
      "question": "English question",
      "question_fr": "French question",
      "options": ["EN options"],
      "options_fr": ["FR options"],
      "hint": "English hint",
      "hint_fr": "French hint",
      "correct": "answer"
    }
  ]
}
```

## 4. Key Features

### User-Facing
| Feature | Description |
|---------|-------------|
| 🇫🇷🇬🇧 Language Toggle | Switch UI between French/English |
| 🔒 Progressive Unlock | Complete module to unlock next |
| 💡 Smart Hints | Appear after 2 wrong attempts |
| ✍️ Fuzzy Matching | Accents ignored, 1-2 typos allowed |
| 🎉 Confetti | Celebration on lesson completion |
| 📊 Progress Tracking | LocalStorage persistence |

### Admin Dashboard (`/admin`)
| Component | Purpose |
|-----------|---------|
| `AdminDashboard` | Stats overview + pending tasks |
| `SongManager` | List/edit all 24 songs |
| `ExerciseManager` | Edit exercises with hints |
| `ConfigManager` | Languages & exercise types |

## 5. Current State

### ✅ Completed
- Full React/Vite/Tailwind setup
- i18n system with French/English
- 24 songs with progressive difficulty
- 72 exercises with hints + translations
- Fuzzy answer matching
- User progress tracking
- Admin dashboard
- Supabase schema ready

### ⏳ Pending
- Audio files for Units 2-8 (63 MP3s)
- Vercel deployment
- Supabase project setup
- Google OAuth integration

## 6. Quick Start

```bash
# Development
npm run dev -- --host

# Admin access
# URL: /admin
# Credentials: admin / admin
```

## 7. File References

| File | Purpose |
|------|---------|
| [ExerciseEngine.jsx](file:///home/zodia-ubuntu/github/hackathon/Linguofy/linguofy-app/src/components/ExerciseEngine.jsx) | Hints + fuzzy matching |
| [LanguageContext.jsx](file:///home/zodia-ubuntu/github/hackathon/Linguofy/linguofy-app/src/i18n/LanguageContext.jsx) | i18n provider |
| [useProgress.js](file:///home/zodia-ubuntu/github/hackathon/Linguofy/linguofy-app/src/hooks/useProgress.js) | LocalStorage tracking |
| [schema.sql](file:///home/zodia-ubuntu/github/hackathon/Linguofy/linguofy-app/supabase/schema.sql) | Supabase database |
