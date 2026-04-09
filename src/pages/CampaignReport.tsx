import { useParams } from "react-router-dom";
import { ArrowLeft, Send, Eye, MousePointerClick, AlertTriangle, UserMinus } from "lucide-react";
import { Link } from "react-router-dom";
import { campaigns } from "@/data/mockData";
import StatCard from "@/components/StatCard";
import CampaignStatusBadge from "@/components/CampaignStatusBadge";
import { Progress } from "@/components/ui/progress";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const CampaignReport = () => {
  const { id } = useParams();
  const campaign = campaigns.find((c) => c.id === id) || campaigns[0];

  const deliveryRate = campaign.recipients > 0 ? ((campaign.delivered / campaign.recipients) * 100).toFixed(1) : "0";
  const openRate = campaign.delivered > 0 ? ((campaign.opened / campaign.delivered) * 100).toFixed(1) : "0";
  const clickRate = campaign.opened > 0 ? ((campaign.clicked / campaign.opened) * 100).toFixed(1) : "0";
  const bounceRate = campaign.recipients > 0 ? ((campaign.bounced / campaign.recipients) * 100).toFixed(1) : "0";

  const pieData = [
    { name: "Entregados", value: campaign.delivered, color: "hsl(142, 71%, 45%)" },
    { name: "Rebotados", value: campaign.bounced, color: "hsl(0, 84%, 60%)" },
    { name: "Pendientes", value: Math.max(0, campaign.recipients - campaign.delivered - campaign.bounced), color: "hsl(214, 32%, 91%)" },
  ].filter(d => d.value > 0);

  const engagementData = [
    { name: "Enviados", value: campaign.recipients },
    { name: "Entregados", value: campaign.delivered },
    { name: "Abiertos", value: campaign.opened },
    { name: "Clicks", value: campaign.clicked },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link to="/campaigns" className="text-sm text-primary flex items-center gap-1 mb-3 hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" /> Volver a campañas
        </Link>
        <div className="flex items-center gap-3">
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
          <div className="flex justify-center gap-4 text-xs">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}: {d.value.toLocaleString()}
              </span>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <h3 className="font-semibold mb-4">Funnel de Engagement</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={engagementData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip formatter={(value: number) => value.toLocaleString()} />
              <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional metrics */}
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
    </div>
  );
};

export default CampaignReport;
