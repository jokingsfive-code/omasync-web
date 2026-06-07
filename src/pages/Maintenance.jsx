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
} from "lucide-react";
import api from "../api/axios";

const PRIORITY_STYLES = {
  Low: "bg-green-100 text-green-700",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700",
};

const STATUS_STYLES = {
  Open: "bg-red-100 text-red-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-100 text-gray-600",
};

export default function Maintenance() {
  const [tickets, setTickets] = useState([]);
  const [properties, setProperties] = useState([]);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    property_id: "",
    title: "",
    description: "",
    priority: "Medium",
    status: "Open",
    reported_by: "",
    assigned_to: "",
    reported_date: new Date().toISOString().slice(0, 10),
    completed_date: "",
    cost: "",
  });

  useEffect(() => {
    fetchTickets();
    fetchProperties();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTickets = async () => {
    try {
      const res = await api.get("/maintenance-tickets");
      setTickets(res.data);
    } catch {
      showToast("error", "Failed to load maintenance tickets.");
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      setProperties(res.data);
    } catch {
      console.log("Failed to load properties");
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
      reported_date: new Date().toISOString().slice(0, 10),
      completed_date: "",
      cost: "",
    });

    setEditId(null);
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
        completed_date: form.completed_date || null,
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
      fetchTickets();
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
      reported_date: ticket.reported_date || "",
      completed_date: ticket.completed_date || "",
      cost: ticket.cost || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteTicket = async (id) => {
    if (!window.confirm("Delete this maintenance ticket?")) return;

    try {
      await api.delete(`/maintenance-tickets/${id}`);
      fetchTickets();
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
        completed_date:
          status === "Completed"
            ? new Date().toISOString().slice(0, 10)
            : ticket.completed_date || null,
        cost: ticket.cost || 0,
      });

      fetchTickets();
      showToast("success", `Ticket moved to ${status}.`);
    } catch {
      showToast("error", "Failed to update status.");
    }
  };

  const getPropertyName = (propertyId, propertyObject) => {
    if (propertyObject?.name) return propertyObject.name;

    const property = properties.find((p) => Number(p.id) === Number(propertyId));
    return property ? property.name : "-";
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

  return (
    <div className="flex">
      <Sidebar />

      <div
        className="flex-1 p-8 min-h-screen relative"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(127,157,177,0.35), transparent 35%), radial-gradient(circle at bottom right, rgba(13,59,102,0.14), transparent 35%), linear-gradient(135deg, #F3F6F8 0%, #E8EEF2 45%, #DCE7ED 100%)",
        }}
      >
        {toast && (
          <div className="fixed top-6 right-6 z-50">
            <div
              className={`px-6 py-4 rounded-2xl shadow-2xl border bg-white ${
                toast.type === "success"
                  ? "border-green-200 text-green-700"
                  : "border-red-200 text-red-600"
              }`}
            >
              <p className="font-bold">
                {toast.type === "success" ? "Success" : "Action Required"}
              </p>
              <p className="text-sm mt-1 text-gray-600">{toast.message}</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0D3B66]">Maintenance</h1>
          <p className="text-gray-500 mt-2">
            Track repairs, property issues and service requests.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-red-500 to-rose-700">
            <AlertTriangle size={28} />
            <p className="text-white/75 mt-5">Open Issues</p>
            <h2 className="text-4xl font-bold mt-2">{openTickets.length}</h2>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-blue-500 to-indigo-700">
            <Clock size={28} />
            <p className="text-white/75 mt-5">In Progress</p>
            <h2 className="text-4xl font-bold mt-2">
              {progressTickets.length}
            </h2>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-green-500 to-emerald-700">
            <CheckCircle2 size={28} />
            <p className="text-white/75 mt-5">Completed</p>
            <h2 className="text-4xl font-bold mt-2">
              {completedTickets.length}
            </h2>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Wrench size={28} />
            <p className="text-white/75 mt-5">Critical</p>
            <h2 className="text-4xl font-bold mt-2">
              {criticalTickets.length}
            </h2>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-[#0D3B66] to-[#1B5E9E]">
            <Plus size={28} />
            <p className="text-white/75 mt-5">Total Cost</p>
            <h2 className="text-3xl font-bold mt-2">
              RM {totalCost.toLocaleString()}
            </h2>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-7 border border-white/70 mb-8">
          <h2 className="text-2xl font-bold text-[#0D3B66] mb-2">
            {editId ? "Edit Maintenance Ticket" : "New Maintenance Ticket"}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Log issues such as aircond problems, WiFi issues, repairs or broken
            facilities.
          </p>

          <form onSubmit={saveTicket} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={form.property_id}
              onChange={(e) =>
                setForm({ ...form, property_id: e.target.value })
              }
              className="border border-gray-300 rounded-2xl px-4 py-3 bg-white"
            >
              <option value="">Select Property</option>

              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>

            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Issue title e.g. Aircond not cold"
              className="border border-gray-300 rounded-2xl px-4 py-3 md:col-span-2"
            />

            <select
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value })
              }
              className="border border-gray-300 rounded-2xl px-4 py-3 bg-white"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border border-gray-300 rounded-2xl px-4 py-3 bg-white"
            >
              <option>Open</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>

            <input
              value={form.reported_by}
              onChange={(e) =>
                setForm({ ...form, reported_by: e.target.value })
              }
              placeholder="Reported by"
              className="border border-gray-300 rounded-2xl px-4 py-3"
            />

            <input
              value={form.assigned_to}
              onChange={(e) =>
                setForm({ ...form, assigned_to: e.target.value })
              }
              placeholder="Assigned to"
              className="border border-gray-300 rounded-2xl px-4 py-3"
            />

            <input
              type="number"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              placeholder="Cost RM"
              className="border border-gray-300 rounded-2xl px-4 py-3"
            />

            <input
              type="date"
              value={form.reported_date}
              onChange={(e) =>
                setForm({ ...form, reported_date: e.target.value })
              }
              className="border border-gray-300 rounded-2xl px-4 py-3"
            />

            <input
              type="date"
              value={form.completed_date}
              onChange={(e) =>
                setForm({ ...form, completed_date: e.target.value })
              }
              className="border border-gray-300 rounded-2xl px-4 py-3"
            />

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Issue description / notes"
              rows="3"
              className="border border-gray-300 rounded-2xl px-4 py-3 md:col-span-3"
            />

            <div className="md:col-span-4 flex gap-3">
              <button
                type="submit"
                className="bg-[#0D3B66] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#092B4A] transition"
              >
                {editId ? "Update Ticket" : "Create Ticket"}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 px-6 py-3 rounded-2xl font-bold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {[
            {
              title: "Open",
              items: openTickets,
              color: "from-red-500 to-rose-700",
              next: "In Progress",
            },
            {
              title: "In Progress",
              items: progressTickets,
              color: "from-blue-500 to-indigo-700",
              next: "Completed",
            },
            {
              title: "Completed",
              items: completedTickets,
              color: "from-green-500 to-emerald-700",
              next: null,
            },
          ].map((column) => (
            <div
              key={column.title}
              className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-6 border border-white/70"
            >
              <div className={`h-2 rounded-full bg-gradient-to-r ${column.color} mb-5`} />

              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-xl font-bold text-[#0D3B66]">
                    {column.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {column.items.length} ticket(s)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {column.items.length === 0 ? (
                  <div className="bg-gray-50 rounded-3xl p-8 text-center text-gray-400">
                    No tickets
                  </div>
                ) : (
                  column.items.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-3xl p-5 shadow-md border border-gray-100 hover:shadow-xl transition"
                    >
                      <div className="flex justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {ticket.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {getPropertyName(ticket.property_id, ticket.property)}
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold h-fit ${
                            PRIORITY_STYLES[ticket.priority] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-3">
                        {ticket.description || "No description provided."}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-400 uppercase">
                            Assigned
                          </p>
                          <p className="font-semibold">
                            {ticket.assigned_to || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 uppercase">
                            Cost
                          </p>
                          <p className="font-semibold text-[#0D3B66]">
                            RM {Number(ticket.cost || 0).toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 uppercase">
                            Reported
                          </p>
                          <p className="font-semibold">
                            {ticket.reported_date || "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 uppercase">
                            Status
                          </p>
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                              STATUS_STYLES[ticket.status] ||
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-5">
                        {column.next && (
                          <button
                            onClick={() => quickStatus(ticket, column.next)}
                            className="flex-1 bg-[#0D3B66] text-white py-2 rounded-xl font-semibold hover:bg-[#092B4A]"
                          >
                            Move to {column.next}
                          </button>
                        )}

                        <button
                          onClick={() => startEdit(ticket)}
                          className="px-4 py-2 rounded-xl bg-blue-50 text-[#0D3B66] font-semibold hover:bg-blue-100"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => deleteTicket(ticket.id)}
                          className="px-4 py-2 rounded-xl bg-red-50 text-red-500 font-semibold hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}