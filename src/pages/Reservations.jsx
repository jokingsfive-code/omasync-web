import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";

const CHANNEL_COLORS = {
  Airbnb: "#FF385C",
  Agoda: "#9333EA",
  "Booking.com": "#2563EB",
  Booking: "#2563EB",
  Direct: "#059669",
  Website: "#F59E0B",
};

export default function Reservations() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [reservations, setReservations] = useState([]);
  const [properties, setProperties] = useState([]);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const activeFilter = searchParams.get("filter") || "all";
  const viewMode = searchParams.get("view") || "full";
  const selectedDate = searchParams.get("date");

  const [form, setForm] = useState({
    property_id: "",
    guest_name: "",
    channel: "Airbnb",
    check_in: "",
    check_out: "",
    total_price: "",
    status: "Confirmed",
    notes: "",
  });

  useEffect(() => {
    fetchReservations();
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const checkInDate = new Date(selectedDate);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 1);

      setForm((prev) => ({
        ...prev,
        check_in: selectedDate,
        check_out: checkOutDate.toISOString().slice(0, 10),
      }));
    }
  }, [selectedDate]);

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.reservations)) return payload.reservations;
    if (Array.isArray(payload?.properties)) return payload.properties;
    return [];
  };

  const todayString = new Date().toISOString().slice(0, 10);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReservations = async () => {
    try {
      const res = await api.get("/reservations");
      setReservations(normalizeArray(res.data));
    } catch {
      showToast("error", "Failed to load reservations.");
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      setProperties(normalizeArray(res.data));
    } catch {
      showToast("error", "Failed to load properties.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(String(dateString).slice(0, 10));
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find((p) => Number(p.id) === Number(propertyId));
    return property ? property.name || property.property_name : "-";
  };

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const filteredReservations = reservations.filter((reservation) => {
    const propertyName = getPropertyName(reservation.property_id);

    const matchesSearch =
      reservation.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.channel?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "checkin") {
      return String(reservation.check_in).slice(0, 10) === todayString;
    }

    if (activeFilter === "checkout") {
      return String(reservation.check_out).slice(0, 10) === todayString;
    }

    return true;
  });

  const filterTitle =
    activeFilter === "checkin"
      ? "Check-In Today"
      : activeFilter === "checkout"
      ? "Check-Out Today"
      : "All Reservations";

  const resetForm = () => {
    setForm({
      property_id: "",
      guest_name: "",
      channel: "Airbnb",
      check_in: selectedDate || "",
      check_out: selectedDate || "",
      total_price: "",
      status: "Confirmed",
      notes: "",
    });

    setEditId(null);
  };

  const saveReservation = async (e) => {
    e.preventDefault();

    if (!form.property_id) {
      showToast("error", "Please select property.");
      return;
    }

    if (!form.guest_name.trim()) {
      showToast("error", "Please enter guest name.");
      return;
    }

    if (!form.check_in) {
      showToast("error", "Please select check-in date.");
      return;
    }

    if (!form.check_out) {
      showToast("error", "Please select check-out date.");
      return;
    }

    try {
      const payload = {
        property_id: form.property_id,
        guest_name: form.guest_name,
        channel: form.channel,
        check_in: form.check_in,
        check_out: form.check_out,
        total_price: form.total_price || 0,
        status: form.status,
        notes: form.notes || null,
      };

      if (editId) {
        await api.put(`/reservations/${editId}`, payload);
        showToast("success", "Reservation updated successfully.");
      } else {
        await api.post("/reservations", payload);
        showToast("success", "Reservation added successfully.");
      }

      resetForm();
      fetchReservations();
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Failed to save reservation."
      );
    }
  };

  const startEdit = (reservation) => {
    setEditId(reservation.id);

    setForm({
      property_id: reservation.property_id || "",
      guest_name: reservation.guest_name || "",
      channel: reservation.channel || "Airbnb",
      check_in: reservation.check_in || "",
      check_out: reservation.check_out || "",
      total_price: reservation.total_price || "",
      status: reservation.status || "Confirmed",
      notes: reservation.notes || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteReservation = async (id) => {
    const confirmed = window.confirm("Delete this reservation?");
    if (!confirmed) return;

    try {
      await api.delete(`/reservations/${id}`);
      fetchReservations();
      showToast("success", "Reservation deleted successfully.");
    } catch {
      showToast("error", "Failed to delete reservation.");
    }
  };

  const setFilter = (filter) => {
    if (filter === "all") {
      setSearchParams(viewMode === "list" ? { view: "list" } : {});
    } else {
      setSearchParams(
        viewMode === "list" ? { filter, view: "list" } : { filter }
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-300 lg:flex">
      <Sidebar />

      <main className="min-h-screen flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 lg:py-8">
        <div className="w-full max-w-[1600px] mx-auto">
          {toast && (
            <div className="fixed top-6 right-4 left-4 md:left-auto md:right-6 z-50">
              <div
                className={`px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
                  toast.type === "success"
                    ? "bg-white border-emerald-200 text-emerald-700"
                    : "bg-white border-red-200 text-red-600"
                }`}
              >
                <p className="font-black">
                  {toast.type === "success" ? "Success" : "Action Required"}
                </p>
                <p className="text-sm mt-1 text-gray-600">{toast.message}</p>
              </div>
            </div>
          )}

          <div className="pl-20 sm:pl-0 mb-5 sm:mb-7">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
              Reservations
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Manage bookings from all channels.
            </p>
          </div>

          {viewMode !== "list" && (
            <div className="bg-slate-100 rounded-[24px] sm:rounded-[30px] shadow-md p-4 sm:p-7 mb-5 sm:mb-7 border border-slate-300">
              <h2 className="text-xl sm:text-2xl font-black mb-5 text-gray-950">
                {editId ? "Edit Reservation" : "New Reservation"}
              </h2>

              {selectedDate && !editId && (
                <div className="mb-5 bg-[#0D3B66]/10 text-[#0D3B66] rounded-2xl px-5 py-3 font-black">
                  Creating reservation for selected date:{" "}
                  {formatDate(selectedDate)}
                </div>
              )}

              <form onSubmit={saveReservation}>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-black mb-2 text-gray-900">
                      Property
                    </label>

                    <select
                      value={form.property_id}
                      onChange={(e) =>
                        setForm({ ...form, property_id: e.target.value })
                      }
                      className="w-full h-12 sm:h-14 border border-slate-300 rounded-2xl px-4 bg-white font-bold outline-none"
                    >
                      <option value="">Select Property</option>

                      {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                          {property.name || property.property_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-black mb-2 text-gray-900">
                      Guest Name
                    </label>

                    <input
                      value={form.guest_name}
                      onChange={(e) =>
                        setForm({ ...form, guest_name: e.target.value })
                      }
                      placeholder="Guest name"
                      className="w-full h-12 sm:h-14 border border-slate-300 rounded-2xl px-4 bg-white font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black mb-2 text-gray-900">
                      Channel
                    </label>

                    <select
                      value={form.channel}
                      onChange={(e) =>
                        setForm({ ...form, channel: e.target.value })
                      }
                      className="w-full h-12 sm:h-14 border border-slate-300 rounded-2xl px-4 bg-white font-bold outline-none"
                    >
                      <option value="Airbnb">Airbnb</option>
                      <option value="Agoda">Agoda</option>
                      <option value="Booking.com">Booking.com</option>
                      <option value="Direct">Direct</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-black mb-2 text-gray-900">
                      Check In
                    </label>

                    <input
                      type="date"
                      value={form.check_in}
                      onChange={(e) =>
                        setForm({ ...form, check_in: e.target.value })
                      }
                      className="w-full h-12 sm:h-14 border border-slate-300 rounded-2xl px-4 bg-white font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black mb-2 text-gray-900">
                      Check Out
                    </label>

                    <input
                      type="date"
                      value={form.check_out}
                      onChange={(e) =>
                        setForm({ ...form, check_out: e.target.value })
                      }
                      className="w-full h-12 sm:h-14 border border-slate-300 rounded-2xl px-4 bg-white font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black mb-2 text-gray-900">
                      Total Price
                    </label>

                    <input
                      type="number"
                      value={form.total_price}
                      onChange={(e) =>
                        setForm({ ...form, total_price: e.target.value })
                      }
                      placeholder="0"
                      className="w-full h-12 sm:h-14 border border-slate-300 rounded-2xl px-4 bg-white font-bold outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black mb-2 text-gray-900">
                      Status
                    </label>

                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className="w-full h-12 sm:h-14 border border-slate-300 rounded-2xl px-4 bg-white font-bold outline-none"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Checked In">Checked In</option>
                      <option value="Checked Out">Checked Out</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-black mb-2 text-gray-900">
                      Notes
                    </label>

                    <input
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                      placeholder="Optional notes"
                      className="w-full h-12 sm:h-14 border border-slate-300 rounded-2xl px-4 bg-white font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 rounded-2xl font-black hover:bg-gray-800"
                  >
                    {editId ? "Update Reservation" : "Add Reservation"}
                  </button>

                  {editId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-slate-200 px-6 py-3 rounded-2xl font-black"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          <div className="bg-slate-100 rounded-[24px] sm:rounded-[30px] shadow-md p-4 sm:p-7 border border-slate-300">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-950">
                  {filterTitle}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Showing {filteredReservations.length} reservation(s)
                </p>
              </div>

              <div className="flex flex-col xl:flex-row gap-3 w-full lg:w-auto">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search guest, property or channel..."
                  className="px-5 py-3 rounded-2xl border border-slate-300 bg-white shadow-sm w-full xl:min-w-[280px] font-semibold focus:outline-none focus:ring-2 focus:ring-black/10"
                />

                <div className="bg-slate-300 p-1.5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2.5 rounded-xl font-black transition ${
                      activeFilter === "all"
                        ? "bg-black text-white shadow"
                        : "text-gray-700 hover:bg-white"
                    }`}
                  >
                    All
                  </button>

                  <button
                    onClick={() => setFilter("checkin")}
                    className={`px-4 py-2.5 rounded-xl font-black transition ${
                      activeFilter === "checkin"
                        ? "bg-emerald-600 text-white shadow"
                        : "text-gray-700 hover:bg-white"
                    }`}
                  >
                    Check-In
                  </button>

                  <button
                    onClick={() => setFilter("checkout")}
                    className={`px-4 py-2.5 rounded-xl font-black transition ${
                      activeFilter === "checkout"
                        ? "bg-orange-500 text-white shadow"
                        : "text-gray-700 hover:bg-white"
                    }`}
                  >
                    Check-Out
                  </button>
                </div>
              </div>
            </div>

            {filteredReservations.length === 0 ? (
              <div className="bg-white rounded-[22px] border border-slate-300 p-10 text-center">
                <p className="text-gray-500">No reservations found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="bg-white rounded-[22px] sm:rounded-[26px] p-4 sm:p-5 shadow-sm border border-slate-200 hover:shadow-md transition"
                  >
                    <div className="grid grid-cols-1 xl:grid-cols-9 gap-4 xl:gap-5 items-start xl:items-center">
                      <div className="flex items-center gap-4 xl:col-span-2">
                        <div
                          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-sm shrink-0"
                          style={{
                            backgroundColor:
                              CHANNEL_COLORS[reservation.channel] || "#0D3B66",
                          }}
                        >
                          {getInitial(reservation.guest_name)}
                        </div>

                        <div className="min-w-0">
                          <p className="font-black text-lg text-gray-950 truncate">
                            {reservation.guest_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Reservation #{reservation.id}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 uppercase font-black">
                          Property
                        </p>
                        <p className="font-bold text-gray-700">
                          {getPropertyName(reservation.property_id)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 uppercase font-black">
                          Channel
                        </p>
                        <span
                          className="inline-flex px-3 py-1.5 rounded-full text-xs font-black mt-1 shadow-sm"
                          style={{
                            backgroundColor:
                              CHANNEL_COLORS[reservation.channel] || "#6B7280",
                            color: "#ffffff",
                          }}
                        >
                          {reservation.channel}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 xl:contents">
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-black">
                            Check In
                          </p>
                          <p className="font-bold text-gray-900">
                            {formatDate(reservation.check_in)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400 uppercase font-black">
                            Check Out
                          </p>
                          <p className="font-bold text-gray-900">
                            {formatDate(reservation.check_out)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 uppercase font-black">
                          Revenue
                        </p>
                        <p className="font-black text-[#0D3B66] text-lg">
                          RM{" "}
                          {Number(
                            reservation.total_price || 0
                          ).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 uppercase font-black">
                          Status
                        </p>
                        <span
                          className={`inline-flex px-3 py-1.5 rounded-full text-xs font-black mt-1 ${
                            reservation.status === "Confirmed"
                              ? "bg-emerald-100 text-emerald-700"
                              : reservation.status === "Checked In"
                              ? "bg-blue-100 text-blue-700"
                              : reservation.status === "Checked Out"
                              ? "bg-slate-200 text-gray-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {reservation.status}
                        </span>
                      </div>

                      {viewMode !== "list" && (
                        <div className="flex flex-col sm:flex-row xl:justify-end gap-2">
                          <button
                            onClick={() => startEdit(reservation)}
                            className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-black hover:bg-blue-100 transition"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteReservation(reservation.id)}
                            className="px-4 py-2 rounded-xl bg-red-50 text-red-500 font-black hover:bg-red-100 transition"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}