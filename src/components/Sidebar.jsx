import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-8">
        OmaSync
      </h1>

      <nav className="flex flex-col gap-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/properties">Properties</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/finance">Finance</Link>
        <Link to="/settings">Settings</Link>
      </nav>
    </div>
  );
}