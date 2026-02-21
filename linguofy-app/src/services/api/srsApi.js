import { supabase } from '../../lib/supabase';

/**
 * SRS Api functions to interact with the supabase srs_items table
 */

export const srsApi = {
    /**
     * Get all words currently due for review for the user
     */
    getDueItems: async (userId) => {
        if (!userId) return [];

        try {
            const { data, error } = await supabase
                .from('srs_items')
                .select('*')
                .eq('user_id', userId)
                .lte('next_review_date', new Date().toISOString())
                .order('next_review_date', { ascending: true });

            if (error) throw error;
            return data;
            // eslint-disable-next-line no-unused-vars
        } catch (e) {
            console.error('Error fetching due SRS items:', e);
            return [];
        }
    },

    /**
     * Get the user's entire known vocabulary list from SRS
     */
    getAllItems: async (userId) => {
        if (!userId) return [];

        try {
            const { data, error } = await supabase
                .from('srs_items')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;
            return data;
            // eslint-disable-next-line no-unused-vars
        } catch (e) {
            console.error('Error fetching all SRS items:', e);
            return [];
        }
    },

    /**
     * Upsert a word into the SRS system after a review
     * sm2Results should contain { interval, repetition, easeFactor, nextReviewDate }
     */
    updateItem: async (userId, wordEs, wordEn, sm2Results) => {
        if (!userId || !wordEs) return null;

        try {
            const { data, error } = await supabase
                .from('srs_items')
                .upsert({
                    user_id: userId,
                    word_es: wordEs,
                    word_en: wordEn,
                    interval: sm2Results.interval,
                    repetition: sm2Results.repetition,
                    ease_factor: sm2Results.easeFactor,
                    next_review_date: sm2Results.nextReviewDate.toISOString(),
                    last_reviewed_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id, word_es'
                })
                .select()
                .single();

            if (error) throw error;
            return data;
            // eslint-disable-next-line no-unused-vars
        } catch (e) {
            console.error('Error updating SRS item:', e);
            return null;
        }
    },

    /**
     * Fetch a specific item to see if the user has encountered it before
     */
    getItem: async (userId, wordEs) => {
        if (!userId || !wordEs) return null;

        try {
            const { data, error } = await supabase
                .from('srs_items')
                .select('*')
                .eq('user_id', userId)
                .eq('word_es', wordEs)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // ignore row not found
            return data;
            // eslint-disable-next-line no-unused-vars
        } catch (e) {
            console.error('Error fetching SRS item:', e);
            return null;
        }
    }
};
