import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  Users,
  BarChart3,
  Settings,
  Key,
} from "lucide-react";
import logoImg from "@/assets/enviamas-logo.png";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/campaigns", icon: Send, label: "Campañas" },
  { to: "/contacts", icon: Users, label: "Contactos" },
  { to: "/reports", icon: BarChart3, label: "Reportes" },
  { to: "/api-keys", icon: Key, label: "API Keys" },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

const AppSidebar = ({ onNavigate }: AppSidebarProps) => {
  const location = useLocation();

  return (
    <aside className="md:fixed md:left-0 md:top-0 h-screen w-64 bg-[hsl(var(--sidebar-bg))] md:border-r border-[hsl(var(--sidebar-border))] flex flex-col z-50">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <img src={logoImg} alt="EnviaMas" className="w-10 h-10 rounded-xl" />
        <span className="text-xl font-extrabold tracking-tight text-primary">
          EnviaMas
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-2 space-y-1">
        {navItems.map((item) => {
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
      </nav>

      {/* Settings */}
      <div className="px-3 pb-6">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={`sidebar-link ${location.pathname === "/settings" ? "sidebar-link-active" : "sidebar-link-inactive"}`}
        >
          <Settings className="w-5 h-5" />
          Configuración
        </NavLink>
      </div>
    </aside>
  );
};

export default AppSidebar;
