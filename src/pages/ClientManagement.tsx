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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import {
  addPlatformAdminClientDomain,
  createPlatformAdminClient,
  deletePlatformAdminClient,
  deletePlatformAdminClientDomain,
  fetchPlatformAdminClients,
  patchPlatformAdminClient,
  platformAdminClientsQueryKey,
  setPlatformAdminClientDefaultDomain,
} from "@/lib/platformAdminClients";
import { Building2, Loader2, Plus, Trash2, Star, Pencil } from "lucide-react";

const ClientManagement = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDomain, setCreateDomain] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [domainClientId, setDomainClientId] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: platformAdminClientsQueryKey,
    queryFn: () => fetchPlatformAdminClients(token!),
    enabled: Boolean(token),
  });

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: platformAdminClientsQueryKey });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("NO_CONTEXT");
      const name = createName.trim();
      if (!name) throw new Error("NAME");
      const d = createDomain.trim();
      return createPlatformAdminClient(token, {
        name,
        ...(d ? { initialDomain: d } : {}),
      });
    },
    onSuccess: () => {
      invalidate();
      setCreateOpen(false);
      setCreateName("");
      setCreateDomain("");
      toast.success("Cliente creado");
    },
    onError: (err: unknown) => {
      if (err instanceof Error && err.message === "NAME") {
        toast.error("Indica el nombre del cliente");
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error("Dominio ya en uso");
          return;
        }
        toast.error(err.message);
        return;
      }
      toast.error("No se pudo crear el cliente");
    },
  });

  const patchMutation = useMutation({
    mutationFn: async () => {
      if (!token || !editId) throw new Error("NO_CONTEXT");
      const name = editName.trim();
      if (!name) throw new Error("NAME");
      return patchPlatformAdminClient(token, editId, { name });
    },
    onSuccess: () => {
      invalidate();
      setEditId(null);
      toast.success("Cliente actualizado");
    },
    onError: (err: unknown) => {
      if (err instanceof Error && err.message === "NAME") {
        toast.error("Indica el nombre");
        return;
      }
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error("No se pudo actualizar");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!token || !deleteClientId) throw new Error("NO_CONTEXT");
      await deletePlatformAdminClient(token, deleteClientId);
    },
    onSuccess: () => {
      invalidate();
      setDeleteClientId(null);
      toast.success("Cliente eliminado");
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error("No se pudo eliminar");
    },
  });

  const addDomainMutation = useMutation({
    mutationFn: async () => {
      if (!token || !domainClientId) throw new Error("NO_CONTEXT");
      const d = newDomain.trim().toLowerCase();
      if (!d) throw new Error("DOMAIN");
      return addPlatformAdminClientDomain(token, domainClientId, {
        domain: d,
        isDefault: false,
      });
    },
    onSuccess: () => {
      invalidate();
      setNewDomain("");
      setDomainClientId(null);
      toast.success("Dominio añadido");
    },
    onError: (err: unknown) => {
      if (err instanceof Error && err.message === "DOMAIN") {
        toast.error("Indica el dominio");
        return;
      }
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error("Dominio duplicado o ya asignado a otro cliente");
          return;
        }
        toast.error(err.message);
        return;
      }
      toast.error("No se pudo añadir el dominio");
    },
  });

  const removeDomainMutation = useMutation({
    mutationFn: async (vars: { clientId: string; domainId: string }) => {
      if (!token) throw new Error("NO_CONTEXT");
      await deletePlatformAdminClientDomain(token, vars.clientId, vars.domainId);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Dominio eliminado");
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error("No se pudo eliminar el dominio");
    },
  });

  const defaultDomainMutation = useMutation({
    mutationFn: async (vars: { clientId: string; domainId: string }) => {
      if (!token) throw new Error("NO_CONTEXT");
      return setPlatformAdminClientDefaultDomain(token, vars.clientId, vars.domainId);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Dominio predeterminado actualizado");
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error("No se pudo actualizar");
    },
  });

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            Gestión de clientes
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Clientes de la plataforma y dominios de envío permitidos.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>
            Cada dominio solo puede existir una vez en el sistema.
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
                  <TableHead>ID</TableHead>
                  <TableHead>Dominios</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(listQuery.data?.clients ?? []).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                      {c.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {c.domains.length === 0 ? (
                          <span className="text-muted-foreground text-sm">Sin dominios</span>
                        ) : (
                          c.domains.map((d) => (
                            <Badge
                              key={d.id}
                              variant={d.isDefault ? "default" : "secondary"}
                              className="gap-1 font-normal"
                            >
                              {d.domain}
                              {d.isDefault ? " · predeterminado" : ""}
                              {!d.isDefault && (
                                <button
                                  type="button"
                                  className="ml-1 rounded hover:bg-background/20 p-0.5"
                                  title="Marcar predeterminado"
                                  onClick={() =>
                                    defaultDomainMutation.mutate({
                                      clientId: c.id,
                                      domainId: d.id,
                                    })
                                  }
                                  disabled={defaultDomainMutation.isPending}
                                >
                                  <Star className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                type="button"
                                className="ml-0.5 rounded hover:bg-destructive/20 p-0.5"
                                title="Eliminar dominio"
                                onClick={() =>
                                  removeDomainMutation.mutate({
                                    clientId: c.id,
                                    domainId: d.id,
                                  })
                                }
                                disabled={removeDomainMutation.isPending}
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-7 text-xs"
                        onClick={() => {
                          setDomainClientId(c.id);
                          setNewDomain("");
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Añadir dominio
                      </Button>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Renombrar"
                        onClick={() => {
                          setEditId(c.id);
                          setEditName(c.name);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Eliminar cliente"
                        onClick={() => setDeleteClientId(c.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo cliente</DialogTitle>
            <DialogDescription>
              Opcionalmente indica un primer dominio (se marcará como predeterminado).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="cname">Nombre</Label>
              <Input
                id="cname"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Ej. Synlab Perú"
              />
            </div>
            <div>
              <Label htmlFor="cdom">Dominio inicial (opcional)</Label>
              <Input
                id="cdom"
                value={createDomain}
                onChange={(e) => setCreateDomain(e.target.value)}
                placeholder="news.cliente.com"
              />
            </div>
          </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="ename">Nombre</Label>
              <Input
                id="ename"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
          </div>
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

      <Dialog open={domainClientId !== null} onOpenChange={(o) => !o && setDomainClientId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir dominio</DialogTitle>
            <DialogDescription>Solo el hostname (sin http ni @).</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="ndom">Dominio</Label>
            <Input
              id="ndom"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="mailings.cliente.pe"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDomainClientId(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => addDomainMutation.mutate()}
              disabled={addDomainMutation.isPending}
            >
              {addDomainMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Añadir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteClientId !== null} onOpenChange={(o) => !o && setDeleteClientId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar cliente</DialogTitle>
            <DialogDescription>
              Se eliminarán dominios y claves API asociadas. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteClientId(null)}>
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

export default ClientManagement;
