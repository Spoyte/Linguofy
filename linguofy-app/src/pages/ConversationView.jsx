import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';

/**
 * ConversationView
 * 
 * Scaffold for a real-time multimodal conversational AI feature.
 * This simulates connecting to a WebRTC/WebSocket endpoint (e.g., OpenAI Realtime API)
 * to converse in Spanish with a virtual tutor.
 */
export default function ConversationView() {
    const { language } = useLanguage();

    // Connection and Audio States
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [transcript, setTranscript] = useState([]); // [{ role: 'ai'|'user', text: '...' }]
    const [aiIsSpeaking, setAiIsSpeaking] = useState(false);

    // Refs for WebRTC/Audio
    const localStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnectAI();
        };
    }, []);

    const requestMicrophoneAccess = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localStreamRef.current = stream;
            return true;
        } catch (err) {
            console.error("Microphone access denied or error:", err);
            alert("Please allow microphone access to converse with the AI tutor.");
            return false;
        }
    };

    const connectToAI = async () => {
        setIsConnecting(true);

        const hasMic = await requestMicrophoneAccess();
        if (!hasMic) {
            setIsConnecting(false);
            return;
        }

        // Simulate WebRTC Connection delay
        setTimeout(() => {
            setIsConnected(true);
            setIsConnecting(false);

            // AI starts the conversation
            setAiIsSpeaking(true);
            setTranscript([{ role: 'ai', text: '¡Hola! ¿Cómo estás hoy? Soy tu tutora de español.' }]);

            setTimeout(() => setAiIsSpeaking(false), 3000);
        }, 1500);
    };

    const disconnectAI = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        setIsConnected(false);
        setTranscript([]);
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    // Simulate user talking & AI responding
    const simulateConversationTurn = () => {
        if (!isConnected || isMuted) return;

        setTranscript(prev => [...prev, { role: 'user', text: 'Estoy bien, gracias. ¿Y tú?' }]);

        setTimeout(() => {
            setAiIsSpeaking(true);
            setTranscript(prev => [...prev, { role: 'ai', text: '¡Excelente! Me alegro mucho. ¿De qué te gustaría hablar hoy?' }]);

            setTimeout(() => setAiIsSpeaking(false), 3500);
        }, 1000);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-purple-500/30 overflow-hidden relative">

            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden block z-0">
                <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] mix-blend-screen transition-all duration-1000 ${aiIsSpeaking ? 'bg-purple-600/30 scale-110' : 'bg-purple-600/10'}`}></div>
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 p-6 flex justify-between items-center border-b border-white/5 bg-black/20 backdrop-blur-md">
                <Link to="/learn" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    <span className="font-bold">{language === 'fr' ? 'Retour' : 'Back'}</span>
                </Link>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">AI Tutor Live</h1>
                </div>
                <div className="w-20 flex justify-end">
                    {isConnected && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Live</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:flex-row relative z-10 p-4 md:p-8 gap-8 max-w-7xl mx-auto w-full">

                {/* Visualizer / Avatar Panel */}
                <div className="flex-1 flex flex-col items-center justify-center bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl shadow-2xl relative min-h-[400px]">

                    {/* AI Avatar Orb */}
                    <div className="relative flex items-center justify-center mb-12">
                        <div className={`absolute w-64 h-64 rounded-full border border-purple-500/30 transition-all duration-700 ${aiIsSpeaking ? 'scale-125 opacity-100' : 'scale-100 opacity-0'}`}></div>
                        <div className={`absolute w-56 h-56 rounded-full border border-pink-500/20 transition-all duration-500 delay-100 ${aiIsSpeaking ? 'scale-150 opacity-100 animate-spin-slow' : 'scale-100 opacity-0'}`}></div>

                        <div className={`relative w-48 h-48 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.4)] transition-transform duration-500 ${aiIsSpeaking ? 'scale-110 shadow-[0_0_80px_rgba(168,85,247,0.6)]' : 'scale-100'}`}>
                            <span className="text-7xl drop-shadow-lg">👩‍🏫</span>
                        </div>
                    </div>

                    <div className="text-center h-24">
                        <h2 className="text-2xl font-black text-white mb-2">Elena</h2>
                        <p className="text-purple-400 font-medium">Bilingual Spanish Tutor</p>
                        {aiIsSpeaking && (
                            <div className="flex items-center justify-center gap-1 mt-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-8 left-0 w-full flex justify-center items-center gap-6">
                        {!isConnected ? (
                            <button
                                onClick={connectToAI}
                                disabled={isConnecting}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-full shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                {isConnecting ? 'Connecting...' : 'Connect to Tutor'}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={toggleMute}
                                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'}`}
                                >
                                    {isMuted ? (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                    )}
                                </button>
                                <button
                                    onClick={disconnectAI}
                                    className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-400 transition-colors shadow-lg shadow-red-500/20"
                                    aria-label="End Call"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.516l2.257-1.13a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" /></svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Transcript Panel */}
                <div className="flex-1 bg-black/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-md flex flex-col h-[500px] md:h-auto overflow-hidden relative">
                    <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-6 border-b border-white/5 pb-4">Live Transcript</h3>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {transcript.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 italic opacity-50">
                                <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                <p>Connect to start the conversation.</p>
                            </div>
                        ) : (
                            transcript.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600/20 border border-purple-500/30 text-white rounded-tr-sm' : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'}`}>
                                        <p className="text-sm md:text-base leading-relaxed">{msg.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        {/* Hidden button to simulate user speaking for demo purposes */}
                        {isConnected && !aiIsSpeaking && (
                            <button onClick={simulateConversationTurn} className="w-full py-2 border border-dashed border-white/10 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:border-white/20 transition-colors mt-4">
                                (Simulate Speaking)
                            </button>
                        )}
                    </div>
                    {/* Fade out for scrolling */}
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none rounded-b-[2rem]"></div>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}} />
        </div>
    );
}
