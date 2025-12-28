import { useState, useEffect } from 'react';

const STORAGE_KEY = 'linguofy_progress';

/**
 * Custom hook for managing user progress.
 * Persists completed lessons to localStorage.
 * 
 * @returns {Object} { completedLessons, markComplete, isComplete, resetProgress }
 */
export function useProgress() {
    const [completedLessons, setCompletedLessons] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Sync to localStorage whenever completedLessons changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completedLessons));
    }, [completedLessons]);

    /**
     * Mark a lesson as complete
     * @param {string} lessonId - e.g. "1-1"
     */
    const markComplete = (lessonId) => {
        setCompletedLessons(prev => {
            if (prev.includes(lessonId)) return prev;
            return [...prev, lessonId];
        });
    };

    /**
     * Check if a lesson is complete
     * @param {string} lessonId
     * @returns {boolean}
     */
    const isComplete = (lessonId) => completedLessons.includes(lessonId);

    /**
     * Reset all progress (useful for testing/dev)
     */
    const resetProgress = () => {
        setCompletedLessons([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        completedLessons,
        markComplete,
        isComplete,
        resetProgress
    };
}

export default useProgress;
