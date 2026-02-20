import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
    const audioRef = useRef(null);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    // Provide a dummy track for initialized UI state
    // { title: 'Song Name', coverUrl: '...', audioUrl: '...', id: '...' }

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }

        const audio = audioRef.current;

        const updateProgress = () => {
            setProgress(audio.currentTime);
            setDuration(audio.duration || 0);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', updateProgress);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', updateProgress);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const playTrack = (trackData) => {
        const audio = audioRef.current;

        if (currentTrack?.id === trackData.id) {
            // If same track, just toggle play
            togglePlayPause();
            return;
        }

        setCurrentTrack(trackData);
        audio.src = trackData.audioUrl;
        audio.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error("Error playing audio:", err));
    };

    const togglePlayPause = () => {
        const audio = audioRef.current;
        if (!audio.src) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play()
                .then(() => setIsPlaying(true))
                .catch(err => console.error("Error playing audio:", err));
        }
    };

    const seek = (time) => {
        const audio = audioRef.current;
        if (audio && audio.src) {
            audio.currentTime = time;
            setProgress(time);
        }
    };

    const value = {
        currentTrack,
        isPlaying,
        progress,
        duration,
        playTrack,
        togglePlayPause,
        seek
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
}

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
