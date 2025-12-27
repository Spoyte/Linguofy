import { Link } from 'react-router-dom';

const modules = [
    {
        id: 1,
        title: "Unit 1: Introductions",
        desc: "Greetings, Who am I?",
        songs: [
            { id: "1-1", title: "Hola (Hello)", type: "mixed", completed: true },
            { id: "1-2", title: "Quién Soy Yo (I Am)", type: "mixed", completed: false },
            { id: "1-3", title: "¿Cómo Estás? (How are you)", type: "chill", completed: false },
        ]
    },
    {
        id: 2,
        title: "Unit 2: Basic Needs",
        desc: "Numbers, Ordering, Existence",
        songs: [
            { id: "2-1", title: "Uno, Dos, Tres (Numbers)", type: "rap", completed: false },
            { id: "2-2", title: "¿Qué Hay? (Is there?)", type: "jazz", completed: false },
            { id: "2:3", title: "Yo Quiero (I Want)", type: "pop", completed: false },
        ]
    },
    {
        id: 3,
        title: "Unit 3: Family & Description",
        desc: "Family, Adjectives, House",
        songs: [
            { id: "3-1", title: "Mi Familia (Tener)", type: "ballad", completed: false },
            { id: "3-2", title: "Ella es Alta (Description)", type: "salsa", completed: false },
            { id: "3-3", title: "En Mi Casa (House)", type: "cumbia", completed: false },
        ]
    },
    {
        id: 4,
        title: "Unit 4: Routine & Time",
        desc: "Time, Reflexives, Days",
        songs: [
            { id: "4-1", title: "¿Qué Hora Es? (Time)", type: "pop", completed: false },
            { id: "4-2", title: "Mi Rutina (Reflexives)", type: "ska", completed: false },
            { id: "4-3", title: "El Fin de Semana (Days)", type: "disco", completed: false },
        ]
    },
    {
        id: 5,
        title: "Unit 5: Likes & Hobbies",
        desc: "Gustar, Sports, Clothes",
        songs: [
            { id: "5-1", title: "A Mí Me Gusta (Likes)", type: "rnb", completed: false },
            { id: "5-2", title: "Juego al Fútbol (Sports)", type: "rock", completed: false },
            { id: "5-3", title: "La Moda (Clothes)", type: "house", completed: false },
        ]
    },
    {
        id: 6,
        title: "Unit 6: Travel & Future (A2)",
        desc: "Ir a, Directions, Transport",
        songs: [
            { id: "6-1", title: "Voy a Viajar (Future)", type: "reggaeton", completed: false },
            { id: "6-2", title: "¿Dónde Está? (Directions)", type: "lofi", completed: false },
            { id: "6-3", title: "En el Tren (Transport)", type: "electro", completed: false },
        ]
    },
    {
        id: 7,
        title: "Unit 7: The Past (A2)",
        desc: "Preterite Tense, Yesterday",
        songs: [
            { id: "7-1", title: "Ayer (Preterite AR)", type: "rock", completed: false },
            { id: "7-2", title: "¿Qué Comiste? (Preterite ER/IR)", type: "jazz", completed: false },
            { id: "7-3", title: "El Mejor Día (Irregulars)", type: "pop", completed: false },
        ]
    },
    {
        id: 8,
        title: "Unit 8: Health & Feelings (A2)",
        desc: "Doler, Body, Emotions",
        songs: [
            { id: "8-1", title: "¡Ay! Me Duele (Pain)", type: "tango", completed: false },
            { id: "8-2", title: "Mueve el Cuerpo (Body)", type: "edm", completed: false },
            { id: "8-3", title: "Estoy Nervioso (Feelings)", type: "punk", completed: false },
        ]
    }
];

export default function CourseMap() {
    return (
        <div className="min-h-screen p-8 text-white">
            <header className="flex justify-between items-center mb-12">
                <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
                    Linguofy
                </Link>
                <div className="text-sm font-medium text-slate-400">
                    A1 Beginner
                </div>
            </header>

            <div className="max-w-2xl mx-auto space-y-12">
                {modules.map((mod) => (
                    <div key={mod.id} className="relative pl-8 border-l-2 border-slate-700">
                        <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-slate-700 border-4 border-slate-900" />

                        <div className="mb-6">
                            <h2 className="text-3xl font-bold mb-2">{mod.title}</h2>
                            <p className="text-slate-400">{mod.desc}</p>
                        </div>

                        <div className="grid gap-4">
                            {mod.songs.map((song) => (
                                <div
                                    key={song.id}
                                    className="block p-4 rounded-xl border border-slate-800 transition-all hover:border-purple-500 bg-slate-800/50 backdrop-blur-sm group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-lg group-hover:text-purple-400 transition-colors">
                                                {song.title}
                                            </h3>
                                            <span className="text-xs uppercase tracking-wider text-slate-500 bg-slate-900/50 px-2 py-1 rounded">
                                                {song.type}
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-600 shadow-lg shadow-purple-600/20 group-hover:scale-110 transition-transform">
                                            <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {/* Primary Action: Lesson */}
                                        <Link
                                            to={`/lesson/${song.id}`}
                                            className="flex-1 py-2 bg-green-500 hover:bg-green-400 text-slate-900 font-bold rounded-lg text-center transition shadow-lg shadow-green-500/10"
                                        >
                                            Start Lesson
                                        </Link>

                                        {/* Secondary Action: Listen */}
                                        <Link
                                            to={`/play/${song.id}`}
                                            className="w-12 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                                            title="Listen Only"
                                        >
                                            🎵
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
