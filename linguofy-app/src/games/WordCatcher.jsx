import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { srsApi } from '../services/api/srsApi';
import { calculateSM2 } from '../services/srsAlgorithm';

// Fallback vocab
const FALLBACK_VOCAB = [
    { es: "Hola", en: "Hello" },
    { es: "Gato", en: "Cat" },
    { es: "Perro", en: "Dog" },
    { es: "Agua", en: "Water" },
    { es: "Pan", en: "Bread" },
    { es: "Cielo", en: "Sky" },
    { es: "Día", en: "Day" },
    { es: "Noche", en: "Night" },
];

export default function WordCatcher() {
    const { completedLessons } = useProgress();
    const { language } = useLanguage();
    const { user } = useAuth();

    const [vocabulary, setVocabulary] = useState([]);
    const [targetWordEn, setTargetWordEn] = useState(null);
    const [fallingWords, setFallingWords] = useState([]);

    // Basket position % from left (0 to 100)
    const [basketPosition, setBasketPosition] = useState(50);
    const gameAreaRef = useRef(null);

    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);

    const requestRef = useRef();
    const lastTimeRef = useRef();

    // Load vocabulary
    useEffect(() => {
        async function loadContent() {
            setLoading(true);
            let userVocab = [];

            // 1. Try fetching Due SRS items first
            if (user) {
                const dueItems = await srsApi.getDueItems(user.id);
                if (dueItems && dueItems.length >= 5) {
                    userVocab = dueItems.map(item => ({
                        es: item.word_es,
                        en: item.word_en,
                        srs: item
                    }));
                }
            }

            // 2. Fallback to extracting from completed lessons
            if (userVocab.length < 5) {
                for (const lessonId of completedLessons) {
                    try {
                        const res = await fetch(`/data/songs/${lessonId}.json`);
                        if (res.ok) {
                            const data = await res.json();
                            if (data.vocabulary && Array.isArray(data.vocabulary)) {
                                data.vocabulary.forEach(item => {
                                    if (item.es && item.en && !userVocab.find(v => v.es === item.es)) {
                                        userVocab.push({ es: item.es, en: item.en, srs: null });
                                    }
                                });
                            }
                        }
                        // eslint-disable-next-line no-unused-vars
                    } catch (e) {
                        // Ignore
                    }
                }
            }

            // 3. Absolute minimum fallback
            if (userVocab.length < 5) {
                userVocab = FALLBACK_VOCAB.map(v => ({ ...v, srs: null }));
            }

            setVocabulary(userVocab);
            setLoading(false);
        }

        loadContent();
    }, [completedLessons, user]);

    // Handle dragging the basket
    const handleMove = useCallback((clientX) => {
        if (!isPlaying || gameOver || !gameAreaRef.current) return;
        const rect = gameAreaRef.current.getBoundingClientRect();

        // Calculate percentage relative to game area width
        let xPos = ((clientX - rect.left) / rect.width) * 100;

        // Clamp between 5% and 95% to keep basket visible
        xPos = Math.max(5, Math.min(95, xPos));
        setBasketPosition(xPos);
    }, [isPlaying, gameOver]);

    const onTouchMove = (e) => handleMove(e.touches[0].clientX);
    const onMouseMove = (e) => {
        // Only move if mouse is down to simulate drag, or just follow mouse
        // Given it's a web game, just following the mouse is easier for desktop testing
        handleMove(e.clientX);
    };

    // Global touch prevent default to stop scrolling while playing
    useEffect(() => {
        const preventDefault = (e) => {
            if (isPlaying) e.preventDefault();
        };
        const area = gameAreaRef.current;
        if (area) {
            area.addEventListener('touchmove', preventDefault, { passive: false });
            return () => area.removeEventListener('touchmove', preventDefault);
        }
    }, [isPlaying, gameAreaRef]);

    const startGame = () => {
        setScore(0);
        setLives(3);
        setGameOver(false);
        setFallingWords([]);
        setBasketPosition(50);
        pickNewTarget(vocabulary);
        setIsPlaying(true);
    };

    const pickNewTarget = (vocabList) => {
        const randomItem = vocabList[Math.floor(Math.random() * vocabList.length)];
        setTargetWordEn(randomItem.en);
    };

    const spawnWord = () => {
        if (!targetWordEn) return null;

        const isMatch = Math.random() > 0.6; // 40% chance of correct word

        let esWord = "";
        if (isMatch) {
            const matchItem = vocabulary.find(v => v.en === targetWordEn);
            esWord = matchItem ? matchItem.es : "Error";
        } else {
            let wrongItem;
            do {
                wrongItem = vocabulary[Math.floor(Math.random() * vocabulary.length)];
            } while (wrongItem.en === targetWordEn && vocabulary.length > 1);
            esWord = wrongItem.es;
        }

        // Random X position between 10% and 90%
        const startX = 10 + Math.random() * 80;

        // Base speed increases with score
        const baseSpeed = 15 + (Math.floor(score / 50) * 3);
        // Randomize speed slightly per word
        const speed = baseSpeed + (Math.random() * 10 - 5);

        return {
            id: Math.random().toString(36).substr(2, 9),
            es: esWord,
            isMatch: isMatch,
            x: startX,
            y: -10, // Start above screen
            speed: speed
        };
    };

    // The Main Game Loop
    const updateGame = useCallback((time) => {
        if (!lastTimeRef.current) {
            lastTimeRef.current = time;
        }
        const deltaTime = (time - lastTimeRef.current) / 1000; // in seconds
        lastTimeRef.current = time;

        if (isPlaying && !gameOver) {
            setFallingWords(prevWords => {
                let currentWords = [...prevWords];

                // Spawn new words
                const shouldSpawn = Math.random() < (0.015 + (score * 0.0001)); // Spawn rate increases slightly
                if (shouldSpawn && currentWords.length < 5) {
                    const newWord = spawnWord();
                    if (newWord) currentWords.push(newWord);
                }

                // Move and check collisions
                let nextWords = [];
                let localScoreStr = 0;
                let livesLost = 0;

                for (let i = 0; i < currentWords.length; i++) {
                    let word = currentWords[i];

                    // Move down
                    word.y += word.speed * deltaTime;

                    // Collision detection zone
                    // Basket is roughly y=85 to y=95
                    // Basket width is ~20% of screen
                    const BASKET_Y_ZONE = 80;
                    const BASKET_WIDTH = 25; // % tolerance

                    if (word.y >= BASKET_Y_ZONE && word.y <= 100) {
                        const distanceX = Math.abs(word.x - basketPosition);

                        if (distanceX < BASKET_WIDTH / 2) {
                            // CAUGHT!
                            if (word.isMatch) {
                                localScoreStr += 10;

                                // SRS Update
                                if (user) {
                                    const sourceItem = vocabulary.find(v => v.es === word.es);
                                    if (sourceItem) {
                                        const prevSrs = sourceItem.srs || { repetition: 0, interval: 0, ease_factor: 2.5 };
                                        // Good rating for catching the falling word (4)
                                        const newStats = calculateSM2(4, prevSrs.repetition, prevSrs.interval, prevSrs.ease_factor);
                                        srsApi.updateItem(user.id, word.es, sourceItem.en, newStats);
                                    }
                                }

                                // Need a new target occasionally
                                if (Math.random() > 0.7) pickNewTarget(vocabulary);
                            } else {
                                livesLost += 1; // Caught a bomb/wrong word
                                navigator.vibrate?.(100);
                            }
                            continue; // Remove word by not adding to nextWords
                        }
                    }

                    // Missed it (fell off screen)
                    if (word.y > 100) {
                        if (word.isMatch) {
                            // Missed the correct translation!
                            livesLost += 1;
                            navigator.vibrate?.(100);

                            // SRS Penalty
                            if (user) {
                                const sourceItem = vocabulary.find(v => v.es === word.es);
                                if (sourceItem) {
                                    const prevSrs = sourceItem.srs || { repetition: 0, interval: 0, ease_factor: 2.5 };
                                    // Total blackout/miss (0)
                                    const newStats = calculateSM2(0, prevSrs.repetition, prevSrs.interval, prevSrs.ease_factor);
                                    srsApi.updateItem(user.id, word.es, sourceItem.en, newStats);
                                }
                            }
                        }
                        continue; // Remove word
                    }

                    nextWords.push(word);
                }

                if (localScoreStr > 0) {
                    setScore(s => s + localScoreStr);
                }
                if (livesLost > 0) {
                    setLives(l => {
                        const newLives = l - livesLost;
                        if (newLives <= 0) {
                            setGameOver(true);
                            setIsPlaying(false);
                        }
                        return newLives;
                    });
                }

                return nextWords;
            });
        }

        requestRef.current = requestAnimationFrame(updateGame);
    }, [isPlaying, gameOver, basketPosition, score, vocabulary, targetWordEn]); // Added targetWordEn to dependencies

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updateGame);
        return () => {
            cancelAnimationFrame(requestRef.current);
        };
    }, [updateGame]);


    if (loading) {
        return <div className="min-h-screen bg-sky-950 flex items-center justify-center text-5xl">🧺</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-900 via-blue-900 to-[#0B1021] text-sky-100 font-sans flex flex-col items-center overflow-hidden selection:bg-sky-500/30 touch-none fixed inset-0 w-full h-full">

            <header className="w-full bg-black/30 backdrop-blur-md border-b border-white/10 py-3 px-6 shadow-xl flex justify-between items-center z-40">
                <Link to="/games" className="flex items-center gap-2 group">
                    <span className="text-2xl group-hover:-translate-x-1 transition-transform text-sky-400">←</span>
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400 group-hover:from-white group-hover:to-sky-200 transition-all uppercase tracking-widest hidden sm:inline">
                        {language === 'fr' ? 'Arcade' : 'Arcade'}
                    </span>
                </Link>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-rose-400/80 text-[10px] font-black tracking-widest uppercase">Lives</span>
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <span key={i} className={`text-xl ${i < lives ? 'text-rose-500' : 'text-slate-700'} drop-shadow-md`}>❤️</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-sky-500/80 text-[10px] font-black tracking-widest uppercase">Score</span>
                        <span className="text-sky-400 font-black text-2xl leading-none">{score}</span>
                    </div>
                </div>
            </header>

            {/* The Game Area */}
            <div
                ref={gameAreaRef}
                className="flex-1 w-full max-w-2xl relative overflow-hidden cursor-crosshair"
                onMouseMove={onMouseMove}
                onTouchMove={onTouchMove}
            >
                {/* HUD: Target Word */}
                {isPlaying && !gameOver && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-blue-950/80 backdrop-blur-md border-2 border-sky-500/50 rounded-2xl px-8 py-3 shadow-[0_10px_30px_rgba(14,165,233,0.3)] flex flex-col items-center pointer-events-none">
                        <span className="text-sky-400/80 text-[10px] uppercase tracking-widest font-black mb-1">
                            {language === 'fr' ? 'Attrape la traduction :' : 'Catch Translation:'}
                        </span>
                        <h2 className="text-3xl font-black text-white">{targetWordEn}</h2>
                    </div>
                )}

                {/* Falling Words */}
                {isPlaying && fallingWords.map(word => (
                    <div
                        key={word.id}
                        className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                            left: `${word.x}%`,
                            top: `${word.y}%`
                        }}
                    >
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl text-xl font-bold shadow-lg text-white">
                            {word.es}
                        </div>
                    </div>
                ))}

                {/* The Basket */}
                {isPlaying && !gameOver && (
                    <div
                        className="absolute bottom-6 w-24 h-24 transform -translate-x-1/2 pointer-events-none transition-transform duration-75 ease-out"
                        style={{ left: `${basketPosition}%` }}
                    >
                        {/* Basket graphics */}
                        <div className="w-full h-full relative flex items-end justify-center">
                            <div className="w-full h-1/2 bg-gradient-to-b from-sky-600 to-blue-800 rounded-b-3xl border-b-4 border-x-4 border-sky-400/50 shadow-[0_10px_20px_rgba(0,0,0,0.5)]"></div>
                            <div className="absolute top-1/4 w-[110%] h-4 bg-sky-500 rounded-full border-2 border-sky-300 shadow-md"></div>
                            {/* Touch glow */}
                            <div className="absolute -inset-4 bg-sky-400/20 rounded-full blur-xl -z-10"></div>
                        </div>
                    </div>
                )}

                {/* Start Screen */}
                {!isPlaying && !gameOver && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-6 text-center">
                        <div className="text-7xl mb-6 drop-shadow-lg">🧺</div>
                        <h2 className="text-4xl font-black text-sky-400 mb-4 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                            {language === 'fr' ? 'Attrape-Mots' : 'Word Catcher'}
                        </h2>
                        <p className="text-sky-100/80 mb-8 text-lg max-w-sm leading-relaxed">
                            {language === 'fr'
                                ? 'Glisse le panier pour attraper la BONNE traduction espagnole. Esquive les mauvais mots !'
                                : 'Drag the basket to catch the CORRECT Spanish translation. Dodge the wrong words!'}
                        </p>
                        <button
                            onClick={startGame}
                            className="bg-sky-500 hover:bg-sky-400 text-blue-950 font-black text-xl py-4 px-12 rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.5)] transition-all transform hover:scale-105 uppercase tracking-widest"
                        >
                            {language === 'fr' ? 'Jouer' : 'Play'}
                        </button>
                    </div>
                )}

                {/* Game Over Screen */}
                {gameOver && (
                    <div className="absolute inset-0 bg-rose-950/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center animate-fade-in-up">
                        <div className="text-6xl mb-4">💥</div>
                        <h2 className="text-4xl font-black text-rose-500 mb-2 uppercase tracking-widest drop-shadow-md">Game Over</h2>
                        <p className="text-rose-200 mb-8 text-xl">
                            {language === 'fr' ? 'Score final :' : 'Final Score:'} <span className="font-black text-3xl text-white ml-2">{score}</span>
                        </p>
                        <button
                            onClick={startGame}
                            className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black py-4 px-12 rounded-2xl shadow-[0_0_30px_rgba(244,63,94,0.4)] transition-all transform hover:scale-105 uppercase tracking-widest"
                        >
                            {language === 'fr' ? 'Réessayer' : 'Try Again'}
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}
