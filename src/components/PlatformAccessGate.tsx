import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { isPlatformAdmin } from "@/lib/platformAdmin";

const PlatformAccessGate = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Outlet />;
  }

  if (!isPlatformAdmin(user) && location.pathname.startsWith("/admin")) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default PlatformAccessGate;
