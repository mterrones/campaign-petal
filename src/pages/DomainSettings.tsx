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
} from "lucide-react";

interface DnsRecord {
  type: string;
  host: string;
  value: string;
  status: "verified" | "pending" | "error";
}

const DomainSettings = () => {
  const [domain, setDomain] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Simulated DNS records
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);

  const handleConfigureDomain = () => {
    if (!domain.trim()) {
      toast.error("Ingresa un dominio válido");
      return;
    }
    const d = domain.trim().toLowerCase();
    setDnsRecords([
      {
        type: "TXT (SPF)",
        host: d,
        value: `v=spf1 include:_spf.${d} include:amazonses.com ~all`,
        status: "pending",
      },
      {
        type: "CNAME (DKIM)",
        host: `selector1._domainkey.${d}`,
        value: `selector1._domainkey.${d}.dkim.amazonses.com`,
        status: "pending",
      },
      {
        type: "CNAME (DKIM)",
        host: `selector2._domainkey.${d}`,
        value: `selector2._domainkey.${d}.dkim.amazonses.com`,
        status: "pending",
      },
      {
        type: "CNAME (DKIM)",
        host: `selector3._domainkey.${d}`,
        value: `selector3._domainkey.${d}.dkim.amazonses.com`,
        status: "pending",
      },
      {
        type: "TXT (DMARC)",
        host: `_dmarc.${d}`,
        value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${d}; pct=100`,
        status: "pending",
      },
      {
        type: "MX",
        host: `bounce.${d}`,
        value: `feedback-smtp.us-east-1.amazonses.com`,
        status: "pending",
      },
      {
        type: "TXT (Return-Path)",
        host: `bounce.${d}`,
        value: `v=spf1 include:amazonses.com ~all`,
        status: "pending",
      },
    ]);
    setIsConfigured(true);
    toast.success(`Dominio ${d} configurado. Agrega los registros DNS a tu proveedor.`);
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
      toast.info("Verificación completada. Algunos registros pueden tardar hasta 72h en propagarse.");
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const statusIcon = (status: DnsRecord["status"]) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "pending":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
  };

  const statusBadge = (status: DnsRecord["status"]) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Verificado</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-600 border-amber-500/30">Pendiente</Badge>;
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5 text-primary" />
                Dominio de Envío
              </CardTitle>
              <CardDescription>
                Ingresa el dominio desde el cual enviarás correos electrónicos. Deberás agregar registros DNS para verificar la propiedad.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label className="text-sm">Dominio</Label>
                  <Input
                    value={domain}
                    onChange={e => setDomain(e.target.value)}
                    placeholder="tuempresa.com"
                    className="mt-1"
                    disabled={isConfigured}
                  />
                </div>
                {!isConfigured ? (
                  <Button className="mt-6" onClick={handleConfigureDomain}>
                    Configurar Dominio
                  </Button>
                ) : (
                  <Button variant="outline" className="mt-6" onClick={() => { setIsConfigured(false); setDnsRecords([]); setDomain(""); }}>
                    Cambiar
                  </Button>
                )}
              </div>

              {isConfigured && (
                <div className="bg-accent/50 rounded-lg p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Agrega los registros DNS en tu proveedor</p>
                    <p className="text-muted-foreground mt-1">
                      Accede al panel de administración de tu dominio (GoDaddy, Cloudflare, Namecheap, etc.) y agrega los registros que se muestran abajo. La propagación puede tardar entre 15 minutos y 72 horas.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {isConfigured && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Registros DNS Requeridos</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleVerify} disabled={verifying}>
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${verifying ? "animate-spin" : ""}`} />
                    Verificar DNS
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dnsRecords.map((record, i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {statusIcon(record.status)}
                          <span className="font-medium text-sm">{record.type}</span>
                        </div>
                        {statusBadge(record.status)}
                      </div>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Host / Nombre</Label>
                          <div className="flex items-center gap-2 mt-0.5">
                            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">{record.host}</code>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(record.host)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Valor</Label>
                          <div className="flex items-center gap-2 mt-0.5">
                            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 break-all">{record.value}</code>
                            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(record.value)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                DKIM firma digitalmente tus emails para demostrar que no han sido alterados en tránsito. Se requieren 3 registros CNAME.
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
                        <code className="text-xs">{r.host.split(".")[0]}</code>
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
              {isConfigured && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Política DMARC</Label>
                    <Select defaultValue="quarantine">
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
                    <Input defaultValue={`dmarc@${domain}`} className="mt-1" placeholder="dmarc@tudominio.com" />
                  </div>
                  <div>
                    <Label className="text-sm">Porcentaje de aplicación (%)</Label>
                    <Input type="number" defaultValue="100" min="0" max="100" className="mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">Porcentaje de emails a los que se aplica la política (100 = todos)</p>
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
              )}
              {!isConfigured && (
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
                  {dnsRecords.filter(r => r.type.includes("Return-Path") || r.type === "MX").map((r, i) => (
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
                  <Input value={domain || "tudominio.com"} disabled className="flex-1" />
                </div>
              </div>
              <div>
                <Label className="text-sm">Email de Respuesta (Reply-To)</Label>
                <Input defaultValue={`soporte@${domain || "tudominio.com"}`} className="mt-1" placeholder="soporte@tudominio.com" />
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
