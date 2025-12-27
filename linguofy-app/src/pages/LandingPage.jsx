import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                    Linguofy
                </h1>
                <p className="text-2xl text-slate-300">
                    Master Spanish through Music.
                    <br />
                    <span className="text-lg text-slate-400">The structure of a lesson, the groove of a playlist.</span>
                </p>

                <div className="flex justify-center gap-4 mt-8">
                    <Link
                        to="/learn"
                        className="px-8 py-4 text-xl font-bold text-white bg-green-500 rounded-full hover:bg-green-400 transform transition hover:scale-105 shadow-lg shadow-green-500/20"
                    >
                        Start Listening
                    </Link>
                </div>
            </div>
        </div>
    );
}
