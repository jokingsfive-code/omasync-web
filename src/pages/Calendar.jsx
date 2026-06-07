import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Home,
  Loader2,
} from "lucide-react";

const channelColors = {
  Airbnb: "bg-rose-500 text-white border-rose-600",
  Booking: "bg-blue-600 text-white border-blue-700",
  Agoda: "bg-purple-600 text-white border-purple-700",
  Direct: "bg-emerald-600 text-white border-emerald-700",
  Website: "bg-amber-500 text-white border-amber-600",
  Other: "bg-gray-600 text-white border-gray-700",
};

export default function Calendar() {
  const [reservations, setReservations] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [reservationRes, propertyRes] = await Promise.all([
        api.get("/reservations"),
        api.get("/properties"),
      ]);

      setReservations(reservationRes.data || []);
      setProperties(propertyRes.data || []);
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

  const goPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find(
      (p) => String(p.id) === String(propertyId)
    );

    return property?.name || property?.property_name || "Property";
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];

    const dateStr = formatDate(date);

    return reservations.filter((booking) => {
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
    return booking.channel || booking.source || booking.platform || "Other";
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <Sidebar />

      <main className="lg:ml-64 min-h-screen px-2 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-black text-white flex items-center justify-center shadow-sm">
                <CalendarDays size={21} />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Calendar
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  Airbnb style booking calendar.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[22px] sm:rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-3 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                  {monthName}
                </h2>
                <p className="text-[11px] sm:text-sm text-gray-500">
                  Booking color follows channel.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goPrevMonth}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
                >
                  <ChevronLeft size={18} />
                </button>

                <button
                  onClick={goToday}
                  className="h-9 sm:h-10 px-4 rounded-full bg-black text-white text-xs sm:text-sm font-semibold hover:bg-gray-800 active:scale-95 transition"
                >
                  Today
                </button>

                <button
                  onClick={goNextMonth}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="px-3 sm:px-6 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {Object.keys(channelColors).map((channel) => (
                  <div
                    key={channel}
                    className="flex items-center gap-1.5 shrink-0 text-[10px] sm:text-sm text-gray-600"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        channelColors[channel].split(" ")[0]
                      }`}
                    />
                    {channel}
                  </div>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="h-[360px] flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="animate-spin mb-3" size={30} />
                <p className="text-sm">Loading calendar...</p>
              </div>
            ) : (
              <div className="w-full">
                <div className="w-full">
                  <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="h-8 sm:h-11 flex items-center justify-center text-[9px] sm:text-sm font-bold text-gray-500 uppercase tracking-wide"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-7">
                    {calendarDays.map((date, index) => {
                      const bookings = getBookingsForDate(date);

                      return (
                        <div
                          key={index}
                          className={`min-h-[72px] sm:min-h-[145px] border-r border-b border-gray-100 p-1 sm:p-3 bg-white hover:bg-gray-50 transition ${
                            !date ? "bg-gray-50/70" : ""
                          }`}
                        >
                          {date && (
                            <>
                              <div className="flex items-center justify-between mb-1 sm:mb-2">
                                <div
                                  className={`w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-[10px] sm:text-sm font-bold ${
                                    isToday(date)
                                      ? "bg-black text-white"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {date.getDate()}
                                </div>

                                {bookings.length > 0 && (
                                  <span className="text-[8px] sm:text-[10px] font-bold text-gray-400">
                                    {bookings.length}
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1 sm:space-y-1.5">
                                {bookings.slice(0, 2).map((booking) => {
                                  const channel = getBookingChannel(booking);
                                  const color =
                                    channelColors[channel] ||
                                    channelColors.Other;

                                  return (
                                    <div
                                      key={booking.id}
                                      className={`rounded-lg sm:rounded-xl px-1 sm:px-2 py-1 sm:py-1.5 text-[8px] sm:text-[11px] leading-tight border shadow-sm ${color}`}
                                    >
                                      <div className="font-bold truncate">
                                        {getBookingName(booking)}
                                      </div>

                                      <div className="hidden sm:flex items-center gap-1 opacity-90 truncate">
                                        <Home size={10} />
                                        <span className="truncate">
                                          {getPropertyName(
                                            booking.property_id
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}

                                {bookings.length > 2 && (
                                  <div className="text-[8px] sm:text-[11px] font-semibold text-gray-500 px-0.5 sm:px-1">
                                    +{bookings.length - 2}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 sm:hidden text-center text-[11px] text-gray-400">
            Compact Airbnb style calendar for mobile.
          </div>
        </div>
      </main>
    </div>
  );
}