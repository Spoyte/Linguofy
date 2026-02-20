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
    const [isAnimating, setIsAnimating] = useState(false);

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

        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);

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
            return language === 'fr' ? '¡Muy bien! Correct ! ✨' : '¡Muy bien! Correct! ✨';
        }
        if (status === 'almostCorrect') {
            return language === 'fr'
                ? '¡Casi perfecto! Petite correction : 🤏'
                : '¡Almost perfect! Small correction: 🤏';
        }
        return language === 'fr' ? 'Réessayez... 🔄' : 'Try Again... 🔄';
    };

    return (
        <div className={`w-full max-w-2xl mx-auto bg-black/40 backdrop-blur-md p-6 md:p-10 rounded-[2rem] shadow-2xl border transition-all duration-300 ${status === 'correct' ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]' :
                status === 'almostCorrect' ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' :
                    status === 'incorrect' && isAnimating ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] translate-x-[-4px]' :
                        'border-white/10'
            }`}>

            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mb-6 mx-auto">
                <span className="text-2xl">
                    {exercise.type === 'translate' || exercise.type === 'translation' ? '✍️' : '🎯'}
                </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center text-white">{question}</h3>

            {/* Multiple Choice & Fill Blank UI */}
            {(exercise.type === 'multiple_choice' || exercise.type === 'fill_blank') && (
                <div className="grid gap-4">
                    {options?.map((opt, idx) => {
                        const isSelected = selected === exercise.options[idx];
                        const showCorrect = status === 'incorrect' && exercise.options[idx] === exercise.correct && attempts >= 3; // Reveal after 3 attempts

                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (status === 'correct' || status === 'almostCorrect') return;
                                    setSelected(exercise.options[idx]);
                                    setStatus('idle');
                                }}
                                disabled={status === 'correct' || status === 'almostCorrect'}
                                className={`group relative overflow-hidden p-5 rounded-2xl text-lg font-medium transition-all duration-300 flex items-center justify-between
                                    ${isSelected
                                        ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25 scale-[1.02]'
                                        : showCorrect
                                            ? 'bg-green-500/20 border-green-500/50 text-green-300'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white hover:scale-[1.01]'
                                    }`}
                            >
                                <span className="relative z-10">{opt}</span>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                    ${isSelected ? 'border-white bg-white/20' : showCorrect ? 'border-green-400 bg-green-500/20' : 'border-slate-600 group-hover:border-slate-400'}
                                `}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                                    {showCorrect && !isSelected && <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Text Input UI */}
            {(exercise.type === 'translate' || exercise.type === 'translation') && (
                <div className="my-6">
                    <div className="relative">
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
                            disabled={status === 'correct' || status === 'almostCorrect'}
                            placeholder={language === 'fr' ? 'Tapez en espagnol...' : 'Type in Spanish...'}
                            className={`w-full p-6 pl-12 rounded-2xl bg-black/40 border-[2px] text-white focus:outline-none text-xl transition-all shadow-inner
                                ${status === 'correct' ? 'border-green-500 text-green-100' :
                                    status === 'almostCorrect' ? 'border-amber-500 text-amber-100' :
                                        status === 'incorrect' ? 'border-red-500 text-red-100' :
                                            'border-white/10 focus:border-purple-500 focus:bg-white/5'
                                }`}
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50">✍️</span>
                    </div>

                    <p className="text-sm text-slate-500 mt-4 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px]">ℹ</span>
                        {language === 'fr'
                            ? "Les accents peuvent être ignorés (manana = mañana)"
                            : "Accents can be ignored (manana = mañana)"}
                    </p>
                </div>
            )}

            {/* Feedback Area */}
            {status !== 'idle' && (
                <div className={`mt-8 p-6 rounded-2xl text-center backdrop-blur-md border animate-fade-in-up
                    ${status === 'correct' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        status === 'almostCorrect' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                    <div className="font-bold text-xl mb-1">{getFeedbackMessage()}</div>
                    {correction && status === 'almostCorrect' && (
                        <div className="mt-3 p-3 bg-black/30 rounded-xl inline-block border border-white/5">
                            <span className="text-amber-500 mr-2 text-sm uppercase tracking-wide">Correct:</span>
                            <span className="text-white text-lg font-medium">{correction}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Hint Area - shows after 2 failed attempts */}
            {showHint && status === 'incorrect' && (
                <div className="mt-6 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500 flex items-start gap-4">
                    <span className="text-2xl filter drop-shadow-md">💡</span>
                    <div>
                        <h4 className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">Hint</h4>
                        <p className="text-amber-200/90 text-sm md:text-base leading-relaxed">{getHintText()}</p>
                    </div>
                </div>
            )}

            {/* Attempt Counter */}
            {attempts > 0 && status === 'incorrect' && (
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                        <span>✖</span>
                        {language === 'fr'
                            ? `Tentative ${attempts}${attempts < 2 ? ' - Indice dans ' + (2 - attempts) : ''}`
                            : `Attempt ${attempts}${attempts < 2 ? ' - Hint in ' + (2 - attempts) : ''}`
                        }
                    </div>
                </div>
            )}

            <button
                onClick={checkAnswer}
                disabled={status === 'correct' || status === 'almostCorrect' || (!selected && !input)}
                className={`w-full mt-8 py-5 rounded-full font-black text-lg uppercase tracking-wide transition-all duration-300 relative overflow-hidden group
                    ${status === 'correct' || status === 'almostCorrect'
                        ? 'bg-green-500 text-green-900 cursor-default'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-xl shadow-purple-500/25 active:scale-[0.98]'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none
                `}
            >
                {/* Button highlight effect */}
                <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[shine_1.5s_ease-out_infinite]"></div>

                <span className="relative z-10 flex items-center justify-center gap-2">
                    {(status === 'correct' || status === 'almostCorrect') ? '✓' : ''}
                    {t('lesson.checkAnswer')}
                </span>
            </button>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shine {
                    100% { transform: translateX(100%) skewX(-12deg); }
                }
            `}} />
        </div>
    );
}
