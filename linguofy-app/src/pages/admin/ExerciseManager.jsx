import React from 'react';
import { Link } from 'react-router-dom';
import { modules } from '../../data/courseData';

const ExerciseManager = () => {
    // Flatten songs to get a simple list
    const allSongs = modules.flatMap(mod => 
        mod.songs.map(song => ({
            ...song,
            moduleTitle: mod.title
        }))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Global Exercise Manager</h1>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <p className="text-gray-400 mb-6">
                    Manage interactive exercises for each lesson. Select a lesson to view or edit its specific exercises.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allSongs.map(song => (
                        <Link 
                            key={song.id} 
                            to={`/admin/songs/${song.id}/exercises`}
                            className="block bg-gray-900 border border-gray-700 p-4 rounded-lg hover:border-teal-500 transition group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-teal-500 bg-teal-900/30 px-2 py-0.5 rounded">
                                    {song.id}
                                </span>
                                <span className="text-gray-500 text-xs text-right">
                                    {song.moduleTitle}
                                </span>
                            </div>
                            <h3 className="text-white font-bold group-hover:text-teal-400 transition">
                                {song.title}
                            </h3>
                            <div className="mt-4 flex items-center gap-2 text-sm text-gray-400 group-hover:text-gray-300">
                                <span>⚡ Manage Exercises →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExerciseManager;
