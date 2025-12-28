import { useState } from 'react';
import { useLanguage } from '../i18n';

// Normalize text by removing accents and converting to lowercase
function normalizeText(text) {
    return text
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
        .replace(/[¿¡]/g, ''); // Remove Spanish punctuation
}

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],     // deletion
                    dp[i][j - 1],     // insertion
                    dp[i - 1][j - 1]  // substitution
                );
            }
        }
    }
    return dp[m][n];
}

// Check if answer is close enough (fuzzy match)
function checkFuzzyMatch(userAnswer, correctAnswer) {
    const normalizedUser = normalizeText(userAnswer);
    const normalizedCorrect = normalizeText(correctAnswer);

    // Exact match after normalization
    if (normalizedUser === normalizedCorrect) {
        // Check if original had accent differences
        const hasAccentDiff = userAnswer.toLowerCase().trim() !== correctAnswer.toLowerCase().trim();
        return {
            isCorrect: true,
            isClose: hasAccentDiff,
            distance: 0
        };
    }

    // Calculate edit distance
    const distance = levenshteinDistance(normalizedUser, normalizedCorrect);

    // Allow 1 error for short answers, 2 for longer answers
    const maxAllowedErrors = correctAnswer.length <= 8 ? 1 : 2;

    if (distance <= maxAllowedErrors) {
        return { isCorrect: true, isClose: true, distance };
    }

    return { isCorrect: false, isClose: false, distance };
}

export default function ExerciseEngine({ exercise, onComplete }) {
    const { language, t } = useLanguage();
    const [selected, setSelected] = useState(null);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('idle'); // idle, correct, almostCorrect, incorrect
    const [attempts, setAttempts] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [correction, setCorrection] = useState(null);

    // Get localized exercise content
    const question = language === 'fr' && exercise.question_fr ? exercise.question_fr : exercise.question;
    const options = language === 'fr' && exercise.options_fr ? exercise.options_fr : exercise.options;
    const hint = language === 'fr' && exercise.hint_fr ? exercise.hint_fr : exercise.hint;

    const checkAnswer = () => {
        let isCorrect = false;
        let isClose = false;

        if (exercise.type === 'multiple_choice' || exercise.type === 'fill_blank') {
            isCorrect = selected === exercise.correct;
        } else if (exercise.type === 'translate' || exercise.type === 'translation') {
            const result = checkFuzzyMatch(input, exercise.correct);
            isCorrect = result.isCorrect;
            isClose = result.isClose;

            if (isClose && isCorrect) {
                setCorrection(exercise.correct);
            }
        }

        if (isCorrect) {
            setStatus(isClose ? 'almostCorrect' : 'correct');
            setTimeout(() => {
                onComplete();
                setSelected(null);
                setInput('');
                setStatus('idle');
                setAttempts(0);
                setShowHint(false);
                setCorrection(null);
            }, isClose ? 2500 : 1500); // Show correction longer
        } else {
            setStatus('incorrect');
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= 2 && hint) {
                setShowHint(true);
            }
        }
    };

    const getHintText = () => {
        if (hint) return hint;

        const correct = exercise.correct;
        if (exercise.type === 'translation' || exercise.type === 'translate') {
            return language === 'fr'
                ? `💡 Indice : La réponse commence par "${correct.charAt(0).toUpperCase()}..."`
                : `💡 Hint: The answer starts with "${correct.charAt(0).toUpperCase()}..."`;
        }
        if (exercise.type === 'multiple_choice' || exercise.type === 'fill_blank') {
            return language === 'fr'
                ? `💡 Indice : Pensez au vocabulaire de cette leçon`
                : `💡 Hint: Think about the vocabulary from this lesson`;
        }
        return null;
    };

    const getFeedbackMessage = () => {
        if (status === 'correct') {
            return language === 'fr' ? '¡Muy bien! Correct !' : '¡Muy bien! Correct!';
        }
        if (status === 'almostCorrect') {
            return language === 'fr'
                ? '¡Casi perfecto! Petite correction :'
                : '¡Almost perfect! Small correction:';
        }
        return language === 'fr' ? 'Réessayez...' : 'Try Again...';
    };

    return (
        <div className="w-full max-w-lg mx-auto bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
            <h3 className="text-xl font-bold mb-6 text-center">{question}</h3>

            {/* Multiple Choice & Fill Blank UI */}
            {(exercise.type === 'multiple_choice' || exercise.type === 'fill_blank') && (
                <div className="grid gap-3">
                    {options?.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setSelected(exercise.options[idx]);
                                setStatus('idle');
                            }}
                            className={`p-4 rounded-xl border text-lg transition-all ${selected === exercise.options[idx]
                                ? 'bg-purple-600 border-purple-500 text-white'
                                : 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}

            {/* Text Input UI */}
            {(exercise.type === 'translate' || exercise.type === 'translation') && (
                <div className="my-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setStatus('idle');
                            setCorrection(null);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && input.trim()) {
                                checkAnswer();
                            }
                        }}
                        placeholder={language === 'fr' ? 'Tapez en espagnol...' : 'Type in Spanish...'}
                        className="w-full p-4 rounded-xl bg-slate-900 border border-slate-600 text-white focus:border-purple-500 focus:outline-none text-lg"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        {language === 'fr'
                            ? "💡 Les accents peuvent être ignorés (manana = mañana)"
                            : "💡 Accents can be ignored (manana = mañana)"}
                    </p>
                </div>
            )}

            {/* Feedback Area */}
            {status !== 'idle' && (
                <div className={`mt-6 p-4 rounded-xl text-center font-bold ${status === 'correct' ? 'bg-green-500/20 text-green-400' :
                        status === 'almostCorrect' ? 'bg-amber-500/20 text-amber-300' :
                            'bg-red-500/20 text-red-400'
                    }`}>
                    <div>{getFeedbackMessage()}</div>
                    {correction && status === 'almostCorrect' && (
                        <div className="mt-2 text-lg font-normal">
                            ✍️ <span className="text-white">{correction}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Hint Area - shows after 2 failed attempts */}
            {showHint && status === 'incorrect' && (
                <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
                    {getHintText()}
                </div>
            )}

            {/* Attempt Counter */}
            {attempts > 0 && status === 'incorrect' && (
                <div className="mt-2 text-center text-sm text-slate-500">
                    {language === 'fr'
                        ? `Tentative ${attempts}${attempts < 2 ? ' - Un indice apparaîtra après 2 tentatives' : ''}`
                        : `Attempt ${attempts}${attempts < 2 ? ' - A hint will appear after 2 attempts' : ''}`
                    }
                </div>
            )}

            <button
                onClick={checkAnswer}
                disabled={status === 'correct' || status === 'almostCorrect' || (!selected && !input)}
                className="w-full mt-8 py-4 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl text-lg transition shadow-lg shadow-green-500/20"
            >
                {t('lesson.checkAnswer')}
            </button>
        </div>
    );
}
