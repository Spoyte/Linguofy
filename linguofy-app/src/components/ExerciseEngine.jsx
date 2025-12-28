import { useState } from 'react';
import { useLanguage } from '../i18n';

export default function ExerciseEngine({ exercise, onComplete }) {
    const { language, t } = useLanguage();
    const [selected, setSelected] = useState(null);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState('idle'); // idle, correct, incorrect

    // Get localized exercise content
    const question = language === 'fr' && exercise.question_fr ? exercise.question_fr : exercise.question;
    const options = language === 'fr' && exercise.options_fr ? exercise.options_fr : exercise.options;

    const checkAnswer = () => {
        let isCorrect = false;
        if (exercise.type === 'multiple_choice' || exercise.type === 'fill_blank') {
            isCorrect = selected === exercise.correct;
        } else if (exercise.type === 'translate' || exercise.type === 'translation') {
            isCorrect = input.trim().toLowerCase() === exercise.correct.toLowerCase();
        }

        setStatus(isCorrect ? 'correct' : 'incorrect');
        if (isCorrect) {
            setTimeout(() => {
                onComplete();
                setSelected(null);
                setInput('');
                setStatus('idle');
            }, 1500);
        }
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
                            onClick={() => setSelected(exercise.options[idx])} // Always use original for comparison
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
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={language === 'fr' ? 'Tapez en espagnol...' : 'Type in Spanish...'}
                        className="w-full p-4 rounded-xl bg-slate-900 border border-slate-600 text-white focus:border-purple-500 focus:outline-none text-lg"
                    />
                </div>
            )}

            {/* Feedback Area */}
            {status !== 'idle' && (
                <div className={`mt-6 p-4 rounded-xl text-center font-bold ${status === 'correct' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {status === 'correct'
                        ? (language === 'fr' ? '¡Muy bien! Correct !' : '¡Muy bien! Correct!')
                        : (language === 'fr' ? 'Réessayez...' : 'Try Again...')}
                </div>
            )}

            <button
                onClick={checkAnswer}
                disabled={status === 'correct' || (!selected && !input)}
                className="w-full mt-8 py-4 bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl text-lg transition shadow-lg shadow-green-500/20"
            >
                {t('lesson.checkAnswer')}
            </button>
        </div>
    );
}
