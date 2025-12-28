import React from 'react';

const AdminDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                    <h3 className="text-gray-400 text-sm font-medium">Total Songs</h3>
                    <p className="text-3xl font-bold text-white mt-2">24</p>
                    <span className="text-green-400 text-xs mt-1 block">Across 8 Modules</span>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                    <h3 className="text-gray-400 text-sm font-medium">Total Exercises</h3>
                    <p className="text-3xl font-bold text-white mt-2">72</p>
                    <span className="text-teal-400 text-xs mt-1 block">Ready to practice</span>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                    <h3 className="text-gray-400 text-sm font-medium">Languages</h3>
                    <p className="text-3xl font-bold text-white mt-2">3</p>
                    <span className="text-purple-400 text-xs mt-1 block">ES, EN, FR</span>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                    <h3 className="text-gray-400 text-sm font-medium">Prompts</h3>
                    <p className="text-3xl font-bold text-white mt-2">0</p>
                    <span className="text-gray-500 text-xs mt-1 block">Define first prompt</span>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mt-8">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="flex gap-4">
                    <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition">
                        + New Song
                    </button>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                        + Create Prompt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
