import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Marquee from "./Marquee";

export default function Layout() {
  const location = useLocation();

  // Admin has its own full layout — don't render anything from here
  if (location.pathname.startsWith("/admin")) {
    return <Outlet />
  }

  return (
    <>
      <Marquee />
      <Navbar />
      <Outlet />
    </>
  );
}