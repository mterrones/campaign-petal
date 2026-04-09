import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  Users,
  BarChart3,
  Mail,
  Settings,
  PlusCircle,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/campaigns", icon: Send, label: "Campañas" },
  { to: "/contacts", icon: Users, label: "Contactos" },
  { to: "/reports", icon: BarChart3, label: "Reportes" },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[hsl(var(--sidebar-bg))] flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Mail className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-[hsl(var(--sidebar-fg))]">
          MailFlow
        </span>
      </div>

      <div className="px-4 mb-4">
        <NavLink
          to="/campaigns/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="w-4 h-4" />
          Nueva Campaña
        </NavLink>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <NavLink
          to="/settings"
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
