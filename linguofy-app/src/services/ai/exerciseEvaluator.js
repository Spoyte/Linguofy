/**
 * AI Service: Exercise Evaluator
 * 
 * This service handles evaluating free-form user input (like open-ended translations 
 * or spoken audio). It communicates with an LLM to grade the user's response, 
 * catching subtle nuances or synonyms that a hardcoded regex would miss.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api/ai/evaluate';

export const exerciseEvaluatorService = {

    /**
     * Evaluates a user's free-text translation or response.
     * 
     * @param {String} prompt - The original question or sentence to translate
     * @param {String} expectedResponse - The "ideal" answer
     * @param {String} userResponse - What the user actually typed
     * @returns {Promise<Object>} - Grade and feedback
     */
    async evaluateTextResponse({ prompt, expectedResponse, userResponse }) {
        console.log(`[AI Evaluator Scaffold] Grading "${userResponse}" against "${expectedResponse}"...`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock logic for demo purposes
        const isCorrect = userResponse.toLowerCase().trim() === expectedResponse.toLowerCase().trim();

        if (isCorrect) {
            return {
                isCorrect: true,
                feedback: "¡Perfecto! You nailed it."
            };
        }

        // If it's wrong, we simulate the AI giving contextual feedback
        return {
            isCorrect: false,
            feedback: `Almost! You said "${userResponse}", but a better way is "${expectedResponse}". Pay attention to gendered nouns.`
        };
    },

    /**
     * Generates dynamic hints for an exercise when the user is stuck.
     * 
     * @param {Object} exercise - The exercise data
     * @returns {Promise<String>} - A helpful hint that doesn't completely give away the answer
     */
    async generateDynamicHint(exercise) {
        console.log(`[AI Evaluator Scaffold] Generating hint for exercise...`);

        await new Promise(resolve => setTimeout(resolve, 1000));

        // In reality, this would prompt an LLM: "Give a hint for ${exercise.question} without revealing the answer (${exercise.answer})"
        return "Think about the verb conjugation for 'yo' in the present tense.";
    }
};
