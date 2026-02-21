import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { srsApi } from '../services/api/srsApi';
import { useLanguage } from '../i18n';
import LanguageToggle from '../components/LanguageToggle';

export default function Statistics() {
    const { user } = useAuth();
    const { language } = useLanguage();

    const [srsItems, setSrsItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            if (user) {
                const items = await srsApi.getAllItems(user.id);
                setSrsItems(items || []);
            }
            setLoading(false);
        }
        loadStats();
    }, [user]);

    // Calculate metrics
    const totalWords = srsItems.length;

    // Intervals: Learning (<3 days), Familiar (3-21 days), Mastered (>21 days)
    const learning = srsItems.filter(item => item.interval < 3).length;
    const familiar = srsItems.filter(item => item.interval >= 3 && item.interval <= 21).length;
    const mastered = srsItems.filter(item => item.interval > 21).length;

    // Average ease factor
    const avgEaseFactor = totalWords > 0
        ? (srsItems.reduce((acc, curr) => acc + parseFloat(curr.ease_factor), 0) / totalWords).toFixed(2)
        : 2.50; // default SM-2 start

    // Recent activity: reviewed today
    const todayStr = new Date().toISOString().split('T')[0];
    const reviewedToday = srsItems.filter(item => {
        if (!item.last_reviewed_at) return false;
        return item.last_reviewed_at.startsWith(todayStr);
    }).length;

    if (loading) {
        return <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center text-white font-bold text-xl">Loading logic...</div>;
    }

    return (
        <div className="min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-purple-500/30 overflow-x-hidden pb-20">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none z-0 block">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] mix-blend-screen animate-blob"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
            </div>

            <header className="sticky top-0 z-40 bg-[#0A0F1C]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 mb-12">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/profile" className="flex items-center gap-2 group">
                        <span className="text-2xl group-hover:-translate-x-1 transition-transform origin-center">←</span>
                        <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            {language === 'fr' ? 'Retour au Profil' : 'Back to Profile'}
                        </span>
                    </Link>
                    <LanguageToggle />
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 relative z-10 w-full animate-fade-in-up">
                <h1 className="text-4xl font-black text-white mb-8">{language === 'fr' ? 'Statistiques d\'Apprentissage' : 'Learning Statistics'}</h1>

                {/* Top Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors shadow-lg">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-6xl">📚</span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">{language === 'fr' ? 'Vocabulaire Total' : 'Total Vocabulary'}</h3>
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-500">
                            {totalWords}
                        </div>
                        <p className="text-sm border-white/10 mt-2 pt-2 border-t text-slate-500">{language === 'fr' ? 'Dans la base SRS' : 'In SRS Database'}</p>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors shadow-lg">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-6xl">📈</span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">{language === 'fr' ? 'Mots Maîtrisés' : 'Mastered Words'}</h3>
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                            {mastered}
                        </div>
                        <p className="text-sm border-white/10 mt-2 pt-2 border-t text-slate-500">{language === 'fr' ? 'Intervalle > 21 jours' : 'Interval > 21 days'}</p>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors shadow-lg">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-6xl">🧠</span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">{language === 'fr' ? 'Santé de la Mémoire' : 'Memory Health'}</h3>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{avgEaseFactor}</span>
                            <span className="text-slate-500 mb-2 font-bold">x</span>
                        </div>
                        <p className="text-sm border-white/10 mt-2 pt-2 border-t text-slate-500">{language === 'fr' ? 'Facteur de Facilité Moyen' : 'Average Ease Factor'}</p>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:bg-white/[0.04] transition-colors shadow-lg">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-6xl">🔥</span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">{language === 'fr' ? 'Révisés Aujourd\'hui' : 'Reviewed Today'}</h3>
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                            {reviewedToday}
                        </div>
                        <p className="text-sm border-white/10 mt-2 pt-2 border-t text-slate-500">{language === 'fr' ? 'Mots pratiqués' : 'Words practiced'}</p>
                    </div>
                </div>

                {/* Mastery Breakdown */}
                <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-[2rem] p-8 mb-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute -bottom-32 -right-32 w-96 h-96 border-[40px] border-white/5 rounded-full z-0"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-white mb-6">{language === 'fr' ? 'Répartition de la Maîtrise SRS' : 'SRS Mastery Breakdown'}</h2>

                        <div className="space-y-6">
                            {/* Learning */}
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-blue-400">{language === 'fr' ? 'En Apprentissage (Nouveau / Difficile)' : 'Learning (New / Difficult)'}</span>
                                    <span className="text-slate-400">{learning} {language === 'fr' ? 'mots' : 'words'}</span>
                                </div>
                                <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/5">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${totalWords > 0 ? (learning / totalWords) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Familiar */}
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-purple-400">{language === 'fr' ? 'Familier (En train de s\'ancrer)' : 'Familiar (Growing Roots)'}</span>
                                    <span className="text-slate-400">{familiar} {language === 'fr' ? 'mots' : 'words'}</span>
                                </div>
                                <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/5">
                                    <div
                                        className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${totalWords > 0 ? (familiar / totalWords) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Mastered */}
                            <div>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-green-400">{language === 'fr' ? 'Maîtrisé (Mémoire à Long Terme)' : 'Mastered (Long-Term Memory)'}</span>
                                    <span className="text-slate-400">{mastered} {language === 'fr' ? 'mots' : 'words'}</span>
                                </div>
                                <div className="w-full h-4 bg-black/40 rounded-full overflow-hidden shadow-inner border border-white/5">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${totalWords > 0 ? (mastered / totalWords) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
