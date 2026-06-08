import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Home,
  Loader2,
  X,
  User,
  Tag,
  Clock,
  Wallet,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";

const channelColors = {
  airbnb: {
    main: "bg-rose-500 border-rose-600 text-white",
    dot: "bg-rose-500",
    hex: "#FF385C",
    soft: "bg-rose-50 text-rose-600 border-rose-100",
    gradient: "from-rose-500 to-pink-600",
  },
  booking: {
    main: "bg-blue-600 border-blue-700 text-white",
    dot: "bg-blue-600",
    hex: "#2563EB",
    soft: "bg-blue-50 text-blue-700 border-blue-100",
    gradient: "from-blue-600 to-indigo-700",
  },
  agoda: {
    main: "bg-purple-600 border-purple-700 text-white",
    dot: "bg-purple-600",
    hex: "#9333EA",
    soft: "bg-purple-50 text-purple-700 border-purple-100",
    gradient: "from-purple-600 to-fuchsia-700",
  },
  direct: {
    main: "bg-emerald-600 border-emerald-700 text-white",
    dot: "bg-emerald-600",
    hex: "#059669",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-100",
    gradient: "from-emerald-500 to-teal-700",
  },
  website: {
    main: "bg-amber-500 border-amber-600 text-white",
    dot: "bg-amber-500",
    hex: "#F59E0B",
    soft: "bg-amber-50 text-amber-700 border-amber-100",
    gradient: "from-amber-500 to-orange-600",
  },
  other: {
    main: "bg-slate-600 border-slate-700 text-white",
    dot: "bg-slate-600",
    hex: "#475569",
    soft: "bg-slate-100 text-slate-700 border-slate-200",
    gradient: "from-slate-600 to-slate-900",
  },
};

const channelLabels = ["Airbnb", "Booking", "Agoda", "Direct", "Website", "Other"];

export default function Calendar() {
  const [reservations, setReservations] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const normalizeArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.reservations)) return payload.reservations;
    if (Array.isArray(payload?.properties)) return payload.properties;
    return [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [reservationRes, propertyRes] = await Promise.all([
        api.get("/reservations"),
        api.get("/properties"),
      ]);

      setReservations(normalizeArray(reservationRes.data));
      setProperties(normalizeArray(propertyRes.data));
    } catch (error) {
      console.error("Calendar fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [year, month, firstDay, daysInMonth]);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const cleanDate = (value) => {
    if (!value) return "";
    return String(value).slice(0, 10);
  };

  const formatDisplayDate = (value) => {
    if (!value) return "-";

    const date = new Date(cleanDate(value));
    const day = String(date.getDate()).padStart(2, "0");
    const monthValue = String(date.getMonth() + 1).padStart(2, "0");
    const yearValue = date.getFullYear();

    return `${day}-${monthValue}-${yearValue}`;
  };

  const todayOnly = new Date();
  todayOnly.setHours(0, 0, 0, 0);

  const isPastDate = (date) => {
    if (!date) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < todayOnly;
  };

  const isToday = (date) => {
    if (!date) return false;
    return formatDate(date) === formatDate(todayOnly);
  };

  const goPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(
      (p) => String(p.id) === String(propertyId)
    );

    return property?.name || property?.property_name || "Property";
  };

  const getBookingName = (booking) => {
    return (
      booking.guest_name ||
      booking.name ||
      booking.customer_name ||
      booking.guest ||
      "(Not available)"
    );
  };

  const getBookingChannel = (booking) => {
    return (
      booking.channel ||
      booking.source ||
      booking.platform ||
      booking.booking_channel ||
      "Other"
    );
  };

  const getChannelKey = (booking) => {
    const channel = String(getBookingChannel(booking)).toLowerCase().trim();

    if (channel.includes("booking")) return "booking";
    if (channel.includes("airbnb")) return "airbnb";
    if (channel.includes("agoda")) return "agoda";
    if (channel.includes("direct")) return "direct";
    if (channel.includes("website")) return "website";
    if (channel.includes("web")) return "website";

    return "other";
  };

  const getChannelStyle = (booking) => {
    return channelColors[getChannelKey(booking)] || channelColors.other;
  };

  const getInitial = (name) => {
    if (!name) return "?";
    return String(name).charAt(0).toUpperCase();
  };

  const getNights = (booking) => {
    const checkIn = cleanDate(
      booking.check_in ||
        booking.checkin_date ||
        booking.start_date ||
        booking.arrival_date
    );

    const checkOut = cleanDate(
      booking.check_out ||
        booking.checkout_date ||
        booking.end_date ||
        booking.departure_date
    );

    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = (end - start) / (1000 * 60 * 60 * 24);

    return nights > 0 ? nights : 0;
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];

    const dateStr = formatDate(date);

    return reservations.filter((booking) => {
      const checkIn = cleanDate(
        booking.check_in ||
          booking.checkin_date ||
          booking.start_date ||
          booking.arrival_date
      );

      const checkOut = cleanDate(
        booking.check_out ||
          booking.checkout_date ||
          booking.end_date ||
          booking.departure_date
      );

      if (!checkIn || !checkOut) return false;

      return dateStr >= checkIn && dateStr < checkOut;
    });
  };

  const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : [];
  const selectedRevenue = selectedBookings.reduce(
    (sum, booking) => sum + Number(booking.total_price || booking.amount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-300 lg:flex">
      <Sidebar />

      <main className="min-h-screen flex-1 w-full px-3 sm:px-6 lg:px-8 py-5 lg:py-8">
        <div className="w-full max-w-[1600px] mx-auto">
          <div className="mb-5 sm:mb-6 pl-20 sm:pl-0">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-black text-white items-center justify-center shadow-sm">
                <CalendarDays size={22} />
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
                  Calendar
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  Premium booking calendar overview.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-[26px] sm:rounded-[34px] border border-slate-300 shadow-md overflow-hidden">
            <div className="px-4 sm:px-7 py-5 border-b border-slate-300 bg-slate-50 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-950">
                  {monthName}
                </h2>
                <p className="text-sm text-gray-600">
                  Tap future date to view premium booking details.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goPrevMonth}
                  className="w-11 h-11 rounded-full border border-slate-300 bg-white flex items-center justify-center hover:bg-gray-50 active:scale-95 transition shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={goToday}
                  className="h-11 px-5 rounded-full bg-black text-white text-sm font-black hover:bg-gray-800 active:scale-95 transition shadow-sm"
                >
                  Today
                </button>

                <button
                  onClick={goNextMonth}
                  className="w-11 h-11 rounded-full border border-slate-300 bg-white flex items-center justify-center hover:bg-gray-50 active:scale-95 transition shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="px-4 sm:px-7 py-4 border-b border-slate-300 bg-slate-100 overflow-x-auto">
              <div className="flex items-center gap-4 min-w-max">
                {channelLabels.map((channel) => {
                  const key = channel.toLowerCase();

                  return (
                    <div
                      key={channel}
                      className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 font-bold"
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${
                          channelColors[key]?.dot || channelColors.other.dot
                        }`}
                      />
                      {channel}
                    </div>
                  );
                })}
              </div>
            </div>

            {loading ? (
              <div className="h-[420px] flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="animate-spin mb-3" size={32} />
                <p className="text-sm">Loading calendar...</p>
              </div>
            ) : (
              <div className="p-2 sm:p-4 bg-slate-200">
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="h-8 sm:h-10 flex items-center justify-center text-[10px] sm:text-xs font-black text-slate-600 uppercase tracking-wide"
                      >
                        {day}
                      </div>
                    )
                  )}

                  {calendarDays.map((date, index) => {
                    const bookings = getBookingsForDate(date);
                    const hasBooking = bookings.length > 0;
                    const past = date ? isPastDate(date) : false;
                    const active =
                      selectedDate &&
                      date &&
                      formatDate(selectedDate) === formatDate(date);

                    const mainStyle = hasBooking
                      ? getChannelStyle(bookings[0])
                      : null;

                    return (
                      <button
                        key={index}
                        type="button"
                        disabled={!date || past}
                        onClick={() => {
                          if (date && !past) setSelectedDate(date);
                        }}
                        className={`min-h-[78px] sm:min-h-[150px] rounded-2xl sm:rounded-3xl p-1.5 sm:p-3 text-left transition border relative overflow-hidden ${
                          !date
                            ? "bg-transparent border-transparent"
                            : past
                            ? "bg-slate-100 border-slate-200 opacity-45 cursor-not-allowed"
                            : active
                            ? "bg-gray-950 border-gray-950 shadow-xl scale-[0.99]"
                            : hasBooking
                            ? `${mainStyle.main} shadow-md hover:shadow-xl active:scale-[0.98]`
                            : "bg-white border-slate-300 shadow-sm hover:border-slate-400 hover:shadow-md active:scale-[0.98]"
                        }`}
                      >
                        {date && (
                          <>
                            <div className="flex items-center justify-between mb-1.5 sm:mb-3">
                              <div
                                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-sm font-black ${
                                  active
                                    ? "bg-white text-black"
                                    : hasBooking && !past
                                    ? "bg-white/95 text-gray-950"
                                    : isToday(date)
                                    ? "bg-black text-white"
                                    : "text-gray-950"
                                }`}
                              >
                                {date.getDate()}
                              </div>

                              {hasBooking && (
                                <span
                                  className={`text-[9px] sm:text-xs font-black ${
                                    hasBooking && !past
                                      ? "text-white"
                                      : "text-slate-500"
                                  }`}
                                >
                                  {bookings.length}
                                </span>
                              )}
                            </div>

                            {hasBooking && !past && (
                              <div className="space-y-1 sm:space-y-1.5">
                                {bookings.slice(0, 2).map((booking) => (
                                  <div
                                    key={booking.id}
                                    className="rounded-xl px-1.5 sm:px-2 py-1 sm:py-1.5 text-[8.5px] sm:text-[11px] leading-tight border border-white/30 bg-white/20 text-white shadow-sm"
                                  >
                                    <div className="font-black truncate">
                                      {getBookingName(booking)}
                                    </div>

                                    <div className="hidden sm:flex items-center gap-1 opacity-90 truncate">
                                      <Home size={10} />
                                      <span className="truncate">
                                        {getPropertyName(booking.property_id)}
                                      </span>
                                    </div>

                                    <div className="hidden sm:block text-[10px] opacity-90 truncate">
                                      {getBookingChannel(booking)}
                                    </div>
                                  </div>
                                ))}

                                {bookings.length > 2 && (
                                  <div className="text-[9px] sm:text-xs font-black px-1 text-white">
                                    +{bookings.length - 2} more
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {selectedDate && (
            <div className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6">
              <div className="w-full sm:max-w-3xl xl:max-w-5xl max-h-[92vh] overflow-hidden bg-white rounded-t-[34px] sm:rounded-[36px] shadow-2xl border border-white/70">
                <div className="relative overflow-hidden bg-gray-950 text-white px-5 sm:px-8 py-6 sm:py-8">
                  <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_top_left,_#60a5fa,_transparent_30%),radial-gradient(circle_at_bottom_right,_#22c55e,_transparent_28%)]" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs font-black text-white/80 mb-4">
                        <CalendarDays size={14} />
                        Selected Date
                      </div>

                      <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>

                      <p className="text-white/60 text-sm sm:text-base mt-1">
                        {selectedDate.getFullYear()} •{" "}
                        {selectedBookings.length} booking(s) •{" "}
                        {selectedRevenue > 0
                          ? `RM ${selectedRevenue.toLocaleString()} revenue`
                          : "No revenue"}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedDate(null)}
                      className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition shrink-0"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="relative grid grid-cols-3 gap-2 sm:gap-4 mt-6">
                    <div className="rounded-2xl bg-white/10 border border-white/10 p-3 sm:p-4">
                      <p className="text-white/50 text-[10px] sm:text-xs uppercase font-black">
                        Bookings
                      </p>
                      <p className="text-xl sm:text-2xl font-black mt-1">
                        {selectedBookings.length}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 border border-white/10 p-3 sm:p-4">
                      <p className="text-white/50 text-[10px] sm:text-xs uppercase font-black">
                        Revenue
                      </p>
                      <p className="text-xl sm:text-2xl font-black mt-1">
                        RM {selectedRevenue.toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/10 border border-white/10 p-3 sm:p-4">
                      <p className="text-white/50 text-[10px] sm:text-xs uppercase font-black">
                        Status
                      </p>
                      <p className="text-xl sm:text-2xl font-black mt-1">
                        {selectedBookings.length > 0 ? "Busy" : "Open"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="max-h-[58vh] sm:max-h-[62vh] overflow-y-auto bg-slate-100 p-4 sm:p-6">
                  {selectedBookings.length === 0 ? (
                    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-8 sm:p-10 text-center">
                      <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-700">
                        <CalendarDays size={30} />
                      </div>

                      <h4 className="text-2xl font-black text-gray-950 mt-5">
                        No booking on this date
                      </h4>

                      <p className="text-gray-500 mt-2">
                        This date is available for new reservation.
                      </p>

                      <Link
                        to={`/reservations?date=${formatDate(selectedDate)}`}
                        className="inline-flex items-center justify-center gap-2 mt-6 px-6 py-3 rounded-2xl bg-black text-white font-black"
                      >
                        <Plus size={18} />
                        Add Reservation
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {selectedBookings.map((booking) => {
                        const style = getChannelStyle(booking);
                        const channel = getBookingChannel(booking);
                        const checkIn =
                          booking.check_in ||
                          booking.checkin_date ||
                          booking.start_date ||
                          booking.arrival_date;
                        const checkOut =
                          booking.check_out ||
                          booking.checkout_date ||
                          booking.end_date ||
                          booking.departure_date;
                        const nights = getNights(booking);
                        const amount = Number(
                          booking.total_price || booking.amount || 0
                        );

                        return (
                          <div
                            key={booking.id}
                            className="group overflow-hidden rounded-[30px] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition"
                          >
                            <div
                              className={`bg-gradient-to-br ${style.gradient} p-5 text-white`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-14 h-14 rounded-3xl bg-white/20 border border-white/20 flex items-center justify-center text-2xl font-black shrink-0">
                                    {getInitial(getBookingName(booking))}
                                  </div>

                                  <div className="min-w-0">
                                    <h4 className="text-xl font-black truncate">
                                      {getBookingName(booking)}
                                    </h4>

                                    <p className="text-white/75 text-sm truncate">
                                      Reservation #{booking.id}
                                    </p>
                                  </div>
                                </div>

                                <span className="px-3 py-1.5 rounded-full bg-white/20 border border-white/20 text-xs font-black shrink-0">
                                  {channel}
                                </span>
                              </div>
                            </div>

                            <div className="p-5">
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                                  <p className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1">
                                    <Clock size={12} />
                                    Check In
                                  </p>
                                  <p className="text-sm font-black text-gray-950 mt-1">
                                    {formatDisplayDate(checkIn)}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                                  <p className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1">
                                    <Clock size={12} />
                                    Check Out
                                  </p>
                                  <p className="text-sm font-black text-gray-950 mt-1">
                                    {formatDisplayDate(checkOut)}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                                  <p className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1">
                                    <Home size={12} />
                                    Property
                                  </p>
                                  <p className="text-sm font-black text-gray-950 mt-1 truncate">
                                    {getPropertyName(booking.property_id)}
                                  </p>
                                </div>

                                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                                  <p className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1">
                                    <Wallet size={12} />
                                    Revenue
                                  </p>
                                  <p className="text-sm font-black text-gray-950 mt-1">
                                    RM {amount.toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-black ${style.soft}`}>
                                  <Tag size={13} />
                                  {channel}
                                </span>

                                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-black text-slate-700">
                                  <CalendarDays size={13} />
                                  {nights} night(s)
                                </span>

                                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 border border-slate-200 text-xs font-black text-slate-700">
                                  <User size={13} />
                                  {booking.status || "Confirmed"}
                                </span>
                              </div>

                              {booking.notes && (
                                <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                                  <p className="text-xs uppercase font-black text-slate-400">
                                    Notes
                                  </p>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {booking.notes}
                                  </p>
                                </div>
                              )}

                              <Link
                                to="/reservations?view=list"
                                className="mt-5 w-full h-12 rounded-2xl bg-black text-white font-black flex items-center justify-center gap-2 hover:bg-gray-800 transition"
                              >
                                Open Reservation
                                <ExternalLink size={16} />
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}