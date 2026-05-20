import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  PlatformClientSelect,
  clientLabelById,
} from "@/components/PlatformClientSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  createPlatformAdminUser,
  fetchPlatformAdminUsers,
  patchPlatformAdminUser,
  patchPlatformAdminUserPassword,
  platformAdminUsersQueryKey,
} from "@/lib/platformAdminUsers";
import {
  fetchPlatformAdminClients,
  platformAdminClientsQueryKey,
} from "@/lib/platformAdminClients";
import { isPlatformAdmin, PLATFORM_ADMIN_EMAIL } from "@/lib/platformAdmin";
import { KeyRound, LogIn, Pencil, Loader2, UserPlus } from "lucide-react";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { token, user, startImpersonation } = useAuth();
  const canImpersonate = isPlatformAdmin(user);
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editClientId, setEditClientId] = useState("");
  const [pwdId, setPwdId] = useState<string | null>(null);
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createPasswordConfirm, setCreatePasswordConfirm] = useState("");
  const [createClientId, setCreateClientId] = useState("");

  const listQuery = useQuery({
    queryKey: platformAdminUsersQueryKey,
    queryFn: () => fetchPlatformAdminUsers(token!),
    enabled: Boolean(token),
  });

  const clientsQuery = useQuery({
    queryKey: platformAdminClientsQueryKey,
    queryFn: () => fetchPlatformAdminClients(token!),
    enabled: Boolean(token),
  });

  const clients = clientsQuery.data?.clients ?? [];

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("NO_CONTEXT");
      if (createPassword !== createPasswordConfirm) throw new Error("MISMATCH");
      if (createPassword.length < 8) throw new Error("SHORT");
      const clientTrim = createClientId.trim();
      return createPlatformAdminUser(token, {
        email: createEmail.trim(),
        password: createPassword,
        clientId: clientTrim === "" ? null : clientTrim,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: platformAdminUsersQueryKey });
      setCreateOpen(false);
      setCreateEmail("");
      setCreatePassword("");
      setCreatePasswordConfirm("");
      setCreateClientId("");
      toast.success("Usuario creado");
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        if (err.message === "MISMATCH") {
          toast.error("Las contraseñas no coinciden");
          return;
        }
        if (err.message === "SHORT") {
          toast.error("La contraseña debe tener al menos 8 caracteres");
          return;
        }
      }
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error("Ese correo ya está registrado");
          return;
        }
        const details =
          typeof err.body === "object" &&
          err.body !== null &&
          "details" in err.body &&
          typeof (err.body as { details?: { message?: string } }).details?.message ===
            "string"
            ? (err.body as { details: { message: string } }).details.message
            : null;
        toast.error(details ?? err.message);
        return;
      }
      toast.error("No se pudo crear el usuario");
    },
  });

  const patchMutation = useMutation({
    mutationFn: async () => {
      if (!editId || !token) throw new Error("NO_CONTEXT");
      const clientTrim = editClientId.trim();
      return patchPlatformAdminUser(token, editId, {
        email: editEmail.trim(),
        clientId: clientTrim === "" ? null : clientTrim,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: platformAdminUsersQueryKey });
      setEditId(null);
      toast.success("Usuario actualizado");
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error("Ese correo ya está en uso");
          return;
        }
        toast.error(err.message);
        return;
      }
      toast.error("No se pudo guardar");
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      await startImpersonation(targetUserId);
    },
    onSuccess: () => {
      toast.success("Sesión iniciada como el usuario seleccionado");
      navigate("/", { replace: true });
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }
      if (err instanceof Error && err.message === "ALREADY_IMPERSONATING") {
        toast.error("Ya estás en una sesión impersonada");
        return;
      }
      toast.error("No se pudo impersonar al usuario");
    },
  });

  const pwdMutation = useMutation({
    mutationFn: async () => {
      if (!pwdId || !token) throw new Error("NO_CONTEXT");
      if (pwdNew !== pwdConfirm) throw new Error("MISMATCH");
      if (pwdNew.length < 8) throw new Error("SHORT");
      return patchPlatformAdminUserPassword(token, pwdId, pwdNew);
    },
    onSuccess: () => {
      setPwdId(null);
      setPwdNew("");
      setPwdConfirm("");
      toast.success("Contraseña actualizada");
    },
    onError: (err: unknown) => {
      if (err instanceof Error) {
        if (err.message === "MISMATCH") {
          toast.error("Las contraseñas no coinciden");
          return;
        }
        if (err.message === "SHORT") {
          toast.error("Mínimo 8 caracteres");
          return;
        }
      }
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }
      toast.error("No se pudo actualizar la contraseña");
    },
  });

  const openEdit = (row: {
    id: string;
    email: string;
    clientId: string | null;
  }) => {
    setEditId(row.id);
    setEditEmail(row.email);
    setEditClientId(row.clientId ?? "");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios de plataforma</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Crear usuarios, editar correo o cliente, restablecer contraseña e iniciar sesión como otro usuario.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Listado</CardTitle>
            <CardDescription>
              Todos los usuarios que pueden iniciar sesión en esta aplicación.
            </CardDescription>
          </div>
          <Button
            type="button"
            className="shrink-0"
            onClick={() => {
              setCreateEmail("");
              setCreatePassword("");
              setCreatePasswordConfirm("");
              setCreateClientId("");
              setCreateOpen(true);
            }}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nuevo usuario
          </Button>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando…
            </div>
          ) : listQuery.isError ? (
            <p className="text-sm text-destructive">No se pudo cargar el listado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Correo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="w-[280px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(listQuery.data?.users ?? []).map((u) => {
                  const isSelf = user?.id === u.id;
                  const isAdminAccount =
                    u.email.trim().toLowerCase() === PLATFORM_ADMIN_EMAIL;
                  const showImpersonate =
                    canImpersonate && !isSelf && !isAdminAccount;

                  return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {clientLabelById(clients, u.clientId)}
                      {u.clientId && (
                        <span className="block font-mono text-xs opacity-70">
                          {u.clientId}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {showImpersonate && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={impersonateMutation.isPending}
                          onClick={() => impersonateMutation.mutate(u.id)}
                        >
                          {impersonateMutation.isPending &&
                          impersonateMutation.variables === u.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <LogIn className="w-3.5 h-3.5 mr-1" />
                              Impersonar
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(u)}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPwdId(u.id);
                          setPwdNew("");
                          setPwdConfirm("");
                        }}
                      >
                        <KeyRound className="w-3.5 h-3.5 mr-1" />
                        Contraseña
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={createOpen}
        onOpenChange={(o) => {
          if (!o) setCreateOpen(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              Define correo, contraseña y, si aplica, el cliente de EnviaMas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="admin-create-email">Correo</Label>
              <Input
                id="admin-create-email"
                type="text"
                inputMode="email"
                autoComplete="off"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-create-pwd">Contraseña</Label>
              <Input
                id="admin-create-pwd"
                type="password"
                autoComplete="new-password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-create-pwd2">Confirmar contraseña</Label>
              <Input
                id="admin-create-pwd2"
                type="password"
                autoComplete="new-password"
                value={createPasswordConfirm}
                onChange={(e) => setCreatePasswordConfirm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-create-client">Cliente</Label>
              <PlatformClientSelect
                id="admin-create-client"
                value={createClientId}
                onChange={setCreateClientId}
                clients={clients}
                loading={clientsQuery.isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Crear usuario"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editId !== null} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Cambia el correo o el cliente asociado. Elige «Sin cliente» para quitar la asociación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="admin-edit-email">Correo</Label>
              <Input
                id="admin-edit-email"
                type="text"
                inputMode="email"
                autoComplete="off"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-edit-client">Cliente</Label>
              <PlatformClientSelect
                id="admin-edit-client"
                value={editClientId}
                onChange={setEditClientId}
                clients={clients}
                loading={clientsQuery.isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditId(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={patchMutation.isPending}
              onClick={() => patchMutation.mutate()}
            >
              {patchMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pwdId !== null} onOpenChange={(o) => !o && setPwdId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva contraseña</DialogTitle>
            <DialogDescription>
              El usuario deberá usar esta contraseña en el próximo inicio de sesión.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="admin-pwd-new">Nueva contraseña</Label>
              <Input
                id="admin-pwd-new"
                type="password"
                autoComplete="new-password"
                value={pwdNew}
                onChange={(e) => setPwdNew(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-pwd-confirm">Confirmar</Label>
              <Input
                id="admin-pwd-confirm"
                type="password"
                autoComplete="new-password"
                value={pwdConfirm}
                onChange={(e) => setPwdConfirm(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPwdId(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={pwdMutation.isPending}
              onClick={() => pwdMutation.mutate()}
            >
              {pwdMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Actualizar contraseña"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
