import { NavLink } from "react-router-dom";

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded hover:bg-sky-600 hover:text-white transition-colors ${
      isActive ? "bg-sky-600 text-white" : "text-sky-700"
    }`;

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-sky-700">Spanish in Song</h1>
        <ul className="flex gap-2">
          <li>
            <NavLink to="/" className={linkClass} end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/overview" className={linkClass}>
              Overview
            </NavLink>
          </li>
          <li>
            <NavLink to="/curriculum" className={linkClass}>
              Curriculum
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
} 