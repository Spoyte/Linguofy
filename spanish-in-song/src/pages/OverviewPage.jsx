import SongViewer from "../components/SongViewer.jsx";

export default function OverviewPage() {
  return (
    <section className="container mx-auto py-10 prose max-w-none">
      <SongViewer filePath="/curriculum/modules-overview.md" />
    </section>
  );
} 