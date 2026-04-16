import { useLocation, useNavigate, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  Users,
  BarChart3,
  Settings,
  Key,
  LogOut,
  ChevronRight,
  Mail,
  FileText,
  Globe,
  Activity,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
import { Separator } from "@/components/ui/separator";
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

const mainNav: NavItem[] = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/campaigns", icon: Send, label: "Campañas" },
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
];

const secondaryNav: NavItem[] = [
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

  const renderItem = (item: NavItem) => {
    if (!item.children) {
      const active = isActive(item.to, item.exact);
      return (
        <SidebarMenuItem key={item.to}>
          <SidebarMenuButton
            asChild
            isActive={active}
            tooltip={item.label}
            className={active
              ? "bg-primary/10 text-primary border border-primary/20 shadow-none hover:bg-primary/15 hover:text-primary"
              : "text-muted-foreground border border-transparent hover:bg-muted/50 hover:text-foreground"
            }
          >
            <NavLink to={item.to} end={item.exact}>
              <item.icon className="w-[18px] h-[18px] shrink-0" />
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
                  ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 hover:text-primary"
                  : groupActive
                  ? "text-foreground border border-transparent hover:bg-muted/50"
                  : "text-muted-foreground border border-transparent hover:bg-muted/50 hover:text-foreground"
              }
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              <span className="flex-1 font-medium">{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="ml-4 mt-1 space-y-0.5 border-l-2 border-primary/10 pl-0">
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
                        ? "text-primary font-semibold bg-primary/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      }
                    >
                      <NavLink to={child.to} end={child.to === "/campaigns" || child.to === "/settings"}>
                        <child.icon className="w-3.5 h-3.5 shrink-0" />
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
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      {/* Logo */}
      <SidebarHeader className="px-4 py-5">
        {collapsed ? (
          <img src={logoIcon} alt="EnviaMas" className="h-8 w-8 object-contain mx-auto" />
        ) : (
          <img src={logoFull} alt="EnviaMas" className="h-9 w-auto" />
        )}
      </SidebarHeader>

      <SidebarContent className="px-3">
        {/* Main nav */}
        <SidebarGroup>
          {!collapsed && (
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 px-3 mb-2">
              Principal
            </p>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNav.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="mx-3 my-3 bg-border/40" />

        {/* Secondary nav */}
        <SidebarGroup>
          {!collapsed && (
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 px-3 mb-2">
              Herramientas
            </p>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {secondaryNav.map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3">
        {/* Upgrade card — only when expanded */}
        {!collapsed && (
          <div className="mb-3 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15 p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Envía más</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Aumenta tu límite de envíos y desbloquea funciones avanzadas.
            </p>
          </div>
        )}

        <Separator className="mb-3 bg-border/40" />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Cerrar sesión"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/8 border border-transparent hover:border-destructive/15 transition-colors"
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" />
              <span className="font-medium">Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
