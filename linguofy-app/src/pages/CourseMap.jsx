import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';
import { modules } from '../data/courseData';
import LanguageToggle from '../components/LanguageToggle';

export default function CourseMap() {
    const { isComplete, completedLessons } = useProgress();
    const { t } = useLanguage();

    // A module is unlocked if:
    // 1. It's the first module (always unlocked)
    // 2. All lessons from the previous module are complete
    const isModuleUnlocked = (moduleIndex) => {
        if (moduleIndex === 0) return true;
        const prevModule = modules[moduleIndex - 1];
        return prevModule.songs.every(song => completedLessons.includes(song.id));
    };

    return (
        <div className="min-h-screen p-8 text-white">
            <header className="flex justify-between items-center mb-12">
                <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
                    Linguofy
                </Link>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-medium text-slate-400">
                        {completedLessons.length} / {modules.flatMap(m => m.songs).length} {t('courseMap.lessonsComplete')}
                    </div>
                    <LanguageToggle />
                </div>
            </header>

            <div className="max-w-2xl mx-auto space-y-12">
                {modules.map((mod, modIndex) => {
                    const unlocked = isModuleUnlocked(modIndex);
                    return (
                        <div key={mod.id} className={`relative pl-8 border-l-2 ${unlocked ? 'border-slate-700' : 'border-slate-800 opacity-60'}`}>
                            <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full border-4 border-slate-900 ${unlocked ? 'bg-slate-700' : 'bg-slate-800'}`}>
                                {!unlocked && <span className="absolute inset-0 flex items-center justify-center text-xs">🔒</span>}
                            </div>

                            <div className="mb-6">
                                <h2 className="text-3xl font-bold mb-2">{mod.title}</h2>
                                <p className="text-slate-400">{mod.desc}</p>
                                {!unlocked && (
                                    <p className="text-yellow-500/80 text-sm mt-2">
                                        {t('courseMap.unlockMessage')}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-4">
                                {mod.songs.map((song) => (
                                    <div
                                        key={song.id}
                                        className={`block p-4 rounded-xl border transition-all backdrop-blur-sm group ${!unlocked
                                            ? 'border-slate-800/50 bg-slate-800/30 cursor-not-allowed'
                                            : isComplete(song.id)
                                                ? 'border-green-500/50 bg-green-900/20'
                                                : 'border-slate-800 hover:border-purple-500 bg-slate-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className={`font-semibold text-lg transition-colors ${!unlocked ? 'text-slate-500' : 'group-hover:text-purple-400'}`}>
                                                        {song.title}
                                                    </h3>
                                                    {isComplete(song.id) && (
                                                        <span className="text-green-400 text-lg">✓</span>
                                                    )}
                                                    {!unlocked && (
                                                        <span className="text-slate-500 text-sm">🔒</span>
                                                    )}
                                                </div>
                                                <span className="text-xs uppercase tracking-wider text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
                                                    {song.type}
                                                </span>
                                            </div>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform ${!unlocked
                                                ? 'bg-slate-700 shadow-slate-700/20'
                                                : isComplete(song.id)
                                                    ? 'bg-green-600 shadow-green-600/20 group-hover:scale-110'
                                                    : 'bg-purple-600 shadow-purple-600/20 group-hover:scale-110'
                                                }`}>
                                                {!unlocked ? (
                                                    <span className="text-slate-400 text-lg">🔒</span>
                                                ) : isComplete(song.id) ? (
                                                    <span className="text-white text-lg">✓</span>
                                                ) : (
                                                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {unlocked ? (
                                                <>
                                                    <Link
                                                        to={`/lesson/${song.id}`}
                                                        className="flex-1 py-2 bg-green-500 hover:bg-green-400 text-slate-900 font-bold rounded-lg text-center transition shadow-lg shadow-green-500/10"
                                                    >
                                                        {isComplete(song.id) ? t('courseMap.review') : t('courseMap.start')}
                                                    </Link>
                                                    <Link
                                                        to={`/play/${song.id}`}
                                                        className="w-12 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                                        title="Listen Only"
                                                    >
                                                        🎵
                                                    </Link>
                                                </>
                                            ) : (
                                                <div className="flex-1 py-2 bg-slate-700/50 text-slate-500 font-bold rounded-lg text-center cursor-not-allowed">
                                                    {t('courseMap.locked')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
