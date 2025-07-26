import { useState } from "react";

export default function ModuleAccordion({ moduleNumber, moduleName, songs = [], onSelectSong }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded mb-4 bg-white shadow-sm">
      <button
        className="w-full flex justify-between items-center p-4 text-left font-semibold text-sky-700 hover:bg-sky-50"
        onClick={() => setOpen(!open)}
      >
        <span>{`Module ${moduleNumber}: ${moduleName}`}</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <ul className="px-6 py-2 list-disc list-inside space-y-1">
          {songs.map((song) => (
            <li key={song.slug}>
              <button
                className="text-sky-600 hover:underline"
                onClick={() => onSelectSong(song)}
              >
                {song.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 