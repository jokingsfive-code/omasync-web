import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import {
  Wallet,
  CalendarCheck,
  TrendingUp,
  Building2,
  ReceiptText,
  FileDown,
  FileText,
  Loader2,
  BarChart3,
} from "lucide-react";
import api from "../api/axios";

const API_URL = "https://web-production-2db875.up.railway.app";

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

export default function Finance() {
  const [reservations, setReservations] = useState([]);
  const [properties, setProperties] = useState([]);
  const [expenses, setExpenses] = useState([]);
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
    if (Array.isArray(payload?.reservations)) return payload.reservations;
    if (Array.isArray(payload?.properties)) return payload.properties;
    if (Array.isArray(payload?.expenses)) return payload.expenses;
    return [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [reservationRes, propertyRes, expenseRes] = await Promise.all([
        api.get("/reservations"),
        api.get("/properties"),
        api.get("/expenses"),
      ]);

      setReservations(normalizeArray(reservationRes.data));
      setProperties(normalizeArray(propertyRes.data));
      setExpenses(normalizeArray(expenseRes.data));
    } catch (err) {
      console.error("Finance fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyReport = () => {
    const month = Number(selectedMonth) + 1;
    const url = `${API_URL}/api/reports/monthly-pdf?month=${month}&year=${selectedYear}&property_id=${selectedProperty}`;
    window.open(url, "_blank");
  };

  const generateInvoice = (reservationId) => {
    const url = `${API_URL}/api/invoices/reservations/${reservationId}/download`;
    window.open(url, "_blank");
  };

  const yearOptions = [];
  for (let year = 2024; year <= 2040; year++) yearOptions.push(year);

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

  const filteredExpenses = expenses.filter((expense) => {
    return isSameMonthYear(expense.expense_date) && matchProperty(expense);
  });

  const monthlyRevenue = filteredReservations.reduce(
    (sum, r) => sum + Number(r.total_price || r.amount || 0),
    0
  );

  const monthlyExpenses = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  const netProfit = monthlyRevenue - monthlyExpenses;

  const averageBookingValue =
    filteredReservations.length > 0
      ? monthlyRevenue / filteredReservations.length
      : 0;

  const getPropertyName = (propertyId) => {
    const property = properties.find((p) => Number(p.id) === Number(propertyId));
    return property ? property.name || property.property_name : "-";
  };

  const formatCurrency = (amount) => {
    return `RM ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(cleanDate(dateString));
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const revenueByChannel = [
    "Airbnb",
    "Booking.com",
    "Agoda",
    "Direct",
    "Website",
    "Other",
  ].map((channel) => {
    const revenue = filteredReservations
      .filter((r) => getChannelName(r.channel || r.source || r.platform) === channel)
      .reduce((sum, r) => sum + Number(r.total_price || r.amount || 0), 0);

    return { channel, revenue };
  });

  const expenseCategories = [
    "Cleaning",
    "Maintenance",
    "Utilities",
    "Internet",
    "Other",
  ];

  const expensesByCategory = expenseCategories.map((category) => {
    const total = filteredExpenses
      .filter((e) => String(e.category || "").toLowerCase() === category.toLowerCase())
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    return { category, total };
  });

  const revenueByProperty = properties
    .filter((property) => {
      if (selectedProperty === "all") return true;
      return Number(property.id) === Number(selectedProperty);
    })
    .map((property) => {
      const revenue = filteredReservations
        .filter((r) => Number(r.property_id) === Number(property.id))
        .reduce((sum, r) => sum + Number(r.total_price || r.amount || 0), 0);

      const propertyExpenses = filteredExpenses
        .filter((e) => Number(e.property_id) === Number(property.id))
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const bookings = filteredReservations.filter(
        (r) => Number(r.property_id) === Number(property.id)
      ).length;

      return {
        ...property,
        revenue,
        expenses: propertyExpenses,
        profit: revenue - propertyExpenses,
        bookings,
      };
    });

  const maxChannelRevenue = Math.max(
    ...revenueByChannel.map((item) => item.revenue),
    1
  );

  const maxExpenseCategory = Math.max(
    ...expensesByCategory.map((item) => item.total),
    1
  );

  const maxPropertyRevenue = Math.max(
    ...revenueByProperty.map((item) => Math.max(item.revenue, item.expenses)),
    1
  );

  const recentRevenue = [...filteredReservations]
    .sort((a, b) => new Date(cleanDate(b.check_in)) - new Date(cleanDate(a.check_in)))
    .slice(0, 8);

  const recentExpenses = [...filteredExpenses]
    .sort(
      (a, b) =>
        new Date(cleanDate(b.expense_date)) - new Date(cleanDate(a.expense_date))
    )
    .slice(0, 8);

  const StatCard = ({ icon: Icon, label, value, subtitle, className }) => (
    <div
      className={`rounded-[26px] sm:rounded-[30px] p-5 sm:p-6 text-white shadow-sm border border-white/20 ${className}`}
    >
      <div className="w-11 h-11 rounded-2xl bg-white/18 flex items-center justify-center">
        <Icon size={22} />
      </div>

      <p className="text-white/75 text-xs sm:text-sm mt-5">{label}</p>
      <h2 className="text-xl sm:text-2xl font-black mt-1 truncate">{value}</h2>
      {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fb] lg:flex">
      <Sidebar />

      <main className="min-h-screen flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 lg:py-8">
        <div className="w-full max-w-[1600px] mx-auto">
          <div className="mb-5 sm:mb-7">
            <div className="pl-20 sm:pl-0 mb-5">
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-black text-white items-center justify-center shadow-sm">
                  <Wallet size={22} />
                </div>

                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
                    Finance
                  </h1>
                  <p className="text-sm sm:text-base text-gray-500">
                    Monthly revenue, expenses, reports and invoices.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full bg-white rounded-[26px] border border-gray-100 shadow-sm p-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
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

              <button
                onClick={generateMonthlyReport}
                className="w-full h-14 rounded-2xl bg-black text-white font-black hover:bg-gray-800 active:scale-[0.98] transition flex items-center justify-center gap-2"
              >
                <FileDown size={18} />
                Monthly PDF
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-[420px] bg-white rounded-[30px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="animate-spin mb-3" size={32} />
              <p className="text-sm">Loading finance...</p>
            </div>
          ) : (
            <>
              <div className="mb-6 bg-gray-950 text-white rounded-[30px] p-5 sm:p-7 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                <div>
                  <p className="text-gray-400 text-sm font-bold">
                    Active Finance Period
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-black mt-1">
                    {MONTHS[selectedMonth].toUpperCase()} {selectedYear}
                  </h2>
                  <p className="text-gray-400 text-sm mt-2 max-w-2xl">
                    Use Monthly PDF for owner report and Invoice PDF for guest billing.
                  </p>
                </div>

                <button
                  onClick={generateMonthlyReport}
                  className="w-full xl:w-auto bg-white text-gray-950 px-6 py-3 rounded-2xl font-black hover:scale-[1.02] transition flex items-center justify-center gap-2"
                >
                  <FileDown size={18} />
                  Generate Monthly Report
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-3 sm:gap-5 mb-6">
                <StatCard
                  icon={Wallet}
                  label="Revenue"
                  value={formatCurrency(monthlyRevenue)}
                  subtitle={`${MONTHS[selectedMonth]} ${selectedYear}`}
                  className="bg-gradient-to-br from-[#0D3B66] to-[#1B5E9E]"
                />

                <StatCard
                  icon={ReceiptText}
                  label="Expenses"
                  value={formatCurrency(monthlyExpenses)}
                  subtitle="Monthly operating cost"
                  className="bg-gradient-to-br from-red-500 to-red-700"
                />

                <StatCard
                  icon={TrendingUp}
                  label="Net Profit"
                  value={formatCurrency(netProfit)}
                  subtitle={netProfit >= 0 ? "Positive profit" : "Loss this month"}
                  className={
                    netProfit >= 0
                      ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                      : "bg-gradient-to-br from-orange-500 to-red-600"
                  }
                />

                <StatCard
                  icon={CalendarCheck}
                  label="Average Booking"
                  value={formatCurrency(Math.round(averageBookingValue))}
                  subtitle="Average reservation value"
                  className="bg-gradient-to-br from-purple-500 to-indigo-700"
                />

                <StatCard
                  icon={Building2}
                  label="Paid Bookings"
                  value={filteredReservations.length}
                  subtitle="Active reservations"
                  className="bg-gradient-to-br from-slate-900 to-slate-700"
                />
              </div>

              <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5 sm:p-7 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-950">
                      Invoice Center
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Download invoice PDF for each reservation.
                    </p>
                  </div>

                  <div className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-950 font-black text-center">
                    {filteredReservations.length} invoice(s)
                  </div>
                </div>

                {filteredReservations.length === 0 ? (
                  <div className="bg-gray-50 rounded-[26px] p-8 text-center">
                    <p className="text-gray-500">No invoices for selected period.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredReservations.map((reservation) => {
                      const channel = getChannelName(
                        reservation.channel ||
                          reservation.source ||
                          reservation.platform
                      );

                      return (
                        <div
                          key={reservation.id}
                          className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="font-black text-gray-950 truncate">
                              {reservation.guest_name || reservation.name || "Guest"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {getPropertyName(reservation.property_id)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(reservation.check_in)} -{" "}
                              {formatDate(reservation.check_out)}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 xl:flex xl:items-center gap-3">
                            <span
                              className="inline-flex px-3 py-2 rounded-full text-xs font-black justify-center"
                              style={{
                                backgroundColor:
                                  CHANNEL_COLORS[channel] || "#475569",
                                color: "#ffffff",
                              }}
                            >
                              {channel}
                            </span>

                            <p className="font-black text-gray-950 text-center xl:min-w-[120px] xl:text-right">
                              {formatCurrency(reservation.total_price || 0)}
                            </p>

                            <button
                              onClick={() => generateInvoice(reservation.id)}
                              className="px-5 py-3 rounded-2xl bg-black text-white font-black hover:bg-gray-800 transition flex items-center justify-center gap-2"
                            >
                              <FileText size={16} />
                              Invoice PDF
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                              <p className="font-black text-gray-900 truncate">
                                {item.channel}
                              </p>
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
                      Expenses by Category
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Track operational costs by category.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {expensesByCategory.map((item) => {
                      const width = Math.max(
                        (item.total / maxExpenseCategory) * 100,
                        item.total > 0 ? 8 : 0
                      );

                      return (
                        <div key={item.category}>
                          <div className="flex justify-between gap-4 mb-2">
                            <p className="font-black text-gray-900">
                              {item.category}
                            </p>
                            <p className="font-black text-red-600">
                              {formatCurrency(item.total)}
                            </p>
                          </div>

                          <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-red-400 to-orange-500"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5 sm:p-7 mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-gray-950">
                  Property Profit Breakdown
                </h2>
                <p className="text-sm text-gray-500 mt-1 mb-6">
                  Revenue minus expenses by property.
                </p>

                <div className="space-y-4">
                  {revenueByProperty.map((property) => {
                    const revenueWidth = Math.max(
                      (property.revenue / maxPropertyRevenue) * 100,
                      property.revenue > 0 ? 8 : 0
                    );

                    const expenseWidth = Math.max(
                      (property.expenses / maxPropertyRevenue) * 100,
                      property.expenses > 0 ? 8 : 0
                    );

                    return (
                      <div
                        key={property.id}
                        className="bg-white rounded-[26px] p-4 sm:p-5 border border-gray-100 shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
                          <div>
                            <p className="font-black text-lg text-gray-950">
                              {property.name || property.property_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {property.bookings} booking(s)
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <p
                              className={`font-black text-xl ${
                                property.profit >= 0
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatCurrency(property.profit)}
                            </p>
                            <p className="text-xs text-gray-400">Net Profit</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-bold text-blue-700">
                                Revenue
                              </span>
                              <span className="font-black">
                                {formatCurrency(property.revenue)}
                              </span>
                            </div>

                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-500"
                                style={{ width: `${revenueWidth}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-bold text-red-500">
                                Expenses
                              </span>
                              <span className="font-black">
                                {formatCurrency(property.expenses)}
                              </span>
                            </div>

                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-red-400 to-orange-500"
                                style={{ width: `${expenseWidth}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {revenueByProperty.length === 0 && (
                    <div className="bg-gray-50 rounded-[26px] p-8 text-center">
                      <p className="text-gray-500">
                        No property finance data available.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
                <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5 sm:p-7">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-950">
                    Booking Revenue
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 mb-6">
                    Reservation income for selected period.
                  </p>

                  {recentRevenue.length === 0 ? (
                    <div className="bg-gray-50 rounded-[26px] p-8 text-center">
                      <p className="text-gray-500">No revenue records.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentRevenue.map((reservation) => {
                        const channel = getChannelName(
                          reservation.channel ||
                            reservation.source ||
                            reservation.platform
                        );

                        return (
                          <div
                            key={reservation.id}
                            className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                              <div>
                                <p className="font-black text-gray-950">
                                  {reservation.guest_name ||
                                    reservation.name ||
                                    "Guest"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {getPropertyName(reservation.property_id)}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatDate(reservation.check_in)}
                                </p>
                              </div>

                              <div className="sm:text-right">
                                <span
                                  className="inline-flex px-3 py-1.5 rounded-full text-xs font-black mb-2"
                                  style={{
                                    backgroundColor:
                                      CHANNEL_COLORS[channel] || "#475569",
                                    color: "#ffffff",
                                  }}
                                >
                                  {channel}
                                </span>

                                <p className="font-black text-gray-950">
                                  {formatCurrency(reservation.total_price || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-5 sm:p-7">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-950">
                    Expense Records
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 mb-6">
                    Expenses for selected period.
                  </p>

                  {recentExpenses.length === 0 ? (
                    <div className="bg-gray-50 rounded-[26px] p-8 text-center">
                      <p className="text-gray-500">No expense records.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentExpenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="bg-white rounded-[24px] p-4 border border-gray-100 shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                            <div>
                              <p className="font-black text-gray-950">
                                {expense.description || "Expense"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {getPropertyName(expense.property_id)}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatDate(expense.expense_date)}
                              </p>
                            </div>

                            <div className="sm:text-right">
                              <span className="inline-flex px-3 py-1.5 rounded-full bg-red-100 text-red-600 text-xs font-black mb-2">
                                {expense.category || "Other"}
                              </span>

                              <p className="font-black text-red-600">
                                {formatCurrency(expense.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
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