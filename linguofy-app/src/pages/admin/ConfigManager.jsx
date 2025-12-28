import React, { useState } from 'react';
import { languages as initialLangs, exerciseTypes as initialTypes } from '../../data/config';

const ConfigManager = () => {
    const [languages, setLanguages] = useState(initialLangs);
    const [exercises, setExercises] = useState(initialTypes);

    const [newLang, setNewLang] = useState({ code: '', name: '', role: 'Target' });

    const handleAddLang = (e) => {
        e.preventDefault();
        setLanguages([...languages, newLang]);
        setNewLang({ code: '', name: '', role: 'Target' });
        console.log("Added Language:", newLang);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">System Configuration</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Language Settings */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">Supported Languages</h2>

                    <ul className="space-y-3 mb-6">
                        {languages.map((lang, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-gray-900 p-3 rounded">
                                <div>
                                    <span className="font-bold text-teal-400 w-8 inline-block uppercase">{lang.code}</span>
                                    <span className="text-white ml-2">{lang.name}</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${lang.role === 'Target' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'}`}>
                                    {lang.role}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <form onSubmit={handleAddLang} className="p-4 bg-gray-900/50 rounded-lg space-y-3">
                        <h3 className="text-sm text-gray-400 uppercase font-bold">Add Language</h3>
                        <div className="flex gap-2">
                            <input
                                placeholder="Code (e.g. it)"
                                value={newLang.code}
                                onChange={e => setNewLang({ ...newLang, code: e.target.value })}
                                className="w-20 bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm"
                                maxLength={2}
                            />
                            <input
                                placeholder="Name (e.g. Italian)"
                                value={newLang.name}
                                onChange={e => setNewLang({ ...newLang, name: e.target.value })}
                                className="flex-1 bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={newLang.role}
                                onChange={e => setNewLang({ ...newLang, role: e.target.value })}
                                className="bg-gray-800 border border-gray-600 rounded p-2 text-white text-sm"
                            >
                                <option>Target</option>
                                <option>Native</option>
                            </select>
                            <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium text-sm">
                                Add
                            </button>
                        </div>
                    </form>
                </div>

                {/* Exercise Types (Read Only for now) */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-4">Exercise Types</h2>
                    <ul className="space-y-3">
                        {exercises.map((ex, idx) => (
                            <li key={idx} className="flex justify-between items-center bg-gray-900 p-3 rounded">
                                <span className="text-white font-medium">{ex.label}</span>
                                <span className="text-gray-500 font-mono text-xs">{ex.type}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 p-4 text-center text-gray-500 text-sm border border-dashed border-gray-700 rounded">
                        Full Exercise Builder coming in Phase 3.2
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfigManager;
