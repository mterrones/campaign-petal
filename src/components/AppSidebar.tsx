import { useLocation, useNavigate, NavLink } from "react-router-dom";
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
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import logoFull from "@/assets/enviamas-logo-full.png";
import logoIcon from "@/assets/enviamas-logo.png";

interface NavChild {
  to: string;
  label: string;
  icon: React.ElementType;
}

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", exact: true },
  {
    to: "/campaigns",
    icon: Send,
    label: "Campañas",
    children: [
      { to: "/campaigns", label: "Todas", icon: Mail },
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

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const isGroupActive = (item: NavItem) =>
    item.children
      ? item.children.some((c) =>
          c.to === "/campaigns" || c.to === "/settings"
            ? location.pathname === c.to
            : isActive(c.to)
        )
      : isActive(item.to, item.exact);

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/login", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Header with logo */}
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-3">
          {collapsed ? (
            <img src={logoIcon} alt="EnviaMas" className="h-8 w-8 object-contain" />
          ) : (
            <div className="flex items-center gap-2.5">
              <img src={logoFull} alt="EnviaMas" className="h-8 w-auto" />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 mb-1">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {navItems.map((item) => {
                if (!item.children) {
                  const active = isActive(item.to, item.exact);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                        className={active
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90 hover:text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        }
                      >
                        <NavLink to={item.to} end={item.exact}>
                          <item.icon className="w-[18px] h-[18px]" />
                          <span className="font-medium">{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                const groupActive = isGroupActive(item);

                return (
                  <Collapsible
                    key={item.to}
                    defaultOpen={groupActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.label}
                          isActive={groupActive && collapsed}
                          className={
                            groupActive && collapsed
                              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90 hover:text-primary-foreground"
                              : groupActive
                              ? "text-foreground hover:bg-accent/50"
                              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                          }
                        >
                          <item.icon className="w-[18px] h-[18px]" />
                          <span className="flex-1 font-medium">{item.label}</span>
                          <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="ml-[11px] border-l border-border/50 pl-0">
                          {item.children.map((child) => {
                            const childActive =
                              child.to === "/campaigns" || child.to === "/settings"
                                ? location.pathname === child.to
                                : isActive(child.to);
                            return (
                              <SidebarMenuSubItem key={child.to}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={childActive}
                                  className={childActive
                                    ? "text-primary font-semibold bg-primary/8"
                                    : "text-muted-foreground hover:text-foreground"
                                  }
                                >
                                  <NavLink to={child.to} end={child.to === "/campaigns" || child.to === "/settings"}>
                                    <child.icon className="w-3.5 h-3.5" />
                                    <span>{child.label}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-[18px] h-[18px]" />
              <span className="font-medium">Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
