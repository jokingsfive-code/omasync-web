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
} from "lucide-react";
import api from "../api/axios";

const API_URL = "https://web-production-2db875.up.railway.app";

const CHANNEL_COLORS = {
  Airbnb: "#FF5A5F",
  Agoda: "#FDB812",
  "Booking.com": "#003B95",
  Direct: "#16A34A",
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function Finance() {
  const [reservations, setReservations] = useState([]);
  const [properties, setProperties] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedProperty, setSelectedProperty] = useState("all");

  useEffect(() => {
    fetchReservations();
    fetchProperties();
    fetchExpenses();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await api.get("/reservations");
      setReservations(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await api.get("/properties");
      setProperties(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.log(err);
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

  const activeReservations = reservations.filter((r) => r.status !== "Cancelled");

  const filteredReservations = activeReservations.filter((reservation) => {
    return isSameMonthYear(reservation.check_in) && matchProperty(reservation);
  });

  const filteredExpenses = expenses.filter((expense) => {
    return isSameMonthYear(expense.expense_date) && matchProperty(expense);
  });

  const monthlyRevenue = filteredReservations.reduce(
    (sum, r) => sum + Number(r.total_price || 0),
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

  const revenueByChannel = ["Airbnb", "Agoda", "Booking.com", "Direct"].map(
    (channel) => {
      const revenue = filteredReservations
        .filter((r) => r.channel === channel)
        .reduce((sum, r) => sum + Number(r.total_price || 0), 0);

      return { channel, revenue };
    }
  );

  const expenseCategories = [
    "Cleaning",
    "Maintenance",
    "Utilities",
    "Internet",
    "Other",
  ];

  const expensesByCategory = expenseCategories.map((category) => {
    const total = filteredExpenses
      .filter((e) => e.category === category)
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
        .reduce((sum, r) => sum + Number(r.total_price || 0), 0);

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
    .sort((a, b) => new Date(b.check_in) - new Date(a.check_in))
    .slice(0, 8);

  const recentExpenses = [...filteredExpenses]
    .sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date))
    .slice(0, 8);

  return (
    <div className="flex">
      <Sidebar />

      <div
        className="flex-1 p-4 pt-20 md:p-8 md:pt-8 min-h-screen"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(127,157,177,0.35), transparent 35%), radial-gradient(circle at bottom right, rgba(13,59,102,0.14), transparent 35%), linear-gradient(135deg, #F3F6F8 0%, #E8EEF2 45%, #DCE7ED 100%)",
        }}
      >
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0D3B66]">
              Finance
            </h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">
              Monthly revenue, expenses, reports and invoices by property.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-4 border border-white/70 grid grid-cols-1 sm:grid-cols-2 xl:flex gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white font-semibold"
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
              className="w-full px-5 py-3 rounded-2xl border border-gray-200 bg-white font-semibold"
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
              className="w-full sm:col-span-2 xl:col-span-1 px-5 py-3 rounded-2xl border border-gray-200 bg-white font-semibold xl:min-w-[220px]"
            >
              <option value="all">All Properties</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>

            <button
              onClick={generateMonthlyReport}
              className="w-full sm:col-span-2 xl:col-span-1 px-6 py-3 rounded-2xl bg-[#0D3B66] text-white font-bold hover:bg-[#092B4A] transition flex items-center justify-center gap-2"
            >
              <FileDown size={18} />
              Monthly PDF
            </button>
          </div>
        </div>

        <div className="mb-6 md:mb-8 bg-gradient-to-r from-[#0D3B66] to-[#174B7A] text-white rounded-[28px] md:rounded-[32px] p-5 md:p-6 shadow-2xl flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <p className="text-blue-100 text-sm font-semibold">
              Active Finance Period
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">
              {MONTHS[selectedMonth].toUpperCase()} {selectedYear}
            </h2>
            <p className="text-blue-100 text-sm mt-2">
              Use Monthly PDF for owner report and Invoice PDF for individual
              guest billing.
            </p>
          </div>

          <button
            onClick={generateMonthlyReport}
            className="w-full xl:w-auto bg-white text-[#0D3B66] px-6 py-3 rounded-2xl font-bold hover:scale-[1.03] transition flex items-center justify-center gap-2"
          >
            <FileDown size={18} />
            Generate Monthly Report
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 md:gap-6 mb-6 md:mb-8">
          {[
            {
              icon: Wallet,
              label: "Monthly Revenue",
              value: `RM ${monthlyRevenue.toLocaleString()}`,
              color: "from-[#0D3B66] to-[#1B5E9E]",
            },
            {
              icon: ReceiptText,
              label: "Monthly Expenses",
              value: `RM ${monthlyExpenses.toLocaleString()}`,
              color: "from-red-500 to-red-700",
            },
            {
              icon: TrendingUp,
              label: "Net Profit",
              value: `RM ${netProfit.toLocaleString()}`,
              color:
                netProfit >= 0
                  ? "from-green-500 to-emerald-700"
                  : "from-orange-500 to-red-600",
            },
            {
              icon: CalendarCheck,
              label: "Average Booking",
              value: `RM ${Math.round(averageBookingValue).toLocaleString()}`,
              color: "from-orange-500 to-red-600",
            },
            {
              icon: Building2,
              label: "Paid Bookings",
              value: filteredReservations.length,
              color: "from-slate-900 to-slate-700",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`rounded-3xl p-5 md:p-6 text-white shadow-xl bg-gradient-to-br ${card.color}`}
              >
                <Icon size={26} />
                <p className="text-white/70 mt-5 text-sm">{card.label}</p>
                <h2 className="text-2xl md:text-3xl font-bold mt-2">
                  {card.value}
                </h2>
              </div>
            );
          })}
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] md:rounded-[32px] shadow-2xl p-4 md:p-7 border border-white/70 mb-6 md:mb-8">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0D3B66]">
                Invoice Center
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Download invoice PDF for each reservation in selected period.
              </p>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-[#0D3B66]/10 text-[#0D3B66] font-bold text-center">
              {filteredReservations.length} invoice(s)
            </div>
          </div>

          {filteredReservations.length === 0 ? (
            <div className="bg-gray-50 rounded-3xl p-10 md:p-12 text-center">
              <p className="text-gray-500">No invoices for selected period.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white rounded-3xl p-4 md:p-5 shadow-md border border-gray-100 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 hover:shadow-xl transition"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-lg text-gray-900 truncate">
                      {reservation.guest_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getPropertyName(reservation.property_id)} ·{" "}
                      {formatDate(reservation.check_in)} -{" "}
                      {formatDate(reservation.check_out)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 xl:flex xl:items-center gap-3">
                    <span
                      className="inline-flex px-3 py-1.5 rounded-full text-xs font-bold justify-center"
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

                    <p className="font-bold text-[#0D3B66] text-center xl:min-w-[110px] xl:text-right">
                      RM {Number(reservation.total_price || 0).toLocaleString()}
                    </p>

                    <button
                      onClick={() => generateInvoice(reservation.id)}
                      className="px-5 py-2.5 rounded-2xl bg-[#0D3B66] text-white font-bold hover:bg-[#092B4A] transition flex items-center justify-center gap-2"
                    >
                      <FileText size={16} />
                      Invoice PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-[28px] md:rounded-[32px] shadow-2xl p-4 md:p-7 border border-white/70">
            <h2 className="text-2xl font-bold text-[#0D3B66] mb-2">
              Revenue by Channel
            </h2>
            <p className="text-sm text-gray-500 mb-7">
              Based on selected month, year and property.
            </p>

            <div className="space-y-6">
              {revenueByChannel.map((item) => {
                const width = Math.max(
                  (item.revenue / maxChannelRevenue) * 100,
                  item.revenue > 0 ? 8 : 0
                );

                return (
                  <div key={item.channel}>
                    <div className="flex justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor:
                              CHANNEL_COLORS[item.channel] || "#6B7280",
                          }}
                        />
                        <p className="font-bold text-gray-900">
                          {item.channel}
                        </p>
                      </div>

                      <p className="font-bold text-[#0D3B66]">
                        RM {item.revenue.toLocaleString()}
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

          <div className="bg-white/90 backdrop-blur-xl rounded-[28px] md:rounded-[32px] shadow-2xl p-4 md:p-7 border border-white/70">
            <h2 className="text-2xl font-bold text-[#0D3B66] mb-2">
              Expenses by Category
            </h2>
            <p className="text-sm text-gray-500 mb-7">
              Track operational costs by category.
            </p>

            <div className="space-y-6">
              {expensesByCategory.map((item) => {
                const width = Math.max(
                  (item.total / maxExpenseCategory) * 100,
                  item.total > 0 ? 8 : 0
                );

                return (
                  <div key={item.category}>
                    <div className="flex justify-between gap-3 mb-2">
                      <p className="font-bold text-gray-900">{item.category}</p>
                      <p className="font-bold text-red-600">
                        RM {item.total.toLocaleString()}
                      </p>
                    </div>

                    <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
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

        <div className="bg-white/90 backdrop-blur-xl rounded-[28px] md:rounded-[32px] shadow-2xl p-4 md:p-7 border border-white/70 mb-6 md:mb-8">
          <h2 className="text-2xl font-bold text-[#0D3B66] mb-2">
            Property Profit Breakdown
          </h2>
          <p className="text-sm text-gray-500 mb-7">
            Revenue minus expenses by property.
          </p>

          <div className="space-y-6">
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
                  className="bg-white rounded-3xl p-4 md:p-5 shadow-md border border-gray-100"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-4">
                    <div>
                      <p className="font-bold text-lg text-gray-900">
                        {property.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {property.bookings} booking(s)
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p
                        className={`font-bold text-xl ${
                          property.profit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        RM {property.profit.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">Net Profit</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-[#0D3B66]">
                          Revenue
                        </span>
                        <span className="font-bold">
                          RM {property.revenue.toLocaleString()}
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
                        <span className="font-semibold text-red-500">
                          Expenses
                        </span>
                        <span className="font-bold">
                          RM {property.expenses.toLocaleString()}
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
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-[28px] md:rounded-[32px] shadow-2xl p-4 md:p-7 border border-white/70">
            <h2 className="text-2xl font-bold text-[#0D3B66]">
              Booking Revenue
            </h2>
            <p className="text-sm text-gray-500 mt-1 mb-7">
              Reservation income for selected period.
            </p>

            {recentRevenue.length === 0 ? (
              <div className="bg-gray-50 rounded-3xl p-10 md:p-12 text-center">
                <p className="text-gray-500">No revenue records.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRevenue.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="bg-white rounded-3xl p-4 md:p-5 shadow-md border border-gray-100"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900">
                          {reservation.guest_name}
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
                          className="inline-flex px-3 py-1.5 rounded-full text-xs font-bold mb-2"
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

                        <p className="font-bold text-[#0D3B66]">
                          RM{" "}
                          {Number(
                            reservation.total_price || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-[28px] md:rounded-[32px] shadow-2xl p-4 md:p-7 border border-white/70">
            <h2 className="text-2xl font-bold text-[#0D3B66]">
              Expense Records
            </h2>
            <p className="text-sm text-gray-500 mt-1 mb-7">
              Expenses for selected period.
            </p>

            {recentExpenses.length === 0 ? (
              <div className="bg-gray-50 rounded-3xl p-10 md:p-12 text-center">
                <p className="text-gray-500">No expense records.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="bg-white rounded-3xl p-4 md:p-5 shadow-md border border-gray-100"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                      <div>
                        <p className="font-bold text-gray-900">
                          {expense.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getPropertyName(expense.property_id)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(expense.expense_date)}
                        </p>
                      </div>

                      <div className="sm:text-right">
                        <span className="inline-flex px-3 py-1.5 rounded-full bg-red-100 text-red-600 text-xs font-bold mb-2">
                          {expense.category}
                        </span>

                        <p className="font-bold text-red-600">
                          RM {Number(expense.amount || 0).toLocaleString()}
                        </p>
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