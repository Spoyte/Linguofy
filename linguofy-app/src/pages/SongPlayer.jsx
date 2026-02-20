import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n';

export default function SongPlayer() {
    const { id } = useParams();
    const { t, language } = useLanguage();

    const [songData, setSongData] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    // Auto-select initial version based on app language
    const [version, setVersion] = useState(language === 'fr' ? 'mixed_fr' : 'mixed_en');

    const audioRef = useRef(null);
    const lyricsContainerRef = useRef(null);

    useEffect(() => {
        fetch(`/data/songs/${id}.json`)
            .then(res => res.json())
            .then(data => {
                setSongData(data);
                // Fallback to mixed_en if user language version doesn't exist
                if (!data.audio[version]) {
                    setVersion('mixed_en');
                }
            })
            .catch(err => console.error("Failed to load song", err));
    }, [id, language, version]);

    useEffect(() => {
        if (audioRef.current) {
            const wasPlaying = !audioRef.current.paused;
            audioRef.current.load();
            if (wasPlaying) {
                audioRef.current.play().catch(e => console.error("Playback failed", e));
            }
        }
    }, [version]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Playback failed", e));
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e) => {
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!songData) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-medium">Loading Track...</p>
                </div>
            </div>
        );
    }

    // Advanced lyric parser for highlighting
    const lyricsText = songData.lyrics[version] || songData.lyrics['mixed_en'] || "";
    const lyricsLines = lyricsText.split('\n').filter(l => l.trim() !== '').map((line, i) => {
        const isHeader = line.startsWith('[');
        return { id: i, text: line, isHeader };
    });

    return (
        <div className="min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-purple-500/30 overflow-hidden flex flex-col items-center justify-center p-4 relative">

            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden block z-0">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
            </div>

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 animate-fade-in-up">

                {/* Left Panel: Player Controls */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-between">
                    <div className="w-full flex justify-between items-center mb-8">
                        <Link to="/learn" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors group">
                            <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </Link>
                        <div className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold tracking-wider uppercase">
                            LESSON {id}
                        </div>
                    </div>

                    {/* Vinyl Record Animation */}
                    <div className="relative mb-8 group">
                        <div className={`w-64 h-64 rounded-full border-8 border-black/40 shadow-2xl overflow-hidden relative flex items-center justify-center ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}>
                            {/* Vinyl Grooves */}
                            <div className="absolute inset-0 rounded-full border border-white/5 m-2 ring-1 ring-white/5 opacity-50"></div>
                            <div className="absolute inset-0 rounded-full border border-white/5 m-4 ring-1 ring-white/5 opacity-50"></div>
                            <div className="absolute inset-0 rounded-full border border-white/5 m-8 ring-1 ring-white/5 opacity-50"></div>
                            <div className="absolute inset-0 rounded-full border border-white/5 m-12 ring-1 ring-white/5 opacity-50"></div>

                            {/* Center Label */}
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full z-10 flex items-center justify-center shadow-inner pt-1">
                                <span className="text-4xl filter drop-shadow-md">🎵</span>
                                {/* Spindle hole */}
                                <div className="absolute w-3 h-3 bg-[#0A0F1C] rounded-full shadow-inner"></div>
                            </div>

                            {/* Highlight reflection */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent w-full h-full rounded-full mix-blend-overlay"></div>
                        </div>

                        {/* Record Player Arm (Decorative) */}
                        <div className={`absolute -right-4 top-4 w-4 h-32 bg-slate-300 rounded-full origin-top transition-transform duration-700 ease-in-out shadow-xl z-20 ${isPlaying ? 'rotate-[25deg]' : 'rotate-0'}`}>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-12 bg-slate-400 rounded-sm shadow-md"></div>
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 shadow-lg"></div>
                        </div>
                    </div>

                    <div className="text-center mb-8 w-full">
                        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{songData.title}</h2>
                        <p className="text-purple-400 font-medium tracking-wide uppercase text-sm">{songData.style}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full mb-8">
                        <input
                            type="range"
                            min="0"
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 accent-purple-500"
                        />
                        <div className="flex justify-between mt-2 text-xs font-medium text-slate-500">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-8 w-full">
                        <button className="text-slate-500 hover:text-white transition-colors" aria-label="Previous Track">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                        </button>

                        <button
                            onClick={togglePlay}
                            className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full flex items-center justify-center text-white transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] active:scale-95 group"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                            ) : (
                                <svg className="w-10 h-10 fill-current ml-2" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>

                        <button className="text-slate-500 hover:text-white transition-colors" aria-label="Next Track">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                        </button>
                    </div>

                    <audio
                        ref={audioRef}
                        src={songData.audio && songData.audio[version]}
                        onEnded={() => setIsPlaying(false)}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                    />
                </div>

                {/* Right Panel: Lyrics */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] flex flex-col backdrop-blur-xl h-[600px] md:h-auto overflow-hidden">

                    {/* Version Selector Header */}
                    <div className="p-6 border-b border-white/5 bg-black/20 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>
                            Lyrics
                        </h3>
                        <div className="flex bg-black/40 rounded-full p-1 border border-white/5">
                            {['mixed_fr', 'mixed_en', 'pure_es'].map(v => {
                                // Only show versions that exist for this song
                                if (!songData.audio[v] && !songData.lyrics[v]) return null;

                                const labelMap = {
                                    'mixed_fr': 'FR Mix',
                                    'mixed_en': 'EN Mix',
                                    'pure_es': 'Pure ES'
                                };

                                return (
                                    <button
                                        key={v}
                                        onClick={() => setVersion(v)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${version === v ? 'bg-white/10 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                                    >
                                        {labelMap[v]}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Scrolling Lyrics Area */}
                    <div
                        ref={lyricsContainerRef}
                        className="flex-1 overflow-y-auto p-8 space-y-4 scroll-smooth scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                    >
                        {lyricsLines.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-500 italic">
                                Lyrics not available for this version.
                            </div>
                        ) : (
                            lyricsLines.map((line) => (
                                <div
                                    key={line.id}
                                    className={`transition-all duration-300 ${line.isHeader
                                            ? 'text-purple-400 font-bold text-xs tracking-widest uppercase mt-8 mb-2'
                                            : 'text-lg md:text-xl text-slate-300 hover:text-white leading-relaxed'
                                        }`}
                                >
                                    {line.text}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Bottom fade for lyrics */}
                    <div className="h-16 bg-gradient-to-t from-[#111827] to-transparent shrink-0 pointer-events-none -mt-16 relative z-10 border-b-2 border-transparent rounded-b-[2rem]"></div>
                </div>

            </div>
        </div>
    );
}
