import { useState } from "react";
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
import { ApiError, getJson, postJson } from "@/lib/api";
import {
  Key,
  Copy,
  Plus,
  Trash2,
  Send,
  Users,
  Code2,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Shield,
  BookOpen,
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

  const noOrg = user && user.clientId === null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">API Keys & Documentación</h1>
        <p className="text-muted-foreground mt-1">
          Administra tus API Keys y consulta la documentación para enviar emails
          por API.
        </p>
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="keys">
            <Key className="w-3.5 h-3.5 mr-1.5" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="single">
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Envío Individual
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Envío Masivo
          </TabsTrigger>
        </TabsList>

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

        {/* ─── TAB: Envío Individual ─── */}
        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="w-5 h-5 text-primary" />
                API — Envío de Mensaje Individual
              </CardTitle>
              <CardDescription>
                Envía un email transaccional o de marketing a un solo
                destinatario.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Endpoint */}
              <div>
                <Label className="text-sm font-semibold">Endpoint</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-xs">
                    POST
                  </Badge>
                  <code className="text-sm bg-muted px-3 py-1.5 rounded flex-1 break-all">
                    https://api.enviamas.com/v1/email/send
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() =>
                      copyToClipboard(
                        "https://api.enviamas.com/v1/email/send"
                      )
                    }
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Headers */}
              <div>
                <Label className="text-sm font-semibold">Headers</Label>
                <pre className="bg-muted rounded-lg p-4 mt-2 text-xs overflow-x-auto">
{`Content-Type: application/json
Authorization: Bearer YOUR_API_KEY`}
                </pre>
              </div>

              <Separator />

              {/* Request Body */}
              <div>
                <Label className="text-sm font-semibold">
                  Request Body (JSON)
                </Label>
                <div className="relative mt-2">
                  <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
{`{
  "from": {
    "email": "noreply@tudominio.com",
    "name": "Mi Empresa"
  },
  "to": {
    "email": "cliente@ejemplo.com",
    "name": "Juan Pérez"
  },
  "subject": "Bienvenido a nuestra plataforma",
  "html": "<h1>¡Hola Juan!</h1><p>Gracias por registrarte.</p>",
  "text": "¡Hola Juan! Gracias por registrarte.",
  "reply_to": "soporte@tudominio.com",
  "tags": ["bienvenida", "onboarding"],
  "metadata": {
    "user_id": "usr_123",
    "campaign": "welcome_series"
  }
}`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(
                          {
                            from: {
                              email: "noreply@tudominio.com",
                              name: "Mi Empresa",
                            },
                            to: {
                              email: "cliente@ejemplo.com",
                              name: "Juan Pérez",
                            },
                            subject:
                              "Bienvenido a nuestra plataforma",
                            html: "<h1>¡Hola Juan!</h1><p>Gracias por registrarte.</p>",
                            text: "¡Hola Juan! Gracias por registrarte.",
                            reply_to: "soporte@tudominio.com",
                            tags: ["bienvenida", "onboarding"],
                            metadata: {
                              user_id: "usr_123",
                              campaign: "welcome_series",
                            },
                          },
                          null,
                          2
                        )
                      )
                    }
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Parámetros */}
              <div>
                <Label className="text-sm font-semibold">Parámetros</Label>
                <div className="mt-2 border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left px-4 py-2 font-medium">Campo</th>
                        <th className="text-left px-4 py-2 font-medium">Tipo</th>
                        <th className="text-left px-4 py-2 font-medium">Requerido</th>
                        <th className="text-left px-4 py-2 font-medium">Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        ["from", "object", "Sí", "Remitente: { email, name }"],
                        ["to", "object", "Sí", "Destinatario: { email, name }"],
                        ["subject", "string", "Sí", "Asunto del email"],
                        ["html", "string", "Sí*", "Contenido HTML del email"],
                        ["text", "string", "No", "Versión texto plano (recomendado)"],
                        ["reply_to", "string", "No", "Email de respuesta"],
                        ["tags", "string[]", "No", "Etiquetas para tracking"],
                        ["metadata", "object", "No", "Datos personalizados (key-value)"],
                        ["scheduled_at", "string", "No", "Fecha de envío programado (ISO 8601)"],
                      ].map(([campo, tipo, req, desc]) => (
                        <tr key={campo}>
                          <td className="px-4 py-2">
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{campo}</code>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground text-xs">{tipo}</td>
                          <td className="px-4 py-2">
                            {req === "Sí" || req === "Sí*" ? (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                {req}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">No</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Respuestas */}
              <div>
                <Label className="text-sm font-semibold">Respuesta Exitosa (200)</Label>
                <pre className="bg-muted rounded-lg p-4 mt-2 text-xs overflow-x-auto">
{`{
  "success": true,
  "message_id": "msg_abc123def456",
  "status": "queued",
  "estimated_delivery": "2024-01-20T15:30:00Z"
}`}
                </pre>
              </div>

              <div>
                <Label className="text-sm font-semibold">Errores Comunes</Label>
                <div className="mt-2 space-y-2">
                  {[
                    ["401", "API Key inválida o no proporcionada"],
                    ["400", "Parámetros faltantes o formato inválido"],
                    ["422", "Email del destinatario no válido"],
                    ["429", "Límite de tasa excedido (rate limit)"],
                  ].map(([code, desc]) => (
                    <div key={code} className="flex items-center gap-3 border rounded-md p-3">
                      <Badge variant="destructive" className="text-xs font-mono">
                        {code}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Ejemplos de código */}
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Ejemplo — cURL
                </Label>
                <div className="relative mt-2">
                  <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
{`curl -X POST https://api.enviamas.com/v1/email/send \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer em_live_sk_YOUR_KEY" \\
  -d '{
    "from": { "email": "noreply@tudominio.com", "name": "Mi Empresa" },
    "to": { "email": "cliente@ejemplo.com", "name": "Juan" },
    "subject": "Hola desde EnviaMas",
    "html": "<h1>¡Bienvenido!</h1>"
  }'`}
                  </pre>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Ejemplo — Node.js (fetch)
                </Label>
                <div className="relative mt-2">
                  <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
{`const response = await fetch("https://api.enviamas.com/v1/email/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer em_live_sk_YOUR_KEY",
  },
  body: JSON.stringify({
    from: { email: "noreply@tudominio.com", name: "Mi Empresa" },
    to: { email: "cliente@ejemplo.com", name: "Juan" },
    subject: "Hola desde EnviaMas",
    html: "<h1>¡Bienvenido!</h1>",
  }),
});

const data = await response.json();
console.log(data.message_id);`}
                  </pre>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Ejemplo — Python (requests)
                </Label>
                <div className="relative mt-2">
                  <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
{`import requests

response = requests.post(
    "https://api.enviamas.com/v1/email/send",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer em_live_sk_YOUR_KEY",
    },
    json={
        "from": {"email": "noreply@tudominio.com", "name": "Mi Empresa"},
        "to": {"email": "cliente@ejemplo.com", "name": "Juan"},
        "subject": "Hola desde EnviaMas",
        "html": "<h1>¡Bienvenido!</h1>",
    },
)

print(response.json()["message_id"])`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB: Envío Masivo ─── */}
        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                API — Envío Masivo (Bulk)
              </CardTitle>
              <CardDescription>
                Envía el mismo email a múltiples destinatarios en una sola
                petición. Ideal para campañas de marketing, newsletters y
                notificaciones masivas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Endpoint */}
              <div>
                <Label className="text-sm font-semibold">Endpoint</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-xs">
                    POST
                  </Badge>
                  <code className="text-sm bg-muted px-3 py-1.5 rounded flex-1 break-all">
                    https://api.enviamas.com/v1/email/send-bulk
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() =>
                      copyToClipboard(
                        "https://api.enviamas.com/v1/email/send-bulk"
                      )
                    }
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Headers */}
              <div>
                <Label className="text-sm font-semibold">Headers</Label>
                <pre className="bg-muted rounded-lg p-4 mt-2 text-xs overflow-x-auto">
{`Content-Type: application/json
Authorization: Bearer YOUR_API_KEY`}
                </pre>
              </div>

              <Separator />

              {/* Request Body */}
              <div>
                <Label className="text-sm font-semibold">
                  Request Body (JSON)
                </Label>
                <div className="relative mt-2">
                  <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
{`{
  "from": {
    "email": "marketing@tudominio.com",
    "name": "Mi Empresa"
  },
  "subject": "🎉 Oferta especial para ti, {{name}}",
  "html": "<h1>Hola {{name}}</h1><p>Tenemos una oferta exclusiva para ti.</p><p><a href='{{cta_url}}'>Ver oferta</a></p>",
  "text": "Hola {{name}}, tenemos una oferta exclusiva. Visita: {{cta_url}}",
  "recipients": [
    {
      "email": "juan@ejemplo.com",
      "name": "Juan Pérez",
      "variables": {
        "name": "Juan",
        "cta_url": "https://tudominio.com/oferta?ref=juan"
      }
    },
    {
      "email": "maria@ejemplo.com",
      "name": "María García",
      "variables": {
        "name": "María",
        "cta_url": "https://tudominio.com/oferta?ref=maria"
      }
    },
    {
      "email": "carlos@ejemplo.com",
      "name": "Carlos López",
      "variables": {
        "name": "Carlos",
        "cta_url": "https://tudominio.com/oferta?ref=carlos"
      }
    }
  ],
  "tags": ["oferta", "campaña-enero"],
  "reply_to": "soporte@tudominio.com",
  "metadata": {
    "campaign_id": "camp_456",
    "batch": "2024-01"
  },
  "settings": {
    "track_opens": true,
    "track_clicks": true,
    "unsubscribe_url": "https://tudominio.com/unsub?email={{email}}"
  }
}`}
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() =>
                      copyToClipboard(`{
  "from": { "email": "marketing@tudominio.com", "name": "Mi Empresa" },
  "subject": "🎉 Oferta especial para ti, {{name}}",
  "html": "<h1>Hola {{name}}</h1><p>Tenemos una oferta exclusiva para ti.</p>",
  "recipients": [
    { "email": "juan@ejemplo.com", "name": "Juan Pérez", "variables": { "name": "Juan" } }
  ],
  "tags": ["oferta"],
  "settings": { "track_opens": true, "track_clicks": true }
}`)
                    }
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Parámetros */}
              <div>
                <Label className="text-sm font-semibold">Parámetros</Label>
                <div className="mt-2 border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left px-4 py-2 font-medium">Campo</th>
                        <th className="text-left px-4 py-2 font-medium">Tipo</th>
                        <th className="text-left px-4 py-2 font-medium">Requerido</th>
                        <th className="text-left px-4 py-2 font-medium">Descripción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        ["from", "object", "Sí", "Remitente: { email, name }"],
                        ["subject", "string", "Sí", "Asunto (soporta {{variables}})"],
                        ["html", "string", "Sí", "HTML con {{variables}} para personalización"],
                        ["text", "string", "No", "Versión texto plano con {{variables}}"],
                        ["recipients", "array", "Sí", "Lista de destinatarios (máx. 1,000 por petición)"],
                        ["recipients[].email", "string", "Sí", "Email del destinatario"],
                        ["recipients[].name", "string", "No", "Nombre del destinatario"],
                        ["recipients[].variables", "object", "No", "Variables para personalizar el contenido"],
                        ["tags", "string[]", "No", "Etiquetas para agrupar y filtrar envíos"],
                        ["reply_to", "string", "No", "Email de respuesta"],
                        ["metadata", "object", "No", "Datos personalizados para tracking"],
                        ["settings.track_opens", "boolean", "No", "Rastrear aperturas (default: true)"],
                        ["settings.track_clicks", "boolean", "No", "Rastrear clics (default: true)"],
                        ["settings.unsubscribe_url", "string", "No", "URL de desuscripción (soporta {{email}})"],
                        ["scheduled_at", "string", "No", "Programar envío (ISO 8601)"],
                      ].map(([campo, tipo, req, desc]) => (
                        <tr key={campo}>
                          <td className="px-4 py-2">
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{campo}</code>
                          </td>
                          <td className="px-4 py-2 text-muted-foreground text-xs">{tipo}</td>
                          <td className="px-4 py-2">
                            {req === "Sí" ? (
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                Sí
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">No</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-xs text-muted-foreground">{desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator />

              {/* Variables */}
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <FileJson className="w-4 h-4" />
                  Variables de Personalización
                </Label>
                <div className="bg-accent/10 rounded-lg p-4 mt-2 text-sm space-y-2">
                  <p>
                    Usa <code className="bg-muted px-1 rounded">{"{{variable}}"}</code> en el subject, html y text. Se reemplazarán por los valores definidos en <code className="bg-muted px-1 rounded">recipients[].variables</code>.
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Variables reservadas: <code className="bg-muted px-1 rounded">{"{{email}}"}</code> (email del destinatario), <code className="bg-muted px-1 rounded">{"{{unsubscribe_url}}"}</code> (link de desuscripción).
                  </p>
                </div>
              </div>

              <Separator />

              {/* Respuestas */}
              <div>
                <Label className="text-sm font-semibold">Respuesta Exitosa (200)</Label>
                <pre className="bg-muted rounded-lg p-4 mt-2 text-xs overflow-x-auto">
{`{
  "success": true,
  "batch_id": "batch_xyz789",
  "total_recipients": 3,
  "accepted": 3,
  "rejected": 0,
  "status": "processing",
  "estimated_completion": "2024-01-20T15:35:00Z"
}`}
                </pre>
              </div>

              <div>
                <Label className="text-sm font-semibold">Respuesta con errores parciales (200)</Label>
                <pre className="bg-muted rounded-lg p-4 mt-2 text-xs overflow-x-auto">
{`{
  "success": true,
  "batch_id": "batch_xyz789",
  "total_recipients": 3,
  "accepted": 2,
  "rejected": 1,
  "errors": [
    {
      "email": "invalido@",
      "error": "invalid_email",
      "message": "El formato de email no es válido"
    }
  ]
}`}
                </pre>
              </div>

              <Separator />

              {/* Límites */}
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Límites y Buenas Prácticas
                </Label>
                <div className="mt-2 space-y-2">
                  {[
                    ["Máx. 1,000 destinatarios", "por petición. Divide listas grandes en lotes."],
                    ["Rate limit: 100 req/min", "por API Key. Usa reintentos con backoff exponencial."],
                    ["Tamaño máx. del body: 10 MB", "Incluye el HTML y todos los campos."],
                    ["Variables obligatorias", "Si usas {{var}} en el HTML, cada recipient debe incluirla."],
                    ["Incluye unsubscribe_url", "Requerido por ley en envíos masivos comerciales."],
                    ["Envía text + html", "Mejora entregabilidad incluir ambas versiones."],
                  ].map(([title, desc]) => (
                    <div key={title} className="flex items-start gap-3 border rounded-md p-3">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <span className="text-sm font-medium">{title}</span>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Ejemplo cURL */}
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Ejemplo — cURL
                </Label>
                <div className="relative mt-2">
                  <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
{`curl -X POST https://api.enviamas.com/v1/email/send-bulk \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer em_live_sk_YOUR_KEY" \\
  -d '{
    "from": { "email": "marketing@tudominio.com", "name": "Mi Empresa" },
    "subject": "Hola {{name}}, tenemos algo para ti",
    "html": "<h1>¡Hola {{name}}!</h1><p>Oferta exclusiva.</p>",
    "recipients": [
      { "email": "juan@ejemplo.com", "variables": { "name": "Juan" } },
      { "email": "maria@ejemplo.com", "variables": { "name": "María" } }
    ],
    "settings": { "track_opens": true, "track_clicks": true }
  }'`}
                  </pre>
                </div>
              </div>

              {/* Ejemplo Node.js */}
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Ejemplo — Node.js
                </Label>
                <div className="relative mt-2">
                  <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
{`const response = await fetch("https://api.enviamas.com/v1/email/send-bulk", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer em_live_sk_YOUR_KEY",
  },
  body: JSON.stringify({
    from: { email: "marketing@tudominio.com", name: "Mi Empresa" },
    subject: "Hola {{name}}, tenemos algo para ti",
    html: "<h1>¡Hola {{name}}!</h1><p>Oferta exclusiva.</p>",
    recipients: [
      { email: "juan@ejemplo.com", variables: { name: "Juan" } },
      { email: "maria@ejemplo.com", variables: { name: "María" } },
    ],
    settings: { track_opens: true, track_clicks: true },
  }),
});

const data = await response.json();
console.log(\`Batch ID: \${data.batch_id}, Aceptados: \${data.accepted}\`);`}
                  </pre>
                </div>
              </div>

              {/* Ejemplo Python */}
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Ejemplo — Python
                </Label>
                <div className="relative mt-2">
                  <pre className="bg-muted rounded-lg p-4 text-xs overflow-x-auto">
{`import requests

response = requests.post(
    "https://api.enviamas.com/v1/email/send-bulk",
    headers={
        "Content-Type": "application/json",
        "Authorization": "Bearer em_live_sk_YOUR_KEY",
    },
    json={
        "from": {"email": "marketing@tudominio.com", "name": "Mi Empresa"},
        "subject": "Hola {{name}}, tenemos algo para ti",
        "html": "<h1>¡Hola {{name}}!</h1><p>Oferta exclusiva.</p>",
        "recipients": [
            {"email": "juan@ejemplo.com", "variables": {"name": "Juan"}},
            {"email": "maria@ejemplo.com", "variables": {"name": "María"}},
        ],
        "settings": {"track_opens": True, "track_clicks": True},
    },
)

data = response.json()
print(f"Batch: {data['batch_id']}, Aceptados: {data['accepted']}")`}
                  </pre>
                </div>
              </div>

              <Separator />

              {/* Webhook de estado */}
              <div>
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Webhook de Estado (Opcional)
                </Label>
                <div className="bg-accent/10 rounded-lg p-4 mt-2 text-sm space-y-3">
                  <p>
                    Configura un webhook para recibir notificaciones en tiempo real sobre el estado de tus envíos masivos.
                  </p>
                  <pre className="bg-muted rounded-lg p-3 text-xs overflow-x-auto">
{`POST https://api.enviamas.com/v1/webhooks
{
  "url": "https://tudominio.com/webhook/email-status",
  "events": ["delivered", "opened", "clicked", "bounced", "complained", "unsubscribed"],
  "secret": "whsec_tu_secreto_para_verificar_firma"
}`}
                  </pre>
                  <p className="text-xs text-muted-foreground">
                    Cada evento incluye <code className="bg-muted px-1 rounded">batch_id</code>, <code className="bg-muted px-1 rounded">message_id</code>, <code className="bg-muted px-1 rounded">email</code>, <code className="bg-muted px-1 rounded">timestamp</code> y <code className="bg-muted px-1 rounded">metadata</code>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiKeys;
