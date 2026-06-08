import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  LogIn,
  LogOut,
  Wallet,
  Home,
  BarChart3,
  Plus,
  RefreshCw,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import api from "../api/axios";

const CHANNEL_COLORS = {
  Airbnb: "#FF385C",
  Agoda: "#9333EA",
  "Booking.com": "#2563EB",
  Booking: "#2563EB",
  Direct: "#059669",
  Website: "#F59E0B",
};

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [housekeepingTasks, setHousekeepingTasks] = useState([]);

  useEffect(() => {
    fetchProperties();
    fetchReservations();
    fetchHousekeepingTasks();
  }, []);

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.properties)) return payload.properties;
    if (Array.isArray(payload?.reservations)) return payload.reservations;
    if (Array.isArray(payload?.tasks)) return payload.tasks;
    return [];
  };

  const fetchProperties = async () => {
    const res = await api.get("/properties");
    setProperties(normalizeArray(res.data));
  };

  const fetchReservations = async () => {
    const res = await api.get("/reservations");
    setReservations(normalizeArray(res.data));
  };

  const fetchHousekeepingTasks = async () => {
    try {
      const res = await api.get("/housekeeping");
      setHousekeepingTasks(normalizeArray(res.data));
    } catch {
      setHousekeepingTasks([]);
    }
  };

  const today = new Date();
  const todayString = today.toISOString().slice(0, 10);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const activeReservations = reservations.filter(
    (r) => String(r.status || "").toLowerCase() !== "cancelled"
  );

  const checkInsToday = activeReservations.filter(
    (r) => String(r.check_in).slice(0, 10) === todayString
  );

  const checkOutsToday = activeReservations.filter(
    (r) => String(r.check_out).slice(0, 10) === todayString
  );

  const pendingCleaning = housekeepingTasks.filter(
    (task) => task.status === "Pending"
  );

  const cleaningInProgress = housekeepingTasks.filter(
    (task) => task.status === "In Progress"
  );

  const readyRooms = housekeepingTasks.filter((task) => task.status === "Ready");

  const monthlySales = activeReservations
    .filter((r) => {
      const date = new Date(String(r.check_in).slice(0, 10));
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, r) => sum + Number(r.total_price || 0), 0);

  const getPropertyName = (propertyId) => {
    const property = properties.find((p) => Number(p.id) === Number(propertyId));
    return property ? property.name || property.property_name : "-";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(String(dateString).slice(0, 10));
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const analyticsByProperty = properties.map((property) => {
    const propertyReservations = activeReservations.filter(
      (r) => Number(r.property_id) === Number(property.id)
    );

    const revenue = propertyReservations.reduce(
      (sum, r) => sum + Number(r.total_price || 0),
      0
    );

    const occupancy = Math.min(propertyReservations.length * 12, 100);

    return {
      ...property,
      bookings: propertyReservations.length,
      revenue,
      occupancy,
    };
  });

  const maxRevenue = Math.max(
    ...analyticsByProperty.map((p) => Number(p.revenue || 0)),
    1
  );

  const upcomingArrivals = activeReservations
    .filter((r) => String(r.check_in).slice(0, 10) >= todayString)
    .sort((a, b) => new Date(a.check_in) - new Date(b.check_in))
    .slice(0, 6);

  const kpiCards = [
    {
      title: "Bookings",
      value: activeReservations.length,
      subtitle: "Active reservations",
      icon: CalendarCheck,
      gradient: "from-[#0D3B66] to-[#1B5E9E]",
      link: "/reservations?view=list",
    },
    {
      title: "Check-In",
      value: checkInsToday.length,
      subtitle: "Today",
      icon: LogIn,
      gradient: "from-emerald-500 to-emerald-700",
      link: "/reservations?filter=checkin&view=list",
    },
    {
      title: "Check-Out",
      value: checkOutsToday.length,
      subtitle: "Today",
      icon: LogOut,
      gradient: "from-orange-500 to-red-600",
      link: "/reservations?filter=checkout&view=list",
    },
    {
      title: "Sales",
      value: `RM ${monthlySales.toLocaleString()}`,
      subtitle: "This month",
      icon: Wallet,
      gradient: "from-slate-900 to-slate-700",
      link: "/analytics",
    },
  ];

  const operationCards = [
    {
      title: "Arrivals",
      value: checkInsToday.length,
      subtitle: "Today",
      icon: LogIn,
      link: "/reservations?filter=checkin&view=list",
      color: "from-emerald-500 to-emerald-700",
    },
    {
      title: "Departures",
      value: checkOutsToday.length,
      subtitle: "Today",
      icon: LogOut,
      link: "/reservations?filter=checkout&view=list",
      color: "from-orange-500 to-red-600",
    },
    {
      title: "Pending",
      value: pendingCleaning.length,
      subtitle: "Cleaning",
      icon: Sparkles,
      link: "/housekeeping",
      color: "from-red-500 to-rose-700",
    },
    {
      title: "Progress",
      value: cleaningInProgress.length,
      subtitle: "Cleaning",
      icon: Clock,
      link: "/housekeeping",
      color: "from-blue-500 to-indigo-700",
    },
    {
      title: "Ready",
      value: readyRooms.length,
      subtitle: "Rooms",
      icon: CheckCircle2,
      link: "/housekeeping",
      color: "from-teal-500 to-emerald-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-200 lg:flex">
      <Sidebar />

      <main className="min-h-screen flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 lg:py-8">
        <div className="w-full max-w-[1600px] mx-auto">
          <div className="pl-20 sm:pl-0 mb-4 sm:mb-7">
            <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
              Dashboard
            </h1>
            <p className="text-base sm:text-lg text-gray-600">
              Smart channel manager overview.
            </p>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-5 mb-5 sm:mb-7">
            {kpiCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  to={card.link}
                  key={card.title}
                  className={`rounded-[20px] sm:rounded-[30px] p-3 sm:p-6 text-white shadow-sm bg-gradient-to-br ${card.gradient} min-h-[112px] sm:min-h-[170px] active:scale-[0.98] transition`}
                >
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Icon size={18} />
                  </div>

                  <p className="text-white/80 text-xs sm:text-base mt-3 sm:mt-5 truncate">
                    {card.title}
                  </p>

                  <h2 className="text-2xl sm:text-4xl font-black mt-1 truncate">
                    {card.value}
                  </h2>

                  <p className="text-white/65 text-xs sm:text-sm mt-1 truncate">
                    {card.subtitle}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="bg-white rounded-[24px] sm:rounded-[30px] shadow-sm p-4 sm:p-7 border border-gray-100 mb-5 sm:mb-7">
            <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-3xl font-black text-gray-950">
                  Operations
                </h2>
                <p className="text-sm sm:text-base text-gray-500">
                  Guest movement and cleaning status.
                </p>
              </div>

              <Link
                to="/housekeeping"
                className="px-4 py-2 sm:px-5 sm:py-3 rounded-2xl bg-black text-white font-black text-sm sm:text-base"
              >
                Open
              </Link>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-5">
              {operationCards.map((card) => {
                const Icon = card.icon;

                return (
                  <Link
                    to={card.link}
                    key={card.title}
                    className={`rounded-[18px] sm:rounded-[26px] p-2.5 sm:p-5 text-white shadow-sm bg-gradient-to-br ${card.color} min-h-[96px] sm:min-h-[155px] active:scale-[0.98] transition`}
                  >
                    <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center">
                      <Icon size={16} />
                    </div>

                    <p className="text-white/80 text-[11px] sm:text-base mt-2.5 sm:mt-5 truncate">
                      {card.title}
                    </p>

                    <h3 className="text-2xl sm:text-5xl font-black mt-1">
                      {card.value}
                    </h3>

                    <p className="hidden sm:block text-white/70 text-sm mt-1 truncate">
                      {card.subtitle}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6">
            <div className="xl:col-span-2 rounded-[24px] sm:rounded-[30px] p-4 sm:p-7 shadow-sm bg-gray-950 text-white">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black">
                    Analytics by Property
                  </h2>
                  <p className="text-gray-400 text-sm sm:text-base mt-1">
                    Revenue by property.
                  </p>
                </div>

                <Link
                  to="/analytics"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center"
                >
                  <BarChart3 size={22} />
                </Link>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {analyticsByProperty.map((property) => {
                  const barWidth = Math.max(
                    (property.revenue / maxRevenue) * 100,
                    property.revenue > 0 ? 8 : 0
                  );

                  return (
                    <Link
                      to="/analytics"
                      key={property.id}
                      className="block p-4 sm:p-5 rounded-[22px] bg-white/10 border border-white/10"
                    >
                      <div className="flex justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <h3 className="font-black text-base sm:text-xl truncate">
                            {property.name || property.property_name}
                          </h3>
                          <p className="text-gray-400 text-sm sm:text-base truncate">
                            {property.location}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-xs sm:text-sm text-gray-400">
                            Revenue
                          </p>
                          <p className="text-base sm:text-2xl font-black text-yellow-300">
                            RM {property.revenue.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs sm:text-base mb-2 text-gray-300">
                        <span>{property.bookings} bookings</span>
                        <span>{property.occupancy}% occ.</span>
                        <span className="text-emerald-300 font-black">
                          Active
                        </span>
                      </div>

                      <div className="h-3 sm:h-4 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[24px] sm:rounded-[30px] p-4 sm:p-6 shadow-sm bg-gray-950 text-white">
              <h2 className="text-xl sm:text-3xl font-black mb-4">
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
                <Link
                  to="/reservations"
                  className="h-20 sm:h-24 bg-[#0D3B66] rounded-2xl font-black flex items-center justify-center gap-2 text-base"
                >
                  <Plus size={20} />
                  Reservation
                </Link>

                <Link
                  to="/properties"
                  className="h-20 sm:h-24 bg-white/10 rounded-2xl font-black flex items-center justify-center gap-2 text-base"
                >
                  <Home size={20} />
                  Properties
                </Link>

                <Link
                  to="/calendar"
                  className="h-20 sm:h-24 bg-emerald-500/25 rounded-2xl font-black flex items-center justify-center gap-2 text-base"
                >
                  <CalendarCheck size={20} />
                  Calendar
                </Link>

                <Link
                  to="/channels"
                  className="h-20 sm:h-24 bg-yellow-500/25 rounded-2xl font-black flex items-center justify-center gap-2 text-base"
                >
                  <RefreshCw size={20} />
                  Channels
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-7 bg-white rounded-[24px] sm:rounded-[30px] shadow-sm p-4 sm:p-7 border border-gray-100">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl sm:text-3xl font-black text-gray-950">
                  Upcoming Arrivals
                </h2>
                <p className="text-sm sm:text-base text-gray-500">
                  Next guest check-ins.
                </p>
              </div>

              <Link
                to="/reservations?view=list"
                className="px-4 py-2 sm:px-5 sm:py-3 rounded-2xl bg-black text-white font-black text-sm sm:text-base"
              >
                View
              </Link>
            </div>

            {upcomingArrivals.length === 0 ? (
              <div className="bg-gray-50 rounded-[22px] p-8 text-center">
                <p className="text-gray-500">No upcoming arrivals.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-5">
                {upcomingArrivals.map((reservation) => (
                  <Link
                    to="/reservations?view=list"
                    key={reservation.id}
                    className="bg-white rounded-[22px] p-4 border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white font-black shadow-sm shrink-0"
                          style={{
                            backgroundColor:
                              CHANNEL_COLORS[reservation.channel] || "#0D3B66",
                          }}
                        >
                          {getInitial(reservation.guest_name)}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-black text-lg text-gray-950 truncate">
                            {reservation.guest_name}
                          </h3>
                          <p className="text-base text-gray-500 truncate">
                            {getPropertyName(reservation.property_id)}
                          </p>
                        </div>
                      </div>

                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-black shrink-0"
                        style={{
                          backgroundColor:
                            CHANNEL_COLORS[reservation.channel] || "#6B7280",
                          color: "#ffffff",
                        }}
                      >
                        {reservation.channel}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="rounded-2xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-400 uppercase font-black">
                          In
                        </p>
                        <p className="font-black text-gray-900 text-sm mt-1">
                          {formatDate(reservation.check_in)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-400 uppercase font-black">
                          Out
                        </p>
                        <p className="font-black text-gray-900 text-sm mt-1">
                          {formatDate(reservation.check_out)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-gray-50 p-3">
                        <p className="text-xs text-gray-400 uppercase font-black">
                          Revenue
                        </p>
                        <p className="font-black text-[#0D3B66] text-sm mt-1">
                          RM {Number(reservation.total_price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}