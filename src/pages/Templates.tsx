import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutTemplate,
  Plus,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Send,
  Search,
  Users,
  Lock,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  deleteEmailTemplate,
  duplicateEmailTemplate,
  listEmailTemplatesWithMigration,
  platformEmailTemplatesQueryKey,
  setEmailTemplateShared,
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
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<UserTemplate | null>(null);
  const [scope, setScope] = useState<"all" | "mine" | "shared">("all");

  const listQuery = useQuery({
    queryKey: platformEmailTemplatesQueryKey,
    queryFn: () => listEmailTemplatesWithMigration(token!),
    enabled: !!token,
  });

  const templates = useMemo(() => listQuery.data?.templates ?? [], [listQuery.data]);
  const canShare = listQuery.data?.canShare ?? false;
  const hasTeammateTemplates = templates.some((t) => !t.isOwner);

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateEmailTemplate(token!, id),
    onSuccess: () => {
      toast.success("Plantilla duplicada");
      void queryClient.invalidateQueries({ queryKey: platformEmailTemplatesQueryKey });
    },
    onError: () => {
      toast.error("No se pudo duplicar la plantilla");
    },
  });

  const sharingMutation = useMutation({
    mutationFn: ({ id, shared }: { id: string; shared: boolean }) =>
      setEmailTemplateShared(token!, id, shared),
    onSuccess: (tpl) => {
      toast.success(
        tpl.shared
          ? "Plantilla compartida con tu empresa"
          : "La plantilla ya no se comparte",
      );
      void queryClient.invalidateQueries({ queryKey: platformEmailTemplatesQueryKey });
    },
    onError: () => {
      toast.error("No se pudo cambiar cómo se comparte la plantilla");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEmailTemplate(token!, id),
    onSuccess: () => {
      toast.success("Plantilla eliminada");
      setToDelete(null);
      void queryClient.invalidateQueries({ queryKey: platformEmailTemplatesQueryKey });
    },
    onError: () => {
      toast.error("No se pudo eliminar la plantilla");
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const inScope = templates.filter((t) =>
      scope === "mine" ? t.isOwner : scope === "shared" ? !t.isOwner : true,
    );
    if (!q) return inScope;
    return inScope.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.ownerEmail.toLowerCase().includes(q),
    );
  }, [templates, search, scope]);

  const handleDuplicate = (id: string) => {
    if (!token) return;
    duplicateMutation.mutate(id);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete || !token) return;
    deleteMutation.mutate(toDelete.id);
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
            {canShare && " Comparte las que quieras con los usuarios de tu empresa."}
          </p>
        </div>
        <Link to="/templates/new">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Nueva plantilla
          </Button>
        </Link>
      </div>

      {templates.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar plantilla..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {hasTeammateTemplates && (
            <div className="inline-flex rounded-lg border bg-card p-0.5 text-sm self-start">
              {(
                [
                  ["all", "Todas"],
                  ["mine", "Mías"],
                  ["shared", "De mi empresa"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScope(value)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    scope === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {listQuery.isLoading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Cargando plantillas…
        </p>
      ) : listQuery.isError ? (
        <p className="text-sm text-destructive py-8 text-center">
          No se pudieron cargar las plantillas.
        </p>
      ) : templates.length === 0 ? (
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
                    {tpl.shared && (
                      <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
                        <Badge variant="secondary" className="gap-1 px-2 py-0 text-[11px] font-medium shrink-0">
                          <Users className="w-3 h-3" /> Compartida
                        </Badge>
                        {!tpl.isOwner && (
                          <span
                            className="text-[11px] text-muted-foreground truncate"
                            title={tpl.ownerEmail}
                          >
                            por {tpl.ownerEmail}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/templates/${tpl.id}/edit`)}>
                        {tpl.canEdit ? (
                          <>
                            <Pencil className="w-4 h-4 mr-2" /> Editar
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" /> Ver
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(tpl.id)}>
                        <Copy className="w-4 h-4 mr-2" /> Duplicar
                      </DropdownMenuItem>
                      {tpl.canEdit && canShare && (
                        <DropdownMenuItem
                          disabled={sharingMutation.isPending}
                          onClick={() =>
                            sharingMutation.mutate({ id: tpl.id, shared: !tpl.shared })
                          }
                        >
                          {tpl.shared ? (
                            <>
                              <Lock className="w-4 h-4 mr-2" /> Dejar de compartir
                            </>
                          ) : (
                            <>
                              <Users className="w-4 h-4 mr-2" /> Compartir con mi empresa
                            </>
                          )}
                        </DropdownMenuItem>
                      )}
                      {tpl.canEdit && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setToDelete(tpl)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </>
                      )}
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
              Se eliminará "{toDelete?.name}" de forma permanente
              {toDelete?.shared ? ", también para los usuarios de tu empresa" : ""}.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
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
