export const prompts = [
  // --- 1. Content Generation Strategies ---
  {
    id: "strategy_ratios",
    name: "Pedagogical Ratios (A1 vs A2)",
    target: "Reference Only",
    template: `CONTEXT:
You are an expert language teacher specializing in music-based learning (Linguofy).

LEVEL A1 (Beginner):
- RATIO: 60% Native Language (English) / 40% Target Language (Spanish).
- VOCABULARY: Focus on high-frequency words and cognates (e.g., música, familia).
- STRUCTURE:
  * Verses: Native language storytelling to set context + embedded Target nouns.
  * Chorus: 100% Target language. Simple, repetitive, earworm hook.
- GRAMMAR: Present tense only.

LEVEL A2 (Elementary):
- RATIO: 30% Native / 70% Target.
- VOCABULARY: Daily interactions, travel, ordering, feelings.
- STRUCTURE:
  * Verses: Simple Target sentences. Native used ONLY for complex abstract concepts.
  * Chorus: 100% Target. Faster tempo.
- GRAMMAR: Preterite (Past) and immediate Future (Voy a...).`
  },

  // --- 2. Lesson Generation Templates ---
  {
    id: "gen_lesson_song",
    name: "Generator: Song Lesson",
    target: "Detailed Song & JSON",
    template: `TASK: Create a song lesson for Level [A1/A2] about [Topic] in the style of [Genre].
STRICT CONSTRAINTS:
1. Follow the "Pedagogical Ratios" for this level exactly.
2. Rhyme Scheme: AABB or ABAB.
3. Include at least 5 "Focus Words" (Keywords) repeated 3+ times.

OUTPUT FORMAT (JSON):
{
  "title": "Creative Title (Spanish)",
  "english_title": "Title (English)",
  "genre": "[Genre]",
  "level": "[A1/A2]",
  "focus_vocab": [
    { "word": "SpanishWord", "translation": "English", "type": "Noun/Verb" }
  ],
  "lyrics_mixed": "Full lyrics text with Native/Target mix...",
  "lyrics_pure_target": "Full lyrics translated 100% to Spanish...",
  "section_breakdown": [
    { "order": 1, "type": "Verse 1", "desc": "Introduction in Mixed Language" },
    { "order": 2, "type": "Chorus", "desc": "Main hook in Spanish" }
  ]
}`
  },
  {
    id: "gen_lesson_dialogue",
    name: "Generator: Dialogue Lesson",
    target: "Roleplay Script",
    template: `TASK: Write a roleplay dialogue for Level [A1/A2].
SCENARIO: [Scenario] (e.g. Checking into a hotel with a lost reservation).
CHARACTERS:
- Role A: The Learner (Sympathetic, makes common mistakes).
- Role B: The Native Speaker (Helpful but natural speed).

REQUIREMENTS:
1. Length: 8-12 exchanges.
2. Include 3 specific "Teachable Moments" where Role B gently corrects Role A (recasting).
3. Tone: [Tone] (e.g. Urgent, Humorous, Polite).

OUTPUT FORMAT (JSON):
{
  "title": "Dialogue Title",
  "script": [
    {
      "speaker": "Role A",
      "text_es": "Spanish Text...",
      "text_en": "English Translation...",
      "audio_emotion": "Confused" 
    }
  ],
  "teachable_moments": [
    { "trigger_phrase": "Mistake phrase", "correction": "Correct phrase", "rule": "Why it was wrong" }
  ]
}`
  },
  {
    id: "gen_lesson_grammar",
    name: "Generator: Grammar Lesson",
    target: "Metaphorical Concept",
    template: `TASK: Explain the grammar concept [Concept] (e.g. Por vs Para) for a visual learner.
METHOD:
1. Use a CONCRETE METAPHOR (e.g. "Por is the tunnel, Para is the destination").
2. Do NOT use jargon like "prepositional phrase".
3. Provide 3 contrasting examples using the metaphor.

OUTPUT FORMAT (JSON):
{
  "concept": "[Concept]",
  "metaphor_title": "The Tunnel and The Station",
  "explanation_markdown": "Detailed explanation...",
  "visual_prompt": "A high-quality prompt for an AI image generator depicting this metaphor...",
  "examples": [
    { "es": "Voy por el parque", "en": "I go through the park", "why": "Motion through (The Tunnel)" }
  ]
}`
  },

  // --- 3. Exercise Generators ---
  {
    id: "gen_ex_quiz",
    name: "Generator: M/C Quiz",
    target: "Distractor-based Questions",
    template: `TASK: Create 5 Multiple Choice Questions based on [Content].
CONSTRAINT: The wrong options (distractors) must be PLAUSIBLE common mistakes (e.g. wrong gender, false cognate). Do not use random words.

OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "q": "Question text...",
      "options": ["Correct", "Distractor 1", "Distractor 2"],
      "correct_index": 0,
      "explanation": "Why the distractors are wrong..."
    }
  ]
}`
  },
  {
    id: "gen_ex_scramble",
    name: "Generator: Sentence Builder",
    target: "Syntax Ordering",
    template: `TASK: Create a sentence scrambling exercise.
INPUT SENTENCE: "[Sentence]"
REQUIREMENT: Break the sentence into chunks that challenge syntax (e.g. separate pronouns from verbs).

OUTPUT FORMAT (JSON):
{
  "original": "Yo no quiero comer eso",
  "chunks": ["Yo", "no quiero", "comer", "eso"],
  "correct_order": [0, 1, 2, 3],
  "difficulty": "Easy"
}`
  }
];
