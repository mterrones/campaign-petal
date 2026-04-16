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
import { getApiBaseUrl, mailingApiV1Path } from "@/lib/api";

type ApiKeyDocsProps = {
  copyToClipboard: (text: string) => void;
};

function AuthApiKeyDocsDescription() {
  return (
    <span className="block space-y-2">
      <span className="block">
        Autenticación por API Key:{" "}
        <code className="bg-muted px-1 rounded">{"--header 'x-api-key: {api key}'"}</code>
      </span>
      <span className="block">
        o Autenticación Basic Auth{" "}
        <code className="bg-muted px-1 rounded break-all">
          {"--header 'authorization: Basic ZGFzZDpzYWRhc2Rhc2Q='"}
        </code>
      </span>
    </span>
  );
}

export const ApiKeyMessagesDocs = forwardRef<HTMLDivElement, ApiKeyDocsProps>(
  function ApiKeyMessagesDocs({ copyToClipboard }, ref) {
    const apiBase = getApiBaseUrl();
    const postUrl = `${apiBase}${mailingApiV1Path}/messages`;
    const getUrl = `${apiBase}${mailingApiV1Path}/messages/<id>`;
    const curlPost = `curl -X POST "${postUrl}" \\
  -H "Content-Type: application/json" \\
  --header 'x-api-key: mek_YOUR_KEY' \\
  -d '{"to":"dest@example.com","subject":"Hola","html":"<p>Texto</p>"}'`;

    return (
      <div ref={ref} className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Base: <code className="bg-muted px-1 rounded">{apiBase}</code>
        </p>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Send className="w-5 h-5 text-primary shrink-0" />
              POST {`${mailingApiV1Path}/messages`}
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              <AuthApiKeyDocsDescription />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                URL
              </Label>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px]">
                  POST
                </Badge>
                <code className="text-xs bg-muted px-2 py-1 rounded break-all">{postUrl}</code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => copyToClipboard(postUrl)}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
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
              <pre className="bg-muted rounded-lg p-3 mt-2 text-[11px] overflow-x-auto leading-snug">
{`{
  "to": "destinatario@example.com",
  "subject": "Asunto",
  "html": "<p>…</p>",
  "text": "…",
  "from": "Nombre <correo@dominio.com>"
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
                      ["subject", "Sí", "—"],
                      ["html", "Cond.", "Al menos uno de html o text"],
                      ["text", "Cond.", "Al menos uno de html o text"],
                      ["from", "No", "Opcional; default servidor"],
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
                URL
              </Label>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-mono text-[10px]">
                  GET
                </Badge>
                <code className="text-xs bg-muted px-2 py-1 rounded break-all">{getUrl}</code>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Respuesta
              </Label>
              <p className="text-[11px] text-muted-foreground mt-1"><strong>200</strong> — estado actual. En cola: <code className="bg-muted px-1 rounded">deliveryStatus: &quot;enqueued&quot;</code>.</p>
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
{`curl "${apiBase}${mailingApiV1Path}/messages/<UUID>" \\
  --header 'x-api-key: mek_YOUR_KEY'`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
);
