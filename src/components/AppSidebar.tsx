import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  Users,
  BarChart3,
  Settings,
  PlusCircle,
} from "lucide-react";
import logoImg from "@/assets/enviamas-logo.png";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/campaigns", icon: Send, label: "Campañas" },
  { to: "/contacts", icon: Users, label: "Contactos" },
  { to: "/reports", icon: BarChart3, label: "Reportes" },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col z-50">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <img src={logoImg} alt="EnviaMas" className="w-10 h-10 rounded-xl" />
        <span className="text-xl font-extrabold tracking-tight text-[hsl(var(--sidebar-fg))]">
          Envía<span className="text-primary">Mas</span>
        </span>
      </div>

      {/* CTA */}
      <div className="px-4 mb-5">
        <NavLink
          to="/campaigns/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/25"
        >
          <PlusCircle className="w-4 h-4" />
          Nueva Campaña
        </NavLink>
      </div>

      {/* Nav */}
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

      {/* Settings */}
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
