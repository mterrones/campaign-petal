import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Upload, UserPlus, MoreHorizontal, FolderPlus, Folder,
  Trash2, ArrowRightLeft, CheckSquare, X, Pencil, Users, FileSpreadsheet,
  ChevronLeft, ChevronRight, Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import type { PlatformContact } from "@/lib/platformContacts";
import {
  addEmailSuppression,
  bulkDeleteContacts,
  bulkMoveContacts,
  createContactDirectory,
  createPlatformContact,
  createPlatformContactsBatch,
  deleteContactDirectory,
  deletePlatformContact,
  fetchContactDirectories,
  fetchContactsPage,
  fetchEmailSuppressions,
  platformContactDirectoriesQueryKey,
  platformEmailSuppressionsQueryKey,
  removeEmailSuppression,
  updateContactDirectory,
  updatePlatformContact,
} from "@/lib/platformContacts";

const CONTACTS_PAGE_SIZE = 50;
const BLACKLIST_VIRTUAL_ID = "__blacklist__";

const statusMap: Record<string, { label: string; className: string }> = {
  active: { label: "Activo", className: "bg-success/10 text-success border-success/20" },
  unsubscribed: { label: "De baja", className: "bg-warning/10 text-warning border-warning/20" },
  bounced: { label: "Rebotado", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

type SidebarDir = {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
  contactCount: number;
};

type ExcelPreviewRow = {
  email: string;
  name: string;
  lastName: string;
  tags: string[];
};

const Contacts = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [activeDir, setActiveDir] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [listPage, setListPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [newDirName, setNewDirName] = useState("");
  const [newDirDialogOpen, setNewDirDialogOpen] = useState(false);
  const [editDirId, setEditDirId] = useState<string | null>(null);
  const [editDirName, setEditDirName] = useState("");
  const [deleteDirConfirm, setDeleteDirConfirm] = useState<string | null>(null);

  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [suppressionAddOpen, setSuppressionAddOpen] = useState(false);
  const [suppressionAddEmail, setSuppressionAddEmail] = useState("");

  const [addMode, setAddMode] = useState<"choose" | "manual" | "excel" | null>(null);
  const [newContact, setNewContact] = useState({ name: "", lastName: "", email: "", tags: "" });
  const [excelPreview, setExcelPreview] = useState<ExcelPreviewRow[]>([]);
  const [excelFileName, setExcelFileName] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    setListPage(1);
  }, [activeDir, debouncedQ]);

  const dirsQuery = useQuery({
    queryKey: platformContactDirectoriesQueryKey,
    queryFn: () => fetchContactDirectories(token!),
    enabled: !!token,
  });

  const apiDirs = dirsQuery.data?.directories ?? [];

  const suppressionsStatsQuery = useQuery({
    queryKey: [...platformEmailSuppressionsQueryKey, "stats"],
    queryFn: () => fetchEmailSuppressions(token!, { page: 1, limit: 1 }),
    enabled: !!token,
  });

  const contactsQuery = useQuery({
    queryKey: ["platform", "contacts", "list", activeDir, debouncedQ, listPage],
    queryFn: () =>
      fetchContactsPage(token!, {
        directoryId: activeDir === "all" ? undefined : activeDir,
        q: debouncedQ || undefined,
        page: listPage,
        limit: CONTACTS_PAGE_SIZE,
      }),
    enabled: !!token && activeDir !== BLACKLIST_VIRTUAL_ID,
  });

  const suppressionsListQuery = useQuery({
    queryKey: [...platformEmailSuppressionsQueryKey, "list", listPage],
    queryFn: () =>
      fetchEmailSuppressions(token!, {
        page: listPage,
        limit: CONTACTS_PAGE_SIZE,
      }),
    enabled: !!token && activeDir === BLACKLIST_VIRTUAL_ID,
  });

  const contactsList = contactsQuery.data?.contacts ?? [];
  const totalContacts = contactsQuery.data?.total ?? 0;
  const totalPages = contactsQuery.data?.totalPages ?? 0;

  const suppressionsList = suppressionsListQuery.data?.items ?? [];
  const totalSuppressions = suppressionsListQuery.data?.total ?? 0;
  const suppressionsTotalPages = suppressionsListQuery.data?.totalPages ?? 0;

  const sidebarDirs: SidebarDir[] = useMemo(() => {
    const allCount = apiDirs.reduce((s, d) => s + d.contactCount, 0);
    const todos: SidebarDir = {
      id: "all",
      name: "Todos",
      color: "hsl(var(--primary))",
      contactCount: allCount,
    };
    const rest: SidebarDir[] = apiDirs.map((d) => ({
      id: d.id,
      name: d.name,
      color: d.color,
      isDefault: d.isDefault,
      contactCount: d.contactCount,
    }));
    const blacklistDir: SidebarDir = {
      id: BLACKLIST_VIRTUAL_ID,
      name: "Lista negra",
      color: "hsl(0 62% 42%)",
      contactCount: suppressionsStatsQuery.data?.total ?? 0,
    };
    return [todos, blacklistDir, ...rest];
  }, [apiDirs, suppressionsStatsQuery.data?.total]);

  const defaultDirectoryId = useMemo(
    () => apiDirs.find((d) => d.isDefault)?.id ?? apiDirs[0]?.id,
    [apiDirs],
  );

  const resolveTargetDirectoryId = () => {
    if (activeDir !== "all") return activeDir;
    return defaultDirectoryId;
  };

  const invalidateContacts = () => {
    void queryClient.invalidateQueries({ queryKey: platformContactDirectoriesQueryKey });
    void queryClient.invalidateQueries({ queryKey: ["platform", "contacts"] });
  };

  const invalidateSuppressions = () => {
    void queryClient.invalidateQueries({ queryKey: platformEmailSuppressionsQueryKey });
  };

  const createDirMutation = useMutation({
    mutationFn: async () => {
      const name = newDirName.trim();
      if (!name) throw new Error("empty");
      const hue = Math.floor(Math.random() * 360);
      return createContactDirectory(token!, {
        name,
        color: `hsl(${hue}, 60%, 48%)`,
      });
    },
    onSuccess: () => {
      setNewDirName("");
      setNewDirDialogOpen(false);
      invalidateContacts();
      toast({ title: "Directorio creado" });
    },
    onError: () => {
      toast({ title: "No se pudo crear el directorio", variant: "destructive" });
    },
  });

  const renameDirMutation = useMutation({
    mutationFn: async () => {
      if (!editDirId || !editDirName.trim()) throw new Error("empty");
      return updateContactDirectory(token!, editDirId, { name: editDirName.trim() });
    },
    onSuccess: () => {
      setEditDirId(null);
      setEditDirName("");
      invalidateContacts();
      toast({ title: "Directorio actualizado" });
    },
    onError: () => {
      toast({ title: "No se pudo renombrar", variant: "destructive" });
    },
  });

  const deleteDirMutation = useMutation({
    mutationFn: async (id: string) => deleteContactDirectory(token!, id),
    onSuccess: (_, deletedId) => {
      setDeleteDirConfirm(null);
      if (activeDir === deletedId) setActiveDir("all");
      invalidateContacts();
      toast({ title: "Directorio eliminado", description: "Los contactos pasaron a General." });
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 404) {
        toast({ title: "No se puede eliminar este directorio", variant: "destructive" });
      } else {
        toast({ title: "Error al eliminar", variant: "destructive" });
      }
    },
  });

  const addContactMutation = useMutation({
    mutationFn: async () => {
      const dirId = resolveTargetDirectoryId();
      if (!dirId) throw new Error("no-dir");
      return createPlatformContact(token!, {
        directoryId: dirId,
        email: newContact.email.trim(),
        name: newContact.name.trim(),
        lastName: newContact.lastName.trim(),
        tags: newContact.tags
          ? newContact.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      });
    },
    onSuccess: () => {
      setNewContact({ name: "", lastName: "", email: "", tags: "" });
      setAddMode(null);
      invalidateContacts();
      toast({ title: "Contacto agregado" });
    },
    onError: () => {
      toast({
        title: "No se pudo agregar",
        description: "Revisa el email (único) y el directorio.",
        variant: "destructive",
      });
    },
  });

  const importBatchMutation = useMutation({
    mutationFn: async () => {
      const dirId = resolveTargetDirectoryId();
      if (!dirId) throw new Error("no-dir");
      return createPlatformContactsBatch(token!, {
        directoryId: dirId,
        contacts: excelPreview.map((r) => ({
          email: r.email,
          name: r.name,
          lastName: r.lastName,
          tags: r.tags,
        })),
      });
    },
    onSuccess: (res) => {
      setExcelPreview([]);
      setExcelFileName("");
      setAddMode(null);
      invalidateContacts();
      toast({
        title: "Importación completada",
        description: `${res.inserted} agregados${res.skipped ? `, ${res.skipped} omitidos` : ""}.`,
      });
    },
    onError: () => {
      toast({ title: "Error al importar", variant: "destructive" });
    },
  });

  const bulkMoveMutation = useMutation({
    mutationFn: (targetDirId: string) =>
      bulkMoveContacts(token!, Array.from(selectedIds), targetDirId),
    onSuccess: (_, targetDirId) => {
      const name = sidebarDirs.find((d) => d.id === targetDirId)?.name ?? "";
      setSelectedIds(new Set());
      setMoveDialogOpen(false);
      invalidateContacts();
      toast({ title: `Movidos a "${name}"` });
    },
    onError: () => toast({ title: "No se pudo mover", variant: "destructive" }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: () => bulkDeleteContacts(token!, Array.from(selectedIds)),
    onSuccess: (res) => {
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      invalidateContacts();
      toast({ title: `${res.deleted} contacto(s) eliminados` });
    },
    onError: () => toast({ title: "No se pudo eliminar", variant: "destructive" }),
  });

  const deleteOneMutation = useMutation({
    mutationFn: (id: string) => deletePlatformContact(token!, id),
    onSuccess: () => {
      invalidateContacts();
      toast({ title: "Contacto eliminado" });
    },
    onError: () => toast({ title: "No se pudo eliminar", variant: "destructive" }),
  });

  const addSuppressionMutation = useMutation({
    mutationFn: () => addEmailSuppression(token!, { email: suppressionAddEmail.trim() }),
    onSuccess: () => {
      setSuppressionAddEmail("");
      setSuppressionAddOpen(false);
      invalidateSuppressions();
      toast({ title: "Email añadido a la lista negra" });
    },
    onError: () => {
      toast({
        title: "No se pudo añadir",
        description: "Comprueba que el email sea válido.",
        variant: "destructive",
      });
    },
  });

  const removeSuppressionMutation = useMutation({
    mutationFn: (email: string) => removeEmailSuppression(token!, email),
    onSuccess: () => {
      invalidateSuppressions();
      toast({ title: "Eliminado de la lista negra" });
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 404) {
        toast({ title: "No estaba en la lista", variant: "destructive" });
      } else {
        toast({ title: "No se pudo quitar", variant: "destructive" });
      }
    },
  });

  const moveOneMutation = useMutation({
    mutationFn: ({ id, directoryId }: { id: string; directoryId: string }) =>
      updatePlatformContact(token!, id, { directoryId }),
    onSuccess: (_, v) => {
      invalidateContacts();
      const name = sidebarDirs.find((d) => d.id === v.directoryId)?.name ?? "";
      toast({ title: `Movido a "${name}"` });
    },
    onError: () => toast({ title: "No se pudo mover", variant: "destructive" }),
  });

  const allSelected =
    contactsList.length > 0 && contactsList.every((c) => selectedIds.has(c.id));

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(contactsList.map((c) => c.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleCreateDir = () => {
    if (!newDirName.trim()) return;
    createDirMutation.mutate();
  };

  const handleRenameDir = () => {
    if (!editDirId || !editDirName.trim()) return;
    renameDirMutation.mutate();
  };

  const handleDeleteDir = (dirId: string) => {
    deleteDirMutation.mutate(dirId);
  };

  const handleBulkMove = (targetDirId: string) => {
    bulkMoveMutation.mutate(targetDirId);
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate();
  };

  const handleDeleteContact = (id: string) => {
    deleteOneMutation.mutate(id);
  };

  const handleAddContact = () => {
    if (!newContact.email.trim()) return;
    addContactMutation.mutate();
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split("\n").filter((l) => l.trim());
        if (lines.length < 2) {
          toast({ title: "Archivo vacío", description: "El archivo no contiene datos.", variant: "destructive" });
          return;
        }

        const headers = lines[0].split(/[,;\t]/).map((h) => h.trim().toLowerCase());
        const emailIdx = headers.findIndex((h) => h.includes("email") || h.includes("correo"));
        const nameIdx = headers.findIndex((h) => h === "nombre" || h === "name" || h === "first_name");
        const lastNameIdx = headers.findIndex((h) => h.includes("apellido") || h === "last_name" || h === "lastname");
        const tagsIdx = headers.findIndex((h) => h.includes("etiqueta") || h.includes("tag"));

        if (emailIdx === -1) {
          toast({
            title: "Columna de email no encontrada",
            description: "Incluye una columna Email o Correo.",
            variant: "destructive",
          });
          return;
        }

        const parsed: ExcelPreviewRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ""));
          const email = cols[emailIdx];
          if (!email || !email.includes("@")) continue;
          parsed.push({
            email,
            name: nameIdx >= 0 ? cols[nameIdx] || "" : "",
            lastName: lastNameIdx >= 0 ? cols[lastNameIdx] || "" : "",
            tags:
              tagsIdx >= 0 && cols[tagsIdx]
                ? cols[tagsIdx].split("|").map((t) => t.trim()).filter(Boolean)
                : [],
          });
        }
        setExcelPreview(parsed);
      } catch {
        toast({ title: "Error al leer archivo", description: "No se pudo procesar el archivo.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const handleImportExcel = () => {
    if (excelPreview.length === 0) return;
    importBatchMutation.mutate();
  };

  const formatCreated = (iso: string) => {
    try {
      return new Date(iso).toISOString().slice(0, 10);
    } catch {
      return iso;
    }
  };

  const findDirName = (c: PlatformContact) =>
    sidebarDirs.find((d) => d.id === c.directoryId)?.name ?? c.directoryId;

  const findDirColor = (c: PlatformContact) =>
    sidebarDirs.find((d) => d.id === c.directoryId)?.color;

  if (!token) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Contactos</h1>
        <p className="text-muted-foreground text-sm">Inicia sesión para gestionar contactos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contactos</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu base de datos de suscriptores</p>
        </div>
      </div>

      {dirsQuery.isError && (
        <p className="text-destructive text-sm">No se pudieron cargar los directorios.</p>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-56 md:shrink-0 space-y-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Directorios</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setNewDirDialogOpen(true)}>
              <FolderPlus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {sidebarDirs.map((dir) => (
              <div
                key={dir.id}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors whitespace-nowrap shrink-0 md:shrink",
                  activeDir === dir.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground",
                )}
                onClick={() => {
                  setActiveDir(dir.id);
                  setSelectedIds(new Set());
                }}
              >
                {dir.id === BLACKLIST_VIRTUAL_ID ? (
                  <Ban className="w-4 h-4 shrink-0" style={{ color: dir.color }} />
                ) : (
                  <Folder className="w-4 h-4 shrink-0" style={{ color: dir.color }} />
                )}
                <span className="flex-1 truncate">{dir.name}</span>
                <span className="text-xs text-muted-foreground">{dir.contactCount}</span>
                {dir.id !== "all" && dir.id !== BLACKLIST_VIRTUAL_ID && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditDirId(dir.id);
                          setEditDirName(dir.name);
                        }}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-2" /> Renombrar
                      </DropdownMenuItem>
                      {!dir.isDefault && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteDirConfirm(dir.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-4 min-w-0">
          {activeDir === BLACKLIST_VIRTUAL_ID ? (
            <>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-end">
                <Button onClick={() => setSuppressionAddOpen(true)} className="w-full sm:w-auto">
                  <UserPlus className="w-4 h-4 mr-2" /> Añadir email
                </Button>
              </div>

              {suppressionsListQuery.isPending && (
                <p className="text-sm text-muted-foreground py-8">Cargando lista negra…</p>
              )}

              {!suppressionsListQuery.isPending && suppressionsListQuery.isError && (
                <p className="text-destructive text-sm py-8">No se pudo cargar la lista negra.</p>
              )}

              {!suppressionsListQuery.isPending && !suppressionsListQuery.isError && (
                <>
                  <div className="md:hidden space-y-3">
                    {suppressionsList.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Ban className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>No hay direcciones bloqueadas</p>
                      </div>
                    )}
                    {suppressionsList.map((row) => (
                      <div
                        key={row.email}
                        className="bg-card rounded-xl border shadow-sm p-4 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{row.email}</p>
                          <p className="text-xs text-muted-foreground">{formatCreated(row.createdAt)}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 text-destructive border-destructive/30"
                          onClick={() => removeSuppressionMutation.mutate(row.email)}
                          disabled={removeSuppressionMutation.isPending}
                        >
                          Quitar
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="hidden md:block bg-card rounded-xl border shadow-sm overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="w-36 text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {suppressionsList.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                              <Ban className="w-10 h-10 mx-auto mb-3 opacity-30" />
                              <p>No hay direcciones bloqueadas</p>
                            </TableCell>
                          </TableRow>
                        )}
                        {suppressionsList.map((row) => (
                          <TableRow key={row.email}>
                            <TableCell className="font-medium">{row.email}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatCreated(row.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive border-destructive/30"
                                onClick={() => removeSuppressionMutation.mutate(row.email)}
                                disabled={removeSuppressionMutation.isPending}
                              >
                                Quitar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {suppressionsTotalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <p className="text-sm text-muted-foreground">
                        {(listPage - 1) * CONTACTS_PAGE_SIZE + 1}–
                        {Math.min(listPage * CONTACTS_PAGE_SIZE, totalSuppressions)} de{" "}
                        {totalSuppressions.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={listPage <= 1 || suppressionsListQuery.isFetching}
                          onClick={() => setListPage((p) => Math.max(1, p - 1))}
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground tabular-nums px-2">
                          Página {listPage} de {suppressionsTotalPages}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            listPage >= suppressionsTotalPages || suppressionsListQuery.isFetching
                          }
                          onClick={() => setListPage((p) => Math.min(suppressionsTotalPages, p + 1))}
                        >
                          Siguiente
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contactos..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <Button onClick={() => setAddMode("choose")} className="w-full sm:w-auto" disabled={!defaultDirectoryId}>
                <UserPlus className="w-4 h-4 mr-2" /> Agregar Contactos
              </Button>

              {selectedIds.size > 0 && (
                <>
                  <Badge variant="secondary" className="text-xs">
                    <CheckSquare className="w-3.5 h-3.5 mr-1" />
                    {selectedIds.size} sel.
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setMoveDialogOpen(true)}>
                    <ArrowRightLeft className="w-4 h-4 mr-1" /> Mover
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedIds(new Set())}>
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {contactsQuery.isPending && (
            <p className="text-sm text-muted-foreground py-8">Cargando contactos…</p>
          )}

          {!contactsQuery.isPending && contactsQuery.isError && (
            <p className="text-destructive text-sm py-8">No se pudieron cargar los contactos.</p>
          )}

          {!contactsQuery.isPending && !contactsQuery.isError && (
            <>
              <div className="md:hidden space-y-3">
                {contactsList.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No hay contactos en este directorio</p>
                  </div>
                )}
                {contactsList.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      "bg-card rounded-xl border shadow-sm p-4",
                      selectedIds.has(c.id) && "ring-2 ring-primary/30",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox checked={selectedIds.has(c.id)} onCheckedChange={() => toggleOne(c.id)} className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {c.name} {c.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <div className="flex items-center gap-1 text-xs">
                            <Folder className="w-3 h-3" style={{ color: findDirColor(c) }} />
                            {findDirName(c)}
                          </div>
                          <Badge variant="outline" className={`text-xs ${statusMap[c.status]?.className}`}>
                            {statusMap[c.status]?.label}
                          </Badge>
                          {c.tags.map((t) => (
                            <Badge key={t} variant="secondary" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {sidebarDirs
                            .filter(
                              (d) =>
                                d.id !== "all" &&
                                d.id !== BLACKLIST_VIRTUAL_ID &&
                                d.id !== c.directoryId,
                            )
                            .map((d) => (
                              <DropdownMenuItem
                                key={d.id}
                                onClick={() => moveOneMutation.mutate({ id: c.id, directoryId: d.id })}
                              >
                                <Folder className="w-3.5 h-3.5 mr-2" style={{ color: d.color }} />
                                Mover a {d.name}
                              </DropdownMenuItem>
                            ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteContact(c.id)}>
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block bg-card rounded-xl border shadow-sm overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                      </TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Directorio</TableHead>
                      <TableHead>Etiquetas</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Alta</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactsList.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                          <p>No hay contactos en este directorio</p>
                        </TableCell>
                      </TableRow>
                    )}
                    {contactsList.map((c) => (
                      <TableRow key={c.id} className={selectedIds.has(c.id) ? "bg-primary/5" : ""}>
                        <TableCell>
                          <Checkbox checked={selectedIds.has(c.id)} onCheckedChange={() => toggleOne(c.id)} />
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">
                            {c.name} {c.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Folder className="w-3.5 h-3.5" style={{ color: findDirColor(c) }} />
                            {findDirName(c)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {c.tags.map((t) => (
                              <Badge key={t} variant="secondary" className="text-xs">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${statusMap[c.status]?.className}`}>
                            {statusMap[c.status]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatCreated(c.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {sidebarDirs
                                .filter(
                                  (d) =>
                                    d.id !== "all" &&
                                    d.id !== BLACKLIST_VIRTUAL_ID &&
                                    d.id !== c.directoryId,
                                )
                                .map((d) => (
                                  <DropdownMenuItem
                                    key={d.id}
                                    onClick={() => moveOneMutation.mutate({ id: c.id, directoryId: d.id })}
                                  >
                                    <Folder className="w-3.5 h-3.5 mr-2" style={{ color: d.color }} />
                                    Mover a {d.name}
                                  </DropdownMenuItem>
                                ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteContact(c.id)}>
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <p className="text-sm text-muted-foreground">
                    {(listPage - 1) * CONTACTS_PAGE_SIZE + 1}–
                    {Math.min(listPage * CONTACTS_PAGE_SIZE, totalContacts)} de {totalContacts.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={listPage <= 1 || contactsQuery.isFetching}
                      onClick={() => setListPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground tabular-nums px-2">
                      Página {listPage} de {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={listPage >= totalPages || contactsQuery.isFetching}
                      onClick={() => setListPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
            </>
          )}
        </div>
      </div>

      <Dialog open={newDirDialogOpen} onOpenChange={setNewDirDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Directorio</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Nombre del directorio</Label>
            <Input
              className="mt-1.5"
              value={newDirName}
              onChange={(e) => setNewDirName(e.target.value)}
              placeholder="Ej: Clientes 2026"
              onKeyDown={(e) => e.key === "Enter" && handleCreateDir()}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleCreateDir} disabled={createDirMutation.isPending}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editDirId} onOpenChange={(o) => {
        if (!o) setEditDirId(null);
      }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar Directorio</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label>Nuevo nombre</Label>
            <Input
              className="mt-1.5"
              value={editDirName}
              onChange={(e) => setEditDirName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRenameDir()}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleRenameDir} disabled={renameDirMutation.isPending}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteDirConfirm} onOpenChange={(o) => {
        if (!o) setDeleteDirConfirm(null);
      }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar directorio?</AlertDialogTitle>
            <AlertDialogDescription>
              Los contactos de este directorio serán movidos a &quot;General&quot;. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDirConfirm) handleDeleteDir(deleteDirConfirm);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover {selectedIds.size} contacto(s)</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">Selecciona el directorio de destino:</p>
          <div className="space-y-1">
            {sidebarDirs
              .filter((d) => d.id !== "all" && d.id !== BLACKLIST_VIRTUAL_ID)
              .map((d) => (
                <Button
                  key={d.id}
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => handleBulkMove(d.id)}
                  disabled={bulkMoveMutation.isPending}
                >
                  <Folder className="w-4 h-4" style={{ color: d.color }} />
                  {d.name}
                  <span className="text-xs text-muted-foreground ml-auto">{d.contactCount}</span>
                </Button>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={suppressionAddOpen}
        onOpenChange={(o) => {
          setSuppressionAddOpen(o);
          if (!o) setSuppressionAddEmail("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir a lista negra</DialogTitle>
            <DialogDescription>
              No se enviarán correos a esta dirección desde la app ni por API (si tu cuenta está vinculada).
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="suppression-email">Email</Label>
            <Input
              id="suppression-email"
              className="mt-1.5"
              type="email"
              value={suppressionAddEmail}
              onChange={(e) => setSuppressionAddEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              onKeyDown={(e) => {
                if (e.key === "Enter" && suppressionAddEmail.trim()) {
                  addSuppressionMutation.mutate();
                }
              }}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={() => addSuppressionMutation.mutate()}
              disabled={!suppressionAddEmail.trim() || addSuppressionMutation.isPending}
            >
              Añadir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {selectedIds.size} contacto(s)?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={bulkDeleteMutation.isPending}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={addMode !== null}
        onOpenChange={(o) => {
          if (!o) {
            setAddMode(null);
            setExcelPreview([]);
            setExcelFileName("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          {addMode === "choose" && (
            <>
              <DialogHeader>
                <DialogTitle>Agregar Contactos</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">¿Cómo deseas agregar contactos?</p>
              <div className="grid grid-cols-2 gap-4 py-4">
                <button
                  type="button"
                  onClick={() => setAddMode("manual")}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <UserPlus className="w-8 h-8 text-primary" />
                  <span className="font-medium text-sm">Manual</span>
                  <span className="text-xs text-muted-foreground text-center">Ingresa los datos de un contacto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode("excel")}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <FileSpreadsheet className="w-8 h-8 text-primary" />
                  <span className="font-medium text-sm">Importar Excel / CSV</span>
                  <span className="text-xs text-muted-foreground text-center">Sube un archivo con tus contactos</span>
                </button>
              </div>
            </>
          )}

          {addMode === "manual" && (
            <>
              <DialogHeader>
                <DialogTitle>Nuevo Contacto</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input
                      placeholder="Nombre"
                      className="mt-1.5"
                      value={newContact.name}
                      onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Apellido</Label>
                    <Input
                      placeholder="Apellido"
                      className="mt-1.5"
                      value={newContact.lastName}
                      onChange={(e) => setNewContact((p) => ({ ...p, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    placeholder="email@ejemplo.com"
                    type="email"
                    className="mt-1.5"
                    value={newContact.email}
                    onChange={(e) => setNewContact((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Etiquetas</Label>
                  <Input
                    placeholder="VIP, Newsletter (separar con comas)"
                    className="mt-1.5"
                    value={newContact.tags}
                    onChange={(e) => setNewContact((p) => ({ ...p, tags: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddMode("choose")}>
                  Atrás
                </Button>
                <Button onClick={handleAddContact} disabled={addContactMutation.isPending}>
                  Guardar Contacto
                </Button>
              </DialogFooter>
            </>
          )}

          {addMode === "excel" && (
            <>
              <DialogHeader>
                <DialogTitle>Importar desde Excel / CSV</DialogTitle>
              </DialogHeader>
              {excelPreview.length === 0 ? (
                <div className="py-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    Sube un archivo <strong>.csv</strong> o <strong>.txt</strong> con columnas: Email, Nombre, Apellido, Etiquetas (separadas por |).
                  </p>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-colors">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Arrastra tu archivo aquí o haz clic</p>
                    <p className="text-xs text-muted-foreground mb-3">CSV, TXT (separado por comas, punto y coma o tabulaciones)</p>
                    <Input type="file" accept=".csv,.txt,.tsv" className="max-w-xs mx-auto" onChange={handleExcelUpload} />
                  </div>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setAddMode("choose")}>
                      Atrás
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="py-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    Se encontraron <strong>{excelPreview.length}</strong> filas en &quot;{excelFileName}&quot;:
                  </p>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Etiquetas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {excelPreview.slice(0, 50).map((c, idx) => (
                          <TableRow key={`${c.email}-${idx}`}>
                            <TableCell className="text-xs">{c.email}</TableCell>
                            <TableCell className="text-xs">
                              {c.name} {c.lastName}
                            </TableCell>
                            <TableCell className="text-xs">{c.tags.join(", ")}</TableCell>
                          </TableRow>
                        ))}
                        {excelPreview.length > 50 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-xs text-muted-foreground">
                              ...y {excelPreview.length - 50} más
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setExcelPreview([]);
                        setExcelFileName("");
                      }}
                    >
                      Cambiar archivo
                    </Button>
                    <Button onClick={handleImportExcel} disabled={importBatchMutation.isPending}>
                      Importar {excelPreview.length} contacto(s)
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contacts;
