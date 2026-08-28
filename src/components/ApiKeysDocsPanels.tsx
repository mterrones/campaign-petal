import { forwardRef } from "react";
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
import { Send, Inbox, Code2, Copy } from "lucide-react";
import { getApiBaseUrl, getGatewayApiBaseUrl, mailingApiV1Path } from "@/lib/api";

type ApiKeyDocsProps = {
  copyToClipboard: (text: string) => void;
};

function AuthApiKeyDocsDescription() {
  return (
    <span className="block space-y-2">
      <span className="block">
        Autenticación por API Key:{" "}
        <code className="bg-muted px-1 rounded">{"--header 'x-api-key: mek_…'"}</code>
      </span>
      <span className="block text-muted-foreground">
        En el gateway (<code className="bg-muted px-1 rounded">api.sl</code>) solo{" "}
        <code className="bg-muted px-1 rounded">x-api-key</code>. Basic Auth: usar{" "}
        <code className="bg-muted px-1 rounded">api.mailling</code> directo.
      </span>
    </span>
  );
}

function EndpointUrlRow({
  method,
  label,
  url,
  copyToClipboard,
}: {
  method: string;
  label: string;
  url: string;
  copyToClipboard: (text: string) => void;
}) {
  return (
    <div className="flex items-start gap-2 mt-1.5 flex-wrap">
      <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px] shrink-0">
        {method}
      </Badge>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0 pt-0.5 w-[68px]">
        {label}
      </span>
      <code className="text-xs bg-muted px-2 py-1 rounded break-all flex-1 min-w-0">{url}</code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={() => copyToClipboard(url)}
      >
        <Copy className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

export const ApiKeyMessagesDocs = forwardRef<HTMLDivElement, ApiKeyDocsProps>(
  function ApiKeyMessagesDocs({ copyToClipboard }, ref) {
    const apiBase = getApiBaseUrl();
    const gatewayBase = getGatewayApiBaseUrl();
    const postPath = `${mailingApiV1Path}/messages`;
    const getPath = `${mailingApiV1Path}/messages/<id>`;
    const postGatewayUrl = `${gatewayBase}${postPath}`;
    const postApiUrl = `${apiBase}${postPath}`;
    const getGatewayUrl = `${gatewayBase}${getPath}`;
    const getApiUrl = `${apiBase}${getPath}`;
    const curlPost = `curl -X POST "${postGatewayUrl}" \\
  -H "Content-Type: application/json" \\
  --header 'x-api-key: mek_YOUR_KEY' \\
  -d '{"to":"dest@example.com","subject":"Hola","html":"<p>Texto</p>"}'`;

    return (
      <div ref={ref} className="space-y-4">
        <p className="text-xs text-muted-foreground space-y-1">
          <span className="block font-medium text-foreground">Endpoints disponibles</span>
          <span className="block">
            Gateway (recomendado, cola AWS):{" "}
            <code className="bg-muted px-1 rounded">{gatewayBase}</code>
          </span>
          <span className="block">
            API (directo, sin cola AWS):{" "}
            <code className="bg-muted px-1 rounded">{apiBase}</code>
          </span>
        </p>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Send className="w-5 h-5 text-primary shrink-0" />
              POST {postPath}
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              <AuthApiKeyDocsDescription />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                URLs
              </Label>
              <EndpointUrlRow
                method="POST"
                label="Gateway"
                url={postGatewayUrl}
                copyToClipboard={copyToClipboard}
              />
              <EndpointUrlRow
                method="POST"
                label="API"
                url={postApiUrl}
                copyToClipboard={copyToClipboard}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Rate limit
              </Label>
              <p className="text-xs text-muted-foreground mt-1">2 request por segundo</p>
            </div>

            <Separator />

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Body (JSON)
              </Label>
              <p className="text-[11px] text-muted-foreground mt-1">Obligatorio: <code className="bg-muted px-1 rounded">text</code> y/o <code className="bg-muted px-1 rounded">html</code>.</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Adjuntos opcionales con{" "}
                <code className="bg-muted px-1 rounded">attachments</code> (base64): máximo 5
                archivos y 10MB total decodificado.
              </p>
              <pre className="bg-muted rounded-lg p-3 mt-2 text-[11px] overflow-x-auto leading-snug">
{`{
  "to": "destinatario@example.com",
  "cc": ["copia@example.com"],
  "bcc": ["oculto@example.com"],
  "subject": "Asunto",
  "html": "<p>…</p>",
  "text": "…",
  "from": "Nombre <correo@dominio.com>",
  "attachments": [
    {
      "filename": "reporte.pdf",
      "contentType": "application/pdf",
      "contentBase64": "JVBERi0xLjQKJc..."
    }
  ]
}`}
              </pre>
            </div>

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Campos
              </Label>
              <div className="mt-2 border rounded-md overflow-hidden text-xs">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left px-3 py-1.5 font-medium">Campo</th>
                      <th className="text-left px-3 py-1.5 font-medium w-[72px]">Obl.</th>
                      <th className="text-left px-3 py-1.5 font-medium">Nota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      ["to", "Sí", "Email"],
                      ["cc", "No", "Array de emails (máx 50)"],
                      ["bcc", "No", "Array de emails (máx 50); no aparece en cabeceras"],
                      ["subject", "Sí", "—"],
                      ["html", "Cond.", "Al menos uno de html o text"],
                      ["text", "Cond.", "Al menos uno de html o text"],
                      ["from", "No", "Opcional; default servidor"],
                      ["attachments", "No", "Array base64 (máx 5, total 10MB)"],
                    ].map(([c, r, d]) => (
                      <tr key={c}>
                        <td className="px-3 py-1.5">
                          <code className="bg-muted/80 px-1 rounded text-[11px]">{c}</code>
                        </td>
                        <td className="px-3 py-1.5 text-muted-foreground">{r}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{d}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Respuesta
              </Label>
              <p className="text-[11px] text-muted-foreground mt-1"><strong>202</strong> — mensaje aceptado; envío asíncrono.</p>
              <pre className="bg-muted rounded-lg p-3 mt-2 text-[11px] overflow-x-auto leading-snug">
{`{
  "id": "<uuid>",
  "deliveryStatus": "enqueued",
  "dsnEnvId": "…",
  "trackingToken": "…",
  "smtpMessageId": null,
  "sentAt": null
}`}
              </pre>
            </div>

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Códigos HTTP
              </Label>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-none pl-0">
                {[
                  ["400", "Validación del body"],
                  ["401", "Auth inválida"],
                  ["403", "Sin cliente (plataforma)"],
                  ["429", "Rate limit o cuota diaria (Basic plataforma: 100/día Lima)"],
                ].map(([code, t]) => (
                  <li key={code} className="flex gap-2">
                    <span className="font-mono text-foreground w-9 shrink-0">{code}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <Label className="text-[11px] text-muted-foreground">Ejemplos 400</Label>
                <pre className="bg-muted rounded-lg p-3 mt-1 text-[11px] overflow-x-auto leading-snug">
{`{"error":"attachments allows up to 5 files"}
{"error":"attachments total size exceeds 10485760 bytes"}
{"error":"attachments[0].contentBase64 is not valid base64"}`}
                </pre>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                cURL
              </Label>
              <pre className="bg-muted rounded-lg p-3 mt-2 text-[11px] overflow-x-auto whitespace-pre-wrap leading-snug">
                {curlPost}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Inbox className="w-5 h-5 text-primary shrink-0" />
              GET {`${mailingApiV1Path}/messages/:id`}
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              <AuthApiKeyDocsDescription />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                URLs
              </Label>
              <EndpointUrlRow
                method="GET"
                label="Gateway"
                url={getGatewayUrl}
                copyToClipboard={copyToClipboard}
              />
              <EndpointUrlRow
                method="GET"
                label="API"
                url={getApiUrl}
                copyToClipboard={copyToClipboard}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Respuesta
              </Label>
              <p className="text-[11px] text-muted-foreground mt-1">
                <strong>200</strong> — estado actual. En cola:{" "}
                <code className="bg-muted px-1 rounded">deliveryStatus: &quot;enqueued&quot;</code>.
              </p>
              <p className="text-[11px] text-muted-foreground mt-2">
                Tras <strong>202</strong> en <code className="bg-muted px-1 rounded">api.sl</code>,
                haga poll cada 1–2 s. <strong>404</strong> temporal = aceptado, aún en cola del
                gateway; siga consultando hasta <strong>200</strong>.
              </p>
              <pre className="bg-muted rounded-lg p-3 mt-2 text-[11px] overflow-x-auto leading-snug">
{`{
  "id": "<uuid>",
  "clientId": "…",
  "from": "…",
  "to": "…",
  "subject": "…",
  "deliveryStatus": "enqueued | sent | failed | bounced | delivered",
  "smtpMessageId": "… | null",
  "dsnEnvId": "…",
  "envelopeFrom": "…",
  "errorCode": null,
  "errorDetail": null,
  "createdAt": "<ISO8601>",
  "sentAt": "<ISO8601> | null",
  "engagement": {
    "openCount": 0,
    "firstOpenedAt": null,
    "clickCount": 0,
    "firstClickedAt": null
  }
}`}
              </pre>
            </div>

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                cURL
              </Label>
              <pre className="bg-muted rounded-lg p-3 mt-2 text-[11px] overflow-x-auto leading-snug">
{`curl "${gatewayBase}${mailingApiV1Path}/messages/<UUID>" \\
  --header 'x-api-key: mek_YOUR_KEY'`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
);
