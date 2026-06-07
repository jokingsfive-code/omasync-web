import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Property from "./pages/Property";
import Reservations from "./pages/Reservations";
import Calendar from "./pages/Calendar";
import Channels from "./pages/Channels";
import Analytics from "./pages/Analytics";
import Finance from "./pages/Finance";
import Expenses from "./pages/Expenses";
import Housekeeping from "./pages/Housekeeping";
import Maintenance from "./pages/Maintenance";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import FloatingDashboard from "./components/FloatingDashboard";


function PrivateRoute({ children }) {
  const user = localStorage.getItem("user");

  return user ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/properties"
          element={
            <PrivateRoute>
              <Property />
            </PrivateRoute>
          }
        />

        <Route
          path="/reservations"
          element={
            <PrivateRoute>
              <Reservations />
            </PrivateRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <PrivateRoute>
              <Calendar />
            </PrivateRoute>
          }
        />

        <Route
          path="/housekeeping"
          element={
            <PrivateRoute>
              <Housekeeping />
            </PrivateRoute>
          }
        />

        <Route
          path="/maintenance"
          element={
            <PrivateRoute>
              <Maintenance />
            </PrivateRoute>
          }
        />

        <Route
          path="/channels"
          element={
            <PrivateRoute>
              <Channels />
            </PrivateRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          }
        />

        <Route
          path="/finance"
          element={
            <PrivateRoute>
              <Finance />
            </PrivateRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <PrivateRoute>
              <Expenses />
            </PrivateRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        <Route
  path="/users"
  element={
    <PrivateRoute>
      <Users />
    </PrivateRoute>
  }
/>
      </Routes>

      <FloatingDashboard />
    </>
  );
}