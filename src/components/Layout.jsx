import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-200">

      {/* TOP BAR MOBILE */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 text-white p-4 flex justify-between items-center z-50">
        <h1 className="font-bold">OmaSync</h1>
        <button onClick={() => setOpen(!open)}>
          ☰
        </button>
      </div>

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:static z-40 bg-slate-900
          w-64 h-full text-white
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <Sidebar />
      </div>

      {/* OVERLAY MOBILE */}
      {open && (
        <div
          className="fixed inset-0 bg-black opacity-50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* CONTENT */}
      <div className="flex-1 pt-16 md:pt-0 md:ml-64">
        {children}
      </div>

    </div>
  );
}