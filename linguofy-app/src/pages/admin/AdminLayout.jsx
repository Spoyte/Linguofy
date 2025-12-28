import React, { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const isAdmin = localStorage.getItem('isAdmin');
        if (!isAdmin) {
            navigate('/admin');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('isAdmin');
        navigate('/admin');
    };

    const NavItem = ({ to, label, icon }) => {
        const isActive = location.pathname.startsWith(to);
        return (
            <Link
                to={to}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
            >
                <span className="text-xl">{icon}</span>
                <span className="font-medium">{label}</span>
            </Link>
        );
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-purple-500">
                        Linguofy Admin
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <NavItem to="/admin/dashboard" label="Overview" icon="📊" />
                    <NavItem to="/admin/songs" label="Songs" icon="🎵" />
                    <NavItem to="/admin/exercises" label="Exercises" icon="✍️" />
                    <NavItem to="/admin/prompts" label="Prompts" icon="💡" />
                    <NavItem to="/admin/config" label="Configuration" icon="⚙️" />
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-left text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <span>🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-950 p-8">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
