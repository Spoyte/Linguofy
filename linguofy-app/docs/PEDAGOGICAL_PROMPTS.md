# Pedagogical Prompts (Content Intelligence Pipeline)

This document defines the core prompts, rules, and expected JSON structures for the Linguofy AI Content Generation Engine. The goal is to automate the creation of high-quality, linguistically accurate, and structurally consistent language learning content (songs, grammar lessons, cultural deep-dives, and exercises).

## 1. Core System Prompt
**System Role:**
"You are 'Linguofy', an expert bilingual language instructor and creative writer. Your goal is to teach Spanish to English speakers using music, culture, and interactive linguistics. You specialize in 'Code-Switching'—seamlessly blending English and Spanish to provide context-rich learning. Generate content strictly in valid JSON format according to the provided schemas. Do not wrap the JSON in markdown blocks unless explicitly requested."

## 2. Language Mixing Ratios (Code-Switching)
The AI must adhere to specific mixing ratios based on the target difficulty level.

### Level A1 (Beginner)
*   **Ratio**: 60% Native (English) / 40% Target (Spanish)
*   **Goal**: Provide heavy context. Avoid overwhelming the user.
*   **Structure Rule**:
    *   **Verses**: Mostly English to establish the story/setting, with key nouns or simple verbs in Spanish.
    *   **Chorus**: Highly repetitive, simple 100% Spanish hooks.

### Level A2 (Elementary)
*   **Ratio**: 30% Native (English) / 70% Target (Spanish)
*   **Goal**: Immersion with safety nets.
*   **Structure Rule**:
    *   **Verses**: Mostly simple Spanish sentences. English used only for transitional phrases or complex abstract concepts.
    *   **Chorus**: 100% Spanish.

## 3. Content Generation Templates & JSON Schemas

### A. Music-Based Lesson Pipeline
**Context**: Replaces standard textbook dialogues with catchy songs.
**Prompt**: "Generate a Spanish learning song about [TOPIC], in the musical style of [GENRE]. Target level is [LEVEL]. Follow the language mixing ratio for this level. Output the result in the exact JSON schema provided."

**Expected JSON Schema:**
```json
{
  "id": "unique-slug",
  "title": "Song Title",
  "artist": "Linguofy AI",
  "style": "Genre Type",
  "duration": 0,
  "coverUrl": "image-generation-prompt-or-url",
  "lyrics": {
    "mixed_en": "String with newlines. Use [Verse 1], [Chorus] headers.",
    "pure_es": "String with newlines. 100% Spanish literal translation."
  },
  "audio": {
    "mixed_en": "audio_url_placeholder",
    "pure_es": "audio_url_placeholder"
  }
}
```

### B. Grammar Bonus Lesson Pipeline
**Context**: Explains a grammatical concept found in a recently generated song.
**Prompt**: "Create a comprehensive, visually appealing grammar lesson explaining [CONCEPT]. Use clear sections, highlight key rules, and provide bilingual examples. Output the result in the exact JSON schema provided."

**Expected JSON Schema:**
```json
{
  "id": "grammar_concept",
  "title": "Clear Title (e.g., Ser vs Estar)",
  "description": "Short subtitle/summary",
  "associatedSongId": "id-of-related-song",
  "content": {
    "intro": "Markdown string explaining the concept simply.",
    "sections": [
      {
        "title": "Section Title",
        "explanation": "Detailed explanation.",
        "examples": [
          { "spanish": "El cielo es azul.", "translation": "The sky is blue (permanent)." }
        ],
        "mnemonic": "Memory trick (optional)."
      }
    ]
  },
  "focusVocab": ["ser", "estar", "soy", "estoy"]
}
```

### C. Culture Bonus Lesson Pipeline
**Context**: Dives into the cultural context of a vocabulary set or region.
**Prompt**: "Generate a cultural deep-dive about [TOPIC/REGION] in the Spanish-speaking world. Include interesting facts and relevant traditions or dishes. Output the result in the exact JSON schema provided."

**Expected JSON Schema:**
```json
{
  "id": "culture_topic",
  "title": "Cultural Topic Name",
  "description": "Short engaging subtitle",
  "associatedSongId": "id-of-related-song",
  "content": {
    "intro": "Markdown string setting the scene.",
    "sections": [
      {
        "title": "Fascinating Facts",
        "facts": ["Fact 1", "Fact 2"]
      },
      {
        "title": "Culinary Delights",
        "dishes": [
          { "name": "Dish Name", "region": "Region Name", "description": "What is it?" }
        ]
      }
    ]
  },
  "keyPhrases": [
    { "phrase": "¡Qué rico!", "meaning": "How delicious!" }
  ]
}
```

## 4. Exercise Generation Rules (Post-Processing)
Once base content (Song/Grammar/Culture) is generated, a secondary prompt generates interactive exercises based on that specific content object.

**Supported Exercise Types in UI Engine:**
1.  `multiple_choice`: Standard 4-option questions.
2.  `fill_in_the_blank`: Cloze deletion tests (often using lyrics).
3.  `matching`: Match Spanish words to English definitions.
4.  `translation`: Translate a full sentence (evaluated by AI locally or via LLM).

*Note: The Exercise Engine expects exercises to be appended to the base content JSON under an `exercises` array.*
