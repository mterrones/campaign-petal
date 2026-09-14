import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Cloud, Copy, GitBranch, Server, XCircle } from "lucide-react";
import { apiVsApiSlPath } from "@/lib/apiDocsPaths";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getApiBaseUrl, getGatewayApiBaseUrl } from "@/lib/api";

function BaseUrlRow({
  label,
  url,
  authentication,
  onCopy,
}: {
  label: string;
  url: string;
  authentication?: string;
  onCopy: (text: string) => void;
}) {
  return (
    <div className="mt-3 space-y-1">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex items-start gap-2">
        <code className="text-[11px] bg-muted px-2 py-1.5 rounded break-all flex-1 min-w-0">
          {url}
        </code>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onCopy(url)}
        >
          <Copy className="w-3.5 h-3.5" />
        </Button>
      </div>
      {authentication && (
        <p className="text-muted-foreground pt-1">
          Autenticación: {authentication}
        </p>
      )}
    </div>
  );
}

function ProConList({
  pros,
  cons,
}: {
  pros: ReactNode[];
  cons: ReactNode[];
}) {
  return (
    <div className="space-y-3 text-xs">
      <div>
        <p className="font-medium text-foreground mb-1.5 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
          Ventajas
        </p>
        <ul className="space-y-1 text-muted-foreground list-disc pl-4">
          {pros.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="font-medium text-foreground mb-1.5 flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
          Limitaciones
        </p>
        <ul className="space-y-1 text-muted-foreground list-disc pl-4">
          {cons.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ApiHostComparisonCards({
  onCopy,
}: {
  onCopy: (text: string) => void;
}) {
  const apiBase = getApiBaseUrl();
  const gatewayBase = getGatewayApiBaseUrl();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="w-5 h-5 text-primary shrink-0" />
              API
            </CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              Más práctico
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0 text-xs">
          <BaseUrlRow
            label="Base URL"
            url={apiBase}
            authentication="Basic Auth ó API Key"
            onCopy={onCopy}
          />
          <Separator />
          <ProConList
            pros={[
              "Validaciones (from, destinatario, etc.) en la misma respuesta",
              "Basic Auth para integraciones con usuario plataforma",
              "Ideal para desarrollo e integraciones de bajo volumen",
            ]}
            cons={[
              "En caso de respuestas 5XX, se debe establecer estrategias de reintento",
            ]}
          />
        </CardContent>
      </Card>

      <Card className="h-full border-info/25">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-base flex items-center gap-2">
              <Cloud className="w-5 h-5 text-info shrink-0" />
              API SL
            </CardTitle>
            <Badge className="bg-info/10 text-info border-info/20 text-[10px]">
              Más robusto
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0 text-xs">
          <BaseUrlRow
            label="Base URL"
            url={gatewayBase}
            authentication="API Key"
            onCopy={onCopy}
          />
          <Separator />
          <ProConList
            pros={[
              "Alta disponibilidad, empaqueta estrategia de reintento automático ante errores 5XX",
              "Todas las solicitudes, sin importar el volumen, son aceptadas y procesadas asincronamente",
            ]}
            cons={[
              <>
                Validaciones requieren consultar{" "}
                <Link
                  to={`${apiVsApiSlPath}#get-message`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  GET /mailling/v1/messages/:id
                </Link>{" "}
                en API para ver el estado final del mensaje.
              </>,
              "Solo acepta autenticación por API Key",
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export function ApiHostComparisonOverview({
  onCopy,
}: {
  onCopy: (text: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Alert className="border-info/30 bg-info/10 [&>svg]:text-info">
        <GitBranch className="h-4 w-4" />
        <AlertTitle className="text-info text-[11px] uppercase tracking-wide">
          Recomendación
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground">
          Integre primero contra <strong className="text-foreground">API</strong> para
          validaciones síncronas y depuración simple. Migre a{" "}
          <strong className="text-foreground">API SL</strong> cuando necesite alta
          disponibilidad y reintentos gestionados — el cambio es solo de host.
        </AlertDescription>
      </Alert>

      <ApiHostComparisonCards onCopy={onCopy} />
    </div>
  );
}
