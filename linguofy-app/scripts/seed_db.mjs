/**
 * Seed Script: Migrate JSON data to Supabase
 * 
 * Run with: node scripts/seed_db.mjs
 * 
 * Prerequisites:
 * 1. Create Supabase project at https://supabase.com
 * 2. Run schema.sql in SQL Editor
 * 3. Set environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY
 * 4. Run this script
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_ROLE_KEY';

if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    console.error('❌ Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables');
    console.log('   Example: SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx node scripts/seed_db.mjs');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Language ratio progression (from song_generation_system.md)
const NATIVE_RATIOS = {
    1: 0.80, 2: 0.64, 3: 0.51, 4: 0.41,
    5: 0.33, 6: 0.26, 7: 0.21, 8: 0.17
};

// Import courseData (we'll read it as JSON for the script)
const courseDataPath = join(__dirname, '../src/data/courseData.js');
const courseDataContent = readFileSync(courseDataPath, 'utf-8');

// Parse modules from the JS file (simple extraction)
const modulesMatch = courseDataContent.match(/export const modules = (\[[\s\S]*?\]);/);
if (!modulesMatch) {
    console.error('❌ Could not parse courseData.js');
    process.exit(1);
}
const modules = eval(modulesMatch[1]);

async function seedModules() {
    console.log('📦 Seeding modules...');

    for (const mod of modules) {
        const { error } = await supabase
            .from('modules')
            .upsert({
                order_index: mod.id,
                title: mod.title,
                description: mod.desc,
                level: mod.id <= 5 ? 'A1' : 'A2',
                native_language_ratio: NATIVE_RATIOS[mod.id] || 0.50
            }, { onConflict: 'order_index' });

        if (error) {
            console.error(`  ❌ Module ${mod.id}: ${error.message}`);
        } else {
            console.log(`  ✅ Module ${mod.id}: ${mod.title} (${(NATIVE_RATIOS[mod.id] * 100).toFixed(0)}% native)`);
        }
    }
}

async function seedLessons() {
    console.log('🎵 Seeding lessons...');

    // Get module UUIDs
    const { data: dbModules } = await supabase
        .from('modules')
        .select('id, order_index');

    const moduleMap = new Map(dbModules.map(m => [m.order_index, m.id]));

    for (const mod of modules) {
        const moduleUuid = moduleMap.get(mod.id);

        for (const song of mod.songs) {
            // Try to load the JSON file for this song
            let jsonData = {};
            try {
                const jsonPath = join(__dirname, `../public/data/songs/${song.id}.json`);
                jsonData = JSON.parse(readFileSync(jsonPath, 'utf-8'));
            } catch (e) {
                console.log(`  ⚠️ No JSON found for ${song.id}`);
                continue;
            }

            const { error } = await supabase
                .from('lessons')
                .upsert({
                    id: song.id,
                    module_id: moduleUuid,
                    title: jsonData.title || song.title,
                    type: 'song',
                    status: song.status || 'draft',
                    style_prompt: jsonData.style || '',
                    content: {
                        lyrics_mixed_fr: jsonData.lyrics?.mixed_fr || '',
                        lyrics_mixed_en: jsonData.lyrics?.mixed_en || '',
                        lyrics_pure_es: jsonData.lyrics?.pure_es || ''
                    },
                    audio_urls: {
                        mixed_fr: jsonData.audio?.mixed_fr || '',
                        mixed_en: jsonData.audio?.mixed_en || '',
                        pure_es: jsonData.audio?.pure_es || ''
                    },
                    known_vocab: jsonData.knownVocab || [],
                    focus_vocab: jsonData.focusVocab || []
                }, { onConflict: 'id' });

            if (error) {
                console.error(`  ❌ Lesson ${song.id}: ${error.message}`);
            } else {
                const vocabCount = (jsonData.focusVocab || []).length;
                console.log(`  ✅ Lesson ${song.id}: ${jsonData.title} (${vocabCount} focus vocab)`);
            }
        }
    }
}

async function seedExercises() {
    console.log('📝 Seeding exercises...');

    // First, clear existing exercises to avoid duplicates
    const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
        console.log('  ⚠️ Could not clear existing exercises:', deleteError.message);
    }

    const songsDir = join(__dirname, '../public/data/songs');
    const files = readdirSync(songsDir).filter(f => f.endsWith('.json'));

    let totalExercises = 0;
    let withHints = 0;
    let withFrench = 0;

    for (const file of files) {
        const lessonId = file.replace('.json', '');
        const jsonPath = join(songsDir, file);

        try {
            const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
            const exercises = data.exercises || [];

            for (let i = 0; i < exercises.length; i++) {
                const ex = exercises[i];

                const { error } = await supabase
                    .from('exercises')
                    .insert({
                        lesson_id: lessonId,
                        order_index: i,
                        type: ex.type || 'multiple_choice',
                        question: ex.question,
                        question_fr: ex.question_fr || null,
                        options: ex.options || null,
                        options_fr: ex.options_fr || null,
                        correct_answer: ex.correct || ex.answer,
                        hint: ex.hint || null,
                        hint_fr: ex.hint_fr || null
                    });

                if (error) {
                    console.error(`  ❌ Exercise ${lessonId}#${i}: ${error.message}`);
                } else {
                    totalExercises++;
                    if (ex.hint) withHints++;
                    if (ex.question_fr) withFrench++;
                }
            }
            console.log(`  ✅ ${lessonId}: ${exercises.length} exercises`);
        } catch (e) {
            console.log(`  ⚠️ Skipping ${file}: ${e.message}`);
        }
    }

    console.log(`\n  📊 Summary: ${totalExercises} exercises, ${withHints} with hints, ${withFrench} with French translations`);
}

async function main() {
    console.log('🚀 Starting Linguofy database seed...\n');
    console.log('📋 This script will migrate:');
    console.log('   - 8 modules with native language ratios');
    console.log('   - 24 lessons with lyrics, audio paths, and vocabulary');
    console.log('   - 72 exercises with hints and French translations\n');

    await seedModules();
    console.log('');

    await seedLessons();
    console.log('');

    await seedExercises();
    console.log('');

    console.log('✅ Seed complete!');
}

main().catch(console.error);
