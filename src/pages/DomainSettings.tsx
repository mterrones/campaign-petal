import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Shield,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Copy,
  RefreshCw,
  Lock,
  Mail,
  Server,
  FileKey,
  Info,
  AlertCircle,
} from "lucide-react";

interface DnsRecord {
  type: string;
  host: string;
  value: string;
  ttl: string;
  status: "verified" | "pending" | "error";
}

type DomainType = "subdomain" | "root";

const DUMMY_IP = "203.0.113.50";
const DUMMY_DKIM_KEY = "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC3QzYkPG2bJml8xOmXQ...clave_publica_ejemplo";

/** Validates domain/subdomain format */
const validateDomain = (value: string): string | null => {
  const trimmed = value.trim();

  if (!trimmed) return "Ingresa un dominio o subdominio.";
  if (/\s/.test(trimmed)) return "El dominio no debe contener espacios.";
  if (/^https?:\/\//i.test(trimmed)) return "No incluyas http:// o https://. Solo el dominio.";
  if (trimmed.includes("/")) return "No incluyas rutas. Solo el dominio (ej: news.tuempresa.com).";
  if (trimmed.includes("@")) return "Ingresa un dominio, no un email (ej: news.tuempresa.com).";
  if (trimmed.startsWith(".") || trimmed.endsWith(".")) return "El dominio no puede empezar ni terminar con punto.";

  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  if (!domainRegex.test(trimmed)) return "Formato de dominio inválido. Ejemplo: news.tuempresa.com";

  return null;
};

/** Extracts the subdomain prefix from a full domain for DNS host entries */
const getSubdomainPrefix = (domain: string): string | null => {
  const parts = domain.split(".");
  if (parts.length > 2) {
    return parts.slice(0, parts.length - 2).join(".");
  }
  return null;
};

/** Generates DNS records based on domain */
const generateDnsRecords = (domain: string): DnsRecord[] => {
  const prefix = getSubdomainPrefix(domain);
  const hostBase = prefix || "@";

  const records: DnsRecord[] = [
    // A Record
    {
      type: "A",
      host: prefix ? `mail.${prefix}` : "mail",
      value: DUMMY_IP,
      ttl: "3600",
      status: "pending",
    },
    // SPF
    {
      type: "TXT (SPF)",
      host: hostBase === "@" ? "@" : prefix!,
      value: `v=spf1 ip4:${DUMMY_IP} -all`,
      ttl: "3600",
      status: "pending",
    },
    // DKIM
    {
      type: "TXT (DKIM)",
      host: prefix ? `selector1._domainkey.${prefix}` : "selector1._domainkey",
      value: DUMMY_DKIM_KEY,
      ttl: "3600",
      status: "pending",
    },
    // DMARC
    {
      type: "TXT (DMARC)",
      host: prefix ? `_dmarc.${prefix}` : "_dmarc",
      value: `v=DMARC1; p=none; rua=mailto:dmarc@${domain}; adkim=r; aspf=r`,
      ttl: "3600",
      status: "pending",
    },
    // MX (optional, for bounces)
    {
      type: "MX",
      host: prefix ? `bounce.${prefix}` : "bounce",
      value: `mail.${domain}`,
      ttl: "3600",
      status: "pending",
    },
  ];

  return records;
};

const DomainSettings = () => {
  const [domainType, setDomainType] = useState<DomainType>("subdomain");
  const [domain, setDomain] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);

  const handleDomainChange = (value: string) => {
    setDomain(value);
    if (validationError) setValidationError(null);
  };

  const handleConfigureDomain = () => {
    const trimmed = domain.trim().toLowerCase();
    const error = validateDomain(trimmed);
    if (error) {
      setValidationError(error);
      toast.error(error);
      return;
    }

    // Warn if root domain is used for mass sending
    const isSubdomain = trimmed.split(".").length > 2;
    if (domainType === "root" && !isSubdomain) {
      toast.warning("Recomendación: usa un subdominio exclusivo para envío masivo. Esto protege la reputación de tu dominio principal.");
    }

    const records = generateDnsRecords(trimmed);
    setDnsRecords(records);
    setIsConfigured(true);
    setValidationError(null);
    toast.success(`Dominio ${trimmed} configurado. Agrega los registros DNS a tu proveedor.`);
  };

  const handleReset = () => {
    setIsConfigured(false);
    setDnsRecords([]);
    setDomain("");
    setValidationError(null);
  };

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setDnsRecords(prev =>
        prev.map(r => ({
          ...r,
          status: Math.random() > 0.3 ? "verified" : "pending",
        }))
      );
      setVerifying(false);
      toast.info("Verificación completada. Algunos registros pueden tardar hasta 72 horas en propagarse.");
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const statusIcon = (status: DnsRecord["status"]) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case "pending":
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
  };

  const statusBadge = (status: DnsRecord["status"]) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Verificado</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-muted-foreground">Pendiente</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Configuración de Dominio</h1>
        <p className="text-muted-foreground mt-1">
          Configura la autenticación de tu dominio para mejorar la entregabilidad de tus emails.
        </p>
      </div>

      <Tabs defaultValue="domain" className="space-y-4">
        <TabsList>
          <TabsTrigger value="domain"><Globe className="w-3.5 h-3.5 mr-1.5" />Dominio</TabsTrigger>
          <TabsTrigger value="authentication"><Shield className="w-3.5 h-3.5 mr-1.5" />Autenticación</TabsTrigger>
          <TabsTrigger value="sending"><Mail className="w-3.5 h-3.5 mr-1.5" />Envío</TabsTrigger>
        </TabsList>

        {/* Tab: Dominio */}
        <TabsContent value="domain" className="space-y-4">
          {/* Paso 1: Tipo y dominio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5 text-primary" />
                Dominio de Envío
              </CardTitle>
              <CardDescription>
                Configura el dominio o subdominio desde el cual enviarás correos electrónicos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Tipo de dominio */}
              <div>
                <Label className="text-sm font-medium">Tipo</Label>
                <Select
                  value={domainType}
                  onValueChange={(v) => setDomainType(v as DomainType)}
                  disabled={isConfigured}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subdomain">Subdominio (recomendado para envíos masivos)</SelectItem>
                    <SelectItem value="root">Dominio raíz</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dominio input */}
              <div>
                <Label className="text-sm font-medium">
                  {domainType === "subdomain" ? "Subdominio de envío" : "Dominio de envío"}
                </Label>
                <Input
                  value={domain}
                  onChange={e => handleDomainChange(e.target.value)}
                  placeholder={domainType === "subdomain" ? "news.tuempresa.com" : "tuempresa.com"}
                  className={`mt-1 ${validationError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  disabled={isConfigured}
                />
                {validationError && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-xs">{validationError}</span>
                  </div>
                )}
              </div>

              {/* Recomendación */}
              <div className="bg-accent/50 rounded-lg p-3 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Recomendado:</strong> usa un subdominio exclusivo para correo saliente
                  (ej: <code className="text-xs bg-muted px-1 rounded">news.tuempresa.com</code>,{" "}
                  <code className="text-xs bg-muted px-1 rounded">mail.tuempresa.com</code>).
                  Esto protege la reputación de tu dominio principal.
                </p>
              </div>

              {/* Ejemplos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border rounded-lg p-3">
                  <p className="text-xs font-medium text-primary mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ejemplos válidos
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    <li><code>news.cliente.com</code></li>
                    <li><code>mail.cliente.com</code></li>
                    <li><code>cliente.com</code></li>
                  </ul>
                </div>
                <div className="border rounded-lg p-3 border-destructive/30">
                  <p className="text-xs font-medium text-destructive mb-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Ejemplos inválidos
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    <li><code>https://cliente.com</code></li>
                    <li><code>ventas@cliente.com</code></li>
                    <li><code>cliente.com/home</code></li>
                  </ul>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="flex gap-3">
                {!isConfigured ? (
                  <Button onClick={handleConfigureDomain}>
                    Generar Registros DNS
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleReset}>
                    Cambiar Dominio
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Paso 3: Registros DNS generados */}
          {isConfigured && (
            <>
              <div className="bg-accent/50 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Agrega estos registros DNS en tu proveedor</p>
                  <p className="text-muted-foreground mt-1">
                    Accede al panel de administración de tu dominio (GoDaddy, Cloudflare, Namecheap, etc.) y agrega cada registro.
                    La propagación puede tardar entre 15 minutos y 72 horas.
                  </p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Registros DNS Requeridos</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleVerify} disabled={verifying}>
                      <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${verifying ? "animate-spin" : ""}`} />
                      Verificar DNS
                    </Button>
                  </div>
                  <CardDescription>
                    Dominio configurado: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{domain.trim().toLowerCase()}</code>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dnsRecords.map((record, i) => (
                      <div key={i} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {statusIcon(record.status)}
                            <span className="font-medium text-sm">{record.type}</span>
                          </div>
                          {statusBadge(record.status)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Host / Nombre</Label>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">{record.host}</code>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(record.host)}>
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <Label className="text-xs text-muted-foreground">Valor / Destino</Label>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">{record.value}</code>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(record.value)}>
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">TTL</Label>
                          <span className="text-xs text-muted-foreground ml-2">{record.ttl}s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tab: Autenticación */}
        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileKey className="w-5 h-5 text-primary" />
                DKIM (DomainKeys Identified Mail)
              </CardTitle>
              <CardDescription>
                DKIM firma digitalmente tus emails para demostrar que no han sido alterados en tránsito.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent/50 rounded-lg p-4 text-sm space-y-2">
                <p><strong>¿Qué hace DKIM?</strong></p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Firma criptográficamente cada email saliente</li>
                  <li>Permite al receptor verificar que el email no fue modificado</li>
                  <li>Mejora significativamente la reputación del dominio</li>
                  <li>Es obligatorio para cumplir con políticas DMARC</li>
                </ul>
              </div>
              {isConfigured ? (
                <div className="space-y-2">
                  {dnsRecords.filter(r => r.type.includes("DKIM")).map((r, i) => (
                    <div key={i} className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center gap-2 text-sm">
                        {statusIcon(r.status)}
                        <code className="text-xs">{r.host}</code>
                      </div>
                      {statusBadge(r.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Configura un dominio primero para ver los registros DKIM.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-primary" />
                SPF (Sender Policy Framework)
              </CardTitle>
              <CardDescription>
                SPF especifica qué servidores están autorizados para enviar correos en nombre de tu dominio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent/50 rounded-lg p-4 text-sm space-y-2">
                <p><strong>¿Qué hace SPF?</strong></p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Define qué IPs/servidores pueden enviar email con tu dominio</li>
                  <li>Previene que spammers falsifiquen tu dirección de remitente</li>
                  <li>Es el primer nivel de autenticación que verifican los proveedores</li>
                </ul>
              </div>
              {isConfigured ? (
                <div className="space-y-2">
                  {dnsRecords.filter(r => r.type.includes("SPF")).map((r, i) => (
                    <div key={i} className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center gap-2 text-sm">
                        {statusIcon(r.status)}
                        <span className="text-xs font-mono">{r.type}</span>
                      </div>
                      {statusBadge(r.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Configura un dominio primero para ver el registro SPF.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="w-5 h-5 text-primary" />
                DMARC (Domain-based Message Authentication)
              </CardTitle>
              <CardDescription>
                DMARC define la política de tu dominio cuando un email falla las verificaciones SPF o DKIM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent/50 rounded-lg p-4 text-sm space-y-2">
                <p><strong>¿Qué hace DMARC?</strong></p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Indica a los proveedores qué hacer con emails que fallan autenticación</li>
                  <li>Opciones: <code>none</code> (monitorear), <code>quarantine</code> (spam), <code>reject</code> (rechazar)</li>
                  <li>Envía reportes de autenticación a tu email para monitoreo</li>
                  <li>Requerido por Gmail y Yahoo desde febrero 2024 para remitentes masivos</li>
                </ul>
              </div>
              {isConfigured ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Política DMARC</Label>
                    <Select defaultValue="none">
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None — Solo monitorear (recomendado al inicio)</SelectItem>
                        <SelectItem value="quarantine">Quarantine — Enviar a spam</SelectItem>
                        <SelectItem value="reject">Reject — Rechazar completamente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Email para reportes DMARC</Label>
                    <Input defaultValue={`dmarc@${domain.trim().toLowerCase()}`} className="mt-1" placeholder="dmarc@tudominio.com" />
                  </div>
                  {dnsRecords.filter(r => r.type.includes("DMARC")).map((r, i) => (
                    <div key={i} className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center gap-2 text-sm">
                        {statusIcon(r.status)}
                        <span className="text-xs font-mono">{r.type}</span>
                      </div>
                      {statusBadge(r.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Configura un dominio primero para configurar DMARC.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Server className="w-5 h-5 text-primary" />
                Return-Path / Bounce Domain
              </CardTitle>
              <CardDescription>
                Configura el dominio de retorno para manejar los rebotes (bounces) de emails.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-accent/50 rounded-lg p-4 text-sm space-y-2">
                <p><strong>¿Qué es Return-Path?</strong></p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Define a dónde se envían las notificaciones de rebote</li>
                  <li>Alinea el dominio del envelope sender con tu dominio visible</li>
                  <li>Mejora la alineación SPF para DMARC</li>
                  <li>Permite recibir y procesar informes de entrega</li>
                </ul>
              </div>
              {isConfigured ? (
                <div className="space-y-2">
                  {dnsRecords.filter(r => r.type === "MX").map((r, i) => (
                    <div key={i} className="flex items-center justify-between border rounded-md p-3">
                      <div className="flex items-center gap-2 text-sm">
                        {statusIcon(r.status)}
                        <span className="text-xs font-mono">{r.type} — {r.host}</span>
                      </div>
                      {statusBadge(r.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Configura un dominio primero para ver los registros de Return-Path.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Envío */}
        <TabsContent value="sending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración de Envío</CardTitle>
              <CardDescription>Parámetros generales para el envío de correos electrónicos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-sm">Nombre del Remitente</Label>
                <Input defaultValue="Tu Empresa" className="mt-1" placeholder="Nombre visible en la bandeja" />
              </div>
              <div>
                <Label className="text-sm">Email del Remitente</Label>
                <div className="flex gap-2 mt-1">
                  <Input defaultValue="noreply" className="w-40" />
                  <span className="flex items-center text-muted-foreground">@</span>
                  <Input value={domain.trim().toLowerCase() || "tudominio.com"} disabled className="flex-1" />
                </div>
              </div>
              <div>
                <Label className="text-sm">Email de Respuesta (Reply-To)</Label>
                <Input defaultValue={`soporte@${domain.trim().toLowerCase() || "tudominio.com"}`} className="mt-1" placeholder="soporte@tudominio.com" />
              </div>

              <Separator />

              <div>
                <Label className="text-sm">Límite de Envío Diario</Label>
                <Select defaultValue="5000">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">500 emails/día</SelectItem>
                    <SelectItem value="1000">1,000 emails/día</SelectItem>
                    <SelectItem value="5000">5,000 emails/día</SelectItem>
                    <SelectItem value="10000">10,000 emails/día</SelectItem>
                    <SelectItem value="50000">50,000 emails/día</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Velocidad de Envío</Label>
                <Select defaultValue="normal">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Lento — 1 email/segundo</SelectItem>
                    <SelectItem value="normal">Normal — 10 emails/segundo</SelectItem>
                    <SelectItem value="fast">Rápido — 50 emails/segundo</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Una velocidad más lenta mejora la reputación del dominio para dominios nuevos.</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Tracking de Aperturas</Label>
                    <p className="text-xs text-muted-foreground">Inserta un pixel invisible para rastrear aperturas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Tracking de Clicks</Label>
                    <p className="text-xs text-muted-foreground">Reescribe los enlaces para rastrear clicks</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Link de Cancelación Automático</Label>
                    <p className="text-xs text-muted-foreground">Agrega automáticamente un link de baja en cada email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Header List-Unsubscribe</Label>
                    <p className="text-xs text-muted-foreground">Agrega el header RFC 8058 para un-click unsubscribe (requerido por Gmail)</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <Button onClick={() => toast.success("Configuración guardada")}>
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DomainSettings;
