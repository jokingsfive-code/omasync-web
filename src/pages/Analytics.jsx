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
} from "lucide-react";
import api from "../api/axios";

const CHANNEL_COLORS = {
  Airbnb: "#FF5A5F",
  Agoda: "#FDB812",
  "Booking.com": "#003B95",
  Direct: "#16A34A",
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

  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedProperty, setSelectedProperty] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const propertyRes = await api.get("/properties");
    const reservationRes = await api.get("/reservations");

    setProperties(propertyRes.data);
    setReservations(reservationRes.data);
  };

  const yearOptions = [];
  for (let year = 2024; year <= 2040; year++) {
    yearOptions.push(year);
  }

  const daysInSelectedMonth = new Date(
    Number(selectedYear),
    Number(selectedMonth) + 1,
    0
  ).getDate();

  const isSameMonthYear = (dateString) => {
    if (!dateString) return false;

    const date = new Date(dateString);

    return (
      date.getMonth() === Number(selectedMonth) &&
      date.getFullYear() === Number(selectedYear)
    );
  };

  const matchProperty = (item) => {
    if (selectedProperty === "all") return true;
    return Number(item.property_id) === Number(selectedProperty);
  };

  const activeReservations = reservations.filter(
    (r) => r.status !== "Cancelled"
  );

  const filteredReservations = activeReservations.filter((reservation) => {
    return isSameMonthYear(reservation.check_in) && matchProperty(reservation);
  });

  const selectedProperties =
    selectedProperty === "all"
      ? properties
      : properties.filter((p) => Number(p.id) === Number(selectedProperty));

  const totalRevenue = filteredReservations.reduce(
    (sum, r) => sum + Number(r.total_price || 0),
    0
  );

  const totalBookings = filteredReservations.length;

  const averageDailyRate =
    totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const totalAvailableNights =
    selectedProperties.length * daysInSelectedMonth;

  const getNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

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

  const getPropertyName = (propertyId) => {
    const property = properties.find((p) => Number(p.id) === Number(propertyId));
    return property ? property.name : "-";
  };

  const formatCurrency = (amount) => {
    return `RM ${Number(amount || 0).toLocaleString()}`;
  };

  const analyticsByProperty = selectedProperties.map((property) => {
    const propertyReservations = filteredReservations.filter(
      (r) => Number(r.property_id) === Number(property.id)
    );

    const revenue = propertyReservations.reduce(
      (sum, r) => sum + Number(r.total_price || 0),
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

  const revenueByChannel = ["Airbnb", "Agoda", "Booking.com", "Direct"].map(
    (channel) => {
      const channelReservations = filteredReservations.filter(
        (r) => r.channel === channel
      );

      const revenue = channelReservations.reduce(
        (sum, r) => sum + Number(r.total_price || 0),
        0
      );

      return {
        channel,
        revenue,
        bookings: channelReservations.length,
      };
    }
  );

  const monthlyTrend = MONTHS.map((month, index) => {
    const monthReservations = activeReservations.filter((reservation) => {
      const date = new Date(reservation.check_in);

      const sameYear = date.getFullYear() === Number(selectedYear);
      const sameMonth = date.getMonth() === index;
      const sameProperty = matchProperty(reservation);

      return sameYear && sameMonth && sameProperty;
    });

    const revenue = monthReservations.reduce(
      (sum, r) => sum + Number(r.total_price || 0),
      0
    );

    return {
      month,
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

  return (
    <div className="flex">
      <Sidebar />

      <div
        className="flex-1 p-8 min-h-screen"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(127,157,177,0.35), transparent 35%), radial-gradient(circle at bottom right, rgba(13,59,102,0.14), transparent 35%), linear-gradient(135deg, #F3F6F8 0%, #E8EEF2 45%, #DCE7ED 100%)",
        }}
      >
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#0D3B66]">Analytics</h1>

            <p className="text-gray-500 mt-2">
              Occupancy, ADR, RevPAR and revenue performance.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-4 border border-white/70 flex flex-col md:flex-row gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-5 py-3 rounded-2xl border border-gray-200 bg-white font-semibold"
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
              className="px-5 py-3 rounded-2xl border border-gray-200 bg-white font-semibold"
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
              className="px-5 py-3 rounded-2xl border border-gray-200 bg-white font-semibold min-w-[220px]"
            >
              <option value="all">All Properties</option>

              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-[#0D3B66] to-[#1B5E9E]">
            <Wallet size={28} />
            <p className="text-white/70 mt-5">Revenue</p>
            <h2 className="text-2xl font-bold mt-2">
              {formatCurrency(totalRevenue)}
            </h2>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-green-500 to-emerald-700">
            <CalendarCheck size={28} />
            <p className="text-white/70 mt-5">Bookings</p>
            <h2 className="text-2xl font-bold mt-2">{totalBookings}</h2>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Percent size={28} />
            <p className="text-white/70 mt-5">Occupancy</p>
            <h2 className="text-2xl font-bold mt-2">
              {occupancyRate.toFixed(1)}%
            </h2>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-purple-500 to-indigo-700">
            <TrendingUp size={28} />
            <p className="text-white/70 mt-5">ADR</p>
            <h2 className="text-2xl font-bold mt-2">
              {formatCurrency(Math.round(averageDailyRate))}
            </h2>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-slate-900 to-slate-700">
            <Hotel size={28} />
            <p className="text-white/70 mt-5">RevPAR</p>
            <h2 className="text-2xl font-bold mt-2">
              {formatCurrency(Math.round(revPAR))}
            </h2>
          </div>

          <div className="rounded-3xl p-6 text-white shadow-xl bg-gradient-to-br from-[#7F9DB1] to-[#4F6F87]">
            <Home size={28} />
            <p className="text-white/70 mt-5">Properties</p>
            <h2 className="text-2xl font-bold mt-2">
              {selectedProperties.length}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-7 border border-white/70">
            <div className="flex justify-between items-center mb-7">
              <div>
                <h2 className="text-2xl font-bold text-[#0D3B66]">
                  Revenue by Channel
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Based on selected period and property.
                </p>
              </div>

              <BarChart3 className="text-[#0D3B66]" />
            </div>

            <div className="space-y-6">
              {revenueByChannel.map((item) => {
                const width = Math.max(
                  (item.revenue / maxChannelRevenue) * 100,
                  item.revenue > 0 ? 8 : 0
                );

                return (
                  <div key={item.channel}>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor:
                              CHANNEL_COLORS[item.channel] || "#6B7280",
                          }}
                        />

                        <div>
                          <p className="font-bold text-gray-900">
                            {item.channel}
                          </p>
                          <p className="text-xs text-gray-400">
                            {item.bookings} booking(s)
                          </p>
                        </div>
                      </div>

                      <p className="font-bold text-[#0D3B66]">
                        {formatCurrency(item.revenue)}
                      </p>
                    </div>

                    <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${width}%`,
                          backgroundColor:
                            CHANNEL_COLORS[item.channel] || "#6B7280",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl p-7 border border-white/70">
            <h2 className="text-2xl font-bold text-[#0D3B66] mb-2">
              Monthly Revenue Trend
            </h2>
            <p className="text-sm text-gray-500 mb-7">
              Revenue trend across {selectedYear}.
            </p>

            <div className="space-y-4">
              {monthlyTrend.map((item) => {
                const width = Math.max(
                  (item.revenue / maxMonthlyRevenue) * 100,
                  item.revenue > 0 ? 8 : 0
                );

                return (
                  <div key={item.month}>
                    <div className="flex justify-between mb-1">
                      <div>
                        <p className="font-bold text-gray-900">
                          {item.month}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.bookings} booking(s)
                        </p>
                      </div>

                      <p className="font-bold text-[#0D3B66]">
                        {formatCurrency(item.revenue)}
                      </p>
                    </div>

                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-500"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0D3B66] to-[#174B7A] rounded-[32px] p-8 shadow-2xl text-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">
                Property Performance
              </h2>

              <p className="text-blue-100 text-sm mt-1">
                Revenue, occupancy, ADR and RevPAR per property.
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <BarChart3 />
            </div>
          </div>

          <div className="space-y-6">
            {analyticsByProperty.map((property) => {
              const width = Math.max(
                (property.revenue / maxPropertyRevenue) * 100,
                property.revenue > 0 ? 8 : 0
              );

              return (
                <div
                  key={property.id}
                  className="bg-white/10 border border-white/20 rounded-3xl p-5"
                >
                  <div className="flex justify-between gap-5 mb-4">
                    <div>
                      <h3 className="font-bold text-lg">
                        {property.name}
                      </h3>

                      <p className="text-blue-100 text-sm">
                        {property.bookings} booking(s) •{" "}
                        {property.bookedNights} booked night(s)
                      </p>
                    </div>

                    <p className="font-bold text-yellow-300 text-xl">
                      {formatCurrency(property.revenue)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div className="bg-white/10 rounded-2xl p-4">
                      <p className="text-blue-100">Occupancy</p>
                      <p className="font-bold text-lg">
                        {property.occupancy.toFixed(1)}%
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-4">
                      <p className="text-blue-100">ADR</p>
                      <p className="font-bold text-lg">
                        {formatCurrency(Math.round(property.adr))}
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-4">
                      <p className="text-blue-100">RevPAR</p>
                      <p className="font-bold text-lg">
                        {formatCurrency(Math.round(property.revPAR))}
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-2xl p-4">
                      <p className="text-blue-100">Available Nights</p>
                      <p className="font-bold text-lg">
                        {property.availableNights}
                      </p>
                    </div>
                  </div>

                  <div className="h-6 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-yellow-300 shadow-lg"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {analyticsByProperty.length === 0 && (
              <div className="bg-white/10 rounded-3xl p-10 text-center">
                <p className="text-blue-100">
                  No property data available for selected filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}