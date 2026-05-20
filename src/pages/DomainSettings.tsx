import { useAuth } from "@/context/AuthContext";
import { DomainDnsValidationCard } from "@/components/DomainDnsValidationCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Globe, Info } from "lucide-react";

const DomainSettings = () => {
  const { user, token } = useAuth();
  const domains = user?.sendingDomains ?? [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-7 w-7 text-primary" />
          Dominios de envío
        </h1>
        <p className="text-muted-foreground mt-1">
          Dominios asignados a tu cuenta para enviar correo. Valida que SPF, DKIM y DMARC estén
          publicados en DNS antes de enviar campañas.
        </p>
      </div>

      {domains.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sin dominios de envío</CardTitle>
            <CardDescription>
              Tu cuenta aún no tiene dominios autorizados. Contacta al administrador para que
              asocie uno a tu cliente.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Validación DNS</CardTitle>
              <CardDescription>
                Consulta en vivo los registros TXT del dominio (SPF en la raíz, DMARC en
                _dmarc y DKIM en selectores habituales). Si falta alguno, contacta a quien administra
                tu DNS.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!token ? (
                <p className="text-sm text-muted-foreground">Inicia sesión para validar DNS.</p>
              ) : (
                domains.map((d) => (
                  <DomainDnsValidationCard key={d} domain={d} token={token} />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Dominios registrados</CardTitle>
              <CardDescription>
                Solo puedes enviar con remitente en estos dominios. Al enviar, eliges dominio,
                nombre visible y dirección (parte antes de @) libremente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {domains.map((d) => (
                  <li
                    key={d}
                    className="rounded-md border bg-muted/30 px-3 py-2 font-mono text-sm"
                  >
                    {d}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Collapsible className="rounded-lg border">
            <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                Qué se valida (SPF, DKIM, DMARC)
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4 text-sm text-muted-foreground space-y-2">
              <p>
                <strong className="text-foreground">SPF:</strong> registro TXT en el dominio con
                estructura similar a{" "}
                <code className="text-xs">v=spf1 ip4:104.251.216.206 -all</code> (la IP se
                configura en el servidor con{" "}
                <code className="text-xs">DNS_SPF_EXPECTED_IPV4</code>).
              </p>
              <p>
                <strong className="text-foreground">DMARC:</strong> registro TXT en{" "}
                <code className="text-xs">_dmarc.tudominio</code> con{" "}
                <code className="text-xs">v=DMARC1</code>.
              </p>
              <p>
                <strong className="text-foreground">DKIM:</strong> registro TXT en{" "}
                <code className="text-xs">selector._domainkey.tudominio</code> (se prueban
                selectores comunes: default, mail, selector1, dkim).
              </p>
              <p>
                La propagación DNS puede tardar minutos u horas después de un cambio en tu
                proveedor.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </>
      )}
    </div>
  );
};

export default DomainSettings;
