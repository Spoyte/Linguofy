/**
 * Seed Script: Migrate JSON data to Supabase
 * 
 * Run with: node scripts/seed_db.mjs
 * 
 * Prerequisites:
 * 1. Create Supabase project at https://supabase.com
 * 2. Run schema.sql in SQL Editor
 * 3. Copy .env.example to .env.local and fill in values
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
                level: mod.id <= 5 ? 'A1' : 'A2'
            }, { onConflict: 'order_index' });

        if (error) {
            console.error(`  ❌ Module ${mod.id}: ${error.message}`);
        } else {
            console.log(`  ✅ Module ${mod.id}: ${mod.title}`);
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
                    audio_url_mixed: jsonData.audio?.mixed_fr || '',
                    audio_url_pure: jsonData.audio?.pure_es || ''
                }, { onConflict: 'id' });

            if (error) {
                console.error(`  ❌ Lesson ${song.id}: ${error.message}`);
            } else {
                console.log(`  ✅ Lesson ${song.id}: ${song.title}`);
            }
        }
    }
}

async function seedExercises() {
    console.log('📝 Seeding exercises...');

    const songsDir = join(__dirname, '../public/data/songs');
    const files = readdirSync(songsDir).filter(f => f.endsWith('.json'));

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
                        data: {
                            question: ex.question,
                            options: ex.options,
                            answer: ex.correct || ex.answer
                        }
                    });

                if (error && !error.message.includes('duplicate')) {
                    console.error(`  ❌ Exercise ${lessonId}#${i}: ${error.message}`);
                }
            }
            console.log(`  ✅ ${lessonId}: ${exercises.length} exercises`);
        } catch (e) {
            console.log(`  ⚠️ Skipping ${file}: ${e.message}`);
        }
    }
}

async function main() {
    console.log('🚀 Starting Linguofy database seed...\n');

    await seedModules();
    console.log('');

    await seedLessons();
    console.log('');

    await seedExercises();
    console.log('');

    console.log('✅ Seed complete!');
}

main().catch(console.error);
