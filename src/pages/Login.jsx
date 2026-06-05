import { useState } from "react";
import {
  Eye,
  EyeOff,
  Building2,
  CalendarDays,
  Wallet,
  BarChart3,
} from "lucide-react";
import api from "../api/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/login", {
        email,
        password,
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Email atau password salah");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top left, #7F9DB1 0%, transparent 35%), linear-gradient(135deg, #0D3B66 0%, #1D567D 45%, #EAF1F5 100%)",
      }}
    >
      <div className="absolute top-[-120px] left-[-120px] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-160px] right-[-160px] w-[500px] h-[500px] bg-[#0D3B66]/20 rounded-full blur-3xl"></div>
      <div className="absolute top-20 right-24 w-32 h-32 border border-white/20 rounded-full animate-pulse"></div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
        <div className="hidden lg:block text-white">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-3 rounded-full mb-8">
              <div className="w-3 h-3 bg-[#7F9DB1] rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold tracking-wide">
                OmaSync Property Platform
              </span>
            </div>

            <h1 className="text-6xl font-bold leading-tight mb-6">
              Smart Channel
              <br />
              Manager.
            </h1>

            <p className="text-lg text-white/80 max-w-md leading-relaxed">
              Synchronize bookings, rates and availability across Airbnb,
              Booking.com, Agoda and direct reservations from a single platform.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
              <Building2 className="mb-3" size={26} />
              <h3 className="font-bold">Properties</h3>
              <p className="text-sm text-white/70">Manage all units</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
              <CalendarDays className="mb-3" size={26} />
              <h3 className="font-bold">Calendar</h3>
              <p className="text-sm text-white/70">Sync availability</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
              <Wallet className="mb-3" size={26} />
              <h3 className="font-bold">Rates</h3>
              <p className="text-sm text-white/70">Control pricing</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
              <BarChart3 className="mb-3" size={26} />
              <h3 className="font-bold">Reports</h3>
              <p className="text-sm text-white/70">Business insights</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-xl border border-white/40 rounded-[32px] shadow-2xl p-8">
          <div className="flex justify-center mb-8">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-[28px] bg-[#0D3B66] shadow-2xl"></div>

              <div
                className="absolute inset-[-8px] rounded-[32px] border-2 border-[#7F9DB1] animate-spin"
                style={{ animationDuration: "10s" }}
              ></div>

              <div className="absolute inset-2 rounded-[24px] border border-white/20"></div>

              <div className="relative text-center">
                <div className="text-white text-3xl font-bold tracking-tight">
                  O
                </div>
                <div className="text-[#7F9DB1] text-xs font-bold tracking-[0.3em] -mt-1">
                  SYNC
                </div>
              </div>

              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#7F9DB1] rounded-full shadow-lg animate-bounce"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-[#0D3B66]">
              OmaSync
            </h2>
            <p className="text-gray-500 mt-2">
              Sign in to your channel manager
            </p>
          </div>

          <form onSubmit={login}>
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                placeholder="test@test.com"
                className="w-full px-4 py-4 rounded-2xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full px-4 py-4 pr-12 rounded-2xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#0D3B66] focus:border-transparent transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0D3B66] transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end mb-7">
              <button
                type="button"
                className="text-sm font-semibold text-[#0D3B66] hover:text-[#7F9DB1] transition"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0D3B66] to-[#1D567D] text-white font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-70"
            >
              {loading ? "Signing In..." : "Login"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            © 2026 OmaSync. Smart Channel Manager.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;