import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';
import LanguageToggle from '../components/LanguageToggle';

export default function VocabularyReview() {
    const { completedLessons } = useProgress();
    const { language, t } = useLanguage();
    const [vocabulary, setVocabulary] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);
    const [stats, setStats] = useState({ known: 0, learning: 0 });
    const [loading, setLoading] = useState(true);

    // Load vocabulary from completed lessons
    useEffect(() => {
        async function loadVocabulary() {
            const allVocab = [];

            for (const lessonId of completedLessons) {
                try {
                    const res = await fetch(`/data/songs/${lessonId}.json`);
                    const data = await res.json();

                    if (data.focusVocab) {
                        data.focusVocab.forEach(word => {
                            if (!allVocab.find(v => v.word === word)) {
                                allVocab.push({
                                    word,
                                    lessonId,
                                    lessonTitle: data.title,
                                    status: 'new' // new, learning, known
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.error(`Failed to load ${lessonId}`, e);
                }
            }

            // Shuffle the vocabulary
            setVocabulary(allVocab.sort(() => Math.random() - 0.5));
            setLoading(false);
        }

        loadVocabulary();
    }, [completedLessons]);

    const currentWord = vocabulary[currentIndex];

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

    const markWord = (status, e) => {
        e.stopPropagation(); // Prevent card from flipping when clicking buttons
        const updated = [...vocabulary];
        updated[currentIndex].status = status;
        setVocabulary(updated);

        // Update stats
        setStats({
            known: updated.filter(v => v.status === 'known').length,
            learning: updated.filter(v => v.status === 'learning').length
        });

        handleNext();
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
                        <div className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            <span>{stats.known} {language === 'fr' ? 'Connu' : 'Known'}</span>
                        </div>
                        <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center gap-2">
                            <span className="text-lg leading-none">📖</span>
                            <span>{stats.learning} {language === 'fr' ? 'En cours' : 'Learning'}</span>
                        </div>
                        <div className="px-4 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-full flex items-center gap-2">
                            <span className="text-lg leading-none">📝</span>
                            <span>{vocabulary.length - stats.known - stats.learning} {language === 'fr' ? 'Nouveau' : 'New'}</span>
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
                                ${currentWord.status === 'known' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                    currentWord.status === 'learning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                        'bg-white/5 border-white/10 text-slate-400'
                                }`}>
                                {currentWord.status === 'known' ? 'Known' :
                                    currentWord.status === 'learning' ? 'Learning' : 'New Word'}
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
                                <div className="w-12 h-12 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
                                    <span className="text-2xl">🎵</span>
                                </div>

                                <h3 className="text-slate-400 font-medium text-sm mb-2 uppercase tracking-widest">
                                    {language === 'fr' ? 'Apparaît dans' : 'Featured in'}
                                </h3>

                                <p className="text-2xl font-bold text-white mb-2 leading-snug">
                                    "{currentWord.lessonTitle}"
                                </p>

                                <Link
                                    to={`/lesson/${currentWord.lessonId}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-block mt-4 text-purple-400 hover:text-purple-300 font-bold transition-colors text-sm border-b border-transparent hover:border-purple-300"
                                >
                                    {language === 'fr' ? 'Revoir la Leçon' : 'Review Lesson'} →
                                </Link>
                            </div>

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 w-full px-8">
                                <button
                                    onClick={(e) => markWord('learning', e)}
                                    className="flex-1 py-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold rounded-xl transition-colors text-sm"
                                >
                                    {language === 'fr' ? '📖 En cours' : 'Still Learning'}
                                </button>
                                <button
                                    onClick={(e) => markWord('known', e)}
                                    className="flex-1 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    {language === 'fr' ? 'Je sais' : 'I Know It'}
                                </button>
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
