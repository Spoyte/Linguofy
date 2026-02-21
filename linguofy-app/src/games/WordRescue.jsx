import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';
import { srsApi } from '../services/api/srsApi';
import { useAuth } from '../contexts/AuthContext';
import { calculateSM2 } from '../services/srsAlgorithm';

// Mock DB for fallbacks
const FALLBACK_VOCAB = [
    { es: "manzana", en: "apple" },
    { es: "perro", en: "dog" },
    { es: "gato", en: "cat" },
    { es: "computadora", en: "computer" },
    { es: "ventana", en: "window" },
    { es: "puerta", en: "door" }
];

const MAX_LIVES = 6;
const KEYBOARD = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export default function WordRescue() {
    const { completedLessons } = useProgress();
    const { language } = useLanguage();
    const { user } = useAuth();

    const [vocabPool, setVocabPool] = useState([]);
    const [currentWord, setCurrentWord] = useState(null);
    const [guessedLetters, setGuessedLetters] = useState(new Set());
    const [lives, setLives] = useState(MAX_LIVES);
    const [score, setScore] = useState(0);

    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [roundWon, setRoundWon] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);

    const [wordsPlayed, setWordsPlayed] = useState(0);

    // Load content
    useEffect(() => {
        async function loadContent() {
            setLoading(true);
            let pool = [];

            for (const lessonId of completedLessons) {
                try {
                    const res = await fetch(`/data/songs/${lessonId}.json`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.vocabulary) {
                            pool = [...pool, ...data.vocabulary];
                        }
                    }
                } catch (e) {
                    // Ignore
                }
            }

            if (pool.length < 3) {
                pool = FALLBACK_VOCAB;
            }

            // Clean up and shuffle
            pool = pool.filter(v => v.es && v.es.length > 2 && !v.es.includes(' '));
            pool = pool.sort(() => Math.random() - 0.5);

            setVocabPool(pool);
            setLoading(false);
        }
        loadContent();
    }, [completedLessons]);

    const setupRound = useCallback(() => {
        if (vocabPool.length === 0) return;

        // Pick next word
        const nextWord = vocabPool[wordsPlayed % vocabPool.length];
        setCurrentWord({
            original: nextWord.es.toUpperCase(),
            en: nextWord.en,
            rawItem: nextWord
        });

        setGuessedLetters(new Set());
        setLives(MAX_LIVES);
        setRoundWon(false);
        setGameOver(false);
    }, [vocabPool, wordsPlayed]);

    const startGame = () => {
        setScore(0);
        setWordsPlayed(0);
        setGameWon(false);
        setIsPlaying(true);
        setupRound();
    };

    const handleKeyPress = useCallback((key) => {
        if (!isPlaying || gameOver || roundWon || !currentWord) return;

        const letter = key.toUpperCase();
        if (guessedLetters.has(letter)) return; // Already guessed

        const newGuessed = new Set(guessedLetters);
        newGuessed.add(letter);
        setGuessedLetters(newGuessed);

        if (!currentWord.original.includes(letter)) {
            // Wrong guess
            const newLives = lives - 1;
            setLives(newLives);
            setScore(s => Math.max(0, s - 5));

            if (newLives <= 0) {
                // Game Over
                setGameOver(true);
                setIsPlaying(false);
                if (user && currentWord.rawItem) {
                    recordSrs(user.id, currentWord.rawItem, 0); // Blackout
                }
            }
        } else {
            // Correct guess
            setScore(s => s + 20);

            // Check if won round
            const lettersInWord = new Set(currentWord.original.split(''));
            let won = true;
            lettersInWord.forEach(l => {
                if (!newGuessed.has(l)) won = false;
            });

            if (won) {
                setRoundWon(true);
                setScore(s => s + 100 + (lives * 10)); // Reward life conservation
                if (user && currentWord.rawItem) {
                    recordSrs(user.id, currentWord.rawItem, lives === MAX_LIVES ? 5 : 4);
                }

                setTimeout(() => {
                    if (wordsPlayed + 1 >= Math.min(10, vocabPool.length)) {
                        setGameWon(true);
                        setIsPlaying(false);
                    } else {
                        setWordsPlayed(prev => prev + 1);
                    }
                }, 2000);
            }
        }
    }, [isPlaying, gameOver, roundWon, currentWord, guessedLetters, lives, user, wordsPlayed, vocabPool.length]);

    // Keyboard event listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toUpperCase();
            if (/[A-Z]/.test(key) && key.length === 1 || key === 'Ñ') {
                handleKeyPress(key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyPress]);

    // Auto-progress to next round if we just incremented wordsPlayed
    useEffect(() => {
        if (isPlaying && !gameWon && wordsPlayed > 0 && roundWon) {
            setupRound();
        }
    }, [wordsPlayed, isPlaying, gameWon, roundWon, setupRound]);


    const recordSrs = async (userId, vocabItem, rating) => {
        try {
            const dbItem = await srsApi.getItem(userId, vocabItem.es);
            const prev = dbItem || { repetition: 0, interval: 0, ease_factor: 2.5 };
            const nextStats = calculateSM2(rating, prev.repetition, prev.interval, prev.ease_factor);
            await srsApi.updateItem(userId, vocabItem.es, vocabItem.en, nextStats);
        } catch (e) {
            console.error("Failed to sync SRS", e);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-sky-950 flex items-center justify-center text-5xl">🛟</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-600 text-white font-sans flex flex-col items-center overflow-hidden selection:bg-white/30 select-none">

            <header className="w-full bg-sky-900/50 backdrop-blur-md border-b border-white/20 py-3 px-6 shadow-xl flex justify-between items-center z-40">
                <Link to="/games" className="flex items-center gap-2 group">
                    <span className="text-2xl group-hover:-translate-x-1 transition-transform text-white">←</span>
                    <span className="text-xl font-black text-white group-hover:text-yellow-300 transition-all uppercase tracking-widest hidden sm:inline">
                        {language === 'fr' ? 'Arcade' : 'Arcade'}
                    </span>
                </Link>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-sky-100 text-[10px] font-black tracking-widest uppercase">Score</span>
                        <span className="text-yellow-300 font-black text-2xl leading-none drop-shadow-md">{score}</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 w-full max-w-2xl relative flex flex-col items-center py-6 px-4">

                {isPlaying && currentWord && !gameOver && !gameWon && (
                    <div className="w-full flex-1 flex flex-col items-center pt-4">

                        {/* 1. Visual Area: Balloons and Character */}
                        <div className="relative w-full h-[250px] sm:h-[300px] mb-8 flex flex-col items-center justify-start">
                            {/* Clouds background */}
                            <div className="absolute top-10 left-10 text-6xl opacity-40">☁️</div>
                            <div className="absolute top-24 right-10 text-5xl opacity-30">☁️</div>

                            <div className={`transition-transform duration-1000 ${roundWon ? 'translate-y-[-50px] scale-110' : ''}`}>
                                {/* Balloons */}
                                <div className="flex justify-center gap-1 mb-2">
                                    {[...Array(MAX_LIVES)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`text-4xl transition-all duration-300 origin-bottom transform ${i >= lives ? 'scale-0 opacity-0 rotate-45' : 'scale-100 opacity-100 hover:-translate-y-2'}`}
                                            title="Life"
                                        >
                                            🎈
                                        </div>
                                    ))}
                                </div>
                                {/* Character (Hanging from balloons) */}
                                <div className={`text-6xl text-center transition-all duration-300 drop-shadow-xl
                                    ${lives <= 2 ? 'animate-shake' : 'animate-bounce-slow'}
                                `}>
                                    {roundWon ? '🦸‍♂️' : lives === 0 ? '💥' : lives <= 2 ? '😰' : '😃'}
                                </div>
                            </div>
                        </div>

                        {/* 2. Target Word Hint Area */}
                        <div className="text-center mb-8 backdrop-blur-md bg-white/10 px-8 py-4 rounded-3xl border border-white/20 shadow-lg min-w-[300px]">
                            <p className="text-sky-100 font-bold uppercase tracking-widest text-xs mb-1">
                                {language === 'fr' ? 'Traduis :' : 'Translate:'}
                            </p>
                            <h2 className="text-3xl font-black text-yellow-300 drop-shadow-md">
                                "{currentWord.en}"
                            </h2>
                        </div>

                        {/* 3. The Word blanks */}
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12 min-h-[60px]">
                            {currentWord.original.split('').map((letter, i) => {
                                const isGuessed = guessedLetters.has(letter) || roundWon;
                                const isMissed = gameOver && !guessedLetters.has(letter);

                                return (
                                    <div
                                        key={i}
                                        className={`w-10 h-14 sm:w-14 sm:h-16 flex items-center justify-center text-3xl sm:text-4xl font-black rounded-lg sm:rounded-xl shadow-inner
                                            ${isGuessed
                                                ? 'bg-white text-sky-600 shadow-[0_4px_10px_rgba(0,0,0,0.2)] scale-110 animate-pop-in'
                                                : isMissed
                                                    ? 'bg-rose-500 text-white shadow-[0_4px_10px_rgba(244,63,94,0.4)]'
                                                    : 'bg-white/20 text-transparent border-b-4 border-white/50'
                                            }
                                        `}
                                    >
                                        {isGuessed || isMissed ? letter : '_'}
                                    </div>
                                );
                            })}
                        </div>

                        {/* 4. On-Screen Keyboard */}
                        <div className="w-full max-w-lg mx-auto flex flex-col gap-2 relative z-20">
                            {KEYBOARD.map((row, i) => (
                                <div key={i} className="flex justify-center gap-1 sm:gap-2">
                                    {row.map(key => {
                                        const isGuessed = guessedLetters.has(key);
                                        const isCorrect = isGuessed && currentWord.original.includes(key);
                                        const isWrong = isGuessed && !currentWord.original.includes(key);

                                        let btnClass = "bg-white/20 text-white border-white/30 hover:bg-white/30 cursor-pointer shadow-md active:scale-95";

                                        if (isCorrect || roundWon) {
                                            btnClass = "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] opacity-80 cursor-default scale-95";
                                        } else if (isWrong) {
                                            btnClass = "bg-slate-800/80 text-slate-500 border-slate-700 opacity-50 cursor-default scale-95";
                                        }

                                        return (
                                            <button
                                                key={key}
                                                disabled={isGuessed || roundWon || gameOver}
                                                onClick={() => handleKeyPress(key)}
                                                className={`flex-1 max-w-[45px] h-12 sm:max-w-[55px] sm:h-14 rounded-lg sm:rounded-xl font-black text-lg sm:text-xl border-2 transition-all duration-200 flex items-center justify-center ${btnClass}`}
                                            >
                                                {key}
                                            </button>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Start Screen */}
                {!isPlaying && !gameOver && !gameWon && (
                    <div className="bg-sky-900/80 backdrop-blur-xl border border-white/20 rounded-3xl p-10 text-center shadow-2xl max-w-lg w-full mt-10">
                        <div className="text-8xl mb-6">🛟</div>
                        <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-widest drop-shadow-md">
                            {language === 'fr' ? 'Sauvetage de Mots' : 'Word Rescue'}
                        </h2>
                        <p className="text-sky-100 mb-8 text-lg">
                            {language === 'fr'
                                ? 'Épelle la traduction espagnole lettre par lettre pour sauver le personnage ! Tu perds un ballon pour chaque erreur.'
                                : 'Spell the Spanish translation letter by letter to rescue the character! You lose a balloon for every wrong guess.'}
                        </p>
                        <button
                            onClick={startGame}
                            className="bg-yellow-400 hover:bg-yellow-300 text-sky-900 font-black text-xl py-4 px-12 rounded-2xl shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all transform hover:scale-105 uppercase tracking-widest w-full sm:w-auto"
                        >
                            {language === 'fr' ? 'Jouer' : 'Play'}
                        </button>
                    </div>
                )}

                {/* Game Over Screen */}
                {gameOver && (
                    <div className="bg-rose-900/90 backdrop-blur-xl border border-rose-400 rounded-3xl p-10 text-center shadow-2xl max-w-lg w-full mt-10 animate-fade-in-up">
                        <div className="text-7xl mb-4">💥</div>
                        <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-widest drop-shadow-md">Game Over</h2>
                        <div className="text-xl text-rose-200 mb-6 bg-rose-950/50 py-3 rounded-xl border border-rose-800">
                            {language === 'fr' ? 'Le mot était :' : 'The word was:'} <span className="font-black text-white block mt-1">{currentWord?.original}</span>
                        </div>
                        <p className="text-white text-xl mb-8">
                            {language === 'fr' ? 'Score Final :' : 'Final Score:'} <span className="font-black text-4xl text-yellow-300 block mt-2">{score}</span>
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
                    <div className="bg-emerald-600/90 backdrop-blur-xl border border-emerald-300 rounded-3xl p-10 text-center shadow-2xl max-w-lg w-full mt-10 animate-fade-in-up">
                        <div className="text-7xl mb-4">🦸‍♂️</div>
                        <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-widest drop-shadow-md">
                            {language === 'fr' ? 'Tu les as sauvés !' : 'You rescued them!'}
                        </h2>
                        <p className="text-white text-xl mb-8">
                            {language === 'fr' ? 'Score Final :' : 'Final Score:'} <span className="font-black text-4xl text-yellow-300 block mt-2">{score}</span>
                        </p>
                        <button
                            onClick={startGame}
                            className="bg-yellow-400 hover:bg-yellow-300 text-emerald-900 font-black py-4 px-12 rounded-2xl shadow-[0_0_30px_rgba(250,204,21,0.5)] transition-all transform hover:scale-105 uppercase tracking-widest w-full sm:w-auto"
                        >
                            {language === 'fr' ? 'Rejouer' : 'Play Again'}
                        </button>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(-5px); }
                    50% { transform: translateY(5px); }
                }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
                
                @keyframes pop-in {
                    0% { transform: scale(0.5); opacity: 0; }
                    80% { transform: scale(1.15); opacity: 1; }
                    100% { transform: scale(1.1); opacity: 1; }
                }
                .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0) translateY(5px); }
                    25% { transform: translateX(-2px) translateY(5px); }
                    50% { transform: translateX(2px) translateY(5px); }
                    75% { transform: translateX(-2px) translateY(5px); }
                }
                .animate-shake { animation: shake 0.2s ease-in-out infinite; }
                `
            }} />
        </div>
    );
}
