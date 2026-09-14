import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClientWebhooksManager } from "@/components/ClientWebhooksManager";
import { createPlatformAdminClientWebhooksApi } from "@/lib/platformAdminClientWebhooks";

type Props = {
  token: string;
  clientId: string;
  clientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ClientWebhooksDialog({
  token,
  clientId,
  clientName,
  open,
  onOpenChange,
}: Props) {
  const api = useMemo(
    () => createPlatformAdminClientWebhooksApi(token, clientId),
    [token, clientId],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Webhooks — {clientName}</DialogTitle>
          <DialogDescription>
            URLs HTTPS que reciben cambios de estado del mensaje en JSON.
          </DialogDescription>
        </DialogHeader>
        <ClientWebhooksManager api={api} enabled={open && Boolean(token)} />
      </DialogContent>
    </Dialog>
  );
}
