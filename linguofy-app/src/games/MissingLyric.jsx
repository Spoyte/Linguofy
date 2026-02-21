import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';
import { srsApi } from '../services/api/srsApi';
import { useAuth } from '../contexts/AuthContext';
import { calculateSM2 } from '../services/srsAlgorithm';

// Mock DB for fallbacks
const FALLBACK_DATA = [
    { sentence_es: "Me gusta cantar en la ducha.", sentence_en: "I like to sing in the shower.", word: "cantar", fake_options: ["bailar", "comer", "correr"] },
    { sentence_es: "El perro corre muy rápido.", sentence_en: "The dog runs very fast.", word: "rápido", fake_options: ["lento", "alto", "rojo"] },
    { sentence_es: "Siempre bebo agua por la mañana.", sentence_en: "I always drink water in the morning.", word: "agua", fake_options: ["leche", "vino", "jugo"] },
    { sentence_es: "La casa tiene tres ventanas grandes.", sentence_en: "The house has three big windows.", word: "ventanas", fake_options: ["puertas", "mesas", "camas"] }
];

export default function MissingLyric() {
    const { completedLessons } = useProgress();
    const { language } = useLanguage();
    const { user } = useAuth();

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);

    // States for interaction
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [animatingOut, setAnimatingOut] = useState(false);

    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load content
    useEffect(() => {
        async function loadContent() {
            setLoading(true);
            let pool = [];
            let vocabList = [];

            // 1. Fetch vocabulary items to use as distractors
            for (const lessonId of completedLessons) {
                try {
                    const res = await fetch(`/data/songs/${lessonId}.json`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.vocabulary) {
                            vocabList = [...vocabList, ...data.vocabulary];
                        }

                        // Parse sentences if data exists
                        if (data.lyrics && data.lyrics.pure_es && data.vocabulary) {
                            const linesEs = data.lyrics.pure_es.split('\n').filter(l => l.trim() && !l.startsWith('['));
                            const linesEn = data.lyrics.en.split('\n').filter(l => l.trim() && !l.startsWith('['));

                            for (let i = 0; i < Math.min(linesEs.length, linesEn.length); i++) {
                                const sentEs = linesEs[i].trim();
                                const sentEn = linesEn[i].trim();

                                // Find a vocab word that exists in this sentence
                                const matchingVocab = data.vocabulary.find(v => {
                                    const regex = new RegExp(`\\b${v.es}\\b`, 'i');
                                    return regex.test(sentEs);
                                });

                                if (matchingVocab && sentEs.split(' ').length > 3) {
                                    pool.push({
                                        sentence_es: sentEs,
                                        sentence_en: sentEn,
                                        word: matchingVocab.es.toLowerCase(),
                                        vocabData: matchingVocab
                                    });
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error("Failed to load lesson:", e);
                }
            }

            // Fallback
            if (pool.length < 3) {
                // Construct standard format from hardcoded fallback
                vocabList = FALLBACK_DATA.map(item => ({ es: item.word, en: "..." }));
                pool = FALLBACK_DATA.map(item => ({
                    sentence_es: item.sentence_es,
                    sentence_en: item.sentence_en,
                    word: item.word,
                    vocabData: { es: item.word, en: "..." },
                    hardcoded_fakes: item.fake_options
                }));
            }

            // Shuffle and cap to 10 rounds
            pool = pool.sort(() => Math.random() - 0.5).slice(0, 10);

            // Generate distractors for each question dynamically
            const fullyFormedQuestions = pool.map(item => {
                const options = [item.word];

                // If it has hardcoded fakes (fallback), use them
                if (item.hardcoded_fakes) {
                    options.push(...item.hardcoded_fakes);
                } else {
                    // Generate 3 random fakes from the global vocab list that aren't the answer
                    let safetyCounter = 0;
                    while (options.length < 4 && safetyCounter < 50) {
                        safetyCounter++;
                        const randomVocab = vocabList[Math.floor(Math.random() * vocabList.length)];
                        const cleanGuess = randomVocab.es.toLowerCase();
                        if (!options.includes(cleanGuess)) {
                            options.push(cleanGuess);
                        }
                    }
                    // If we somehow couldn't find 3 distinct ones, just pad it
                    while (options.length < 4) {
                        options.push(`Option ${options.length}`);
                    }
                }

                return {
                    ...item,
                    options: options.sort(() => Math.random() - 0.5) // Shuffle options
                };
            });

            setQuestions(fullyFormedQuestions);
            setLoading(false);
        }

        loadContent();
    }, [completedLessons]);

    const startGame = () => {
        setScore(0);
        setLives(3);
        setGameOver(false);
        setGameWon(false);
        setCurrentIndex(0);
        setIsPlaying(true);
        setSelectedOption(null);
        setIsCorrect(null);
    };

    const handleOptionSelect = async (option) => {
        if (selectedOption !== null || animatingOut) return; // Prevent double clicking

        const currentQ = questions[currentIndex];
        const correct = option.toLowerCase() === currentQ.word.toLowerCase();

        setSelectedOption(option);
        setIsCorrect(correct);

        if (correct) {
            setScore(s => s + 100 + (lives * 10)); // Reward current lives
            // SRS Hook
            if (user && currentQ.vocabData) {
                // Rate 4 (Good)
                recordSrs(user.id, currentQ.vocabData, 4);
            }
        } else {
            setLives(l => l - 1);
            // SRS Hook
            if (user && currentQ.vocabData) {
                // Rate 1 (Forgot/Incorrect)
                recordSrs(user.id, currentQ.vocabData, 1);
            }
        }

        // Delay before moving to the next question
        setTimeout(() => {
            if (!correct && lives <= 1) {
                setGameOver(true);
                setIsPlaying(false);
            } else {
                setAnimatingOut(true);
                setTimeout(() => {
                    if (currentIndex < questions.length - 1) {
                        setCurrentIndex(prev => prev + 1);
                        setSelectedOption(null);
                        setIsCorrect(null);
                        setAnimatingOut(false);
                    } else {
                        setGameWon(true);
                        setIsPlaying(false);
                    }
                }, 300); // Wait for fade out animation
            }
        }, 1500); // Show right/wrong status for 1.5 seconds
    };

    const recordSrs = async (userId, vocabItem, rating) => {
        try {
            const dbItem = await srsApi.getItem(userId, vocabItem.es);
            const prev = dbItem || { repetition: 0, interval: 0, ease_factor: 2.5 };
            const nextStats = calculateSM2(rating, prev.repetition, prev.interval, prev.ease_factor);
            await srsApi.updateItem(userId, vocabItem.es, vocabItem.en, nextStats);
        } catch (e) {
            console.error("Failed to sync SRS in Missing Lyric", e);
        }
    };

    // Render logic for the sentence with a blank
    const renderSentence = (q) => {
        if (!q) return null;

        // We need an exact match replace, case-insensitive, keeping punctuation surrounding it
        const regex = new RegExp(`(\\b${q.word}\\b)`, 'i');
        const parts = q.sentence_es.split(regex);

        return parts.map((part, i) => {
            if (part.toLowerCase() === q.word.toLowerCase()) {
                return (
                    <span
                        key={i}
                        className={`inline-block min-w-[120px] text-center px-4 py-1 mx-2 border-b-4 font-black transition-all duration-300
                            ${selectedOption === null ? 'border-amber-400 text-amber-400/30' :
                                isCorrect ? 'border-emerald-400 text-emerald-400' :
                                    'border-rose-500 text-rose-500'}
                        `}
                    >
                        {selectedOption !== null ? q.word : '_____'}
                    </span>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-5xl">🧩</div>;
    }

    const currentQ = questions[currentIndex];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-indigo-100 font-sans flex flex-col items-center overflow-hidden selection:bg-indigo-500/30 select-none">

            <header className="w-full bg-slate-950/50 backdrop-blur-md border-b border-white/10 py-3 px-6 shadow-xl flex justify-between items-center z-40">
                <Link to="/games" className="flex items-center gap-2 group">
                    <span className="text-2xl group-hover:-translate-x-1 transition-transform text-indigo-400">←</span>
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-amber-400 group-hover:from-white group-hover:to-indigo-200 transition-all uppercase tracking-widest hidden sm:inline">
                        {language === 'fr' ? 'Arcade' : 'Arcade'}
                    </span>
                </Link>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-rose-400/80 text-[10px] font-black tracking-widest uppercase">Lives</span>
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <span key={i} className={`text-xl ${i < lives ? 'text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'text-slate-800'} transition-colors`}>❤️</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-amber-400/80 text-[10px] font-black tracking-widest uppercase">Score</span>
                        <span className="text-amber-400 font-black text-2xl leading-none">{score}</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 w-full max-w-3xl relative flex flex-col justify-center items-center px-6 py-12">

                {isPlaying && currentQ && !gameOver && !gameWon && (
                    <div className={`w-full transition-all duration-300 ${animatingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>

                        <div className="text-center mb-4">
                            <span className="bg-indigo-900/50 text-indigo-300 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-500/30 shadow-inner">
                                {language === 'fr' ? 'Question' : 'Question'} {currentIndex + 1} / {questions.length}
                            </span>
                        </div>

                        {/* Whiteboard Area */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl w-full text-center relative overflow-hidden group">

                            {/* Decorative glow */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-50"></div>

                            <h3 className="text-indigo-400/80 font-black text-xs uppercase tracking-[0.2em] mb-4">
                                {language === 'fr' ? 'Traduction' : 'Context'}
                            </h3>
                            <p className="text-xl md:text-2xl text-slate-300 italic mb-8 font-light">
                                "{currentQ.sentence_en}"
                            </p>

                            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-2 drop-shadow-md">
                                {renderSentence(currentQ)}
                            </h2>
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full">
                            {currentQ.options.map((opt, i) => {
                                let btnStateClass = 'bg-slate-800/80 hover:bg-slate-700 border-slate-600 text-slate-200 hover:border-indigo-400';

                                if (selectedOption !== null) {
                                    if (opt.toLowerCase() === currentQ.word.toLowerCase()) {
                                        // Highlight correct answer in green
                                        btnStateClass = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.3)] scale-105';
                                    } else if (opt === selectedOption) {
                                        // Highlight wrong choice in red
                                        btnStateClass = 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-shake';
                                    } else {
                                        // Dim the rest
                                        btnStateClass = 'bg-slate-900/50 border-slate-800 text-slate-600 opacity-50';
                                    }
                                }

                                return (
                                    <button
                                        key={i}
                                        disabled={selectedOption !== null}
                                        onClick={() => handleOptionSelect(opt)}
                                        className={`p-6 rounded-2xl border-2 font-black text-xl md:text-2xl tracking-wide transition-all duration-300 ${btnStateClass}`}
                                    >
                                        {opt}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Start Screen */}
                {!isPlaying && !gameOver && !gameWon && (
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center shadow-2xl max-w-lg w-full">
                        <div className="text-8xl mb-6">🧩</div>
                        <h2 className="text-4xl font-black text-amber-400 mb-4 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                            {language === 'fr' ? 'Mot Manquant' : 'Missing Lyric'}
                        </h2>
                        <p className="text-indigo-200 mb-8 text-lg">
                            {language === 'fr'
                                ? 'Lis la phrase tirée de tes chansons et choisis le mot espagnol manquant pour combler le trou !'
                                : 'Read the sentence from your songs and choose the missing Spanish vocabulary word to fill the blank!'}
                        </p>
                        <button
                            onClick={startGame}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xl py-4 px-12 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105 uppercase tracking-widest w-full sm:w-auto"
                        >
                            {language === 'fr' ? 'Jouer' : 'Play'}
                        </button>
                    </div>
                )}

                {/* Game Over Screen */}
                {gameOver && (
                    <div className="bg-rose-950/80 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-10 text-center shadow-2xl max-w-lg w-full animate-fade-in-up">
                        <div className="text-7xl mb-4">💥</div>
                        <h2 className="text-4xl font-black text-rose-500 mb-2 uppercase tracking-widest drop-shadow-md">Game Over</h2>
                        <p className="text-white text-xl mb-8">
                            {language === 'fr' ? 'Score Final :' : 'Final Score:'} <span className="font-black text-4xl text-amber-400 block mt-2">{score}</span>
                        </p>
                        <button
                            onClick={startGame}
                            className="bg-rose-500 hover:bg-rose-400 text-white font-black py-4 px-12 rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.4)] transition-all transform hover:scale-105 uppercase tracking-widest w-full sm:w-auto"
                        >
                            {language === 'fr' ? 'Réessayer' : 'Try Again'}
                        </button>
                    </div>
                )}

                {/* Victory Screen */}
                {gameWon && (
                    <div className="bg-emerald-950/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-10 text-center shadow-2xl max-w-lg w-full animate-fade-in-up">
                        <div className="text-7xl mb-4">🏆</div>
                        <h2 className="text-4xl font-black text-emerald-400 mb-2 uppercase tracking-widest drop-shadow-md">
                            {language === 'fr' ? 'Victoire !' : 'Victory!'}
                        </h2>
                        <p className="text-white text-xl mb-8">
                            {language === 'fr' ? 'Score Final :' : 'Final Score:'} <span className="font-black text-4xl text-amber-400 block mt-2">{score}</span>
                        </p>
                        <button
                            onClick={startGame}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black py-4 px-12 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all transform hover:scale-105 uppercase tracking-widest w-full sm:w-auto"
                        >
                            {language === 'fr' ? 'Rejouer' : 'Play Again'}
                        </button>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    50% { transform: translateX(5px); }
                    75% { transform: translateX(-5px); }
                }
                .animate-shake { animation: shake 0.4s ease-in-out; }
                `
            }} />
        </div>
    );
}
