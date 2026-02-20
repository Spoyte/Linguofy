import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';

// Fallback audio/lessons if the user hasn't completed any songs yet
const FALLBACK_TRACKS = [
    { id: '1-2', title: '¿Quién Soy Yo? (Who Am I?)', audioUrl: '/data/audio/mock-bgm.mp3', lyric: 'Me llamo Marco' },
    { id: '1-3', title: 'Somos Familia', audioUrl: '/data/audio/mock-bgm.mp3', lyric: 'Hola mamá' },
];

export default function AudioExplorer() {
    const { completedLessons } = useProgress();
    const { language } = useLanguage();

    const [tracks, setTracks] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [loading, setLoading] = useState(true);

    const audioRef = useRef(null);

    // Initialize Tracks & Lyrics
    useEffect(() => {
        async function loadTracks() {
            setLoading(true);
            let userTracks = [];

            for (const lessonId of completedLessons) {
                try {
                    const res = await fetch(`/data/songs/${lessonId}.json`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.audio && data.audio.pure_es && data.lyrics && data.lyrics.pure_es) {

                            // Extract clear, short lyric lines to use as targets
                            const lines = data.lyrics.pure_es.split('\n')
                                .filter(line => line.trim().length > 0 && !line.startsWith('['))
                                .filter(line => line.split(' ').length >= 2 && line.split(' ').length <= 6);

                            if (lines.length > 0) {
                                // Pick a random line from the song to be the "target"
                                const targetLyric = lines[Math.floor(Math.random() * lines.length)];
                                userTracks.push({
                                    id: lessonId,
                                    title: data.title,
                                    // Use the relative public path for audio
                                    audioUrl: `/data${data.audio.pure_es.replace('/audio', '/audio')}`,
                                    lyric: targetLyric.replace(/[¿?¡!,.]/g, '').trim()
                                });
                            }
                        }
                    }
                } catch (e) {
                    // Ignore
                }
            }

            if (userTracks.length < 3) {
                userTracks = FALLBACK_TRACKS;
            }

            setTracks(userTracks);
            setLoading(false);
        }

        loadTracks();
    }, [completedLessons]);

    // Start next round
    useEffect(() => {
        if (!loading && tracks.length > 0 && !currentTrack && !showResult) {
            startNextRound();
        }
    }, [loading, tracks, currentTrack, showResult]);

    const startNextRound = () => {
        // Pick random track
        const nextTrack = tracks[Math.floor(Math.random() * tracks.length)];
        setCurrentTrack(nextTrack);

        // Generate Distractor Options
        let distractors = [];
        tracks.forEach(t => {
            if (t.id !== nextTrack.id && !distractors.includes(t.lyric)) {
                distractors.push(t.lyric);
            }
        });

        // If not enough distractors from other tracks, add some dummy ones based on common words
        const dummyDistractors = [
            'Buenos días amigo', 'Quisiera pedir agua', 'Dónde está la mesa',
            'Me llamo María', 'Tengo quince años', 'La cuenta por favor'
        ];

        while (distractors.length < 3) {
            const randomDummy = dummyDistractors[Math.floor(Math.random() * dummyDistractors.length)];
            if (!distractors.includes(randomDummy) && randomDummy !== nextTrack.lyric) {
                distractors.push(randomDummy);
            }
        }

        const finalOptions = [nextTrack.lyric, ...distractors.slice(0, 3)].sort(() => Math.random() - 0.5);
        setOptions(finalOptions);

        setSelectedAnswer(null);
        setShowResult(false);
        setIsCorrect(false);
        setIsPlaying(false);

        // Prep audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = nextTrack.audioUrl;
            audioRef.current.load();
        }
    };

    const handlePlaySnippet = () => {
        if (!audioRef.current || !currentTrack) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            // Because we don't have real timestamps mapped to lyrics, 
            // we will randomly seek to a point in the middle of the track to simulate "snippets"
            // Ensure audio is somewhat loaded to get duration
            const duration = audioRef.current.duration || 60;
            if (audioRef.current.currentTime === 0) {
                audioRef.current.currentTime = Math.floor(duration * 0.3) + Math.random() * (duration * 0.4);
            }

            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(e => console.error("Audio play error", e));

            // Auto pause after 5 seconds to act as a "snippet"
            setTimeout(() => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                }
            }, 6000);
        }
    };

    const handleAnswerSelect = (opt) => {
        if (showResult) return;

        setSelectedAnswer(opt);
        const correct = opt === currentTrack.lyric;
        setIsCorrect(correct);
        setShowResult(true);

        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }

        if (correct) {
            setScore(s => s + 100);
        }

        setTimeout(() => {
            setCurrentTrack(null); // Triggers startNextRound
        }, 2000);
    };

    if (loading) {
        return <div className="min-h-screen bg-[#1E1B4B] flex items-center justify-center text-5xl">🎧</div>;
    }

    return (
        <div className="min-h-screen bg-[#1E1B4B] text-slate-200 font-sans selection:bg-fuchsia-500/30 overflow-x-hidden flex flex-col relative">

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0 block">
                <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] rounded-full bg-fuchsia-600/10 blur-[150px] mix-blend-screen animate-pulse animation-delay-2000"></div>

                {/* Audio visualizer decor bars */}
                <div className="absolute bottom-0 left-0 w-full h-[30vh] flex items-end justify-center gap-2 opacity-10">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="w-8 bg-gradient-to-t from-fuchsia-500 to-violet-400 rounded-t-full"
                            style={{
                                height: `${Math.random() * 100}%`,
                                animation: isPlaying ? `bounceBar ${0.5 + Math.random()}s infinite alternate` : 'none'
                            }}>
                        </div>
                    ))}
                </div>
            </div>

            <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

            <header className="relative z-40 bg-[#1E1B4B]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 mb-8 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/games" className="flex items-center gap-2 group">
                        <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="text-xl font-bold text-violet-300 group-hover:text-white transition-colors">
                            {language === 'fr' ? 'Arcade' : 'Arcade'}
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-slate-400 text-sm font-bold tracking-widest uppercase">Score</span>
                        <span className="text-fuchsia-400 font-black text-2xl">{score}</span>
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-6 relative z-10 w-full animate-fade-in flex-grow flex flex-col items-center pt-10">

                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-br from-white via-violet-200 to-fuchsia-400">
                        {language === 'fr' ? 'Explorateur Audio' : 'Audio Explorer'}
                    </h1>
                    <p className="text-slate-400 text-lg">
                        {language === 'fr'
                            ? 'Écoutez l\'extrait de la chanson. Quelle parole entendez-vous ?'
                            : 'Listen to the song snippet. Which lyric do you hear?'}
                    </p>
                </div>

                {/* The Player Button */}
                <div className="mb-16 relative group">
                    <div className={`absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full blur-xl transition-all duration-500 ${isPlaying ? 'opacity-50 scale-110' : 'opacity-20 scale-100 group-hover:opacity-40'}`}></div>
                    <button
                        onClick={handlePlaySnippet}
                        className={`relative w-40 h-40 rounded-full flex items-center justify-center text-6xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 transition-all duration-300 transform active:scale-95
                            ${isPlaying ? 'bg-fuchsia-500 text-white border-fuchsia-300' : 'bg-[#2E2854] text-violet-400 border-violet-500/50 hover:bg-[#342D61] hover:text-fuchsia-400 hover:border-fuchsia-500'}
                        `}
                    >
                        {isPlaying ? '⏸' : '▶'}
                    </button>
                    {isPlaying && (
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-fuchsia-400 font-bold tracking-widest uppercase text-sm animate-pulse">
                            {language === 'fr' ? 'En lecture...' : 'Playing...'}
                        </div>
                    )}
                </div>

                {/* The Options */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map((opt, idx) => {
                        const isSelected = selectedAnswer === opt;
                        const isCorrectAnswer = opt === currentTrack?.lyric;

                        let btnStyle = 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-violet-500 hover:text-white';
                        let icon = null;

                        if (showResult) {
                            if (isCorrectAnswer) {
                                btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 scale-[1.02] shadow-[0_0_20px_rgba(52,211,153,0.3)] z-10';
                                icon = '✅';
                            } else if (isSelected && !isCorrectAnswer) {
                                btnStyle = 'bg-red-500/20 border-red-500 text-red-400 scale-95 opacity-50';
                                icon = '❌';
                            } else {
                                btnStyle = 'bg-white/5 border-white/5 text-slate-500 opacity-50';
                            }
                        }

                        return (
                            <button
                                key={idx}
                                disabled={showResult}
                                onClick={() => handleAnswerSelect(opt)}
                                className={`relative w-full p-6 rounded-2xl border-2 text-xl md:text-2xl font-black tracking-tight text-center transition-all duration-300 ${btnStyle}`}
                            >
                                {opt}
                                {icon && <span className="absolute top-1/2 -right-8 -translate-y-1/2 text-3xl animate-pop-in">{icon}</span>}
                            </button>
                        );
                    })}
                </div>

                {showResult && (
                    <div className="mt-12 text-center animate-fade-in-up">
                        <div className={`text-2xl font-black uppercase tracking-widest ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isCorrect ? (language === 'fr' ? 'Correct ! +100' : 'Correct! +100') : (language === 'fr' ? 'Raté !' : 'Miss!')}
                        </div>
                        <p className="text-slate-400 mt-2">
                            {language === 'fr' ? 'Chanson Source :' : 'Source Song:'} <span className="text-white font-bold">{currentTrack?.title}</span>
                        </p>
                    </div>
                )}

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounceBar {
                    0% { transform: scaleY(0.7); }
                    100% { transform: scaleY(1.3); }
                }
                @keyframes pop-in {
                    0% { transform: translateY(-50%) scale(0.5); opacity: 0; }
                    80% { transform: translateY(-50%) scale(1.2); opacity: 1; }
                    100% { transform: translateY(-50%) scale(1); opacity: 1; }
                }
                .animate-pop-in { animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}} />
        </div>
    );
}
