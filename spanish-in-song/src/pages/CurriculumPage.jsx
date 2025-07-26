import { useState } from "react";
import ModuleAccordion from "../components/ModuleAccordion.jsx";
import SongViewer from "../components/SongViewer.jsx";

const curriculum = [
  {
    number: 1,
    name: "Premiers Contacts et l'Essence de l'Être",
    songs: [
      { slug: "song-1-1.md", title: "Hola, ¿qué tal?" },
      { slug: "song-1-2.md", title: "Yo soy Léo, y ella es Sofía" },
    ],
  },
  {
    number: 2,
    name: "Mon Quotidien en Deux Langues",
    songs: [
      { slug: "song-2-1.md", title: "Mi Rutina Lo-fi" },
      { slug: "song-2-2.md", title: "La Mesa Familiar" },
      { slug: "song-2-3.md", title: "A mí, me gustan las tapas" },
    ],
  },
  {
    number: 3,
    name: "L'Aventure du Voyage",
    songs: [
      { slug: "song-3-1.md", title: "¿Por aquí para ir a la playa?" },
      { slug: "song-3-2.md", title: "Una Habitación con Vistas" },
      { slug: "song-3-3.md", title: "Mi Viaje a Sevilla" },
    ],
  },
  {
    number: 4,
    name: "Cœur, Esprit et Faux Amis",
    songs: [
      { slug: "song-4-1.md", title: "No Estoy Embarazada, ¡Qué Vergüenza!" },
      { slug: "song-4-2.md", title: "Pienso que..." },
      { slug: "song-4-3.md", title: "Para ti, por mí" },
    ],
  },
  {
    number: 5,
    name: "Chroniques du Passé",
    songs: [
      { slug: "song-5-1.md", title: "La Fiesta de Anoche" },
      { slug: "song-5-2.md", title: "Cuando Éramos Niños" },
      { slug: "song-5-3.md", title: "Una Historia que Contar" },
    ],
  },
  {
    number: 6,
    name: "Le Monde des Possibles et des Souhaits",
    songs: [
      { slug: "song-6-1.md", title: "Ojalá" },
      { slug: "song-6-2.md", title: "Quiero que Vengas" },
      { slug: "song-6-3.md", title: "Si yo fuera..." },
    ],
  },
];

export default function CurriculumPage() {
  const [version, setVersion] = useState("en-es");
  const [selectedSong, setSelectedSong] = useState(null);

  const toggleVersion = () => {
    setVersion((prev) => (prev === "en-es" ? "es-only" : "en-es"));
    setSelectedSong(null);
  };

  return (
    <section className="container mx-auto py-10 flex flex-col md:flex-row gap-8">
      <div className="md:w-1/2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-sky-700">Curriculum</h2>
          <button
            onClick={toggleVersion}
            className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
          >
            {version === "en-es" ? "Versión en Español" : "Original Version (EN/ES)"}
          </button>
        </div>
        {curriculum.map((module) => (
          <ModuleAccordion
            key={module.number}
            moduleNumber={module.number}
            moduleName={module.name}
            songs={module.songs}
            onSelectSong={(song) =>
              setSelectedSong({
                ...song,
                path: `/curriculum/${version}/module-${module.number}/${song.slug}`,
              })
            }
          />
        ))}
      </div>
      <div className="md:w-1/2 bg-white rounded shadow p-4">
        {selectedSong ? (
          <>
            <h3 className="text-xl font-semibold mb-4 text-sky-700">
              {selectedSong.title}
            </h3>
            <SongViewer filePath={selectedSong.path} />
          </>
        ) : (
          <p className="italic text-gray-600">Select a song from the list to read its content.</p>
        )}
      </div>
    </section>
  );
} 