# Pending API Integrations & Scaffolding

This document outlines all the features and services within the Linguofy application that have been built and pre-wired on the frontend, but are currently waiting for a real backend API (like OpenAI, Anthropic, or specialized GenAI services) to become fully functional in production.

These features currently use "mock" data, stubs, or local placeholders so the UI can be interacted with and tested.

## 1. AI Lesson Generation (`/src/services/ai/lessonGenerator.js`)

**Status**: Scaffolding Complete | **Needs**: OpenAI/Anthropic API Key or Backend Proxy
**Description**: The core feature of generating a structured language lesson out of any given song lyrics.

*   **Current Behavior**: 
    The `lessonGenerator.js` file contains the exact structural prompts and JSON schemas needed to turn a raw text string of lyrics into an array of vocabulary words, grammar explanations, cultural notes, and dialogues. However, the `generateLessonFromLyrics` function currently just simulates a delay and returns a mocked JSON response.
*   **What is Missing**:
    1.  A secure backend endpoint (e.g., a Supabase Edge Function).
    2.  The Edge Function needs to take the raw lyrics, pass them to an LLM (using the precise prompt injected in `PEDAGOGICAL_PROMPTS.md`), and parse the returning JSON.
    3.  The frontend `lessonGenerator.js` needs to be updated to `fetch()` this new Edge Function instead of returning the local `MOCK_LESSON`.

## 2. Dynamic Audio Generation (`/src/services/ai/audioPipeline.js`)

**Status**: Scaffolding Complete | **Needs**: ElevenLabs API (or similar TTS), Suno/Udio API (for full songs)
**Description**: Generating spoken audio for vocabulary words, dialogues, and potentially full musical tracks dynamically.

*   **Current Behavior**: 
    The application requests audio through the `audioPipeline.js` service for things like Word Matcher and Dialogue playback. Currently, it tries to fetch local `.mp3` files (e.g., from `/public/audio/vocab/`). If they don't exist, it fails silently or falls back to the browser's native (and often robotic) `SpeechSynthesis` API.
*   **What is Missing**:
    1.  A backend TTS (Text-to-Speech) proxy. When the frontend requests audio for "manzana", the backend should call ElevenLabs, generate the high-quality Spanish snippet, save it to a Supabase Storage bucket, and return the URL.
    2.  **Music Generation**: A planned feature to let users input themes and get a custom generated song (via Suno API). The UI scaffolding for this does not exist yet, but the strategy is outlined in `BACKEND_STRATEGY.md`.

## 3. Real-Time Conversation Mode (`/src/pages/ConversationView.jsx`)

**Status**: UI/UX Complete | **Needs**: WebRTC / Live Audio WebSocket API (e.g., OpenAI Realtime API)
**Description**: A live voice-to-voice practice arena where the user speaks to an AI language tutor in real-time.

*   **Current Behavior**: 
    The `ConversationView.jsx` component successfully requests microphone permissions, visualizes audio input, and displays a scrolling transcript. However, the back-and-forth conversation is entirely simulated using timeouts and mock text responses within `audioPipeline.js` (`startConversationStream`).
*   **What is Missing**:
    1.  Implementation of a WebSocket or WebRTC connection to a backend server.
    2.  The backend needs to stream the user's raw audio to an LLM capable of voice-in-voice-out (like OpenAI's Realtime API) or handle the STT -> LLM -> TTS pipeline rapidly.
    3.  The frontend needs to be hooked up to receive the binary audio chunks and transcript deltas from the socket instead of the local simulation loop.

## 4. Open-Ended Exercise Evaluator (`/src/services/ai/exerciseEvaluator.js` - Planned)

**Status**: Architected | **Needs**: LLM API
**Description**: Evaluating free-form user text input (like "Translate this sentence" or "Write a response to this prompt") rather than just multiple choice.

*   **Current Behavior**: 
    Arcade games currently rely exclusively on exact-match string comparisons or multiple-choice arrays based on pre-computed lesson data.
*   **What is Missing**:
    1.  An endpoint that accepts a user's free-text answer, the original context, and the target language.
    2.  An LLM prompt that grades the answer, identifies grammatical errors, and provides specific feedback.
    3.  A UI component in the learning flow to support these free-text questions.
