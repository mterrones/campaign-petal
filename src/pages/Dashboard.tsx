import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Send, Users, MousePointerClick, Eye, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/StatCard";
import DailyQuotaCard from "@/components/DailyQuotaCard";
import CampaignStatusBadge from "@/components/CampaignStatusBadge";
import { Progress } from "@/components/ui/progress";
import ApexChart from "@/components/charts/ApexChart";
import { apexPalette, baseChartOptions } from "@/lib/apexTheme";
import type { ApexOptions } from "apexcharts";
import { useAuth } from "@/context/AuthContext";
import { getJson } from "@/lib/api";
import {
  type CampaignsListResponse,
  type PlatformCampaign,
  platformCampaignsQueryKey,
} from "@/lib/platformCampaigns";
import {
  fetchDailySendQuota,
  platformDailySendQuotaQueryKey,
} from "@/lib/platformDailyQuota";
import { contacts } from "@/data/mockData";

type ChartRow = { name: string; enviados: number; abiertos: number; clicks: number };

function buildLastFourMonthsChart(campaigns: PlatformCampaign[]): ChartRow[] {
  const monthTotals = new Map<string, { enviados: number; abiertos: number; clicks: number }>();
  for (const c of campaigns) {
    const raw = c.sentAt ?? c.createdAt;
    if (!raw) continue;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const prev = monthTotals.get(key) ?? { enviados: 0, abiertos: 0, clicks: 0 };
    prev.enviados += c.delivered;
    prev.abiertos += c.opened;
    prev.clicks += c.clicked;
    monthTotals.set(key, prev);
  }
  const now = new Date();
  const rows: ChartRow[] = [];
  for (let i = 3; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    let monthName = dt.toLocaleString("es", { month: "short" });
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const t = monthTotals.get(key) ?? { enviados: 0, abiertos: 0, clicks: 0 };
    rows.push({ name: monthName, ...t });
  }
  return rows;
}

const Dashboard = () => {
  const { token } = useAuth();
  const { data, isPending, isError } = useQuery({
    queryKey: platformCampaignsQueryKey,
    queryFn: () => getJson<CampaignsListResponse>("/v1/platform/campaigns", token!),
    enabled: !!token,
  });

  const quotaQuery = useQuery({
    queryKey: platformDailySendQuotaQueryKey,
    queryFn: () => fetchDailySendQuota(token!),
    enabled: !!token,
  });

  const campaigns = data?.campaigns ?? [];

  const activeContactCount = useMemo(
    () => contacts.filter((c) => c.status === "active").length,
    [],
  );

  const metrics = useMemo(() => {
    const sentCount = campaigns.filter((c) => c.status === "sent").length;
    const totalDelivered = campaigns.reduce((s, c) => s + c.delivered, 0);
    const totalOpened = campaigns.reduce((s, c) => s + c.opened, 0);
    const totalClicked = campaigns.reduce((s, c) => s + c.clicked, 0);
    const avgOpenRate =
      totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 1000) / 10 : 0;
    const avgClickRate =
      totalDelivered > 0 ? Math.round((totalClicked / totalDelivered) * 1000) / 10 : 0;
    return {
      sentCount,
      totalCampaigns: campaigns.length,
      avgOpenRate,
      avgClickRate,
    };
  }, [campaigns]);

  const chartData = useMemo(() => buildLastFourMonthsChart(campaigns), [campaigns]);

  const recentCampaigns = useMemo(() => {
    return [...campaigns]
      .sort((a, b) => {
        const ta = new Date(a.sentAt ?? a.createdAt).getTime();
        const tb = new Date(b.sentAt ?? b.createdAt).getTime();
        return tb - ta;
      })
      .slice(0, 4);
  }, [campaigns]);

  if (isPending) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Cargando datos…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-destructive text-sm">No se pudieron cargar las campañas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen de tu actividad de email marketing</p>
      </div>

      {/* Featured: API daily quota */}
      <DailyQuotaCard
        remaining={quotaQuery.data?.remaining ?? null}
        limit={quotaQuery.data?.limit ?? null}
        used={quotaQuery.data?.used ?? null}
        isLoading={quotaQuery.isLoading}
        isError={quotaQuery.isError}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Contactos activos"
          value={activeContactCount.toLocaleString()}
          change="En tus listas locales"
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          title="Campañas enviadas"
          value={metrics.sentCount}
          change={
            metrics.totalCampaigns > 0
              ? `De ${metrics.totalCampaigns} campaña${metrics.totalCampaigns === 1 ? "" : "s"} en total`
              : "Sin campañas aún"
          }
          changeType="neutral"
          icon={Send}
          iconColor="bg-success/10 text-success"
        />
        <StatCard
          title="Tasa de apertura"
          value={`${metrics.avgOpenRate}%`}
          change={
            metrics.avgOpenRate > 0
              ? "Sobre mensajes entregados"
              : "Sin aperturas registradas"
          }
          changeType="neutral"
          icon={Eye}
          iconColor="bg-accent/10 text-accent"
        />
        <StatCard
          title="Tasa de clics"
          value={`${metrics.avgClickRate}%`}
          change={
            metrics.avgClickRate > 0
              ? "Sobre mensajes entregados"
              : "Sin clics registrados"
          }
          changeType="neutral"
          icon={MousePointerClick}
          iconColor="bg-info/10 text-info"
        />
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-lg font-bold text-foreground">Rendimiento de Campañas</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Últimos 4 meses</p>
          </div>
        </div>

        <ApexChart
          type="area"
          height={320}
          series={[
            { name: "Entregas", data: chartData.map((r) => r.enviados) },
            { name: "Abiertos", data: chartData.map((r) => r.abiertos) },
            { name: "Clicks", data: chartData.map((r) => r.clicks) },
          ]}
          options={{
            ...baseChartOptions,
            chart: { ...baseChartOptions.chart, type: "area", stacked: false },
            colors: [apexPalette.primary, apexPalette.success, apexPalette.info],
            stroke: { curve: "smooth", width: 3 },
            fill: {
              type: "gradient",
              gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [0, 90, 100],
              },
            },
            markers: { size: 0, hover: { size: 6 } },
            xaxis: {
              ...baseChartOptions.xaxis,
              categories: chartData.map((r) => r.name),
            },
            yaxis: {
              ...baseChartOptions.yaxis,
              labels: {
                ...(baseChartOptions.yaxis as { labels?: object })?.labels,
                formatter: (v: number) => v.toLocaleString(),
              },
            },
            tooltip: {
              ...baseChartOptions.tooltip,
              shared: true,
              intersect: false,
              y: { formatter: (v: number) => v.toLocaleString() },
            },
            legend: {
              ...baseChartOptions.legend,
              position: "top",
              horizontalAlign: "right",
            },
          } satisfies ApexOptions}
        />
      </div>

      <div className="stat-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Campañas recientes</h2>
          <Link to="/campaigns" className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">
            Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentCampaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Aún no hay campañas. <Link to="/campaigns/new" className="text-primary font-medium hover:underline">Crea una campaña</Link> para verla aquí.
          </p>
        ) : (
          <div className="space-y-3">
            {recentCampaigns.map((c) => {
              const deliveryRate = c.recipients > 0 ? Math.round((c.delivered / c.recipients) * 100) : 0;
              return (
                <Link
                  key={c.id}
                  to={`/reports/campaigns/${c.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{c.name}</p>
                      <CampaignStatusBadge status={c.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{c.subject}</p>
                  </div>
                  <div className="w-32 hidden md:block">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Entrega</span>
                      <span>{deliveryRate}%</span>
                    </div>
                    <Progress value={deliveryRate} className="h-1.5" />
                  </div>
                  <div className="text-right text-xs text-muted-foreground hidden lg:block w-24">
                    <p>{c.recipients.toLocaleString()} dest.</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
