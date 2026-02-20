import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';

// Fallback sentences if user has no completed lessons
const FALLBACK_SENTENCES = [
    { es: "Hola, me llamo Marco", en: "Hello, my name is Marco" },
    { es: "El gato bebe agua", en: "The cat drinks water" },
    { es: "La casa es muy grande", en: "The house is very big" },
    { es: "Yo quiero comer pan", en: "I want to eat bread" }
];

export default function BubbleSentence() {
    const { completedLessons } = useProgress();
    const { language } = useLanguage();

    const [sentences, setSentences] = useState([]);
    const [currentSentence, setCurrentSentence] = useState(null);
    const [bubbles, setBubbles] = useState([]);
    const [builtWords, setBuiltWords] = useState([]);

    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);

    const animationRef = useRef();

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

                            for (let i = 0; i < Math.min(linesEs.length, linesEn.length); i++) {
                                const cleanEs = linesEs[i].replace(/[¿?¡!,.]/g, '').trim();
                                const wordCount = cleanEs.split(' ').length;
                                if (wordCount >= 3 && wordCount <= 7) {
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

    const setupSentence = useCallback((sentence) => {
        const words = sentence.es.split(' ');

        // Add 1-2 distractor words based on score/difficulty
        let pool = [...words];
        if (sentences.length > 0) {
            const randomDistractorSent = sentences[Math.floor(Math.random() * sentences.length)];
            const distractorWords = randomDistractorSent.es.split(' ');
            pool.push(distractorWords[Math.floor(Math.random() * distractorWords.length)]);
        }

        // Shuffle pool
        pool.sort(() => Math.random() - 0.5);

        const initialBubbles = pool.map(word => ({
            id: Math.random().toString(36).substr(2, 9),
            word,
            x: 10 + Math.random() * 80, // 10% to 90%
            y: 20 + Math.random() * 40, // 20% to 60%
            vx: (Math.random() - 0.5) * 0.15, // horizontal velocity
            vy: (Math.random() - 0.5) * 0.15, // vertical velocity
            size: 60 + Math.random() * 40, // bubble size
            error: false
        }));

        setCurrentSentence({
            ...sentence,
            words: words
        });
        setBubbles(initialBubbles);
        setBuiltWords([]);
    }, [sentences]);

    const startGame = () => {
        setScore(0);
        setGameOver(false);
        setGameWon(false);
        setIsPlaying(true);
        const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
        setupSentence(randomSentence);
    };

    // Physics Engine for Bubbles
    const updatePhysics = useCallback(() => {
        if (!isPlaying || gameOver || gameWon) return;

        setBubbles(prevBubbles => {
            return prevBubbles.map(b => {
                let currentVx = b.vx;
                let currentVy = b.vy;

                // Move
                let nextX = b.x + currentVx;
                let nextY = b.y + currentVy;

                // Bounce off walls (percentages)
                if (nextX <= 5 || nextX >= 95) {
                    currentVx *= -1;
                    nextX = b.x + currentVx;
                }

                // Keep bubbles in the upper 70% of the screen so they don't block the sentence UI
                if (nextY <= 15 || nextY >= 70) {
                    currentVy *= -1;
                    nextY = b.y + currentVy;
                }

                return { ...b, x: nextX, y: nextY, vx: currentVx, vy: currentVy };
            });
        });

        animationRef.current = requestAnimationFrame(updatePhysics);
    }, [isPlaying, gameOver, gameWon]);

    useEffect(() => {
        animationRef.current = requestAnimationFrame(updatePhysics);
        return () => cancelAnimationFrame(animationRef.current);
    }, [updatePhysics]);

    // Handle Tapping a Bubble
    const handleBubbleTap = (bubble) => {
        if (!isPlaying || gameOver || gameWon) return;

        const nextExpectedIndex = builtWords.length;
        const expectedWord = currentSentence.words[nextExpectedIndex];

        if (bubble.word === expectedWord) {
            // Correct! Pop the bubble!
            setScore(s => s + 50);
            setBuiltWords(prev => [...prev, bubble.word]);

            // Remove from bubbles array
            setBubbles(prev => prev.filter(b => b.id !== bubble.id));

            // Check if sentence complete
            if (nextExpectedIndex + 1 === currentSentence.words.length) {
                setScore(s => s + 200);
                setTimeout(() => {
                    setGameWon(true);
                    setIsPlaying(false);
                    setTimeout(() => {
                        const nextSent = sentences[Math.floor(Math.random() * sentences.length)];
                        setupSentence(nextSent);
                        setGameWon(false);
                        setIsPlaying(true);
                    }, 1500);
                }, 100);
            }
        } else {
            // Wrong word! Flash error on that bubble
            setScore(s => Math.max(0, s - 10)); // tiny penalty

            setBubbles(prev => prev.map(b =>
                b.id === bubble.id
                    ? { ...b, error: true }
                    : b
            ));

            // reset error state short after
            setTimeout(() => {
                setBubbles(prev => prev.map(b =>
                    b.id === bubble.id
                        ? { ...b, error: false }
                        : b
                ));
            }, 500);
        }
    };


    if (loading) {
        return <div className="min-h-screen bg-teal-950 flex items-center justify-center text-5xl">🫧</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-teal-900 to-slate-900 text-teal-100 font-sans flex flex-col items-center overflow-hidden selection:bg-teal-500/30 touch-none fixed inset-0 w-full h-full">

            <header className="w-full bg-slate-950/50 backdrop-blur-md border-b border-white/10 py-3 px-6 shadow-xl flex justify-between items-center z-40">
                <Link to="/games" className="flex items-center gap-2 group">
                    <span className="text-2xl group-hover:-translate-x-1 transition-transform text-teal-400">←</span>
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-400 group-hover:from-white group-hover:to-cyan-200 transition-all uppercase tracking-widest hidden sm:inline">
                        {language === 'fr' ? 'Arcade' : 'Arcade'}
                    </span>
                </Link>
                <div className="flex flex-col items-end">
                    <span className="text-teal-400/80 text-[10px] font-black tracking-widest uppercase">Score</span>
                    <span className="text-cyan-400 font-black text-2xl leading-none">{score}</span>
                </div>
            </header>

            <div className="flex-1 w-full max-w-lg relative flex flex-col">

                {/* 1. Top HUD: Target English Translation */}
                <div className="w-full text-center py-6 px-4 z-30">
                    <p className="text-teal-500/80 text-xs font-black uppercase tracking-widest mb-1 drop-shadow-md">
                        {language === 'fr' ? 'Construis la phrase :' : 'Build the sentence:'}
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg">
                        {currentSentence ? currentSentence.en : "..."}
                    </h2>
                </div>

                {/* 2. Middle area: Floating Bubbles Arena */}
                <div className="flex-1 relative w-full overflow-hidden">
                    {/* Watery background effects */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>

                    {isPlaying && bubbles.map(bubble => (
                        <button
                            key={bubble.id}
                            onPointerDown={() => handleBubbleTap(bubble)}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center 
                                ${bubble.error ? 'bg-rose-500/80 border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-shake' : 'bg-cyan-500/20 backdrop-blur-md border border-cyan-300/50 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.2),_0_10px_20px_rgba(6,182,212,0.3)]'}
                                transition-colors active:scale-90
                            `}
                            style={{
                                left: \`\${bubble.x}%\`,
                    top: \`\${bubble.y}%\`,
                    width: \`\${bubble.size}px\`,
                    height: \`\${bubble.size}px\`
                            }}
                        >
                    {/* Inner bubble reflection */}
                    <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-white/40 rounded-full blur-[2px]"></div>

                    <span className="text-white font-black drop-shadow-md" style={{ fontSize: \`\${bubble.size * 0.25}px\` }}>
                    {bubble.word}
                </span>
            </button>
                    ))}

            {/* Start Screen Overlay */}
            {!isPlaying && !gameOver && !gameWon && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-6 text-center">
                    <div className="text-7xl mb-6 drop-shadow-lg animate-bounce">🫧</div>
                    <h2 className="text-3xl font-black text-cyan-400 mb-4 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                        {language === 'fr' ? 'Phrases Bulles' : 'Bubble Sentence'}
                    </h2>
                    <p className="text-teal-100/80 mb-8 text-base max-w-sm leading-relaxed">
                        {language === 'fr'
                            ? 'Éclate les bulles dans le bon ordre grammatical pour construire la traduction espagnole !'
                            : 'Pop the bubbles in the exact grammatical order to build the Spanish translation!'}
                    </p>
                    <button
                        onClick={startGame}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-xl py-4 px-12 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all transform hover:scale-105 uppercase tracking-widest"
                    >
                        {language === 'fr' ? 'Jouer' : 'Play'}
                    </button>
                </div>
            )}

            {/* Win Animation Overlay */}
            {gameWon && (
                <div className="absolute inset-0 z-50 flex items-center justify-center">
                    <div className="bg-emerald-500/90 backdrop-blur-md px-8 py-6 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.5)] text-center animate-pop-in border-4 border-emerald-300">
                        <span className="text-5xl block mb-2">🎉</span>
                        <h3 className="text-white font-black text-2xl uppercase tracking-widest drop-shadow-md">
                            {language === 'fr' ? 'Parfait !' : 'Perfect!'}
                        </h3>
                    </div>
                </div>
            )}
        </div>

                {/* 3. Bottom UI: Sentence Constructor */ }
    <div className="w-full bg-slate-900/90 backdrop-blur-lg border-t-2 border-cyan-900/50 p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-40 rounded-t-3xl min-h-[140px]">
        <div className="flex flex-wrap gap-2 justify-center items-center h-full">
            {currentSentence && currentSentence.words.map((targetWord, idx) => {
                const isBuilt = idx < builtWords.length;
                const isNext = idx === builtWords.length;

                if (isBuilt) {
                    return (
                        <div key={idx} className="bg-cyan-500 text-slate-900 font-black px-4 py-2 rounded-xl shadow-md border-b-4 border-cyan-700 animate-pop-in">
                            {builtWords[idx]}
                        </div>
                    );
                } else if (isNext) {
                    return (
                        <div key={idx} className="bg-slate-800 text-slate-500 font-bold px-4 py-2 rounded-xl shadow-inner border-2 border-dashed border-slate-600">
                            ...
                        </div>
                    );
                } else {
                    return (
                        <div key={idx} className="bg-slate-800/50 text-slate-700 px-4 py-2 rounded-xl">
                            _
                        </div>
                    );
                }
            })}
        </div>
    </div>

            </div >

        <style dangerouslySetInnerHTML={{
            __html: \`
                @keyframes pop-in {
                    0% { transform: scale(0.5); opacity: 0; }
                    80% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                
                @keyframes shake {
                    0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
                    25% { transform: translate(-55%, -50%) rotate(-5deg); }
                    50% { transform: translate(-45%, -50%) rotate(5deg); }
                    75% { transform: translate(-55%, -50%) rotate(-5deg); }
                }
                .animate-shake { animation: shake 0.4s ease-in-out; }
                \`
            }} />
        </div>
    );
}
