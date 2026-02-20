import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';

// Shared Mock Dictionary (Duplicated for demo purposes, ideally would be a separate utility)
const mockDictionary = {
    "Hola": "Hello", "Buenos días": "Good morning", "Buenas tardes": "Good afternoon",
    "Buenas noches": "Good evening", "Adiós": "Goodbye", "Hasta mañana": "See you tomorrow",
    "Cómo estás": "How are you", "Me llamo": "My name is", "Se llama": "His/Her name is",
    "Tengo años": "I am ... years old", "Cómo te llamas": "What's your name",
    "Mucho gusto": "Nice to meet you", "Encantado": "Charmed / Delighted", "Soy": "I am",
    "restaurante": "restaurant", "mesa": "table", "mesero": "waiter", "menú": "menu",
    "pedir": "to order", "hambre": "hunger", "sed": "thirst", "quisiera": "I would like",
    "sopa": "soup", "plato principal": "main course", "pollo": "chicken", "arroz": "rice",
    "beber": "to drink", "buen provecho": "enjoy your meal", "la cuenta": "the bill",
    "aceptar": "to accept", "tarjetas": "cards", "propina": "tip", "postre": "dessert",
    "cuánto es": "how much is it"
};

const DEFAULT_VOCAB = ["Hola", "Adiós", "perro", "gato", "agua", "fuego"];
const DEFAULT_DICT = { "Hola": "Hello", "Adiós": "Goodbye", "perro": "dog", "gato": "cat", "agua": "water", "fuego": "fire" };

export default function WordMatch() {
    const { completedLessons } = useProgress();
    const { language } = useLanguage();

    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedIds, setMatchedIds] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [loading, setLoading] = useState(true);

    const initializeGame = async () => {
        setLoading(true);
        setMoves(0);
        setFlippedIndices([]);
        setMatchedIds([]);
        setGameWon(false);

        let vocabList = [];

        // Try to load user's actual vocab
        for (const lessonId of completedLessons) {
            try {
                const res = await fetch(`/data/songs/${lessonId}.json`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.focusVocab) {
                        data.focusVocab.forEach(v => {
                            if (!vocabList.includes(v) && mockDictionary[v]) {
                                vocabList.push(v);
                            }
                        });
                    }
                }
            } catch (e) {
                // ignore
            }
        }

        // Fallback to default if not enough vocab
        let finalVocab = vocabList.length >= 6 ? vocabList : Object.keys(DEFAULT_DICT);
        let dictionary = finalVocab === vocabList ? mockDictionary : DEFAULT_DICT;

        // Select 6 random words (or fewer if we have < 6)
        const shuffledVocab = [...finalVocab].sort(() => Math.random() - 0.5).slice(0, 6);

        // Create pairs
        const cardPairs = [];
        shuffledVocab.forEach((word, index) => {
            const id = `pair-${index}`;
            cardPairs.push({ id, type: 'es', content: word });
            cardPairs.push({ id, type: 'en', content: dictionary[word] || 'Translate' });
        });

        // Shuffle deck
        const deck = cardPairs.sort(() => Math.random() - 0.5);
        setCards(deck);
        setLoading(false);
    };

    useEffect(() => {
        initializeGame();
    }, [completedLessons]);

    const handleCardClick = (index) => {
        // Prevent clicking if checking, card already flipped, or already matched
        if (isChecking || flippedIndices.includes(index) || matchedIds.includes(cards[index].id)) {
            return;
        }

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setIsChecking(true);
            setMoves(m => m + 1);

            const [firstIndex, secondIndex] = newFlipped;
            const firstCard = cards[firstIndex];
            const secondCard = cards[secondIndex];

            if (firstCard.id === secondCard.id && firstCard.type !== secondCard.type) {
                // Match!
                setMatchedIds([...matchedIds, firstCard.id]);
                setFlippedIndices([]);
                setIsChecking(false);

                // Check win condition
                if (matchedIds.length + 1 === cards.length / 2) {
                    setTimeout(() => setGameWon(true), 500);
                }
            } else {
                // No match, flip back after delay
                setTimeout(() => {
                    setFlippedIndices([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center text-white">
                <div className="animate-spin text-4xl">🎴</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-orange-500/30 overflow-x-hidden pb-12 relative">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0 block">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[120px] mix-blend-screen animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-red-600/10 blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
            </div>

            <header className="sticky top-0 z-40 bg-[#0A0F1C]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 mb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/games" className="flex items-center gap-2 group">
                        <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="text-xl font-bold text-slate-300 group-hover:text-white transition-colors">
                            {language === 'fr' ? 'Retour aux jeux' : 'Back to Arcade'}
                        </span>
                    </Link>
                    <div className="flex items-center gap-4 text-orange-400 font-black text-xl tracking-widest uppercase">
                        Word Matcher
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 relative z-10 w-full animate-fade-in-up">

                <div className="flex justify-between items-center mb-8">
                    <div className="text-xl font-bold">
                        <span className="text-slate-400">{language === 'fr' ? 'Coups: ' : 'Moves: '}</span>
                        <span className="text-orange-400 text-2xl ml-2">{moves}</span>
                    </div>
                    <button
                        onClick={initializeGame}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-all active:scale-95 text-white flex items-center gap-2"
                    >
                        🔄 {language === 'fr' ? 'Recommencer' : 'Restart'}
                    </button>
                </div>

                {/* Game Grid */}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 perspective-1000">
                    {cards.map((card, index) => {
                        const isFlipped = flippedIndices.includes(index) || matchedIds.includes(card.id);
                        const isMatched = matchedIds.includes(card.id);

                        return (
                            <div
                                key={index}
                                onClick={() => handleCardClick(index)}
                                className={`relative aspect-[3/4] cursor-pointer transform-style-3d transition-all duration-500 ease-out
                                    ${isFlipped ? 'rotate-y-180' : 'hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(249,115,22,0.3)]'}
                                    ${isMatched ? 'opacity-50 scale-95' : ''}
                                `}
                            >
                                {/* Front of card (Face down) */}
                                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg border-2 border-orange-400/50">
                                    <div className="w-12 h-12 rounded-full border-4 border-white/20 flex items-center justify-center opacity-50">
                                        <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                                    </div>
                                    <div className="absolute inset-2 border-2 border-dashed border-white/20 rounded-xl pointer-events-none"></div>
                                </div>

                                {/* Back of card (Face up) */}
                                <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-2xl flex flex-col items-center justify-center p-4 shadow-xl border-4 ${isMatched ? 'border-green-400' : 'border-slate-200'}`}>
                                    <div className="text-xs uppercase tracking-widest font-black text-slate-300 mb-2">
                                        {card.type === 'es' ? 'Spanish' : 'English'}
                                    </div>
                                    <div className={`text-xl md:text-2xl font-black text-center break-words w-full ${card.type === 'es' ? 'text-orange-500' : 'text-slate-800'}`}>
                                        {card.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Win Modal Overlay */}
                {gameWon && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
                        <div className="bg-[#1E293B] border border-white/10 rounded-3xl p-10 max-w-md w-full mx-4 text-center shadow-[0_0_50px_rgba(249,115,22,0.3)] transform scale-110 animate-pop-in">
                            <div className="text-6xl mb-6">🏆</div>
                            <h2 className="text-3xl font-black text-white mb-2">
                                {language === 'fr' ? 'Tu as gagné !' : 'You Win!'}
                            </h2>
                            <p className="text-slate-400 mb-8 text-lg">
                                {language === 'fr' ? 'Tu as complété le jeu en' : 'You completed the board in'} <span className="text-orange-400 font-bold">{moves}</span> {language === 'fr' ? 'coups.' : 'moves.'}
                            </p>

                            <div className="flex gap-4 justify-center">
                                <Link to="/games" className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors">
                                    Arcade
                                </Link>
                                <button onClick={initializeGame} className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold transition-all shadow-lg shadow-orange-500/30">
                                    {language === 'fr' ? 'Rejouer' : 'Play Again'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                @keyframes pop-in {
                    0% { opacity: 0; transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}} />
        </div>
    );
}
