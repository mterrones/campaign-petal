import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Send, Eye, MousePointerClick, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/StatCard";
import CampaignStatusBadge from "@/components/CampaignStatusBadge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { formatDateTimeGmtMinus5 } from "@/lib/dateTimeGmtMinus5";
import { getJson, mailingApiV1Path } from "@/lib/api";
import {
  type CampaignMessagesResponse,
  type CampaignOneResponse,
  platformCampaignMessagesQueryKey,
  platformCampaignQueryKey,
} from "@/lib/platformCampaigns";
import ApexChart from "@/components/charts/ApexChart";
import { apexPalette, baseChartOptions } from "@/lib/apexTheme";
import type { ApexOptions } from "apexcharts";

const MESSAGE_PAGE_SIZE = 50;

const CampaignReport = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [messagePage, setMessagePage] = useState(1);

  useEffect(() => {
    setMessagePage(1);
  }, [id]);

  const campaignQuery = useQuery({
    queryKey: platformCampaignQueryKey(id),
    queryFn: () =>
      getJson<CampaignOneResponse>(
        `${mailingApiV1Path}/platform/campaigns/${id}`,
        token!,
      ),
    enabled: !!token && !!id,
  });

  const messagesQuery = useQuery({
    queryKey: [...platformCampaignMessagesQueryKey(id), messagePage],
    queryFn: () => {
      const sp = new URLSearchParams({
        page: String(messagePage),
        pageSize: String(MESSAGE_PAGE_SIZE),
      });
      return getJson<CampaignMessagesResponse>(
        `${mailingApiV1Path}/platform/campaigns/${id}/messages?${sp.toString()}`,
        token!,
      );
    },
    enabled: !!token && !!id && !!campaignQuery.data?.campaign,
  });

  const campaign = campaignQuery.data?.campaign;

  const deliveryRate =
    campaign && campaign.recipients > 0
      ? ((campaign.delivered / campaign.recipients) * 100).toFixed(1)
      : "0";
  const openRate =
    campaign && campaign.delivered > 0
      ? ((campaign.opened / campaign.delivered) * 100).toFixed(1)
      : "0";
  const clickRate =
    campaign && campaign.opened > 0
      ? ((campaign.clicked / campaign.opened) * 100).toFixed(1)
      : "0";
  const bounceRate =
    campaign && campaign.recipients > 0
      ? ((campaign.bounced / campaign.recipients) * 100).toFixed(1)
      : "0";

  const pieData = campaign
    ? [
        { name: "Entregados", value: campaign.delivered, color: "hsl(142, 71%, 45%)" },
        { name: "Rebotados", value: campaign.bounced, color: "hsl(0, 84%, 60%)" },
        {
          name: "Pendientes",
          value: Math.max(0, campaign.recipients - campaign.delivered - campaign.bounced),
          color: "hsl(214, 32%, 91%)",
        },
      ].filter((d) => d.value > 0)
    : [];

  const engagementData = campaign
    ? [
        { name: "Enviados", value: campaign.recipients },
        { name: "Entregados", value: campaign.delivered },
        { name: "Abiertos", value: campaign.opened },
        { name: "Clicks", value: campaign.clicked },
      ]
    : [];

  const messagesPayload = messagesQuery.data;
  const pagedMessages = messagesPayload?.messages ?? [];
  const messagesTotal = messagesPayload?.total ?? 0;
  const currentPage = messagesPayload?.page ?? messagePage;
  const pageSize = messagesPayload?.pageSize ?? MESSAGE_PAGE_SIZE;
  const totalPages =
    messagesTotal === 0 ? 1 : Math.ceil(messagesTotal / pageSize);
  const rangeFrom =
    messagesTotal === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeTo = Math.min(currentPage * pageSize, messagesTotal);

  if (campaignQuery.isPending) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground text-sm">Cargando campaña…</p>
      </div>
    );
  }

  if (campaignQuery.isError || !campaign) {
    return (
      <div className="space-y-6">
        <Link to="/reports/campaigns" className="text-sm text-primary flex items-center gap-1 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a reportes
        </Link>
        <p className="text-destructive text-sm">No se encontró la campaña.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap gap-3 mb-3">
          <Link to="/reports/campaigns" className="text-sm text-primary flex items-center gap-1 hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" /> Reportes
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/campaigns" className="text-sm text-primary flex items-center gap-1 hover:underline">
            Campañas
          </Link>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <CampaignStatusBadge status={campaign.status} />
        </div>
        <p className="text-muted-foreground mt-1">Asunto: {campaign.subject}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Enviados" value={campaign.recipients.toLocaleString()} icon={Send} />
        <StatCard title="Entregados" value={`${deliveryRate}%`} icon={Send} iconColor="bg-success/10 text-success" />
        <StatCard title="Abiertos" value={`${openRate}%`} icon={Eye} iconColor="bg-warning/10 text-warning" />
        <StatCard title="Clicks" value={`${clickRate}%`} icon={MousePointerClick} iconColor="bg-info/10 text-info" />
        <StatCard title="Rebotados" value={`${bounceRate}%`} icon={AlertTriangle} iconColor="bg-destructive/10 text-destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Distribución de Entrega</h3>
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin datos de entrega aún.</p>
          ) : (
            <ApexChart
              type="donut"
              height={280}
              series={pieData.map((d) => d.value)}
              options={{
                ...baseChartOptions,
                chart: { ...baseChartOptions.chart, type: "donut" },
                labels: pieData.map((d) => d.name),
                colors: [apexPalette.success, apexPalette.destructive, apexPalette.muted],
                stroke: { width: 2, colors: ["#fff"] },
                legend: {
                  ...baseChartOptions.legend,
                  position: "bottom",
                  formatter: (seriesName: string, opts: { w: { globals: { series: number[] } }; seriesIndex: number }) =>
                    `${seriesName}: ${opts.w.globals.series[opts.seriesIndex].toLocaleString()}`,
                },
                plotOptions: {
                  pie: {
                    donut: {
                      size: "70%",
                      labels: {
                        show: true,
                        name: { fontSize: "13px", color: apexPalette.text },
                        value: {
                          fontSize: "22px",
                          fontWeight: 700,
                          color: apexPalette.textStrong,
                          formatter: (v: string) => Number(v).toLocaleString(),
                        },
                        total: {
                          show: true,
                          label: "Total",
                          color: apexPalette.text,
                          formatter: (w: { globals: { seriesTotals: number[] } }) =>
                            w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString(),
                        },
                      },
                    },
                  },
                },
                dataLabels: {
                  enabled: true,
                  style: { fontSize: "11px", fontWeight: 600 },
                  dropShadow: { enabled: false },
                },
                tooltip: { ...baseChartOptions.tooltip, y: { formatter: (v: number) => v.toLocaleString() } },
              } satisfies ApexOptions}
            />
          )}
        </div>

        <div className="stat-card">
          <h3 className="font-semibold mb-4">Funnel de Engagement</h3>
          {engagementData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin datos.</p>
          ) : (
            <ApexChart
              type="bar"
              height={280}
              series={[{ name: "Total", data: engagementData.map((d) => d.value) }]}
              options={{
                ...baseChartOptions,
                chart: { ...baseChartOptions.chart, type: "bar" },
                colors: [apexPalette.primary, apexPalette.success, apexPalette.warning, apexPalette.info],
                plotOptions: {
                  bar: {
                    horizontal: true,
                    borderRadius: 6,
                    borderRadiusApplication: "end",
                    barHeight: "70%",
                    distributed: true,
                  },
                },
                xaxis: {
                  ...baseChartOptions.xaxis,
                  categories: engagementData.map((d) => d.name),
                  labels: { ...baseChartOptions.xaxis?.labels, formatter: (v: string) => Number(v).toLocaleString() },
                },
                legend: { show: false },
                dataLabels: {
                  enabled: true,
                  textAnchor: "start",
                  offsetX: 0,
                  style: { fontSize: "11px", fontWeight: 600, colors: ["#fff"] },
                  formatter: (v: number) => v.toLocaleString(),
                },
                tooltip: { ...baseChartOptions.tooltip, y: { formatter: (v: number) => v.toLocaleString() } },
              } satisfies ApexOptions}
            />
          )}
        </div>
      </div>

      <div className="stat-card">
        <h3 className="font-semibold mb-4">Métricas Detalladas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">De baja</p>
            <p className="text-xl font-bold">{campaign.unsubscribed}</p>
            <Progress value={campaign.recipients > 0 ? (campaign.unsubscribed / campaign.recipients) * 100 : 0} className="h-1.5 mt-2" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Rebotados</p>
            <p className="text-xl font-bold">{campaign.bounced}</p>
            <Progress value={campaign.recipients > 0 ? (campaign.bounced / campaign.recipients) * 100 : 0} className="h-1.5 mt-2" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tasa Apertura</p>
            <p className="text-xl font-bold">{openRate}%</p>
            <Progress value={Number(openRate)} className="h-1.5 mt-2" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tasa de Click</p>
            <p className="text-xl font-bold">{clickRate}%</p>
            <Progress value={Number(clickRate)} className="h-1.5 mt-2" />
          </div>
        </div>
      </div>

      <div className="stat-card">
        <h3 className="font-semibold mb-4">Mensajes enviados</h3>
        {messagesQuery.isError && (
          <p className="text-destructive text-sm mb-4">No se pudieron cargar los mensajes.</p>
        )}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Destinatario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Aperturas</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead>Enviado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messagesQuery.isPending && pagedMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-8">
                    Cargando mensajes…
                  </TableCell>
                </TableRow>
              ) : pagedMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-8">
                    No hay mensajes en esta campaña todavía.
                  </TableCell>
                </TableRow>
              ) : (
                pagedMessages.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">{m.to}</TableCell>
                    <TableCell className="text-sm">{m.deliveryStatus}</TableCell>
                    <TableCell className="text-right text-sm">{m.openCount}</TableCell>
                    <TableCell className="text-right text-sm">{m.clickCount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                      {formatDateTimeGmtMinus5(m.sentAt ?? m.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {messagesTotal > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Mostrando {rangeFrom.toLocaleString()}–{rangeTo.toLocaleString()} de{" "}
              {messagesTotal.toLocaleString()} · Página {currentPage} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={messagesQuery.isFetching || currentPage <= 1}
                onClick={() => setMessagePage((p) => Math.max(1, p - 1))}
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={messagesQuery.isFetching || currentPage >= totalPages}
                onClick={() => setMessagePage((p) => Math.min(totalPages, p + 1))}
                aria-label="Página siguiente"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignReport;
