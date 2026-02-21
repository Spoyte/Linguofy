import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';

// Shared Mock Dictionary
const mockDictionary = {
    "Hola": "Hello", "Adiós": "Goodbye", "agua": "water", "gato": "cat",
    "perro": "dog", "mesa": "table", "pollo": "chicken", "arroz": "rice",
    "padre": "father", "madre": "mother", "casa": "house", "música": "music"
};

const DEFAULT_VOCAB = ["Hola", "Adiós", "agua", "gato", "perro", "casa"];

const BALLOON_COLORS = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500',
    'bg-yellow-400', 'bg-purple-500', 'bg-pink-500'
];

export default function ColorPop() {
    const { completedLessons } = useProgress();
    const { language } = useLanguage();

    const [vocabDict, setVocabDict] = useState({});
    const [targetWordEn, setTargetWordEn] = useState("");
    const [targetWordEs, setTargetWordEs] = useState("");
    const [balloons, setBalloons] = useState([]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [gameSpeed, setGameSpeed] = useState(8); // CSS animation duration in seconds

    const containerRef = useRef(null);

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
                                if (mockDictionary[v]) {
                                    userVocab[v] = mockDictionary[v];
                                }
                            });
                        }
                    }
                } catch (e) {
                    // Ignore
                }
            }
            if (Object.keys(userVocab).length < 4) {
                // Not enough words, use defaults but inject dictionary meanings
                userVocab = DEFAULT_VOCAB.reduce((acc, word) => {
                    acc[word] = mockDictionary[word];
                    return acc;
                }, {});
            }
            setVocabDict(userVocab);
            setLoading(false);
        }
        loadVocab();
    }, [completedLessons]);

    // Start next round when dict changes or balloons empty
    useEffect(() => {
        if (!loading && Object.keys(vocabDict).length > 0) {
            startNextRound();
        }
    }, [loading, vocabDict]);

    const startNextRound = () => {
        const words = Object.keys(vocabDict);
        // Pick target
        const targetEs = words[Math.floor(Math.random() * words.length)];
        setTargetWordEs(targetEs);
        setTargetWordEn(vocabDict[targetEs]);

        // Combine and shuffle for balloons
        // For mobile, 4 balloons is the max that comfortably fits without clutter.
        const numBalloons = Math.min(4, words.length);
        let others = words.filter(w => w !== targetEs).sort(() => Math.random() - 0.5).slice(0, numBalloons - 1);
        const roundWords = [targetEs, ...others].sort(() => Math.random() - 0.5);

        // Divide the 100% width into equal segments.
        // E.g., 4 balloons = 25% segments.
        // The balloon will be ~22vw wide, so it fits nicely inside a 25% segment.
        const segmentWidth = 100 / roundWords.length;

        const newBalloons = roundWords.map((word, idx) => {
            // Position strictly within its segment to avoid any overlap
            // Leaving 1-2% wiggle room so they aren't perfectly aligned grids, but don't cross boundaries
            const minLeft = (idx * segmentWidth) + 1;
            const maxLeft = (idx * segmentWidth) + (segmentWidth * 0.1);
            const leftPos = Math.random() * (maxLeft - minLeft) + minLeft;

            const color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
            return {
                id: Date.now() + idx,
                word: word,
                left: leftPos,
                color: color,
                speed: gameSpeed + (Math.random() * 2 - 1), // slightly vary speed
                delay: Math.random() * 1.5 // stagger spawn slightly more to avoid horizontal lines
            };
        });

        // Clear and set new
        setBalloons([]);
        setTimeout(() => setBalloons(newBalloons), 300); // small delay between rounds
    };

    const handleBalloonClick = (balloonId, word) => {
        if (word === targetWordEs) {
            // Correct
            setScore(s => s + 10);
            setStreak(s => {
                const newStreak = s + 1;
                // Faster every 5 streak
                if (newStreak % 5 === 0) {
                    setGameSpeed(prev => Math.max(3, prev - 1));
                }
                return newStreak;
            });
            // Pop the balloon explicitly
            setBalloons(balloons.filter(b => b.id !== balloonId));

            // Wait a moment then start next round
            setTimeout(startNextRound, 500);
        } else {
            // Wrong
            setStreak(0);
            setScore(s => Math.max(0, s - 5));
            // Just pop that wrong one so they can't click it again
            setBalloons(balloons.filter(b => b.id !== balloonId));
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-sky-300 flex items-center justify-center text-5xl">🎈</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 overflow-hidden relative font-sans select-none flex flex-col">

            {/* Header / HUD */}
            <header className="relative z-40 bg-white/30 backdrop-blur-md px-6 py-4 shadow-lg flex justify-between items-center rounded-b-3xl">
                <Link to="/games" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-sky-500 font-bold hover:scale-110 transition-transform shadow-md">
                        ←
                    </div>
                </Link>

                <div className="text-center">
                    <h1 className="text-3xl font-black text-white drop-shadow-md">Color Pop</h1>
                    <div className="text-sky-900 font-bold bg-white/50 px-4 py-1 rounded-full text-sm inline-block shadow-sm">
                        {language === 'fr' ? 'Pop :' : 'Pop:'} <span className="text-black uppercase tracking-widest ml-1">{targetWordEn}</span>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="bg-white px-4 py-2 rounded-2xl shadow-md border-b-4 border-slate-200">
                        <span className="text-slate-400 text-xs font-bold block uppercase">{language === 'fr' ? 'Série' : 'Streak'}</span>
                        <span className="text-orange-500 font-black text-xl">🔥 {streak}</span>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl shadow-md border-b-4 border-slate-200">
                        <span className="text-slate-400 text-xs font-bold block uppercase">Score</span>
                        <span className="text-sky-500 font-black text-xl">{score}</span>
                    </div>
                </div>
            </header>

            {/* Hint overlay */}
            <div className="absolute top-32 w-full text-center z-30 pointer-events-none">
                <h2 className="text-5xl md:text-7xl font-black text-white/30 tracking-widest uppercase">
                    {targetWordEn}
                </h2>
            </div>

            {/* Game Area */}
            <div ref={containerRef} className="flex-1 relative overflow-hidden z-20">
                {balloons.map((b) => (
                    <div
                        key={b.id}
                        onClick={() => handleBalloonClick(b.id, b.word)}
                        className={`absolute bottom-[-150px] cursor-pointer hover:scale-110 active:scale-90 transition-transform float-up-anim group`}
                        style={{
                            left: `${b.left}%`,
                            animationDuration: `${b.speed}s`,
                            animationDelay: `${b.delay}s`,
                            animationTimingFunction: 'linear',
                            animationFillMode: 'forwards'
                        }}
                        onAnimationEnd={() => {
                            // If target balloon leaves screen without being popped
                            if (b.word === targetWordEs) {
                                setStreak(0);
                                setTimeout(startNextRound, 500);
                            }
                        }}
                    >
                        {/* Balloon body - Responsive sizing based on viewport percentages */}
                        <div className={`w-[22vw] min-w-[65px] max-w-[110px] aspect-[7/8] ${b.color} rounded-[50%] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.2)] flex items-center justify-center p-2 sm:p-4 relative`}>
                            {/* Reflection */}
                            <div className="absolute top-[10%] left-[15%] w-[20%] h-[25%] bg-white/30 rounded-[50%] rotate-[-45deg]"></div>
                            {/* Word */}
                            <span className="text-white font-black text-xs sm:text-base lg:text-xl tracking-tight text-center drop-shadow-md z-10 w-full break-words leading-tight px-1">
                                {b.word}
                            </span>
                        </div>
                        {/* Balloon knot */}
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 ${b.color} absolute -bottom-1 sm:-bottom-2 left-1/2 -translate-x-1/2 rotate-45`}></div>
                        {/* Balloon string */}
                        <div className="w-0.5 h-12 sm:h-16 bg-white/50 absolute -bottom-12 sm:-bottom-16 left-1/2 -translate-x-1/2"></div>
                    </div>
                ))}
            </div>

            {/* Clouds (Decorative background) */}
            <div className="absolute bottom-20 left-10 text-white/40 text-8xl pointer-events-none">☁️</div>
            <div className="absolute top-40 right-20 text-white/50 text-6xl pointer-events-none">☁️</div>
            <div className="absolute top-1/2 left-1/3 text-white/30 text-7xl pointer-events-none drop-shadow-lg">☁️</div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes floatUp {
                    0% { transform: translateY(0) rotate(0deg); }
                    25% { transform: translateY(calc(-25vh - 150px)) rotate(-5deg); }
                    50% { transform: translateY(calc(-50vh - 150px)) rotate(5deg); }
                    75% { transform: translateY(calc(-75vh - 150px)) rotate(-5deg); }
                    100% { transform: translateY(calc(-100vh - 200px)) rotate(0deg); }
                }
                .float-up-anim {
                    animation-name: floatUp;
                }
            `}} />
        </div>
    );
}
