import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
import LanguageToggle from '../components/LanguageToggle';

const GAMES = [
    {
        id: 'color-pop',
        title: 'Color Pop',
        title_fr: 'Éclate Couleurs',
        desc: 'Pop balloons with matching Spanish words!',
        desc_fr: 'Éclate les ballons avec les bons mots espagnols !',
        icon: '🎈',
        color: 'from-blue-400 to-indigo-500',
        ages: ['kids', 'all'],
        status: 'coming_soon' // 'playable', 'coming_soon'
    },
    {
        id: 'word-match',
        title: 'Word Matcher',
        title_fr: 'Associe les Mots',
        desc: 'Classic memory cards with your vocab words.',
        desc_fr: 'Cartes mémoire classiques avec tes mots de vocabulaire.',
        icon: '🎴',
        color: 'from-orange-400 to-red-500',
        ages: ['kids', 'teens', 'adults', 'all'],
        status: 'playable'
    },
    {
        id: 'lyric-scramble',
        title: 'Lyric Scramble',
        title_fr: 'Paroles en Vrac',
        desc: 'Reconstruct sentences from songs you know.',
        desc_fr: 'Reconstruis des phrases de chansons que tu connais.',
        icon: '🧩',
        color: 'from-emerald-400 to-teal-500',
        ages: ['teens', 'adults', 'all'],
        status: 'playable'
    }
];

export default function MiniGames() {
    const { language } = useLanguage();
    const [ageFilter, setAgeFilter] = useState('all');

    const filteredGames = GAMES.filter(game => game.ages.includes(ageFilter));

    return (
        <div className="min-h-screen bg-[#0A0F1C] text-slate-200 font-sans selection:bg-purple-500/30 overflow-x-hidden pb-20 relative">

            {/* Animated Arcade Background */}
            <div className="fixed inset-0 pointer-events-none z-0 block opacity-50">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[100px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-pink-600/10 blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgogICAgPHBhdGggZD0iTTYwIDBMMCAwTDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] opacity-50"></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 bg-[#0A0F1C]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 mb-12">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/learn" className="flex items-center gap-2 group">
                        <span className="text-2xl group-hover:scale-110 transition-transform origin-center">🎸</span>
                        <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
                            Linguofy Arcade
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/learn" className="px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors hidden sm:block">
                            {language === 'fr' ? 'Retour au cours' : 'Back to Course'}
                        </Link>
                        <LanguageToggle />
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 relative z-10 w-full animate-fade-in-up">

                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500">
                        {language === 'fr' ? "Salles d'Arcade" : "Mini Games Hub"}
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        {language === 'fr'
                            ? "Pratique ce que tu as appris avec des mini-jeux amusants !"
                            : "Practice what you've learned with fun, bite-sized mini-games!"}
                    </p>
                </div>

                {/* Age Filter Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex bg-white/5 p-1 rounded-full border border-white/10 shadow-inner">
                        <button
                            onClick={() => setAgeFilter('all')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all
                                ${ageFilter === 'all' ? 'bg-white text-black shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {language === 'fr' ? 'Tout le monde' : 'All Ages'}
                        </button>
                        <button
                            onClick={() => setAgeFilter('kids')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all
                                ${ageFilter === 'kids' ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {language === 'fr' ? 'Enfants' : 'Kids'}
                        </button>
                        <button
                            onClick={() => setAgeFilter('teens')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all
                                ${ageFilter === 'teens' ? 'bg-purple-400 text-black shadow-[0_0_15px_rgba(192,132,252,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {language === 'fr' ? 'Ados' : 'Teens'}
                        </button>
                        <button
                            onClick={() => setAgeFilter('adults')}
                            className={`px-6 py-2 rounded-full text-sm font-bold transition-all
                                ${ageFilter === 'adults' ? 'bg-rose-400 text-black shadow-[0_0_15px_rgba(251,113,133,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {language === 'fr' ? 'Adultes' : 'Adults'}
                        </button>
                    </div>
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGames.map(game => (
                        <div key={game.id} className="group relative bg-white/[0.02] border border-white/10 rounded-3xl p-6 hover:bg-white/[0.05] transition-all hover:scale-[1.02] hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:border-white/20 overflow-hidden flex flex-col h-full">

                            {/* Decorative background glow based on game color */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${game.color} opacity-10 rounded-full blur-3xl transform group-hover:scale-150 transition-transform duration-700`}></div>

                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl mb-6 shadow-lg shadow-black/20 z-10 relative`}>
                                {game.icon}
                            </div>

                            <h3 className="text-2xl font-black text-white mb-2 z-10 relative">
                                {language === 'fr' ? game.title_fr : game.title}
                            </h3>

                            <p className="text-slate-400 text-sm mb-8 z-10 relative grow">
                                {language === 'fr' ? game.desc_fr : game.desc}
                            </p>

                            <div className="mt-auto z-10 relative">
                                {game.status === 'playable' ? (
                                    <Link
                                        to={`/games/${game.id}`}
                                        className={`block w-full text-center py-3 rounded-xl bg-gradient-to-r ${game.color} text-white font-bold tracking-wide shadow-md hover:brightness-110 active:scale-95 transition-all`}
                                    >
                                        {language === 'fr' ? 'Jouer' : 'Play Now'}
                                    </Link>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full py-3 rounded-xl bg-slate-800/50 text-slate-500 font-bold tracking-wide border border-white/5 backdrop-blur-sm cursor-not-allowed"
                                    >
                                        {language === 'fr' ? 'Bientôt disponible' : 'Coming Soon'}
                                    </button>
                                )}
                            </div>

                        </div>
                    ))}

                    {filteredGames.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-500">
                            {language === 'fr' ? 'Aucun jeu trouvé pour cet âge.' : 'No games found for this age group yet.'}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
