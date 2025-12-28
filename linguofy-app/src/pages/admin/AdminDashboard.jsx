import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                    <h3 className="text-gray-400 text-sm font-medium">Total Songs</h3>
                    <p className="text-3xl font-bold text-white mt-2">24</p>
                    <span className="text-green-400 text-xs mt-1 block">8 Units × 3 Lessons</span>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                    <h3 className="text-gray-400 text-sm font-medium">Total Exercises</h3>
                    <p className="text-3xl font-bold text-white mt-2">72</p>
                    <span className="text-teal-400 text-xs mt-1 block">With hints & translations</span>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                    <h3 className="text-gray-400 text-sm font-medium">Languages</h3>
                    <p className="text-3xl font-bold text-white mt-2">3</p>
                    <span className="text-purple-400 text-xs mt-1 block">🇪🇸 ES → 🇫🇷 FR / 🇬🇧 EN</span>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-sm">
                    <h3 className="text-gray-400 text-sm font-medium">Audio Ready</h3>
                    <p className="text-3xl font-bold text-white mt-2">9/72</p>
                    <span className="text-amber-400 text-xs mt-1 block">Unit 1 complete</span>
                </div>
            </div>

            {/* Feature Status */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">✅ Recent Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-green-400">
                        <span>✓</span>
                        <span>French/English language toggle (🇬🇧/🇫🇷)</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                        <span>✓</span>
                        <span>Hint system after 2 wrong attempts</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                        <span>✓</span>
                        <span>Fuzzy matching for translations (typos OK)</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                        <span>✓</span>
                        <span>Progressive song difficulty (80%→17% native)</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                        <span>✓</span>
                        <span>Vocabulary tracking (knownVocab/focusVocab)</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                        <span>✓</span>
                        <span>Supabase schema ready for migration</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link to="/admin/songs" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition">
                        📝 Manage Songs
                    </Link>
                    <Link to="/admin/exercises" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition">
                        ✎ Manage Exercises
                    </Link>
                    <Link to="/admin/config" className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition">
                        ⚙️ Configuration
                    </Link>
                </div>
            </div>

            {/* Pending Tasks */}
            <div className="bg-amber-900/30 p-6 rounded-xl border border-amber-500/30">
                <h2 className="text-xl font-bold text-amber-300 mb-4">⏳ Pending Tasks</h2>
                <ul className="space-y-2 text-amber-200 text-sm">
                    <li>• Generate audio files for Units 2-8 (63 MP3s needed)</li>
                    <li>• Deploy to Vercel</li>
                    <li>• Set up Supabase project and run migrations</li>
                    <li>• Enable Google OAuth authentication</li>
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;
