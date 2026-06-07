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
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
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
    const property = properties.find((p) => p.id === propertyId);
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
    <div
      className="p-8 min-h-screen"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(127,157,177,0.35), transparent 35%), radial-gradient(circle at bottom right, rgba(13,59,102,0.14), transparent 35%), linear-gradient(135deg, #F3F6F8 0%, #E8EEF2 45%, #DCE7ED 100%)",
      }}
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-bold text-[#0D3B66]">
            {monthNames[selectedMonth]} {selectedYear}
          </h1>

          <p className="text-gray-500 mt-2">
            Click any future date to create a new reservation.
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-5 py-3 rounded-2xl border border-gray-300 bg-white shadow"
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
            className="px-5 py-3 rounded-2xl border border-gray-300 bg-white shadow"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 mb-4 text-center text-gray-600 font-semibold">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {calendarDays.map((day, index) => {
          const dayReservations = day ? getReservationsForDay(day) : [];
          const past = day ? isPastDate(day) : false;

          return (
            <div
              key={index}
              onClick={() => openReservationForm(day, past)}
              className={`
                min-h-[175px]
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
                    <div className="h-full p-5 flex flex-col justify-between">
                      <div>
                        <div
                          className={`font-bold text-xl ${
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
                              ? "text-gray-500 mt-8"
                              : "text-gray-900 mt-8"
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

                      {!past && (
                        <p className="text-xs text-[#0D3B66] font-semibold opacity-0 group-hover:opacity-100">
                          Click to add reservation
                        </p>
                      )}
                    </div>
                  ) : (
                    <div
                      className="h-full grid"
                      style={{
                        gridTemplateRows: `repeat(${dayReservations.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {dayReservations.map((reservation, reservationIndex) => {
                        const bgColor =
                          CHANNEL_COLORS[reservation.channel] || "#6B7280";

                        const textColor = getTextColor(reservation.channel);

                        return (
                          <div
                            key={reservation.id}
                            className="p-4 flex flex-col justify-center"
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
                                className={`font-bold text-xl mb-3 ${
                                  past ? "line-through" : ""
                                }`}
                              >
                                {day}
                              </div>
                            )}

                            <div className="text-sm font-bold leading-tight">
                              {reservation.guest_name}
                            </div>

                            <div className="text-xs font-semibold mt-1">
                              {reservation.channel}
                            </div>

                            <div className="text-xs font-semibold mt-1 opacity-90">
                              {formatDate(reservation.check_in)} →{" "}
                              {formatDate(reservation.check_out)}
                            </div>

                            <div className="text-xs font-semibold mt-1 opacity-90">
                              {getPropertyName(reservation.property_id)}
                            </div>

                            {past && (
                              <div className="text-xs font-bold mt-2">
                                Past booking
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}