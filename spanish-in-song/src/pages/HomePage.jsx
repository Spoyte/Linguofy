import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section className="container mx-auto flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold text-sky-700 mb-4">
        Spanish in Song
      </h2>
      <p className="text-xl text-gray-700 max-w-2xl mb-8">
        Learn Spanish intuitively through original music and a carefully crafted curriculum.
      </p>
      <Link
        to="/curriculum"
        className="px-6 py-3 bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors"
      >
        Explore the Curriculum
      </Link>
    </section>
  );
} 