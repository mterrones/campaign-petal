import { Send, Users, MousePointerClick, Eye, TrendingUp, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/StatCard";
import CampaignStatusBadge from "@/components/CampaignStatusBadge";
import { campaigns, dashboardStats } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const chartData = [
  { name: "Ene", enviados: 8400, abiertos: 2900, clicks: 1200 },
  { name: "Feb", enviados: 10200, abiertos: 3600, clicks: 1500 },
  { name: "Mar", enviados: 9800, abiertos: 3400, clicks: 1450 },
  { name: "Abr", enviados: 15000, abiertos: 5200, clicks: 2100 },
];

const Dashboard = () => {
  const recentCampaigns = campaigns.slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen de tu actividad de email marketing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Contactos Totales"
          value={dashboardStats.totalContacts.toLocaleString()}
          change="+340 este mes"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Campañas Enviadas"
          value={dashboardStats.totalCampaigns}
          change="+5 este mes"
          changeType="positive"
          icon={Send}
          iconColor="bg-success/10 text-success"
        />
        <StatCard
          title="Tasa de Apertura"
          value={`${dashboardStats.avgOpenRate}%`}
          change="+2.1% vs mes anterior"
          changeType="positive"
          icon={Eye}
          iconColor="bg-warning/10 text-warning"
        />
        <StatCard
          title="Tasa de Clicks"
          value={`${dashboardStats.avgClickRate}%`}
          change="-0.3% vs mes anterior"
          changeType="negative"
          icon={MousePointerClick}
          iconColor="bg-info/10 text-info"
        />
      </div>

      {/* Chart */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Rendimiento de Campañas</h2>
            <p className="text-sm text-muted-foreground">Últimos 4 meses</p>
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Enviados</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-success" /> Abiertos</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-info" /> Clicks</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gEnviados" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gAbiertos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
            <Tooltip
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid hsl(214, 32%, 91%)",
                fontSize: "12px",
              }}
            />
            <Area type="monotone" dataKey="enviados" stroke="hsl(217, 91%, 60%)" fillOpacity={1} fill="url(#gEnviados)" strokeWidth={2} />
            <Area type="monotone" dataKey="abiertos" stroke="hsl(142, 71%, 45%)" fillOpacity={1} fill="url(#gAbiertos)" strokeWidth={2} />
            <Area type="monotone" dataKey="clicks" stroke="hsl(199, 89%, 48%)" fillOpacity={0} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Campaigns */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Campañas Recientes</h2>
          <Link to="/campaigns" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
            Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="space-y-4">
          {recentCampaigns.map((c) => {
            const deliveryRate = c.recipients > 0 ? Math.round((c.delivered / c.recipients) * 100) : 0;
            return (
              <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{c.name}</p>
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
