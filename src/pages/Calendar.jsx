import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Calendar() {
  const today = new Date();

  const [events, setEvents] = useState([]);
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

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.log("API error:", err);
    }
  };

  const getEventByDate = (day) => {
    const dateString = `${selectedYear}-${String(selectedMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    return events.filter((event) => event.event_date === dateString);
  };

  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <h1 style={{ fontSize: 42 }}>
          {monthNames[selectedMonth]} {selectedYear}
        </h1>

        <div style={{ display: "flex", gap: 10 }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            style={{
              height: 44,
              padding: "0 16px",
              borderRadius: 20,
              border: "1px solid #ddd",
            }}
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
            style={{
              height: 44,
              padding: "0 16px",
              borderRadius: 20,
              border: "1px solid #ddd",
            }}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 8,
          marginBottom: 10,
          color: "#555",
          textAlign: "center",
        }}
      >
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 8,
        }}
      >
        {calendarDays.map((day, index) => {
          const dayEvents = day ? getEventByDate(day) : [];

          return (
            <div
              key={index}
              style={{
                minHeight: 120,
                border: day ? "1px solid #ddd" : "none",
                borderRadius: 22,
                padding: 20,
                background: day ? "#fff" : "transparent",
              }}
            >
              {day && (
                <>
                  <div style={{ fontWeight: "bold", fontSize: 18 }}>
                    {day}
                  </div>

                  <div style={{ marginTop: 30 }}>
                    {dayEvents.length > 0 ? (
                      dayEvents.map((event) => (
                        <div key={event.id}>
                          <strong>{event.title}</strong>
                          <br />
                          <span>{event.event_time || ""}</span>
                        </div>
                      ))
                    ) : (
                      <span>RM160</span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}