import { Outlet } from 'react-router-dom';
import MiniPlayer from './MiniPlayer';

export default function MainLayout() {
    return (
        <div className="flex flex-col min-h-screen relative pb-24">
            <Outlet />
            <MiniPlayer />
        </div>
    );
}
