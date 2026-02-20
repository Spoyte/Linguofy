import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';

const GRID_SIZE = 15;
const INITIAL_SPEED = 200;

// Fallback sentences if user has no completed lessons
const FALLBACK_SENTENCES = [
    { es: "Hola, me llamo Marco", en: "Hello, my name is Marco" },
    { es: "El gato bebe agua", en: "The cat drinks water" },
    { es: "La casa es muy grande", en: "The house is very big" },
    { es: "Yo quiero comer pan", en: "I want to eat bread" }
];

// Helper to generate a random coordinate
const randomPosition = () => ({
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE)
});

export default function GrammarSnake() {
    const { completedLessons } = useProgress();
    const { language } = useLanguage();

    const [sentences, setSentences] = useState([]);
    const [currentSentence, setCurrentSentence] = useState(null); // { es: "", en: "", words: [], currentWordIndex: 0 }

    const [snake, setSnake] = useState([{ x: 7, y: 7 }]);
    const [direction, setDirection] = useState({ x: 0, y: -1 }); // Moving up initially
    const [targetWords, setTargetWords] = useState([]); // [{ word: "Hola", x: 2, y: 5 }, ...]

    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);

    const gameLoopRef = useRef(null);
    const directionRef = useRef(direction);
    directionRef.current = direction; // Keep ref updated for intervals

    // Load sentences
    useEffect(() => {
        async function loadContent() {
            setLoading(true);
            let userSentences = [];

            for (const lessonId of completedLessons) {
                try {
                    const res = await fetch(`/data/songs/${lessonId}.json`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.lyrics && data.lyrics.pure_es && data.lyrics.en) {
                            const linesEs = data.lyrics.pure_es.split('\n').filter(l => l.trim() && !l.startsWith('['));
                            const linesEn = data.lyrics.en.split('\n').filter(l => l.trim() && !l.startsWith('['));

                            // Try to match lines up to a certain length
                            for (let i = 0; i < Math.min(linesEs.length, linesEn.length); i++) {
                                const cleanEs = linesEs[i].replace(/[¿?¡!,.]/g, '').trim();
                                const wordCount = cleanEs.split(' ').length;
                                if (wordCount >= 3 && wordCount <= 6) {
                                    userSentences.push({ es: cleanEs, en: linesEn[i].trim() });
                                }
                            }
                        }
                    }
                } catch (e) {
                    // Ignore
                }
            }

            if (userSentences.length < 3) {
                userSentences = FALLBACK_SENTENCES;
            }

            setSentences(userSentences);
            setLoading(false);
        }

        loadContent();
    }, [completedLessons]);

    // Handle Keyboard Input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isPlaying || gameOver || gameWon) return;

            // Prevent default scrolling for arrow keys
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
            }

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (directionRef.current.y !== 1) setDirection({ x: 0, y: -1 });
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (directionRef.current.y !== -1) setDirection({ x: 0, y: 1 });
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (directionRef.current.x !== 1) setDirection({ x: -1, y: 0 });
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (directionRef.current.x !== -1) setDirection({ x: 1, y: 0 });
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, gameOver, gameWon]);

    // Spawn words for a sentence
    const setupSentence = useCallback((sentence) => {
        const words = sentence.es.split(' ');

        // Function to check if a position is occupied
        const isOccupied = (pos, existingTargets) => {
            if (snake.some(segment => segment.x === pos.x && segment.y === pos.y)) return true;
            if (existingTargets.some(t => t.x === pos.x && t.y === pos.y)) return true;
            return false;
        };

        let currentTargets = [];
        words.forEach(word => {
            let pos;
            do {
                pos = randomPosition();
            } while (isOccupied(pos, currentTargets));

            currentTargets.push({ word, x: pos.x, y: pos.y });
        });

        setCurrentSentence({
            ...sentence,
            words: words,
            currentWordIndex: 0
        });

        setTargetWords(currentTargets);
    }, [snake]);

    const startGame = () => {
        setSnake([{ x: 7, y: 7 }]);
        setDirection({ x: 0, y: -1 });
        setScore(0);
        setGameOver(false);
        setGameWon(false);
        setIsPlaying(true);

        const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
        setupSentence(randomSentence);
    };

    // Game Loop
    useEffect(() => {
        if (!isPlaying || gameOver || gameWon || !currentSentence) return;

        const moveSnake = () => {
            setSnake(prevSnake => {
                const head = prevSnake[0];
                const newHead = {
                    x: head.x + directionRef.current.x,
                    y: head.y + directionRef.current.y
                };

                // Check Wall Collision
                if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
                    setGameOver(true);
                    setIsPlaying(false);
                    return prevSnake;
                }

                // Check Self Collision
                if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                    setGameOver(true);
                    setIsPlaying(false);
                    return prevSnake;
                }

                const newSnake = [newHead, ...prevSnake];

                // Check Word Collision
                let ateWord = false;
                const nextRequiredWord = currentSentence.words[currentSentence.currentWordIndex];

                const hitWordIdx = targetWords.findIndex(tw => tw.x === newHead.x && tw.y === newHead.y);

                if (hitWordIdx !== -1) {
                    const hitWord = targetWords[hitWordIdx];

                    if (hitWord.word === nextRequiredWord) {
                        // Correct Word!
                        ateWord = true;
                        setScore(s => s + 50);

                        // Remove eaten word
                        const newTargets = [...targetWords];
                        newTargets.splice(hitWordIdx, 1);
                        setTargetWords(newTargets);

                        // Advance sentence state
                        setCurrentSentence(prev => {
                            const nextState = { ...prev, currentWordIndex: prev.currentWordIndex + 1 };

                            // Check if sentence complete
                            if (nextState.currentWordIndex >= nextState.words.length) {
                                setScore(s => s + 200);
                                setTimeout(() => {
                                    // Setup next sentence
                                    setGameWon(true);
                                    setIsPlaying(false);
                                    setTimeout(() => {
                                        const nextSent = sentences[Math.floor(Math.random() * sentences.length)];
                                        setupSentence(nextSent);
                                        setGameWon(false);
                                        setIsPlaying(true);
                                    }, 1500); // Brief pause showing "Sentence Complete!"
                                }, 100);
                            }
                            return nextState;
                        });

                    } else {
                        // Wrong Word! (Grammar mistake)
                        setGameOver(true);
                        setIsPlaying(false);
                        return prevSnake;
                    }
                }

                if (!ateWord) {
                    newSnake.pop(); // Remove tail if we didn't eat
                }

                return newSnake;
            });
        };

        // Increase speed slightly based on score
        const currentSpeed = Math.max(80, INITIAL_SPEED - (Math.floor(score / 200) * 15));
        gameLoopRef.current = setInterval(moveSnake, currentSpeed);

        return () => clearInterval(gameLoopRef.current);
    }, [isPlaying, gameOver, gameWon, targetWords, currentSentence, score, sentences, setupSentence]);

    // Render Grid
    const renderGrid = () => {
        const cells = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {

                let isSnakeHead = false;
                let isSnakeBody = false;
                let isTarget = false;
                let targetData = null;

                if (snake.length > 0) {
                    isSnakeHead = snake[0].x === x && snake[0].y === y;
                    isSnakeBody = snake.some((segment, idx) => idx !== 0 && segment.x === x && segment.y === y);
                }

                const targetIdx = targetWords.findIndex(tw => tw.x === x && tw.y === y);
                if (targetIdx !== -1) {
                    isTarget = true;
                    targetData = targetWords[targetIdx];
                }

                let cellClass = "w-full h-full border border-green-800/20 sm:border-green-800/40 rounded-sm sm:rounded-md bg-green-900/30 flex items-center justify-center relative";

                if (isSnakeHead) {
                    cellClass += " bg-emerald-400 rounded-md shadow-[0_0_10px_rgba(52,211,153,0.8)] z-20";
                } else if (isSnakeBody) {
                    cellClass += " bg-emerald-600/80 rounded-sm z-10";
                }

                cells.push(
                    <div key={`${x}-${y}`} className={cellClass}>
                        {isSnakeHead && (
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-green-900 rounded-full"></span>
                                <span className="w-1.5 h-1.5 bg-green-900 rounded-full"></span>
                            </div>
                        )}
                        {isTarget && (
                            <div className="absolute inset-0 flex items-center justify-center p-1 z-30 animate-pulse-slow">
                                <div className="bg-yellow-400 text-green-950 text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded shadow-lg border-2 border-yellow-200 whitespace-nowrap overflow-visible">
                                    {targetData.word}
                                </div>
                            </div>
                        )}
                    </div>
                );
            }
        }
        return cells;
    };

    // Calculate progress through sentence
    const progressText = currentSentence ? currentSentence.words.map((word, idx) => {
        if (idx < currentSentence.currentWordIndex) {
            return <span key={idx} className="text-emerald-400 font-black">{word} </span>;
        } else if (idx === currentSentence.currentWordIndex) {
            return <span key={idx} className="text-yellow-400 border-b-2 border-yellow-400 pb-1 mx-1">{word} </span>;
        } else {
            return <span key={idx} className="text-slate-500">{word} </span>;
        }
    }) : null;

    if (loading) {
        return <div className="min-h-screen bg-green-950 flex items-center justify-center text-5xl">🐍</div>;
    }

    return (
        <div className="min-h-screen bg-green-950 text-emerald-100 font-sans flex flex-col items-center overflow-x-hidden selection:bg-emerald-500/30 touch-none">

            <header className="w-full bg-green-900/80 backdrop-blur-md border-b border-green-800 py-3 px-6 shadow-xl flex justify-between items-center z-40">
                <Link to="/games" className="flex items-center gap-2 group">
                    <span className="text-2xl group-hover:-translate-x-1 transition-transform text-emerald-400">←</span>
                    <span className="text-xl font-black text-emerald-500 group-hover:text-emerald-300 transition-colors uppercase tracking-widest hidden sm:inline">
                        {language === 'fr' ? 'Arcade' : 'Arcade'}
                    </span>
                </Link>
                <div className="flex flex-col items-end">
                    <span className="text-green-600 text-[10px] font-black tracking-widest uppercase">Score</span>
                    <span className="text-emerald-400 font-black text-2xl leading-none">{score}</span>
                </div>
            </header>

            <div className="flex-1 w-full max-w-2xl px-4 py-6 flex flex-col items-center">

                {/* HUD Top: The Target English Sentence */}
                <div className="w-full bg-green-900/50 border border-green-800 rounded-2xl p-4 mb-4 text-center shadow-inner">
                    <p className="text-green-600 text-xs font-black uppercase tracking-widest mb-1">
                        {language === 'fr' ? 'Traduis :' : 'Translate:'}
                    </p>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                        {currentSentence ? currentSentence.en : "..."}
                    </h2>
                </div>

                {/* HUD Middle: Spanish Progress */}
                <div className="w-full min-h-[60px] flex flex-wrap items-center justify-center text-lg sm:text-xl font-bold mb-6 bg-black/20 p-3 rounded-xl">
                    {progressText || "..."}
                </div>

                {/* The Game Grid */}
                <div className="relative w-full aspect-square max-w-[500px] bg-green-950 rounded border-4 border-green-800/80 shadow-[0_0_30px_rgba(6,78,59,0.5)] z-10 p-1">
                    <div
                        className="w-full h-full grid"
                        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
                    >
                        {renderGrid()}
                    </div>

                    {/* Overlays */}
                    {!isPlaying && !gameOver && !gameWon && (
                        <div className="absolute inset-0 bg-green-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-6 text-center">
                            <span className="text-6xl mb-4">🐍</span>
                            <h2 className="text-3xl font-black text-emerald-400 mb-2 uppercase tracking-widest">Grammar Snake</h2>
                            <p className="text-emerald-100/70 mb-6 text-sm">
                                {language === 'fr'
                                    ? 'Mange les mots dans le bon ordre grammatical pour construire la phrase espagnole ! Utilise les flèches ou WASD.'
                                    : 'Eat the words in the correct grammatical order to build the Spanish sentence! Use arrow keys or WASD.'}
                            </p>
                            <button
                                onClick={startGame}
                                className="bg-emerald-500 hover:bg-emerald-400 text-green-950 font-black py-4 px-10 rounded-xl shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all transform hover:scale-105 uppercase tracking-widest"
                            >
                                {language === 'fr' ? 'Jouer' : 'Play'}
                            </button>
                        </div>
                    )}

                    {gameOver && (
                        <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center z-50 p-6 text-center animate-fade-in-up border-4 border-red-500/50">
                            <div className="text-5xl mb-4">💥</div>
                            <h2 className="text-3xl font-black text-red-500 mb-2 uppercase tracking-widest drop-shadow-md">Crash!</h2>
                            <p className="text-red-200 mb-6 text-lg">
                                {language === 'fr' ? 'Score final :' : 'Final Score:'} <span className="font-black text-2xl text-white">{score}</span>
                            </p>
                            <p className="text-red-300/70 text-sm mb-8">
                                {language === 'fr' ? 'Rappelle-toi de manger les mots dans le bon ordre !' : 'Remember to eat the words in the correct order!'}
                            </p>
                            <button
                                onClick={startGame}
                                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black py-4 px-10 rounded-xl shadow-[0_0_30px_rgba(225,29,72,0.4)] transition-all transform hover:scale-105 uppercase tracking-widest text-sm"
                            >
                                {language === 'fr' ? 'Réessayer' : 'Try Again'}
                            </button>
                        </div>
                    )}

                    {gameWon && (
                        <div className="absolute inset-0 bg-emerald-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-center animate-pulse">
                            <div className="text-6xl mb-4">✨</div>
                            <h2 className="text-3xl font-black text-yellow-400 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                                {language === 'fr' ? 'Phrase Complète !' : 'Sentence Complete!'}
                            </h2>
                        </div>
                    )}
                </div>

                {/* Mobile Controls (Visible only on small screens) */}
                <div className="w-full mt-8 grid grid-cols-3 gap-2 px-8 sm:hidden opacity-80 z-20">
                    <div />
                    <button
                        className="bg-green-800/50 active:bg-emerald-500/50 p-4 rounded-xl flex justify-center border-b-4 border-green-900"
                        onPointerDown={(e) => { e.preventDefault(); if (directionRef.current.y !== 1) setDirection({ x: 0, y: -1 }); }}
                    >▲</button>
                    <div />
                    <button
                        className="bg-green-800/50 active:bg-emerald-500/50 p-4 rounded-xl flex justify-center border-b-4 border-green-900"
                        onPointerDown={(e) => { e.preventDefault(); if (directionRef.current.x !== 1) setDirection({ x: -1, y: 0 }); }}
                    >◀</button>
                    <button
                        className="bg-green-800/50 active:bg-emerald-500/50 p-4 rounded-xl flex justify-center border-b-4 border-green-900"
                        onPointerDown={(e) => { e.preventDefault(); if (directionRef.current.y !== -1) setDirection({ x: 0, y: 1 }); }}
                    >▼</button>
                    <button
                        className="bg-green-800/50 active:bg-emerald-500/50 p-4 rounded-xl flex justify-center border-b-4 border-green-900"
                        onPointerDown={(e) => { e.preventDefault(); if (directionRef.current.x !== -1) setDirection({ x: 1, y: 0 }); }}
                    >▶</button>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                }
                `
            }} />
        </div>
    );
}
