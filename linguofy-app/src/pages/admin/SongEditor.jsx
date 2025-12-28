import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modules } from '../../data/courseData';

const SongEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [formData, setFormData] = useState({
        id: '',
        title: '',
        type: '', // Style/Genre
        module: '',
        lyrics_mixed: '',
        lyrics_pure: '',
        audio_mixed_fr: '',
        audio_mixed_en: '',
        audio_pure_es: ''
    });

    useEffect(() => {
        if (!isNew) {
            // Find song in modules
            let foundSong = null;
            let foundModule = null;

            for (const mod of modules) {
                const s = mod.songs.find(s => s.id === id);
                if (s) {
                    foundSong = s;
                    foundModule = mod;
                    break;
                }
            }

            if (foundSong) {
                // In a real app, we'd fetch the full JSON content here
                // For this prototype, we'll mock filling the form with what we have
                // and placeholders for the detailed content usually in 1-1.json etc.
                setFormData({
                    id: foundSong.id,
                    title: foundSong.title,
                    type: foundSong.type,
                    module: foundModule.id,
                    lyrics_mixed: "[Load from JSON...]",
                    lyrics_pure: "[Load from JSON...]",
                    audio_mixed_fr: `/audio/${foundSong.id}-mixed_fr.mp3`,
                    audio_mixed_en: `/audio/${foundSong.id}-mixed_en.mp3`,
                    audio_pure_es: `/audio/${foundSong.id}-pure_es.mp3`
                });
            }
        }
    }, [id, isNew]);

    const handleSave = (e) => {
        e.preventDefault();
        console.log("Saving Song Data:", formData);
        alert("In this prototype, data is logged to console. In Phase 2, this will save to DB.");
        navigate('/admin/songs');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">
                    {isNew ? 'Create New Song' : `Edit Song: ${formData.title}`}
                </h1>
                <button
                    onClick={() => navigate('/admin/songs')}
                    className="text-gray-400 hover:text-white"
                >
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSave} className="bg-gray-800 p-8 rounded-xl border border-gray-700 space-y-6">

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-400 mb-2">Song ID</label>
                        <input
                            type="text"
                            value={formData.id}
                            disabled={!isNew}
                            onChange={e => setFormData({ ...formData, id: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
                            placeholder="e.g. 1-4"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-teal-500 focus:outline-none"
                            placeholder="Song Title"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Style / Genre</label>
                        <input
                            type="text"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-teal-500 focus:outline-none"
                            placeholder="e.g. Reggaeton"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Module Number</label>
                        <input
                            type="number"
                            value={formData.module}
                            onChange={e => setFormData({ ...formData, module: e.target.value })}
                            className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-teal-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Audio Paths */}
                <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-bold text-white mb-4">Audio Configuration</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">Mixed (French) Path</label>
                            <input
                                type="text"
                                value={formData.audio_mixed_fr}
                                onChange={e => setFormData({ ...formData, audio_mixed_fr: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 mb-2 text-sm">Pure (Spanish) Path</label>
                            <input
                                type="text"
                                value={formData.audio_pure_es}
                                onChange={e => setFormData({ ...formData, audio_pure_es: e.target.value })}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white font-mono text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Lyrics (Placeholder for now) */}
                <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-bold text-white mb-4">Lyrics Content</h3>
                    <p className="text-gray-500 italic text-sm mb-4">
                        In a full implementation, this would load the JSON content file.
                    </p>
                    <textarea
                        value={formData.lyrics_mixed}
                        onChange={e => setFormData({ ...formData, lyrics_mixed: e.target.value })}
                        className="w-full h-40 bg-gray-900 border border-gray-600 rounded p-3 text-white font-mono text-sm"
                        placeholder="Song Lyrics..."
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/songs')}
                        className="px-6 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-lg shadow-teal-500/20"
                    >
                        Save Changes
                    </button>
                </div>

            </form>
        </div>
    );
};

export default SongEditor;
