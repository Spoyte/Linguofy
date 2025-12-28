import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { modules } from '../../data/courseData';
import { exerciseTypes } from '../../data/config';

const ExerciseEditor = () => {
    const { id, exId } = useParams(); // id = songId, exId = exercise index or 'new'
    const navigate = useNavigate();
    const isNew = exId === 'new';

    const [exercise, setExercise] = useState({
        type: 'multiple_choice',
        question: '',
        options: ['', '', ''],
        answer: '',
        instruction: ''
    });

    useEffect(() => {
        if (!isNew) {
            // Mock fetching existing exercise data
            fetch(`/data/songs/${id}.json`)
                .then(res => res.json())
                .then(data => {
                    if (data.exercises && data.exercises[exId]) {
                        setExercise(data.exercises[exId]);
                    }
                })
                .catch(err => console.error("Error loading exercise:", err));
        }
    }, [id, exId, isNew]);

    const handleSave = (e) => {
        e.preventDefault();
        console.log("Saving Exercise:", exercise);
        alert("Exercise saved to console! (In Phase 2, this updates the DB)");
        navigate(`/admin/songs/${id}/exercises`);
    };

    // Sub-components for different form types
    const renderFormFields = () => {
        switch (exercise.type) {
            case 'multiple_choice':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 mb-2">Question</label>
                            <input
                                type="text"
                                value={exercise.question || ''}
                                onChange={e => setExercise({ ...exercise, question: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white"
                                placeholder="e.g. What does 'gato' mean?"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Options</label>
                            {exercise.options?.map((opt, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={e => {
                                            const newOpts = [...exercise.options];
                                            newOpts[idx] = e.target.value;
                                            setExercise({ ...exercise, options: newOpts });
                                        }}
                                        className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                        placeholder={`Option ${idx + 1}`}
                                    />
                                    <input
                                        type="radio"
                                        name="correctAnswer"
                                        checked={exercise.answer === opt && opt !== ''}
                                        onChange={() => setExercise({ ...exercise, answer: opt })}
                                        className="mt-3"
                                    />
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => setExercise({ ...exercise, options: [...(exercise.options || []), ''] })}
                                className="text-teal-400 text-sm hover:underline"
                            >
                                + Add Option
                            </button>
                        </div>
                    </div>
                );

            case 'fill_blank':
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-900/20 border border-blue-900 p-4 rounded text-sm text-blue-200">
                            <strong>Tip:</strong> Use <code className="bg-black px-1 rounded">{'{{answer}}'}</code> to create a blank.
                            Example: "Yo <code className="bg-black px-1 rounded">{'{{soy}}'}</code> alto."
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2">Sentence with Blanks</label>
                            <textarea
                                value={exercise.question || ''} // Re-using question field for the sentence
                                onChange={e => setExercise({ ...exercise, question: e.target.value })}
                                className="w-full h-32 bg-gray-900 border border-gray-600 rounded p-3 text-white font-mono"
                                placeholder="El perro es {{negro}}."
                            />
                        </div>
                    </div>
                );

            case 'match_pair':
                return (
                    <div className="space-y-4">
                        <label className="block text-gray-400 mb-2">Matching Pairs</label>
                        {(exercise.pairs || [['', '']]).map((pair, idx) => (
                            <div key={idx} className="flex gap-4 mb-2 items-center">
                                <input
                                    placeholder="Left Item (e.g. Cat)"
                                    value={pair[0]}
                                    onChange={e => {
                                        const newPairs = [...(exercise.pairs || [['', '']])];
                                        newPairs[idx][0] = e.target.value;
                                        setExercise({ ...exercise, pairs: newPairs });
                                    }}
                                    className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                />
                                <span className="text-gray-500">↔</span>
                                <input
                                    placeholder="Right Item (e.g. Gato)"
                                    value={pair[1]}
                                    onChange={e => {
                                        const newPairs = [...(exercise.pairs || [['', '']])];
                                        newPairs[idx][1] = e.target.value;
                                        setExercise({ ...exercise, pairs: newPairs });
                                    }}
                                    className="flex-1 bg-gray-900 border border-gray-600 rounded p-2 text-white"
                                />
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setExercise({ ...exercise, pairs: [...(exercise.pairs || []), ['', '']] })}
                            className="text-teal-400 text-sm hover:underline"
                        >
                            + Add Pair
                        </button>
                    </div>
                );

            default:
                return <div className="text-gray-500">Form for {exercise.type} not ready yet.</div>;
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">
                    {isNew ? 'New Exercise' : 'Edit Exercise'}
                </h1>
                <Link to={`/admin/songs/${id}/exercises`} className="text-gray-400 hover:text-white">
                    Cancel
                </Link>
            </div>

            <form onSubmit={handleSave} className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-6">

                {/* Type Selector */}
                <div>
                    <label className="block text-gray-400 mb-2">Exercise Type</label>
                    <div className="flex flex-wrap gap-2">
                        {exerciseTypes.map((typeObj) => (
                            <button
                                key={typeObj.type}
                                type="button"
                                onClick={() => setExercise({ ...exercise, type: typeObj.type })}
                                className={`px-3 py-1 rounded-full text-sm border transition ${exercise.type === typeObj.type
                                        ? 'bg-teal-600 border-teal-500 text-white shadow-lg shadow-teal-500/20'
                                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                {typeObj.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Polymorphic Form */}
                <div className="border-t border-gray-700 pt-6">
                    {renderFormFields()}
                </div>

                {/* Footer Buttons */}
                <div className="pt-6 border-t border-gray-700 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(`/admin/songs/${id}/exercises`)}
                        className="px-4 py-2 text-gray-300 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg"
                    >
                        Save Exercise
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExerciseEditor;
