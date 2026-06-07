import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  Building2,
  User,
  Mail,
  ShieldCheck,
  RefreshCw,
  Database,
  LogOut,
  Save,
} from "lucide-react";
import api from "../api/axios";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [channels, setChannels] = useState([]);
  const [toast, setToast] = useState(null);

  const [company, setCompany] = useState({
    name: "OmaSync",
    businessName: "OmaSync Property Management",
    email: "admin@omasync.com",
    phone: "+60",
    address: "Malaysia",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchChannels();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchChannels = async () => {
    try {
      const res = await api.get("/calendar-sources");
      setChannels(res.data);
    } catch {
      setChannels([]);
    }
  };

  const syncChannel = async (id) => {
    try {
      await api.post(`/calendar-sources/${id}/sync`);
      fetchChannels();
      showToast("success", "Channel synced successfully.");
    } catch {
      showToast("error", "Failed to sync channel.");
    }
  };

  const saveCompany = () => {
    localStorage.setItem("omasync_company", JSON.stringify(company));
    showToast("success", "Company settings saved.");
  };

  const clearCache = () => {
    localStorage.removeItem("omasync_company");
    showToast("success", "Local cache cleared.");
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

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
          <h1 className="text-4xl font-bold text-[#0D3B66]">Settings</h1>
          <p className="text-gray-500 mt-2">
            Manage company profile, channel sync and system preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-[#0D3B66] to-[#1B5E9E]">
            <User size={28} />
            <p className="text-white/75 mt-5">Current User</p>
            <h2 className="text-2xl font-bold mt-2">
              {user?.name || "Admin"}
            </h2>
            <p className="text-sm text-white/70 mt-1">
              {user?.email || "Logged in user"}
            </p>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-green-500 to-emerald-700">
            <ShieldCheck size={28} />
            <p className="text-white/75 mt-5">System Status</p>
            <h2 className="text-2xl font-bold mt-2">Active</h2>
            <p className="text-sm text-white/70 mt-1">
              OmaSync backend connected
            </p>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-slate-900 to-slate-700">
            <RefreshCw size={28} />
            <p className="text-white/75 mt-5">Connected Channels</p>
            <h2 className="text-2xl font-bold mt-2">{channels.length}</h2>
            <p className="text-sm text-white/70 mt-1">
              Airbnb / Agoda / Booking.com sources
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-7 border border-white/70">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#0D3B66]/10 text-[#0D3B66] flex items-center justify-center">
                <Building2 size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#0D3B66]">
                  Company Profile
                </h2>
                <p className="text-sm text-gray-500">
                  Used for invoices and monthly reports.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <input
                value={company.name}
                onChange={(e) =>
                  setCompany({ ...company, name: e.target.value })
                }
                placeholder="Brand name"
                className="w-full border border-gray-300 rounded-2xl px-4 py-3"
              />

              <input
                value={company.businessName}
                onChange={(e) =>
                  setCompany({ ...company, businessName: e.target.value })
                }
                placeholder="Business name"
                className="w-full border border-gray-300 rounded-2xl px-4 py-3"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  value={company.email}
                  onChange={(e) =>
                    setCompany({ ...company, email: e.target.value })
                  }
                  placeholder="Email"
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3"
                />

                <input
                  value={company.phone}
                  onChange={(e) =>
                    setCompany({ ...company, phone: e.target.value })
                  }
                  placeholder="Phone"
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3"
                />
              </div>

              <textarea
                value={company.address}
                onChange={(e) =>
                  setCompany({ ...company, address: e.target.value })
                }
                placeholder="Address"
                rows="3"
                className="w-full border border-gray-300 rounded-2xl px-4 py-3"
              />

              <button
                onClick={saveCompany}
                className="w-full bg-[#0D3B66] text-white py-3 rounded-2xl font-bold hover:bg-[#092B4A] transition flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save Company Settings
              </button>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-7 border border-white/70">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center">
                <RefreshCw size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#0D3B66]">
                  Channel Sync
                </h2>
                <p className="text-sm text-gray-500">
                  Monitor and sync calendar sources.
                </p>
              </div>
            </div>

            {channels.length === 0 ? (
              <div className="bg-gray-50 rounded-3xl p-10 text-center">
                <p className="text-gray-500">No channel sources connected.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-md"
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-bold text-gray-900">
                          {channel.channel}
                        </p>
                        <p className="text-sm text-gray-500">
                          {channel.property?.name || "Property"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 break-all">
                          {channel.ical_url}
                        </p>
                      </div>

                      <span
                        className={`h-fit px-3 py-1 rounded-full text-xs font-bold ${
                          channel.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {channel.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <p className="text-xs text-gray-400">
                        Last Sync:{" "}
                        {channel.last_synced_at
                          ? new Date(channel.last_synced_at).toLocaleString()
                          : "Never"}
                      </p>

                      <button
                        onClick={() => syncChannel(channel.id)}
                        className="px-4 py-2 rounded-xl bg-[#0D3B66] text-white text-sm font-bold hover:bg-[#092B4A] transition"
                      >
                        Sync Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-7 border border-white/70">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-[#0D3B66] flex items-center justify-center">
                <Database size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[#0D3B66]">
                  System Tools
                </h2>
                <p className="text-sm text-gray-500">
                  Local cache and browser settings.
                </p>
              </div>
            </div>

            <button
              onClick={clearCache}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200 transition"
            >
              Clear Local Cache
            </button>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] shadow-2xl p-7 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Mail size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-bold">Account</h2>
                <p className="text-sm text-gray-300">
                  Manage current login session.
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full bg-red-500/20 text-red-300 py-3 rounded-2xl font-bold hover:bg-red-500/30 transition flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}