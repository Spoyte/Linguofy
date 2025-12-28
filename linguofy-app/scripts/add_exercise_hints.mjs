#!/usr/bin/env node
/**
 * Script to add hints to exercise questions in all song JSON files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const songsDir = path.join(__dirname, '../public/data/songs');

// Hint templates based on question patterns
function generateHint(exercise, lang = 'en') {
    const { type, question, correct } = exercise;

    // For translation exercises, give first letter hint
    if (type === 'translation' || type === 'translate') {
        const firstLetter = correct.charAt(0).toUpperCase();
        const wordCount = correct.split(' ').length;
        if (lang === 'fr') {
            return `💡 La réponse a ${wordCount} mot(s) et commence par "${firstLetter}..."`;
        }
        return `💡 The answer has ${wordCount} word(s) and starts with "${firstLetter}..."`;
    }

    // For multiple choice / fill blank, give contextual hints
    if (type === 'multiple_choice' || type === 'fill_blank') {
        // Check for common patterns and give helpful hints
        const q = question.toLowerCase();

        if (q.includes('buenos días') || q.includes('good morning')) {
            return lang === 'fr'
                ? "💡 Pensez au moment de la journée où le soleil se lève"
                : "💡 Think about the time of day when the sun rises";
        }
        if (q.includes('buenas noches') || q.includes('good night')) {
            return lang === 'fr'
                ? "💡 C'est ce qu'on dit quand il fait nuit"
                : "💡 This is what you say when it's dark outside";
        }
        if (q.includes('cómo estás') || q.includes('how are you')) {
            return lang === 'fr'
                ? "💡 C'est une question sur votre état, vos sentiments"
                : "💡 This is asking about your state, your feelings";
        }
        if (q.includes('me llamo') || q.includes('my name')) {
            return lang === 'fr'
                ? "💡 'Llamo' vient du verbe 'llamarse' (s'appeler)"
                : "💡 'Llamo' comes from the verb 'llamarse' (to call oneself)";
        }
        if (q.includes('tired') || q.includes('fatigué')) {
            return lang === 'fr'
                ? "💡 En espagnol, 'cansado' signifie fatigué"
                : "💡 In Spanish, 'cansado' means tired";
        }
        if (q.includes('gustar') || q.includes('like')) {
            return lang === 'fr'
                ? "💡 'Gustar' fonctionne à l'envers - littéralement 'ça me plaît'"
                : "💡 'Gustar' works backwards - literally 'it pleases me'";
        }
        if (q.includes('voy a') || q.includes('going to')) {
            return lang === 'fr'
                ? "💡 'Ir a + infinitif' = futur proche, comme 'aller + infinitif'"
                : "💡 'Ir a + infinitive' = near future, like 'going to + verb'";
        }
        if (q.includes('preterite') || q.includes('past')) {
            return lang === 'fr'
                ? "💡 Les terminaisons du passé: -é, -aste, -ó pour -AR; -í, -iste, -ió pour -ER/-IR"
                : "💡 Past tense endings: -é, -aste, -ó for -AR; -í, -iste, -ió for -ER/-IR";
        }
        if (q.includes('duele') || q.includes('hurt')) {
            return lang === 'fr'
                ? "💡 'Doler' fonctionne comme 'gustar' - 'me duele la cabeza'"
                : "💡 'Doler' works like 'gustar' - 'me duele la cabeza'";
        }

        // Default hint
        return lang === 'fr'
            ? "💡 Relisez les paroles de la chanson pour trouver la réponse"
            : "💡 Review the song lyrics to find the answer";
    }

    return null;
}

// Process all song files
const songFiles = fs.readdirSync(songsDir).filter(f => f.endsWith('.json'));

console.log(`Adding hints to ${songFiles.length} song files...`);

for (const file of songFiles) {
    const filePath = path.join(songsDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!content.exercises) continue;

    let modified = false;

    for (const exercise of content.exercises) {
        // Add hint if not exists
        if (!exercise.hint) {
            const hint = generateHint(exercise, 'en');
            if (hint) {
                exercise.hint = hint;
                exercise.hint_fr = generateHint(exercise, 'fr');
                modified = true;
            }
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 4));
        console.log(`✓ Added hints to ${file}`);
    } else {
        console.log(`- Skipped ${file} (already has hints)`);
    }
}

console.log('Done!');
