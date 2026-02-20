import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';

// Shared Mock Dictionary
const mockDictionary = {
    "Hola": "Hello", "Adiós": "Goodbye", "agua": "water", "gato": "cat",
    "perro": "dog", "mesa": "table", "pollo": "chicken", "arroz": "rice",
    "padre": "father", "madre": "mother", "casa": "house", "música": "music",
    "restaurante": "restaurant", "mesero": "waiter", "menú": "menu",
    "sopa": "soup", "beber": "to drink", "propina": "tip", "vuelo": "flight"
};

const DEFAULT_VOCAB = ["Hola", "Adiós", "agua", "gato", "perro", "casa"];

export default function VocabRacer() {
    const { completedLessons } = useProgress();
    const { language } = useLanguage();

    // Game State
    const [vocabDict, setVocabDict] = useState({});
    const [activeWords, setActiveWords] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(true);

    // Difficulty / Timers
    const [baseSpeed, setBaseSpeed] = useState(15); // s to fall
    const [spawnRate, setSpawnRate] = useState(3000); // ms between spawns
    const [fallingPaused, setFallingPaused] = useState(false); // Used when typing correctly to show effect

    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const gameLoopRef = useRef(null);
    const idCounter = useRef(0);

    // Initialize Vocab
    useEffect(() => {
        async function loadVocab() {
            let userVocab = {};
            for (const lessonId of completedLessons) {
                try {
                    const res = await fetch(`/data/songs/${lessonId}.json`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.focusVocab) {
                            data.focusVocab.forEach(v => {
                                // For typing game, we want single words or very short phrases without punctuation
                                const clean = v.replace(/[¿?¡!,.]/g, '').trim().toLowerCase();
                                if (mockDictionary[v] && clean.split(' ').length <= 2) {
                                    userVocab[clean] = mockDictionary[v].toLowerCase();
                                }
                            });
                        }
                    }
                } catch (e) {
                    // Ignore
                }
            }
            if (Object.keys(userVocab).length < 5) {
                userVocab = DEFAULT_VOCAB.reduce((acc, word) => {
                    acc[word.toLowerCase()] = mockDictionary[word].toLowerCase();
                    return acc;
                }, {});
            }
            setVocabDict(userVocab);
            setLoading(false);
        }
        loadVocab();
    }, [completedLessons]);

    // Game Loop (Spawning Words)
    useEffect(() => {
        if (!isPlaying || gameOver || fallingPaused) return;

        const spawnWord = () => {
            const esWords = Object.keys(vocabDict);
            if (esWords.length === 0) return;

            const randomEs = esWords[Math.floor(Math.random() * esWords.length)];
            const translationEn = vocabDict[randomEs];

            const newWord = {
                id: idCounter.current++,
                es: randomEs,
                en: translationEn,
                left: 10 + Math.random() * 80, // 10% to 90%
                speed: baseSpeed * (0.8 + Math.random() * 0.4), // randomize speed slightly
                status: 'falling' // 'falling', 'matched', 'missed'
            };

            setActiveWords(prev => [...prev, newWord]);

            // Schedule next spawn, gradually getting faster
            setSpawnRate(prev => Math.max(800, prev * 0.98));
        };

        gameLoopRef.current = setInterval(spawnWord, spawnRate);

        return () => clearInterval(gameLoopRef.current);
    }, [isPlaying, gameOver, fallingPaused, spawnRate, vocabDict, baseSpeed]);

    // Focus input on play
    useEffect(() => {
        if (isPlaying && !gameOver && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isPlaying, gameOver]);

    // Handle Input
    const handleInputChange = (e) => {
        if (fallingPaused || gameOver) return;

        const val = e.target.value.toLowerCase();
        setInputValue(val);

        // Check for match
        const matchIndex = activeWords.findIndex(w => w.status === 'falling' && w.es === val);

        if (matchIndex !== -1) {
            // Match found!
            setInputValue(''); // Clear input

            // Temporarily pause falling to show animation
            setFallingPaused(true);

            // Update word status to trigger explosion animation
            const updatedWords = [...activeWords];
            updatedWords[matchIndex].status = 'matched';
            setActiveWords(updatedWords);

            setScore(s => s + 10 * activeWords[matchIndex].es.length);

            // Give it time to animate, then remove and unpause
            setTimeout(() => {
                setActiveWords(prev => prev.filter((_, idx) => idx !== matchIndex));
                setFallingPaused(false);
                if (inputRef.current) inputRef.current.focus();

                // Increase base speed slightly every 50 points
                if (score > 0 && score % 50 === 0) {
                    setBaseSpeed(prev => Math.max(5, prev - 1));
                }
            }, 300);
        }
    };

    const handleWordMissed = (id) => {
        if (gameOver) return;

        // Remove word from DOM immediately
        setActiveWords(prev => prev.filter(w => w.id !== id));

        setLives(l => {
            const newLives = l - 1;
            if (newLives <= 0) {
                setGameOver(true);
                setIsPlaying(false);
            }
            return newLives;
        });
    };

    const startGame = () => {
        setScore(0);
        setLives(3);
        setActiveWords([]);
        setBaseSpeed(15);
        setSpawnRate(3000);
        setInputValue('');
        setGameOver(false);
        setIsPlaying(true);
    };

    if (loading) {
        return <div className="min-h-screen bg-[#111827] flex items-center justify-center text-4xl">⌨️</div>;
    }

    return (
        <div className="min-h-screen bg-[#111827] text-white font-mono overflow-hidden flex flex-col relative selection:bg-yellow-500/30">

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-yellow-500/5 blur-[150px] mix-blend-screen opacity-50"></div>
                {/* Vertical grid lines indicating a track */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10%_100%] opacity-30"></div>
            </div>

            {/* Header / HUD */}
            <header className="relative z-40 bg-[#1F2937]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center shadow-lg">
                <Link to="/games" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-yellow-500 font-bold transition-all shadow-md">
                        ←
                    </div>
                </Link>

                <div className="flex gap-8 items-center">
                    <div className="text-center">
                        <span className="text-slate-400 text-xs font-bold block tracking-widest uppercase">Score</span>
                        <span className="text-yellow-400 font-black text-2xl drop-shadow-md">{score}</span>
                    </div>
                    <div className="text-center">
                        <span className="text-slate-400 text-xs font-bold block tracking-widest uppercase">{language === 'fr' ? 'Vies' : 'Lives'}</span>
                        <div className="flex gap-1 text-2xl">
                            {[...Array(3)].map((_, i) => (
                                <span key={i} className={i < lives ? "text-red-500 drop-shadow-md filter saturate-150" : "text-slate-700 filter grayscale"}>❤️</span>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Game Screen */}
            <div
                ref={containerRef}
                className={`flex-1 relative overflow-hidden z-20 transition-opacity duration-300 ${!isPlaying && !gameOver ? 'opacity-30' : 'opacity-100'}`}
            >
                {/* Danger Zone Line */}
                <div className="absolute bottom-32 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>

                {activeWords.map((wordObj) => (
                    <div
                        key={wordObj.id}
                        className={`absolute text-xl md:text-2xl font-black bg-[#1F2937] px-6 py-3 rounded-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center transform
                            ${wordObj.status === 'matched' ? 'scale-150 opacity-0 text-green-400 border-green-400 brightness-150 duration-300' : ''}
                            ${fallingPaused && wordObj.status === 'falling' ? 'paused' : ''}
                        `}
                        style={{
                            left: `${wordObj.left}%`,
                            transform: `translateX(-50%)`, // Center on the left %
                            animationName: 'fallDown',
                            animationTimingFunction: 'linear',
                            animationDuration: `${wordObj.speed}s`,
                            animationFillMode: 'forwards',
                            animationPlayState: fallingPaused && wordObj.status === 'falling' ? 'paused' : 'running'
                        }}
                        onAnimationEnd={(e) => {
                            if (e.animationName === 'fallDown' && wordObj.status === 'falling') {
                                handleWordMissed(wordObj.id);
                            }
                        }}
                    >
                        <span className="text-white drop-shadow-md tracking-widest">{wordObj.en}</span>
                        {/* Only show target during test/debug if you wanted to, but the game is to know it */}
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="relative z-50 bg-[#1F2937]/90 backdrop-blur-xl border-t border-white/10 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] min-h-[140px] flex items-center justify-center">

                {!isPlaying && !gameOver && (
                    <div className="text-center w-full max-w-xl">
                        <h2 className="text-2xl font-black text-yellow-400 mb-2 uppercase tracking-widest text-shadow-lg">Vocab Racer</h2>
                        <p className="text-slate-400 mb-6 text-sm">
                            {language === 'fr'
                                ? 'Les mots en anglais tombent. Tapez la traduction en espagnol correspondante avant qu\'ils ne touchent le sol !'
                                : 'English words fall from the sky. Type the matching Spanish translation before they hit the ground!'}
                        </p>
                        <button
                            onClick={startGame}
                            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-black text-xl py-4 px-12 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest"
                        >
                            {language === 'fr' ? 'Démarrer' : 'Start Engine'}
                        </button>
                    </div>
                )}

                {isPlaying && !gameOver && (
                    <div className="w-full max-w-2xl relative">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-2xl">
                            ⌨️
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder={language === 'fr' ? 'Tapez en espagnol...' : 'Type in Spanish...'}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            className={`w-full bg-[#111827] border-2 border-white/10 rounded-2xl py-5 pl-16 pr-6 text-3xl font-black text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500 shadow-inner transition-colors duration-300
                                ${fallingPaused ? 'border-green-500 bg-green-500/10 text-green-400' : ''}
                            `}
                        />
                    </div>
                )}

                {gameOver && (
                    <div className="text-center w-full max-w-xl animate-pop-in">
                        <div className="text-4xl mb-2">💥</div>
                        <h2 className="text-3xl font-black text-red-500 mb-2 uppercase tracking-widest text-shadow-lg">Game Over</h2>
                        <p className="text-slate-300 mb-6 text-lg">
                            {language === 'fr' ? 'Score final :' : 'Final Score:'} <span className="text-yellow-400 font-black text-2xl">{score}</span>
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link to="/games" className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors uppercase tracking-widest text-sm border border-white/10">
                                {language === 'fr' ? 'Retour' : 'Arcade'}
                            </Link>
                            <button
                                onClick={startGame}
                                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-black py-4 px-8 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest text-sm"
                            >
                                {language === 'fr' ? 'Réessayer' : 'Try Again'}
                            </button>
                        </div>
                    </div>
                )}

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fallDown {
                    0% { top: -100px; opacity: 0; }
                    5% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: calc(100% - 140px); opacity: 0; }
                }
                @keyframes pop-in {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .text-shadow-lg { text-shadow: 0 10px 20px rgba(0,0,0,0.5); }
            `}} />
        </div>
    );
}
