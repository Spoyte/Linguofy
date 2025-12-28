# Pedagogical Prompts (Content Intelligence)

## 1. Pedagogical Ratios
Defines the mix of Native vs Target language based on proficiency.

**Level A1 (Beginner)**
*   **Ratio**: 60% Native / 40% Target
*   **Goal**: Confidence & Context.
*   **Structure**:
    *   Verses: Mostly Native (Storytelling, setting the scene).
    *   Chorus: 100% Target (Repetitive, catchy hooks).
    *   Bridge: Mixed (Target key phrases embedded in Native sentences).

**Level A2 (Elementary)**
*   **Ratio**: 30% Native / 70% Target
*   **Goal**: Immersion.
*   **Structure**:
    *   Verses: Simple Target sentences. Native used only for complex abstract concepts.
    *   Chorus: 100% Target.
    *   Drills: 100% Target.

## 2. Lesson Diversity Templates

### A. Song-Based Lesson (The "Linguofy Classic")
*   **Input**: Topic (e.g., "Ordering Food"), Genre ("Smooth Jazz").
*   **Output JSON**:
    *   `type`: "song"
    *   `lyrics_mixed`: (Follows Ratio A1/A2)
    *   `focus_vocab`: ["la cuenta", "quisiera", "rico"]

### B. Dialogue-Based Lesson (Conversational)
*   **Input**: Scenario ("Buying a Train Ticket"), Roles ("Tourist", "Clerk").
*   **Prompt**: "Create a realistic dialogue. A1 Level. Tourist makes mistakes, Clerk corrects gently."
*   **Output JSON**:
    *   `type`: "dialogue"
    *   `script`: [ { "speaker": "A", "text": "..." }, { "speaker": "B", "text": "..." } ]

### C. Grammar-Focused Lesson (Visual/Rules)
*   **Input**: Rule ("Ser vs Estar").
*   **Prompt**: "Explain 'Ser vs Estar' using a sports metaphor. Provide 3 clear examples."
*   **Output JSON**:
    *   `type`: "grammar"
    *   `explanation`: "Markdown text..."
    *   `visual_prompt`: "Image of a permanent stadium (Ser) vs a temporary match (Estar)."

### D. Picture-Based Lesson (Vocab)
*   **Input**: Theme ("The Kitchen").
*   **Prompt**: "List 10 items found in a kitchen. Provide Spanish term, gender, and a visual description for an AI image generator."
*   **Output JSON**:
    *   `type`: "picture_vocab"
    *   `items`: [ { "term": "El refrigerador", "image_prompt": "A retro red fridge..." } ]

## 3. Exercise Diversity Templates

### A. Matching Pairs
*   **Prompt**: "Generate 5 pairs of [adjective] -> [opposite] in Spanish."
*   **Data**: `{"pairs": [["Alto", "Bajo"], ["Bueno", "Malo"]]}`

### B. Sorting / Ordering
*   **Prompt**: "Take the sentence 'Yo voy a la playa mañana'. Scramble it. Provide correct index order."
*   **Type**: `scramble_sentence`

### C. Listening / Dictation
*   **Prompt**: "Select a short phrase from the song. Generate a partial transcript with the key verb missing."
*   **Type**: `fill_blank_listening`

## 4. Implementation Plan
These templates will be converted into JSON objects in `src/data/prompts.js` so the Admin Dashboard can load them dynamically.
