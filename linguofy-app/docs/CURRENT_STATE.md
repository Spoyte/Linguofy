# Linguofy - Project Status & Developer Handoff

**Date**: December 28, 2025
**Version**: 0.2.0 (Prototype Phase 2)

## 1. Project Overview
Linguofy is a language learning web application combining structured lessons (Duolingo-style) with musical immersion. The current prototype focuses on **French speakers learning Spanish** (Level A1/A2).

### Core Features
*   **Course Map (`/learn`)**: Visual curriculum tree tracking progress.
*   **Dual Modes**:
    *   **Lesson Mode**: Interactive exercises (Multiple Choice, Fill-in-Blank, Translation) synced with song lyrics.
    *   **Listen Mode (`/play`)**: Spotify-style player for passive listening.
*   **Content Engine**:
    *   Songs are the primary teaching material.
    *   Metadata + Lyrics + Exercises defined in JSON.
    *   Audio is AI-generated (Suno) but manually integrated.

## 2. Technical Architecture
*   **Frontend**: React 19, Vite, Tailwind CSS 3.4.
*   **Routing**: `react-router-dom` (SPA).
*   **State Management**: Local React state (currently non-persistent across reloads).
*   **Data Source**: JSON files in `public/data/songs/`.
*   **Deployment**: Vercel-ready (SPA configuration in `vercel.json`).

### Directory Structure
```
linguofy-app/
├── public/
│   ├── audio/              # MP3 files (Manually added)
│   ├── data/songs/         # Content JSONs (Metadata, Lyrics, Exercises)
│   └── ...
├── src/
│   ├── components/
│   │   ├── ExerciseEngine.jsx  # Renders exercises based on type
│   │   └── ...
│   ├── pages/
│   │   ├── CourseMap.jsx       # Main curriculum navigation
│   │   ├── LessonView.jsx      # Interactive learning flow
│   │   ├── SongPlayer.jsx      # Music player view
│   │   └── LandingPage.jsx     # Entry point
│   ├── ...
└── vercel.json           # SPA routing config
```

## 3. Curriculum Status
The curriculum is divided into **Units (Modules)**.

### Level A1: Beginner (Complete Content)
*   **Unit 1: Introductions** (Lessons 1.1 - 1.3) ✅ **Audio Integrated**
*   **Unit 2: Basic Needs** (Lessons 2.1 - 2.3) 📝 *JSON Ready, Needs Audio*
*   **Unit 3: Family** (Lessons 3.1 - 3.3) 📝 *JSON Ready, Needs Audio*
*   **Unit 4: Routine** (Lessons 4.1 - 4.3) 📝 *JSON Ready, Needs Audio*
*   **Unit 5: Hobbies** (Lessons 5.1 - 5.3) 📝 *JSON Ready, Needs Audio*

### Level A2: Elementary (Started)
*   **Unit 6: Travel** (Lessons 6.1 - 6.3) 📝 *JSON Ready, Needs Audio*
*   **Unit 7: Past Tense** (Lessons 7.1 - 7.3) 📝 *JSON Ready, Needs Audio*
*   **Unit 8: Health** (Lessons 8.1 - 8.3) 📝 *JSON Ready, Needs Audio*

## 4. How to Continue Work

### Adding New Audio
1.  Generate MP3 for a lesson (e.g., `2-1-Numbers.mp3`).
2.  Place file in `public/audio/`.
3.  Update `public/data/songs/2-1.json`:
    ```json
    "audio": {
        "mixed_fr": "/audio/2-1-mixed_fr.mp3",
        ...
    }
    ```

### Adding New Lessons
1.  Create `public/data/songs/X-Y.json` following the schema.
2.  Update `src/pages/CourseMap.jsx` to include the new lesson in the `modules` array.

### Deployment
*   Repo is ready. Connect to **Vercel**, import repo, use default Vite settings.

## 5. Known Limitations (To Do)
*   **Persistence**: Progress (completed lessons) is hardcoded or effectively resets on refresh. Needs `localStorage` or Backend.
*   **Audio Files**: Most lessons (Units 2-8) currently lack actual MP3 files (empty strings in JSON).
*   **Mobile**: UI is responsive but not fully optimized for touch (e.g., swipe gestures).
