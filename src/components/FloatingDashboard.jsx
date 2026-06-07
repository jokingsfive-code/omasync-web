import { Link, useLocation } from "react-router-dom";
import { Home } from "lucide-react";

export default function FloatingDashboard() {
  const location = useLocation();

  if (
    location.pathname === "/" ||
    location.pathname === "/dashboard"
  ) {
    return null;
  }

  return (
    <Link
      to="/dashboard"
      title="Dashboard"
      className="
        group
        fixed
        bottom-8
        right-8
        z-50

        w-18
        h-18

        rounded-full

        bg-gradient-to-br
        from-[#0D3B66]
        to-[#1B5E9E]

        text-white

        flex
        items-center
        justify-center

        shadow-2xl

        hover:scale-110
        hover:shadow-blue-500/40

        transition-all
        duration-300
      "
    >
      <Home size={32} />

      <span
        className="
          absolute
          right-20
          bg-[#0D3B66]
          text-white
          text-sm
          font-bold
          px-4
          py-2
          rounded-xl
          opacity-0
          group-hover:opacity-100
          transition
          whitespace-nowrap
        "
      >
        Dashboard
      </span>
    </Link>
  );
}