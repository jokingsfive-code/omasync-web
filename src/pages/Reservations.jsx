import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";

const CHANNEL_COLORS = {
  Airbnb: "#FF5A5F",
  Agoda: "#FDB812",
  "Booking.com": "#003B95",
  Direct: "#16A34A",
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

  const todayString = new Date().toISOString().slice(0, 10);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReservations = async () => {
    try {
      const res = await api.get("/reservations");
      setReservations(res.data);
    } catch {
      showToast("error", "Failed to load reservations.");
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      setProperties(res.data);
    } catch {
      showToast("error", "Failed to load properties.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find((p) => Number(p.id) === Number(propertyId));
    return property ? property.name : "-";
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

    if (activeFilter === "checkin") return reservation.check_in === todayString;
    if (activeFilter === "checkout") return reservation.check_out === todayString;

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
    <div className="flex">
      <Sidebar />

      <div
        className="flex-1 p-4 pt-20 md:p-8 md:pt-8 min-h-screen relative"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(127,157,177,0.35), transparent 35%), radial-gradient(circle at bottom right, rgba(13,59,102,0.14), transparent 35%), linear-gradient(135deg, #F3F6F8 0%, #E8EEF2 45%, #DCE7ED 100%)",
        }}
      >
        {toast && (
          <div className="fixed top-6 right-4 left-4 md:left-auto md:right-6 z-50">
            <div
              className={`px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${
                toast.type === "success"
                  ? "bg-white border-green-200 text-green-700"
                  : "bg-white border-red-200 text-red-600"
              }`}
            >
              <p className="font-semibold">
                {toast.type === "success" ? "Success" : "Action Required"}
              </p>
              <p className="text-sm mt-1 text-gray-600">{toast.message}</p>
            </div>
          </div>
        )}

        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0D3B66]">
            Reservations
          </h1>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Manage bookings from Airbnb, Agoda, Booking.com and Direct channels.
          </p>
        </div>

        {viewMode !== "list" && (
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-4 md:p-6 mb-6 md:mb-8 border border-white/70">
            <h2 className="text-xl font-bold mb-5 text-[#0D3B66]">
              {editId ? "Edit Reservation" : "New Reservation"}
            </h2>

            {selectedDate && !editId && (
              <div className="mb-5 bg-[#0D3B66]/10 text-[#0D3B66] rounded-2xl px-5 py-3 font-semibold">
                Creating reservation for selected date: {formatDate(selectedDate)}
              </div>
            )}

            <form onSubmit={saveReservation}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Property
                  </label>

                  <select
                    value={form.property_id}
                    onChange={(e) =>
                      setForm({ ...form, property_id: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white"
                  >
                    <option value="">Select Property</option>

                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Guest Name
                  </label>

                  <input
                    value={form.guest_name}
                    onChange={(e) =>
                      setForm({ ...form, guest_name: e.target.value })
                    }
                    placeholder="Guest name"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Channel
                  </label>

                  <select
                    value={form.channel}
                    onChange={(e) =>
                      setForm({ ...form, channel: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white"
                  >
                    <option value="Airbnb">Airbnb</option>
                    <option value="Agoda">Agoda</option>
                    <option value="Booking.com">Booking.com</option>
                    <option value="Direct">Direct</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Check In
                  </label>

                  <input
                    type="date"
                    value={form.check_in}
                    onChange={(e) =>
                      setForm({ ...form, check_in: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Check Out
                  </label>

                  <input
                    type="date"
                    value={form.check_out}
                    onChange={(e) =>
                      setForm({ ...form, check_out: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Total Price
                  </label>

                  <input
                    type="number"
                    value={form.total_price}
                    onChange={(e) =>
                      setForm({ ...form, total_price: e.target.value })
                    }
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Checked In">Checked In</option>
                    <option value="Checked Out">Checked Out</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Notes
                  </label>

                  <input
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Optional notes"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="bg-[#0D3B66] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#092B4A]"
                >
                  {editId ? "Update Reservation" : "Add Reservation"}
                </button>

                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-200 px-6 py-3 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] md:rounded-[32px] shadow-2xl p-4 md:p-7 border border-white/70">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
            <div>
              <h2 className="text-2xl font-bold text-[#0D3B66]">
                {filterTitle}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Showing {filteredReservations.length} reservation(s)
              </p>
            </div>

            <div className="flex flex-col xl:flex-row gap-3 w-full lg:w-auto">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search guest, property or channel..."
                className="px-5 py-3 rounded-2xl border border-gray-200 bg-white shadow-sm w-full xl:min-w-[280px] focus:outline-none focus:ring-2 focus:ring-[#0D3B66]"
              />

              <div className="bg-slate-200 p-1.5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-4 py-2.5 rounded-xl font-semibold transition ${
                    activeFilter === "all"
                      ? "bg-[#0D3B66] text-white shadow"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  All
                </button>

                <button
                  onClick={() => setFilter("checkin")}
                  className={`px-4 py-2.5 rounded-xl font-semibold transition ${
                    activeFilter === "checkin"
                      ? "bg-green-600 text-white shadow"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  Check-In
                </button>

                <button
                  onClick={() => setFilter("checkout")}
                  className={`px-4 py-2.5 rounded-xl font-semibold transition ${
                    activeFilter === "checkout"
                      ? "bg-orange-500 text-white shadow"
                      : "text-gray-600 hover:bg-white"
                  }`}
                >
                  Check-Out
                </button>
              </div>
            </div>
          </div>

          {filteredReservations.length === 0 ? (
            <div className="bg-gray-50 rounded-3xl p-12 text-center">
              <p className="text-gray-500">No reservations found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white rounded-3xl p-4 md:p-5 shadow-md border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 xl:grid-cols-9 gap-4 xl:gap-5 items-start xl:items-center">
                    <div className="flex items-center gap-4 xl:col-span-2">
                      <div
                        className="w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg shrink-0"
                        style={{
                          backgroundColor:
                            CHANNEL_COLORS[reservation.channel] || "#0D3B66",
                        }}
                      >
                        {getInitial(reservation.guest_name)}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-lg text-gray-900 truncate">
                          {reservation.guest_name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Reservation #{reservation.id}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase">Property</p>
                      <p className="font-semibold text-gray-700">
                        {getPropertyName(reservation.property_id)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase">Channel</p>
                      <span
                        className="inline-flex px-3 py-1.5 rounded-full text-xs font-bold mt-1 shadow-sm"
                        style={{
                          backgroundColor:
                            CHANNEL_COLORS[reservation.channel] || "#6B7280",
                          color:
                            reservation.channel === "Agoda"
                              ? "#111827"
                              : "#ffffff",
                        }}
                      >
                        {reservation.channel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 xl:contents">
                      <div>
                        <p className="text-xs text-gray-400 uppercase">Check In</p>
                        <p className="font-semibold">
                          {formatDate(reservation.check_in)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 uppercase">
                          Check Out
                        </p>
                        <p className="font-semibold">
                          {formatDate(reservation.check_out)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase">Revenue</p>
                      <p className="font-bold text-[#0D3B66] text-lg">
                        RM {Number(reservation.total_price || 0).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase">Status</p>
                      <span
                        className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold mt-1 ${
                          reservation.status === "Confirmed"
                            ? "bg-green-100 text-green-700"
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
                          className="px-4 py-2 rounded-xl bg-blue-50 text-[#0D3B66] font-semibold hover:bg-blue-100 transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteReservation(reservation.id)}
                          className="px-4 py-2 rounded-xl bg-red-50 text-red-500 font-semibold hover:bg-red-100 transition"
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
    </div>
  );
}