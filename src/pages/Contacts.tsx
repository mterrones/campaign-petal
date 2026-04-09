import { useState } from "react";
import { Search, Upload, Plus, Filter, UserPlus, MoreHorizontal, Tag } from "lucide-react";
import { contacts } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const statusMap: Record<string, { label: string; className: string }> = {
  active: { label: "Activo", className: "bg-success/10 text-success border-success/20" },
  unsubscribed: { label: "De baja", className: "bg-warning/10 text-warning border-warning/20" },
  bounced: { label: "Rebotado", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contactos</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu base de datos de suscriptores</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" /> Importar Excel
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" /> Agregar Contacto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Contacto</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre</Label>
                    <Input placeholder="Nombre" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Apellido</Label>
                    <Input placeholder="Apellido" className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input placeholder="email@ejemplo.com" type="email" className="mt-1.5" />
                </div>
                <div>
                  <Label>Lista</Label>
                  <Input placeholder="General" className="mt-1.5" />
                </div>
                <div>
                  <Label>Etiquetas</Label>
                  <Input placeholder="VIP, Newsletter (separar con comas)" className="mt-1.5" />
                </div>
              </div>
              <DialogFooter>
                <Button>Guardar Contacto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Activos</p>
          <p className="text-2xl font-bold mt-1">{contacts.filter((c) => c.status === "active").length.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">De Baja</p>
          <p className="text-2xl font-bold mt-1">{contacts.filter((c) => c.status === "unsubscribed").length.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <p className="text-sm text-muted-foreground">Rebotados</p>
          <p className="text-2xl font-bold mt-1">{contacts.filter((c) => c.status === "bounced").length.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contactos..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contacto</TableHead>
              <TableHead>Lista</TableHead>
              <TableHead>Etiquetas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Alta</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <p className="font-medium text-sm">{c.name} {c.lastName}</p>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </TableCell>
                <TableCell className="text-sm">{c.list}</TableCell>
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
                      <DropdownMenuItem className="text-destructive">Eliminar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Contacts;
