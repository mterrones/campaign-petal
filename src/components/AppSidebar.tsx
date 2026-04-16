import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  Users,
  BarChart3,
  Settings,
  Key,
  LogOut,
  ChevronDown,
  Mail,
  FileText,
  Globe,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import logoImg from "@/assets/enviamas-logo-full.png";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  children?: { to: string; label: string; icon?: React.ElementType }[];
}

const navItems: NavItem[] = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  {
    to: "/campaigns",
    icon: Send,
    label: "Campañas",
    children: [
      { to: "/campaigns", label: "Todas las campañas", icon: Mail },
      { to: "/campaigns/new", label: "Nueva campaña", icon: FileText },
    ],
  },
  { to: "/contacts", icon: Users, label: "Contactos" },
  {
    to: "/reports",
    icon: BarChart3,
    label: "Reportes",
    children: [
      { to: "/reports/campaigns", label: "Por campañas", icon: Mail },
      { to: "/reports/api", label: "Por API", icon: Activity },
    ],
  },
  { to: "/api-keys", icon: Key, label: "API Keys" },
  {
    to: "/settings",
    icon: Settings,
    label: "Configuración",
    children: [
      { to: "/settings", label: "Dominios", icon: Globe },
    ],
  },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

const AppSidebar = ({ onNavigate }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isPathActive = (path: string, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const isGroupActive = (item: NavItem) => {
    if (item.children) {
      return item.children.some((c) => isPathActive(c.to, c.to === "/campaigns"));
    }
    return item.to === "/" ? location.pathname === "/" : isPathActive(item.to);
  };

  // Track which groups are open — default open if active
  const getInitialOpen = () => {
    const open: Record<string, boolean> = {};
    navItems.forEach((item) => {
      if (item.children) {
        open[item.to] = isGroupActive(item);
      }
    });
    return open;
  };

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialOpen);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/login", { replace: true });
    onNavigate?.();
  };

  const linkClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
      active
        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
        : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-fg))]"
    );

  const subLinkClass = (active: boolean) =>
    cn(
      "flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer",
      active
        ? "bg-primary/10 text-primary font-semibold"
        : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-fg))]"
    );

  return (
    <aside className="md:fixed md:left-0 md:top-0 h-screen w-64 bg-[hsl(var(--sidebar-bg))] md:border-r border-[hsl(var(--sidebar-border))] flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-4">
        <img src={logoImg} alt="EnviaMas" className="h-8 w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          if (!item.children) {
            const active = item.to === "/" ? location.pathname === "/" : isPathActive(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={linkClass(active)}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.label}
              </NavLink>
            );
          }

          const groupActive = isGroupActive(item);
          const isOpen = openGroups[item.to] ?? groupActive;

          return (
            <Collapsible key={item.to} open={isOpen} onOpenChange={() => toggleGroup(item.to)}>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 w-full",
                    groupActive && !isOpen
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "text-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-fg))]",
                    groupActive && isOpen && "text-[hsl(var(--sidebar-fg))] font-semibold"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-0.5 space-y-0.5">
                {item.children.map((child) => {
                  const childActive =
                    child.to === "/campaigns"
                      ? location.pathname === "/campaigns"
                      : isPathActive(child.to);
                  return (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      onClick={onNavigate}
                      className={subLinkClass(childActive)}
                    >
                      {child.icon && <child.icon className="w-4 h-4 shrink-0" />}
                      {child.label}
                    </NavLink>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
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
