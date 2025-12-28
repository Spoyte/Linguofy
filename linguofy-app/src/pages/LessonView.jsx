import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import ExerciseEngine from '../components/ExerciseEngine';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';

export default function LessonView() {
    const { id } = useParams();
    const { markComplete, isComplete } = useProgress();
    const { language, t } = useLanguage();
    const [songData, setSongData] = useState(null);
    const [activeTab, setActiveTab] = useState('listen'); // listen, practice
    const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
    const [lessonFinished, setLessonFinished] = useState(false);

    useEffect(() => {
        fetch(`/data/songs/${id}.json`)
            .then(res => res.json())
            .then(data => setSongData(data))
            .catch(err => console.error(err));
    }, [id]);

    if (!songData) return <div className="text-center p-10">{t('common.loading')}</div>;

    const exercises = songData.exercises || [];
    const currentExercise = exercises[currentExerciseIdx];
    const progress = ((currentExerciseIdx) / exercises.length) * 100;

    // Choose lyrics based on selected language
    const lyricsKey = language === 'fr' ? 'mixed_fr' : 'mixed_en';
    const audioKey = language === 'fr' ? 'mixed_fr' : 'mixed_en';

    return (
        <div className="flex flex-col min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur z-10">
                <Link to="/learn" className="text-slate-400 text-2xl">×</Link>
                <div className="flex-1 mx-8 bg-slate-700 h-3 rounded-full overflow-hidden">
                    <div
                        className="bg-green-500 h-full transition-all duration-500"
                        style={{ width: `${activeTab === 'practice' ? progress : 0}%` }}
                    />
                </div>
                <div className="w-8" />
            </div>

            {/* content */}
            <div className="flex-1 flex flex-col items-center p-4">

                {/* Tabs */}
                <div className="flex bg-slate-800 p-1 rounded-xl mb-8">
                    <button
                        onClick={() => setActiveTab('listen')}
                        className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'listen' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        ♫ {t('lesson.listenAndLearn')}
                    </button>
                    <button
                        onClick={() => setActiveTab('practice')}
                        className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'practice' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        ✎ {t('lesson.exercises')}
                    </button>
                </div>

                {activeTab === 'listen' && (
                    <div className="w-full max-w-2xl text-center animate-fade-in">
                        <h1 className="text-3xl font-bold mb-2">{songData.title}</h1>
                        <p className="text-slate-400 mb-8">{t('lesson.mixedLyrics')}</p>

                        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                            <audio controls className="w-full mb-6" src={songData.audio?.[audioKey]} />
                            <div className="text-left max-h-64 overflow-y-auto whitespace-pre-wrap text-slate-300 font-medium leading-relaxed">
                                {songData.lyrics?.[lyricsKey]}
                            </div>
                        </div>

                        <button
                            onClick={() => setActiveTab('practice')}
                            className="mt-8 px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-full font-bold text-lg shadow-lg shadow-purple-500/20"
                        >
                            {t('lesson.exercises')} →
                        </button>
                    </div>
                )}

                {activeTab === 'practice' && (
                    <div className="w-full max-w-2xl animate-fade-in">
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
                                            particleCount: 150,
                                            spread: 70,
                                            origin: { y: 0.6 }
                                        });
                                    }
                                }}
                            />
                        ) : (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🎉</div>
                                <h2 className="text-3xl font-bold mb-4">
                                    {t('lesson.lessonComplete')}
                                </h2>
                                <p className="text-slate-400 mb-8">
                                    {lessonFinished
                                        ? t('lesson.progressSaved')
                                        : t('lesson.lessonComplete')}
                                </p>
                                <Link to="/learn" className="px-8 py-4 bg-green-500 text-slate-900 font-bold rounded-xl text-lg hover:bg-green-400">
                                    {t('lesson.backToMap')}
                                </Link>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}
