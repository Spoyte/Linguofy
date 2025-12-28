import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { modules } from '../../data/courseData';

const ExerciseList = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [exercises, setExercises] = useState([]);

    useEffect(() => {
        // 1. Find the lesson metadata
        let foundLesson = null;
        for (const mod of modules) {
            const l = mod.songs.find(s => s.id === id);
            if (l) {
                foundLesson = l;
                break;
            }
        }
        setLesson(foundLesson);

        // 2. Fetch the actual JSON file to get exercises
        if (foundLesson) {
            fetch(`/data/songs/${id}.json`)
                .then(res => {
                    if (!res.ok) throw new Error("JSON not found");
                    return res.json();
                })
                .then(data => {
                    setExercises(data.exercises || []);
                })
                .catch(err => {
                    console.error("Failed to load exercises:", err);
                    // Add mock exercises if file missing/empty
                    setExercises([]);
                });
        }
    }, [id]);

    if (!lesson) return <div className="text-white p-8">Loading Lesson...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-gray-900 p-6 rounded-xl border border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold text-white">Exercises: {lesson.title}</h1>
                    <p className="text-gray-400 text-sm mt-1">Manage interactive content for Lesson {id}</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to={`/admin/songs/${id}`}
                        className="px-4 py-2 text-gray-400 hover:text-white transition"
                    >
                        Back to Song
                    </Link>
                    <Link
                        to={`/admin/songs/${id}/exercises/new`}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-teal-500/20 transition"
                    >
                        + Add Exercise
                    </Link>
                </div>
            </div>

            <div className="space-y-4">
                {exercises.length === 0 ? (
                    <div className="text-center p-12 bg-gray-800 rounded-xl border border-gray-700 border-dashed text-gray-500">
                        No exercises found. Create one to get started!
                    </div>
                ) : (
                    exercises.map((ex, idx) => (
                        <div key={idx} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex justify-between items-center group hover:border-teal-500/50 transition">
                            <div className="flex items-center gap-4">
                                <span className="bg-gray-900 text-gray-500 w-8 h-8 flex items-center justify-center rounded-full font-mono text-sm">
                                    {idx + 1}
                                </span>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded ${ex.type === 'multiple_choice' ? 'bg-blue-900 text-blue-300' :
                                                ex.type === 'fill_blank' ? 'bg-purple-900 text-purple-300' :
                                                    'bg-gray-700 text-gray-300'
                                            }`}>
                                            {ex.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <h3 className="text-white font-medium">
                                        {ex.question || ex.instruction || "Untitled Exercise"}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition">
                                <Link
                                    to={`/admin/songs/${id}/exercises/${idx}`}
                                    className="p-2 text-gray-400 hover:text-white bg-gray-900 rounded-lg"
                                >
                                    ✏️ Edit
                                </Link>
                                <button className="p-2 text-gray-400 hover:text-red-400 bg-gray-900 rounded-lg">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ExerciseList;
