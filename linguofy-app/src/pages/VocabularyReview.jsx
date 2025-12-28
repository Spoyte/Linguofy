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
    const [mode, setMode] = useState('review'); // review, quiz
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
        setCurrentIndex((prev) => (prev + 1) % vocabulary.length);
    };

    const handlePrev = () => {
        setShowTranslation(false);
        setCurrentIndex((prev) => (prev - 1 + vocabulary.length) % vocabulary.length);
    };

    const markWord = (status) => {
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
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-xl">{language === 'fr' ? 'Chargement du vocabulaire...' : 'Loading vocabulary...'}</div>
            </div>
        );
    }

    if (vocabulary.length === 0) {
        return (
            <div className="min-h-screen p-8 text-white">
                <header className="flex justify-between items-center mb-12">
                    <Link to="/learn" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
                        Linguofy
                    </Link>
                    <LanguageToggle />
                </header>

                <div className="max-w-md mx-auto text-center py-20">
                    <div className="text-6xl mb-6">📚</div>
                    <h1 className="text-2xl font-bold mb-4">
                        {language === 'fr' ? 'Pas de vocabulaire à réviser' : 'No Vocabulary to Review'}
                    </h1>
                    <p className="text-slate-400 mb-8">
                        {language === 'fr'
                            ? 'Terminez des leçons pour débloquer des mots à réviser !'
                            : 'Complete lessons to unlock vocabulary to review!'}
                    </p>
                    <Link to="/learn" className="px-6 py-3 bg-green-500 hover:bg-green-400 text-slate-900 font-bold rounded-xl">
                        {language === 'fr' ? 'Commencer à apprendre' : 'Start Learning'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 text-white">
            {/* Header */}
            <header className="flex justify-between items-center mb-8">
                <Link to="/learn" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
                    Linguofy
                </Link>
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                </div>
            </header>

            {/* Stats Bar */}
            <div className="max-w-2xl mx-auto mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">
                        {language === 'fr' ? '📚 Révision du Vocabulaire' : '📚 Vocabulary Review'}
                    </h1>
                    <div className="text-sm text-slate-400">
                        {currentIndex + 1} / {vocabulary.length}
                    </div>
                </div>

                <div className="flex gap-4 text-sm">
                    <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                        ✓ {stats.known} {language === 'fr' ? 'connu' : 'known'}
                    </div>
                    <div className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full">
                        📖 {stats.learning} {language === 'fr' ? 'en cours' : 'learning'}
                    </div>
                    <div className="px-3 py-1 bg-slate-500/20 text-slate-400 rounded-full">
                        📝 {vocabulary.length - stats.known - stats.learning} {language === 'fr' ? 'nouveau' : 'new'}
                    </div>
                </div>
            </div>

            {/* Flashcard */}
            <div className="max-w-md mx-auto">
                <div
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-xl cursor-pointer transition-all hover:border-purple-500/50 min-h-[300px] flex flex-col items-center justify-center"
                >
                    {/* Word */}
                    <div className="text-4xl font-bold mb-4 text-center">
                        {currentWord.word}
                    </div>

                    {/* Status badge */}
                    <div className={`text-xs px-2 py-1 rounded-full mb-6 ${currentWord.status === 'known' ? 'bg-green-500/20 text-green-400' :
                            currentWord.status === 'learning' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-slate-600/50 text-slate-400'
                        }`}>
                        {currentWord.status === 'known' ? '✓ Known' :
                            currentWord.status === 'learning' ? '📖 Learning' : '📝 New'}
                    </div>

                    {/* Tap hint */}
                    {!showTranslation && (
                        <div className="text-slate-500 text-sm">
                            {language === 'fr' ? 'Tapez pour voir la source' : 'Tap to reveal source'}
                        </div>
                    )}

                    {/* Source lesson */}
                    {showTranslation && (
                        <div className="text-center animate-fade-in">
                            <div className="text-slate-400 text-sm mb-2">
                                {language === 'fr' ? 'De la leçon:' : 'From lesson:'}
                            </div>
                            <div className="text-purple-400 font-medium">
                                {currentWord.lessonTitle}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => markWord('learning')}
                        className="flex-1 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 font-bold rounded-xl transition"
                    >
                        {language === 'fr' ? '📖 En cours' : '📖 Learning'}
                    </button>
                    <button
                        onClick={() => markWord('known')}
                        className="flex-1 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold rounded-xl transition"
                    >
                        {language === 'fr' ? '✓ Je sais' : '✓ I Know'}
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handlePrev}
                        className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition"
                    >
                        ← {language === 'fr' ? 'Précédent' : 'Previous'}
                    </button>
                    <button
                        onClick={shuffleVocabulary}
                        className="py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition"
                        title={language === 'fr' ? 'Mélanger' : 'Shuffle'}
                    >
                        🔀
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition"
                    >
                        {language === 'fr' ? 'Suivant' : 'Next'} →
                    </button>
                </div>
            </div>

            {/* Back to course link */}
            <div className="text-center mt-12">
                <Link to="/learn" className="text-slate-400 hover:text-white transition">
                    ← {language === 'fr' ? 'Retour au parcours' : 'Back to Course'}
                </Link>
            </div>
        </div>
    );
}
