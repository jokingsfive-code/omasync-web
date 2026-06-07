import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Wallet,
  CalendarCheck,
  Home,
  Percent,
  TrendingUp,
  Hotel,
  Loader2,
} from "lucide-react";
import api from "../api/axios";

const CHANNEL_COLORS = {
  Airbnb: "#FF385C",
  Agoda: "#9333EA",
  "Booking.com": "#2563EB",
  Booking: "#2563EB",
  Direct: "#059669",
  Website: "#F59E0B",
  Other: "#475569",
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Analytics() {
  const [properties, setProperties] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedProperty, setSelectedProperty] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.properties)) return payload.properties;
    if (Array.isArray(payload?.reservations)) return payload.reservations;
    return [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [propertyRes, reservationRes] = await Promise.all([
        api.get("/properties"),
        api.get("/reservations"),
      ]);

      setProperties(normalizeArray(propertyRes.data));
      setReservations(normalizeArray(reservationRes.data));
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const yearOptions = [];
  for (let year = 2024; year <= 2040; year++) yearOptions.push(year);

  const daysInSelectedMonth = new Date(
    Number(selectedYear),
    Number(selectedMonth) + 1,
    0
  ).getDate();

  const cleanDate = (value) => {
    if (!value) return "";
    return String(value).slice(0, 10);
  };

  const isSameMonthYear = (dateString) => {
    if (!dateString) return false;

    const date = new Date(cleanDate(dateString));

    return (
      date.getMonth() === Number(selectedMonth) &&
      date.getFullYear() === Number(selectedYear)
    );
  };

  const matchProperty = (item) => {
    if (selectedProperty === "all") return true;
    return Number(item.property_id) === Number(selectedProperty);
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

  const activeReservations = reservations.filter(
    (r) => String(r.status || "").toLowerCase() !== "cancelled"
  );

  const filteredReservations = activeReservations.filter((reservation) => {
    return isSameMonthYear(reservation.check_in) && matchProperty(reservation);
  });

  const selectedProperties =
    selectedProperty === "all"
      ? properties
      : properties.filter((p) => Number(p.id) === Number(selectedProperty));

  const totalRevenue = filteredReservations.reduce(
    (sum, r) => sum + Number(r.total_price || r.amount || 0),
    0
  );

  const totalBookings = filteredReservations.length;

  const averageDailyRate =
    totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const totalAvailableNights =
    selectedProperties.length * daysInSelectedMonth;

  const getNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(cleanDate(checkIn));
    const end = new Date(cleanDate(checkOut));

    const diffMs = end - start;
    const nights = diffMs / (1000 * 60 * 60 * 24);

    return nights > 0 ? nights : 0;
  };

  const totalBookedNights = filteredReservations.reduce(
    (sum, r) => sum + getNights(r.check_in, r.check_out),
    0
  );

  const occupancyRate =
    totalAvailableNights > 0
      ? (totalBookedNights / totalAvailableNights) * 100
      : 0;

  const revPAR =
    totalAvailableNights > 0 ? totalRevenue / totalAvailableNights : 0;

  const formatCurrency = (amount) => {
    return `RM ${Number(amount || 0).toLocaleString()}`;
  };

  const analyticsByProperty = selectedProperties.map((property) => {
    const propertyReservations = filteredReservations.filter(
      (r) => Number(r.property_id) === Number(property.id)
    );

    const revenue = propertyReservations.reduce(
      (sum, r) => sum + Number(r.total_price || r.amount || 0),
      0
    );

    const bookedNights = propertyReservations.reduce(
      (sum, r) => sum + getNights(r.check_in, r.check_out),
      0
    );

    const availableNights = daysInSelectedMonth;

    const occupancy =
      availableNights > 0 ? (bookedNights / availableNights) * 100 : 0;

    const adr =
      propertyReservations.length > 0
        ? revenue / propertyReservations.length
        : 0;

    const propertyRevPAR =
      availableNights > 0 ? revenue / availableNights : 0;

    return {
      ...property,
      bookings: propertyReservations.length,
      revenue,
      bookedNights,
      availableNights,
      occupancy,
      adr,
      revPAR: propertyRevPAR,
    };
  });

  const revenueByChannel = [
    "Airbnb",
    "Booking.com",
    "Agoda",
    "Direct",
    "Website",
    "Other",
  ].map((channel) => {
    const channelReservations = filteredReservations.filter(
      (r) => getChannelName(r.channel || r.source || r.platform) === channel
    );

    const revenue = channelReservations.reduce(
      (sum, r) => sum + Number(r.total_price || r.amount || 0),
      0
    );

    return {
      channel,
      revenue,
      bookings: channelReservations.length,
    };
  });

  const monthlyTrend = MONTHS.map((month, index) => {
    const monthReservations = activeReservations.filter((reservation) => {
      const date = new Date(cleanDate(reservation.check_in));

      const sameYear = date.getFullYear() === Number(selectedYear);
      const sameMonth = date.getMonth() === index;
      const sameProperty = matchProperty(reservation);

      return sameYear && sameMonth && sameProperty;
    });

    const revenue = monthReservations.reduce(
      (sum, r) => sum + Number(r.total_price || r.amount || 0),
      0
    );

    return {
      month,
      short: month.slice(0, 3),
      revenue,
      bookings: monthReservations.length,
    };
  });

  const maxPropertyRevenue = Math.max(
    ...analyticsByProperty.map((p) => p.revenue),
    1
  );

  const maxChannelRevenue = Math.max(
    ...revenueByChannel.map((item) => item.revenue),
    1
  );

  const maxMonthlyRevenue = Math.max(
    ...monthlyTrend.map((item) => item.revenue),
    1
  );

  const StatCard = ({ icon: Icon, title, value, subtitle, className }) => (
    <div
      className={`rounded-[26px] sm:rounded-[30px] p-5 sm:p-6 text-white shadow-sm border border-white/20 ${className}`}
    >
      <div className="w-11 h-11 rounded-2xl bg-white/18 flex items-center justify-center">
        <Icon size={22} />
      </div>

      <p className="text-white/75 text-xs sm:text-sm mt-5">{title}</p>
      <h2 className="text-xl sm:text-2xl font-black mt-1 truncate">{value}</h2>
      {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fb] lg:flex">
      <Sidebar />

      <main className="min-h-screen flex-1 w-full px-3 sm:px-6 lg:px-8 py-5 lg:py-8">
        <div className="w-full max-w-[1600px] mx-auto">
          <div className="mb-5 sm:mb-7 pl-20 sm:pl-0">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-black text-white items-center justify-center shadow-sm">
                  <BarChart3 size={22} />
                </div>

                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                    Analytics
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500">
                    Occupancy, ADR, RevPAR and revenue performance.
                  </p>
                </div>
              </div>

              <div className="w-full bg-white rounded-[26px] border border-gray-100 shadow-sm p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-white text-base font-bold text-gray-950 outline-none focus:ring-2 focus:ring-black/10"
                >
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-white text-base font-bold text-gray-950 outline-none focus:ring-2 focus:ring-black/10"
                >
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full h-14 px-4 rounded-2xl border border-gray-200 bg-white text-base font-bold text-gray-950 outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="all">All Properties</option>

                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name || property.property_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="h-[420px] bg-white rounded-[30px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="animate-spin mb-3" size={32} />
              <p className="text-sm">Loading analytics...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3 sm:gap-5 mb-6">
                <StatCard
                  icon={Wallet}
                  title="Revenue"
                  value={formatCurrency(totalRevenue)}
                  subtitle={`${MONTHS[selectedMonth]} ${selectedYear}`}
                  className="bg-gradient-to-br from-[#0D3B66] to-[#1B5E9E]"
                />

                <StatCard
                  icon={CalendarCheck}
                  title="Bookings"
                  value={totalBookings}
                  subtitle="Confirmed active bookings"
                  className="bg-gradient-to-br from-emerald-500 to-emerald-700"
                />

                <StatCard
                  icon={Percent}
                  title="Occupancy"
                  value={`${occupancyRate.toFixed(1)}%`}
                  subtitle={`${totalBookedNights} booked nights`}
                  className="bg-gradient-to-br from-orange-500 to-red-600"
                />

                <StatCard
                  icon={TrendingUp}
                  title="ADR"
                  value={formatCurrency(Math.round(averageDailyRate))}
                  subtitle="Average daily rate"
                  className="bg-gradient-to-br from-purple-500 to-indigo-700"
                />

                <StatCard
                  icon={Hotel}
                  title="RevPAR"
                  value={formatCurrency(Math.round(revPAR))}
                  subtitle="Revenue per available night"
                  className="bg-gradient-to-br from-slate-900 to-slate-700"
                />

                <StatCard
                  icon={Home}
                  title="Properties"
                  value={selectedProperties.length}
                  subtitle="Selected properties"
                  className="bg-gradient-to-br from-sky-500 to-blue-700"
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6 mb-6">
                <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5 sm:p-7">
                  <div className="flex items-start justify-between gap-4 mb-7">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-950">
                        Revenue by Channel
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Based on selected period and property.
                      </p>
                    </div>

                    <div className="w-11 h-11 rounded-2xl bg-gray-950 text-white flex items-center justify-center shrink-0">
                      <BarChart3 size={21} />
                    </div>
                  </div>

                  <div className="space-y-5">
                    {revenueByChannel.map((item) => {
                      const width = Math.max(
                        (item.revenue / maxChannelRevenue) * 100,
                        item.revenue > 0 ? 8 : 0
                      );

                      return (
                        <div key={item.channel}>
                          <div className="flex justify-between gap-4 mb-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-3.5 h-3.5 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    CHANNEL_COLORS[item.channel] || "#475569",
                                }}
                              />

                              <div className="min-w-0">
                                <p className="font-black text-gray-900 truncate">
                                  {item.channel}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {item.bookings} booking(s)
                                </p>
                              </div>
                            </div>

                            <p className="font-black text-gray-950 text-sm sm:text-base shrink-0">
                              {formatCurrency(item.revenue)}
                            </p>
                          </div>

                          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${width}%`,
                                backgroundColor:
                                  CHANNEL_COLORS[item.channel] || "#475569",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5 sm:p-7">
                  <div className="mb-7">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-950">
                      Monthly Revenue Trend
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Revenue trend across {selectedYear}.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {monthlyTrend.map((item) => {
                      const width = Math.max(
                        (item.revenue / maxMonthlyRevenue) * 100,
                        item.revenue > 0 ? 8 : 0
                      );

                      return (
                        <div key={item.month}>
                          <div className="flex justify-between gap-4 mb-1.5">
                            <div>
                              <p className="font-black text-gray-900 text-sm sm:text-base">
                                <span className="sm:hidden">{item.short}</span>
                                <span className="hidden sm:inline">
                                  {item.month}
                                </span>
                              </p>
                              <p className="text-xs text-gray-400">
                                {item.bookings} booking(s)
                              </p>
                            </div>

                            <p className="font-black text-gray-950 text-sm sm:text-base">
                              {formatCurrency(item.revenue)}
                            </p>
                          </div>

                          <div className="h-3.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-gray-950 rounded-[30px] p-5 sm:p-7 shadow-sm text-white">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black">
                      Property Performance
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Revenue, occupancy, ADR and RevPAR per property.
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <BarChart3 size={21} />
                  </div>
                </div>

                <div className="space-y-4">
                  {analyticsByProperty.map((property) => {
                    const width = Math.max(
                      (property.revenue / maxPropertyRevenue) * 100,
                      property.revenue > 0 ? 8 : 0
                    );

                    return (
                      <div
                        key={property.id}
                        className="bg-white/[0.06] border border-white/10 rounded-[26px] p-4 sm:p-5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <div className="min-w-0">
                            <h3 className="font-black text-lg truncate">
                              {property.name || property.property_name}
                            </h3>

                            <p className="text-gray-400 text-sm">
                              {property.bookings} booking(s) •{" "}
                              {property.bookedNights} booked night(s)
                            </p>
                          </div>

                          <p className="font-black text-yellow-300 text-xl">
                            {formatCurrency(property.revenue)}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-sm">
                          <div className="bg-white/[0.07] rounded-2xl p-3 sm:p-4">
                            <p className="text-gray-400 text-xs">Occupancy</p>
                            <p className="font-black text-base sm:text-lg">
                              {property.occupancy.toFixed(1)}%
                            </p>
                          </div>

                          <div className="bg-white/[0.07] rounded-2xl p-3 sm:p-4">
                            <p className="text-gray-400 text-xs">ADR</p>
                            <p className="font-black text-base sm:text-lg">
                              {formatCurrency(Math.round(property.adr))}
                            </p>
                          </div>

                          <div className="bg-white/[0.07] rounded-2xl p-3 sm:p-4">
                            <p className="text-gray-400 text-xs">RevPAR</p>
                            <p className="font-black text-base sm:text-lg">
                              {formatCurrency(Math.round(property.revPAR))}
                            </p>
                          </div>

                          <div className="bg-white/[0.07] rounded-2xl p-3 sm:p-4">
                            <p className="text-gray-400 text-xs">
                              Available Nights
                            </p>
                            <p className="font-black text-base sm:text-lg">
                              {property.availableNights}
                            </p>
                          </div>
                        </div>

                        <div className="h-5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-yellow-300"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {analyticsByProperty.length === 0 && (
                    <div className="bg-white/[0.06] rounded-[26px] p-8 text-center">
                      <p className="text-gray-400">
                        No property data available for selected filter.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}