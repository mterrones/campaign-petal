import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  fetchActiveCampaignSendJob,
  isCampaignSendJobActive,
  platformSendAgendaActiveQueryKey,
} from "@/lib/platformSendAgenda";
import { platformCampaignsQueryKey } from "@/lib/platformCampaigns";

const AppLayout = () => {
  const { user, token, isImpersonating, stopImpersonation } = useAuth();
  const queryClient = useQueryClient();
  const [stoppingImpersonation, setStoppingImpersonation] = useState(false);
  const handledSendJobRef = useRef<string | null>(null);
  const sawActiveSendJobRef = useRef(false);

  const sendJobQuery = useQuery({
    queryKey: platformSendAgendaActiveQueryKey,
    queryFn: () => fetchActiveCampaignSendJob(token!),
    enabled: !!token,
    refetchInterval: (query) => {
      const status = query.state.data?.job?.status;
      return isCampaignSendJobActive(status) ? 5000 : false;
    },
  });

  const sendJob = sendJobQuery.data?.job ?? null;
  const sendJobActive = isCampaignSendJobActive(sendJob?.status);

  useEffect(() => {
    if (!sendJob) return;
    if (isCampaignSendJobActive(sendJob.status)) {
      sawActiveSendJobRef.current = true;
      return;
    }
    const key = `${sendJob.id}:${sendJob.status}`;
    if (handledSendJobRef.current === key) return;
    if (sendJob.status !== "completed" && sendJob.status !== "failed") return;
    if (!sawActiveSendJobRef.current) return;
    handledSendJobRef.current = key;
    sawActiveSendJobRef.current = false;
    void queryClient.invalidateQueries({ queryKey: platformCampaignsQueryKey });
    if (sendJob.status === "failed") {
      toast.error(sendJob.error ?? "Falló el envío de la agenda");
      return;
    }
    const parts = [
      `${sendJob.enqueued} en cola`,
      sendJob.blacklisted > 0
        ? `${sendJob.blacklisted} en lista de exclusión`
        : null,
      sendJob.failed > 0 ? `${sendJob.failed} rechazados` : null,
    ].filter(Boolean);
    if (sendJob.blacklisted > 0 || sendJob.failed > 0) {
      toast.warning(parts.join(" · "));
    } else {
      toast.success(`${sendJob.enqueued} correo(s) en cola para envío`);
    }
  }, [sendJob, queryClient]);

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
          {sendJobActive && sendJob && (
            <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 text-sm flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
              <span>
                Encolando campaña {sendJob.processed}/{sendJob.total}
                {sendJob.enqueued > 0 ? ` · ${sendJob.enqueued} en cola` : ""}
                {sendJob.blacklisted > 0
                  ? ` · ${sendJob.blacklisted} exclusión`
                  : ""}
                {sendJob.failed > 0 ? ` · ${sendJob.failed} rechazados` : ""}
              </span>
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
