import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import api from "../api/axios";

const CHANNELS = [
  { name: "Airbnb", color: "#FF5A5F" },
  { name: "Agoda", color: "#FDB812" },
  { name: "Booking.com", color: "#003B95" },
  { name: "Direct", color: "#16A34A" },
];

export default function Channels() {
  const [properties, setProperties] = useState([]);
  const [sources, setSources] = useState([]);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    property_id: "",
    channel: "Airbnb",
    ical_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchProperties();
    fetchSources();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      setProperties(res.data);
    } catch {
      showToast("error", "Failed to load properties.");
    }
  };

  const fetchSources = async () => {
    try {
      const res = await api.get("/calendar-sources");
      setSources(res.data);
    } catch {
      showToast("error", "Failed to load channel sources.");
    }
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

  const getChannelColor = (channelName) => {
    const channel = CHANNELS.find((item) => item.name === channelName);
    return channel ? channel.color : "#6B7280";
  };

  const getPropertyName = (propertyId, sourceProperty) => {
    if (sourceProperty?.name) return sourceProperty.name;

    const property = properties.find(
      (item) => Number(item.id) === Number(propertyId)
    );

    return property ? property.name : "-";
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
      fetchSources();
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
      channel: source.channel || "Airbnb",
      ical_url: source.ical_url || "",
      is_active: Boolean(source.is_active),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSource = async (id) => {
    const confirmed = window.confirm("Delete this channel source?");
    if (!confirmed) return;

    try {
      await api.delete(`/calendar-sources/${id}`);
      fetchSources();
      showToast("success", "Channel source deleted successfully.");
    } catch {
      showToast("error", "Failed to delete channel source.");
    }
  };

  const syncNow = async (id) => {
    try {
      await api.post(`/calendar-sources/${id}/sync`);
      fetchSources();
      showToast("success", "Channel synced successfully.");
    } catch {
      showToast("error", "Failed to sync channel.");
    }
  };

  const totalConnected = sources.filter((source) => source.is_active).length;

  return (
    <div className="flex">
      <Sidebar />

      <div
        className="flex-1 p-8 min-h-screen relative"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(127,157,177,0.35), transparent 35%), linear-gradient(135deg, #F3F6F8 0%, #E8EEF2 45%, #DCE7ED 100%)",
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
              <p className="font-semibold">
                {toast.type === "success" ? "Success" : "Action Required"}
              </p>
              <p className="text-sm mt-1 text-gray-600">{toast.message}</p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0D3B66]">Channels</h1>
          <p className="text-gray-500 mt-2">
            Connect and monitor booking channels for calendar sync.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {CHANNELS.map((channel) => {
            const connectedCount = sources.filter(
              (source) => source.channel === channel.name && source.is_active
            ).length;

            return (
              <div
                key={channel.name}
                className="rounded-3xl p-6 text-white shadow-xl hover:shadow-2xl transition"
                style={{ backgroundColor: channel.color }}
              >
                <p className="text-white/80">Channel</p>
                <h2 className="text-2xl font-bold mt-2">{channel.name}</h2>

                <p className="mt-4 text-sm font-semibold bg-white/20 rounded-full px-3 py-1 inline-block">
                  {connectedCount} Connected
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-7 border border-white/70">
            <h2 className="text-2xl font-bold text-[#0D3B66]">
              {editId ? "Edit Channel Source" : "Add Channel Source"}
            </h2>

            <p className="text-sm text-gray-500 mt-1 mb-6">
              Paste iCal URL from Airbnb, Agoda or Booking.com.
            </p>

            <form onSubmit={saveSource} className="space-y-4">
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
                  Channel
                </label>

                <select
                  value={form.channel}
                  onChange={(e) =>
                    setForm({ ...form, channel: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white"
                >
                  {CHANNELS.map((channel) => (
                    <option key={channel.name} value={channel.name}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  iCal URL
                </label>

                <textarea
                  value={form.ical_url}
                  onChange={(e) =>
                    setForm({ ...form, ical_url: e.target.value })
                  }
                  rows="5"
                  placeholder="Paste calendar export URL here..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                />
                <span className="font-semibold text-gray-700">
                  Active sync source
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#0D3B66] text-white px-5 py-3 rounded-xl font-bold hover:bg-[#092B4A] transition"
                >
                  {editId ? "Update Source" : "Save Source"}
                </button>

                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-3 rounded-xl bg-gray-200 font-bold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="xl:col-span-2 bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-7 border border-white/70">
            <div className="flex justify-between items-center mb-7">
              <div>
                <h2 className="text-2xl font-bold text-[#0D3B66]">
                  Channel Connections
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {totalConnected} active source(s) connected.
                </p>
              </div>
            </div>

            {sources.length === 0 ? (
              <div className="bg-gray-50 rounded-3xl p-12 text-center">
                <p className="text-gray-500">
                  No channel sources yet. Add your first iCal URL.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="bg-white rounded-3xl p-5 shadow-md border border-gray-100 hover:shadow-xl transition"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-5 items-center">
                      <div className="flex items-center gap-4 lg:col-span-2">
                        <div
                          className="w-14 h-14 rounded-2xl shadow-lg"
                          style={{
                            backgroundColor: getChannelColor(source.channel),
                          }}
                        />

                        <div>
                          <h3 className="font-bold text-lg text-gray-900">
                            {source.channel}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {getPropertyName(source.property_id, source.property)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 uppercase">
                          Status
                        </p>

                        <span
                          className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold mt-1 ${
                            source.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {source.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 uppercase">
                          Last Sync
                        </p>

                        <p className="font-semibold text-gray-700">
                          {formatDateTime(source.last_synced_at)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400 uppercase">
                          Calendar URL
                        </p>

                        <p className="font-semibold text-gray-500 truncate max-w-[220px]">
                          {source.ical_url}
                        </p>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => startEdit(source)}
                          className="px-4 py-2 rounded-xl bg-blue-50 text-[#0D3B66] font-semibold hover:bg-blue-100 transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => syncNow(source.id)}
                          className="px-4 py-2 rounded-xl bg-green-50 text-green-600 font-semibold hover:bg-green-100 transition"
                        >
                          Sync
                        </button>

                        <button
                          onClick={() => deleteSource(source.id)}
                          className="px-4 py-2 rounded-xl bg-red-50 text-red-500 font-semibold hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}