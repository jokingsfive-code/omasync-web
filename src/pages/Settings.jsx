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
  Settings as SettingsIcon,
  CheckCircle2,
  Wifi,
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
    const storedCompany = localStorage.getItem("omasync_company");

    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedCompany) setCompany(JSON.parse(storedCompany));

    fetchChannels();
  }, []);

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.sources)) return payload.sources;
    return [];
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchChannels = async () => {
    try {
      const res = await api.get("/calendar-sources");
      setChannels(normalizeArray(res.data));
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

  const statCards = [
    {
      label: "Current User",
      value: user?.name || "Admin",
      subtitle: user?.email || "Logged in user",
      icon: User,
      className: "bg-gradient-to-br from-[#0D3B66] to-[#1B5E9E]",
    },
    {
      label: "System Status",
      value: "Active",
      subtitle: "OmaSync backend connected",
      icon: ShieldCheck,
      className: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    },
    {
      label: "Channels",
      value: channels.length,
      subtitle: "Connected calendar sources",
      icon: RefreshCw,
      className: "bg-gradient-to-br from-slate-900 to-slate-700",
    },
  ];

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
                  <SettingsIcon size={22} />
                </div>

                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                    Settings
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500">
                    Company profile, sync and account tools.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-5 mb-5 sm:mb-6">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className={`rounded-[20px] sm:rounded-[30px] p-3 sm:p-6 text-white shadow-sm min-h-[108px] sm:min-h-[170px] ${card.className}`}
                >
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Icon size={17} />
                  </div>

                  <p className="text-white/75 text-[9px] sm:text-sm mt-3 sm:mt-5 truncate">
                    {card.label}
                  </p>

                  <h2 className="text-sm sm:text-2xl font-black mt-0.5 truncate">
                    {card.value}
                  </h2>

                  <p className="hidden sm:block text-white/60 text-xs mt-1 truncate">
                    {card.subtitle}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
            <div className="bg-white rounded-[24px] sm:rounded-[30px] shadow-sm p-4 sm:p-7 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#eef1f5] text-gray-950 flex items-center justify-center">
                  <Building2 size={22} />
                </div>

                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-gray-950">
                    Company Profile
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Used for invoices and reports.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  value={company.name}
                  onChange={(e) =>
                    setCompany({ ...company, name: e.target.value })
                  }
                  placeholder="Brand name"
                  className="w-full h-12 sm:h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm sm:text-base font-bold outline-none"
                />

                <input
                  value={company.businessName}
                  onChange={(e) =>
                    setCompany({ ...company, businessName: e.target.value })
                  }
                  placeholder="Business name"
                  className="w-full h-12 sm:h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm sm:text-base font-bold outline-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    value={company.email}
                    onChange={(e) =>
                      setCompany({ ...company, email: e.target.value })
                    }
                    placeholder="Email"
                    className="w-full h-12 sm:h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm sm:text-base font-bold outline-none"
                  />

                  <input
                    value={company.phone}
                    onChange={(e) =>
                      setCompany({ ...company, phone: e.target.value })
                    }
                    placeholder="Phone"
                    className="w-full h-12 sm:h-14 px-4 rounded-2xl border border-gray-200 bg-white text-sm sm:text-base font-bold outline-none"
                  />
                </div>

                <textarea
                  value={company.address}
                  onChange={(e) =>
                    setCompany({ ...company, address: e.target.value })
                  }
                  placeholder="Address"
                  rows="3"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm sm:text-base font-semibold outline-none resize-none"
                />

                <button
                  onClick={saveCompany}
                  className="w-full h-12 sm:h-14 bg-black text-white rounded-2xl font-black flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Settings
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[24px] sm:rounded-[30px] shadow-sm p-4 sm:p-7 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <RefreshCw size={22} />
                </div>

                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-gray-950">
                    Channel Sync
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Monitor calendar sources.
                  </p>
                </div>
              </div>

              {channels.length === 0 ? (
                <div className="bg-gray-50 rounded-[22px] p-6 text-center">
                  <div className="w-14 h-14 mx-auto rounded-3xl bg-[#eef1f5] text-gray-700 flex items-center justify-center">
                    <Wifi size={28} />
                  </div>

                  <h3 className="text-lg font-black text-gray-950 mt-4">
                    No channels connected
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    Add iCal source in Channels page.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {channels.map((channel) => (
                    <div
                      key={channel.id}
                      className="bg-white rounded-[22px] p-4 border border-gray-100 shadow-sm"
                    >
                      <div className="flex justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-black text-gray-950 truncate">
                            {channel.channel}
                          </p>

                          <p className="text-xs text-gray-500 truncate">
                            {channel.property?.name ||
                              channel.property?.property_name ||
                              "Property"}
                          </p>

                          <p className="text-[11px] text-gray-400 mt-1 truncate">
                            {channel.ical_url}
                          </p>
                        </div>

                        <span
                          className={`h-fit px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                            channel.is_active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-[#eef1f5] text-gray-500"
                          }`}
                        >
                          {channel.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 mt-3">
                        <p className="text-[11px] text-gray-400 truncate">
                          Last Sync:{" "}
                          {channel.last_synced_at
                            ? new Date(channel.last_synced_at).toLocaleString()
                            : "Never"}
                        </p>

                        <button
                          onClick={() => syncChannel(channel.id)}
                          className="h-9 px-3 rounded-xl bg-black text-white text-xs font-black shrink-0"
                        >
                          Sync
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-[24px] sm:rounded-[30px] shadow-sm p-4 sm:p-7 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Database size={22} />
                </div>

                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-gray-950">
                    System Tools
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Local cache and browser settings.
                  </p>
                </div>
              </div>

              <button
                onClick={clearCache}
                className="w-full h-12 sm:h-14 bg-[#eef1f5] text-gray-900 rounded-2xl font-black hover:bg-gray-200 transition"
              >
                Clear Local Cache
              </button>
            </div>

            <div className="bg-gray-950 rounded-[24px] sm:rounded-[30px] shadow-sm p-4 sm:p-7 text-white">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Mail size={22} />
                </div>

                <div>
                  <h2 className="text-lg sm:text-2xl font-black">Account</h2>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Manage current login session.
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full h-12 sm:h-14 bg-red-500/20 text-red-300 rounded-2xl font-black hover:bg-red-500/30 transition flex items-center justify-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}