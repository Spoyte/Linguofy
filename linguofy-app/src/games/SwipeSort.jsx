import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';

// Fallback vocab
const FALLBACK_VOCAB = [
    { es: "Hola", en: "Hello" },
    { es: "Gato", en: "Cat" },
    { es: "Perro", en: "Dog" },
    { es: "Agua", en: "Water" },
    { es: "Pan", en: "Bread" },
    { es: "Casa", en: "House" },
    { es: "Libro", en: "Book" },
    { es: "Mesa", en: "Table" },
];

export default function SwipeSort() {
    const { completedLessons } = useProgress();
    const { language } = useLanguage();

    const [vocabulary, setVocabulary] = useState([]);
    const [cards, setCards] = useState([]);

    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);

    // Drag state
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const cardRef = useRef(null);

    // Load vocabulary
    useEffect(() => {
        async function loadContent() {
            setLoading(true);
            let userVocab = [];

            for (const lessonId of completedLessons) {
                try {
                    const res = await fetch(`/data/songs/${lessonId}.json`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.vocabulary && Array.isArray(data.vocabulary)) {
                            data.vocabulary.forEach(item => {
                                if (item.es && item.en) {
                                    userVocab.push({ es: item.es, en: item.en });
                                }
                            });
                        }
                    }
                } catch (e) {
                    // Ignore
                }
            }

            if (userVocab.length < 5) {
                userVocab = FALLBACK_VOCAB;
            }

            setVocabulary(userVocab);
            setLoading(false);
        }

        loadContent();
    }, [completedLessons]);

    // Generate initial deck
    useEffect(() => {
        if (!loading && vocabulary.length > 0 && cards.length === 0) {
            generateCards(5); // Keep a stack of 5 cards ready
        }
    }, [loading, vocabulary, cards]);

    const generateCards = (count) => {
        const newCards = [];
        for (let i = 0; i < count; i++) {
            // Decide if this card will be a true match (50% chance)
            const isMatch = Math.random() > 0.5;

            // Pick a random English word
            const sourceItem = vocabulary[Math.floor(Math.random() * vocabulary.length)];

            let esWord = sourceItem.es;
            if (!isMatch) {
                // Pick a wrong Spanish word
                let wrongItem;
                do {
                    wrongItem = vocabulary[Math.floor(Math.random() * vocabulary.length)];
                } while (wrongItem.es === sourceItem.es && vocabulary.length > 1);
                esWord = wrongItem.es;
            }

            newCards.push({
                id: Math.random().toString(36).substr(2, 9),
                en: sourceItem.en,
                es: esWord,
                isMatch: isMatch
            });
        }
        setCards(prev => [...prev, ...newCards]);
    };

    // --- Drag Handlers ---
    const handleDragStart = (e) => {
        if (cards.length === 0) return;
        setIsDragging(true);
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        setDragStart({ x: clientX, y: clientY });
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;

        // Prevent default scrolling on mobile while dragging
        if (e.type.includes('touch') && e.cancelable) {
            e.preventDefault();
        }

        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        const offsetX = clientX - dragStart.x;
        const offsetY = clientY - dragStart.y;

        setDragOffset({ x: offsetX, y: offsetY });
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        const SWIPE_THRESHOLD = 100;

        if (dragOffset.x > SWIPE_THRESHOLD) {
            handleSwipe('right');
        } else if (dragOffset.x < -SWIPE_THRESHOLD) {
            handleSwipe('left');
        } else {
            // Snap back
            setDragOffset({ x: 0, y: 0 });
        }
    };

    const handleSwipe = (direction) => {
        if (cards.length === 0) return;

        const currentCard = cards[0];

        // Animate out
        const throwOutX = direction === 'right' ? window.innerWidth : -window.innerWidth;
        setDragOffset({ x: throwOutX, y: dragOffset.y });

        const userSaysMatch = direction === 'right';
        const isCorrect = userSaysMatch === currentCard.isMatch;

        if (isCorrect) {
            setScore(s => s + 10 + (streak * 2));
            setStreak(s => s + 1);
        } else {
            setStreak(0);
        }

        // Wait for animation, then remove card
        setTimeout(() => {
            setCards(prev => {
                const newStack = prev.slice(1);
                if (newStack.length < 3) {
                    generateCards(3); // Refill strategy
                }
                return newStack;
            });
            setDragOffset({ x: 0, y: 0 });
        }, 200); // 200ms transition
    };

    // Global touch move preventer when dragging to stop pull-to-refresh
    useEffect(() => {
        const preventDefault = (e) => {
            if (isDragging) e.preventDefault();
        };
        document.addEventListener('touchmove', preventDefault, { passive: false });
        return () => document.removeEventListener('touchmove', preventDefault);
    }, [isDragging]);


    if (loading) {
        return <div className="min-h-screen bg-rose-950 flex items-center justify-center text-5xl">📱</div>;
    }

    return (
        <div className="min-h-screen bg-[#1F1123] text-rose-100 font-sans flex flex-col items-center overflow-x-hidden selection:bg-rose-500/30 touch-none fixed inset-0 w-full h-full">

            <header className="w-full bg-rose-950/80 backdrop-blur-md border-b border-rose-900/50 py-3 px-6 shadow-xl flex justify-between items-center z-40">
                <Link to="/games" className="flex items-center gap-2 group">
                    <span className="text-2xl group-hover:-translate-x-1 transition-transform text-pink-400">←</span>
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 group-hover:from-pink-300 group-hover:to-rose-300 transition-all uppercase tracking-widest hidden sm:inline">
                        {language === 'fr' ? 'Arcade' : 'Arcade'}
                    </span>
                </Link>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-rose-500/80 text-[10px] font-black tracking-widest uppercase">Streak</span>
                        <div className="flex items-center gap-1">
                            <span className="text-orange-400 text-sm">🔥</span>
                            <span className="text-rose-200 font-black text-xl leading-none">{streak}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-pink-500/80 text-[10px] font-black tracking-widest uppercase">Score</span>
                        <span className="text-pink-400 font-black text-2xl leading-none">{score}</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 w-full max-w-md px-4 py-8 flex flex-col items-center relative flex-grow overflow-hidden">

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black mb-2 tracking-tight text-white">
                        {language === 'fr' ? 'Balayage de Mots' : 'Swipe Sort'}
                    </h1>
                    <p className="text-rose-300/70 text-sm px-4">
                        {language === 'fr'
                            ? 'Glisse à DROITE si la traduction est correcte. Glisse à GAUCHE si elle est fausse !'
                            : 'Swipe RIGHT if the translation matches. Swipe LEFT if it\'s wrong!'}
                    </p>
                </div>

                {/* The Stack */}
                <div className="relative w-full aspect-[3/4] max-h-[60vh] flex items-center justify-center mt-4 perspective-1000">

                    {cards.length === 0 ? (
                        <div className="text-rose-500 animate-pulse">Loading cards...</div>
                    ) : (
                        cards.slice(0, 3).reverse().map((card, idx, arr) => {
                            const isTopCard = idx === arr.length - 1;

                            // Visuals for cards under the top one
                            let scale = 1;
                            let yOffset = 0;
                            let zIndex = idx;
                            let opacity = 1;

                            if (!isTopCard) {
                                // The cards below scales down and moves down slightly
                                const revIdx = arr.length - 1 - idx; // 1 = directly below, 2 = bottom
                                scale = 1 - (revIdx * 0.05);
                                yOffset = revIdx * 15;
                                opacity = 1 - (revIdx * 0.2);
                            }

                            // Transforms for the active card
                            let activeTransform = isTopCard && isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)';

                            // Rotation based on X offset
                            const rotate = isTopCard ? dragOffset.x * 0.05 : 0;

                            // Visual feedback overlay opacity based on X offset
                            const likedOpacity = isTopCard ? Math.min(Math.max(dragOffset.x / window.innerWidth * 2, 0), 0.8) : 0;
                            const nopedOpacity = isTopCard ? Math.min(Math.max(-dragOffset.x / window.innerWidth * 2, 0), 0.8) : 0;

                            return (
                                <div
                                    key={card.id}
                                    ref={isTopCard ? cardRef : null}
                                    onMouseDown={isTopCard ? handleDragStart : null}
                                    onMouseMove={isTopCard ? handleDragMove : null}
                                    onMouseUp={isTopCard ? handleDragEnd : null}
                                    onMouseLeave={isTopCard ? handleDragEnd : null}
                                    onTouchStart={isTopCard ? handleDragStart : null}
                                    onTouchMove={isTopCard ? handleDragMove : null}
                                    onTouchEnd={isTopCard ? handleDragEnd : null}
                                    style={{
                                        zIndex,
                                        transform: isTopCard
                                            ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotate}deg)`
                                            : `translate(0px, ${yOffset}px) scale(${scale})`,
                                        transition: activeTransform,
                                        opacity
                                    }}
                                    className={`absolute w-full h-full max-w-[320px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-slate-700/50 flex flex-col justify-between overflow-hidden cursor-grab ${isDragging && isTopCard ? 'cursor-grabbing' : ''}`}
                                >

                                    {/* Like/Nope Feedback Overlays */}
                                    <div
                                        style={{ opacity: likedOpacity }}
                                        className="absolute inset-x-0 inset-y-0 z-20 bg-gradient-to-r from-transparent via-emerald-500/20 to-emerald-500/40 pointer-events-none flex items-center justify-end pr-8"
                                    >
                                        <div className="border-4 border-emerald-400 text-emerald-400 text-4xl font-black uppercase inline-block px-4 py-2 rounded-lg transform rotate-12 bg-emerald-950/50 backdrop-blur-sm">Match</div>
                                    </div>

                                    <div
                                        style={{ opacity: nopedOpacity }}
                                        className="absolute inset-x-0 inset-y-0 z-20 bg-gradient-to-l from-transparent via-rose-500/20 to-rose-500/40 pointer-events-none flex items-center justify-start pl-8"
                                    >
                                        <div className="border-4 border-rose-400 text-rose-400 text-4xl font-black uppercase inline-block px-4 py-2 rounded-lg transform -rotate-12 bg-rose-950/50 backdrop-blur-sm">Wrong</div>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10 text-center">
                                        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">English</span>
                                        <h2 className="text-4xl font-black text-white mb-8 leading-tight">{card.en}</h2>

                                        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-8"></div>

                                        <span className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Español</span>
                                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-300 to-rose-500 leading-tight">{card.es}</h2>
                                    </div>

                                    <div className="h-4 bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-rose-500/20"></div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Mobile Button Controls (for tapping instead of swiping) */}
                <div className="absolute bottom-10 left-0 right-0 max-w-md mx-auto px-12 flex justify-between items-center z-50">
                    <button
                        onClick={() => handleSwipe('left')}
                        className="w-16 h-16 rounded-full bg-slate-800 border-4 border-slate-700 shadow-xl flex items-center justify-center text-3xl hover:bg-rose-900/50 hover:border-rose-500 hover:text-rose-400 text-slate-400 transition-all transform active:scale-90"
                    >
                        ❌
                    </button>
                    <button
                        onClick={() => handleSwipe('right')}
                        className="w-16 h-16 rounded-full bg-slate-800 border-4 border-slate-700 shadow-xl flex items-center justify-center text-3xl hover:bg-emerald-900/50 hover:border-emerald-500 hover:text-emerald-400 text-slate-400 transition-all transform active:scale-90"
                    >
                        💚
                    </button>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-1000 {
                    perspective: 1000px;
                }
                `
            }} />
        </div>
    );
}
