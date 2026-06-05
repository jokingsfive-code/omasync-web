import { Link } from "react-router-dom";

export default function Sidebar() {
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    alert("Logout berjaya");

    window.location.href = "/";
  };

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

        <hr className="my-4 border-gray-700" />

        <button
          onClick={logout}
          className="text-left text-red-400 hover:text-red-300"
        >
          Logout
        </button>
      </nav>
    </div>
  );
}