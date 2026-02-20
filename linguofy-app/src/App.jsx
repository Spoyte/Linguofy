import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AudioProvider } from './contexts/AudioContext';
import LandingPage from './pages/LandingPage';
import CourseMap from './pages/CourseMap';
import SongPlayer from './pages/SongPlayer';
import LessonView from './pages/LessonView';
import VocabularyReview from './pages/VocabularyReview';
import BonusLessonView from './pages/BonusLessonView';
import ConversationView from './pages/ConversationView';
import Profile from './pages/Profile';
import MiniGames from './pages/MiniGames';
import WordMatch from './games/WordMatch';
import LyricScramble from './games/LyricScramble';
import ColorPop from './games/ColorPop';
import VocabRacer from './games/VocabRacer';
import AudioExplorer from './games/AudioExplorer';
import GrammarSnake from './games/GrammarSnake';
import SwipeSort from './games/SwipeSort';
import WordCatcher from './games/WordCatcher';
import AuthGuard from './components/AuthGuard';
import MainLayout from './components/MainLayout';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import SongManager from './pages/admin/SongManager';
import SongEditor from './pages/admin/SongEditor';
import ExerciseList from './pages/admin/ExerciseList';
import ExerciseEditor from './pages/admin/ExerciseEditor';
import ExerciseManager from './pages/admin/ExerciseManager';
import PromptManager from './pages/admin/PromptManager';
import ConfigManager from './pages/admin/ConfigManager';

function App() {
    return (
        <Router>
            <AudioProvider>
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 font-sans">
                    <Routes>
                        <Route path="/" element={<LandingPage />} />

                        {/* Protected User Routes wrapped in MainLayout (with MiniPlayer) */}
                        <Route element={<AuthGuard><MainLayout /></AuthGuard>}>
                            <Route path="/learn" element={<CourseMap />} />
                            <Route path="/vocabulary" element={<VocabularyReview />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/games" element={<MiniGames />} />
                            <Route path="/games/word-match" element={<WordMatch />} />
                            <Route path="/games/lyric-scramble" element={<LyricScramble />} />
                            <Route path="/games/color-pop" element={<ColorPop />} />
                            <Route path="/games/vocab-racer" element={<VocabRacer />} />
                            <Route path="/games/audio-explorer" element={<AudioExplorer />} />
                            <Route path="/games/grammar-snake" element={<GrammarSnake />} />
                            <Route path="/games/swipe-sort" element={<SwipeSort />} />
                            <Route path="/games/word-catcher" element={<WordCatcher />} />
                            <Route path="/lesson/:id" element={<LessonView />} />
                            <Route path="/play/:id" element={<SongPlayer />} />
                            <Route path="/bonus/:type/:id" element={<BonusLessonView />} />
                        </Route>

                        {/* Standalone Protected Routes (No MiniPlayer) */}
                        <Route element={<AuthGuard />}>
                            <Route path="/practice/conversation" element={<ConversationView />} />
                        </Route>

                        {/* Admin Routes */}
                        <Route path="/admin" element={<AdminLogin />} />
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="songs" element={<SongManager />} />
                            <Route path="songs/:id" element={<SongEditor />} />
                            <Route path="songs/:id/exercises" element={<ExerciseList />} />
                            <Route path="songs/:id/exercises/:exId" element={<ExerciseEditor />} />
                            <Route path="exercises" element={<ExerciseManager />} />
                            <Route path="prompts" element={<PromptManager />} />
                            <Route path="config" element={<ConfigManager />} />
                        </Route>
                    </Routes>
                </div>
            </AudioProvider>
        </Router >
    );
}

export default App;
