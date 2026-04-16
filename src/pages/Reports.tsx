import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { BarChart3, Eye, MousePointerClick, Send } from "lucide-react";
import StatCard from "@/components/StatCard";
import CampaignStatusBadge from "@/components/CampaignStatusBadge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { getJson } from "@/lib/api";
import {
  type CampaignsListResponse,
  platformCampaignsQueryKey,
} from "@/lib/platformCampaigns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const Reports = () => {
  const { token } = useAuth();
  const { data, isPending, isError, error } = useQuery({
    queryKey: platformCampaignsQueryKey,
    queryFn: () => getJson<CampaignsListResponse>("/v1/platform/campaigns", token!),
    enabled: !!token,
  });

  const campaigns = data?.campaigns ?? [];
  const sentCampaigns = campaigns.filter(
    (c) => c.status === "sent" || c.status === "sending",
  );

  const totalSent = sentCampaigns.reduce((a, c) => a + c.recipients, 0);
  const totalDelivered = sentCampaigns.reduce((a, c) => a + c.delivered, 0);
  const totalOpened = sentCampaigns.reduce((a, c) => a + c.opened, 0);
  const totalClicked = sentCampaigns.reduce((a, c) => a + c.clicked, 0);

  const chartData = sentCampaigns.map((c) => ({
    name: c.name.length > 15 ? c.name.slice(0, 15) + "…" : c.name,
    Entregados: c.delivered,
    Abiertos: c.opened,
    Clicks: c.clicked,
    Rebotados: c.bounced,
  }));

  if (isPending) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reportes · Campañas</h1>
        <p className="text-muted-foreground text-sm">Cargando datos…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Reportes · Campañas</h1>
        <p className="text-destructive text-sm">
          No se pudieron cargar los reportes.{" "}
          {error instanceof Error ? error.message : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reportes · Campañas</h1>
        <p className="text-muted-foreground mt-1">Análisis global de rendimiento de campañas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Enviados" value={totalSent.toLocaleString()} icon={Send} />
        <StatCard title="Total Entregados" value={totalDelivered.toLocaleString()} icon={Send} iconColor="bg-success/10 text-success" />
        <StatCard title="Total Abiertos" value={totalOpened.toLocaleString()} icon={Eye} iconColor="bg-warning/10 text-warning" />
        <StatCard title="Total Clicks" value={totalClicked.toLocaleString()} icon={MousePointerClick} iconColor="bg-info/10 text-info" />
      </div>

      <div className="stat-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          Comparativa por Campaña
        </h3>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No hay campañas enviadas o en envío para comparar.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Entregados" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Abiertos" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Clicks" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Rebotados" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="stat-card">
        <h3 className="font-semibold mb-4">Detalle por Campaña</h3>
        {sentCampaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Aún no tienes campañas con estado enviado o en envío.
          </p>
        ) : (
          <div className="space-y-4">
            {sentCampaigns.map((c) => {
              const openRate = c.delivered > 0 ? ((c.opened / c.delivered) * 100).toFixed(1) : "0";
              const clickRate = c.opened > 0 ? ((c.clicked / c.opened) * 100).toFixed(1) : "0";
              return (
                <Link to={`/reports/campaigns/${c.id}`} key={c.id} className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{c.name}</span>
                      <CampaignStatusBadge status={c.status} />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {c.sentAt || c.scheduledAt || c.createdAt}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Entregados</span>
                      <p className="font-semibold">{c.delivered.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Apertura</span>
                      <p className="font-semibold">{openRate}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Clicks</span>
                      <p className="font-semibold">{clickRate}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rebotados</span>
                      <p className="font-semibold">{c.bounced.toLocaleString()}</p>
                    </div>
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

export default Reports;
