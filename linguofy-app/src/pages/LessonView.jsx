import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import ExerciseEngine from '../components/ExerciseEngine';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';
import LanguageToggle from '../components/LanguageToggle';

export default function LessonView() {
    const { id } = useParams();
    const { markComplete, isComplete } = useProgress();
    const { language, t } = useLanguage();
    const [songData, setSongData] = useState(null);
    const [activeTab, setActiveTab] = useState('listen'); // listen, practice
    const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
    const [lessonFinished, setLessonFinished] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/data/songs/${id}.json`)
            .then(res => res.json())
            .then(data => {
                setSongData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center text-slate-200">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!songData) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center text-slate-200">
                <div className="text-center p-8 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-xl">
                    <div className="text-6xl mb-6">😢</div>
                    <p className="text-xl font-bold mb-4">Content not found</p>
                    <Link to="/learn" className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors">
                        {t('lesson.backToMap')}
                    </Link>
                </div>
            </div>
        );
    }

    const exercises = songData.exercises || [];
    const currentExercise = exercises[currentExerciseIdx];
    const progress = exercises.length > 0 ? ((currentExerciseIdx) / exercises.length) * 100 : 0;

    // Choose lyrics based on selected language
    const lyricsKey = language === 'fr' ? 'mixed_fr' : 'mixed_en';
    const audioKey = language === 'fr' ? 'mixed_fr' : 'mixed_en';

    return (
        <div className="flex flex-col min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-purple-500/30 overflow-x-hidden relative">

            {/* Animated Background Orbs */}
            <div className="fixed inset-0 pointer-events-none block z-0">
                <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen animate-blob"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] rounded-full bg-pink-600/10 blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
                <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-blue-600/10 blur-[100px] mix-blend-screen animate-blob animation-delay-4000"></div>
            </div>

            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0A0F1C]/80 backdrop-blur-md z-40">
                <Link to="/learn" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group shrink-0">
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </Link>

                <div className="flex-1 mx-6 lg:mx-12 max-w-3xl">
                    <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-widest mb-2 px-1">
                        <span>{t('lesson.exercises')}</span>
                        <span>{currentExerciseIdx} / {exercises.length}</span>
                    </div>
                    <div className="bg-slate-800/50 h-2.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                            style={{ width: `${activeTab === 'practice' ? progress : 0}%` }}
                        />
                    </div>
                </div>

                <div className="shrink-0 hidden sm:block">
                    <LanguageToggle />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col items-center p-6 w-full max-w-5xl mx-auto relative z-10 animate-fade-in-up pb-20">

                {/* Mobile Language Toggle */}
                <div className="w-full flex justify-end mb-4 sm:hidden">
                    <LanguageToggle />
                </div>

                {/* Tabs */}
                <div className="flex w-full max-w-2xl bg-black/20 p-2 rounded-2xl mb-10 border border-white/5 shadow-lg">
                    <button
                        onClick={() => setActiveTab('listen')}
                        className={`flex flex-1 items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'listen' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <span className="text-xl">♫</span> {t('lesson.listenAndLearn')}
                    </button>
                    <button
                        onClick={() => setActiveTab('practice')}
                        className={`flex flex-1 items-center justify-center gap-2 py-3.5 rounded-xl font-bold transition-all duration-300 ${activeTab === 'practice' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <span className="text-xl">✎</span> {t('lesson.exercises')}
                        {isComplete(id) && activeTab !== 'practice' && (
                            <span className="flex w-5 h-5 bg-green-500 rounded-full items-center justify-center text-xs text-black ml-2 shadow-[0_0_10px_rgba(34,197,94,0.4)]">✓</span>
                        )}
                    </button>
                </div>

                {/* Listen Tab */}
                {activeTab === 'listen' && (
                    <div className="w-full max-w-3xl text-center animate-fade-in">

                        <div className="mb-10">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 mb-6 shadow-lg shadow-purple-500/20 transform -rotate-3 border border-purple-500/30">
                                <span className="text-4xl filter drop-shadow-md">🎧</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4 text-white tracking-tight">{songData.title}</h1>
                            <p className="text-slate-400 text-lg">{t('lesson.mixedLyrics')}</p>
                        </div>

                        <div className="bg-white/[0.02] rounded-[2.5rem] p-6 md:p-10 border border-white/10 backdrop-blur-xl shadow-2xl">

                            {/* Custom Styling for the native audio player to make it look a bit better, though tricky to fully style across browsers */}
                            <div className="mb-8 p-4 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                                <audio
                                    controls
                                    className="w-full rounded-lg"
                                    src={songData.audio?.[audioKey]}
                                    style={{ colorScheme: 'dark' }} // Attempt to force dark mode controls on some browsers
                                />
                            </div>

                            <div className="relative">
                                {/* Decorator quotes */}
                                <span className="absolute -top-6 -left-4 text-6xl text-purple-500/20 font-serif rotate-180 select-none">"</span>
                                <span className="absolute -bottom-10 -right-4 text-6xl text-pink-500/20 font-serif select-none">"</span>

                                <div className="text-left text-lg md:text-xl max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-slate-300 font-medium leading-[1.8] md:leading-[2] p-6 bg-black/20 rounded-2xl border border-white/5 relative z-10 custom-scrollbar">
                                    {songData.lyrics?.[lyricsKey] || "Lyrics not available for this language."}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <button
                                onClick={() => setActiveTab('practice')}
                                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-4 px-10 font-bold text-white bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] active:scale-95 transition-all text-lg"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {t('lesson.exercises')}
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Practice Tab */}
                {activeTab === 'practice' && (
                    <div className="w-full max-w-4xl animate-fade-in bg-white/[0.02] rounded-[2.5rem] p-6 md:p-10 border border-white/10 backdrop-blur-xl shadow-2xl min-h-[500px]">
                        {currentExercise ? (
                            <ExerciseEngine
                                exercise={currentExercise}
                                onComplete={() => {
                                    const nextIdx = currentExerciseIdx + 1;
                                    setCurrentExerciseIdx(nextIdx);
                                    // Check if this was the last exercise
                                    if (nextIdx >= exercises.length) {
                                        markComplete(id);
                                        setLessonFinished(true);
                                        // 🎉 Fire confetti!
                                        confetti({
                                            particleCount: 200,
                                            spread: 90,
                                            origin: { y: 0.6 },
                                            colors: ['#A855F7', '#EC4899', '#3B82F6', '#10B981']
                                        });
                                    }
                                }}
                            />
                        ) : (
                            <div className="text-center py-20 flex flex-col items-center justify-center h-full">
                                <div className="inline-flex w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full items-center justify-center text-5xl mb-8 shadow-[0_0_40px_rgba(34,197,94,0.4)] border-4 border-green-400/30">
                                    <span className="filter drop-shadow-md">🏆</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black mb-6 text-white tracking-tight">
                                    {t('lesson.lessonComplete')}
                                </h2>
                                <p className="text-slate-400 mb-12 text-lg md:text-xl max-w-md mx-auto leading-relaxed">
                                    {lessonFinished
                                        ? t('lesson.progressSaved')
                                        : t('lesson.lessonComplete')}
                                </p>
                                <Link to="/learn" className="group flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-full text-lg transition-all active:scale-95 shadow-lg">
                                    <span>←</span>
                                    {t('lesson.backToMap')}
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Custom Scrollbar for lyrics area */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 8px;}
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.3); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.5); }
            `}} />
        </div>
    );
}
