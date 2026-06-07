import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CHANNEL_COLORS = {
  Airbnb: "#FF5A5F",
  Agoda: "#FDB812",
  "Booking.com": "#003B95",
  Direct: "#16A34A",
};

export default function Calendar() {
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [reservations, setReservations] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const monthNames = [
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

  const years = [];
  for (let year = 2026; year <= 2040; year++) {
    years.push(year);
  }

  useEffect(() => {
    fetchReservations();
    fetchProperties();
  }, []);

  const fetchReservations = async () => {
    const res = await api.get("/reservations");
    setReservations(res.data);
  };

  const fetchProperties = async () => {
    const res = await api.get("/properties");
    setProperties(res.data);
  };

  const formatDateForUrl = (day) => {
    const month = String(selectedMonth + 1).padStart(2, "0");
    const date = String(day).padStart(2, "0");
    return `${selectedYear}-${month}-${date}`;
  };

  const formatDate = (date) => {
    const d = new Date(date);

    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const getPropertyName = (propertyId) => {
    const property = properties.find((p) => Number(p.id) === Number(propertyId));
    return property ? property.name : "-";
  };

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();

  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getReservationsForDay = (day) => {
    const currentDate = new Date(selectedYear, selectedMonth, day);
    currentDate.setHours(0, 0, 0, 0);

    return reservations.filter((reservation) => {
      if (reservation.status === "Cancelled") return false;

      const checkIn = new Date(reservation.check_in);
      const checkOut = new Date(reservation.check_out);

      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);

      return currentDate >= checkIn && currentDate < checkOut;
    });
  };

  const isPastDate = (day) => {
    const currentDate = new Date(selectedYear, selectedMonth, day);
    currentDate.setHours(0, 0, 0, 0);

    return currentDate < today;
  };

  const getTextColor = (channel) => {
    return channel === "Agoda" ? "#111827" : "#ffffff";
  };

  const openReservationForm = (day, past) => {
    if (!day || past) return;

    const dateUrl = formatDateForUrl(day);
    navigate(`/reservations?date=${dateUrl}`);
  };

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
        <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-5 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold text-[#0D3B66]">
              {monthNames[selectedMonth]} {selectedYear}
            </h1>

            <p className="text-gray-500 mt-2 text-sm md:text-base">
              Click any future date to create a new reservation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full xl:w-auto">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-5 py-3 rounded-2xl border border-gray-300 bg-white shadow"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-5 py-3 rounded-2xl border border-gray-300 bg-white shadow"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-7 gap-3 mb-4 text-center text-gray-600 font-semibold">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="hidden md:grid grid-cols-7 gap-3">
          {calendarDays.map((day, index) => {
            const dayReservations = day ? getReservationsForDay(day) : [];
            const past = day ? isPastDate(day) : false;

            return (
              <div
                key={index}
                onClick={() => openReservationForm(day, past)}
                className={`
                  min-h-[135px] lg:min-h-[175px]
                  rounded-3xl
                  border
                  shadow-lg
                  overflow-hidden
                  transition
                  bg-white/80
                  backdrop-blur-xl
                  ${
                    past
                      ? "opacity-55 grayscale cursor-not-allowed"
                      : day
                      ? "cursor-pointer hover:shadow-2xl hover:scale-[1.01] hover:ring-2 hover:ring-[#0D3B66]/20"
                      : ""
                  }
                `}
                style={{
                  backgroundColor: past ? "#E5E7EB" : "rgba(255,255,255,0.82)",
                  borderColor: past ? "#D1D5DB" : "rgba(255,255,255,0.85)",
                }}
              >
                {day && (
                  <>
                    {dayReservations.length === 0 ? (
                      <div className="h-full p-4 lg:p-5 flex flex-col justify-between">
                        <div>
                          <div
                            className={`font-bold text-lg lg:text-xl ${
                              past
                                ? "text-gray-500 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {day}
                          </div>

                          <p
                            className={
                              past
                                ? "text-gray-500 mt-5 lg:mt-8"
                                : "text-gray-900 mt-5 lg:mt-8"
                            }
                          >
                            RM160
                          </p>

                          {past && (
                            <p className="text-xs text-gray-500 mt-3">
                              Past date
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="h-full grid"
                        style={{
                          gridTemplateRows: `repeat(${dayReservations.length}, minmax(0, 1fr))`,
                        }}
                      >
                        {dayReservations.map(
                          (reservation, reservationIndex) => {
                            const bgColor =
                              CHANNEL_COLORS[reservation.channel] || "#6B7280";
                            const textColor = getTextColor(
                              reservation.channel
                            );

                            return (
                              <div
                                key={reservation.id}
                                className="p-3 lg:p-4 flex flex-col justify-center"
                                style={{
                                  backgroundColor: past ? "#D1D5DB" : bgColor,
                                  color: past ? "#6B7280" : textColor,
                                  borderTop:
                                    reservationIndex === 0
                                      ? "none"
                                      : "1px solid rgba(255,255,255,0.35)",
                                }}
                              >
                                {reservationIndex === 0 && (
                                  <div
                                    className={`font-bold text-lg lg:text-xl mb-2 lg:mb-3 ${
                                      past ? "line-through" : ""
                                    }`}
                                  >
                                    {day}
                                  </div>
                                )}

                                <div className="text-xs lg:text-sm font-bold leading-tight line-clamp-1">
                                  {reservation.guest_name}
                                </div>

                                <div className="text-xs font-semibold mt-1">
                                  {reservation.channel}
                                </div>

                                <div className="hidden lg:block text-xs font-semibold mt-1 opacity-90">
                                  {formatDate(reservation.check_in)} →{" "}
                                  {formatDate(reservation.check_out)}
                                </div>

                                <div className="hidden lg:block text-xs font-semibold mt-1 opacity-90 line-clamp-1">
                                  {getPropertyName(reservation.property_id)}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="md:hidden space-y-3">
          {Array.from({ length: daysInMonth }, (_, index) => index + 1).map(
            (day) => {
              const dayReservations = getReservationsForDay(day);
              const past = isPastDate(day);

              return (
                <div
                  key={day}
                  onClick={() => openReservationForm(day, past)}
                  className={`rounded-3xl border shadow-md overflow-hidden bg-white/90 ${
                    past
                      ? "opacity-60 grayscale"
                      : "active:scale-[0.98] cursor-pointer"
                  }`}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p
                        className={`font-black text-xl ${
                          past ? "text-gray-500 line-through" : "text-gray-900"
                        }`}
                      >
                        {day} {monthNames[selectedMonth].slice(0, 3)}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {past
                          ? "Past date"
                          : dayReservations.length > 0
                          ? `${dayReservations.length} booking(s)`
                          : "Available · Tap to add reservation"}
                      </p>
                    </div>

                    <div
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        past
                          ? "bg-gray-200 text-gray-500"
                          : dayReservations.length > 0
                          ? "bg-[#0D3B66] text-white"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {past
                        ? "Past"
                        : dayReservations.length > 0
                        ? "Booked"
                        : "Open"}
                    </div>
                  </div>

                  {dayReservations.length > 0 && (
                    <div className="space-y-2 p-4 pt-0">
                      {dayReservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="rounded-2xl p-4 text-white"
                          style={{
                            backgroundColor:
                              CHANNEL_COLORS[reservation.channel] || "#6B7280",
                            color: getTextColor(reservation.channel),
                          }}
                        >
                          <p className="font-bold">
                            {reservation.guest_name}
                          </p>

                          <p className="text-xs font-semibold mt-1">
                            {reservation.channel}
                          </p>

                          <p className="text-xs font-semibold mt-1 opacity-90">
                            {formatDate(reservation.check_in)} →{" "}
                            {formatDate(reservation.check_out)}
                          </p>

                          <p className="text-xs font-semibold mt-1 opacity-90">
                            {getPropertyName(reservation.property_id)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}