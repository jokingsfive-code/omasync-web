import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const location = useLocation();

  const [showSettings, setShowSettings] = useState(false);
  const [showHousekeeping, setShowHousekeeping] = useState(false);
  const [showFinance, setShowFinance] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (
      location.pathname === "/settings" ||
      location.pathname === "/users" ||
      location.pathname === "/channels" ||
      location.pathname === "/properties"
    ) {
      setShowSettings(true);
    }

    if (
      location.pathname === "/housekeeping" ||
      location.pathname === "/maintenance"
    ) {
      setShowHousekeeping(true);
    }

    if (location.pathname === "/finance" || location.pathname === "/expenses") {
      setShowFinance(true);
    }
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const isActive = (path) => location.pathname === path;

  const menuClass = (path) =>
    `px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive(path)
        ? "bg-[#0D3B66] text-white font-semibold"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  const submenuClass = (path) =>
    `px-4 py-2.5 rounded-xl transition-all duration-200 text-sm ${
      isActive(path)
        ? "bg-[#0D3B66] text-white font-semibold"
        : "text-gray-400 hover:bg-gray-800 hover:text-white"
    }`;

  const groupButtonClass = (active) =>
    `w-full text-left px-4 py-3 rounded-xl transition flex justify-between items-center ${
      active
        ? "bg-gray-800 text-white font-semibold"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  const closeMobile = () => setOpen(false);

  const menu = (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">OmaSync</h1>
        <p className="text-xs text-gray-400 mt-1">Smart Channel Manager</p>
      </div>

      <nav className="flex flex-col gap-2">
        <Link to="/dashboard" onClick={closeMobile} className={menuClass("/dashboard")}>
          Dashboard
        </Link>

        <Link to="/reservations" onClick={closeMobile} className={menuClass("/reservations")}>
          Reservations
        </Link>

        <Link to="/calendar" onClick={closeMobile} className={menuClass("/calendar")}>
          Calendar
        </Link>

        <button
          onClick={() => setShowHousekeeping(!showHousekeeping)}
          className={groupButtonClass(
            location.pathname === "/housekeeping" ||
              location.pathname === "/maintenance"
          )}
        >
          <span>Housekeeping</span>
          <span className="text-xs">{showHousekeeping ? "▲" : "▼"}</span>
        </button>

        {showHousekeeping && (
          <div className="ml-4 flex flex-col gap-2">
            <Link to="/housekeeping" onClick={closeMobile} className={submenuClass("/housekeeping")}>
              Cleaning
            </Link>

            <Link to="/maintenance" onClick={closeMobile} className={submenuClass("/maintenance")}>
              Maintenance
            </Link>
          </div>
        )}

        <Link to="/analytics" onClick={closeMobile} className={menuClass("/analytics")}>
          Analytics
        </Link>

        <button
          onClick={() => setShowFinance(!showFinance)}
          className={groupButtonClass(
            location.pathname === "/finance" || location.pathname === "/expenses"
          )}
        >
          <span>Finance</span>
          <span className="text-xs">{showFinance ? "▲" : "▼"}</span>
        </button>

        {showFinance && (
          <div className="ml-4 flex flex-col gap-2">
            <Link to="/finance" onClick={closeMobile} className={submenuClass("/finance")}>
              Overview
            </Link>

            <Link to="/expenses" onClick={closeMobile} className={submenuClass("/expenses")}>
              Expenses
            </Link>
          </div>
        )}

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={groupButtonClass(
            location.pathname === "/settings" ||
              location.pathname === "/users" ||
              location.pathname === "/channels" ||
              location.pathname === "/properties"
          )}
        >
          <span>Settings</span>
          <span className="text-xs">{showSettings ? "▲" : "▼"}</span>
        </button>

        {showSettings && (
          <div className="ml-4 flex flex-col gap-2">
            <Link to="/settings" onClick={closeMobile} className={submenuClass("/settings")}>
              General
            </Link>

            <Link to="/properties" onClick={closeMobile} className={submenuClass("/properties")}>
              Properties
            </Link>

            <Link to="/channels" onClick={closeMobile} className={submenuClass("/channels")}>
              Channels
            </Link>

            <Link to="/users" onClick={closeMobile} className={submenuClass("/users")}>
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

      <aside className="hidden md:block w-64 min-h-screen bg-[#0B1727] text-white p-5 border-r border-gray-800 shrink-0">
        {menu}
      </aside>

      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-64 bg-[#0B1727] text-white p-5 border-r border-gray-800 z-50 transform transition-transform duration-300 overflow-y-auto ${
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