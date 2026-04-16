import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { ArrowLeft, Send, Eye, MousePointerClick, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/StatCard";
import CampaignStatusBadge from "@/components/CampaignStatusBadge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { getJson } from "@/lib/api";
import {
  type CampaignMessagesResponse,
  type CampaignOneResponse,
  platformCampaignMessagesQueryKey,
  platformCampaignQueryKey,
} from "@/lib/platformCampaigns";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const MESSAGE_PAGE = 50;

const CampaignReport = () => {
  const { id } = useParams();
  const { token } = useAuth();

  const campaignQuery = useQuery({
    queryKey: platformCampaignQueryKey(id),
    queryFn: () =>
      getJson<CampaignOneResponse>(`/v1/platform/campaigns/${id}`, token!),
    enabled: !!token && !!id,
  });

  const messagesQuery = useInfiniteQuery({
    queryKey: platformCampaignMessagesQueryKey(id),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const sp = new URLSearchParams({ limit: String(MESSAGE_PAGE) });
      if (pageParam) sp.set("cursor", pageParam);
      return getJson<CampaignMessagesResponse>(
        `/v1/platform/campaigns/${id}/messages?${sp.toString()}`,
        token!,
      );
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
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

  const flatMessages =
    messagesQuery.data?.pages.flatMap((p) => p.messages) ?? [];

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
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs flex-wrap">
                {pieData.map((d) => (
                  <span key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name}: {d.value.toLocaleString()}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="stat-card">
          <h3 className="font-semibold mb-4">Funnel de Engagement</h3>
          {engagementData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin datos.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={engagementData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
                <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
              {(messagesQuery.isPending || messagesQuery.isFetching) && flatMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-8">
                    Cargando mensajes…
                  </TableCell>
                </TableRow>
              ) : flatMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-8">
                    No hay mensajes en esta campaña todavía.
                  </TableCell>
                </TableRow>
              ) : (
                flatMessages.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">{m.to}</TableCell>
                    <TableCell className="text-sm">{m.deliveryStatus}</TableCell>
                    <TableCell className="text-right text-sm">{m.openCount}</TableCell>
                    <TableCell className="text-right text-sm">{m.clickCount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {m.sentAt ?? m.createdAt}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {messagesQuery.hasNextPage && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              disabled={messagesQuery.isFetchingNextPage}
              onClick={() => void messagesQuery.fetchNextPage()}
            >
              {messagesQuery.isFetchingNextPage ? "Cargando…" : "Cargar más"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignReport;
