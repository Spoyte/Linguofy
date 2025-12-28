export const modules = [
    {
        id: 1,
        title: "Unit 1: Introductions",
        desc: "Greetings, Who am I?",
        songs: [
            { id: "1-1", title: "Hola (Hello)", type: "mixed", status: "published" },
            { id: "1-2", title: "Quién Soy Yo (I Am)", type: "mixed", status: "published" },
            { id: "1-3", title: "¿Cómo Estás? (How are you)", type: "chill", status: "published" },
        ]
    },
    {
        id: 2,
        title: "Unit 2: Basic Needs",
        desc: "Numbers, Ordering, Existence",
        songs: [
            { id: "2-1", title: "Uno, Dos, Tres (Numbers)", type: "rap", status: "audio_missing" },
            { id: "2-2", title: "¿Qué Hay? (Is there?)", type: "jazz", status: "audio_missing" },
            { id: "2-3", title: "Yo Quiero (I Want)", type: "pop", status: "audio_missing" },
        ]
    },
    {
        id: 3,
        title: "Unit 3: Family & Description",
        desc: "Family, Adjectives, House",
        songs: [
            { id: "3-1", title: "Mi Familia (Tener)", type: "ballad", status: "audio_missing" },
            { id: "3-2", title: "Ella es Alta (Description)", type: "salsa", status: "audio_missing" },
            { id: "3-3", title: "En Mi Casa (House)", type: "cumbia", status: "audio_missing" },
        ]
    },
    {
        id: 4,
        title: "Unit 4: Routine & Time",
        desc: "Time, Reflexives, Days",
        songs: [
            { id: "4-1", title: "¿Qué Hora Es? (Time)", type: "pop", status: "audio_missing" },
            { id: "4-2", title: "Mi Rutina (Reflexives)", type: "ska", status: "audio_missing" },
            { id: "4-3", title: "El Fin de Semana (Days)", type: "disco", status: "audio_missing" },
        ]
    },
    {
        id: 5,
        title: "Unit 5: Likes & Hobbies",
        desc: "Gustar, Sports, Clothes",
        songs: [
            { id: "5-1", title: "A Mí Me Gusta (Likes)", type: "rnb", status: "audio_missing" },
            { id: "5-2", title: "Juego al Fútbol (Sports)", type: "rock", status: "audio_missing" },
            { id: "5-3", title: "La Moda (Clothes)", type: "house", status: "audio_missing" },
        ]
    },
    {
        id: 6,
        title: "Unit 6: Travel & Future (A2)",
        desc: "Ir a, Directions, Transport",
        songs: [
            { id: "6-1", title: "Voy a Viajar (Future)", type: "reggaeton", status: "audio_missing" },
            { id: "6-2", title: "¿Dónde Está? (Directions)", type: "lofi", status: "audio_missing" },
            { id: "6-3", title: "En el Tren (Transport)", type: "electro", status: "audio_missing" },
        ]
    },
    {
        id: 7,
        title: "Unit 7: The Past (A2)",
        desc: "Preterite Tense, Yesterday",
        songs: [
            { id: "7-1", title: "Ayer (Preterite AR)", type: "rock", status: "audio_missing" },
            { id: "7-2", title: "¿Qué Comiste? (Preterite ER/IR)", type: "jazz", status: "audio_missing" },
            { id: "7-3", title: "El Mejor Día (Irregulars)", type: "pop", status: "audio_missing" },
        ]
    },
    {
        id: 8,
        title: "Unit 8: Health & Feelings (A2)",
        desc: "Doler, Body, Emotions",
        songs: [
            { id: "8-1", title: "¡Ay! Me Duele (Pain)", type: "tango", status: "audio_missing" },
            { id: "8-2", title: "Mueve el Cuerpo (Body)", type: "edm", status: "audio_missing" },
            { id: "8-3", title: "Estoy Nervioso (Feelings)", type: "punk", status: "audio_missing" },
        ]
    }
];

// Bonus content modules - different content types
export const bonusModules = [
    {
        id: "grammar",
        title: "📖 Grammar Tips",
        desc: "Quick grammar explanations",
        icon: "📖",
        lessons: [
            { id: "grammar-1", title: "Ser vs Estar", type: "grammar", status: "published" },
            { id: "grammar-2", title: "Gender & Articles", type: "grammar", status: "published" },
            { id: "grammar-3", title: "Verb Conjugation Basics", type: "grammar", status: "published" },
        ]
    },
    {
        id: "dialogues",
        title: "🗣️ Dialogues",
        desc: "Real conversation practice",
        icon: "🗣️",
        lessons: [
            { id: "dialogue-1", title: "At the Café", type: "dialogue", status: "published" },
            { id: "dialogue-2", title: "Asking for Directions", type: "dialogue", status: "published" },
            { id: "dialogue-3", title: "At the Market", type: "dialogue", status: "published" },
        ]
    },
    {
        id: "culture",
        title: "🌍 Culture",
        desc: "Spanish-speaking world",
        icon: "🌍",
        lessons: [
            { id: "culture-1", title: "Spanish-Speaking Countries", type: "culture", status: "published" },
            { id: "culture-2", title: "Food & Traditions", type: "culture", status: "published" },
            { id: "culture-3", title: "Holidays & Celebrations", type: "culture", status: "published" },
        ]
    }
];
