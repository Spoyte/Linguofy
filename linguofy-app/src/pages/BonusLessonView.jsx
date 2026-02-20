import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { useAudio } from '../contexts/AudioContext';
import ExerciseEngine from '../components/ExerciseEngine';
import { useProgress } from '../hooks/useProgress';
import confetti from 'canvas-confetti';
import LanguageToggle from '../components/LanguageToggle';

export default function BonusLessonView() {
    const { type, id } = useParams(); // type: grammar, dialogue, culture
    const { language, t } = useLanguage();
    const { markComplete, isComplete } = useProgress();
    const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudio();

    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('learn'); // learn, practice
    const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadContent() {
            try {
                const res = await fetch(`/data/${type}/${id}.json`);
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error('Failed to load content', e);
            }
            setLoading(false);
        }
        loadContent();
    }, [type, id]);

    if (loading) {
        return (
            <div className="flex-1 bg-[#0A0F1C] flex items-center justify-center text-slate-200">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium">Loading Content...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex-1 bg-[#0A0F1C] flex items-center justify-center text-slate-200">
                <div className="text-center p-8 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl">
                    <div className="text-6xl mb-6">😢</div>
                    <p className="text-xl font-bold mb-4">Content not found</p>
                    <Link to="/learn" className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors">
                        Back to Course
                    </Link>
                </div>
            </div>
        );
    }

    const exercises = data.exercises || [];
    const currentExercise = exercises[currentExerciseIdx];
    const getText = (textObj) => {
        if (!textObj) return '';
        if (typeof textObj === 'string') return textObj;
        return language === 'fr' ? (textObj.fr || textObj.en) : textObj.en;
    };

    const handleExerciseComplete = () => {
        const nextIdx = currentExerciseIdx + 1;
        setCurrentExerciseIdx(nextIdx);
        if (nextIdx >= exercises.length) {
            markComplete(id);
            confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 }, colors: ['#A855F7', '#EC4899', '#3B82F6'] });
        }
    };

    const getTypeIcon = () => {
        switch (type) {
            case 'grammar': return '📖';
            case 'dialogue': return '🗣️';
            case 'culture': return '🌍';
            default: return '📚';
        }
    };

    const getTypeLabel = () => {
        switch (type) {
            case 'grammar': return language === 'fr' ? 'Grammaire' : 'Grammar';
            case 'dialogue': return language === 'fr' ? 'Dialogue' : 'Dialogue';
            case 'culture': return language === 'fr' ? 'Culture' : 'Culture';
            default: return 'Lesson';
        }
    };

    const getThemeColor = () => {
        switch (type) {
            case 'grammar': return 'from-blue-600 to-cyan-600 text-blue-400 border-blue-500/30';
            case 'dialogue': return 'from-emerald-600 to-teal-600 text-emerald-400 border-emerald-500/30';
            case 'culture': return 'from-orange-600 to-amber-600 text-orange-400 border-orange-500/30';
            default: return 'from-purple-600 to-pink-600 text-purple-400 border-purple-500/30';
        }
    };

    const themeColors = getThemeColor();

    // Check if there is an associated song to play
    const associatedSongId = data.associatedSongId || id.replace('grammar_', '').replace('culture_', '').replace('dialogue_', '');
    const isPlayingAssociatedSong = currentTrack?.id === associatedSongId && isPlaying;

    const handlePlayAssociatedSong = async () => {
        if (currentTrack?.id === associatedSongId) {
            togglePlayPause();
            return;
        }

        // We need to fetch the song data first
        try {
            const res = await fetch(`/data/songs/${associatedSongId}.json`);
            if (!res.ok) throw new Error("Song not found");
            const songData = await res.json();

            const audioKey = language === 'fr' ? 'mixed_fr' : 'mixed_en';
            playTrack({
                id: associatedSongId,
                title: songData.title,
                audioUrl: songData.audio?.[audioKey],
                coverUrl: songData.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop'
            });
        } catch (e) {
            console.error("Could not load associated song", e);
            alert("Associated audio track not found.");
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#0A0F1C] text-slate-200 font-sans selection:bg-purple-500/30 overflow-x-hidden relative">

            {/* Animated Background Orbs */}
            <div className="fixed inset-0 pointer-events-none block z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen animate-blob"></div>
                <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000 ${type === 'grammar' ? 'bg-cyan-600/10' : type === 'culture' ? 'bg-orange-600/10' : 'bg-emerald-600/10'}`}></div>
            </div>

            {/* Header / Navbar */}
            <header className="sticky top-0 z-40 bg-[#0A0F1C]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 mb-12">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/learn" className="flex items-center gap-2 group">
                        <span className="text-2xl group-hover:scale-110 transition-transform origin-center">🎸</span>
                        <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            Linguofy
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hidden sm:flex">
                            <span className="text-xl">{getTypeIcon()}</span>
                            <span className="text-sm font-medium text-slate-300">{getTypeLabel()}</span>
                        </div>
                        <LanguageToggle />
                        <Link to="/learn" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group">
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto px-6 relative z-10 animate-fade-in-up w-full">

                {/* Title Section */}
                <div className="text-center mb-12 relative flex flex-col items-center">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${themeColors.split(' ')[0]} ${themeColors.split(' ')[1]} mb-6 shadow-lg shadow-black/20 transform -rotate-3`}>
                        <span className="text-4xl filter drop-shadow-md">{getTypeIcon()}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black mb-4 text-white tracking-tight">{data.title}</h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-6">
                        {language === 'fr' && data.description_fr ? data.description_fr : data.description}
                    </p>

                    {/* Play Associated Song Button */}
                    <button
                        onClick={handlePlayAssociatedSong}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full backdrop-blur-sm transition-all text-white font-medium text-sm group"
                    >
                        {isPlayingAssociatedSong ? (
                            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                        ) : (
                            <svg className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        )}
                        <span>{isPlayingAssociatedSong ? 'Pause Track' : 'Play Lesson Track'}</span>
                    </button>

                </div>

                {/* Main Content Container */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] backdrop-blur-xl shadow-2xl overflow-hidden min-h-[500px]">

                    {/* Tabs */}
                    <div className="flex border-b border-white/5 p-2 bg-black/20">
                        <button
                            onClick={() => setActiveTab('learn')}
                            className={`flex flex-1 items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'learn' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                        >
                            <span>📖</span> {language === 'fr' ? 'Apprendre' : 'Learn'}
                        </button>
                        <button
                            onClick={() => setActiveTab('practice')}
                            className={`flex flex-1 items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all duration-300 ${activeTab === 'practice' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                        >
                            <span>✎</span> {language === 'fr' ? 'Pratiquer' : 'Practice'}
                            {isComplete(id) && activeTab !== 'practice' && (
                                <span className="flex w-5 h-5 bg-green-500 rounded-full items-center justify-center text-xs text-black ml-2 shadow-[0_0_10px_rgba(34,197,94,0.4)]">✓</span>
                            )}
                        </button>
                    </div>

                    <div className="p-6 md:p-10">
                        {/* Learn Tab Content */}
                        {activeTab === 'learn' && (
                            <div className="space-y-12 animate-fade-in">

                                {/* Intro */}
                                {data.content?.intro && (
                                    <div className="prose prose-invert prose-lg max-w-none">
                                        <div dangerouslySetInnerHTML={{ __html: getText(data.content.intro).replace(/\*\*(.*?)\*\*/g, `<strong class="${themeColors.split(' ')[2]} font-extrabold">$1</strong>`) }} className="text-slate-300 leading-relaxed" />
                                    </div>
                                )}

                                {/* Setting (for dialogues) */}
                                {data.setting && (
                                    <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500/50 rounded-r-2xl">
                                        <span className="text-3xl filter drop-shadow-sm mt-1">🎬</span>
                                        <div>
                                            <h3 className="text-amber-500/80 font-bold uppercase tracking-widest text-xs mb-1">Setting</h3>
                                            <p className="text-amber-100/90 text-lg italic">{getText(data.setting)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Dialogue Lines */}
                                {data.dialogue && (
                                    <div className="space-y-6 my-8">
                                        {data.dialogue.map((line, idx) => {
                                            const character = data.characters?.find(c => c.id === line.speaker);
                                            const isYou = line.speaker === 'you';
                                            return (
                                                <div key={idx} className={`flex gap-4 md:gap-6 ${isYou ? 'flex-row-reverse' : ''}`}>
                                                    <div className="flex flex-col items-center gap-2 shrink-0">
                                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 ${isYou ? 'bg-purple-600/20 border-purple-500/50' : 'bg-slate-700/50 border-slate-600'}`}>
                                                            {character?.avatar || (isYou ? '😎' : '👤')}
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider hidden sm:block">
                                                            {character?.name || (isYou ? 'You' : line.speaker)}
                                                        </span>
                                                    </div>
                                                    <div className={`relative flex-1 p-6 rounded-3xl backdrop-blur-sm ${isYou ? 'bg-purple-600/10 border border-purple-500/20 rounded-tr-sm' : 'bg-slate-800/50 border border-slate-700 rounded-tl-sm'}`}>
                                                        {/* Speech Bubble Arrow */}
                                                        <div className={`absolute top-6 w-3 h-3 ${isYou ? '-right-1.5 bg-purple-600/20 border-t border-r border-purple-500/20 rotate-45' : '-left-1.5 bg-slate-800 border-b border-l border-slate-700 rotate-45'}`}></div>

                                                        <p className={`font-medium text-xl md:text-2xl mb-3 ${isYou ? 'text-white' : 'text-slate-200'}`}>{line.text}</p>
                                                        <p className="text-sm md:text-base text-slate-400 border-t border-white/5 pt-3">{getText(line.translation)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Sections (for grammar/culture) */}
                                {data.content?.sections?.map((section, idx) => (
                                    <div key={idx} className="relative p-8 md:p-10 bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden group hover:bg-white/[0.03] transition-colors duration-500 space-y-6">
                                        {/* Accent side bar */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${themeColors.split(' ')[0]} ${themeColors.split(' ')[1]}`}></div>

                                        <h2 className={`text-2xl font-bold ${themeColors.split(' ')[2]}`}>{getText(section.title)}</h2>

                                        {section.explanation && (
                                            <p className="text-slate-300 text-lg leading-relaxed">{getText(section.explanation)}</p>
                                        )}

                                        {section.content && (
                                            <p className="text-slate-300 text-lg leading-relaxed">{getText(section.content)}</p>
                                        )}

                                        {/* Examples with subtle highlight */}
                                        {section.examples && (
                                            <div className="grid gap-3 mt-6">
                                                {section.examples.map((ex, i) => (
                                                    <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-black/20 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                                                        <span className={`font-bold text-lg mb-1 sm:mb-0 ${themeColors.split(' ')[2]}`}>{ex.spanish}</span>
                                                        <span className="text-slate-400 italic">{getText(ex.translation)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Beautiful Table */}
                                        {section.table && (
                                            <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="bg-white/5">
                                                                {section.table.headers.map((h, i) => (
                                                                    <th key={i} className={`py-4 px-6 font-bold text-sm uppercase tracking-widest ${themeColors.split(' ')[2]}`}>{h}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/5">
                                                            {section.table.rows.map((row, i) => (
                                                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                                                    {row.map((cell, j) => (
                                                                        <td key={j} className={`py-4 px-6 text-slate-300 ${j === 0 ? 'font-bold' : ''}`}>{cell}</td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Mnemonic/Tip with glow */}
                                        {section.mnemonic && (
                                            <div className="mt-8 relative p-6 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl flex items-start gap-4">
                                                <span className="text-2xl">💡</span>
                                                <div>
                                                    <h4 className="text-emerald-400 font-bold mb-1 text-sm uppercase tracking-wider">Memory Tip</h4>
                                                    <p className="text-emerald-100/80 leading-relaxed">{getText(section.mnemonic)}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Facts (for culture) */}
                                        {section.facts && (
                                            <div className="mt-6 grid gap-4">
                                                {section.facts.map((fact, i) => (
                                                    <div key={i} className="flex items-start gap-4 bg-black/20 p-5 rounded-xl border border-white/5">
                                                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold shrink-0">{i + 1}</div>
                                                        <p className="text-slate-300 pt-1 leading-relaxed">{getText(fact)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Dishes (for food culture) */}
                                        {section.dishes && (
                                            <div className="mt-8 grid sm:grid-cols-2 gap-4">
                                                {section.dishes.map((dish, i) => (
                                                    <div key={i} className="p-6 bg-gradient-to-br from-black/40 to-black/10 rounded-2xl border border-orange-500/20 hover:border-orange-500/40 transition-colors">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <h3 className="font-bold text-xl text-orange-400">{dish.name}</h3>
                                                            <span className="text-xs px-2 py-1 rounded bg-orange-500/10 text-orange-300 font-medium">📍 {dish.region}</span>
                                                        </div>
                                                        <p className="text-slate-400 text-sm leading-relaxed">{getText(dish.description)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Traditions */}
                                        {section.traditions && (
                                            <div className="mt-6 space-y-4">
                                                {section.traditions.map((t, i) => (
                                                    <div key={i} className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-xl border border-white/5">
                                                        <span className="text-xl">✨</span>
                                                        <p className="text-slate-300 leading-relaxed">{getText(t)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Key Phrases Container */}
                                {data.keyPhrases && (
                                    <div className="p-8 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-xl">🔑</div>
                                            <h2 className="text-2xl font-bold text-white mb-0">{language === 'fr' ? 'Phrases clés' : 'Key Phrases'}</h2>
                                        </div>
                                        <div className="grid gap-3">
                                            {data.keyPhrases.map((phrase, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-black/40 rounded-xl border border-white/5 hover:border-emerald-500/20 transition-colors">
                                                    <span className="font-bold text-lg text-emerald-400 mb-1 sm:mb-0">{phrase.phrase}</span>
                                                    <span className="text-slate-400">{getText(phrase.meaning)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Focus Vocabulary */}
                                {data.focusVocab && (
                                    <div className="p-8 bg-black/20 rounded-3xl border border-white/5">
                                        <h2 className="text-lg font-bold text-slate-300 mb-4 uppercase tracking-widest flex items-center gap-2">
                                            <span className="text-purple-400">📝</span> {language === 'fr' ? 'Vocabulaire à retenir' : 'Focus Vocabulary'}
                                        </h2>
                                        <div className="flex flex-wrap gap-3">
                                            {data.focusVocab.map((word, idx) => (
                                                <span key={idx} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors shadow-sm">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Transition to Practice Button */}
                                <div className="mt-12 text-center pt-8 border-t border-white/5 relative">
                                    <button
                                        onClick={() => setActiveTab('practice')}
                                        className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-4 px-8 font-bold text-white bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg hover:shadow-purple-500/30 active:scale-95 transition-all w-full md:w-auto"
                                    >
                                        <span className="relative z-10 flex items-center gap-2 text-lg">
                                            {language === 'fr' ? 'S\'entraîner maintenant' : 'Start Practice'}
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Practice Tab Content */}
                        {activeTab === 'practice' && (
                            <div className="animate-fade-in py-4">
                                {currentExercise ? (
                                    <ExerciseEngine
                                        exercise={currentExercise}
                                        onComplete={handleExerciseComplete}
                                    />
                                ) : (
                                    <div className="text-center py-20 bg-gradient-to-b from-green-500/5 to-transparent rounded-3xl border border-green-500/20">
                                        <div className="inline-flex w-24 h-24 bg-green-500/20 text-green-400 rounded-full items-center justify-center text-5xl mb-8 shadow-[0_0_30px_rgba(34,197,94,0.3)]">🎉</div>
                                        <h2 className="text-4xl font-black mb-4 text-white tracking-tight">
                                            {isComplete(id)
                                                ? (language === 'fr' ? 'Déjà Maîtrisé !' : 'Lesson Mastered!')
                                                : (language === 'fr' ? 'Bien joué !' : 'Incredible Work!')}
                                        </h2>
                                        <p className="text-slate-400 mb-10 text-lg max-w-md mx-auto">
                                            {language === 'fr'
                                                ? 'Vous avez complété cette leçon bonus avec succès.'
                                                : 'You\'ve successfully completed all exercises for this bonus lesson.'}
                                        </p>
                                        <Link to="/learn" className="inline-flex items-center justify-center px-8 py-4 bg-green-500 text-slate-900 font-bold rounded-full text-lg hover:bg-green-400 shadow-lg hover:shadow-green-500/30 active:scale-95 transition-all">
                                            {language === 'fr' ? 'Retour au parcours' : 'Back to Course'}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
