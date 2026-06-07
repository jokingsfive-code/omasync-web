import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [open, setOpen] = useState(false);

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

  const menu = (
    <>
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">OmaSync</h1>
        <p className="text-xs text-gray-400 mt-1">Smart Channel Manager</p>
      </div>

      <nav className="flex flex-col gap-2">
        <Link to="/dashboard" onClick={() => setOpen(false)} className={menuClass("/dashboard")}>Dashboard</Link>
        <Link to="/properties" onClick={() => setOpen(false)} className={menuClass("/properties")}>Properties</Link>
        <Link to="/reservations" onClick={() => setOpen(false)} className={menuClass("/reservations")}>Reservations</Link>
        <Link to="/calendar" onClick={() => setOpen(false)} className={menuClass("/calendar")}>Calendar</Link>
        <Link to="/housekeeping" onClick={() => setOpen(false)} className={menuClass("/housekeeping")}>Housekeeping</Link>
        <Link to="/maintenance" onClick={() => setOpen(false)} className={menuClass("/maintenance")}>Maintenance</Link>
        <Link to="/channels" onClick={() => setOpen(false)} className={menuClass("/channels")}>Channels</Link>
        <Link to="/analytics" onClick={() => setOpen(false)} className={menuClass("/analytics")}>Analytics</Link>
        <Link to="/finance" onClick={() => setOpen(false)} className={menuClass("/finance")}>Finance</Link>
        <Link to="/expenses" onClick={() => setOpen(false)} className={menuClass("/expenses")}>Expenses</Link>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full text-left px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800 hover:text-white transition flex justify-between items-center"
        >
          <span>Settings</span>
          <span className="text-xs">{showSettings ? "▲" : "▼"}</span>
        </button>

        {showSettings && (
          <div className="ml-4 flex flex-col gap-2">
            <Link to="/settings" onClick={() => setOpen(false)} className={menuClass("/settings")}>General</Link>
            <Link to="/users" onClick={() => setOpen(false)} className={menuClass("/users")}>Users</Link>
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
    </>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-[#0D3B66] text-white w-11 h-11 rounded-xl shadow-lg text-2xl"
      >
        ☰
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-40"
        />
      )}

      <aside className="hidden md:block w-64 min-h-screen bg-[#0B1727] text-white p-5 border-r border-gray-800">
        {menu}
      </aside>

      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-[#0B1727] text-white p-5 border-r border-gray-800 z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-white text-2xl"
        >
          ×
        </button>

        {menu}
      </aside>
    </>
  );
}