import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CHANNEL_COLORS = {
  Airbnb: "#FF385C",
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
  for (let year = 2026; year <= 2040; year++) years.push(year);

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

  const getPropertyName = (propertyId) => {
    const property = properties.find((p) => Number(p.id) === Number(propertyId));
    return property ? property.name : "-";
  };

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();

  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

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
    navigate(`/reservations?date=${formatDateForUrl(day)}`);
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
              Swipe calendar on phone. Tap any future date to create a reservation.
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

        <div className="mb-4 flex flex-wrap gap-2">
          {Object.entries(CHANNEL_COLORS).map(([channel, color]) => (
            <div
              key={channel}
              className="px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
              style={{
                backgroundColor: color,
                color: getTextColor(channel),
              }}
            >
              {channel}
            </div>
          ))}
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="min-w-[760px] md:min-w-0">
            <div className="grid grid-cols-7 gap-2 md:gap-3 mb-3 text-center text-gray-600 font-bold text-xs md:text-sm">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {calendarDays.map((day, index) => {
                const dayReservations = day ? getReservationsForDay(day) : [];
                const past = day ? isPastDate(day) : false;

                return (
                  <div
                    key={index}
                    onClick={() => openReservationForm(day, past)}
                    className={`
                      min-h-[105px] md:min-h-[145px] lg:min-h-[175px]
                      rounded-2xl md:rounded-3xl
                      border shadow-md overflow-hidden transition
                      ${
                        past
                          ? "bg-gray-200 border-gray-300 opacity-70 cursor-not-allowed"
                          : day
                          ? "bg-white/90 border-white cursor-pointer hover:shadow-2xl hover:scale-[1.01] hover:ring-2 hover:ring-[#0D3B66]/20"
                          : "bg-transparent border-transparent shadow-none"
                      }
                    `}
                  >
                    {day && (
                      <>
                        {dayReservations.length === 0 ? (
                          <div className="h-full p-3 md:p-4 flex flex-col justify-between">
                            <div>
                              <div
                                className={`font-black text-base md:text-xl ${
                                  past
                                    ? "text-gray-500 line-through"
                                    : "text-gray-900"
                                }`}
                              >
                                {day}
                              </div>

                              <p
                                className={`text-xs md:text-sm mt-4 md:mt-6 font-semibold ${
                                  past ? "text-gray-400" : "text-[#0D3B66]"
                                }`}
                              >
                                {past ? "Past" : "Available"}
                              </p>
                            </div>

                            {!past && (
                              <div className="text-[10px] md:text-xs text-green-700 bg-green-100 rounded-full px-2 py-1 w-fit font-bold">
                                Open
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className="h-full grid"
                            style={{
                              gridTemplateRows: `repeat(${Math.min(
                                dayReservations.length,
                                3
                              )}, minmax(0, 1fr))`,
                            }}
                          >
                            {dayReservations.slice(0, 3).map((reservation, reservationIndex) => {
                              const bgColor =
                                CHANNEL_COLORS[reservation.channel] || "#6B7280";
                              const textColor = getTextColor(reservation.channel);

                              return (
                                <div
                                  key={reservation.id}
                                  className="p-2 md:p-3 flex flex-col justify-center"
                                  style={{
                                    backgroundColor: past ? "#CBD5E1" : bgColor,
                                    color: past ? "#475569" : textColor,
                                    borderTop:
                                      reservationIndex === 0
                                        ? "none"
                                        : "1px solid rgba(255,255,255,0.35)",
                                  }}
                                >
                                  {reservationIndex === 0 && (
                                    <div
                                      className={`font-black text-base md:text-xl mb-1 ${
                                        past ? "line-through" : ""
                                      }`}
                                    >
                                      {day}
                                    </div>
                                  )}

                                  <div className="text-[10px] md:text-xs font-black leading-tight line-clamp-1">
                                    {reservation.guest_name}
                                  </div>

                                  <div className="text-[10px] md:text-xs font-bold mt-1 opacity-90 line-clamp-1">
                                    {reservation.channel}
                                  </div>

                                  <div className="hidden lg:block text-xs font-semibold mt-1 opacity-90 line-clamp-1">
                                    {getPropertyName(reservation.property_id)}
                                  </div>
                                </div>
                              );
                            })}

                            {dayReservations.length > 3 && (
                              <div className="bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                                +{dayReservations.length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="md:hidden text-xs text-gray-500 mt-2">
          Tip: Swipe left/right to view the full calendar.
        </p>
      </div>
    </div>
  );
}