import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutTemplate,
  Plus,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Send,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  deleteUserTemplate,
  duplicateUserTemplate,
  listUserTemplates,
  type UserTemplate,
} from "@/lib/userTemplates";
import { exportHtml } from "@/components/email-editor/htmlExport";
import { defaultGlobalStyles } from "@/components/email-editor/types";

function MiniPreview({ tpl }: { tpl: UserTemplate }) {
  const html = useMemo(() => {
    if (!tpl.blocks || tpl.blocks.length === 0) return "";
    const merged = { ...defaultGlobalStyles, ...tpl.globalStyles };
    return exportHtml(tpl.blocks, merged, tpl.subject || tpl.name);
  }, [tpl]);

  if (!html) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/40">
        <LayoutTemplate className="w-8 h-8 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      className="absolute inset-0 w-full h-full pointer-events-none border-0"
      style={{
        transform: "scale(0.32)",
        transformOrigin: "top left",
        width: "313%",
        height: "313%",
      }}
      tabIndex={-1}
      title={tpl.name}
    />
  );
}

const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<UserTemplate[]>([]);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<UserTemplate | null>(null);

  const refresh = () => setTemplates(listUserTemplates());

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("user-templates-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("user-templates-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q),
    );
  }, [templates, search]);

  const handleDuplicate = (id: string) => {
    const dup = duplicateUserTemplate(id);
    if (dup) {
      toast.success("Plantilla duplicada");
      refresh();
    }
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;
    deleteUserTemplate(toDelete.id);
    toast.success("Plantilla eliminada");
    setToDelete(null);
    refresh();
  };

  const handleUseInCampaign = (id: string) => {
    navigate(`/campaigns/new?template=user:${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Plantillas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Crea, reutiliza y administra diseños de correo para tus campañas.
          </p>
        </div>
        <Link to="/templates/new">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Nueva plantilla
          </Button>
        </Link>
      </div>

      {templates.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantilla..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {templates.length === 0 ? (
        <Card>
          <CardHeader className="text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <LayoutTemplate className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Aún no tienes plantillas</CardTitle>
            <CardDescription className="max-w-sm mx-auto">
              Crea tu primera plantilla con el editor de correos y reutilízala
              en cualquier campaña.
            </CardDescription>
            <div className="pt-3">
              <Link to="/templates/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Crear plantilla
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent />
        </Card>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center border rounded-xl bg-card">
          No se encontraron plantillas que coincidan con tu búsqueda.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((tpl) => (
            <div
              key={tpl.id}
              className="group rounded-xl border bg-card overflow-hidden hover:shadow-md hover:border-primary/30 transition-all flex flex-col"
            >
              <button
                type="button"
                onClick={() => navigate(`/templates/${tpl.id}/edit`)}
                className="aspect-[3/4] overflow-hidden bg-muted relative block w-full"
              >
                <MiniPreview tpl={tpl} />
              </button>
              <div className="p-3 border-t space-y-3">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-foreground truncate">
                      {tpl.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {tpl.description || tpl.subject || "Sin descripción"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/templates/${tpl.id}/edit`)}>
                        <Pencil className="w-4 h-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(tpl.id)}>
                        <Copy className="w-4 h-4 mr-2" /> Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setToDelete(tpl)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleUseInCampaign(tpl.id)}
                >
                  <Send className="w-3.5 h-3.5 mr-2" /> Lanzar campaña
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará "{toDelete?.name}" de forma permanente. Esta acción
              no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Templates;
