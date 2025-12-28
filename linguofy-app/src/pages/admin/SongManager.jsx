import React, { useState } from 'react';
import { modules } from '../../data/courseData';

const SongManager = () => {
    // Flatten modules to get all songs
    const initialSongs = modules.flatMap(mod =>
        mod.songs.map(song => ({ ...song, moduleTitle: mod.title }))
    );

    const [songs, setSongs] = useState(initialSongs);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.id.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Song Manager</h1>
                <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition font-medium">
                    + Add New Song
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <input
                    type="text"
                    placeholder="Search by Title or ID..."
                    className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:outline-none focus:border-teal-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Songs Table */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-900 text-gray-400">
                        <tr>
                            <th className="p-4">ID</th>
                            <th className="p-4">Title</th>
                            <th className="p-4">Module</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredSongs.map(song => (
                            <tr key={song.id} className="hover:bg-gray-750 transition-colors">
                                <td className="p-4 text-teal-400 font-mono">{song.id}</td>
                                <td className="p-4 text-white font-medium">{song.title}</td>
                                <td className="p-4 text-gray-400 text-sm">{song.moduleTitle}</td>
                                <td className="p-4">
                                    <span className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded text-xs uppercase">
                                        {song.type}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {song.status === 'published' && (
                                        <span className="bg-green-900/50 text-green-400 px-2 py-1 rounded text-xs uppercase font-bold border border-green-500/30">
                                            Published
                                        </span>
                                    )}
                                    {song.status === 'audio_missing' && (
                                        <span className="bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded text-xs uppercase font-bold border border-yellow-500/30">
                                            Audio Missing
                                        </span>
                                    )}
                                    {song.status === 'draft' && (
                                        <span className="bg-gray-700 text-gray-400 px-2 py-1 rounded text-xs uppercase font-bold border border-gray-600">
                                            Draft
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <a href={`/admin/songs/${song.id}`} className="text-gray-400 hover:text-white transition">✏️ Edit</a>
                                    <button className="text-gray-400 hover:text-red-400 transition">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredSongs.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No songs found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
};

export default SongManager;
