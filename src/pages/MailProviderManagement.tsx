import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createPlatformAdminMailProvider,
  deletePlatformAdminMailProvider,
  fetchPlatformAdminMailProviders,
  patchPlatformAdminMailProvider,
  platformAdminMailProvidersQueryKey,
  type AdminMailProviderRow,
} from "@/lib/platformAdminMailProviders";
import { Loader2, Mail, Pencil, Plus, Star, Trash2 } from "lucide-react";

type FormState = {
  name: string;
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  tlsRejectUnauthorized: boolean;
  isActive: boolean;
  isDefault: boolean;
};

const emptyForm = (): FormState => ({
  name: "",
  smtpHost: "",
  smtpPort: "25",
  smtpSecure: false,
  smtpUser: "",
  smtpPassword: "",
  tlsRejectUnauthorized: true,
  isActive: true,
  isDefault: false,
});

function formFromProvider(row: AdminMailProviderRow): FormState {
  return {
    name: row.name,
    smtpHost: row.smtpHost,
    smtpPort: String(row.smtpPort),
    smtpSecure: row.smtpSecure,
    smtpUser: row.smtpUser ?? "",
    smtpPassword: "",
    tlsRejectUnauthorized: row.tlsRejectUnauthorized,
    isActive: row.isActive,
    isDefault: row.isDefault,
  };
}

function formToPayload(form: FormState, isEdit: boolean) {
  const port = Number(form.smtpPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT");
  }
  const name = form.name.trim();
  const smtpHost = form.smtpHost.trim();
  if (!name || !smtpHost) throw new Error("REQUIRED");
  const payload = {
    name,
    smtpHost,
    smtpPort: port,
    smtpSecure: form.smtpSecure,
    smtpUser: form.smtpUser.trim() || null,
    tlsRejectUnauthorized: form.tlsRejectUnauthorized,
    isActive: form.isActive,
    isDefault: form.isDefault,
  };
  if (form.smtpPassword.trim()) {
    return { ...payload, smtpPassword: form.smtpPassword };
  }
  if (!isEdit) {
    return { ...payload, smtpPassword: null };
  }
  return payload;
}

const MailProviderManagement = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm());
  const [editForm, setEditForm] = useState<FormState>(emptyForm());

  const listQuery = useQuery({
    queryKey: platformAdminMailProvidersQueryKey,
    queryFn: () => fetchPlatformAdminMailProviders(token!),
    enabled: Boolean(token),
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({
      queryKey: platformAdminMailProvidersQueryKey,
    });

  useEffect(() => {
    if (!editId || !listQuery.data) return;
    const row = listQuery.data.providers.find((p) => p.id === editId);
    if (row) setEditForm(formFromProvider(row));
  }, [editId, listQuery.data]);

  const handleFormError = (err: unknown) => {
    if (err instanceof Error) {
      if (err.message === "REQUIRED") {
        toast.error("Completa nombre y host SMTP");
        return;
      }
      if (err.message === "PORT") {
        toast.error("Puerto SMTP inválido");
        return;
      }
    }
    if (err instanceof ApiError) {
      if (err.status === 409) {
        toast.error("Nombre duplicado o proveedor en uso");
        return;
      }
      toast.error(err.message);
      return;
    }
    toast.error("No se pudo guardar el proveedor");
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("NO_CONTEXT");
      const body = formToPayload(createForm, false);
      return createPlatformAdminMailProvider(token, body);
    },
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
      setCreateForm(emptyForm());
      toast.success("Proveedor creado");
    },
    onError: handleFormError,
  });

  const patchMutation = useMutation({
    mutationFn: async () => {
      if (!token || !editId) throw new Error("NO_CONTEXT");
      const body = formToPayload(editForm, true);
      return patchPlatformAdminMailProvider(token, editId, body);
    },
    onSuccess: () => {
      invalidate();
      setEditId(null);
      toast.success("Proveedor actualizado");
    },
    onError: handleFormError,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!token || !deleteId) throw new Error("NO_CONTEXT");
      await deletePlatformAdminMailProvider(token, deleteId);
    },
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      toast.success("Proveedor eliminado");
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error("No se puede eliminar: tiene clientes asignados o es el principal");
          return;
        }
        toast.error(err.message);
        return;
      }
      toast.error("No se pudo eliminar");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (providerId: string) => {
      if (!token) throw new Error("NO_CONTEXT");
      return patchPlatformAdminMailProvider(token, providerId, { isDefault: true });
    },
    onSuccess: () => {
      invalidate();
      toast.success("Proveedor principal actualizado");
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error("No se pudo actualizar");
    },
  });

  const renderFormFields = (
    form: FormState,
    setForm: (next: FormState) => void,
    isEdit: boolean,
    hasPassword?: boolean,
  ) => (
    <div className="space-y-3 py-2 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <Label>Nombre</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="EnviaMas"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <Label>Host SMTP</Label>
          <Input
            value={form.smtpHost}
            onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
            placeholder="smtp.example.com"
          />
        </div>
        <div>
          <Label>Puerto</Label>
          <Input
            value={form.smtpPort}
            onChange={(e) => setForm({ ...form, smtpPort: e.target.value })}
            inputMode="numeric"
          />
        </div>
      </div>
      <div>
        <Label>Usuario SMTP (opcional)</Label>
        <Input
          value={form.smtpUser}
          onChange={(e) => setForm({ ...form, smtpUser: e.target.value })}
          autoComplete="off"
        />
      </div>
      <div>
        <Label>
          Contraseña SMTP {isEdit ? "(dejar vacío para conservar)" : "(opcional)"}
        </Label>
        <Input
          type="password"
          value={form.smtpPassword}
          onChange={(e) => setForm({ ...form, smtpPassword: e.target.value })}
          autoComplete="new-password"
          placeholder={isEdit && hasPassword ? "••••••••" : ""}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Conexión segura (SSL/TLS)</p>
        </div>
        <Switch
          checked={form.smtpSecure}
          onCheckedChange={(checked) => setForm({ ...form, smtpSecure: checked })}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Validar certificado TLS</p>
        </div>
        <Switch
          checked={form.tlsRejectUnauthorized}
          onCheckedChange={(checked) =>
            setForm({ ...form, tlsRejectUnauthorized: checked })
          }
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Activo</p>
        </div>
        <Switch
          checked={form.isActive}
          onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
        />
      </div>
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Proveedor principal</p>
          <p className="text-xs text-muted-foreground">
            Se asigna por defecto a clientes nuevos
          </p>
        </div>
        <Switch
          checked={form.isDefault}
          onCheckedChange={(checked) => setForm({ ...form, isDefault: checked })}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Mail className="h-7 w-7 text-primary" />
            Proveedores de correo
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Credenciales SMTP por proveedor. Cada cliente usa un proveedor asignado.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo proveedor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proveedores SMTP</CardTitle>
          <CardDescription>
            El proveedor principal se preselecciona al crear clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando…
            </div>
          ) : listQuery.isError ? (
            <p className="text-destructive text-sm">No se pudo cargar la lista.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Clientes</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(listQuery.data?.providers ?? []).map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2 flex-wrap">
                        {p.name}
                        {p.isDefault && <Badge>Principal</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {p.smtpHost}:{p.smtpPort}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? "default" : "secondary"}>
                        {p.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.assignedClientCount}</TableCell>
                    <TableCell className="text-right space-x-1">
                      {!p.isDefault && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Marcar como principal"
                          onClick={() => setDefaultMutation.mutate(p.id)}
                          disabled={setDefaultMutation.isPending || !p.isActive}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar"
                        onClick={() => setEditId(p.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Eliminar"
                        onClick={() => setDeleteId(p.id)}
                        disabled={p.isDefault}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo proveedor</DialogTitle>
            <DialogDescription>
              Configura las credenciales SMTP del relay de correo.
            </DialogDescription>
          </DialogHeader>
          {renderFormFields(createForm, setCreateForm, false)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editId !== null} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar proveedor</DialogTitle>
          </DialogHeader>
          {renderFormFields(
            editForm,
            setEditForm,
            true,
            listQuery.data?.providers.find((p) => p.id === editId)?.hasPassword,
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditId(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => patchMutation.mutate()}
              disabled={patchMutation.isPending}
            >
              {patchMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar proveedor</DialogTitle>
            <DialogDescription>
              Solo se puede eliminar si no tiene clientes asignados y no es el principal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MailProviderManagement;
