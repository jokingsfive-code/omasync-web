import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const menuClass = (path) =>
    `px-4 py-3 rounded-xl transition-all duration-200 ${
      location.pathname === path
        ? "bg-[#0D3B66] text-white font-semibold"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <div className="w-64 min-h-screen bg-[#0B1727] text-white p-5 border-r border-gray-800">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">OmaSync</h1>
        <p className="text-xs text-gray-400 mt-1">Smart Channel Manager</p>
      </div>

      <nav className="flex flex-col gap-2">
        <Link to="/dashboard" className={menuClass("/dashboard")}>
          Dashboard
        </Link>

        <Link to="/properties" className={menuClass("/properties")}>
          Properties
        </Link>

        <Link to="/reservations" className={menuClass("/reservations")}>
          Reservations
        </Link>

        <Link to="/calendar" className={menuClass("/calendar")}>
          Calendar
        </Link>

        <Link to="/housekeeping" className={menuClass("/housekeeping")}>
          Housekeeping
        </Link>

        <Link to="/maintenance" className={menuClass("/maintenance")}>
          Maintenance
        </Link>

        <Link to="/channels" className={menuClass("/channels")}>
          Channels
        </Link>

        <Link to="/analytics" className={menuClass("/analytics")}>
          Analytics
        </Link>

        <Link to="/finance" className={menuClass("/finance")}>
          Finance
        </Link>

        <Link to="/expenses" className={menuClass("/expenses")}>
          Expenses
        </Link>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full text-left px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition flex justify-between items-center"
        >
          <span>Settings</span>
          <span className="text-xs">{showSettings ? "▲" : "▼"}</span>
        </button>

        {showSettings && (
          <div className="ml-4 flex flex-col gap-2">
            <Link to="/settings" className={menuClass("/settings")}>
              General
            </Link>

            <Link to="/users" className={menuClass("/users")}>
              Users
            </Link>
          </div>
        )}

        <hr className="my-4 border-gray-700" />

        <button
          onClick={logout}
          className="text-left px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
        >
          Logout
        </button>
      </nav>
    </div>
  );
}