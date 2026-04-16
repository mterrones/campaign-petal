import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  Users,
  BarChart3,
  Settings,
  Key,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import logoImg from "@/assets/enviamas-logo-full.png";

const mainNavItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/campaigns", icon: Send, label: "Campañas" },
  { to: "/contacts", icon: Users, label: "Contactos" },
  { to: "/api-keys", icon: Key, label: "API Keys" },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

const AppSidebar = ({ onNavigate }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/login", { replace: true });
    onNavigate?.();
  };

  return (
    <aside className="md:fixed md:left-0 md:top-0 h-screen w-64 bg-[hsl(var(--sidebar-bg))] md:border-r border-[hsl(var(--sidebar-border))] flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-4">
        <img src={logoImg} alt="EnviaMas" className="h-8 w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-2 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => {
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}

        <div className="pt-3 pb-1">
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <BarChart3 className="w-4 h-4" />
            Reportes
          </div>
          <NavLink
            to="/reports/campaigns"
            onClick={onNavigate}
            className={`sidebar-link pl-9 ${location.pathname.startsWith("/reports/campaigns") ? "sidebar-link-active" : "sidebar-link-inactive"}`}
          >
            Por campañas
          </NavLink>
          <NavLink
            to="/reports/api"
            onClick={onNavigate}
            className={`sidebar-link pl-9 ${location.pathname.startsWith("/reports/api") ? "sidebar-link-active" : "sidebar-link-inactive"}`}
          >
            Por API
          </NavLink>
        </div>
      </nav>

      {/* Settings + logout */}
      <div className="px-3 pb-6 space-y-1">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={`sidebar-link ${location.pathname === "/settings" ? "sidebar-link-active" : "sidebar-link-inactive"}`}
        >
          <Settings className="w-5 h-5" />
          Configuración
        </NavLink>
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-3 px-3 h-10 font-normal text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Salir
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;
