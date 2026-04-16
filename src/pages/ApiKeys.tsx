import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ApiError, getApiBaseUrl, getJson, postJson } from "@/lib/api";
import { downloadApiDocumentationPdf } from "@/lib/downloadApiDocsPdf";
import { ApiKeyMessagesDocs } from "@/components/ApiKeysDocsPanels";
import {
  Key,
  Copy,
  Plus,
  Trash2,
  Send,
  FileDown,
  Loader2,
} from "lucide-react";

type ApiKeyRow = {
  id: string;
  label: string | null;
  createdAt: string;
  revokedAt: string | null;
};

type CreateKeyResponse = {
  id: string;
  clientId: string;
  key: string;
  warning: string;
};

const MASKED_KEY_DISPLAY = "mek_••••••••••••••••••••••••";

const ApiKeys = () => {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKeyPlain, setCreatedKeyPlain] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("keys");
  const [pdfLoading, setPdfLoading] = useState(false);
  const apiKeyDocRef = useRef<HTMLDivElement>(null);
  const apiBase = getApiBaseUrl();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const keysQuery = useQuery({
    queryKey: ["platform-api-keys", user?.clientId],
    queryFn: () => getJson<ApiKeyRow[]>("/v1/platform/api-keys", token!),
    enabled: Boolean(token && user?.clientId),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const label = newKeyName.trim();
      if (!label) {
        throw new Error("LABEL_REQUIRED");
      }
      return postJson<CreateKeyResponse>(
        "/v1/platform/api-keys",
        { label },
        { token },
      );
    },
    onSuccess: (data) => {
      setCreatedKeyPlain(data.key);
      setNewKeyName("");
      void queryClient.invalidateQueries({ queryKey: ["platform-api-keys"] });
      toast.success("API Key creada. Guárdala ahora; no se volverá a mostrar.");
    },
    onError: (err: unknown) => {
      if (err instanceof Error && err.message === "LABEL_REQUIRED") {
        toast.error("Ingresa un nombre para la API Key");
        return;
      }
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }
      toast.error("No se pudo crear la API Key");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (keyId: string) =>
      postJson<{ ok: boolean }>(
        `/v1/platform/api-keys/${encodeURIComponent(keyId)}/revoke`,
        {},
        { token },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["platform-api-keys"] });
      toast.success("API Key revocada");
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        toast.error(err.message);
        return;
      }
      toast.error("No se pudo revocar la API Key");
    },
  });

  const handleCreateKey = () => {
    createMutation.mutate();
  };

  const handleRevokeKey = (id: string) => {
    revokeMutation.mutate(id);
  };

  const handleDownloadDocumentationPdf = async () => {
    const a = apiKeyDocRef.current;
    if (!a) {
      toast.error("No se pudo preparar el contenido para el PDF");
      return;
    }
    setPdfLoading(true);
    try {
      await downloadApiDocumentationPdf(a);
      toast.success("PDF descargado");
    } catch {
      toast.error("No se pudo generar el PDF. Inténtalo de nuevo.");
    } finally {
      setPdfLoading(false);
    }
  };

  const noOrg = user && user.clientId === null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">API Keys & Documentación</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Gestión de claves y referencia de la API de mensajes (API Key).
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <TabsList className="flex flex-wrap h-auto gap-1 w-full sm:w-auto">
            <TabsTrigger value="keys">
              <Key className="w-3.5 h-3.5 mr-1.5" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="api-key">
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Mensajes (API Key)
            </TabsTrigger>
          </TabsList>
          {activeTab === "api-key" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 w-full sm:w-auto"
              disabled={pdfLoading}
              onClick={() => void handleDownloadDocumentationPdf()}
            >
              {pdfLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 mr-2" />
              )}
              Descargar PDF
            </Button>
          )}
        </div>

        {/* ─── TAB: API Keys ─── */}
        <TabsContent value="keys" className="space-y-4">
          <Dialog
            open={createdKeyPlain !== null}
            onOpenChange={(open) => {
              if (!open) setCreatedKeyPlain(null);
            }}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Guarda tu API Key</DialogTitle>
                <DialogDescription>
                  Esta es la única vez que podrás ver la clave completa. Cópiala y
                  almacénala en un lugar seguro.
                </DialogDescription>
              </DialogHeader>
              {createdKeyPlain && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Secreto (Bearer / X-Api-Key)
                  </Label>
                  <div className="flex gap-2">
                    <code className="text-xs bg-muted px-3 py-2 rounded-md flex-1 break-all">
                      {createdKeyPlain}
                    </code>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => copyToClipboard(createdKeyPlain)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button type="button" onClick={() => setCreatedKeyPlain(null)}>
                  Entendido
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {noOrg && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="text-lg">Sin organización</CardTitle>
                <CardDescription>
                  Tu cuenta no tiene una organización asignada. Las API Keys se
                  gestionan por organización. Contacta al administrador para
                  vincular tu usuario a un cliente.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {!noOrg && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Plus className="w-5 h-5 text-primary" />
                    Crear Nueva API Key
                  </CardTitle>
                  <CardDescription>
                    Genera una clave para autenticar tus peticiones a la API de
                    EnviaMas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label className="text-sm">Nombre descriptivo</Label>
                      <Input
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="Ej: Backend producción"
                        className="mt-1"
                        disabled={createMutation.isPending}
                      />
                    </div>
                    <Button
                      className="mt-6"
                      onClick={handleCreateKey}
                      disabled={createMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Generar Key
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tus API Keys</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {keysQuery.isLoading && (
                    <p className="text-sm text-muted-foreground">
                      Cargando…
                    </p>
                  )}
                  {keysQuery.isError && (
                    <p className="text-sm text-destructive">
                      {(keysQuery.error as ApiError)?.message ??
                        "No se pudieron cargar las API Keys"}
                    </p>
                  )}
                  {keysQuery.data?.length === 0 && !keysQuery.isLoading && (
                    <p className="text-sm text-muted-foreground">
                      Aún no tienes claves. Crea una arriba.
                    </p>
                  )}
                  {keysQuery.data?.map((k) => {
                    const active = k.revokedAt === null;
                    const created = new Date(k.createdAt).toLocaleDateString(
                      "es-PE",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    );
                    return (
                      <div
                        key={k.id}
                        className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">
                              {k.label?.trim() || "Sin nombre"}
                            </span>
                            <Badge
                              variant={active ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {active ? "Activa" : "Revocada"}
                            </Badge>
                          </div>
                          <code className="text-xs bg-muted px-2 py-1 rounded break-all block max-w-full">
                            {MASKED_KEY_DISPLAY}
                            <span className="text-muted-foreground ml-1">
                              ({k.id.slice(0, 8)}…)
                            </span>
                          </code>
                          <p className="text-xs text-muted-foreground">
                            Creada: {created}
                          </p>
                        </div>
                        {active && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => handleRevokeKey(k.id)}
                            disabled={revokeMutation.isPending}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Revocar
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ─── TAB: Mensajes API Key ─── */}
        <TabsContent
          value="api-key"
          forceMount
          className="space-y-4 data-[state=inactive]:hidden"
        >
          <ApiKeyMessagesDocs
            ref={apiKeyDocRef}
            apiBase={apiBase}
            copyToClipboard={copyToClipboard}
          />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default ApiKeys;
