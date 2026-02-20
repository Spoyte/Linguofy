import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n';
import LanguageToggle from '../components/LanguageToggle';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
    const { t } = useLanguage();
    const { user, signIn, signUp, signOut } = useAuth();
    const navigate = useNavigate();

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await signUp(email, password);
                if (error) throw error;
                alert('Registration successful! You are now logged in.');
                setIsLoginModalOpen(false);
            } else {
                const { error } = await signIn(email, password);
                if (error) throw error;
                setIsLoginModalOpen(false);
                navigate('/learn');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0F1C] text-slate-200 overflow-x-hidden font-sans selection:bg-purple-500/30">
            {/* Animated Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden block">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px] mix-blend-screen animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full bg-pink-600/20 blur-[120px] mix-blend-screen animate-blob animation-delay-4000"></div>
            </div>

            {/* Navbar */}
            <nav className={`fixed w-full z-40 transition-all duration-300 pointer-events-auto ${scrolled ? 'bg-[#0A0F1C]/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">🎸</span>
                        <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                            Linguofy
                        </span>
                    </div>

                    <div className="flex items-center gap-4 md:gap-8">
                        <LanguageToggle />
                        {user ? (
                            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                                <span className="text-sm font-medium text-slate-300 hidden md:inline-block">{user.email}</span>
                                <button
                                    onClick={() => signOut()}
                                    className="text-sm font-bold text-pink-400 hover:text-pink-300 transition-colors"
                                >
                                    Log Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsLoginModalOpen(true)}
                                className="text-sm font-bold bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 text-white"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-medium mb-8 animate-fade-in-up">
                        <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse"></span>
                        AI-Powered Language Learning
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-8 animate-fade-in-up animation-delay-100">
                        Master languages through the power of <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
                            music and AI
                        </span>
                    </h1>

                    <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 animate-fade-in-up animation-delay-200 font-light leading-relaxed">
                        {t('landing.hero.title')} {t('landing.hero.subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up animation-delay-300">
                        <Link
                            to="/learn"
                            className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full hover:from-purple-500 hover:to-pink-500 transform transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(236,72,153,0.5)] active:scale-95"
                        >
                            {user ? 'Continue Learning' : t('landing.hero.cta')}
                        </Link>

                        {!user && (
                            <button
                                onClick={() => {
                                    setIsSignUp(true);
                                    setIsLoginModalOpen(true);
                                }}
                                className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-slate-300 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transform transition-all hover:scale-105 active:scale-95"
                            >
                                Create Free Account
                            </button>
                        )}
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up animation-delay-500">
                    <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-500 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="text-4xl mb-6">🎵</div>
                        <h3 className="text-2xl font-bold mb-3 text-white">Dynamic Audio</h3>
                        <p className="text-slate-400 leading-relaxed">Learn context and rhythm naturally through progressively complex AI-generated songs and mixed lyrics.</p>
                    </div>
                    <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-500 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="text-4xl mb-6">🧠</div>
                        <h3 className="text-2xl font-bold mb-3 text-white">Smart Evaluation</h3>
                        <p className="text-slate-400 leading-relaxed">Move beyond rigid tests. Our AI engine understands intent and provides contextual, semantic corrections.</p>
                    </div>
                    <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-500 backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="text-4xl mb-6">🗣️</div>
                        <h3 className="text-2xl font-bold mb-3 text-white">Real-Time Chat</h3>
                        <p className="text-slate-400 leading-relaxed">Practice speaking instantly with ultra-low latency AI voice models tailored to your exact proficiency level.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 mt-20 bg-black/50 backdrop-blur-md pb-6 pt-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm">
                    <p>© 2026 Linguofy Project. All rights reserved.</p>
                    <div className="mt-4 md:mt-0 space-x-6 flex items-center">
                        <Link to="/admin" className="hover:text-purple-400 transition-colors">Admin Dashboard</Link>
                        <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-purple-400 transition-colors">Terms</a>
                    </div>
                </div>
            </footer>

            {/* Premium Auth Modal */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-[#111827] border border-white/10 rounded-[2rem] p-8 md:p-12 max-w-md w-full shadow-[0_0_100px_rgba(168,85,247,0.15)] relative transform transition-all animate-scale-up">
                        <button
                            onClick={() => setIsLoginModalOpen(false)}
                            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full p-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {isSignUp ? 'Join Linguofy' : 'Welcome Back'}
                            </h2>
                            <p className="text-slate-400">
                                {isSignUp ? 'Start your musical language journey.' : 'Pick up where you left off.'}
                            </p>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-slate-400 text-sm font-medium">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-slate-400 text-sm font-medium">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-red-400 text-sm bg-red-400/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-2">
                                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-purple-500/25 mt-6 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading && <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-slate-400 text-sm">
                            {isSignUp ? 'Already have an account?' : 'New to Linguofy?'}
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="ml-2 text-purple-400 hover:text-purple-300 font-bold transition-colors"
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up Free'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
