import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import LanguageToggle from '../components/LanguageToggle';
import { srsApi } from '../services/api/srsApi';
import { calculateSM2 } from '../services/srsAlgorithm';

export default function VocabularyReview() {
    const { completedLessons } = useProgress();
    const { language, t } = useLanguage();
    const [vocabulary, setVocabulary] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const { user } = useAuth();
    const [stats, setStats] = useState({ new: 0, due: 0, total_known: 0 });

    // Load vocabulary from completed lessons and SRS Database
    useEffect(() => {
        async function loadVocabulary() {
            const allVocab = [];

            // 1. Load curriculum vocab
            for (const lessonId of completedLessons) {
                try {
                    const res = await fetch(`/data/songs/${lessonId}.json`);
                    const data = await res.json();

                    if (data.focusVocab) {
                        data.focusVocab.forEach(word => {
                            if (!allVocab.find(v => v.word === word)) {
                                allVocab.push({
                                    word,
                                    en: getTranslation(word), // We pre-fetch translation for DB
                                    lessonId,
                                    lessonTitle: data.title
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.error(`Failed to load ${lessonId}`, e);
                }
            }

            // 2. Fetch SRS data from Supabase
            let dbItems = [];
            if (user) {
                dbItems = await srsApi.getAllItems(user.id);
            }

            const dbItemsMap = {};
            dbItems.forEach(item => {
                dbItemsMap[item.word_es] = item;
            });

            // 3. Build the deck
            const now = new Date();
            const reviewDeck = [];
            let knownCount = 0;

            allVocab.forEach(v => {
                const dbEntry = dbItemsMap[v.word];
                if (!dbEntry) {
                    // New word not yet reviewed
                    reviewDeck.push({ ...v, status: 'new', srs: null });
                } else {
                    knownCount++;
                    // Already reviewed - check if due
                    const nextReview = new Date(dbEntry.next_review_date);
                    if (nextReview <= now || isNaN(nextReview.getTime())) {
                        reviewDeck.push({ ...v, status: 'due', srs: dbEntry });
                    }
                }
            });

            // Update stats
            setStats({
                new: reviewDeck.filter(v => v.status === 'new').length,
                due: reviewDeck.filter(v => v.status === 'due').length,
                total_known: knownCount
            });

            // Shuffle the active review deck
            setVocabulary(reviewDeck.sort(() => Math.random() - 0.5));
            setLoading(false);
        }

        loadVocabulary();
    }, [completedLessons, user]);

    const currentWord = vocabulary[currentIndex];

    // Comprehensive Mock Dictionary for current curriculum
    const mockDictionary = {
        // Unit 1
        "Hola": "Hello",
        "Buenos días": "Good morning",
        "Buenas tardes": "Good afternoon",
        "Buenas noches": "Good evening",
        "Adiós": "Goodbye",
        "Hasta mañana": "See you tomorrow",
        "Cómo estás": "How are you",
        "Me llamo": "My name is",
        "Se llama": "His/Her name is",
        "Tengo años": "I am ... years old",
        "Cómo te llamas": "What's your name",
        "Mucho gusto": "Nice to meet you",
        "Encantado": "Charmed / Delighted",
        "Soy": "I am",
        // Unit 9
        "restaurante": "restaurant",
        "mesa": "table",
        "mesero": "waiter",
        "menú": "menu",
        "pedir": "to order",
        "hambre": "hunger",
        "sed": "thirst",
        "quisiera": "I would like",
        "sopa": "soup",
        "plato principal": "main course",
        "pollo": "chicken",
        "arroz": "rice",
        "beber": "to drink",
        "buen provecho": "enjoy your meal",
        "la cuenta": "the bill",
        "aceptar": "to accept",
        "tarjetas": "cards",
        "propina": "tip",
        "postre": "dessert",
        "cuánto es": "how much is it",
        // Other common ones
        "pasaporte": "passport",
        "equipaje": "luggage",
        "maleta": "suitcase",
        "puerta de embarque": "boarding gate",
        "vuelo": "flight",
        "por": "for (cause/motion)",
        "para": "for (destination)",
        "destino": "destination",
        "causa": "cause",
        "música": "music",
        "instrumento": "instrument",
        "montañas": "mountains",
        "flauta": "flute",
        "gracias": "thank you",
        "por favor": "please",
        "agua": "water",
        "familia": "family",
        "hermano": "brother",
        "hermana": "sister",
        "padre": "father",
        "madre": "mother",
        "abuelo": "grandfather",
        "abuela": "grandmother",
        "casa": "house"
    };

    const getTranslation = (word) => {
        if (!word) return 'Translation hidden';
        // Try exact match
        if (mockDictionary[word]) return mockDictionary[word];
        // Try case-insensitive
        const lowerList = Object.keys(mockDictionary).reduce((acc, key) => {
            acc[key.toLowerCase()] = mockDictionary[key];
            return acc;
        }, {});
        if (lowerList[word.toLowerCase()]) return lowerList[word.toLowerCase()];

        return 'Translation hidden';
    };

    const handleNext = () => {
        setShowTranslation(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % vocabulary.length);
        }, 150); // Small delay to let card flip back before changing content
    };

    const handlePrev = () => {
        setShowTranslation(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + vocabulary.length) % vocabulary.length);
        }, 150);
    };

    const handleRateWord = async (rating, e) => {
        e.stopPropagation(); // Prevent card flip

        // 1. Calculate new SM-2 stats
        const prevSrs = currentWord.srs || { repetition: 0, interval: 0, ease_factor: 2.5 };
        const newStats = calculateSM2(rating, prevSrs.repetition, prevSrs.interval, prevSrs.ease_factor);

        // 2. Persist to DB if logged in
        if (user) {
            await srsApi.updateItem(user.id, currentWord.word, currentWord.en, newStats);
        }

        // 3. Remove from local active deck (it's been reviewed)
        const updatedDeck = [...vocabulary];
        updatedDeck.splice(currentIndex, 1);
        setVocabulary(updatedDeck);

        // Update stats breakdown
        setStats(prev => ({
            ...prev,
            new: updatedDeck.filter(v => v.status === 'new').length,
            due: updatedDeck.filter(v => v.status === 'due').length,
            // visually increment total known immediately if it was new
            total_known: currentWord.status === 'new' ? prev.total_known + 1 : prev.total_known
        }));

        // Reset index if we overflowed the deck
        if (currentIndex >= updatedDeck.length && updatedDeck.length > 0) {
            setCurrentIndex(0);
        }

        setShowTranslation(false);
    };

    const shuffleVocabulary = () => {
        setVocabulary([...vocabulary].sort(() => Math.random() - 0.5));
        setCurrentIndex(0);
        setShowTranslation(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center text-slate-200">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium">{language === 'fr' ? 'Chargement du vocabulaire...' : 'Loading vocabulary...'}</p>
                </div>
            </div>
        );
    }

    if (vocabulary.length === 0) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] p-8 text-slate-200 font-sans selection:bg-purple-500/30 overflow-hidden relative">
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen animate-blob"></div>
                </div>

                <header className="relative z-10 max-w-7xl mx-auto flex justify-between items-center mb-12">
                    <Link to="/learn" className="flex items-center gap-2 group">
                        <span className="text-2xl group-hover:scale-110 transition-transform">🎸</span>
                        <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            Linguofy
                        </span>
                    </Link>
                    <LanguageToggle />
                </header>

                <div className="max-w-md mx-auto text-center py-20 relative z-10 animate-fade-in-up">
                    <div className="w-32 h-32 mx-auto bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-6xl mb-8 shadow-[0_0_50px_rgba(168,85,247,0.15)]">
                        📚
                    </div>
                    <h1 className="text-3xl font-black mb-4 track-tight text-white">
                        {language === 'fr' ? 'Pas de vocabulaire à réviser' : 'No Vocabulary to Review'}
                    </h1>
                    <p className="text-slate-400 mb-10 text-lg leading-relaxed">
                        {language === 'fr'
                            ? 'Terminez des leçons pour débloquer des mots à réviser !'
                            : 'Complete lessons to unlock vocabulary to review!'}
                    </p>
                    <Link to="/learn" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-purple-500/25 active:scale-95">
                        {language === 'fr' ? 'Commencer à apprendre' : 'Start Learning'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-purple-500/30 overflow-x-hidden pb-12 relative">

            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none z-0 block">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen animate-blob"></div>
                <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-pink-600/10 blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0A0F1C]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 mb-12">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/learn" className="flex items-center gap-2 group">
                        <span className="text-2xl group-hover:scale-110 transition-transform origin-center">🎸</span>
                        <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            Linguofy
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/learn" className="px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors hidden sm:block">
                            {language === 'fr' ? 'Retour au parcours' : 'Back to Course'}
                        </Link>
                        <LanguageToggle />
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-6 relative z-10 w-full animate-fade-in-up">

                {/* Stats Bar */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-black mb-6">
                        {language === 'fr' ? 'Révision du Vocabulaire' : 'Vocabulary Review'}
                    </h1>

                    <div className="flex flex-wrap justify-center gap-3 text-sm font-medium mb-4">
                        <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center gap-2">
                            <span className="text-lg leading-none">🆕</span>
                            <span>{stats.new} {language === 'fr' ? 'Nouveau(x)' : 'New Words'}</span>
                        </div>
                        <div className="px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center gap-2">
                            <span className="text-lg leading-none">⏰</span>
                            <span>{stats.due} {language === 'fr' ? 'À réviser' : 'Due for Review'}</span>
                        </div>
                        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-2">
                            <span className="text-lg leading-none">🧠</span>
                            <span>{stats.total_known} {language === 'fr' ? 'Connus' : 'Total Known'}</span>
                        </div>
                    </div>

                    <div className="w-full max-w-md mx-auto flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest mt-6">
                        <span>Card</span>
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                style={{ width: `${((currentIndex + 1) / vocabulary.length) * 100}%` }}
                            />
                        </div>
                        <span>{currentIndex + 1} / {vocabulary.length}</span>
                    </div>
                </div>

                {/* Flashcard Container - preserves 3d space */}
                <div className="max-w-md mx-auto perspective-1000 mb-8">
                    {/* The Card */}
                    <div
                        onClick={() => setShowTranslation(!showTranslation)}
                        className={`relative w-full transition-transform duration-500 transform-style-3d cursor-pointer min-h-[350px]
                            ${showTranslation ? 'rotate-y-180' : ''}`}
                    >
                        {/* Front of card */}
                        <div className="absolute inset-0 backface-hidden bg-white/[0.02] rounded-[2rem] p-8 border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center backdrop-blur-xl group hover:bg-white/[0.04] transition-colors">

                            <div className={`absolute top-6 left-1/2 -translate-x-1/2 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest border transition-colors
                                ${currentWord.status === 'new' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                    'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                }`}>
                                {currentWord.status === 'new' ? (language === 'fr' ? 'Nouveau Mot' : 'New Word') :
                                    (language === 'fr' ? 'À Réviser' : 'Due Review')}
                            </div>

                            <div className="text-4xl md:text-5xl font-black mb-8 text-center text-white tracking-tight break-words max-w-full">
                                {currentWord.word}
                            </div>

                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-slate-500 text-sm font-medium opacity-50 group-hover:opacity-100 transition-opacity">
                                <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                                {language === 'fr' ? 'Tapez pour retourner' : 'Tap to reveal'}
                            </div>
                        </div>

                        {/* Back of card */}
                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-[2rem] p-8 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col items-center justify-center group">

                            <div className="text-center w-full max-w-[80%]">
                                <div className="text-4xl md:text-5xl font-black mb-4 text-purple-400 tracking-tight break-words max-w-full drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                                    {getTranslation(currentWord.word)}
                                </div>

                                <div className="w-12 h-12 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 mt-6">
                                    <span className="text-xl">🎵</span>
                                </div>

                                <h3 className="text-slate-400 font-medium text-xs mb-1 uppercase tracking-widest">
                                    {language === 'fr' ? 'Apparaît dans' : 'Featured in'}
                                </h3>

                                <p className="text-lg font-bold text-white mb-2 leading-snug">
                                    "{currentWord.lessonTitle}"
                                </p>

                                <Link
                                    to={`/lesson/${currentWord.lessonId}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-block mt-2 text-purple-400 hover:text-purple-300 font-bold transition-colors text-sm border-b border-transparent hover:border-purple-300"
                                >
                                    {language === 'fr' ? 'Revoir la Leçon' : 'Review Lesson'} →
                                </Link>
                            </div>

                            <div className="absolute bottom-6 left-0 right-0 w-full px-6 flex flex-col gap-2">
                                <p className="text-center text-xs text-slate-400 font-medium mb-1 uppercase tracking-widest">
                                    {language === 'fr' ? 'Comment vous en êtes-vous sorti ?' : 'How did you do?'}
                                </p>
                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={(e) => handleRateWord(0, e)}
                                        className="flex-1 py-2 lg:py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition-colors text-xs lg:text-sm"
                                        title={language === 'fr' ? 'Trou de mémoire complet' : 'Total Blackout'}
                                    >
                                        {language === 'fr' ? 'Oubli' : 'Forgot'}
                                    </button>
                                    <button
                                        onClick={(e) => handleRateWord(2, e)}
                                        className="flex-1 py-2 lg:py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold rounded-xl transition-colors text-xs lg:text-sm"
                                    >
                                        {language === 'fr' ? 'Difficile' : 'Hard'}
                                    </button>
                                    <button
                                        onClick={(e) => handleRateWord(4, e)}
                                        className="flex-1 py-2 lg:py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold rounded-xl transition-colors text-xs lg:text-sm"
                                    >
                                        {language === 'fr' ? 'Bien' : 'Good'}
                                    </button>
                                    <button
                                        onClick={(e) => handleRateWord(5, e)}
                                        className="flex-1 py-2 lg:py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold rounded-xl transition-colors text-xs lg:text-sm"
                                    >
                                        {language === 'fr' ? 'Facile' : 'Easy'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="max-w-md mx-auto flex items-center justify-between gap-4 mt-8">
                    <button
                        onClick={handlePrev}
                        className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 transition-colors active:scale-95 shrink-0"
                        aria-label={language === 'fr' ? 'Précédent' : 'Previous'}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    <button
                        onClick={shuffleVocabulary}
                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all active:scale-95 text-sm font-bold tracking-wider uppercase text-slate-300 flex items-center justify-center gap-2 group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">🔀</span>
                        {language === 'fr' ? 'Mélanger' : 'Shuffle Deck'}
                    </button>

                    <button
                        onClick={handleNext}
                        className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 transition-colors active:scale-95 shrink-0"
                        aria-label={language === 'fr' ? 'Suivant' : 'Next'}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                {/* Mobile Back Link */}
                <div className="text-center mt-12 sm:hidden">
                    <Link to="/learn" className="text-slate-500 text-sm font-medium hover:text-white transition-colors">
                        ← {language === 'fr' ? 'Retour au parcours' : 'Back to Course'}
                    </Link>
                </div>

            </div>

            {/* Injected CSS for 3D Flips */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                /* Custom Scrollbar for the whole page */
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            `}} />
        </div>
    );
}
