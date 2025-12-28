#!/usr/bin/env node
/**
 * Script to add French translations to exercise questions and options
 * in all song JSON files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const songsDir = path.join(__dirname, '../public/data/songs');

// Translation mappings for common exercise patterns
const translationPatterns = {
    // Questions
    "What does": "Que signifie",
    "How do you say": "Comment dit-on",
    "When would you say": "Quand dit-on",
    "Translate:": "Traduisez :",
    "What is": "Quel est",
    "Which": "Quel/Quelle",

    // Options - common English answers
    "Good morning": "Bonjour",
    "Good night": "Bonne nuit",
    "Good afternoon": "Bon après-midi",
    "Goodbye": "Au revoir",
    "See you later": "À plus tard",
    "In the morning": "Le matin",
    "In the afternoon": "L'après-midi",
    "In the evening/night": "Le soir/la nuit",
    "At lunch time": "À midi",
    "I have": "J'ai",
    "I am": "Je suis",
    "I like": "J'aime",
    "I want": "Je veux",
    "I traveled": "J'ai voyagé",
    "I'm going to travel": "Je vais voyager",
    "I travel": "Je voyage",
    "I want to travel": "Je veux voyager",
    "Straight ahead": "Tout droit",
    "On the left": "À gauche",
    "On the right": "À droite",
    "Behind": "Derrière",
    "In front of": "Devant",
    "The platform": "Le quai",
    "The train": "Le train",
    "The ticket": "Le billet",
    "The station": "La gare",
    "The arm": "Le bras",
    "The leg": "La jambe",
    "The head": "La tête",
    "The hand": "La main",
    "Short": "Court/Petit",
    "Tall": "Grand",
    "Fat": "Gros",
    "Thin": "Mince",
    "Happy": "Content/Heureux",
    "Sad": "Triste",
    "Tired": "Fatigué",
    "Nervous": "Nerveux"
};

function translateText(text) {
    if (!text) return text;
    let translated = text;
    for (const [en, fr] of Object.entries(translationPatterns)) {
        translated = translated.replace(new RegExp(en, 'gi'), fr);
    }
    // If it's a question about Spanish vocab, add French context
    if (translated.includes("mean?") && !translated.includes("signifie")) {
        translated = translated.replace("mean?", "signifie ?");
    }
    return translated;
}

function translateOptions(options) {
    if (!options || !Array.isArray(options)) return options;
    return options.map(opt => {
        // If option is already Spanish (contains specific Spanish patterns), keep it
        if (/^(Estoy|Tengo|Me |Se |Hay|Soy|Voy|Es |Son |El |La |Los |Las )/i.test(opt)) {
            return opt; // Spanish options stay the same
        }
        return translateText(opt);
    });
}

// Process all song files
const songFiles = fs.readdirSync(songsDir).filter(f => f.endsWith('.json'));

console.log(`Processing ${songFiles.length} song files...`);

for (const file of songFiles) {
    const filePath = path.join(songsDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!content.exercises) continue;

    let modified = false;

    for (const exercise of content.exercises) {
        // Add question_fr if not exists
        if (!exercise.question_fr && exercise.question) {
            exercise.question_fr = translateText(exercise.question);
            modified = true;
        }

        // Add options_fr if not exists
        if (!exercise.options_fr && exercise.options) {
            exercise.options_fr = translateOptions(exercise.options);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
        console.log(`✓ Updated ${file}`);
    } else {
        console.log(`- Skipped ${file} (already has translations)`);
    }
}

console.log('Done!');
