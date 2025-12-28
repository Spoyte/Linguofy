import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Fallback to static data if Supabase is not configured
import { modules as staticModules } from '../data/courseData';

/**
 * Hook to fetch modules and lessons from Supabase (or fallback to static data)
 */
export function useCourseData() {
    const [modules, setModules] = useState(staticModules);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            // If Supabase isn't configured, use static data
            if (!isSupabaseConfigured()) {
                setModules(staticModules);
                setLoading(false);
                return;
            }

            try {
                // Fetch modules with their lessons
                const { data: dbModules, error: modError } = await supabase
                    .from('modules')
                    .select(`
                        id,
                        order_index,
                        title,
                        description,
                        level,
                        lessons (
                            id,
                            title,
                            type,
                            status,
                            audio_url_mixed,
                            audio_url_pure
                        )
                    `)
                    .order('order_index');

                if (modError) throw modError;

                // Transform to match existing format
                const transformed = dbModules.map(mod => ({
                    id: mod.order_index,
                    title: mod.title,
                    desc: mod.description,
                    songs: mod.lessons.map(lesson => ({
                        id: lesson.id,
                        title: lesson.title,
                        type: lesson.type,
                        status: lesson.status
                    }))
                }));

                setModules(transformed);
            } catch (err) {
                console.error('Error fetching course data:', err);
                setError(err);
                // Fallback to static data on error
                setModules(staticModules);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return { modules, loading, error };
}

/**
 * Hook to fetch exercises for a specific lesson
 */
export function useExercises(lessonId) {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchExercises() {
            // If Supabase isn't configured, fetch from JSON
            if (!isSupabaseConfigured()) {
                try {
                    const res = await fetch(`/data/songs/${lessonId}.json`);
                    const data = await res.json();
                    setExercises(data.exercises || []);
                } catch (err) {
                    setError(err);
                }
                setLoading(false);
                return;
            }

            try {
                const { data, error: exError } = await supabase
                    .from('exercises')
                    .select('*')
                    .eq('lesson_id', lessonId)
                    .order('order_index');

                if (exError) throw exError;

                // Transform to match existing format
                const transformed = data.map(ex => ({
                    id: ex.id,
                    type: ex.type,
                    question: ex.data.question,
                    options: ex.data.options,
                    correct: ex.data.answer
                }));

                setExercises(transformed);
            } catch (err) {
                console.error('Error fetching exercises:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        if (lessonId) {
            fetchExercises();
        }
    }, [lessonId]);

    return { exercises, loading, error };
}
