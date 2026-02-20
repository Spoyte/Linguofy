import { Link, useNavigate } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';
import { useAudio } from '../contexts/AudioContext';
import { modules, bonusModules } from '../data/courseData';
import LanguageToggle from '../components/LanguageToggle';
import { useAuth } from '../contexts/AuthContext';

export default function CourseMap() {
    const { isComplete, completedLessons } = useProgress();
    const { t, language } = useLanguage();
    const { user, signOut } = useAuth();
    const { playTrack, currentTrack, isPlaying, togglePlayPause, setQueue } = useAudio();
    const navigate = useNavigate();

    // A module is unlocked if:
    // 1. It's the first module (always unlocked)
    // 2. All lessons from the previous module are complete
    const isModuleUnlocked = (moduleIndex) => {
        if (moduleIndex === 0) return true;
        const prevModule = modules[moduleIndex - 1];
        return prevModule.songs.every(song => completedLessons.includes(song.id));
    };

    const totalLessons = modules.flatMap(m => m.songs).length;
    const progressPercentage = Math.round((completedLessons.length / totalLessons) * 100) || 0;

    const handlePlayAll = async () => {
        // Collect all unlocked songs
        const unlockedSongs = [];
        modules.forEach((mod, idx) => {
            if (isModuleUnlocked(idx)) {
                unlockedSongs.push(...mod.songs);
            }
        });

        if (unlockedSongs.length === 0) return;

        try {
            // Load audio data for all unlocked songs
            const queueData = await Promise.all(
                unlockedSongs.map(async (song) => {
                    const res = await fetch(`/data/songs/${song.id}.json`);
                    if (!res.ok) return null;
                    const data = await res.json();
                    const audioKey = language === 'fr' ? 'mixed_fr' : 'mixed_en';
                    return {
                        id: song.id,
                        title: data.title,
                        audioUrl: data.audio?.[audioKey],
                        coverUrl: data.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop'
                    };
                })
            );

            const validQueue = queueData.filter(t => t && t.audioUrl);
            if (validQueue.length > 0) {
                setQueue(validQueue);
                playTrack(validQueue[0]); // Start playing the first one
            } else {
                alert("No audio tracks available to play.");
            }
        } catch (e) {
            console.error("Failed to load radio queue", e);
        }
    };

    const handleQuickStart = () => {
        // Collect all unlocked songs
        const unlockedSongs = [];
        modules.forEach((mod, idx) => {
            if (isModuleUnlocked(idx)) {
                unlockedSongs.push(...mod.songs);
            }
        });

        // Find first incomplete song 
        const nextSong = unlockedSongs.find(song => !isComplete(song.id));

        if (nextSong) {
            navigate(`/lesson/${nextSong.id}`);
        } else if (unlockedSongs.length > 0) {
            // All unlocked songs completed, pick a random one to review
            const randomSong = unlockedSongs[Math.floor(Math.random() * unlockedSongs.length)];
            navigate(`/lesson/${randomSong.id}`);
        }
    };

    const handlePlayClick = async (e, song) => {
        e.preventDefault();
        if (currentTrack?.id === song.id) {
            togglePlayPause();
            return;
        }

        try {
            const res = await fetch(`/data/songs/${song.id}.json`);
            if (!res.ok) throw new Error("Song not found");
            const songData = await res.json();

            const audioKey = language === 'fr' ? 'mixed_fr' : 'mixed_en';
            playTrack({
                id: song.id,
                title: songData.title,
                audioUrl: songData.audio?.[audioKey],
                coverUrl: songData.coverUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop'
            });
        } catch (error) {
            console.error("Could not load song", error);
            alert("Audio track not found.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-purple-500/30 overflow-x-hidden pb-20">
            {/* Animated Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden block z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen"></div>
            </div>

            {/* Header / Navbar */}
            <header className="sticky top-0 z-40 bg-[#0A0F1C]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 mb-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <Link to="/" className="flex items-center gap-2 group">
                        <span className="text-2xl group-hover:scale-110 transition-transform origin-center">🎸</span>
                        <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            Linguofy
                        </span>
                    </Link>

                    <div className="flex flex-wrap items-center justify-center gap-4 w-full md:w-auto">
                        <div className="flex bg-white/5 border border-white/10 rounded-full px-4 py-1.5 items-center gap-3 backdrop-blur-sm shrink-0">
                            <div className="w-24 md:w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-slate-300">
                                {completedLessons.length} / {totalLessons}
                            </span>
                        </div>

                        {completedLessons.length > 0 && (
                            <Link
                                to="/vocabulary"
                                className="px-4 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-full text-sm font-medium text-purple-300 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-2"
                            >
                                <span>📚</span>
                                <span className="hidden sm:inline">{t('courseMap.vocabulary') || 'Vocabulary'}</span>
                            </Link>
                        )}

                        <div className="flex items-center gap-3 ml-auto md:ml-4 border-l border-white/10 pl-4">
                            <LanguageToggle />
                            {user && (
                                <button
                                    onClick={() => signOut()}
                                    className="text-sm font-bold text-slate-400 hover:text-pink-400 transition-colors hidden sm:block"
                                >
                                    Log Out
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">

                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                        Your Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Journey</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">Master Spanish step-by-step through our curated musical curriculum.</p>

                    {/* Global Actions */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm max-w-xl mx-auto mb-16 shadow-xl">
                        <button
                            onClick={handleQuickStart}
                            className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-black font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            <span className="text-xl">🚀</span>
                            {completedLessons.length === 0 ? 'Start First Lesson' : 'Quick Start'}
                        </button>
                        <button
                            onClick={handlePlayAll}
                            className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 font-bold text-white hover:bg-white/20 active:scale-[0.98] transition-all"
                        >
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            Radio Mode
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Course Modules (Left Column on Desktop) */}
                    <div className="lg:col-span-8 space-y-16">
                        {modules.map((mod, modIndex) => {
                            const unlocked = isModuleUnlocked(modIndex);
                            return (
                                <div key={mod.id} className={`relative pl-8 md:pl-12 border-l-2 ${unlocked ? 'border-purple-500/30' : 'border-slate-800'} animate-fade-in-up`} style={{ animationDelay: `${modIndex * 150}ms` }}>

                                    {/* Timeline Node */}
                                    <div className={`absolute -left-[17px] top-2 w-8 h-8 rounded-full border-4 border-[#0A0F1C] flex items-center justify-center shadow-lg ${unlocked ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-slate-800'}`}>
                                        {!unlocked ? (
                                            <span className="text-[10px]">🔒</span>
                                        ) : (
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </div>

                                    <div className="mb-8">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wider uppercase text-slate-400 mb-3">
                                            Module {modIndex + 1}
                                        </div>
                                        <h2 className="text-3xl font-bold mb-3 text-white">{mod.title}</h2>
                                        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">{mod.desc}</p>
                                        {!unlocked && (
                                            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                {t('courseMap.unlockMessage')}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {mod.songs.map((song) => {
                                            const completed = isComplete(song.id);
                                            return (
                                                <div
                                                    key={song.id}
                                                    className={`group relative overflow-hidden p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${!unlocked
                                                        ? 'border-white/5 bg-white/[0.02] cursor-not-allowed opacity-60'
                                                        : completed
                                                            ? 'border-green-500/30 bg-green-500/5 hover:border-green-500/50'
                                                            : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-purple-500/50'
                                                        }`}
                                                >
                                                    {/* Hover Gradient Overlay */}
                                                    {unlocked && !completed && (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                    )}

                                                    <div className="relative z-10">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div>
                                                                <span className="inline-block px-2.5 py-1 rounded bg-black/40 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 border border-white/5">
                                                                    🎵 {song.type}
                                                                </span>
                                                                <h3 className={`font-bold text-xl leading-tight mb-2 transition-colors ${!unlocked ? 'text-slate-500' : 'text-slate-200 group-hover:text-white'}`}>
                                                                    {song.title}
                                                                </h3>
                                                            </div>
                                                            <button
                                                                onClick={(e) => unlocked && handlePlayClick(e, song)}
                                                                disabled={!unlocked}
                                                                className={`w-12 h-12 rounded-full flex shrink-0 items-center justify-center shadow-lg transition-transform duration-300 ${!unlocked
                                                                    ? 'bg-slate-800 shadow-none cursor-not-allowed'
                                                                    : currentTrack?.id === song.id && isPlaying
                                                                        ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-pink-500/20 group-hover:scale-110 animate-pulse'
                                                                        : completed
                                                                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/20 group-hover:scale-110'
                                                                            : 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-purple-500/20 group-hover:scale-110'
                                                                    }`}>
                                                                {!unlocked ? (
                                                                    <span className="text-slate-500 font-bold">🔒</span>
                                                                ) : currentTrack?.id === song.id && isPlaying ? (
                                                                    <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                                                ) : completed ? (
                                                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                                ) : (
                                                                    <svg className="w-5 h-5 text-white fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                                )}
                                                            </button>
                                                        </div>

                                                        <div className="flex gap-3 mt-6">
                                                            {unlocked ? (
                                                                <>
                                                                    <Link
                                                                        to={`/lesson/${song.id}`}
                                                                        className={`flex-1 py-2.5 px-4 font-bold rounded-xl text-center transition-all bg-white/10 hover:bg-white/20 text-white border border-white/10`}
                                                                    >
                                                                        {completed ? t('courseMap.review') || 'Review' : t('courseMap.start') || 'Start Lesson'}
                                                                    </Link>
                                                                    <Link
                                                                        to={`/play/${song.id}`}
                                                                        className="w-12 flex shrink-0 items-center justify-center bg-black/40 hover:bg-black/60 border border-white/10 rounded-xl transition-colors"
                                                                        title="Listen Only"
                                                                    >
                                                                        🎧
                                                                    </Link>
                                                                </>
                                                            ) : (
                                                                <div className="flex-1 py-2.5 bg-black/30 text-slate-600 font-bold rounded-xl text-center cursor-not-allowed border border-white/5">
                                                                    {t('courseMap.locked') || 'Locked'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bonus Content Section (Right Column on Desktop) */}
                    <div className="lg:col-span-4 mt-16 lg:mt-0">
                        <div className="sticky top-28 bg-white/[0.02] border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl animate-fade-in-up animation-delay-500">
                            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500">
                                    ✨ Bonus Features
                                </span>
                            </h2>
                            <div className="grid gap-6">
                                {bonusModules.map((bonus) => (
                                    <div key={bonus.id} className="group cursor-default">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10 group-hover:bg-white/10 transition-colors">
                                                {bonus.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{bonus.title}</h3>
                                                <p className="text-slate-400 text-sm leading-relaxed">{bonus.desc}</p>
                                            </div>
                                        </div>
                                        <div className="grid gap-2 pl-16">
                                            {bonus.lessons.map((lesson) => {
                                                const completed = isComplete(lesson.id);
                                                return (
                                                    <Link
                                                        key={lesson.id}
                                                        to={`/bonus/${bonus.id === 'grammar' ? 'grammar' : bonus.id === 'dialogues' ? 'dialogues' : 'culture'}/${lesson.id}`}
                                                        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${completed
                                                            ? 'border-green-500/30 bg-green-500/5'
                                                            : 'border-white/5 bg-black/20 hover:bg-white/5 hover:border-purple-500/30'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg opacity-80">
                                                                {lesson.type === 'grammar' ? '📖' : lesson.type === 'dialogue' ? '🗣️' : '🌍'}
                                                            </span>
                                                            <span className={`text-sm font-medium ${completed ? 'text-slate-200' : 'text-slate-300'}`}>
                                                                {lesson.title}
                                                            </span>
                                                        </div>
                                                        {completed ? (
                                                            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                        ) : (
                                                            <span className="text-slate-600 transition-transform group-hover:translate-x-1">→</span>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
