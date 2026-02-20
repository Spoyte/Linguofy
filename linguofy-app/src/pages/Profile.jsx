import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../hooks/useProgress';
import { useLanguage } from '../i18n';
import LanguageToggle from '../components/LanguageToggle';
import { modules, bonusModules } from '../data/courseData';

export default function Profile() {
    const { user, signOut } = useAuth();
    const { completedLessons } = useProgress();
    const { language, t } = useLanguage();

    const [totalVocab, setTotalVocab] = useState(0);

    const totalMainSongs = modules.flatMap(m => m.songs).length;
    const totalBonus = bonusModules.flatMap(b => b.lessons).length;

    // Calculate how many main curriculum lessons vs bonus items are completed
    const completedMain = completedLessons.filter(val => !val.includes('grammar') && !val.includes('dialogue') && !val.includes('culture')).length;
    const completedBonusAmount = completedLessons.length - completedMain;

    const progressPercentage = Math.round((completedMain / totalMainSongs) * 100) || 0;

    useEffect(() => {
        async function calculateVocab() {
            let count = 0;
            const uniqueVocab = new Set();
            for (const lessonId of completedLessons) {
                try {
                    const res = await fetch(`/data/songs/${lessonId}.json`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.focusVocab) {
                            data.focusVocab.forEach(v => uniqueVocab.add(v));
                        }
                    }
                } catch (e) {
                    // Ignore missing files
                }
            }
            setTotalVocab(uniqueVocab.size);
        }
        calculateVocab();
    }, [completedLessons]);

    return (
        <div className="min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-purple-500/30 overflow-x-hidden pb-20">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none z-0 block">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen animate-blob"></div>
            </div>

            <header className="sticky top-0 z-40 bg-[#0A0F1C]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 mb-12">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/learn" className="flex items-center gap-2 group">
                        <span className="text-2xl group-hover:scale-110 transition-transform origin-center">🎸</span>
                        <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            Linguofy
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/learn" className="px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors hidden sm:block">
                            {language === 'fr' ? 'Retour' : 'Back'}
                        </Link>
                        <LanguageToggle />
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 relative z-10 w-full animate-fade-in-up">

                {/* Profile Header Card */}
                <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar Area */}
                        <div className="relative shrink-0">
                            <div className="w-32 h-32 rounded-full border-4 border-white/10 overflow-hidden bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex items-center justify-center relative z-10">
                                <span className="text-6xl">🧑‍🎓</span>
                            </div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-1 rounded-full text-xs font-bold shadow-lg border border-purple-400/30 whitespace-nowrap z-20">
                                Level {Math.floor(completedLessons.length / 5) + 1}
                            </div>
                            {/* Decorative glow behind avatar */}
                            <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full scale-150 z-0"></div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left pt-2 md:pt-4">
                            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                                {user?.email ? user.email.split('@')[0] : 'Language Learner'}
                            </h1>
                            <p className="text-slate-400 font-medium mb-6">
                                {user?.email || 'Logged in via demo'}
                            </p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <button onClick={signOut} className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-slate-300 transition-colors">
                                    Sign Out
                                </button>
                                <button className="px-5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-sm font-bold text-purple-400 transition-colors">
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">

                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-6xl">🎵</span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Songs Mastered</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-white">{completedMain}</span>
                            <span className="text-slate-500 font-medium mb-1">/ {totalMainSongs}</span>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-6xl">📚</span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Vocab Words</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">{totalVocab}</span>
                            <span className="text-slate-500 font-medium mb-1">learned</span>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-6xl">🔥</span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Current Streak</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">3</span>
                            <span className="text-slate-500 font-medium mb-1">days</span>
                        </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-6xl">🏆</span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Bonus Completed</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-purple-400">{completedBonusAmount}</span>
                            <span className="text-slate-500 font-medium mb-1">/ {totalBonus}</span>
                        </div>
                    </div>

                </div>

                {/* Course Progress Section */}
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-3xl p-8 mb-12 relative overflow-hidden">
                    {/* decorative circles */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 border-[40px] border-white/5 rounded-full"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full md:w-1/3 text-center md:text-left">
                            <h2 className="text-2xl font-black text-white mb-2">Course Progress</h2>
                            <p className="text-slate-400 text-sm">You are making great progress through the Spanish curriculum.</p>
                        </div>

                        <div className="w-full md:w-2/3">
                            <div className="flex justify-between text-sm font-bold mb-3">
                                <span className="text-pink-400">{progressPercentage}% Complete</span>
                                <span className="text-slate-500">{completedMain} of {totalMainSongs} songs</span>
                            </div>
                            <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-1000 ease-out relative"
                                    style={{ width: `${progressPercentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
}
