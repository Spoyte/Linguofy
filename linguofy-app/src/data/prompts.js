export const prompts = [
  // --- 1. Content Generation Strategies ---
  {
    id: "strategy_ratios",
    name: "Pedagogical Ratios (A1 vs A2)",
    target: "Reference Only",
    template: `A1 (Beginner): 60% Native / 40% Target
- Verses: Mostly Native (Storytelling)
- Chorus: 100% Target (Hooks)

A2 (Elementary): 30% Native / 70% Target
- Verses: Simple Target sentences
- Chorus: 100% Target
- Complex concepts in Native only`
  },

  // --- 2. Lesson Generation Templates ---
  {
    id: "gen_lesson_song",
    name: "Generator: Song Lesson",
    target: "Suno Lyrics & JSON",
    template: `Create a [Genre] song for Level [A1/A2].
Topic: [Topic]
Structure:
1. Verse 1 (Intro, Mixed Lang)
2. Chorus (Catchy, Target Lang)
3. Verse 2 (Story, Mixed)
4. Outro
Format Output as JSON: { "title": "...", "lyrics_mixed": "...", "vocab": [] }`
  },
  {
    id: "gen_lesson_dialogue",
    name: "Generator: Dialogue Lesson",
    target: "Converstational Script",
    template: `Create a realistic dialogue for Level [A1/A2].
Scenario: [Scenario] (e.g. Buying Ticket)
Roles: [Role A] vs [Role B]
Include:
- 3 common mistakes by the learner character
- Gentle corrections by the native speaker character
Output JSON: { "script": [ { "speaker": "A", "text": "..." } ] }`
  },
  {
    id: "gen_lesson_grammar",
    name: "Generator: Grammar Lesson",
    target: "Explanation & Metaphor",
    template: `Explain the grammar rule: [Rule] (e.g. Ser vs Estar)
Metaphor: Use a [Metaphor Topic] (e.g. Sports, Cooking) to explain the difference.
Visual: Describe an image that represents this rule.
Output JSON: { "explanation": "...", "visual_prompt": "..." }`
  },
  {
    id: "gen_lesson_picture",
    name: "Generator: Picture Vocab",
    target: "Visual Item List",
    template: `List 10 items related to: [Theme] (e.g. Kitchen)
For each:
1. Spanish Term
2. Gender
3. AI Image Prompt (Visual description)
Output JSON: { "items": [ { "term": "...", "prompt": "..." } ] }`
  },

  // --- 3. Exercise Generators ---
  {
    id: "gen_ex_quiz",
    name: "Generator: Exercises (Quiz)",
    target: "Multiple Choice Questions",
    template: "Create 5 multiple choice questions based on: [Content]. Focus on common mistakes."
  },
  {
    id: "gen_ex_match",
    name: "Generator: Exercises (Matching)",
    target: "Matching Pairs",
    template: "Generate 5 pairs of [Type] (e.g. Adjective/Opposite, Noun/Gender) in Spanish. Output as JSON pairs."
  },
  {
    id: "gen_ex_scramble",
    name: "Generator: Exercises (Scramble)",
    target: "Sentence Ordering",
    template: "Take the sentence '[Sentence]'. Scramble the words. Provide the correct index order."
  }
];
