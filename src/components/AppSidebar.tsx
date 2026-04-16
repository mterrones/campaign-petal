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
import logoImg from "@/assets/enviamas-logo-full.png";
import { cn } from "@/lib/utils";

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
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {collapsed ? (
          <img src={logoImg} alt="EnviaMas" className="h-7 w-7 object-contain object-left" />
        ) : (
          <img src={logoImg} alt="EnviaMas" className="h-8 w-auto" />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                if (!item.children) {
                  const active = isActive(item.to, item.exact);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                      >
                        <NavLink to={item.to} end={item.exact}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
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
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="flex-1">{item.label}</span>
                          <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((child) => {
                            const childActive =
                              child.to === "/campaigns" || child.to === "/settings"
                                ? location.pathname === child.to
                                : isActive(child.to);
                            return (
                              <SidebarMenuSubItem key={child.to}>
                                <SidebarMenuSubButton asChild isActive={childActive}>
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

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Salir"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
