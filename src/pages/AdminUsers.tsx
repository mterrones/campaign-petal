import { useState } from "react";
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
  fetchPlatformAdminUsers,
  patchPlatformAdminUser,
  patchPlatformAdminUserPassword,
  platformAdminUsersQueryKey,
} from "@/lib/platformAdminUsers";
import { KeyRound, Pencil, Loader2 } from "lucide-react";

const AdminUsers = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editClientId, setEditClientId] = useState("");
  const [pwdId, setPwdId] = useState<string | null>(null);
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");

  const listQuery = useQuery({
    queryKey: platformAdminUsersQueryKey,
    queryFn: () => fetchPlatformAdminUsers(token!),
    enabled: Boolean(token),
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
          Correo, cliente asociado y restablecimiento de contraseña.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>
            Todos los usuarios que pueden iniciar sesión en esta aplicación.
          </CardDescription>
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
                  <TableHead>Client ID</TableHead>
                  <TableHead className="w-[200px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(listQuery.data?.users ?? []).map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {u.clientId ?? "—"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editId !== null} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Cambia el correo o el UUID del cliente. Deja el cliente vacío para quitar la asociación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="admin-edit-email">Correo</Label>
              <Input
                id="admin-edit-email"
                type="email"
                autoComplete="off"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-edit-client">Client ID (UUID)</Label>
              <Input
                id="admin-edit-client"
                placeholder="Vacío = sin cliente"
                className="font-mono text-sm"
                autoComplete="off"
                value={editClientId}
                onChange={(e) => setEditClientId(e.target.value)}
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
