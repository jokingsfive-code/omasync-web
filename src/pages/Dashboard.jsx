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
  Airbnb: "#FF5A5F",
  Agoda: "#FDB812",
  "Booking.com": "#003B95",
  Direct: "#16A34A",
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

  const fetchProperties = async () => {
    const res = await api.get("/properties");
    setProperties(res.data);
  };

  const fetchReservations = async () => {
    const res = await api.get("/reservations");
    setReservations(res.data);
  };

  const fetchHousekeepingTasks = async () => {
    try {
      const res = await api.get("/housekeeping");
      setHousekeepingTasks(res.data);
    } catch {
      setHousekeepingTasks([]);
    }
  };

  const today = new Date();
  const todayString = today.toISOString().slice(0, 10);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const activeReservations = reservations.filter(
    (r) => r.status !== "Cancelled"
  );

  const checkInsToday = activeReservations.filter(
    (r) => r.check_in === todayString
  );

  const checkOutsToday = activeReservations.filter(
    (r) => r.check_out === todayString
  );

  const pendingCleaning = housekeepingTasks.filter(
    (task) => task.status === "Pending"
  );

  const cleaningInProgress = housekeepingTasks.filter(
    (task) => task.status === "In Progress"
  );

  const readyRooms = housekeepingTasks.filter(
    (task) => task.status === "Ready"
  );

  const monthlySales = activeReservations
    .filter((r) => {
      const date = new Date(r.check_in);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce((sum, r) => sum + Number(r.total_price || 0), 0);

  const getPropertyName = (propertyId) => {
    const property = properties.find((p) => Number(p.id) === Number(propertyId));
    return property ? property.name : "-";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);
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
    .filter((r) => r.check_in >= todayString)
    .sort((a, b) => new Date(a.check_in) - new Date(b.check_in))
    .slice(0, 6);

  const kpiCards = [
    {
      title: "New Bookings",
      value: activeReservations.length,
      subtitle: "Total active reservations",
      icon: CalendarCheck,
      gradient: "from-[#0D3B66] to-[#1B5E9E]",
      link: "/reservations?view=list",
    },
    {
      title: "Check-In Today",
      value: checkInsToday.length,
      subtitle: `${checkInsToday.length} guest(s) arriving`,
      icon: LogIn,
      gradient: "from-[#16A34A] to-[#047857]",
      link: "/reservations?filter=checkin&view=list",
    },
    {
      title: "Check-Out Today",
      value: checkOutsToday.length,
      subtitle: `${checkOutsToday.length} guest(s) leaving`,
      icon: LogOut,
      gradient: "from-[#F97316] to-[#DC2626]",
      link: "/reservations?filter=checkout&view=list",
    },
    {
      title: "Monthly Sales",
      value: `RM ${monthlySales.toLocaleString()}`,
      subtitle: "Revenue this month",
      icon: Wallet,
      gradient: "from-[#7F9DB1] to-[#4F6F87]",
      link: "/analytics",
    },
  ];

  const operationCards = [
    {
      title: "Today’s Arrivals",
      value: checkInsToday.length,
      subtitle: "Guests checking in today",
      icon: LogIn,
      link: "/reservations?filter=checkin&view=list",
      color: "from-green-500 to-emerald-700",
    },
    {
      title: "Today’s Departures",
      value: checkOutsToday.length,
      subtitle: "Guests checking out today",
      icon: LogOut,
      link: "/reservations?filter=checkout&view=list",
      color: "from-orange-500 to-red-600",
    },
    {
      title: "Pending Cleaning",
      value: pendingCleaning.length,
      subtitle: "Rooms waiting for cleaning",
      icon: Sparkles,
      link: "/housekeeping",
      color: "from-red-500 to-rose-700",
    },
    {
      title: "Cleaning In Progress",
      value: cleaningInProgress.length,
      subtitle: "Currently being cleaned",
      icon: Clock,
      link: "/housekeeping",
      color: "from-blue-500 to-indigo-700",
    },
    {
      title: "Ready Rooms",
      value: readyRooms.length,
      subtitle: "Clean and ready",
      icon: CheckCircle2,
      link: "/housekeeping",
      color: "from-teal-500 to-emerald-700",
    },
  ];

  return (
    <div className="flex">
      <Sidebar />

      <div
        className="flex-1 p-8 min-h-screen"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(127,157,177,0.35), transparent 35%), radial-gradient(circle at bottom right, rgba(13,59,102,0.15), transparent 35%), linear-gradient(135deg, #F3F6F8 0%, #E8EEF2 45%, #DCE7ED 100%)",
        }}
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#0D3B66]">Dashboard</h1>
          <p className="text-gray-500 mt-2">
            Smart channel manager overview for bookings, guests and revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {kpiCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                to={card.link}
                key={card.title}
                className={`rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br ${card.gradient} hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white/80 font-medium">{card.title}</p>
                    <h2 className="text-4xl font-bold mt-3">{card.value}</h2>
                    <p className="text-sm text-white/70 mt-2">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Icon size={24} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-[32px] shadow-2xl p-7 border border-white/70 bg-white/90 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-7">
            <div>
              <h2 className="text-2xl font-bold text-[#0D3B66]">
                Operations Summary
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Today’s guest movement and room cleaning status.
              </p>
            </div>

            <Link
              to="/housekeeping"
              className="px-5 py-2.5 rounded-2xl bg-[#0D3B66] text-white font-bold hover:bg-[#092B4A] transition"
            >
              Open Housekeeping
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {operationCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  to={card.link}
                  key={card.title}
                  className={`rounded-3xl p-5 text-white shadow-xl bg-gradient-to-br ${card.color} hover:shadow-2xl hover:-translate-y-1 transition`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white/75 text-sm font-semibold">
                        {card.title}
                      </p>

                      <h3 className="text-4xl font-bold mt-3">
                        {card.value}
                      </h3>

                      <p className="text-white/75 text-xs mt-2">
                        {card.subtitle}
                      </p>
                    </div>

                    <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
                      <Icon size={22} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
          <div className="xl:col-span-2 rounded-3xl p-6 shadow-2xl bg-gradient-to-br from-[#0D3B66] to-[#174B7A] text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Analytics by Property</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Revenue bar chart by property. Click any property to view
                  analytics.
                </p>
              </div>

              <Link
                to="/analytics"
                className="w-12 h-12 rounded-2xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
              >
                <BarChart3 size={24} />
              </Link>
            </div>

            <div className="space-y-5">
              {analyticsByProperty.map((property) => {
                const barWidth = Math.max(
                  (property.revenue / maxRevenue) * 100,
                  8
                );

                return (
                  <Link
                    to="/analytics"
                    key={property.id}
                    className="block p-5 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
                  >
                    <div className="flex justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{property.name}</h3>
                        <p className="text-blue-100 text-sm">
                          {property.location}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-blue-100">Revenue</p>
                        <p className="text-xl font-bold text-yellow-300">
                          RM {property.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm mb-2">
                      <span>Bookings: {property.bookings}</span>
                      <span>Occupancy: {property.occupancy}%</span>
                      <span className="text-green-300 font-bold">Active</span>
                    </div>

                    <div className="h-4 bg-white/20 rounded-full overflow-hidden">
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

          <div className="rounded-3xl p-6 shadow-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col min-h-[430px]">
            <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>

            <div className="grid grid-rows-4 gap-4 flex-1">
              <Link
                to="/reservations"
                className="bg-gradient-to-r from-[#0D3B66] to-[#1B5E9E] rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition shadow-lg"
              >
                <Plus size={24} />
                <span>Add Reservation</span>
              </Link>

              <Link
                to="/properties"
                className="bg-white/12 hover:bg-white/20 rounded-2xl font-bold flex items-center justify-center gap-3 transition"
              >
                <Home size={24} />
                <span>Manage Properties</span>
              </Link>

              <Link
                to="/calendar"
                className="bg-green-500/25 hover:bg-green-500/35 rounded-2xl font-bold flex items-center justify-center gap-3 transition"
              >
                <CalendarCheck size={24} />
                <span>Open Calendar</span>
              </Link>

              <Link
                to="/channels"
                className="bg-yellow-500/25 hover:bg-yellow-500/35 rounded-2xl font-bold flex items-center justify-center gap-3 transition"
              >
                <RefreshCw size={24} />
                <span>Sync Channels</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[32px] shadow-2xl p-7 border border-white/70 bg-white/90 backdrop-blur-xl">
          <div className="flex justify-between items-start mb-7">
            <div>
              <h2 className="text-2xl font-bold text-[#0D3B66]">
                Upcoming Arrivals
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Next guest check-ins across all properties.
              </p>
            </div>

            <Link
              to="/reservations?view=list"
              className="px-5 py-2.5 rounded-2xl bg-[#0D3B66] text-white font-bold hover:bg-[#092B4A] transition"
            >
              View All
            </Link>
          </div>

          {upcomingArrivals.length === 0 ? (
            <div className="bg-gray-50 rounded-3xl p-12 text-center">
              <p className="text-gray-500">No upcoming arrivals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {upcomingArrivals.map((reservation) => (
                <Link
                  to="/reservations?view=list"
                  key={reservation.id}
                  className="bg-white rounded-3xl p-5 shadow-md border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                        style={{
                          backgroundColor:
                            CHANNEL_COLORS[reservation.channel] || "#0D3B66",
                        }}
                      >
                        {getInitial(reservation.guest_name)}
                      </div>

                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {reservation.guest_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getPropertyName(reservation.property_id)}
                        </p>
                      </div>
                    </div>

                    <span
                      className="px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
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

                  <div className="grid grid-cols-3 gap-4 mt-5">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">
                        Check In
                      </p>
                      <p className="font-bold text-gray-900">
                        {formatDate(reservation.check_in)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase">
                        Check Out
                      </p>
                      <p className="font-bold text-gray-900">
                        {formatDate(reservation.check_out)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 uppercase">
                        Revenue
                      </p>
                      <p className="font-bold text-[#0D3B66]">
                        RM{" "}
                        {Number(
                          reservation.total_price || 0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-5">
                    <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                      {reservation.status}
                    </span>

                    <span className="text-sm font-bold text-[#0D3B66]">
                      View booking →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}