import { useAudio } from '../contexts/AudioContext';
import { useLanguage } from '../i18n';
import { Link, useLocation } from 'react-router-dom';

export default function MiniPlayer() {
    const { currentTrack, isPlaying, progress, duration, togglePlayPause, seek } = useAudio();
    const { language } = useLanguage();
    const location = useLocation();

    // Don't render if no track is selected
    if (!currentTrack) return null;

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSeek = (e) => {
        if (!duration) return;
        const time = Number(e.target.value);
        seek(time);
    };

    const progressPercent = duration ? (progress / duration) * 100 : 0;

    // Check if we are currently on the full player page for this track
    const isFullPlayer = location.pathname === `/lesson/${currentTrack.id}` || location.pathname === `/play/${currentTrack.id}`;

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 animate-fade-in-up">
            <div className="bg-[#0A0F1C]/90 backdrop-blur-xl border-t border-white/10 p-2 md:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative">

                {/* Progress Bar Header (Top Edge) - Only show if we have a valid duration */}
                {duration > 0 && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5 cursor-pointer group" onClick={handleSeek}>
                        <input
                            type="range"
                            min="0"
                            max={duration}
                            value={progress}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 group-hover:h-1.5 transition-all shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                )}

                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mt-1">

                    {/* Track Info */}
                    <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0 shadow-lg border border-white/10 overflow-hidden relative group">
                            {currentTrack.coverUrl ? (
                                <img src={currentTrack.coverUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Cover" />
                            ) : (
                                <span className="text-2xl filter drop-shadow-md">🎧</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold truncate text-sm md:text-base">{currentTrack.title}</h4>
                            <p className="text-slate-400 text-xs md:text-sm truncate">
                                {language === 'fr' ? 'Leçon par la Musique' : 'Lesson via Music'}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-center justify-center flex-1 w-full md:w-auto max-w-md">
                        <div className="flex items-center justify-center gap-6">
                            {/* Skip Back (Placeholder) */}
                            <button className="text-slate-400 hover:text-white transition-colors p-2 disabled:opacity-50" disabled aria-label="Previous Track">
                                <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                            </button>

                            {/* Play/Pause */}
                            <button
                                onClick={togglePlayPause}
                                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                aria-label={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? (
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                ) : (
                                    <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                )}
                            </button>

                            {/* Skip Forward (Placeholder) */}
                            <button className="text-slate-400 hover:text-white transition-colors p-2 disabled:opacity-50" disabled aria-label="Next Track">
                                <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Right Side Actions & Time */}
                    <div className="hidden md:flex items-center justify-end gap-6 flex-1 text-slate-400 text-sm font-medium">
                        {duration > 0 && (
                            <div className="flex items-center gap-1 font-mono tracking-tighter">
                                <span>{formatTime(progress)}</span>
                                <span className="opacity-50">/</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        )}

                        {!isFullPlayer && (
                            <Link
                                to={`/play/${currentTrack.id}`}
                                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all text-xs uppercase tracking-wider font-bold"
                            >
                                Expand
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
