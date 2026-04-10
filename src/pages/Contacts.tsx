import { useState, useMemo } from "react";
import {
  Search, Upload, UserPlus, MoreHorizontal, FolderPlus, Folder,
  Trash2, ArrowRightLeft, CheckSquare, X, Pencil, Users, FileSpreadsheet,
} from "lucide-react";
import { contacts as initialContacts, defaultDirectories, type Contact, type ContactDirectory } from "@/data/mockData";
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

const statusMap: Record<string, { label: string; className: string }> = {
  active: { label: "Activo", className: "bg-success/10 text-success border-success/20" },
  unsubscribed: { label: "De baja", className: "bg-warning/10 text-warning border-warning/20" },
  bounced: { label: "Rebotado", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const Contacts = () => {
  const [contactsList, setContactsList] = useState<Contact[]>(initialContacts);
  const [directories, setDirectories] = useState<ContactDirectory[]>(defaultDirectories);
  const [activeDir, setActiveDir] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Directory CRUD state
  const [newDirName, setNewDirName] = useState("");
  const [newDirDialogOpen, setNewDirDialogOpen] = useState(false);
  const [editDirId, setEditDirId] = useState<string | null>(null);
  const [editDirName, setEditDirName] = useState("");
  const [deleteDirConfirm, setDeleteDirConfirm] = useState<string | null>(null);

  // Move dialog
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);

  // Bulk delete
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Add contact flow: "choose" | "manual" | "excel"
  const [addMode, setAddMode] = useState<"choose" | "manual" | "excel" | null>(null);
  const [newContact, setNewContact] = useState({ name: "", lastName: "", email: "", tags: "" });
  const [excelPreview, setExcelPreview] = useState<Contact[]>([]);
  const [excelFileName, setExcelFileName] = useState("");

  const dirCounts = useMemo(() => {
    const map: Record<string, number> = {};
    contactsList.forEach((c) => {
      map[c.directoryId] = (map[c.directoryId] || 0) + 1;
    });
    return map;
  }, [contactsList]);

  const filtered = useMemo(() => {
    let list = contactsList;
    if (activeDir !== "all") list = list.filter((c) => c.directoryId === activeDir);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q));
    }
    return list;
  }, [contactsList, activeDir, searchTerm]);

  const allSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  // Directory CRUD
  const handleCreateDir = () => {
    if (!newDirName.trim()) return;
    const id = newDirName.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const hue = Math.floor(Math.random() * 360);
    setDirectories((d) => [...d, { id, name: newDirName.trim(), color: `hsl(${hue}, 60%, 50%)` }]);
    setNewDirName("");
    setNewDirDialogOpen(false);
    toast({ title: "Directorio creado", description: `"${newDirName.trim()}" fue creado correctamente.` });
  };

  const handleRenameDir = () => {
    if (!editDirId || !editDirName.trim()) return;
    setDirectories((d) => d.map((dir) => dir.id === editDirId ? { ...dir, name: editDirName.trim() } : dir));
    setEditDirId(null);
    setEditDirName("");
    toast({ title: "Directorio renombrado" });
  };

  const handleDeleteDir = (dirId: string) => {
    setContactsList((list) => list.map((c) => c.directoryId === dirId ? { ...c, directoryId: "general" } : c));
    setDirectories((d) => d.filter((dir) => dir.id !== dirId));
    if (activeDir === dirId) setActiveDir("all");
    setDeleteDirConfirm(null);
    toast({ title: "Directorio eliminado", description: "Los contactos fueron movidos a General." });
  };

  // Bulk actions
  const handleBulkMove = (targetDirId: string) => {
    setContactsList((list) => list.map((c) => selectedIds.has(c.id) ? { ...c, directoryId: targetDirId } : c));
    const dirName = directories.find((d) => d.id === targetDirId)?.name || targetDirId;
    toast({ title: `${selectedIds.size} contacto(s) movidos a "${dirName}"` });
    setSelectedIds(new Set());
    setMoveDialogOpen(false);
  };

  const handleBulkDelete = () => {
    setContactsList((list) => list.filter((c) => !selectedIds.has(c.id)));
    toast({ title: `${selectedIds.size} contacto(s) eliminados` });
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
  };

  const handleDeleteContact = (id: string) => {
    setContactsList((list) => list.filter((c) => c.id !== id));
    toast({ title: "Contacto eliminado" });
  };

  const handleAddContact = () => {
    if (!newContact.email.trim()) return;
    const c: Contact = {
      id: Date.now().toString(),
      email: newContact.email.trim(),
      name: newContact.name.trim(),
      lastName: newContact.lastName.trim(),
      tags: newContact.tags ? newContact.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      list: directories.find((d) => d.id === activeDir && d.id !== "all")?.name || "General",
      directoryId: activeDir !== "all" ? activeDir : "general",
    };
    setContactsList((list) => [...list, c]);
    setNewContact({ name: "", lastName: "", email: "", tags: "" });
    setAddMode(null);
    toast({ title: "Contacto agregado" });
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
          toast({ title: "Columna de email no encontrada", description: "El archivo debe tener una columna 'Email' o 'Correo'.", variant: "destructive" });
          return;
        }

        const parsed: Contact[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ""));
          const email = cols[emailIdx];
          if (!email || !email.includes("@")) continue;
          parsed.push({
            id: `import-${Date.now()}-${i}`,
            email,
            name: nameIdx >= 0 ? cols[nameIdx] || "" : "",
            lastName: lastNameIdx >= 0 ? cols[lastNameIdx] || "" : "",
            tags: tagsIdx >= 0 && cols[tagsIdx] ? cols[tagsIdx].split("|").map((t) => t.trim()).filter(Boolean) : [],
            status: "active",
            createdAt: new Date().toISOString().split("T")[0],
            list: directories.find((d) => d.id === activeDir && d.id !== "all")?.name || "General",
            directoryId: activeDir !== "all" ? activeDir : "general",
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
    setContactsList((list) => [...list, ...excelPreview]);
    toast({ title: `${excelPreview.length} contacto(s) importados` });
    setExcelPreview([]);
    setExcelFileName("");
    setAddMode(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contactos</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu base de datos de suscriptores</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAddMode("choose")}>
            <UserPlus className="w-4 h-4 mr-2" /> Agregar Contactos
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Activos</p>
          <p className="text-2xl font-bold mt-1">{contactsList.filter((c) => c.status === "active").length.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">De Baja</p>
          <p className="text-2xl font-bold mt-1">{contactsList.filter((c) => c.status === "unsubscribed").length.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Rebotados</p>
          <p className="text-2xl font-bold mt-1">{contactsList.filter((c) => c.status === "bounced").length.toLocaleString()}</p>
        </div>
      </div>

      {/* Main layout: sidebar + table */}
      <div className="flex gap-6">
        {/* Directory sidebar */}
        <div className="w-56 shrink-0 space-y-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Directorios</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setNewDirDialogOpen(true)}>
              <FolderPlus className="w-4 h-4" />
            </Button>
          </div>

          {directories.map((dir) => (
            <div
              key={dir.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors",
                activeDir === dir.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground"
              )}
              onClick={() => { setActiveDir(dir.id); setSelectedIds(new Set()); }}
            >
              <Folder className="w-4 h-4 shrink-0" style={{ color: dir.color }} />
              <span className="flex-1 truncate">{dir.name}</span>
              <span className="text-xs text-muted-foreground">
                {dir.id === "all" ? contactsList.length : (dirCounts[dir.id] || 0)}
              </span>
              {dir.id !== "all" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost" size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditDirId(dir.id); setEditDirName(dir.name); }}>
                      <Pencil className="w-3.5 h-3.5 mr-2" /> Renombrar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleteDirConfirm(dir.id)}>
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Search + bulk actions */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contactos..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {selectedIds.size > 0 && (
              <div className="flex gap-2 items-center ml-auto">
                <Badge variant="secondary" className="text-xs">
                  <CheckSquare className="w-3.5 h-3.5 mr-1" />
                  {selectedIds.size} seleccionados
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setMoveDialogOpen(true)}>
                  <ArrowRightLeft className="w-4 h-4 mr-1" /> Mover
                </Button>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setBulkDeleteOpen(true)}>
                  <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedIds(new Set())}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
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
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No hay contactos en este directorio</p>
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((c) => {
                  const dir = directories.find((d) => d.id === c.directoryId);
                  return (
                    <TableRow key={c.id} className={selectedIds.has(c.id) ? "bg-primary/5" : ""}>
                      <TableCell>
                        <Checkbox checked={selectedIds.has(c.id)} onCheckedChange={() => toggleOne(c.id)} />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{c.name} {c.lastName}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Folder className="w-3.5 h-3.5" style={{ color: dir?.color }} />
                          {dir?.name || c.directoryId}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {c.tags.map((t) => (
                            <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${statusMap[c.status]?.className}`}>
                          {statusMap[c.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.createdAt}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {directories.filter((d) => d.id !== "all" && d.id !== c.directoryId).map((d) => (
                              <DropdownMenuItem key={d.id} onClick={() => {
                                setContactsList((list) => list.map((x) => x.id === c.id ? { ...x, directoryId: d.id } : x));
                                toast({ title: `Movido a "${d.name}"` });
                              }}>
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
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Dialog: New directory */}
      <Dialog open={newDirDialogOpen} onOpenChange={setNewDirDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo Directorio</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label>Nombre del directorio</Label>
            <Input className="mt-1.5" value={newDirName} onChange={(e) => setNewDirName(e.target.value)} placeholder="Ej: Clientes 2026" onKeyDown={(e) => e.key === "Enter" && handleCreateDir()} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleCreateDir}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Rename directory */}
      <Dialog open={!!editDirId} onOpenChange={(o) => { if (!o) setEditDirId(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Renombrar Directorio</DialogTitle></DialogHeader>
          <div className="py-4">
            <Label>Nuevo nombre</Label>
            <Input className="mt-1.5" value={editDirName} onChange={(e) => setEditDirName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleRenameDir()} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleRenameDir}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert: Delete directory */}
      <AlertDialog open={!!deleteDirConfirm} onOpenChange={(o) => { if (!o) setDeleteDirConfirm(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar directorio?</AlertDialogTitle>
            <AlertDialogDescription>
              Los contactos de este directorio serán movidos a "General". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteDirConfirm && handleDeleteDir(deleteDirConfirm)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Bulk move */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mover {selectedIds.size} contacto(s)</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">Selecciona el directorio de destino:</p>
          <div className="space-y-1">
            {directories.filter((d) => d.id !== "all").map((d) => (
              <Button key={d.id} variant="ghost" className="w-full justify-start gap-2" onClick={() => handleBulkMove(d.id)}>
                <Folder className="w-4 h-4" style={{ color: d.color }} />
                {d.name}
                <span className="text-xs text-muted-foreground ml-auto">{dirCounts[d.id] || 0}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert: Bulk delete */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {selectedIds.size} contacto(s)?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: New contact */}
      <Dialog open={newContactOpen} onOpenChange={setNewContactOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo Contacto</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input placeholder="Nombre" className="mt-1.5" value={newContact.name} onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <Label>Apellido</Label>
                <Input placeholder="Apellido" className="mt-1.5" value={newContact.lastName} onChange={(e) => setNewContact((p) => ({ ...p, lastName: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input placeholder="email@ejemplo.com" type="email" className="mt-1.5" value={newContact.email} onChange={(e) => setNewContact((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <Label>Etiquetas</Label>
              <Input placeholder="VIP, Newsletter (separar con comas)" className="mt-1.5" value={newContact.tags} onChange={(e) => setNewContact((p) => ({ ...p, tags: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleAddContact}>Guardar Contacto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contacts;
