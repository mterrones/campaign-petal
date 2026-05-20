import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const AppLayout = () => {
  const { user, isImpersonating, stopImpersonation } = useAuth();
  const [stoppingImpersonation, setStoppingImpersonation] = useState(false);

  const handleStopImpersonation = async () => {
    setStoppingImpersonation(true);
    try {
      await stopImpersonation();
      toast.success("Sesión de administrador restaurada");
    } catch {
      toast.error("No se pudo restaurar la sesión de administrador");
    } finally {
      setStoppingImpersonation(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {isImpersonating && user && (
            <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>
                Sesión como{" "}
                <span className="font-medium text-foreground">{user.email}</span>
                {user.impersonation && (
                  <span className="text-muted-foreground">
                    {" "}
                    (admin: {user.impersonation.email})
                  </span>
                )}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={stoppingImpersonation}
                onClick={() => void handleStopImpersonation()}
              >
                {stoppingImpersonation ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    Volver a {user.impersonation?.email ?? "admin"}
                  </>
                )}
              </Button>
            </div>
          )}
          <header className="h-14 flex items-center border-b border-border/50 bg-card/80 backdrop-blur-sm px-4 shrink-0 sticky top-0 z-10">
            <SidebarTrigger className="mr-2 text-muted-foreground hover:text-foreground" />
          </header>
          <main className="flex-1 p-4 md:p-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
