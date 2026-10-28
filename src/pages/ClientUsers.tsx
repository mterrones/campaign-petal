import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useAuth, type ClientRole } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  CLIENT_ROLE_LABELS,
  clientUsersQueryKey,
  createClientUser,
  fetchClientUsers,
  patchClientUser,
  patchClientUserPassword,
  type ClientUserRow,
} from "@/lib/platformClientUsers";
import { formatDateTimeGmtMinus5 } from "@/lib/dateTimeGmtMinus5";
import {
  KeyRound,
  Loader2,
  MoreHorizontal,
  ShieldCheck,
  User,
  UserCheck,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";

const ClientUsers = () => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createPasswordConfirm, setCreatePasswordConfirm] = useState("");
  const [createRole, setCreateRole] = useState<ClientRole>("member");
  const [pwdUser, setPwdUser] = useState<ClientUserRow | null>(null);
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [disableUser, setDisableUser] = useState<ClientUserRow | null>(null);

  const isClientAdmin = user?.clientRole === "admin" && Boolean(user?.clientId);

  const listQuery = useQuery({
    queryKey: clientUsersQueryKey,
    queryFn: () => fetchClientUsers(token!),
    enabled: Boolean(token) && isClientAdmin,
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: clientUsersQueryKey });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("NO_CONTEXT");
      if (createPassword !== createPasswordConfirm) throw new Error("MISMATCH");
      if (createPassword.length < 8) throw new Error("SHORT");
      return createClientUser(token, {
        email: createEmail.trim(),
        password: createPassword,
        clientRole: createRole,
      });
    },
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
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
        if (err.status === 400) {
          toast.error("Revisa el correo: debe tener la forma nombre@dominio");
          return;
        }
      }
      toast.error("No se pudo crear el usuario");
    },
  });

  const patchMutation = useMutation({
    mutationFn: async (vars: {
      id: string;
      body: { clientRole?: ClientRole; disabled?: boolean };
    }) => {
      if (!token) throw new Error("NO_CONTEXT");
      return patchClientUser(token, vars.id, vars.body);
    },
    onSuccess: (_data, vars) => {
      invalidate();
      setDisableUser(null);
      if (vars.body.disabled === true) toast.success("Usuario desactivado");
      else if (vars.body.disabled === false) toast.success("Usuario activado");
      else toast.success("Rol actualizado");
    },
    onError: () => {
      toast.error("No se pudo actualizar el usuario");
    },
  });

  const pwdMutation = useMutation({
    mutationFn: async () => {
      if (!pwdUser || !token) throw new Error("NO_CONTEXT");
      if (pwdNew !== pwdConfirm) throw new Error("MISMATCH");
      if (pwdNew.length < 8) throw new Error("SHORT");
      return patchClientUserPassword(token, pwdUser.id, pwdNew);
    },
    onSuccess: () => {
      setPwdUser(null);
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
      toast.error("No se pudo actualizar la contraseña");
    },
  });

  if (!isClientAdmin) {
    return (
      <div className="space-y-2 max-w-2xl">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          Solo el administrador de tu organización puede gestionar usuarios.
        </p>
      </div>
    );
  }

  const users = listQuery.data?.users ?? [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-7 w-7 text-primary shrink-0" />
          Usuarios
        </h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
          Crea accesos para tu equipo. Cada usuario tiene sus propias campañas, agendas y
          plantillas, y comparte los dominios de envío y la cuota de tu organización.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <CardTitle>Equipo</CardTitle>
            <CardDescription>
              Los administradores pueden crear, desactivar y cambiar el rol de otros usuarios.
            </CardDescription>
          </div>
          <Button
            type="button"
            className="shrink-0"
            onClick={() => {
              setCreateEmail("");
              setCreatePassword("");
              setCreatePasswordConfirm("");
              setCreateRole("member");
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Correo</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="w-[60px] text-right">
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const isSelf = user?.id === u.id;
                    const nextRole: ClientRole = u.clientRole === "admin" ? "member" : "admin";
                    return (
                      <TableRow key={u.id} className={u.disabled ? "opacity-60" : undefined}>
                        <TableCell className="font-medium">
                          {u.email}
                          {isSelf && (
                            <span className="ml-2 text-xs text-muted-foreground">(tú)</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.clientRole === "admin" ? "default" : "secondary"}>
                            {CLIENT_ROLE_LABELS[u.clientRole]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.disabled ? (
                            <Badge variant="outline" className="text-muted-foreground">
                              Desactivado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-success/40 text-success">
                              Activo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDateTimeGmtMinus5(u.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          {!isSelf && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  aria-label={`Acciones para ${u.email}`}
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    patchMutation.mutate({
                                      id: u.id,
                                      body: { clientRole: nextRole },
                                    })
                                  }
                                >
                                  {nextRole === "admin" ? (
                                    <ShieldCheck className="w-4 h-4 mr-2" />
                                  ) : (
                                    <User className="w-4 h-4 mr-2" />
                                  )}
                                  Cambiar a {CLIENT_ROLE_LABELS[nextRole].toLowerCase()}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setPwdUser(u);
                                    setPwdNew("");
                                    setPwdConfirm("");
                                  }}
                                >
                                  <KeyRound className="w-4 h-4 mr-2" />
                                  Restablecer contraseña
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {u.disabled ? (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      patchMutation.mutate({
                                        id: u.id,
                                        body: { disabled: false },
                                      })
                                    }
                                  >
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Activar
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => setDisableUser(u)}
                                  >
                                    <UserX className="w-4 h-4 mr-2" />
                                    Desactivar
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={(o) => !o && setCreateOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
            <DialogDescription>
              Comparte el correo y la contraseña con la persona; podrá ingresar de inmediato.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="client-create-email">Correo</Label>
              <Input
                id="client-create-email"
                type="text"
                inputMode="email"
                autoComplete="off"
                placeholder="nombre@tuempresa.com"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-create-pwd">Contraseña</Label>
              <Input
                id="client-create-pwd"
                type="password"
                autoComplete="new-password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-create-pwd2">Confirmar contraseña</Label>
              <Input
                id="client-create-pwd2"
                type="password"
                autoComplete="new-password"
                value={createPasswordConfirm}
                onChange={(e) => setCreatePasswordConfirm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-create-role">Rol</Label>
              <Select value={createRole} onValueChange={(v) => setCreateRole(v as ClientRole)}>
                <SelectTrigger id="client-create-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Miembro: usa la plataforma</SelectItem>
                  <SelectItem value="admin">Administrador: además gestiona usuarios</SelectItem>
                </SelectContent>
              </Select>
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

      <Dialog open={pwdUser !== null} onOpenChange={(o) => !o && setPwdUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restablecer contraseña</DialogTitle>
            <DialogDescription>
              {pwdUser?.email} deberá usar esta contraseña en su próximo inicio de sesión.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="client-pwd-new">Nueva contraseña</Label>
              <Input
                id="client-pwd-new"
                type="password"
                autoComplete="new-password"
                value={pwdNew}
                onChange={(e) => setPwdNew(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-pwd-confirm">Confirmar</Label>
              <Input
                id="client-pwd-confirm"
                type="password"
                autoComplete="new-password"
                value={pwdConfirm}
                onChange={(e) => setPwdConfirm(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPwdUser(null)}>
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

      <AlertDialog open={disableUser !== null} onOpenChange={(o) => !o && setDisableUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar a {disableUser?.email}?</AlertDialogTitle>
            <AlertDialogDescription>
              No podrá ingresar y su sesión abierta se cerrará. Sus campañas, agendas y
              plantillas se conservan; puedes activarlo de nuevo cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                disableUser &&
                patchMutation.mutate({ id: disableUser.id, body: { disabled: true } })
              }
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientUsers;
