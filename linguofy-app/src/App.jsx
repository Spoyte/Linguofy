import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CourseMap from './pages/CourseMap';
import SongPlayer from './pages/SongPlayer';
import LessonView from './pages/LessonView';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/learn" element={<CourseMap />} />
                    <Route path="/play/:id" element={<SongPlayer />} />
                    <Route path="/lesson/:id" element={<LessonView />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
