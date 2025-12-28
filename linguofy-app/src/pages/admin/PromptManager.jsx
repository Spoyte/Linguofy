import React, { useState } from 'react';
import { prompts as initialPrompts } from '../../data/prompts';

const PromptManager = () => {
    const [prompts, setPrompts] = useState(initialPrompts);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [editContent, setEditContent] = useState('');

    const handleSelect = (prompt) => {
        setSelectedPrompt(prompt);
        setEditContent(prompt.template);
    };

    const handleSave = () => {
        if (!selectedPrompt) return;

        const updatedPrompts = prompts.map(p =>
            p.id === selectedPrompt.id
                ? { ...p, template: editContent }
                : p
        );

        setPrompts(updatedPrompts);
        console.log("Saved Prompt:", { id: selectedPrompt.id, template: editContent });
        alert("Prompt updated! (Console logged)");
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Sidebar List */}
            <div className="w-1/3 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-700 bg-gray-900">
                    <h2 className="font-bold text-white">System Prompts</h2>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {prompts.map(prompt => (
                        <div
                            key={prompt.id}
                            onClick={() => handleSelect(prompt)}
                            className={`p-4 rounded-lg cursor-pointer transition border ${selectedPrompt?.id === prompt.id
                                    ? 'bg-teal-900/40 border-teal-500/50'
                                    : 'bg-gray-800 hover:bg-gray-700 border-transparent'
                                }`}
                        >
                            <h3 className="text-white font-medium">{prompt.name}</h3>
                            <p className="text-gray-400 text-xs mt-1">{prompt.target}</p>
                        </div>
                    ))}
                    <button className="w-full py-3 border-2 border-dashed border-gray-600 text-gray-500 rounded-lg hover:border-teal-500 hover:text-teal-400 transition text-sm">
                        + Create New Prompt
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 bg-gray-800 rounded-xl border border-gray-700 flex flex-col overflow-hidden">
                {selectedPrompt ? (
                    <>
                        <div className="p-4 border-b border-gray-700 bg-gray-900 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-white text-lg">{selectedPrompt.name}</h2>
                                <span className="text-xs text-gray-400 font-mono">{selectedPrompt.id}</span>
                            </div>
                            <button
                                onClick={handleSave}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition"
                            >
                                Save Prompt
                            </button>
                        </div>
                        <div className="flex-1 p-0">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full h-full bg-gray-900 text-gray-300 font-mono p-6 text-sm focus:outline-none resize-none"
                                placeholder="Enter prompt template here..."
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        Select a prompt from the list to edit
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromptManager;
