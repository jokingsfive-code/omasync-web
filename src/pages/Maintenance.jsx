import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Pencil,
  Plus,
  Trash2,
  Wrench,
  X,
  Loader2,
  Home,
  Wallet,
} from "lucide-react";
import api from "../api/axios";

const PRIORITY_STYLES = {
  Low: "bg-emerald-100 text-emerald-700",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

const STATUS_STYLES = {
  Open: "bg-red-100 text-red-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-slate-200 text-gray-600",
};

export default function Maintenance() {
  const [tickets, setTickets] = useState([]);
  const [properties, setProperties] = useState([]);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    property_id: "",
    title: "",
    description: "",
    priority: "Medium",
    status: "Open",
    reported_by: "",
    assigned_to: "",
    reported_date: today,
    completed_date: "",
    cost: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.tickets)) return payload.tickets;
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

      const [ticketRes, propertyRes] = await Promise.all([
        api.get("/maintenance-tickets"),
        api.get("/properties"),
      ]);

      setTickets(normalizeArray(ticketRes.data));
      setProperties(normalizeArray(propertyRes.data));
    } catch {
      showToast("error", "Failed to load maintenance data.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      property_id: "",
      title: "",
      description: "",
      priority: "Medium",
      status: "Open",
      reported_by: "",
      assigned_to: "",
      reported_date: today,
      completed_date: "",
      cost: "",
    });

    setEditId(null);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const handleStatusChange = (value) => {
    setForm({
      ...form,
      status: value,
      completed_date: value === "Completed" ? form.completed_date || today : "",
    });
  };

  const saveTicket = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showToast("error", "Please enter issue title.");
      return;
    }

    try {
      const payload = {
        property_id: form.property_id || null,
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        status: form.status,
        reported_by: form.reported_by || null,
        assigned_to: form.assigned_to || null,
        reported_date: form.reported_date || null,
        completed_date:
          form.status === "Completed" ? form.completed_date || today : null,
        cost: form.cost || 0,
      };

      if (editId) {
        await api.put(`/maintenance-tickets/${editId}`, payload);
        showToast("success", "Maintenance ticket updated.");
      } else {
        await api.post("/maintenance-tickets", payload);
        showToast("success", "Maintenance ticket created.");
      }

      resetForm();
      setShowForm(false);
      fetchData();
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Failed to save ticket."
      );
    }
  };

  const startEdit = (ticket) => {
    setEditId(ticket.id);

    setForm({
      property_id: ticket.property_id || "",
      title: ticket.title || "",
      description: ticket.description || "",
      priority: ticket.priority || "Medium",
      status: ticket.status || "Open",
      reported_by: ticket.reported_by || "",
      assigned_to: ticket.assigned_to || "",
      reported_date: ticket.reported_date || today,
      completed_date: ticket.status === "Completed" ? ticket.completed_date || today : "",
      cost: ticket.cost || "",
    });

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteTicket = async (id) => {
    if (!window.confirm("Delete this maintenance ticket?")) return;

    try {
      await api.delete(`/maintenance-tickets/${id}`);
      fetchData();
      showToast("success", "Maintenance ticket deleted.");
    } catch {
      showToast("error", "Failed to delete ticket.");
    }
  };

  const quickStatus = async (ticket, status) => {
    try {
      await api.put(`/maintenance-tickets/${ticket.id}`, {
        property_id: ticket.property_id || null,
        title: ticket.title,
        description: ticket.description || null,
        priority: ticket.priority || "Medium",
        status,
        reported_by: ticket.reported_by || null,
        assigned_to: ticket.assigned_to || null,
        reported_date: ticket.reported_date || null,
        completed_date: status === "Completed" ? today : null,
        cost: ticket.cost || 0,
      });

      fetchData();
      showToast("success", `Ticket moved to ${status}.`);
    } catch {
      showToast("error", "Failed to update status.");
    }
  };

  const getPropertyName = (propertyId, propertyObject) => {
    if (propertyObject?.name) return propertyObject.name;
    if (propertyObject?.property_name) return propertyObject.property_name;

    const property = properties.find((p) => Number(p.id) === Number(propertyId));
    return property ? property.name || property.property_name : "-";
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return String(value).slice(0, 10);
  };

  const openTickets = tickets.filter((ticket) => ticket.status === "Open");
  const progressTickets = tickets.filter(
    (ticket) => ticket.status === "In Progress"
  );
  const completedTickets = tickets.filter(
    (ticket) => ticket.status === "Completed"
  );
  const criticalTickets = tickets.filter(
    (ticket) => ticket.priority === "Critical" && ticket.status !== "Completed"
  );

  const totalCost = tickets.reduce(
    (sum, ticket) => sum + Number(ticket.cost || 0),
    0
  );

  const stats = [
    {
      label: "Open",
      value: openTickets.length,
      icon: AlertTriangle,
      className: "bg-gradient-to-br from-red-500 to-rose-700",
    },
    {
      label: "Progress",
      value: progressTickets.length,
      icon: Clock,
      className: "bg-gradient-to-br from-blue-500 to-indigo-700",
    },
    {
      label: "Done",
      value: completedTickets.length,
      icon: CheckCircle2,
      className: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    },
    {
      label: "Critical",
      value: criticalTickets.length,
      icon: Wrench,
      className: "bg-gradient-to-br from-orange-500 to-red-600",
    },
  ];

  const fieldClass =
    "h-12 sm:h-14 w-full min-w-0 max-w-full px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-900 outline-none appearance-none focus:border-black focus:ring-4 focus:ring-black/5 transition";

  const TicketForm = () => (
    <div className="w-full max-w-full overflow-hidden bg-white rounded-[28px] sm:rounded-[34px] border border-gray-100 shadow-sm p-4 sm:p-7 mb-5 sm:mb-7">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 shrink-0 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg shadow-black/10">
            <Plus size={20} />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-gray-950">
              {editId ? "Edit Ticket" : "New Ticket"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Log repair issue with cost and status.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={closeForm}
          className="w-9 h-9 shrink-0 rounded-full bg-slate-100 text-gray-700 flex items-center justify-center active:scale-95"
        >
          <X size={17} />
        </button>
      </div>

      <form
        onSubmit={saveTicket}
        className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"
      >
        <select
          value={form.property_id}
          onChange={(e) => setForm({ ...form, property_id: e.target.value })}
          className={fieldClass}
        >
          <option value="">Select Property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name || property.property_name}
            </option>
          ))}
        </select>

        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Issue title"
          className={`${fieldClass} xl:col-span-2`}
        />

        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
          className={fieldClass}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>

        <select
          value={form.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={fieldClass}
        >
          <option>Open</option>
          <option>In Progress</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>

        <input
          value={form.reported_by}
          onChange={(e) => setForm({ ...form, reported_by: e.target.value })}
          placeholder="Reported by"
          className={fieldClass}
        />

        <input
          value={form.assigned_to}
          onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
          placeholder="Assigned to"
          className={fieldClass}
        />

        <input
          type="number"
          value={form.cost}
          onChange={(e) => setForm({ ...form, cost: e.target.value })}
          placeholder="Cost RM"
          className={fieldClass}
        />

        <input
          type="date"
          value={form.reported_date}
          onChange={(e) => setForm({ ...form, reported_date: e.target.value })}
          className={fieldClass}
        />

        {form.status === "Completed" && (
          <input
            type="date"
            value={form.completed_date}
            onChange={(e) =>
              setForm({ ...form, completed_date: e.target.value })
            }
            className={fieldClass}
          />
        )}

        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Issue description / notes"
          rows="4"
          className="w-full min-w-0 max-w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 outline-none resize-none focus:border-black focus:ring-4 focus:ring-black/5 transition sm:col-span-2 xl:col-span-3"
        />

        <div className="flex gap-2 sm:col-span-2 xl:col-span-1">
          <button
            type="submit"
            className="flex-1 h-12 sm:h-full min-h-12 bg-black text-white rounded-2xl font-black text-sm sm:text-base active:scale-[0.98]"
          >
            {editId ? "Update" : "Create"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="h-12 px-4 rounded-2xl bg-slate-100 text-gray-900 font-black text-sm active:scale-[0.98]"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );

  const TicketCard = ({ ticket, next }) => (
    <div className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-black text-gray-950 text-base leading-tight truncate">
            {ticket.title}
          </h3>

          <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5 min-w-0">
            <Home size={13} className="shrink-0" />
            <span className="truncate">
              {getPropertyName(ticket.property_id, ticket.property)}
            </span>
          </p>
        </div>

        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-black h-fit shrink-0 ${
            PRIORITY_STYLES[ticket.priority] || "bg-slate-200 text-gray-700"
          }`}
        >
          {ticket.priority}
        </span>
      </div>

      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
        {ticket.description || "No description provided."}
      </p>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-[10px] text-gray-400 uppercase font-black">
            Assigned
          </p>
          <p className="font-bold text-gray-800 text-xs mt-1 truncate">
            {ticket.assigned_to || "-"}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-[10px] text-gray-400 uppercase font-black">
            Cost
          </p>
          <p className="font-bold text-gray-800 text-xs mt-1">
            RM {Number(ticket.cost || 0).toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-[10px] text-gray-400 uppercase font-black">
            Reported
          </p>
          <p className="font-bold text-gray-800 text-xs mt-1">
            {formatDate(ticket.reported_date)}
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-3">
          <p className="text-[10px] text-gray-400 uppercase font-black">
            Status
          </p>
          <span
            className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black mt-1 ${
              STATUS_STYLES[ticket.status] || "bg-slate-200 text-gray-700"
            }`}
          >
            {ticket.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        {next ? (
          <button
            onClick={() => quickStatus(ticket, next)}
            className="h-10 rounded-xl bg-black text-white font-black text-xs active:scale-[0.98]"
          >
            Move
          </button>
        ) : (
          <div className="h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400">
            Done
          </div>
        )}

        <button
          onClick={() => startEdit(ticket)}
          className="h-10 rounded-xl bg-blue-50 text-blue-700 font-black flex items-center justify-center active:scale-[0.98]"
        >
          <Pencil size={15} />
        </button>

        <button
          onClick={() => deleteTicket(ticket.id)}
          className="h-10 rounded-xl bg-red-50 text-red-500 font-black flex items-center justify-center active:scale-[0.98]"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );

  const Column = ({ title, items, color, next }) => (
    <div className="bg-white rounded-[28px] sm:rounded-[34px] shadow-sm p-4 sm:p-6 border border-gray-100">
      <div className={`h-1.5 rounded-full bg-gradient-to-r ${color} mb-4`} />

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-gray-950">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {items.length} ticket(s)
          </p>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-gray-950">
          {items.length}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {items.length === 0 ? (
          <div className="bg-gray-50 rounded-[22px] p-6 text-center text-gray-400 text-sm font-semibold">
            No tickets
          </div>
        ) : (
          items.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} next={next} />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fb] lg:flex">
      <Sidebar />

      <main className="min-h-screen flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 lg:py-8 overflow-x-hidden">
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
            <div className="pl-16 sm:pl-0 mb-4">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-black text-white items-center justify-center">
                  <Wrench size={22} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                    Maintenance
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500">
                    Track repairs and service requests.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 text-gray-950 flex items-center justify-center">
                  <Wallet size={20} />
                </div>

                <div>
                  <p className="text-[11px] text-gray-500 font-bold">
                    Total Cost
                  </p>
                  <p className="text-xl font-black text-gray-950">
                    RM {totalCost.toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="min-h-[68px] rounded-[24px] bg-black text-white font-black flex items-center justify-center gap-2 text-sm active:scale-[0.98] shadow-lg shadow-black/10"
              >
                <Plus size={18} />
                New Ticket
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 mb-5 sm:mb-7">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className={`rounded-[24px] sm:rounded-[30px] p-4 sm:p-6 text-white shadow-sm min-h-[118px] sm:min-h-[170px] ${stat.className}`}
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Icon size={17} />
                  </div>

                  <p className="text-white/75 text-[11px] sm:text-sm mt-4 sm:mt-5 truncate">
                    {stat.label}
                  </p>

                  <h2 className="text-2xl sm:text-4xl font-black mt-0.5">
                    {stat.value}
                  </h2>
                </div>
              );
            })}
          </div>

          {showForm && <TicketForm />}

          {loading ? (
            <div className="h-[420px] bg-white rounded-[30px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="animate-spin mb-3" size={32} />
              <p className="text-sm">Loading maintenance...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
              <Column
                title="Open"
                items={openTickets}
                color="from-red-500 to-rose-700"
                next="In Progress"
              />

              <Column
                title="In Progress"
                items={progressTickets}
                color="from-blue-500 to-indigo-700"
                next="Completed"
              />

              <Column
                title="Completed"
                items={completedTickets}
                color="from-emerald-500 to-emerald-700"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}