import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CourseMap from './pages/CourseMap';
import SongPlayer from './pages/SongPlayer';
import LessonView from './pages/LessonView';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import SongManager from './pages/admin/SongManager';
import SongEditor from './pages/admin/SongEditor';
import PromptManager from './pages/admin/PromptManager';
import ConfigManager from './pages/admin/ConfigManager';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/learn" element={<CourseMap />} />
                    <Route path="/play/:id" element={<SongPlayer />} />
                    <Route path="/lesson/:id" element={<LessonView />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLogin />} />
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="songs" element={<SongManager />} />
                        <Route path="songs/:id" element={<SongEditor />} />
                        <Route path="exercises" element={<div className="text-white p-8">Exercise Manager (Coming Soon)</div>} />
                        <Route path="prompts" element={<PromptManager />} />
                        <Route path="config" element={<ConfigManager />} />
                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
