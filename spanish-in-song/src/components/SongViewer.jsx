import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function SongViewer({ filePath }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!filePath) return;
    fetch(filePath)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load content");
        return res.text();
      })
      .then(setContent)
      .catch((err) => setError(err.message));
  }, [filePath]);

  if (!filePath) {
    return <p className="italic text-gray-600">Select a song to view its content.</p>;
  }

  if (error) {
    return <p className="text-red-600">Error: {error}</p>;
  }

  return (
    <article className="prose max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </article>
  );
} 