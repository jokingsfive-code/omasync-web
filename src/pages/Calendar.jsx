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
} from "lucide-react";

const channelColors = {
  airbnb: "bg-rose-500 text-white border-rose-600",
  booking: "bg-blue-600 text-white border-blue-700",
  agoda: "bg-purple-600 text-white border-purple-700",
  direct: "bg-emerald-600 text-white border-emerald-700",
  website: "bg-amber-500 text-white border-amber-600",
  other: "bg-slate-600 text-white border-slate-700",
};

const channelLabels = [
  "Airbnb",
  "Booking",
  "Agoda",
  "Direct",
  "Website",
  "Other",
];

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

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

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
      "Guest"
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
    return String(getBookingChannel(booking)).toLowerCase();
  };

  const getChannelColor = (booking) => {
    return channelColors[getChannelKey(booking)] || channelColors.other;
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

  const isToday = (date) => {
    if (!date) return false;

    const today = new Date();

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <Sidebar />

      <main className="lg:ml-64 min-h-screen px-3 sm:px-6 lg:px-8 py-5 lg:py-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-5 sm:mb-6 pl-16 sm:pl-0">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex w-11 h-11 rounded-2xl bg-black text-white items-center justify-center shadow-sm">
                <CalendarDays size={22} />
              </div>

              <div>
                <h1 className="text-3xl sm:text-3xl font-black text-gray-950 tracking-tight">
                  Calendar
                </h1>
                <p className="text-sm text-gray-500">
                  Airbnb style booking calendar.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[26px] sm:rounded-[30px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-950">
                  {monthName}
                </h2>
                <p className="text-sm text-gray-500">
                  Tap any date to view booking details.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goPrevMonth}
                  className="w-11 h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={goToday}
                  className="h-11 px-5 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 active:scale-95 transition"
                >
                  Today
                </button>

                <button
                  onClick={goNextMonth}
                  className="w-11 h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 overflow-x-auto">
              <div className="flex items-center gap-4 min-w-max">
                {channelLabels.map((channel) => {
                  const key = channel.toLowerCase();

                  return (
                    <div
                      key={channel}
                      className="flex items-center gap-2 text-xs sm:text-sm text-gray-600"
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${
                          channelColors[key]?.split(" ")[0] ||
                          channelColors.other.split(" ")[0]
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
              <div className="p-2 sm:p-4">
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 bg-transparent">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="h-8 sm:h-10 flex items-center justify-center text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-wide"
                      >
                        {day}
                      </div>
                    )
                  )}

                  {calendarDays.map((date, index) => {
                    const bookings = getBookingsForDate(date);
                    const active =
                      selectedDate &&
                      date &&
                      formatDate(selectedDate) === formatDate(date);

                    return (
                      <button
                        key={index}
                        type="button"
                        disabled={!date}
                        onClick={() => date && setSelectedDate(date)}
                        className={`min-h-[76px] sm:min-h-[150px] rounded-2xl sm:rounded-3xl p-1.5 sm:p-3 text-left transition border ${
                          !date
                            ? "bg-transparent border-transparent"
                            : active
                            ? "bg-gray-950 border-gray-950 shadow-md"
                            : "bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm active:scale-[0.98]"
                        }`}
                      >
                        {date && (
                          <>
                            <div className="flex items-center justify-between mb-1.5 sm:mb-3">
                              <div
                                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-sm font-black ${
                                  active
                                    ? "bg-white text-black"
                                    : isToday(date)
                                    ? "bg-black text-white"
                                    : "text-gray-900"
                                }`}
                              >
                                {date.getDate()}
                              </div>

                              {bookings.length > 0 && (
                                <span
                                  className={`text-[9px] sm:text-xs font-black ${
                                    active ? "text-white" : "text-gray-400"
                                  }`}
                                >
                                  {bookings.length}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1 sm:space-y-1.5">
                              {bookings.slice(0, 2).map((booking) => (
                                <div
                                  key={booking.id}
                                  className={`rounded-xl px-1.5 sm:px-2 py-1 sm:py-1.5 text-[8.5px] sm:text-[11px] leading-tight border shadow-sm ${getChannelColor(
                                    booking
                                  )}`}
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
                                </div>
                              ))}

                              {bookings.length > 2 && (
                                <div
                                  className={`text-[9px] sm:text-xs font-bold px-1 ${
                                    active ? "text-white" : "text-gray-500"
                                  }`}
                                >
                                  +{bookings.length - 2} more
                                </div>
                              )}
                            </div>
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
            <div className="mt-4 bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-950">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedBookings.length} booking found.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedDate(null)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {selectedBookings.length === 0 ? (
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 text-sm text-gray-500">
                  No booking on this date.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-2xl border border-gray-100 p-4 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="font-black text-gray-950">
                          {getBookingName(booking)}
                        </div>

                        <div className="text-sm text-gray-500 mt-1">
                          {getPropertyName(booking.property_id)}
                        </div>

                        <div className="text-xs text-gray-400 mt-1">
                          {cleanDate(
                            booking.check_in ||
                              booking.checkin_date ||
                              booking.start_date ||
                              booking.arrival_date
                          )}{" "}
                          →{" "}
                          {cleanDate(
                            booking.check_out ||
                              booking.checkout_date ||
                              booking.end_date ||
                              booking.departure_date
                          )}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-black border ${getChannelColor(
                          booking
                        )}`}
                      >
                        {getBookingChannel(booking)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}