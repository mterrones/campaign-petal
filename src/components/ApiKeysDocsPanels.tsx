import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Inbox, Send, Copy } from "lucide-react";
import { getApiBaseUrl, getGatewayApiBaseUrl, mailingApiV1Path } from "@/lib/api";
import {
  CopyablePre,
  CurlExampleGroup,
  DocsCodeIcon,
  DocsQuickNav,
  DocsSection,
} from "@/components/api-docs/ApiDocsShared";

type ApiKeyDocsProps = {
  copyToClipboard: (text: string) => void;
};

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
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0 pt-0.5 w-[120px] leading-tight">
        {label}
      </span>
      <code className="text-xs bg-muted px-2 py-1 rounded break-all flex-1 min-w-0">{url}</code>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 print:hidden"
        onClick={() => copyToClipboard(url)}
      >
        <Copy className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

const postBodyExample = `{
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
}`;

const postResponseExample = `{
  "id": "<uuid>",
  "deliveryStatus": "enqueued"
}`;

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

export const ApiKeyMessagesDocs = forwardRef<HTMLDivElement, ApiKeyDocsProps>(
  function ApiKeyMessagesDocs({ copyToClipboard }, ref) {
    const apiBase = getApiBaseUrl();
    const gatewayBase = getGatewayApiBaseUrl();
    const postPath = `${mailingApiV1Path}/messages`;
    const getPath = `${mailingApiV1Path}/messages/:id`;
    const postGatewayUrl = `${gatewayBase}${postPath}`;
    const getApiUrl = `${apiBase}${mailingApiV1Path}/messages/<id>`;
    const curlPostGateway = `curl -X POST "${postGatewayUrl}" \\
  -H "Content-Type: application/json" \\
  --header 'x-api-key: mek_YOUR_KEY' \\
  -d '{"to":"dest@example.com","subject":"Hola","html":"<p>Texto</p>"}'`;
    const curlGetApi = `curl "${apiBase}${mailingApiV1Path}/messages/<UUID>" \\
  --header 'x-api-key: mek_YOUR_KEY'`;

    return (
      <div ref={ref} className="space-y-4">
        <DocsQuickNav />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Send className="w-5 h-5 text-primary shrink-0" />
              POST {postPath}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <DocsSection title="URL">
              <EndpointUrlRow
                method="POST"
                label="API SL"
                url={postGatewayUrl}
                copyToClipboard={copyToClipboard}
              />
            </DocsSection>

            <Separator />

            <div id="post-ejemplos" className="scroll-mt-24">
              <DocsSection title="Ejemplo" icon={DocsCodeIcon}>
                <CurlExampleGroup
                  onCopy={copyToClipboard}
                  examples={[{ label: "API SL", command: curlPostGateway }]}
                />
              </DocsSection>
            </div>

            <Separator />

            <div id="post-referencia" className="scroll-mt-24 print:block">
              <Accordion
                type="single"
                collapsible
                defaultValue="referencia"
                className="print:[&_[data-state=closed]]:hidden print:[&_[data-state=open]]:block"
              >
                <AccordionItem value="referencia" className="border-none">
                  <AccordionTrigger className="py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:no-underline print:hidden">
                    Referencia POST
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pb-0 print:block print:overflow-visible print:h-auto">
                    <DocsSection title="Body (JSON)">
                      <p className="text-[11px] text-muted-foreground">
                        Obligatorio:{" "}
                        <code className="bg-muted px-1 rounded">text</code> y/o{" "}
                        <code className="bg-muted px-1 rounded">html</code>.
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Adjuntos opcionales con{" "}
                        <code className="bg-muted px-1 rounded">attachments</code> (base64):
                        máximo 5 archivos y 10MB total decodificado.
                      </p>
                      <CopyablePre
                        content={postBodyExample}
                        onCopy={copyToClipboard}
                        className="mt-2"
                      />
                    </DocsSection>

                    <DocsSection title="Campos">
                      <div className="border rounded-md overflow-hidden text-xs">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-muted/50 border-b">
                              <th className="text-left px-3 py-1.5 font-medium">Campo</th>
                              <th className="text-left px-3 py-1.5 font-medium w-[72px]">
                                Obl.
                              </th>
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
                                  <code className="bg-muted/80 px-1 rounded text-[11px]">
                                    {c}
                                  </code>
                                </td>
                                <td className="px-3 py-1.5 text-muted-foreground">{r}</td>
                                <td className="px-3 py-1.5 text-muted-foreground">{d}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </DocsSection>

                    <DocsSection title="Respuesta">
                      <p className="text-[11px] text-muted-foreground">
                        <strong>202</strong> — mensaje aceptado; envío asíncrono.
                      </p>
                      <CopyablePre
                        content={postResponseExample}
                        onCopy={copyToClipboard}
                        className="mt-2"
                      />
                    </DocsSection>

                    <DocsSection title="Códigos HTTP">
                      <ul className="space-y-1 text-xs text-muted-foreground list-none pl-0">
                        {[
                          ["400", "Validación del body"],
                          ["202", "Destinatario no válido → mensaje failed (RECIPIENT_INVALID)"],
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
                    </DocsSection>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>

        <Card id="get-message" className="scroll-mt-24">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Inbox className="w-5 h-5 text-primary shrink-0" />
              GET {getPath}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <DocsSection title="URL">
              <EndpointUrlRow
                method="GET"
                label="API"
                url={getApiUrl}
                copyToClipboard={copyToClipboard}
              />
            </DocsSection>

            <Separator />

            <DocsSection title="Ejemplo" icon={DocsCodeIcon}>
              <CurlExampleGroup
                onCopy={copyToClipboard}
                examples={[{ label: "API", command: curlGetApi }]}
              />
            </DocsSection>

            <Separator />

            <DocsSection title="Respuesta">
              <p className="text-[11px] text-muted-foreground">
                <strong>200</strong> — estado actual del mensaje.
              </p>
              <p className="text-[11px] text-muted-foreground mt-2">
                Tras un <strong>202</strong> en API SL, puede consultar este endpoint
                en API. Un <strong>404</strong> temporal significa que el mensaje aún
                se está procesando.
              </p>
              <CopyablePre
                content={getResponseExample}
                onCopy={copyToClipboard}
                className="mt-2"
              />
            </DocsSection>

            <DocsSection title="Códigos HTTP">
              <ul className="space-y-1 text-xs text-muted-foreground list-none pl-0">
                {[
                  ["200", "Mensaje encontrado"],
                  ["401", "Auth inválida"],
                  ["403", "Sin cliente asociado"],
                  ["404", "No encontrado (o aún en procesamiento tras API SL)"],
                ].map(([code, t]) => (
                  <li key={code} className="flex gap-2">
                    <span className="font-mono text-foreground w-9 shrink-0">{code}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </DocsSection>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Webhooks de estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p>
              Puedes registrar webhooks desde{" "}
              <strong className="text-foreground">API Keys → Webhooks</strong>{" "}
              en el portal.
            </p>
            <p>
              Cada cliente puede registrar una o más URLs HTTPS. En cada cambio de
              estado suscrito (<code className="bg-muted px-1 rounded">sent</code>,{" "}
              <code className="bg-muted px-1 rounded">delivered</code>,{" "}
              <code className="bg-muted px-1 rounded">delayed</code>,{" "}
              <code className="bg-muted px-1 rounded">bounced</code>,{" "}
              <code className="bg-muted px-1 rounded">failed</code>,{" "}
              <code className="bg-muted px-1 rounded">complaint</code>,{" "}
              <code className="bg-muted px-1 rounded">open</code>) se envía un{" "}
              <code className="bg-muted px-1 rounded">POST</code> JSON.
            </p>
            <CopyablePre
              onCopy={copyToClipboard}
              content={`{
  "id": "<message-uuid>",
  "deliveryStatus": "failed",
  "event": "failed",
  "occurredAt": "2026-09-13T12:00:00.000Z",
  "to": "destinatario@ejemplo.com",
  "errorCode": "GATEWAY_INTERNAL",
              "errorDetail": "No se pudo entregar el mensaje, error interno."
}

// Al configurar el webhook:
{
  "id": "<webhook-uuid>",
  "deliveryStatus": "configured",
  "event": "configured",
  "occurredAt": "2026-09-16T21:00:00.000Z",
  "to": ""
}`}
            />
            <p className="text-[11px] text-muted-foreground">
              <code className="bg-muted px-1 rounded">errorCode</code> y{" "}
              <code className="bg-muted px-1 rounded">errorDetail</code> solo
              vienen en eventos de error (<code className="bg-muted px-1 rounded">failed</code>,{" "}
              <code className="bg-muted px-1 rounded">bounced</code>, etc.).
            </p>
            <p>
              Al crear un webhook activo (o al cambiar la URL / activarlo) se envía
              un POST de prueba con{" "}
              <code className="bg-muted px-1 rounded">event: "configured"</code>
              . Si el endpoint falla, la lambda reintenta una vez.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  },
);
