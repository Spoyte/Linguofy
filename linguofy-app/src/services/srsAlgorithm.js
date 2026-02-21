/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 * 
 * Takes a review performance rating and current item stats,
 * returning the updated interval, repetition count, and ease factor.
 * 
 * Rating scale (0-5):
 * 5 - perfect response
 * 4 - correct response after a hesitation
 * 3 - correct response recalled with serious difficulty
 * 2 - incorrect response; where the correct one seemed easy to recall
 * 1 - incorrect response; the correct one remembered
 * 0 - complete blackout
 */

export function calculateSM2(rating, prevRepetition = 0, prevInterval = 0, prevEaseFactor = 2.5) {
    let repetition = prevRepetition;
    let interval = prevInterval;
    let easeFactor = prevEaseFactor;

    // Correct response (3, 4, 5)
    if (rating >= 3) {
        if (repetition === 0) {
            interval = 1;
        } else if (repetition === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        repetition += 1;
    }
    // Incorrect response (0, 1, 2)
    else {
        repetition = 0;
        interval = 1;
    }

    // Update Ease Factor
    // ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));

    // Ease factor cannot fall below 1.3
    if (easeFactor < 1.3) {
        easeFactor = 1.3;
    }

    return {
        repetition,
        interval,
        easeFactor: Number(easeFactor.toFixed(2)),
        nextReviewDate: addDays(new Date(), interval)
    };
}

// Helper to add days to a date
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
