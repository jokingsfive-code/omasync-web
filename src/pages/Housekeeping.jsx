import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  Sparkles,
  Clock,
  Loader2,
  CheckCircle2,
  Home,
  CalendarDays,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import api from "../api/axios";

export default function Housekeeping() {
  const [tasks, setTasks] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.tasks)) return payload.tasks;
    if (Array.isArray(payload?.properties)) return payload.properties;
    return [];
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [taskRes, propertyRes] = await Promise.all([
        api.get("/housekeeping"),
        api.get("/properties"),
      ]);

      setTasks(normalizeArray(taskRes.data));
      setProperties(normalizeArray(propertyRes.data));
    } catch (err) {
      console.error("Housekeeping fetch error:", err);
      showToast("error", "Failed to load housekeeping data.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/housekeeping/${id}`, { status });
      showToast("success", `Task moved to ${status}.`);
      fetchData();
    } catch (err) {
      console.error("Housekeeping update error:", err);
      showToast("error", "Failed to update task status.");
    }
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(
      (p) => Number(p.id) === Number(propertyId)
    );

    return property ? property.name || property.property_name : "-";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(String(dateString).slice(0, 10));

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const pending = tasks.filter((t) => t.status === "Pending");
  const progress = tasks.filter((t) => t.status === "In Progress");
  const ready = tasks.filter((t) => t.status === "Ready");

  const stats = [
    {
      label: "Pending",
      value: pending.length,
      icon: Clock,
      className: "bg-gradient-to-br from-orange-500 to-red-600",
    },
    {
      label: "In Progress",
      value: progress.length,
      icon: Loader2,
      className: "bg-gradient-to-br from-blue-500 to-indigo-700",
    },
    {
      label: "Ready",
      value: ready.length,
      icon: CheckCircle2,
      className: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    },
  ];

  const statusStyles = {
    Pending: {
      color: "#EF4444",
      badge: "bg-red-100 text-red-700",
      card: "border-red-100",
    },
    "In Progress": {
      color: "#3B82F6",
      badge: "bg-blue-100 text-blue-700",
      card: "border-blue-100",
    },
    Ready: {
      color: "#10B981",
      badge: "bg-emerald-100 text-emerald-700",
      card: "border-emerald-100",
    },
  };

  const TaskCard = ({ task, nextStatus }) => {
    const style = statusStyles[task.status] || statusStyles.Pending;

    return (
      <div
        className={`bg-white rounded-[22px] sm:rounded-[26px] border ${style.card} shadow-sm p-4 sm:p-5`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="font-black text-gray-950 text-base sm:text-lg truncate">
              {task.guest_name || "Guest"}
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <Home size={14} />
              <span className="truncate">{getPropertyName(task.property_id)}</span>
            </p>
          </div>

          <span
            className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black ${style.badge}`}
          >
            {task.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="rounded-2xl bg-gray-50 p-3">
            <p className="text-[10px] uppercase font-black text-gray-400">
              Checkout
            </p>
            <p className="font-black text-gray-800 mt-0.5 flex items-center gap-1.5">
              <CalendarDays size={14} />
              {formatDate(task.checkout_date)}
            </p>
          </div>

          {task.notes && (
            <div className="rounded-2xl bg-gray-50 p-3">
              <p className="text-[10px] uppercase font-black text-gray-400">
                Notes
              </p>
              <p className="text-gray-600 text-xs sm:text-sm mt-0.5 line-clamp-3">
                {task.notes}
              </p>
            </div>
          )}
        </div>

        {nextStatus && (
          <button
            onClick={() => updateStatus(task.id, nextStatus)}
            className="mt-3 w-full h-11 sm:h-12 bg-black text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition"
          >
            Move to {nextStatus}
            <ArrowRight size={15} />
          </button>
        )}
      </div>
    );
  };

  const Column = ({ title, color, items, nextStatus }) => (
    <div className="bg-white rounded-[24px] sm:rounded-[30px] shadow-sm p-4 sm:p-6 border border-gray-100">
      <div className="mb-4 sm:mb-5">
        <div
          className="w-full h-1.5 sm:h-2 rounded-full mb-3 sm:mb-4"
          style={{ background: color }}
        />

        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-950">
              {title}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
              {items.length} task(s)
            </p>
          </div>

          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black"
            style={{ background: color }}
          >
            {items.length}
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {items.length === 0 && (
          <div className="bg-gray-50 rounded-[22px] p-5 text-center text-gray-400 text-sm font-semibold">
            No tasks
          </div>
        )}

        {items.map((task) => (
          <TaskCard key={task.id} task={task} nextStatus={nextStatus} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fb] lg:flex">
      <Sidebar />

      <main className="min-h-screen flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 lg:py-8">
        <div className="w-full max-w-[1600px] mx-auto">
          {toast && (
            <div className="fixed top-5 right-4 left-4 sm:left-auto sm:right-6 z-50">
              <div
                className={`px-5 py-4 rounded-2xl shadow-2xl border bg-white ${
                  toast.type === "success"
                    ? "border-emerald-200 text-emerald-700"
                    : "border-red-200 text-red-600"
                }`}
              >
                <p className="font-black">
                  {toast.type === "success" ? "Success" : "Action Required"}
                </p>
                <p className="text-sm mt-1 text-gray-600">{toast.message}</p>
              </div>
            </div>
          )}

          <div className="mb-5 sm:mb-7">
            <div className="pl-20 sm:pl-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-black text-white items-center justify-center shadow-sm">
                  <Sparkles size={22} />
                </div>

                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                    Housekeeping
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500">
                    Manage room cleaning workflow.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-950 rounded-[24px] sm:rounded-[30px] p-4 sm:p-6 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-3xl bg-white/10 flex items-center justify-center shrink-0">
                  <ClipboardList size={25} />
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-bold">
                    Total Tasks
                  </p>
                  <h2 className="text-2xl font-black">{tasks.length}</h2>
                </div>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-white text-gray-950 font-black text-sm">
                Cleaning Board
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-[420px] bg-white rounded-[30px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="animate-spin mb-3" size={32} />
              <p className="text-sm">Loading housekeeping...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2.5 sm:gap-5 mb-5 sm:mb-6">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className={`rounded-[20px] sm:rounded-[30px] p-3 sm:p-6 text-white shadow-sm min-h-[104px] sm:min-h-[170px] ${stat.className}`}
                    >
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                        <Icon size={18} />
                      </div>

                      <p className="text-white/75 text-[10px] sm:text-sm mt-3 sm:mt-5 truncate">
                        {stat.label}
                      </p>

                      <h2 className="text-2xl sm:text-4xl font-black mt-0.5">
                        {stat.value}
                      </h2>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
                <Column
                  title="Pending"
                  color="#EF4444"
                  items={pending}
                  nextStatus="In Progress"
                />

                <Column
                  title="In Progress"
                  color="#3B82F6"
                  items={progress}
                  nextStatus="Ready"
                />

                <Column title="Ready" color="#10B981" items={ready} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}