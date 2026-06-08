import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  Link2,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Wifi,
  CalendarSync,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import api from "../api/axios";

const CHANNELS = [
  { name: "Airbnb", color: "#FF385C" },
  { name: "Agoda", color: "#9333EA" },
  { name: "Booking.com", color: "#2563EB" },
  { name: "Direct", color: "#059669" },
  { name: "Website", color: "#F59E0B" },
];

export default function Channels() {
  const [properties, setProperties] = useState([]);
  const [sources, setSources] = useState([]);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    property_id: "",
    channel: "Airbnb",
    ical_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.properties)) return payload.properties;
    if (Array.isArray(payload?.sources)) return payload.sources;
    return [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propertyRes, sourceRes] = await Promise.all([
        api.get("/properties"),
        api.get("/calendar-sources"),
      ]);
      setProperties(normalizeArray(propertyRes.data));
      setSources(normalizeArray(sourceRes.data));
    } catch {
      showToast("error", "Failed to load channel data.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setForm({
      property_id: "",
      channel: "Airbnb",
      ical_url: "",
      is_active: true,
    });
    setEditId(null);
  };

  const closeForm = () => {
    resetForm();
    setShowForm(false);
  };

  const getChannelName = (channel) => {
    const value = String(channel || "Other").toLowerCase().trim();
    if (value.includes("booking")) return "Booking.com";
    if (value.includes("airbnb")) return "Airbnb";
    if (value.includes("agoda")) return "Agoda";
    if (value.includes("direct")) return "Direct";
    if (value.includes("website") || value.includes("web")) return "Website";
    return "Other";
  };

  const getChannelColor = (channelName) => {
    const cleanName = getChannelName(channelName);
    const channel = CHANNELS.find((item) => item.name === cleanName);
    return channel ? channel.color : "#475569";
  };

  const getPropertyName = (propertyId, sourceProperty) => {
    if (sourceProperty?.name) return sourceProperty.name;
    if (sourceProperty?.property_name) return sourceProperty.property_name;

    const property = properties.find(
      (item) => Number(item.id) === Number(propertyId)
    );

    return property ? property.name || property.property_name : "-";
  };

  const formatDateTime = (value) => {
    if (!value) return "Not synced yet";

    const date = new Date(value);

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const saveSource = async (e) => {
    e.preventDefault();

    if (!form.property_id) {
      showToast("error", "Please select property.");
      return;
    }

    if (!form.ical_url.trim()) {
      showToast("error", "Please enter calendar URL.");
      return;
    }

    try {
      const payload = {
        property_id: form.property_id,
        channel: form.channel,
        ical_url: form.ical_url,
        is_active: form.is_active,
      };

      if (editId) {
        await api.put(`/calendar-sources/${editId}`, payload);
        showToast("success", "Channel source updated successfully.");
      } else {
        await api.post("/calendar-sources", payload);
        showToast("success", "Channel source added successfully.");
      }

      resetForm();
      setShowForm(false);
      fetchData();
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Failed to save channel source."
      );
    }
  };

  const startEdit = (source) => {
    setEditId(source.id);
    setForm({
      property_id: source.property_id || "",
      channel: getChannelName(source.channel),
      ical_url: source.ical_url || "",
      is_active: Boolean(source.is_active),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSource = async (id) => {
    if (!window.confirm("Delete this channel source?")) return;

    try {
      await api.delete(`/calendar-sources/${id}`);
      fetchData();
      showToast("success", "Channel source deleted successfully.");
    } catch {
      showToast("error", "Failed to delete channel source.");
    }
  };

  const syncNow = async (id) => {
    try {
      await api.post(`/calendar-sources/${id}/sync`);
      fetchData();
      showToast("success", "Channel synced successfully.");
    } catch {
      showToast("error", "Failed to sync channel.");
    }
  };

  const totalConnected = sources.filter((source) => source.is_active).length;

  const ChannelForm = () => (
    <div className="bg-white rounded-[24px] sm:rounded-[30px] border border-gray-100 shadow-sm p-4 sm:p-7">
      <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-black text-white flex items-center justify-center">
            <Plus size={20} />
          </div>

          <div>
            <h2 className="text-lg sm:text-2xl font-black text-gray-950">
              {editId ? "Edit Channel" : "Add Channel"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Paste iCal URL.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={closeForm}
          className="xl:hidden w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <X size={17} />
        </button>
      </div>

      <form onSubmit={saveSource} className="space-y-3 sm:space-y-5">
        <div>
          <label className="block text-xs sm:text-sm font-black mb-1.5 text-gray-900">
            Property
          </label>

          <select
            value={form.property_id}
            onChange={(e) =>
              setForm({ ...form, property_id: e.target.value })
            }
            className="w-full h-12 sm:h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm sm:text-base font-bold outline-none"
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
          <label className="block text-xs sm:text-sm font-black mb-1.5 text-gray-900">
            Channel
          </label>

          <select
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value })}
            className="w-full h-12 sm:h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm sm:text-base font-bold outline-none"
          >
            {CHANNELS.map((channel) => (
              <option key={channel.name} value={channel.name}>
                {channel.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-black mb-1.5 text-gray-900">
            iCal URL
          </label>

          <textarea
            value={form.ical_url}
            onChange={(e) => setForm({ ...form, ical_url: e.target.value })}
            rows="3"
            placeholder="Paste calendar export URL..."
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm sm:text-base font-semibold outline-none resize-none"
          />
        </div>

        <label className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-3 sm:p-4">
          <div>
            <p className="font-black text-sm sm:text-base text-gray-950">
              Active Sync
            </p>
            <p className="text-[11px] sm:text-xs text-gray-500">
              Enable calendar connection.
            </p>
          </div>

          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="w-5 h-5"
          />
        </label>

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 h-12 sm:h-14 bg-black text-white rounded-2xl font-black text-sm sm:text-base"
          >
            {editId ? "Update" : "Save"}
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="h-12 sm:h-14 px-4 rounded-2xl bg-gray-100 text-gray-900 font-black text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
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

          <div className="mb-4 sm:mb-7">
            <div className="pl-20 sm:pl-0 mb-4">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-black text-white items-center justify-center">
                  <Link2 size={22} />
                </div>

                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                    Channels
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500">
                    Booking channel calendar sync.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3">
              <div className="bg-white rounded-[22px] border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-950 flex items-center justify-center">
                  <Wifi size={20} />
                </div>

                <div>
                  <p className="text-[11px] text-gray-500 font-bold">
                    Active
                  </p>
                  <p className="text-lg font-black text-gray-950">
                    {totalConnected}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="h-full min-h-[72px] rounded-[22px] bg-black text-white font-black flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-5 mb-5 sm:mb-6">
            {CHANNELS.map((channel) => {
              const connectedCount = sources.filter(
                (source) =>
                  getChannelName(source.channel) === channel.name &&
                  source.is_active
              ).length;

              return (
                <div
                  key={channel.name}
                  className="rounded-[20px] sm:rounded-[30px] p-3 sm:p-6 text-white shadow-sm min-h-[104px] sm:min-h-[170px]"
                  style={{ backgroundColor: channel.color }}
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                    <CalendarSync size={18} />
                  </div>

                  <p className="text-white/75 text-[10px] sm:text-sm mt-3 sm:mt-5">
                    Channel
                  </p>

                  <h2 className="text-sm sm:text-2xl font-black mt-0.5 truncate">
                    {channel.name}
                  </h2>

                  <p className="mt-2 text-[10px] sm:text-xs font-black bg-white/20 rounded-full px-2.5 py-1 inline-block">
                    {connectedCount} Connected
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6">
            <div
              className={`xl:col-span-4 ${
                showForm ? "block" : "hidden xl:block"
              }`}
            >
              <div className="xl:sticky xl:top-8">
                <ChannelForm />
              </div>
            </div>

            <div className="xl:col-span-8">
              <div className="bg-white rounded-[24px] sm:rounded-[30px] border border-gray-100 shadow-sm p-4 sm:p-7">
                <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black text-gray-950">
                      Connections
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                      {totalConnected} active source(s).
                    </p>
                  </div>

                  <div className="px-3 py-2 sm:px-5 sm:py-3 rounded-2xl bg-gray-100 text-gray-950 font-black text-xs sm:text-base">
                    {sources.length}
                  </div>
                </div>

                {loading ? (
                  <div className="h-[260px] sm:h-[360px] flex flex-col items-center justify-center text-gray-500">
                    <Loader2 className="animate-spin mb-3" size={30} />
                    <p className="text-sm">Loading channels...</p>
                  </div>
                ) : sources.length === 0 ? (
                  <div className="bg-gray-50 rounded-[22px] p-6 text-center">
                    <div className="w-14 h-14 mx-auto rounded-3xl bg-gray-100 text-gray-700 flex items-center justify-center">
                      <Link2 size={28} />
                    </div>

                    <h3 className="text-lg font-black text-gray-950 mt-4">
                      No channels yet
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Add first iCal URL.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3">
                    {sources.map((source) => {
                      const channelName = getChannelName(source.channel);
                      const channelColor = getChannelColor(source.channel);

                      return (
                        <div
                          key={source.id}
                          className="bg-white rounded-[22px] p-4 border border-gray-100 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
                              style={{ backgroundColor: channelColor }}
                            >
                              <CalendarSync size={22} />
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-black text-base text-gray-950 truncate">
                                {channelName}
                              </h3>
                              <p className="text-xs text-gray-500 truncate">
                                {getPropertyName(
                                  source.property_id,
                                  source.property
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="rounded-2xl bg-gray-50 p-3">
                              <p className="text-[10px] text-gray-400 uppercase font-black">
                                Status
                              </p>

                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black mt-1 ${
                                  source.is_active
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                <CheckCircle2 size={11} />
                                {source.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <div className="rounded-2xl bg-gray-50 p-3">
                              <p className="text-[10px] text-gray-400 uppercase font-black">
                                Last Sync
                              </p>
                              <p className="font-bold text-gray-700 text-[11px] mt-1 line-clamp-2">
                                {formatDateTime(source.last_synced_at)}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-gray-50 p-3 mt-2">
                            <p className="text-[10px] text-gray-400 uppercase font-black">
                              iCal URL
                            </p>
                            <p className="font-semibold text-gray-500 truncate text-xs mt-1">
                              {source.ical_url}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <button
                              onClick={() => startEdit(source)}
                              className="h-10 rounded-xl bg-gray-100 text-gray-900 font-black flex items-center justify-center"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              onClick={() => syncNow(source.id)}
                              className="h-10 rounded-xl bg-emerald-50 text-emerald-600 font-black flex items-center justify-center"
                            >
                              <RefreshCw size={15} />
                            </button>

                            <button
                              onClick={() => deleteSource(source.id)}
                              className="h-10 rounded-xl bg-red-50 text-red-500 font-black flex items-center justify-center"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-5 sm:mt-6 bg-gray-950 rounded-[24px] sm:rounded-[30px] p-4 sm:p-6 shadow-sm text-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-3xl bg-white/10 flex items-center justify-center shrink-0">
                    <Wifi size={24} />
                  </div>

                  <div>
                    <h3 className="text-base sm:text-xl font-black">
                      Calendar Sync
                    </h3>
                    <p className="text-gray-400 mt-0.5 text-xs sm:text-sm">
                      Keep iCal sources updated.
                    </p>
                  </div>
                </div>

                <div className="px-4 py-2 rounded-2xl bg-white text-gray-950 font-black text-sm">
                  {totalConnected}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}