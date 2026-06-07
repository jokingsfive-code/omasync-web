import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

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

        <Link to="/settings" className={menuClass("/settings")}>
          Settings
        </Link>

        <div className="group">
  <Link to="/settings" className={menuClass("/settings")}>
    Settings
  </Link>

  <div className="hidden group-hover:flex flex-col ml-4 mt-2 gap-2">
    <Link to="/settings" className={menuClass("/settings")}>
      General Settings
    </Link>

    <Link to="/users" className={menuClass("/users")}>
      Users
    </Link>
  </div>
</div>

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