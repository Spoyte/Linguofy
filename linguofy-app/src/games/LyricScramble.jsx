import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';

// Fallback lyrics if user hasn't completed any songs yet
const FALLBACK_LYRICS = [
    { text: "Me llamo Marco", source: "Unit 1 - Intro" },
    { text: "Tengo veinte años", source: "Unit 1 - Intro" },
    { text: "Nos vemos pronto", source: "Unit 1 - Outro" },
    { text: "Quisiera pedir una mesa", source: "Unit 9 - Restaurant" },
    { text: "La cuenta por favor", source: "Unit 9 - Restaurant" }
];

export default function LyricScramble() {
    const { completedLessons } = useProgress();
    const { language } = useLanguage();

    const [sentences, setSentences] = useState([]);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [wordBank, setWordBank] = useState([]);
    const [answerTray, setAnswerTray] = useState([]);
    const [score, setScore] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const [loading, setLoading] = useState(true);

    // Parse lyrics from songs
    useEffect(() => {
        async function loadLyrics() {
            setLoading(true);
            let extracted = [];

            for (const lessonId of completedLessons) {
                try {
                    const res = await fetch(`/data/songs/${lessonId}.json`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.lyrics && data.lyrics.pure_es) {
                            // Extract lines that aren't headers like [Chorus]
                            const lines = data.lyrics.pure_es.split('\n')
                                .filter(line => line.trim().length > 0 && !line.startsWith('['))
                                .filter(line => line.split(' ').length > 2 && line.split(' ').length < 8); // Keep reasonable length

                            lines.forEach(line => {
                                // Clean punctuation
                                const cleanLine = line.replace(/[¿?¡!,.]/g, '').trim();
                                if (cleanLine) {
                                    extracted.push({ text: cleanLine, source: data.title });
                                }
                            });
                        }
                    }
                } catch (e) {
                    // Ignore
                }
            }

            if (extracted.length < 3) {
                extracted = FALLBACK_LYRICS;
            }

            // Shuffle sentences
            const shuffled = extracted.sort(() => Math.random() - 0.5);
            setSentences(shuffled);
            loadSentence(shuffled[0]);
            setLoading(false);
        }

        loadLyrics();
    }, [completedLessons]);

    const loadSentence = (sentenceObj) => {
        if (!sentenceObj) return;
        const words = sentenceObj.text.split(' ').map((word, idx) => ({ id: `${idx}-${word}`, word }));
        // Shuffle words
        const shuffledWords = [...words].sort(() => Math.random() - 0.5);
        setWordBank(shuffledWords);
        setAnswerTray([]);
        setIsChecking(false);
    };

    const moveToAnswer = (wordObj) => {
        if (isChecking) return;
        setWordBank(wordBank.filter(w => w.id !== wordObj.id));
        const newAnswer = [...answerTray, wordObj];
        setAnswerTray(newAnswer);

        // Check automatically if tray is full
        if (newAnswer.length === wordBank.length + answerTray.length) {
            checkAnswer(newAnswer);
        }
    };

    const moveToBank = (wordObj) => {
        if (isChecking) return;
        setAnswerTray(answerTray.filter(w => w.id !== wordObj.id));
        setWordBank([...wordBank, wordObj]);
    };

    const checkAnswer = (currentAnswer) => {
        setIsChecking(true);
        const originalString = sentences[currentSentenceIndex].text.toLowerCase();
        const constructedString = currentAnswer.map(w => w.word).join(' ').toLowerCase();

        if (originalString === constructedString) {
            // Correct
            setTimeout(() => {
                setScore(s => s + 1);
                const nextIndex = (currentSentenceIndex + 1) % sentences.length;
                setCurrentSentenceIndex(nextIndex);
                loadSentence(sentences[nextIndex]);
            }, 1000);
        } else {
            // Wrong, shake and return words after delay
            setTimeout(() => {
                setWordBank([...wordBank, ...currentAnswer].sort(() => Math.random() - 0.5));
                setAnswerTray([]);
                setIsChecking(false);
            }, 1000);
        }
    };

    const skipSentence = () => {
        const nextIndex = (currentSentenceIndex + 1) % sentences.length;
        setCurrentSentenceIndex(nextIndex);
        loadSentence(sentences[nextIndex]);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center text-emerald-400">
                <div className="animate-spin text-4xl">🧩</div>
            </div>
        );
    }

    const currentTarget = sentences[currentSentenceIndex];
    const isFull = answerTray.length > 0 && wordBank.length === 0;
    const isCorrect = isChecking && isFull &&
        currentTarget.text.toLowerCase() === answerTray.map(w => w.word).join(' ').toLowerCase();

    return (
        <div className="min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-emerald-500/30 overflow-x-hidden pb-12 relative flex flex-col">

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0 block">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[150px] mix-blend-screen animate-pulse"></div>
            </div>

            <header className="sticky top-0 z-40 bg-[#0A0F1C]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 mb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/games" className="flex items-center gap-2 group">
                        <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="text-xl font-bold text-slate-300 group-hover:text-white transition-colors">
                            {language === 'fr' ? 'Retour' : 'Arcade'}
                        </span>
                    </Link>
                    <div className="flex items-center gap-4 text-emerald-400 font-black text-xl tracking-widest uppercase">
                        Lyric Scramble
                    </div>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-6 relative z-10 w-full animate-fade-in flex-grow flex flex-col items-center">

                <div className="w-full flex justify-between items-center mb-12">
                    <div className="text-xl font-bold">
                        <span className="text-slate-400">{language === 'fr' ? 'Score:' : 'Score:'}</span>
                        <span className="text-emerald-400 text-3xl ml-2">{score}</span>
                    </div>
                    <button
                        onClick={skipSentence}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-all active:scale-95 text-white"
                    >
                        ⏭ {language === 'fr' ? 'Passer' : 'Skip'}
                    </button>
                </div>

                <div className="text-center mb-8">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">
                        {language === 'fr' ? 'Construis la phrase de' : 'Reconstruct the sentence from'}
                    </div>
                    <div className="text-2xl font-black text-emerald-400">
                        "{currentTarget?.source}"
                    </div>
                </div>

                {/* Answer Tray */}
                <div className={`w-full min-h-[100px] bg-white/[0.03] border-2 border-dashed rounded-3xl p-6 flex flex-wrap content-start items-center justify-center gap-3 mb-12 transition-colors duration-300
                    ${isChecking && isCorrect ? 'border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_30px_rgba(52,211,153,0.2)]' : 'border-white/10'}
                    ${isChecking && !isCorrect && isFull ? 'border-red-500/50 animate-shake' : ''}
                `}>
                    {answerTray.length === 0 && !isChecking && (
                        <span className="text-slate-600 font-medium">
                            {language === 'fr' ? 'Touche les mots pour les ajouter ici' : 'Tap words to place them here'}
                        </span>
                    )}
                    {answerTray.map((wordObj) => (
                        <button
                            key={wordObj.id}
                            onClick={() => moveToBank(wordObj)}
                            className={`px-5 py-3 rounded-2xl text-xl font-black shadow-lg transition-transform hover:scale-105 active:scale-95
                                ${isChecking && isCorrect ? 'bg-emerald-500 text-white shadow-emerald-500/50' : 'bg-white text-black hover:bg-slate-200'}
                                ${isChecking && !isCorrect && isFull ? 'bg-red-500 text-white' : ''}
                            `}
                        >
                            {wordObj.word}
                        </button>
                    ))}
                </div>

                {/* Word Bank */}
                <div className="w-full flex justify-center flex-wrap gap-4 mt-auto">
                    {wordBank.map((wordObj) => (
                        <button
                            key={wordObj.id}
                            onClick={() => moveToAnswer(wordObj)}
                            className="px-6 py-4 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-300 text-xl font-black hover:bg-emerald-500/20 hover:border-emerald-400 transform transition-all active:scale-95 shadow-lg"
                        >
                            {wordObj.word}
                        </button>
                    ))}
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-10px); }
                    40%, 80% { transform: translateX(10px); }
                }
                .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
            `}} />
        </div>
    );
}
