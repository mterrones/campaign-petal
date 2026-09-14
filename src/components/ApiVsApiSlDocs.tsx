import {
  ArrowRight,
  Copy,
  Inbox,
  RefreshCw,
  Webhook,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { getApiBaseUrl, mailingApiV1Path } from "@/lib/api";
import { ApiHostComparisonOverview } from "@/components/ApiHostComparisonCards";
import {
  CopyablePre,
  CurlExampleGroup,
  DocsCodeIcon,
  DocsSection,
} from "@/components/api-docs/ApiDocsShared";

function copyText(text: string) {
  void navigator.clipboard.writeText(text);
  toast.success("Copiado al portapapeles");
}

const getResponseExample = `{
  "id": "<uuid>",
  "from": "…",
  "to": "…",
  "cc": [],
  "bcc": [],
  "subject": "…",
  "deliveryStatus": "enqueued | sent | failed | bounced | delivered",
  "errorCode": null,
  "errorDetail": null,
  "createdAt": "<ISO8601>",
  "sentAt": "<ISO8601> | null"
}`;

export function ApiVsApiSlDocs() {
  const messagesPath = `${mailingApiV1Path}/messages`;
  const apiBase = getApiBaseUrl();
  const getPath = `${messagesPath}/<id>`;
  const getApiUrl = `${apiBase}${getPath}`;
  const getExampleUrl = `${apiBase}${messagesPath}/<UUID>`;
  const curlGetApi = `curl "${getExampleUrl}" \\
  --header 'x-api-key: mek_YOUR_KEY'`;
  const curlGetApiBasic = `curl "${getExampleUrl}" \\
  -u "usuario@example.com:contraseña"`;

  return (
    <div className="space-y-6">
      <ApiHostComparisonOverview onCopy={copyText} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary shrink-0" />
            Flujo en API SL
          </CardTitle>
          <CardDescription className="text-xs">
            Cómo interpretar respuestas cuando integra contra API SL.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ol className="space-y-4 text-xs">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                1
              </span>
              <div>
                <p className="font-medium text-foreground">POST → 202</p>
                <p className="text-muted-foreground mt-0.5">
                  El mensaje queda aceptado. Guarde el{" "}
                  <code className="bg-muted px-1 rounded">id</code> de la respuesta.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                2
              </span>
              <div>
                <p className="font-medium text-foreground">Esperar entre 2 y 10 segundos</p>
                <p className="text-muted-foreground mt-0.5">
                  Consulte{" "}
                  <code className="bg-muted px-1 rounded">{getApiUrl.replace("<id>", ":id")}</code>{" "}
                  en <strong className="text-foreground">API</strong> (GET no está
                  disponible en API SL), con una pausa de 2 a 10 segundos entre intentos.
                  Un <strong className="text-foreground">404</strong> temporal significa
                  aún en procesamiento; siga consultando.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                3
              </span>
              <div>
                <p className="font-medium text-foreground">GET → 200</p>
                <p className="text-muted-foreground mt-0.5">
                  Revise{" "}
                  <code className="bg-muted px-1 rounded">deliveryStatus</code>,{" "}
                  <code className="bg-muted px-1 rounded">errorCode</code> y{" "}
                  <code className="bg-muted px-1 rounded">errorDetail</code>. Ej.:{" "}
                  <code className="bg-muted px-1 rounded">failed</code> /{" "}
                  <code className="bg-muted px-1 rounded">FROM</code> si el remitente no
                  está permitido, o{" "}
                  <code className="bg-muted px-1 rounded">RECIPIENT_INVALID</code> si el
                  destinatario no es válido.
                </p>
              </div>
            </li>
          </ol>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground rounded-lg border bg-muted/20 px-3 py-2.5">
            <span className="font-medium text-foreground">POST</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            <span>202 + id</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            <span>GET (2–10 s)</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            <span>200 + estado final</span>
          </div>

          <Alert className="mt-4 border-amber-500/30 bg-amber-500/5 [&>svg]:text-amber-600">
            <Webhook className="h-4 w-4" />
            <AlertTitle className="text-amber-800 dark:text-amber-200 text-[11px] uppercase tracking-wide">
              Próximamente
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              <strong className="text-foreground">Webhook de estados de mensaje</strong>{" "}
              — recibirá notificaciones automáticas cuando el mensaje cambie de estado,
              sin necesidad de hacer poll con GET.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card id="get-message" className="scroll-mt-24">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Inbox className="w-5 h-5 text-primary shrink-0" />
            GET {`${mailingApiV1Path}/messages/:id`}
          </CardTitle>
          <CardDescription className="text-xs">
            Solo disponible en <strong className="text-foreground">API</strong> (no en
            API SL). Use este endpoint para consultar el estado final tras POST en API SL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <DocsSection title="URL">
            <div className="flex items-start gap-2 mt-1 flex-wrap">
              <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px] shrink-0">
                GET
              </Badge>
              <code className="text-xs bg-muted px-2 py-1 rounded break-all flex-1 min-w-0">
                {getApiUrl}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => copyText(getApiUrl)}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </DocsSection>

          <Separator />

          <DocsSection title="Ejemplos" icon={DocsCodeIcon}>
            <CurlExampleGroup
              onCopy={copyText}
              examples={[
                { label: "API", command: curlGetApi },
                { label: "API (Basic Auth)", command: curlGetApiBasic },
              ]}
            />
          </DocsSection>

          <Separator />

          <DocsSection title="Respuesta">
            <p className="text-[11px] text-muted-foreground">
              <strong>200</strong> — estado actual. En cola:{" "}
              <code className="bg-muted px-1 rounded">deliveryStatus: &quot;enqueued&quot;</code>.
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Tras <strong>202</strong> en API SL, espere entre 2 y 10 segundos entre cada
              GET. <strong>404</strong> temporal = aceptado, aún en procesamiento; siga
              consultando hasta <strong>200</strong>.
            </p>
            <CopyablePre
              content={getResponseExample}
              onCopy={copyText}
              className="mt-2"
            />
          </DocsSection>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Comparación rápida</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 overflow-x-auto">
          <table className="w-full text-xs min-w-[480px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-3 py-2 font-medium w-[32%]" />
                <th className="text-left px-3 py-2 font-medium">API</th>
                <th className="text-left px-3 py-2 font-medium">API SL</th>
              </tr>
            </thead>
            <tbody className="divide-y text-muted-foreground">
              {[
                ["Validación síncrona", "Sí", "No (vía GET)"],
                ["Respuesta POST típica", "202 + estado", "202 + id (aceptado)"],
                ["Basic Auth plataforma", "Sí", "No"],
                ["Cola / reintentos", "No", "Sí"],
                ["Migración", "—", "Solo cambiar host"],
              ].map(([label, api, sl]) => (
                <tr key={label}>
                  <td className="px-3 py-2 font-medium text-foreground">{label}</td>
                  <td className="px-3 py-2">{api}</td>
                  <td className="px-3 py-2">{sl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
