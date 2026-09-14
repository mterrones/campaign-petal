import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import {
  WEBHOOK_STATUSES,
  type ClientWebhookRow,
  type ClientWebhookStatus,
  type ClientWebhooksApi,
} from "@/lib/clientWebhooks";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

const STATUS_LABELS: Record<ClientWebhookStatus, string> = {
  sent: "Enviado",
  delivered: "Entregado",
  delayed: "Retrasado",
  bounced: "Rebotado",
  failed: "Fallido",
  complaint: "Queja",
  open: "Abierto",
};

type Props = {
  api: ClientWebhooksApi;
  enabled?: boolean;
  emptyMessage?: string;
};

export function ClientWebhooksManager({
  api,
  enabled = true,
  emptyMessage = "Sin webhooks configurados.",
}: Props) {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClientWebhookRow | null>(null);
  const [url, setUrl] = useState("");
  const [statuses, setStatuses] = useState<ClientWebhookStatus[]>(["delivered"]);
  const [isActive, setIsActive] = useState(true);

  const listQuery = useQuery({
    queryKey: api.queryKey,
    queryFn: () => api.list(),
    enabled,
  });

  const webhooks = listQuery.data?.webhooks ?? [];

  const resetForm = () => {
    setEditing(null);
    setUrl("");
    setStatuses(["delivered"]);
    setIsActive(true);
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (row: ClientWebhookRow) => {
    setEditing(row);
    setUrl(row.url);
    setStatuses([...row.statuses]);
    setIsActive(row.isActive);
    setFormOpen(true);
  };

  const toggleStatus = (status: ClientWebhookStatus, checked: boolean) => {
    setStatuses((prev) =>
      checked
        ? prev.includes(status)
          ? prev
          : [...prev, status]
        : prev.filter((s) => s !== status),
    );
  };

  const createMutation = useMutation({
    mutationFn: () =>
      api.create({
        url: url.trim(),
        statuses,
        isActive,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: api.queryKey });
      setFormOpen(false);
      resetForm();
      toast.success("Webhook creado");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Error al crear webhook");
    },
  });

  const patchMutation = useMutation({
    mutationFn: () => {
      if (!editing) throw new Error("No webhook");
      return api.patch(editing.id, {
        url: url.trim(),
        statuses,
        isActive,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: api.queryKey });
      setFormOpen(false);
      resetForm();
      toast.success("Webhook actualizado");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Error al actualizar webhook",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (webhookId: string) => api.remove(webhookId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: api.queryKey });
      toast.success("Webhook eliminado");
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Error al eliminar webhook",
      );
    },
  });

  const canSubmit = useMemo(
    () => url.trim().startsWith("https://") && statuses.length > 0,
    [url, statuses],
  );

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Nuevo webhook
        </Button>
      </div>

      {listQuery.isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : webhooks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {emptyMessage}
        </p>
      ) : (
        <ul className="space-y-3">
          {webhooks.map((wh) => (
            <li
              key={wh.id}
              className="rounded-md border border-border px-3 py-2 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-mono truncate">{wh.url}</p>
                  <div className="flex flex-wrap gap-1">
                    {wh.statuses.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {STATUS_LABELS[s]}
                      </Badge>
                    ))}
                    {!wh.isActive && (
                      <Badge variant="outline" className="text-xs">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(wh)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(wh.id)}
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={formOpen}
        onOpenChange={(o) => {
          setFormOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar webhook" : "Nuevo webhook"}
            </DialogTitle>
            <DialogDescription>
              Solo HTTPS. Elige los estados que disparan la notificación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="wh-url">URL</Label>
              <Input
                id="wh-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ejemplo.com/hooks/enviamas"
              />
            </div>
            <div className="space-y-2">
              <Label>Estados</Label>
              <div className="grid grid-cols-2 gap-2">
                {WEBHOOK_STATUSES.map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={statuses.includes(status)}
                      onCheckedChange={(v) =>
                        toggleStatus(status, v === true)
                      }
                    />
                    {STATUS_LABELS[status]}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="wh-active">Activo</Label>
              <Switch
                id="wh-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={
                !canSubmit || createMutation.isPending || patchMutation.isPending
              }
              onClick={() =>
                editing ? patchMutation.mutate() : createMutation.mutate()
              }
            >
              {(createMutation.isPending || patchMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {editing ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
