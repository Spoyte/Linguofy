import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function SongPlayer() {
    const { id } = useParams();
    const [songData, setSongData] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [version, setVersion] = useState('mixed_fr'); // mixed_fr, mixed_en, pure_es
    const audioRef = useRef(null);

    useEffect(() => {
        fetch(`/data/songs/${id}.json`)
            .then(res => res.json())
            .then(data => setSongData(data))
            .catch(err => console.error("Failed to load song", err));
    }, [id]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.load();
            if (isPlaying) audioRef.current.play();
        }
    }, [version]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    if (!songData) return <div className="text-center p-10">Loading...</div>;

    // Simple lyric parser
    const lyricsText = songData.lyrics[version] || "";
    const lyricsLines = lyricsText.split('\n').map((line, i) => ({ id: i, text: line }));

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <Link to="/learn" className="text-slate-400 hover:text-white">
                        ← Back
                    </Link>
                    <div className="text-sm text-slate-500">LESSON {id}</div>
                </div>

                {/* Version Selector */}
                <div className="flex justify-center gap-2 mb-6">
                    {['mixed_fr', 'mixed_en', 'pure_es'].map(v => (
                        <button
                            key={v}
                            onClick={() => setVersion(v)}
                            className={`px-3 py-1 rounded text-xs uppercase font-bold tracking-wider transition ${version === v ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
                        >
                            {v.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 mb-8 animate-pulse">
                    <span className="text-6xl">🎵</span>
                </div>

                <h2 className="text-2xl font-bold text-center mb-1">{songData.title}</h2>
                <p className="text-center text-slate-400 mb-8 text-xs px-4">{songData.style}</p>

                <div className="space-y-2 mb-8 h-64 overflow-y-auto pr-2 bg-slate-900/30 p-4 rounded-lg">
                    {lyricsLines.map((line) => (
                        <div key={line.id} className={`text-center ${line.text.startsWith('[') ? 'text-yellow-500 font-bold mt-4' : 'text-slate-300'}`}>
                            {line.text}
                        </div>
                    ))}
                </div>

                <audio
                    ref={audioRef}
                    src={songData.audio && songData.audio[version]}
                    onEnded={() => setIsPlaying(false)}
                />

                <div className="flex justify-center gap-6 items-center">
                    <button className="text-slate-400 hover:text-white">⏮</button>
                    <button
                        onClick={togglePlay}
                        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-400 text-slate-900 transition shadow-lg shadow-green-500/20"
                    >
                        {isPlaying ? "⏸" : "▶"}
                    </button>
                    <button className="text-slate-400 hover:text-white">⏭</button>
                </div>
            </div>
        </div>
    );
}
