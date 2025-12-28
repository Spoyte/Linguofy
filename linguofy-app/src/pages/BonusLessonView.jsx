import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
import ExerciseEngine from '../components/ExerciseEngine';
import { useProgress } from '../hooks/useProgress';
import confetti from 'canvas-confetti';

export default function BonusLessonView() {
    const { type, id } = useParams(); // type: grammar, dialogue, culture
    const { language, t } = useLanguage();
    const { markComplete, isComplete } = useProgress();
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('learn'); // learn, practice
    const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadContent() {
            try {
                const res = await fetch(`/data/${type}/${id}.json`);
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error('Failed to load content', e);
            }
            setLoading(false);
        }
        loadContent();
    }, [type, id]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-center">
                    <div className="text-4xl mb-4">😢</div>
                    <p>Content not found</p>
                    <Link to="/learn" className="text-purple-400 hover:underline mt-4 block">Back to Course</Link>
                </div>
            </div>
        );
    }

    const exercises = data.exercises || [];
    const currentExercise = exercises[currentExerciseIdx];
    const getText = (textObj) => {
        if (!textObj) return '';
        if (typeof textObj === 'string') return textObj;
        return language === 'fr' ? (textObj.fr || textObj.en) : textObj.en;
    };

    const handleExerciseComplete = () => {
        const nextIdx = currentExerciseIdx + 1;
        setCurrentExerciseIdx(nextIdx);
        if (nextIdx >= exercises.length) {
            markComplete(id);
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
    };

    const getTypeIcon = () => {
        switch (type) {
            case 'grammar': return '📖';
            case 'dialogue': return '🗣️';
            case 'culture': return '🌍';
            default: return '📚';
        }
    };

    const getTypeLabel = () => {
        switch (type) {
            case 'grammar': return language === 'fr' ? 'Grammaire' : 'Grammar';
            case 'dialogue': return language === 'fr' ? 'Dialogue' : 'Dialogue';
            case 'culture': return language === 'fr' ? 'Culture' : 'Culture';
            default: return 'Lesson';
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur z-10">
                <Link to="/learn" className="text-slate-400 text-2xl">×</Link>
                <div className="flex items-center gap-2">
                    <span className="text-xl">{getTypeIcon()}</span>
                    <span className="text-sm text-slate-400">{getTypeLabel()}</span>
                </div>
                <div className="w-8" />
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto p-4">
                {/* Title */}
                <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
                <p className="text-slate-400 mb-6">{language === 'fr' && data.description_fr ? data.description_fr : data.description}</p>

                {/* Tabs */}
                <div className="flex bg-slate-800 p-1 rounded-xl mb-8">
                    <button
                        onClick={() => setActiveTab('learn')}
                        className={`flex-1 px-4 py-2 rounded-lg font-bold transition ${activeTab === 'learn' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        📖 {language === 'fr' ? 'Apprendre' : 'Learn'}
                    </button>
                    <button
                        onClick={() => setActiveTab('practice')}
                        className={`flex-1 px-4 py-2 rounded-lg font-bold transition ${activeTab === 'practice' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        ✎ {language === 'fr' ? 'Pratiquer' : 'Practice'}
                    </button>
                </div>

                {/* Learn Tab Content */}
                {activeTab === 'learn' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Intro */}
                        {data.content?.intro && (
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                <p className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: getText(data.content.intro).replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-400">$1</strong>') }} />
                            </div>
                        )}

                        {/* Setting (for dialogues) */}
                        {data.setting && (
                            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl">
                                <p className="text-amber-300">🎬 {getText(data.setting)}</p>
                            </div>
                        )}

                        {/* Dialogue Lines */}
                        {data.dialogue && (
                            <div className="space-y-3">
                                {data.dialogue.map((line, idx) => {
                                    const character = data.characters?.find(c => c.id === line.speaker);
                                    return (
                                        <div key={idx} className={`flex gap-3 ${line.speaker === 'you' ? 'flex-row-reverse' : ''}`}>
                                            <div className="text-3xl">{character?.avatar || '👤'}</div>
                                            <div className={`flex-1 p-4 rounded-xl ${line.speaker === 'you' ? 'bg-purple-600/30 border border-purple-500/30' : 'bg-slate-800 border border-slate-700'}`}>
                                                <p className="font-medium text-lg">{line.text}</p>
                                                <p className="text-sm text-slate-400 mt-1">{getText(line.translation)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Sections (for grammar/culture) */}
                        {data.content?.sections?.map((section, idx) => (
                            <div key={idx} className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                <h2 className="text-xl font-bold mb-4 text-purple-400">{getText(section.title)}</h2>

                                {section.explanation && (
                                    <p className="text-slate-300 mb-4">{getText(section.explanation)}</p>
                                )}

                                {section.content && (
                                    <p className="text-slate-300 mb-4">{getText(section.content)}</p>
                                )}

                                {/* Examples */}
                                {section.examples && (
                                    <div className="space-y-2 mb-4">
                                        {section.examples.map((ex, i) => (
                                            <div key={i} className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                                                <span className="font-medium text-green-400">{ex.spanish}</span>
                                                <span className="text-slate-400">{getText(ex.translation)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Table */}
                                {section.table && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-600">
                                                    {section.table.headers.map((h, i) => (
                                                        <th key={i} className="py-2 px-4 font-bold text-purple-400">{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {section.table.rows.map((row, i) => (
                                                    <tr key={i} className="border-b border-slate-700/50">
                                                        {row.map((cell, j) => (
                                                            <td key={j} className="py-2 px-4">{cell}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Mnemonic/Tip */}
                                {section.mnemonic && (
                                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300 text-sm">
                                        {getText(section.mnemonic)}
                                    </div>
                                )}

                                {/* Facts (for culture) */}
                                {section.facts && (
                                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                                        {section.facts.map((fact, i) => (
                                            <li key={i}>{getText(fact)}</li>
                                        ))}
                                    </ul>
                                )}

                                {/* Dishes (for food culture) */}
                                {section.dishes && (
                                    <div className="space-y-4">
                                        {section.dishes.map((dish, i) => (
                                            <div key={i} className="p-4 bg-slate-900/50 rounded-lg">
                                                <h3 className="font-bold text-lg text-amber-400">{dish.name}</h3>
                                                <p className="text-slate-300 text-sm">{getText(dish.description)}</p>
                                                <span className="text-xs text-slate-500">📍 {dish.region}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Traditions */}
                                {section.traditions && (
                                    <ul className="list-disc list-inside space-y-1 text-slate-300 mt-4">
                                        {section.traditions.map((t, i) => (
                                            <li key={i}>{getText(t)}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}

                        {/* Key Phrases (for dialogues) */}
                        {data.keyPhrases && (
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                <h2 className="text-xl font-bold mb-4">🔑 {language === 'fr' ? 'Phrases clés' : 'Key Phrases'}</h2>
                                <div className="space-y-2">
                                    {data.keyPhrases.map((phrase, idx) => (
                                        <div key={idx} className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                                            <span className="font-medium text-green-400">{phrase.phrase}</span>
                                            <span className="text-slate-400">{getText(phrase.meaning)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tip */}
                        {data.content?.tip && (
                            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300">
                                {getText(data.content.tip)}
                            </div>
                        )}

                        {/* Focus Vocabulary */}
                        {data.focusVocab && (
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                <h2 className="text-xl font-bold mb-4">📝 {language === 'fr' ? 'Vocabulaire' : 'Vocabulary'}</h2>
                                <div className="flex flex-wrap gap-2">
                                    {data.focusVocab.map((word, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-purple-600/30 border border-purple-500/30 rounded-full text-sm">
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Practice Button */}
                        <button
                            onClick={() => setActiveTab('practice')}
                            className="w-full py-4 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/20"
                        >
                            {language === 'fr' ? 'Pratiquer maintenant →' : 'Practice Now →'}
                        </button>
                    </div>
                )}

                {/* Practice Tab Content */}
                {activeTab === 'practice' && (
                    <div className="animate-fade-in">
                        {currentExercise ? (
                            <ExerciseEngine
                                exercise={currentExercise}
                                onComplete={handleExerciseComplete}
                            />
                        ) : (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">🎉</div>
                                <h2 className="text-3xl font-bold mb-4">
                                    {isComplete(id)
                                        ? (language === 'fr' ? 'Leçon terminée !' : 'Lesson Complete!')
                                        : (language === 'fr' ? 'Bien joué !' : 'Well Done!')}
                                </h2>
                                <p className="text-slate-400 mb-8">
                                    {language === 'fr'
                                        ? 'Vous avez maîtrisé ce contenu !'
                                        : 'You\'ve mastered this content!'}
                                </p>
                                <Link to="/learn" className="px-8 py-4 bg-green-500 text-slate-900 font-bold rounded-xl text-lg hover:bg-green-400">
                                    {language === 'fr' ? 'Retour au parcours' : 'Back to Course'}
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
